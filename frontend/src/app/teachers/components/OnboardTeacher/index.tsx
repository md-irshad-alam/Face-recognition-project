'use client'

import React, { useState, useEffect } from 'react';
import { 
  RiCheckLine, 
  RiArrowRightLine, 
  RiUser6Line, 
  RiBriefcaseLine, 
  RiContactsBookLine,
  RiFileList3Line,
  RiLockPasswordLine,
  RiShieldFlashLine,
  RiHeartPulseLine,
  RiCalendarEventLine,
  RiTimeLine
} from 'react-icons/ri';
import { BackButton as UIBackButton } from '@/components/ui';
import { useTeachers, Teacher } from '@/hooks/useTeachers';
import { toast } from 'react-hot-toast';
import { generateInstitutionalID } from '@/utils/institutional';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import * as SC from './OnboardTeacher.sc';

interface OnboardTeacherProps {
  onClear: () => void;
  initialData?: Teacher | null;
}

export default function OnboardTeacher({ onClear, initialData }: OnboardTeacherProps) {
  const { user } = useAuth();
  const { createTeacher, updateTeacher } = useTeachers();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({
    id: initialData?.id || generateInstitutionalID('TCHR'),
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    password: '',
    phone: initialData?.phone || '',
    qualification: initialData?.highest_education || 'PhD in Education',
    department: initialData?.department || 'Mathematics & Logic',
    years_of_experience: initialData?.years_of_experience || 0,
    role: initialData?.role || 'teacher',
    fullAccess: true,
    sick_leave: 15,
    casual_leave: 10,
    earned_leave: 30
  });

  const [emailStatus, setEmailStatus] = useState<'checking' | 'unique' | 'taken' | null>(null);

  useEffect(() => {
    // Only check if it looks like a valid email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.email && emailRegex.test(formData.email)) {
      // Don't check if it's the current teacher's own email during edit
      if (isEditMode && formData.email === initialData?.email) {
        setEmailStatus('unique');
        return;
      }

      const timer = setTimeout(async () => {
        setEmailStatus('checking');
        try {
          const res = await api.get<any>(`/check-email/${formData.email}`);
          setEmailStatus(res.unique ? 'unique' : 'taken');
        } catch (err) {
          setEmailStatus(null);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailStatus(null);
    }
  }, [formData.email, isEditMode, initialData?.email]);

  useEffect(() => {
    if (isEditMode && isAdmin) {
      api.get<any>(`/leaves/${formData.id}`).then(res => {
        if (res?.balance) {
          setFormData(prev => ({
            ...prev,
            sick_leave: res.balance.sick_leave,
            casual_leave: res.balance.casual_leave,
            earned_leave: res.balance.earned_leave
          }));
        }
      }).catch(() => {});
    }
  }, [isEditMode, isAdmin, formData.id]);

  const handleNext = async () => {
    if (currentStep === 4 && emailStatus === 'taken') {
      toast.error('This email is already registered in the system.');
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.phone || !formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Essential profile fields are mandatory.');
      setCurrentStep(1);
      return;
    }

    if (!isEditMode && !formData.password) {
      toast.error('Portal access credentials are required for new registration.');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      const teacherPayload: any = {
        id: formData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        highest_education: formData.qualification,
        years_of_experience: Number(formData.years_of_experience),
        specialization: formData.department,
        department: formData.department,
        role: formData.role,
        status: initialData?.status || 'active'
      };

      if (formData.password) {
        teacherPayload.password = formData.password;
      }

      const success = isEditMode 
        ? await updateTeacher(formData.id, teacherPayload)
        : await createTeacher(teacherPayload);

      if (success) {
        // Update Leave Balances if admin
        if (isAdmin) {
          await api.put(`/leaves/${formData.id}/balance`, {
            sick_leave: formData.sick_leave,
            casual_leave: formData.casual_leave,
            earned_leave: formData.earned_leave
          });
        }
        
        toast.success(isEditMode ? 'Faculty profile updated successfully!' : 'Institutional faculty profile registered successfully!');
        onClear();
      } else {
        toast.error('Synchronization failed. Please verify unique constraints.');
      }
    } catch (err: any) {
      toast.error('Internal synchronization error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const toggleAccess = () => {
    setFormData(prev => ({ ...prev, fullAccess: !prev.fullAccess }));
  };

  return (
    <SC.Container>
      <SC.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <SC.Badge>{isEditMode ? 'Modify Faculty Record' : 'Teacher Registration'}</SC.Badge>
            <SC.Title>{isEditMode ? 'Edit' : 'Set up your'} <span>Academic Profile</span></SC.Title>
            <SC.Subtitle>
              {isEditMode ? 'Update institutional records for this faculty member.' : 'Complete your professional registration to join the faculty portal.'}
            </SC.Subtitle>
          </div>
          <UIBackButton onClick={onClear}>Back to Faculty</UIBackButton>
        </div>
      </SC.Header>

      <SC.StepperContainer>
        {['Personal Profile', 'Professional Details', 'Assignments', 'Credentials', 'Review'].map((label, idx) => (
          <SC.Step key={label} $active={currentStep === idx + 1} $done={currentStep > idx + 1}>
            <SC.StepNumber $active={currentStep === idx + 1} $done={currentStep > idx + 1}>
              {currentStep > idx + 1 ? <RiCheckLine /> : idx + 1}
            </SC.StepNumber>
            <SC.StepLabel>{label}</SC.StepLabel>
          </SC.Step>
        ))}
      </SC.StepperContainer>

      <SC.FormCard>
        {currentStep === 1 && (
          <SC.Section>
            <SC.SectionHeader>
              <RiUser6Line /> General Information
            </SC.SectionHeader>
            <SC.FieldGrid>
              <SC.FormGroup>
                <SC.Label>Staff ID (System Generated)</SC.Label>
                <SC.Input 
                  value={formData.id}
                  disabled
                  style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
                />
              </SC.FormGroup>
              <SC.FormGroup>
                <SC.Label>Contact Phone</SC.Label>
                <SC.Input 
                  placeholder="e.g. +1 (555) 000-0000" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </SC.FormGroup>
            </SC.FieldGrid>
            <SC.FieldGrid>
              <SC.FormGroup>
                <SC.Label>First Name</SC.Label>
                <SC.Input 
                  placeholder="e.g. Sarah" 
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                />
              </SC.FormGroup>
              <SC.FormGroup>
                <SC.Label>Last Name</SC.Label>
                <SC.Input 
                  placeholder="e.g. Mitchell" 
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                />
              </SC.FormGroup>
            </SC.FieldGrid>
          </SC.Section>
        )}

        {currentStep === 2 && (
          <SC.Section>
            <SC.SectionHeader>
              <RiBriefcaseLine /> Professional Details
            </SC.SectionHeader>
            <SC.FieldGrid>
              <SC.FormGroup>
                <SC.Label>Highest Qualification</SC.Label>
                <SC.Select 
                  value={formData.qualification}
                  onChange={e => setFormData({...formData, qualification: e.target.value})}
                >
                  <option>PhD in Education</option>
                  <option>Master of Science</option>
                  <option>Bachelor of Education</option>
                </SC.Select>
              </SC.FormGroup>
              <SC.FormGroup>
                <SC.Label>Years of Experience</SC.Label>
                <SC.Input 
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={e => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
                />
              </SC.FormGroup>
            </SC.FieldGrid>
            <SC.FieldGrid>
              <SC.FormGroup>
                <SC.Label>Department / Specialization</SC.Label>
                <SC.Select 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option>Mathematics & Logic</option>
                  <option>Computer Science</option>
                  <option>English Literature</option>
                  <option>Academic Research</option>
                </SC.Select>
              </SC.FormGroup>
              <SC.FormGroup>
                <SC.Label>Staff Role</SC.Label>
                <SC.Select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="teacher">Class Teacher</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="lecturer">Lecturer</option>
                </SC.Select>
              </SC.FormGroup>
            </SC.FieldGrid>
          </SC.Section>
        )}

        {currentStep === 3 && (
          <SC.Section>
            <SC.SectionHeader>
              <RiContactsBookLine /> Classroom Assignments & Access
            </SC.SectionHeader>
            <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>Configure how this faculty member interacts with the institutional system.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SC.ToggleWrapper onClick={toggleAccess}>
                <SC.ToggleTrack $active={formData.fullAccess}>
                  <SC.ToggleThumb $active={formData.fullAccess} />
                </SC.ToggleTrack>
                <SC.ToggleLabel>
                  <SC.ToggleTitle>Full System Access</SC.ToggleTitle>
                  <SC.ToggleSub>Grant permission to manage grades, attendance, and student reports across assigned classes.</SC.ToggleSub>
                </SC.ToggleLabel>
                {formData.fullAccess && <RiShieldFlashLine size={24} color="#4F46E5" style={{ marginLeft: 'auto' }} />}
              </SC.ToggleWrapper>

              {isAdmin && (
                <div style={{ marginTop: '12px' }}>
                  <SC.SectionHeader style={{ fontSize: '0.9375rem', marginBottom: '20px' }}>
                    <RiTimeLine /> Annual Leave Quota Assignment
                  </SC.SectionHeader>
                  <SC.FieldGrid $cols={3}>
                    <SC.FormGroup>
                      <SC.Label><RiHeartPulseLine size={14} style={{ marginRight: 4 }} /> Sick Leave</SC.Label>
                      <SC.Input 
                        type="number" 
                        value={formData.sick_leave} 
                        onChange={e => setFormData({...formData, sick_leave: parseInt(e.target.value) || 0})}
                      />
                    </SC.FormGroup>
                    <SC.FormGroup>
                      <SC.Label><RiBriefcaseLine size={14} style={{ marginRight: 4 }} /> Casual Leave</SC.Label>
                      <SC.Input 
                        type="number" 
                        value={formData.casual_leave} 
                        onChange={e => setFormData({...formData, casual_leave: parseInt(e.target.value) || 0})}
                      />
                    </SC.FormGroup>
                    <SC.FormGroup>
                      <SC.Label><RiCalendarEventLine size={14} style={{ marginRight: 4 }} /> Earned Leave</SC.Label>
                      <SC.Input 
                        type="number" 
                        value={formData.earned_leave} 
                        onChange={e => setFormData({...formData, earned_leave: parseInt(e.target.value) || 0})}
                      />
                    </SC.FormGroup>
                  </SC.FieldGrid>
                </div>
              )}
            </div>
          </SC.Section>
        )}

        {currentStep === 4 && (
          <SC.Section>
            <SC.SectionHeader>
              <RiLockPasswordLine /> Institutional Credentials
            </SC.SectionHeader>
            <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>Set up the login credentials for faculty portal access.</p>
            
            <SC.FieldGrid>
              <SC.FormGroup>
                <SC.Label>Portal Login Email</SC.Label>
                <SC.Input 
                  type="email" 
                  placeholder="e.g. sarah.m@academia.edu" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ borderColor: emailStatus === 'taken' ? '#EF4444' : emailStatus === 'unique' ? '#10B981' : '#E2E8F0' }}
                />
                {emailStatus === 'checking' && <p style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: 4 }}>Verifying uniqueness...</p>}
                {emailStatus === 'unique' && <p style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: 4, fontWeight: 700 }}>Email is unique and available.</p>}
                {emailStatus === 'taken' && <p style={{ fontSize: '0.6875rem', color: '#EF4444', marginTop: 4, fontWeight: 700 }}>This email is already in use.</p>}
              </SC.FormGroup>
              <SC.FormGroup>
                <SC.Label>{isEditMode ? 'New Access Password (Optional)' : 'Access Password'}</SC.Label>
                <SC.Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </SC.FormGroup>
            </SC.FieldGrid>
          </SC.Section>
        )}

        {currentStep === 5 && (
          <SC.Section>
            <SC.SectionHeader>
              <RiFileList3Line /> Enrollment Review
            </SC.SectionHeader>
            <SC.ReviewBox>
              <SC.FieldGrid $cols={2}>
                <SC.InfoItem>
                  <SC.InfoLabel>Full Name</SC.InfoLabel>
                  <SC.InfoValue>{formData.first_name} {formData.last_name}</SC.InfoValue>
                </SC.InfoItem>
                <SC.InfoItem>
                  <SC.InfoLabel>Administrative Role</SC.InfoLabel>
                  <SC.InfoValue>{formData.role.toUpperCase()}</SC.InfoValue>
                </SC.InfoItem>
                <SC.InfoItem>
                  <SC.InfoLabel>Institutional ID</SC.InfoLabel>
                  <SC.InfoValue>{formData.id}</SC.InfoValue>
                </SC.InfoItem>
                <SC.InfoItem>
                  <SC.InfoLabel>Experience</SC.InfoLabel>
                  <SC.InfoValue>{formData.years_of_experience} Years</SC.InfoValue>
                </SC.InfoItem>
                <SC.InfoItem>
                  <SC.InfoLabel>Email Address</SC.InfoLabel>
                  <SC.InfoValue>{formData.email}</SC.InfoValue>
                </SC.InfoItem>
                 <SC.InfoItem>
                  <SC.InfoLabel>Department</SC.InfoLabel>
                  <SC.InfoValue>{formData.department}</SC.InfoValue>
                </SC.InfoItem>
                {isAdmin && (
                  <>
                    <SC.InfoItem>
                      <SC.InfoLabel>Sick Leave Quota</SC.InfoLabel>
                      <SC.InfoValue>{formData.sick_leave} Days</SC.InfoValue>
                    </SC.InfoItem>
                    <SC.InfoItem>
                      <SC.InfoLabel>Casual Leave Quota</SC.InfoLabel>
                      <SC.InfoValue>{formData.casual_leave} Days</SC.InfoValue>
                    </SC.InfoItem>
                    <SC.InfoItem>
                      <SC.InfoLabel>Earned Leave Quota</SC.InfoLabel>
                      <SC.InfoValue>{formData.earned_leave} Days</SC.InfoValue>
                    </SC.InfoItem>
                  </>
                )}
              </SC.FieldGrid>
            </SC.ReviewBox>
          </SC.Section>
        )}
      </SC.FormCard>

      <SC.Footer>
        <div style={{ flex: 1 }}>
          {currentStep > 1 && (
            <UIBackButton onClick={handleBack}>
              Previous Step
            </UIBackButton>
          )}
        </div>
        <SC.FooterActions>
          <SC.DraftButton onClick={() => toast.success('Profile draft archived.')}>Save as Draft</SC.DraftButton>
          <SC.NextButton onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : currentStep === 5 ? (isEditMode ? 'Update Profile' : 'Confirm & Join Faculty') : 'Next Step'}
            <RiArrowRightLine size={20} />
          </SC.NextButton>
        </SC.FooterActions>
      </SC.Footer>
    </SC.Container>
  );
}
