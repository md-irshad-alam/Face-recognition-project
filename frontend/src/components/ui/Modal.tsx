'use client'

import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { RiCloseLine } from 'react-icons/ri'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  transition: opacity 0.2s ease;
  opacity: ${p => p.$isOpen ? 1 : 0};
  pointer-events: ${p => p.$isOpen ? 'all' : 'none'};
`;

const ModalContainer = styled.div<{ $width?: string }>`
  background: white;
  border-radius: 24px;
  width: ${p => p.$width || '450px'};
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #F1F5F9;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: #F1F5F9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #E2E8F0;
    color: #1E293B;
  }
`;

const Content = styled.div`
  padding: 32px;
  overflow-y: auto;
  flex: 1;
`;

export default function Modal({ isOpen, onClose, title, children, width }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer ref={modalRef} $width={width}>
        <ModalHeader>
          <Title>{title}</Title>
          <CloseBtn onClick={onClose}><RiCloseLine size={24} /></CloseBtn>
        </ModalHeader>
        <Content>
          {children}
        </Content>
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
