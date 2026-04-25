import styled from 'styled-components'
export * from './BackButton'

/* — Button ———————————————————————————————— */
export const Button = styled.button<{ $variant?: 'primary' | 'outline' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s;
  cursor: pointer;

  background-color: ${p =>
    p.$variant === 'primary' ? '#4F46E5'
    : p.$variant === 'outline' ? 'transparent'
    : 'transparent'};

  color: ${p =>
    p.$variant === 'primary' ? '#FFFFFF'
    : '#1E293B'};

  border: ${p =>
    p.$variant === 'outline' ? '1px solid #E2E8F0'
    : 'none'};

  box-shadow: ${p =>
    p.$variant === 'primary' ? '0 4px 12px rgba(79,70,229,0.25)' : 'none'};

  &:hover {
    background-color: ${p =>
      p.$variant === 'primary' ? '#4338CA'
      : '#F1F5F9'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

/* — Badge ————————————————————————————————— */
export const Badge = styled.span<{ $type?: 'success' | 'danger' | 'warning' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  background-color: ${p =>
    p.$type === 'success' ? '#D1FAE5'
    : p.$type === 'danger'  ? '#FEE2E2'
    : p.$type === 'warning' ? '#FEF3C7'
    : '#EEF2FF'};

  color: ${p =>
    p.$type === 'success' ? '#065F46'
    : p.$type === 'danger'  ? '#991B1B'
    : p.$type === 'warning' ? '#92400E'
    : '#4338CA'};

  &::before {
    content: '';
    display: block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: currentColor;
    flex-shrink: 0;
  }
`

/* — Card ————————————————————————————————— */
export const Card = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  overflow: hidden;
`

/* — ProgressBar ——————————————————————————— */
export const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background-color: #E2E8F0;
  border-radius: 999px;
  overflow: hidden;
  min-width: 80px;
`

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${p => p.$percent}%;
  background: linear-gradient(90deg, #6366F1, #4F46E5);
  border-radius: 999px;
  transition: width 0.4s ease;
`
