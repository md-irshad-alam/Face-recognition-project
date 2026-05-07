'use client'

import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { RiCloseLine } from 'react-icons/ri'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  width?: string
  padding?: string
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

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .icon-box {
    width: 42px;
    height: 42px;
    background: #EEF2FF;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4F46E5;
  }
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.125rem;
    font-weight: 800;
    color: #1E293B;
    margin: 0;
  }

  span {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }
`;

const CloseBtn = styled.button`
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F1F5F9;
    color: #1E293B;
    transform: rotate(90deg);
  }
`;

const Content = styled.div<{ $padding?: string }>`
  padding: ${p => p.$padding || '32px'};
  overflow-y: auto;
  flex: 1;
`;

export default function Modal({ isOpen, onClose, title, subtitle, icon, children, width, padding }: ModalProps) {
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
          <div className="header-left">
            {icon && <div className="icon-box">{icon}</div>}
            <TitleArea>
              {typeof title === 'string' ? <h3>{title}</h3> : title}
              {subtitle && <span>{subtitle}</span>}
            </TitleArea>
          </div>
          <CloseBtn onClick={onClose}><RiCloseLine size={20} /></CloseBtn>
        </ModalHeader>
        <Content $padding={padding}>
          {children}
        </Content>
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
