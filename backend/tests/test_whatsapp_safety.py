"""
tests/test_whatsapp_safety.py

Automated tests for the hardened WhatsApp messaging module.
Run: python -m pytest tests/test_whatsapp_safety.py -v
"""

import pytest
import time
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import whatsapp


# ═══════════════════════════════════════════════════════════════════════════════
#  1. Phone Number Cleaning
# ═══════════════════════════════════════════════════════════════════════════════

class TestPhoneCleaning:
    def test_10_digit_gets_91_prefix(self):
        assert whatsapp._clean_phone("9876543210") == "919876543210"

    def test_already_prefixed(self):
        assert whatsapp._clean_phone("919876543210") == "919876543210"

    def test_with_plus_sign(self):
        assert whatsapp._clean_phone("+919876543210") == "919876543210"

    def test_with_spaces_and_dashes(self):
        assert whatsapp._clean_phone("98-765 432 10") == "919876543210"

    def test_with_country_code_parens(self):
        assert whatsapp._clean_phone("(+91) 98765 43210") == "919876543210"

    def test_empty_string(self):
        assert whatsapp._clean_phone("") == ""

    def test_none_input(self):
        assert whatsapp._clean_phone(None) == ""


# ═══════════════════════════════════════════════════════════════════════════════
#  2. JID Generation
# ═══════════════════════════════════════════════════════════════════════════════

class TestJIDGeneration:
    def test_creates_c_us_jid(self):
        assert whatsapp._make_jid("919876543210") == "919876543210@c.us"

    def test_never_creates_g_us(self):
        jid = whatsapp._make_jid("919876543210")
        assert not jid.endswith("@g.us")


# ═══════════════════════════════════════════════════════════════════════════════
#  3. JID Validation — Correct Targeting
# ═══════════════════════════════════════════════════════════════════════════════

class TestJIDValidation:
    def test_valid_individual_jid(self):
        ok, reason = whatsapp._validate_jid("919876543210@c.us")
        assert ok is True

    def test_blocks_group_jid(self):
        ok, reason = whatsapp._validate_jid("120363044444444444@g.us")
        assert ok is False
        assert "group" in reason.lower()

    def test_blocks_status_broadcast(self):
        ok, reason = whatsapp._validate_jid("status@broadcast")
        assert ok is False
        assert "broadcast" in reason.lower()

    def test_blocks_broadcast_list(self):
        ok, reason = whatsapp._validate_jid("1234567890@broadcast")
        assert ok is False
        assert "broadcast" in reason.lower()

    def test_blocks_empty_jid(self):
        ok, reason = whatsapp._validate_jid("")
        assert ok is False

    def test_blocks_short_number(self):
        ok, reason = whatsapp._validate_jid("12345@c.us")
        assert ok is False
        assert "short" in reason.lower()

    def test_blocks_too_long_number(self):
        ok, reason = whatsapp._validate_jid("1234567890123456@c.us")
        assert ok is False
        assert "long" in reason.lower()

    def test_blocks_non_digit_phone(self):
        ok, reason = whatsapp._validate_jid("abc123@c.us")
        assert ok is False
        assert "non-digit" in reason.lower()


# ═══════════════════════════════════════════════════════════════════════════════
#  4. Recipient Matching — Wrong-Recipient Prevention
# ═══════════════════════════════════════════════════════════════════════════════

class TestRecipientMatching:
    def test_correct_match(self):
        ok, reason = whatsapp._validate_recipient_match("9876543210", "919876543210@c.us")
        assert ok is True

    def test_correct_match_with_prefix(self):
        ok, reason = whatsapp._validate_recipient_match("919876543210", "919876543210@c.us")
        assert ok is True

    def test_mismatch_detected(self):
        ok, reason = whatsapp._validate_recipient_match("9876543210", "911111111111@c.us")
        assert ok is False
        assert "MISMATCH" in reason

    def test_mismatch_completely_different(self):
        ok, reason = whatsapp._validate_recipient_match("5551234567", "919876543210@c.us")
        assert ok is False


# ═══════════════════════════════════════════════════════════════════════════════
#  5. Deduplication — Duplicate Prevention
# ═══════════════════════════════════════════════════════════════════════════════

class TestDeduplication:
    def setup_method(self):
        """Clear dedup state before each test."""
        whatsapp._recent_sends.clear()

    def test_first_send_allowed(self):
        ok, reason = whatsapp._check_dedup("919876543210", "school1")
        assert ok is True

    def test_duplicate_blocked(self):
        whatsapp._record_send("919876543210", "school1")
        ok, reason = whatsapp._check_dedup("919876543210", "school1")
        assert ok is False
        assert "Duplicate" in reason

    def test_different_phone_allowed(self):
        whatsapp._record_send("919876543210", "school1")
        ok, reason = whatsapp._check_dedup("911111111111", "school1")
        assert ok is True

    def test_different_school_allowed(self):
        whatsapp._record_send("919876543210", "school1")
        ok, reason = whatsapp._check_dedup("919876543210", "school2")
        assert ok is True

    def test_dedup_expires(self):
        """Manually set a timestamp in the past to simulate expiry."""
        whatsapp._recent_sends["school1:919876543210"] = time.time() - 60  # 60s ago
        ok, reason = whatsapp._check_dedup("919876543210", "school1")
        assert ok is True  # Should be allowed since window expired


# ═══════════════════════════════════════════════════════════════════════════════
#  6. End-to-End Safety Chain
# ═══════════════════════════════════════════════════════════════════════════════

class TestEndToEndSafety:
    """These tests verify the full safety chain without hitting a real WPP server."""

    def setup_method(self):
        whatsapp._recent_sends.clear()

    def test_group_jid_never_reaches_send(self):
        """Even if someone passes a group ID, the JID validator blocks it."""
        # Simulate what happens if _clean_phone somehow produced a group-like number
        jid = "120363044444444444@g.us"
        ok, reason = whatsapp._validate_jid(jid)
        assert ok is False, "Group JID must be blocked"

    def test_status_broadcast_never_reaches_send(self):
        jid = "status@broadcast"
        ok, reason = whatsapp._validate_jid(jid)
        assert ok is False, "Status broadcast must be blocked"

    def test_full_pipeline_valid_number(self):
        """Trace through the full validation pipeline for a valid number."""
        raw_phone = "9876543210"

        # Step 1: Clean
        clean = whatsapp._clean_phone(raw_phone)
        assert clean == "919876543210"

        # Step 2: Make JID
        jid = whatsapp._make_jid(clean)
        assert jid == "919876543210@c.us"

        # Step 3: Validate JID
        ok, reason = whatsapp._validate_jid(jid)
        assert ok is True

        # Step 4: Recipient match
        ok, reason = whatsapp._validate_recipient_match(raw_phone, jid)
        assert ok is True

        # Step 5: Dedup check (first send)
        ok, reason = whatsapp._check_dedup(clean, "test_school")
        assert ok is True

    def test_full_pipeline_rejects_empty_phone(self):
        """Empty phone should fail at JID validation."""
        clean = whatsapp._clean_phone("")
        jid = whatsapp._make_jid(clean)
        ok, reason = whatsapp._validate_jid(jid)
        assert ok is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
