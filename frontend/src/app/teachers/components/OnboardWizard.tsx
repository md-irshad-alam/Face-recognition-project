'use client'

import React, { useState, useRef } from 'react'
import {
  RiCheckLine, RiCameraLine, RiArrowRightLine, RiCloseLine
} from 'react-icons/ri'
import {
  StepperRow, StepItem, StepCircle, StepLabel, StepConnector,
  TwoColumnGrid, PhotoPanel, PhotoCircle, PhotoImg, UploadBtn,
  FieldsGrid, FieldRow, FieldGroup, FieldLabel, FieldInput, FieldSelect,
  ClassGrid, ClassChip, ToggleRow, ToggleInfo, ToggleName, ToggleDesc,
  ToggleSwitch, ToggleThumb,
  WizSectionTitle, WizSectionHint,
  PrimaryBtn, GhostBtn, ModalBody, ModalFooter,
} from '../teachers.sc'
import { useAuth } from '@/context/AuthContext'

const DEPARTMENTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Literature', 'Computer Science', 'History',
  'Geography', 'Economics', 'Physical Education', 'Arts', 'Music',
]

const ALL_CLASSES = [
  '6-A', '6-B', '7-A', '7-B', '8-A', '8-B',
  '9-A', '9-B', '10-A', '10-B',
  '11-Sci', '11-Arts', '12-Sci', '12-Arts',
]

const NOTIFICATIONS = [
  { id: 'absent_alerts', label: 'Absence Alerts', desc: 'Notify when a student is absent from a class' },
  { id: 'exam_reminders', label: 'Exam Reminders', desc: 'Get reminders before scheduled examinations' },
  { id: 'leave_requests', label: 'Leave Requests', desc: 'Alert when students submit leave applications' },
  { id: 'grade_prompts', label: 'Grade Update Prompts', desc: 'Remind to enter pending assessment grades' },
  { id: 'announcements', label: 'School Announcements', desc: 'Receive institution-wide broadcast messages' },
]

const STEPS = [
  { label: 'Faculty Profile' },
  { label: 'Class Allocation' },
  { label: 'Notifications' },
]

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Class Teacher' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'lecturer', label: 'Lecturer' },
]

interface FormData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  department: string
  specialization: string
  years_of_experience: string
  role: string
  photo: File | null
  assigned_classes: string[]
  notifications: string[]
}

const EMPTY: FormData = {
  id: '', first_name: '', last_name: '', email: '', phone: '',
  department: '', specialization: '', years_of_experience: '', role: 'teacher',
  photo: null, assigned_classes: [], notifications: ['absent_alerts', 'exam_reminders'],
}

interface Props {
  onSubmit: (fd: FormData) => Promise<void>
  loading: boolean
}

export default function OnboardWizard({ onSubmit, loading }: Props) {
  const { user } = useAuth()
  const schoolCode = user?.school_id || ''
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof FormData, val: any) =>
    setForm(prev => ({ ...prev, [field]: val }))

  const toggleClass = (cls: string) =>
    set('assigned_classes',
      form.assigned_classes.includes(cls)
        ? form.assigned_classes.filter(c => c !== cls)
        : [...form.assigned_classes, cls]
    )

  const toggleNotif = (id: string) =>
    set('notifications',
      form.notifications.includes(id)
        ? form.notifications.filter(n => n !== id)
        : [...form.notifications, id]
    )

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'photo' && v) fd.append('photo', v as File)
        else if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
        else fd.append(k, String(v))
      })
      // Cast to pass form data correctly
      onSubmit(form)
    }
  }

  return (
    <>
      <ModalBody>
        {/* Stepper */}
        <StepperRow>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <StepItem>
                <StepCircle $active={step === i} $done={step > i}>
                  {step > i ? <RiCheckLine /> : i + 1}
                </StepCircle>
                <StepLabel $active={step === i}>{s.label}</StepLabel>
              </StepItem>
              {i < STEPS.length - 1 && <StepConnector $done={step > i} />}
            </React.Fragment>
          ))}
        </StepperRow>

        {/* Step 1: Faculty Profile */}
        {step === 0 && (
          <TwoColumnGrid>
            <PhotoPanel>
              <PhotoCircle onClick={() => fileRef.current?.click()}>
                {form.photo ? (
                  <PhotoImg src={URL.createObjectURL(form.photo)} alt="Preview" />
                ) : (
                  <RiCameraLine />
                )}
              </PhotoCircle>
              <input
                ref={fileRef} type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={e => set('photo', e.target.files?.[0] ?? null)}
              />
              <UploadBtn type="button" onClick={() => fileRef.current?.click()}>
                Upload Photo
              </UploadBtn>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 }}>
                High-resolution portrait recommended. Max 5MB.
              </p>
            </PhotoPanel>

            <FieldsGrid>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Teacher ID *</FieldLabel>
                  <FieldInput
                    placeholder="e.g. EDU-201"
                    value={form.id}
                    onChange={e => set('id', e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Role</FieldLabel>
                  <FieldSelect value={form.role} onChange={e => set('role', e.target.value)}>
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </FieldSelect>
                </FieldGroup>
              </FieldRow>

              <FieldRow>
                <FieldGroup>
                  <FieldLabel>First Name *</FieldLabel>
                  <FieldInput
                    placeholder="e.g. Robert"
                    value={form.first_name}
                    onChange={e => set('first_name', e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Last Name *</FieldLabel>
                  <FieldInput
                    placeholder="e.g. Fox"
                    value={form.last_name}
                    onChange={e => set('last_name', e.target.value)}
                  />
                </FieldGroup>
              </FieldRow>

              <FieldRow>
                <FieldGroup>
                  <FieldLabel>
                    Email Address * 
                    {schoolCode && <span style={{fontSize:'0.7rem', color:'#6366F1', marginLeft:6}}>(Format: name.{schoolCode}@domain.com)</span>}
                  </FieldLabel>
                  <FieldInput
                    type="email"
                    placeholder={schoolCode ? `name.${schoolCode}@gmail.com` : "teacher@school.edu"}
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Phone Number</FieldLabel>
                  <FieldInput
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                  />
                </FieldGroup>
              </FieldRow>

              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Department *</FieldLabel>
                  <FieldSelect value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </FieldSelect>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Specialization *</FieldLabel>
                  <FieldInput
                    placeholder="e.g. Quantum Mechanics"
                    value={form.specialization}
                    onChange={e => set('specialization', e.target.value)}
                  />
                </FieldGroup>
              </FieldRow>

              <FieldRow $cols={1}>
                <FieldGroup>
                  <FieldLabel>Years of Experience</FieldLabel>
                  <FieldInput
                    type="number"
                    placeholder="e.g. 8"
                    value={form.years_of_experience}
                    onChange={e => set('years_of_experience', e.target.value)}
                  />
                </FieldGroup>
              </FieldRow>
            </FieldsGrid>
          </TwoColumnGrid>
        )}

        {/* Step 2: Class Allocation */}
        {step === 1 && (
          <div>
            <WizSectionTitle>Assign Classes</WizSectionTitle>
            <WizSectionHint>Select all the academic sections this faculty member will oversee.</WizSectionHint>
            <ClassGrid>
              {ALL_CLASSES.map(cls => (
                <ClassChip
                  key={cls}
                  type="button"
                  $selected={form.assigned_classes.includes(cls)}
                  onClick={() => toggleClass(cls)}
                >
                  {cls}
                </ClassChip>
              ))}
            </ClassGrid>
            {form.assigned_classes.length > 0 && (
              <p style={{ marginTop: 16, fontSize: '0.8125rem', color: '#4F46E5', fontWeight: 600 }}>
                ✓ {form.assigned_classes.length} class{form.assigned_classes.length !== 1 ? 'es' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Step 3: Notifications */}
        {step === 2 && (
          <div>
            <WizSectionTitle>Notification Preferences</WizSectionTitle>
            <WizSectionHint>Configure what alerts this faculty member should receive via the portal.</WizSectionHint>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NOTIFICATIONS.map(n => (
                <ToggleRow
                  key={n.id}
                  $active={form.notifications.includes(n.id)}
                  onClick={() => toggleNotif(n.id)}
                >
                  <ToggleInfo>
                    <ToggleName>{n.label}</ToggleName>
                    <ToggleDesc>{n.desc}</ToggleDesc>
                  </ToggleInfo>
                  <ToggleSwitch $active={form.notifications.includes(n.id)}>
                    <ToggleThumb $active={form.notifications.includes(n.id)} />
                  </ToggleSwitch>
                </ToggleRow>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <GhostBtn
          type="button"
          onClick={() => step > 0 && setStep(s => s - 1)}
          style={{ visibility: step > 0 ? 'visible' : 'hidden' }}
        >
          ← Back
        </GhostBtn>
        <PrimaryBtn type="button" onClick={handleNext} disabled={loading}>
          {step < STEPS.length - 1 ? (
            <>Continue <RiArrowRightLine /></>
          ) : loading ? 'Submitting…' : (
            <><RiCheckLine /> Register Faculty</>
          )}
        </PrimaryBtn>
      </ModalFooter>
    </>
  )
}
