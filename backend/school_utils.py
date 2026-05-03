"""
School Utilities — Multi-Tenancy Helpers
=========================================
School code is the segment between the LAST dot and the @ in the local part.

  admin.dis@gmail.com   →  school_id = "dis"
  teacher.dis@school.in →  school_id = "dis"
  john.doe.sps@edu.org  →  school_id = "sps"

Rules enforced:
  - school_id must be 2-20 alphanumeric/hyphen characters.
  - A school can only have ONE admin account.
  - Teachers must share the same school_id as their admin.
"""

import re

# Minimum/maximum length of a school code
_MIN = 2
_MAX = 20
_PATTERN = re.compile(r'^[a-z0-9][a-z0-9\-]{0,' + str(_MAX - 1) + r'}$')


def extract_school_id(email: str) -> str | None:
    """
    Extract the school_id from an email address.

    Returns the lowercase school code, or None if the email format is invalid
    or the segment doesn't meet the length / character requirements.
    """
    email = email.strip().lower()
    try:
        local, _ = email.rsplit('@', 1)          # split off domain
        parts = local.split('.')
        if len(parts) < 2:
            # No dot in local part — can't have a school code suffix
            return None
        code = parts[-1]                          # last segment is the school code
        if _MIN <= len(code) <= _MAX and _PATTERN.match(code):
            return code
        return None
    except Exception:
        return None


def validate_school_email(email: str) -> str:
    """
    Like extract_school_id but raises ValueError if the email is invalid.
    Used during registration to give clear error messages.
    """
    code = extract_school_id(email)
    if code is None:
        raise ValueError(
            "Invalid email format. "
            "Please use the format: role.SCHOOLCODE@domain.com  "
            "(e.g. admin.dis@gmail.com or teacher.dis@school.org)"
        )
    return code
