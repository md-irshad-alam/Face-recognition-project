import React from 'react';
import styled from 'styled-components';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
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
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th<{ $align?: string; $width?: string }>`
  padding: 16px 24px;
  background: #F8FAFC;
  color: #64748B;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #E2E8F0;
  text-align: ${props => props.$align || 'left'};
  width: ${props => props.$width || 'auto'};
  white-space: nowrap;

  @media (max-width: 640px) {
    padding: 12px 16px;
    font-size: 0.6875rem;
  }
`;

const Td = styled.td<{ $align?: string }>`
  padding: 16px 24px;
  font-size: 0.875rem;
  color: #1E293B;
  border-bottom: 1px solid #F1F5F9;
  text-align: ${props => props.$align || 'left'};
  vertical-align: middle;
  white-space: nowrap;

  @media (max-width: 640px) {
    padding: 12px 16px;
    font-size: 0.8125rem;
  }
`;

const Tr = styled.tr`
  transition: all 0.2s;
  &:hover {
    background: #F8FAFC;
  }
`;

const Pagination = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1.5px solid #E2E8F0;
  background: white;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  border: 1px solid ${props => props.$active ? '#4F46E5' : '#E2E8F0'};
  background: ${props => props.$active ? '#4F46E5' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748B'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#4F46E5' : '#F8FAFC'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
                {columns.map((col, j) => (
                  <Td key={j} $align={col.align}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : (row[col.accessor] as React.ReactNode)}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </tbody>
      </StyledTable>

      <Pagination>
        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
          Showing {Math.min(startIndex + 1, data.length)} to {Math.min(startIndex + pageSize, data.length)} of {data.length} entries
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <PageBtn 
            onClick={() => onPageChange?.(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </PageBtn>
          {[...Array(totalPages)].map((_, i) => (
            <PageBtn 
              key={i} 
              $active={currentPage === i + 1}
              onClick={() => onPageChange?.(i + 1)}
            >
              {i + 1}
            </PageBtn>
          ))}
          <PageBtn 
            onClick={() => onPageChange?.(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </PageBtn>
        </div>
      </Pagination>
    </TableWrapper>
  );
}
