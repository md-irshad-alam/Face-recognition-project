import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { RiArrowDropDownLine } from 'react-icons/ri';

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div<{ $isOpen: boolean }>`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid ${props => props.theme?.colors?.border || '#E2E8F0'};
  background: #F8FAFC;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  color: ${props => props.theme?.colors?.textPrimary || '#1E293B'};

  &:hover {
    background: white;
  }

  ${props => props.$isOpen && `
    border-color: ${props.theme?.colors?.primary || '#4F46E5'};
    background: white;
    box-shadow: 0 0 0 4px ${props.theme?.colors?.primary || '#4F46E5'}15;
  `}
`;

const DropdownListContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  z-index: 100;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid ${props => props.theme?.colors?.border || '#E2E8F0'};
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-height: 250px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
  }
`;

const DropdownListItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${props => props.theme?.colors?.textPrimary || '#1E293B'};
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  background: ${props => props.$isSelected ? '#F1F5F9' : 'transparent'};

  &:hover {
    background: #F1F5F9;
    border-bottom: 2px solid ${props => props.theme?.colors?.border};
  }
`;

export interface Option {
  value: string | number;
  label: string;
}

export interface DropdownProps {
  options: Option[] | string[] | number[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder = "Select...", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: Option[] = options.map(opt => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt as Option;
    }
    return { value: opt as string | number, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={containerRef} className={className}>
      <DropdownHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <RiArrowDropDownLine size={24} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </DropdownHeader>
      {isOpen && (
        <DropdownListContainer>
          {normalizedOptions.map((option) => (
            <DropdownListItem
              key={option.value}
              $isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </DropdownListItem>
          ))}
        </DropdownListContainer>
      )}
    </DropdownContainer>
  );
};
