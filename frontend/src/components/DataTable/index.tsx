'use client'
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
  isAction?: boolean; // mark the action column
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalEntries?: number;
}

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  font-family: 'Poppins', 'Inter', sans-serif;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-family: 'Poppins', 'Inter', sans-serif;
`;

const Th = styled.th<{ $align?: string; $width?: string }>`
  padding: 14px 20px;
  background: #F8FAFC;
  color: #94A3B8;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1.5px solid #E2E8F0;
  text-align: ${props => props.$align || 'left'};
  width: ${props => props.$width || 'auto'};
  white-space: nowrap;
  font-family: 'Poppins', 'Inter', sans-serif;
`;

const Td = styled.td<{ $align?: string }>`
  padding: 14px 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
  border-bottom: 1px solid #F1F5F9;
  text-align: ${props => props.$align || 'left'};
  vertical-align: middle;
  white-space: nowrap;
  font-family: 'Poppins', 'Inter', sans-serif;
`;

const Tr = styled.tr`
  transition: background 0.15s;
  &:last-child td { border-bottom: none; }
  &:hover { background: #F8FAFC; }
`;

const DotsBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background: white;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-direction: column;
  transition: all 0.15s;
  margin-left: auto;

  &:hover { background: #F1F5F9; border-color: #CBD5E1; }

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #64748B;
    display: block;
  }
`;

const PopupWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

const Popup = styled.div<{ $open: boolean }>`
  display: ${p => p.$open ? 'block' : 'none'};
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 200;
  min-width: 180px;
  overflow: hidden;
  animation: popIn 0.12s ease-out;

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const PopupItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: 'Poppins', 'Inter', sans-serif;
  color: ${p => p.$danger ? '#EF4444' : '#334155'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.12s;

  &:hover { background: #F8FAFC; }
  &:active { background: #F1F5F9; }
`;

const Pagination = styled.div`
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1.5px solid #E2E8F0;
  background: white;
  font-family: 'Poppins', 'Inter', sans-serif;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: 'Poppins', 'Inter', sans-serif;
  border: 1px solid ${props => props.$active ? '#4F46E5' : '#E2E8F0'};
  background: ${props => props.$active ? '#4F46E5' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748B'};
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: ${props => props.$active ? '#4338CA' : '#F8FAFC'}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Action cell popup ──────────────────────────────────────────────────────────

function ActionCell({ content }: { content: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <PopupWrapper ref={ref}>
      <DotsBtn onClick={() => setOpen(v => !v)} title="Actions">
        <span /><span /><span />
      </DotsBtn>
      <Popup $open={open} onClick={() => setOpen(false)}>
        {content}
      </Popup>
    </PopupWrapper>
  );
}

// Export helper for popup items so callers can use them
export { PopupItem };

export default function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "No records found.",
  pageSize = 7,
  currentPage = 1,
  onPageChange,
  totalEntries
}: DataTableProps<T>) {
  
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil((totalEntries || data.length) / pageSize);

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <Th key={i} $align={col.align} $width={col.width}>{col.header}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <Td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                Fetching data...
              </Td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <Td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                {emptyMessage}
              </Td>
            </tr>
          ) : (
            paginatedData.map((row) => (
              <Tr key={row.id}>
                {columns.map((col, j) => {
                  const cellContent = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode);

                  // Wrap action columns in the popup
                  if (col.isAction) {
                    return (
                      <Td key={j} $align="right">
                        <ActionCell content={cellContent} />
                      </Td>
                    );
                  }

                  return (
                    <Td key={j} $align={col.align}>
                      {cellContent}
                    </Td>
                  );
                })}
              </Tr>
            ))
          )}
        </tbody>
      </StyledTable>

      <Pagination>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
          Showing {Math.min(startIndex + 1, data.length)}–{Math.min(startIndex + pageSize, data.length)} of {data.length}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <PageBtn onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage === 1}>
            ← Prev
          </PageBtn>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            const page = i + 1;
            return (
              <PageBtn key={i} $active={currentPage === page} onClick={() => onPageChange?.(page)}>
                {page}
              </PageBtn>
            );
          })}
          <PageBtn onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}>
            Next →
          </PageBtn>
        </div>
      </Pagination>
    </TableWrapper>
  );
}
