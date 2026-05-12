'use client'

import React, { useState } from 'react'
import { RiUploadCloud2Line, RiFileExcel2Line, RiCloseLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri'
import styled from 'styled-components'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

interface BulkOnboardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkOnboard({ onClose, onSuccess }: BulkOnboardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
        setFile(selected)
      } else {
        toast.error('Only Excel files (.xlsx, .xls) are allowed.')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const data = await api.postForm<any>('/students/bulk-upload', formData)
      setResults(data)
      toast.success('Bulk onboarding process completed.')
      if (data.success_count > 0) onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Bulk upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Bulk Student Onboarding</h3>
          <CloseButton onClick={onClose}><RiCloseLine size={24} /></CloseButton>
        </ModalHeader>

        <ModalBody>
          {!results ? (
            <>
              <InstructionBox>
                <p>Upload an Excel file with the following columns:</p>
                <code>name, class_name, section, email, phone, parent_phone</code>
                <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748B' }}>
                  * Student IDs will be <strong>automatically generated</strong> by the system.
                  <br />* Profile images can be added manually later.
                </p>
              </InstructionBox>

              <UploadZone>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} id="bulk-file" hidden />
                <label htmlFor="bulk-file">
                  <RiUploadCloud2Line size={48} color="#4F46E5" />
                  {file ? (
                    <FileName><RiFileExcel2Line /> {file.name}</FileName>
                  ) : (
                    <p>Click to browse or drag and drop your Excel file here</p>
                  )}
                </label>
              </UploadZone>

              <ActionButtons>
                <CancelBtn onClick={onClose}>Cancel</CancelBtn>
                <UploadBtn disabled={!file || uploading} onClick={handleUpload}>
                  {uploading ? 'Processing...' : 'Start Onboarding'}
                </UploadBtn>
              </ActionButtons>
            </>
          ) : (
            <ResultBox>
              <ResultHeader>
                <RiCheckLine size={32} color="#059669" />
                <h4>Onboarding Complete</h4>
              </ResultHeader>
              <p>Successfully processed <strong>{results.success_count}</strong> student records.</p>
              
              {results.errors?.length > 0 && (
                <ErrorList>
                  <h5><RiErrorWarningLine /> Issues found ({results.errors.length}):</h5>
                  <ul>
                    {results.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </ErrorList>
              )}

              <DoneBtn onClick={onClose}>Finish</DoneBtn>
            </ResultBox>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  )
}

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white; border-radius: 16px; width: 100%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
`

const ModalHeader = styled.div`
  padding: 20px 24px; border-bottom: 1px solid #F1F5F9;
  display: flex; justify-content: space-between; align-items: center;
  h3 { margin: 0; font-size: 1.25rem; color: #1E293B; }
`

const CloseButton = styled.button`
  background: none; border: none; color: #64748B; cursor: pointer;
  padding: 4px; border-radius: 8px; &:hover { background: #F1F5F9; }
`

const ModalBody = styled.div` padding: 24px; `

const InstructionBox = styled.div`
  background: #F8FAFC; padding: 16px; border-radius: 12px; margin-bottom: 24px;
  p { margin: 0 0 8px 0; font-size: 0.875rem; color: #475569; }
  code { display: block; background: #E2E8F0; padding: 8px; border-radius: 6px; font-size: 0.8125rem; }
`

const UploadZone = styled.div`
  border: 2px dashed #E2E8F0; border-radius: 12px; padding: 40px 24px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  &:hover { border-color: #4F46E5; background: #F5F3FF; }
  label { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  p { margin: 0; font-size: 0.875rem; color: #64748B; }
`

const FileName = styled.span`
  display: flex; align-items: center; gap: 8px;
  color: #4F46E5; font-weight: 600; font-size: 1rem;
`

const ActionButtons = styled.div`
  display: flex; gap: 12px; margin-top: 32px;
`

const UploadBtn = styled.button`
  flex: 1; background: #4F46E5; color: white; border: none; padding: 12px;
  border-radius: 10px; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const CancelBtn = styled.button`
  flex: 1; background: white; color: #64748B; border: 1px solid #E2E8F0;
  padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer;
`

const ResultBox = styled.div` text-align: center; `
const ResultHeader = styled.div` display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 20px; h4 { margin: 0; font-size: 1.25rem; } `
const ErrorList = styled.div`
  text-align: left; background: #FFF1F2; padding: 16px; border-radius: 12px;
  margin: 20px 0; max-height: 200px; overflow-y: auto;
  h5 { margin: 0 0 8px 0; color: #BE123C; display: flex; align-items: center; gap: 8px; }
  ul { margin: 0; padding-left: 20px; font-size: 0.8125rem; color: #9F1239; }
  li { margin-bottom: 4px; }
`
const DoneBtn = styled(UploadBtn)` width: 100%; margin-top: 20px; `
