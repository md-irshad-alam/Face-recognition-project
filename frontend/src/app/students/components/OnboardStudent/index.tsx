'use client'

import React, { useState, useRef, useEffect } from 'react';
import { 
  RiCameraLine, 
  RiArrowRightLine, 
  RiCloseLine,
  RiCheckLine,
  RiIdCardLine,
  RiArrowLeftLine,
  RiParentLine,
  RiFileList3Line,
  RiShieldCheckLine
} from 'react-icons/ri';
import { BackButton as UIBackButton } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { useStudents, Student } from '@/hooks/useStudents';
import { generateInstitutionalID } from '@/utils/institutional';
import * as SC from './OnboardStudent.sc';

interface OnboardStudentProps {
  onClear: () => void;
  initialData?: Student | null;
}

const GRADES = ['Play', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export default function OnboardStudent({ onClear, initialData }: OnboardStudentProps) {
  const { createStudent, updateStudent } = useStudents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(initialData?.class_name || '1st');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);

  const [formData, setFormData] = useState({
    id: initialData?.id || generateInstitutionalID('STUD'),
    firstName: initialData?.name?.split(' ')[0] || '',
    lastName: initialData?.name?.split(' ').slice(1).join(' ') || '',
    dob: initialData?.dob || '',
    gender: 'male',
    guardianName: (initialData as any)?.guardianName || '', 
    guardianPhone: initialData?.phone || '',
    parent_phone: initialData?.parent_phone || '',
    guardianAddress: (initialData as any)?.address || '',
    relation: (initialData as any)?.relation || 'Father',
    section: initialData?.section || 'A',
    admissionDate: initialData?.admission_date || new Date().toISOString().split('T')[0],
    studentType: (initialData as any)?.student_type || 'Regular',
    transportType: (initialData as any)?.transport_type || 'Self',
    tuitionFee: (initialData as any)?.tuition_fee || 1500,
    transportFee: (initialData as any)?.transport_fee || 0,
    hostelFee: (initialData as any)?.hostel_fee || 0,
    lastPaymentDate: (initialData as any)?.last_payment_date || new Date().toISOString().split('T')[0],
    openingBalance: (initialData as any)?.opening_balance || 0
  });

  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    let total = Number(formData.tuitionFee);
    if (formData.studentType === 'Regular' && formData.transportType === 'Van') {
      total += Number(formData.transportFee);
    } else if (formData.studentType === 'Hosteler') {
      total += Number(formData.hostelFee);
    }
    setTotalFee(total);
  }, [formData.studentType, formData.transportType, formData.tuitionFee, formData.transportFee, formData.hostelFee]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Biometric data must be under 2MB.');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
    else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!photo && !isEditMode) {
      toast.error('Institutional photo is required for face recognition.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('id', formData.id);
      fd.append('name', `${formData.firstName} ${formData.lastName}`);
      fd.append('class_name', selectedGrade);
      fd.append('section', formData.section);
      fd.append('email', `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.edu`);
      fd.append('phone', formData.guardianPhone);
      fd.append('parent_phone', formData.parent_phone);
      fd.append('address', formData.guardianAddress);
      fd.append('dob', formData.dob);
      fd.append('admission_date', formData.admissionDate);
      fd.append('student_type', formData.studentType);
      fd.append('transport_type', formData.transportType);
      fd.append('tuition_fee', String(formData.tuitionFee));
      fd.append('transport_fee', String(formData.transportFee));
      fd.append('hostel_fee', String(formData.hostelFee));
      fd.append('total_monthly_fee', String(totalFee));
      fd.append('last_payment_date', formData.lastPaymentDate);
      fd.append('opening_balance', String(formData.openingBalance));
      if (photo) fd.append('photo', photo);

      const success = isEditMode 
        ? await updateStudent(formData.id, fd)
        : await createStudent(fd);

      if (success) {
        toast.success(isEditMode ? 'Student record updated.' : 'Student Enrollment Processed Successfully!');
        onClear();
      } else {
        toast.error('System synchronization issue. Check ID uniqueness.');
      }
    } catch (err) {
      toast.error('Critical system error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <SC.Container>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <SC.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ 
              background: '#EEF2FF', 
              color: '#4F46E5', 
              padding: '4px 12px', 
              borderRadius: '8px', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'inline-block'
            }}>{isEditMode ? 'Modify Entry' : 'New Enrollment'}</span>
            <SC.Title>{isEditMode ? 'Edit' : 'Onboard'} Student</SC.Title>
            <SC.Subtitle>
              {isEditMode ? 'Update academic and biometric data for this student.' : 'Initialize a student\'s academic journey by capturing essential administrative data.'}
            </SC.Subtitle>
          </div>
          <UIBackButton onClick={onClear}>
            Back to List
          </UIBackButton>
        </div>
      </SC.Header>

      <SC.StepperContainer>
        <SC.Step $active={currentStep === 1} $completed={currentStep > 1}>
          <SC.StepNumber $active={currentStep === 1} $completed={currentStep > 1}>
            {currentStep > 1 ? <RiCheckLine /> : 1}
          </SC.StepNumber>
          <SC.StepText>
            <SC.StepLabel>Basic Info</SC.StepLabel>
            <SC.StepStatus>{currentStep === 1 ? 'Active' : 'Completed'}</SC.StepStatus>
          </SC.StepText>
        </SC.Step>
        
        <div style={{ borderBottom: '2px solid #F1F5F9', flex: 1, margin: '0 24px' }} />

        <SC.Step $active={currentStep === 2} $completed={currentStep > 2}>
          <SC.StepNumber $active={currentStep === 2} $completed={currentStep > 2}>
            {currentStep > 2 ? <RiCheckLine /> : 2}
          </SC.StepNumber>
          <SC.StepText>
            <SC.StepLabel>Guardian</SC.StepLabel>
            <SC.StepStatus>{currentStep === 2 ? 'Active' : currentStep > 2 ? 'Completed' : 'Pending'}</SC.StepStatus>
          </SC.StepText>
        </SC.Step>

        <div style={{ borderBottom: '2px solid #F1F5F9', flex: 1, margin: '0 24px' }} />

        <SC.Step $active={currentStep === 3}>
          <SC.StepNumber $active={currentStep === 3}>3</SC.StepNumber>
          <SC.StepText>
            <SC.StepLabel>Review</SC.StepLabel>
            <SC.StepStatus>{currentStep === 3 ? 'Active' : 'Pending'}</SC.StepStatus>
          </SC.StepText>
        </SC.Step>
      </SC.StepperContainer>

      <SC.FormCard>
        {currentStep === 1 && (
          <>
            <SC.SectionTitle>
              <RiIdCardLine size={24} />
              Identity & Placement
            </SC.SectionTitle>

            <SC.FormGrid>
             <SC.PhotoUploadWrapper>
                <SC.PhotoUpload onClick={handlePhotoClick}>
                  {photoPreview ? (
                    <img src={photoPreview.startsWith('/') ? `http://127.0.0.1:8000${photoPreview}` : photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <RiCameraLine size={32} color="#94A3B8" />
                      <SC.PhotoLabel>Upload Photo</SC.PhotoLabel>
                    </>
                  )}
                </SC.PhotoUpload>
                <div style={{ background: '#F8FAFC', padding: '10px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institutional ID</span>
                  <span style={{ fontWeight: 800, color: '#4F46E5', fontSize: '1rem' }}>{formData.id}</span>
                </div>
              </SC.PhotoUploadWrapper>

            <SC.InputsGrid>

              <SC.InputGroup>
                <SC.Label>First Name</SC.Label>
                <SC.Input 
                  placeholder="e.g. Alexander" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </SC.InputGroup>
              <SC.InputGroup>
                <SC.Label>Last Name</SC.Label>
                <SC.Input 
                  placeholder="e.g. Hamilton" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Gender</SC.Label>
                <SC.Select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </SC.Select>
              </SC.InputGroup>
              <SC.InputGroup>
                <SC.Label>Section</SC.Label>
                <SC.Input 
                  placeholder="e.g. A, B, C" 
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Academic Grade</SC.Label>
                <SC.Select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </SC.Select>
              </SC.InputGroup>
               <SC.InputGroup>
                <SC.Label>Date of Birth</SC.Label>
                <SC.Input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Date of Admission</SC.Label>
                <SC.Input 
                  type="date" 
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                />
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Student Type</SC.Label>
                <SC.Select 
                  value={formData.studentType}
                  onChange={(e) => setFormData({...formData, studentType: e.target.value})}
                >
                  <option value="Regular">Regular</option>
                  <option value="Hosteler">Hosteler</option>
                </SC.Select>
              </SC.InputGroup>

              {formData.studentType === 'Regular' && (
                <SC.InputGroup>
                  <SC.Label>Transport Mode</SC.Label>
                  <SC.Select 
                    value={formData.transportType}
                    onChange={(e) => setFormData({...formData, transportType: e.target.value})}
                  >
                    <option value="Self">Self (Private)</option>
                    <option value="Van">School Van</option>
                  </SC.Select>
                </SC.InputGroup>
              )}

              <SC.InputGroup>
                <SC.Label>Monthly Tuition Fee</SC.Label>
                <SC.Input 
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({...formData, tuitionFee: e.target.value})}
                />
              </SC.InputGroup>

              {formData.studentType === 'Regular' && formData.transportType === 'Van' && (
                <SC.InputGroup>
                  <SC.Label>Monthly Van Fee</SC.Label>
                  <SC.Input 
                    type="number"
                    value={formData.transportFee}
                    onChange={(e) => setFormData({...formData, transportFee: e.target.value})}
                  />
                </SC.InputGroup>
              )}

              {formData.studentType === 'Hosteler' && (
                <SC.InputGroup>
                  <SC.Label>Monthly Hostel Fee</SC.Label>
                  <SC.Input 
                    type="number"
                    value={formData.hostelFee}
                    onChange={(e) => setFormData({...formData, hostelFee: e.target.value})}
                  />
                </SC.InputGroup>
              )}

              <SC.InputGroup style={{ gridColumn: 'span 3' }}>
                <div style={{ borderTop: '1px dashed #E2E8F0', margin: '20px 0 10px 0' }} />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RiFileList3Line size={18} color="#4F46E5" />
                  Historical Billing Setup
                </h4>
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Last Paid Month (Anchor)</SC.Label>
                <SC.Input 
                  type="date"
                  value={formData.lastPaymentDate}
                  onChange={(e) => setFormData({...formData, lastPaymentDate: e.target.value})}
                />
                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '4px' }}>System will bill starting from the month after this date.</span>
              </SC.InputGroup>

              <SC.InputGroup>
                <SC.Label>Initial Outstanding (Carry Forward)</SC.Label>
                <SC.Input 
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                />
                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '4px' }}>One-time balance added to the total due.</span>
              </SC.InputGroup>

               <SC.InputGroup style={{ gridColumn: 'span 3' }}>
                <div style={{ background: '#F0F9FF', padding: '16px 24px', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#0369A1', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Consolidated Billing</span>
                    <span style={{ color: '#0369A1', fontSize: '0.875rem', fontWeight: 600 }}>Calculated Monthly Fee</span>
                  </div>
                  <span style={{ color: '#0369A1', fontWeight: 900, fontSize: '1.75rem' }}>₹{totalFee.toLocaleString()}</span>
                </div>
              </SC.InputGroup>
            </SC.InputsGrid>
          </SC.FormGrid>
        </>
      )}

        {currentStep === 2 && (
          <>
            <SC.SectionTitle>
              <RiParentLine size={24} />
              Guardian Information
            </SC.SectionTitle>
            <SC.InputsGrid>
              <SC.InputGroup>
                <SC.Label>Guardian Full Name</SC.Label>
                <SC.Input 
                  placeholder="e.g. James Hamilton" 
                  value={formData.guardianName}
                  onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                />
              </SC.InputGroup>
              <SC.InputGroup>
                <SC.Label>Relationship</SC.Label>
                <SC.Select
                  value={formData.relation}
                  onChange={(e) => setFormData({...formData, relation: e.target.value})}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                </SC.Select>
              </SC.InputGroup>
              <SC.InputGroup>
                <SC.Label>Emergency Contact Number</SC.Label>
                <SC.Input 
                  placeholder="e.g. +1 234 567 8900" 
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                />
              </SC.InputGroup>
              <SC.InputGroup>
                <SC.Label>WhatsApp Notification Number (Parent)</SC.Label>
                <SC.Input 
                  placeholder="e.g. 1234567890" 
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                />
              </SC.InputGroup>
              <SC.InputGroup style={{ gridColumn: 'span 2' }}>
                <SC.Label>Full Residential Address</SC.Label>
                <SC.Input 
                  placeholder="e.g. 123 Academic Street, Education City" 
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({...formData, guardianAddress: e.target.value})}
                />
              </SC.InputGroup>
            </SC.InputsGrid>
          </>
        )}

        {currentStep === 3 && (
          <SC.ReviewSection>
            <SC.SectionTitle>
              <RiFileList3Line size={24} />
              Enrollment Review
            </SC.SectionTitle>
            <SC.ReviewGrid>
              <SC.ReviewItem>
                <SC.ReviewLabel>Student Name</SC.ReviewLabel>
                <SC.ReviewValue>{formData.firstName} {formData.lastName}</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem>
                <SC.ReviewLabel>Grade & Section</SC.ReviewLabel>
                <SC.ReviewValue>{selectedGrade} - {formData.section}</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem>
                <SC.ReviewLabel>Date of Birth</SC.ReviewLabel>
                <SC.ReviewValue>{formData.dob}</SC.ReviewValue>
              </SC.ReviewItem>
               <SC.ReviewItem>
                <SC.ReviewLabel>System ID</SC.ReviewLabel>
                <SC.ReviewValue>{formData.id}</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem>
                <SC.ReviewLabel>Guardian</SC.ReviewLabel>
                <SC.ReviewValue>{formData.guardianName} ({formData.relation})</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem>
                <SC.ReviewLabel>Contact</SC.ReviewLabel>
                <SC.ReviewValue>{formData.guardianPhone}</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem style={{ gridColumn: 'span 2' }}>
                <SC.ReviewLabel>Address</SC.ReviewLabel>
                <SC.ReviewValue>{formData.guardianAddress}</SC.ReviewValue>
              </SC.ReviewItem>
              <SC.ReviewItem>
                <SC.ReviewLabel>Total Monthly Fee</SC.ReviewLabel>
                <SC.ReviewValue style={{ color: '#4F46E5', fontWeight: 900, fontSize: '1.25rem' }}>₹{totalFee.toLocaleString()}</SC.ReviewValue>
              </SC.ReviewItem>
            </SC.ReviewGrid>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '16px', 
              background: '#F0FDF4', 
              borderRadius: '12px',
              border: '1px solid #BBF7D0',
              color: '#166534',
              marginTop: '12px'
            }}>
              <RiShieldCheckLine size={20} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Biometric and academic records verified.</span>
            </div>
          </SC.ReviewSection>
        )}
      </SC.FormCard>

      <SC.ActionFooter>
        <div style={{ flex: 1 }}>
          {currentStep > 1 && (
            <SC.BackButton onClick={handleBack}>
              <RiArrowLeftLine size={20} />
              Go Back
            </SC.BackButton>
          )}
        </div>
        <SC.NextButton onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? 'Synchronizing...' : currentStep === 3 ? (isEditMode ? 'Update Record' : 'Confirm Enrollment') : 'Guardian Details'}
          <RiArrowRightLine size={20} />
        </SC.NextButton>
      </SC.ActionFooter>
    </SC.Container>
  );
}
