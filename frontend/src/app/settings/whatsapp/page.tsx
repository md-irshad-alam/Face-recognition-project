'use client'

import React, { useState, useEffect } from 'react';
import { RiWhatsappLine, RiRefreshLine, RiCheckLine, RiErrorWarningLine, RiLogoutBoxRLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const PageWrapper = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  svg {
    color: #25D366;
  }
`;

const Subtitle = styled.p`
  color: #64748B;
  margin-bottom: 32px;
`;

const StatusBadge = styled.div<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 32px;
  background: ${props => props.$connected ? '#DCFCE7' : '#FEE2E2'};
  color: ${props => props.$connected ? '#166534' : '#991B1B'};
`;

const QRContainer = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 auto 32px;
  background: #F8FAFC;
  border: 2px dashed #E2E8F0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  background: ${props => {
    if (props.$variant === 'danger') return '#FEE2E2';
    if (props.$variant === 'secondary') return '#F1F5F9';
    return '#4F46E5';
  }};

  color: ${props => {
    if (props.$variant === 'danger') return '#991B1B';
    if (props.$variant === 'secondary') return '#475569';
    return 'white';
  }};

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

export default function WhatsAppSettings() {
  const [status, setStatus] = useState<{ connected: boolean; state: string; message?: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/whatsapp/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStatus(data);
      if (data.connected) {
        setQrCode(null);
      }
    } catch (err) {
      console.error("Failed to fetch status", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQR = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/whatsapp/qr`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.base64) {
        setQrCode(data.base64);
      } else {
        toast.error("QR code not ready yet. Please wait...");
      }
    } catch (err) {
      toast.error("Failed to fetch QR code. Is Docker running?");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/whatsapp/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success("Disconnected successfully");
      fetchStatus();
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <PageWrapper><Card>Loading settings...</Card></PageWrapper>;

  return (
    <PageWrapper>
      <Card>
        <Title><RiWhatsappLine /> WhatsApp Integration</Title>
        <Subtitle>Connect your school's WhatsApp account to send automated fee reminders and attendance alerts.</Subtitle>

        <StatusBadge $connected={status?.connected || false}>
          {status?.connected ? <><RiCheckLine /> Connected</> : <><RiErrorWarningLine /> Disconnected</>}
        </StatusBadge>

        {!status?.connected && (
          <>
            <QRContainer>
              {qrCode ? (
                <img src={qrCode} alt="WhatsApp QR Code" />
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '0.875rem', padding: '20px' }}>
                  {status?.state === 'offline' ? 'API is Offline. Please ensure Docker is running.' : 'Click "Generate QR" to start setup.'}
                </div>
              )}
            </QRContainer>
            <ActionGroup>
              <Button onClick={fetchQR} disabled={refreshing || status?.state === 'offline'}>
                <RiRefreshLine className={refreshing ? 'spin' : ''} />
                {qrCode ? 'Refresh QR' : 'Generate QR Code'}
              </Button>
            </ActionGroup>
          </>
        )}

        {status?.connected && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#059669', fontWeight: 600, marginBottom: '24px' }}>
              Your system is successfully linked to WhatsApp.
            </p>
            <Button $variant="danger" onClick={handleLogout}>
              <RiLogoutBoxRLine /> Disconnect WhatsApp
            </Button>
          </div>
        )}
      </Card>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </PageWrapper>
  );
}
