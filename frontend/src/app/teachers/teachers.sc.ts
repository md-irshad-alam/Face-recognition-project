import styled from 'styled-components'

/* ─── Stats Grid ────────────────────────────────────────── */
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: ${p => p.theme.breakpoints.xl}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${p => p.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export const StatCard = styled.div`
  background-color: ${p => p.theme.colors.white};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.xl};
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${p => p.theme.shadows.sm};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: ${p => p.theme.shadows.md};
  }
`

export const StatIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background-color: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  flex-shrink: 0;
`

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`

export const StatLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`

export const StatValue = styled.span`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textPrimary};
  line-height: 1;
`

/* ─── Page Header ───────────────────────────────────────── */
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
`

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textPrimary};
  margin: 0;
  letter-spacing: -0.03em;
  @media (max-width: ${p => p.theme.breakpoints.xl}) {
    font-size: 1.75rem;
  }
`

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
  @media (max-width: ${p => p.theme.breakpoints.xl}) {
    display: none;
  }
`

export const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`

/* ─── Table Card ────────────────────────────────────────── */
export const TableCard = styled.div`
  background-color: ${p => p.theme.colors.white};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.xl};
  box-shadow: ${p => p.theme.shadows.card};
  overflow: hidden;
`

export const TableToolbar = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`

export const SearchWrapper = styled.div`
  position: relative;
  width: 320px;
`

export const SearchIconWrap = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${p => p.theme.colors.textSecondary};
  display: flex;
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 44px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${p => p.theme.colors.textPrimary};
  background-color: #F8FAFC;
  transition: all 0.2s;

  &::placeholder {
    color: ${p => p.theme.colors.textSecondary};
  }

  &:focus {
    background-color: ${p => p.theme.colors.white};
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.colors.primaryLight};
  }
`

export const TabRow = styled.div`
  display: flex;
  gap: 4px;
  background-color: #F1F5F9;
  padding: 4px;
  border-radius: ${p => p.theme.radius.lg};
`

export const TabButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: ${p => p.theme.radius.md};
  font-size: 0.875rem;
  font-weight: 700;
  color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
  background-color: ${p => p.$active ? p.theme.colors.white : 'transparent'};
  box-shadow: ${p => p.$active ? p.theme.shadows.sm : 'none'};
  transition: all 0.2s;

  &:hover {
    color: ${p => p.theme.colors.primary};
  }
`

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

export const Thead = styled.thead`
  background-color: #F8FAFC;
`

export const Th = styled.th`
  text-align: left;
  padding: 14px 24px;
  font-size: 0.6875rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  white-space: nowrap;
`

export const Td = styled.td`
  padding: 18px 24px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  font-size: 0.9375rem;
  color: ${p => p.theme.colors.textPrimary};
  vertical-align: middle;
`

export const Tr = styled.tr`
  transition: background-color 0.15s;

  &:last-child ${Td} {
    border-bottom: none;
  }

  &:hover {
    background-color: #F8FAFC;
  }
`

export const ProfileCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

export const AvatarCircle = styled.div<{ $gradient: string }>`
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: ${p => p.$gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 0.875rem;
  flex-shrink: 0;
`

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const TeacherName = styled.span`
  font-weight: 800;
  color: ${p => p.theme.colors.textPrimary};
  font-size: 0.9375rem;
`

export const TeacherEmail = styled.span`
  font-size: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
  font-weight: 500;
`

export const DeptText = styled.span`
  font-weight: 700;
  font-size: 0.875rem;
`

export const RolePill = styled.span<{ $color: string; $bg: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: ${p => p.theme.radius.full};
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.$color};
  background-color: ${p => p.$bg};
`

export const StatusPill = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: ${p => p.theme.radius.full};
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.$active ? p.theme.colors.successText : p.theme.colors.dangerText};
  background-color: ${p => p.$active ? p.theme.colors.successBg : p.theme.colors.dangerBg};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
`

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

export const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.colors.border};
  background-color: ${p => p.theme.colors.white};
  color: ${p => p.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
    background-color: ${p => p.theme.colors.activeTabBg};
  }
`

export const TableFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${p => p.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const FooterText = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
`

export const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const PageBtn = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 800;
  color: ${p => p.$active ? p.theme.colors.white : p.theme.colors.textSecondary};
  background-color: ${p => p.$active ? p.theme.colors.primary : 'transparent'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.activeTabBg};
    color: ${p => p.$active ? p.theme.colors.white : p.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

/* ─── Empty / Loading states ─────────────────────────────── */
export const EmptyCell = styled.td`
  padding: 80px 24px;
  text-align: center;
  color: ${p => p.theme.colors.textSecondary};
  font-weight: 600;
`

export const SkeletonRow = styled.div`
  height: 20px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e8ecf0 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`

/* ─── Modal ─────────────────────────────────────────────── */
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

export const ModalBox = styled.div`
  background-color: ${p => p.theme.colors.white};
  width: 100%;
  max-width: 960px;
  height: 88vh;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const ModalHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ModalTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textPrimary};
  margin: 0;
`

export const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 4px 0 0;
`

export const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.border};
  background-color: ${p => p.theme.colors.white};
  color: ${p => p.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s;

  &:hover {
    background-color: #FEE2E2;
    border-color: ${p => p.theme.colors.danger};
    color: ${p => p.theme.colors.danger};
  }
`

export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`

export const ModalFooter = styled.div`
  padding: 20px 32px;
  border-top: 1px solid ${p => p.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

/* ─── Wizard Steps ───────────────────────────────────────── */
export const StepperRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`

export const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

export const StepCircle = styled.div<{ $active: boolean; $done: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${p => (p.$active || p.$done) ? p.theme.colors.primary : '#F1F5F9'};
  color: ${p => (p.$active || p.$done) ? p.theme.colors.white : p.theme.colors.textSecondary};
  border: 2px solid ${p => (p.$active || p.$done) ? p.theme.colors.primary : p.theme.colors.border};
  transition: all 0.3s;
`

export const StepLabel = styled.span<{ $active: boolean }>`
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
`

export const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  background-color: ${p => p.$done ? p.theme.colors.primary : p.theme.colors.border};
  margin: 0 -8px 20px;
  transition: background-color 0.3s;
`

/* ─── Wizard Form ────────────────────────────────────────── */
export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 40px;
`

export const PhotoPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: #F8FAFC;
  border: 1px dashed ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.xl};
  padding: 32px 24px;
  height: fit-content;
`

export const PhotoCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${p => p.theme.colors.activeTabBg};
  border: 3px solid ${p => p.theme.colors.white};
  box-shadow: ${p => p.theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.theme.colors.primary};
  font-size: 2.5rem;
  position: relative;
`

export const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const UploadBtn = styled.button`
  padding: 8px 20px;
  border-radius: ${p => p.theme.radius.md};
  border: 1px solid ${p => p.theme.colors.border};
  background-color: ${p => p.theme.colors.white};
  color: ${p => p.theme.colors.textPrimary};
  font-size: 0.8125rem;
  font-weight: 700;
  transition: all 0.2s;

  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`

export const FieldsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const FieldRow = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$cols || 2}, 1fr);
  gap: 20px;
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const FieldLabel = styled.label`
  font-size: 0.6875rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.07em;
`

export const FieldInput = styled.input`
  padding: 11px 16px;
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textPrimary};
  background-color: ${p => p.theme.colors.white};
  transition: all 0.2s;

  &::placeholder {
    color: ${p => p.theme.colors.border};
    font-weight: 400;
  }

  &:focus {
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.colors.primaryLight};
    outline: none;
  }
`

export const FieldSelect = styled.select`
  padding: 11px 16px;
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textPrimary};
  background-color: ${p => p.theme.colors.white};
  transition: all 0.2s;
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.colors.primaryLight};
    outline: none;
  }
`

export const ClassGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
`

export const ClassChip = styled.button<{ $selected: boolean }>`
  padding: 10px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  border: 1.5px solid ${p => p.$selected ? p.theme.colors.primary : p.theme.colors.border};
  background-color: ${p => p.$selected ? p.theme.colors.activeTabBg : p.theme.colors.white};
  color: ${p => p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary};
  transition: all 0.15s;

  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`

export const ToggleRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: ${p => p.theme.radius.lg};
  border: 1.5px solid ${p => p.$active ? p.theme.colors.primary : p.theme.colors.border};
  background-color: ${p => p.$active ? p.theme.colors.activeTabBg : p.theme.colors.white};
  cursor: pointer;
  transition: all 0.2s;
`

export const ToggleInfo = styled.div``

export const ToggleName = styled.p`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textPrimary};
  margin: 0 0 2px;
`

export const ToggleDesc = styled.p`
  font-size: 0.8125rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
`

export const ToggleSwitch = styled.div<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.border};
  position: relative;
  transition: background-color 0.2s;
  flex-shrink: 0;
`

export const ToggleThumb = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 3px;
  left: ${p => p.$active ? '23px' : '3px'};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.2s;
`

export const WizSectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${p => p.theme.colors.textPrimary};
  margin: 0 0 6px;
`

export const WizSectionHint = styled.p`
  font-size: 0.9375rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0 0 28px;
`

/* ─── Buttons ────────────────────────────────────────────── */
export const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.9375rem;
  font-weight: 700;
  background-color: ${p => p.theme.colors.primary};
  color: ${p => p.theme.colors.white};
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${p => p.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const GhostBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    background-color: #F1F5F9;
    color: ${p => p.theme.colors.textPrimary};
  }
`

export const OutlineBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: ${p => p.theme.radius.lg};
  font-size: 0.9375rem;
  font-weight: 700;
  border: 1px solid ${p => p.theme.colors.border};
  background-color: ${p => p.theme.colors.white};
  color: ${p => p.theme.colors.textPrimary};
  transition: all 0.2s;

  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`
