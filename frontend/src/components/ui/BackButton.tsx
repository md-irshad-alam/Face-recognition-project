import React from 'react';
import styled from 'styled-components';
import { RiArrowLeftLine } from 'react-icons/ri';

const StyledBackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  background: white;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #F1F5F9;
    color: ${props => props.theme.colors.textPrimary};
    border-color: ${props => props.theme.colors.textSecondary};
  }

  svg {
    font-size: 1.125rem;
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

export const BackButton = ({ onClick, children = 'Go Back' }: { onClick?: () => void, children?: React.ReactNode }) => {
  return (
    <StyledBackButton onClick={onClick}>
      <RiArrowLeftLine />
      {children}
    </StyledBackButton>
  );
};
