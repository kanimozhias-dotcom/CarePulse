/**
 * Core Data Models & TypeScript Types for CarePulse Healthcare System
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-consultation'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type AppointmentType = 'in-person' | 'teleconsult';

export type TokenStatus = 'waiting' | 'called' | 'in-consultation' | 'completed' | 'delayed' | 'skipped';

export type WaitlistStatus = 'pending' | 'notified' | 'booked' | 'expired' | 'cancelled';

export type LabReportStatus = 'pending' | 'completed' | 'reviewed' | 'critical';

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'reminder'
  | 'queue_update'
  | 'doctor_leave'
  | 'waitlist_available'
  | 'lab_ready'
  | 'system';

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'APPOINTMENT_CREATE'
  | 'APPOINTMENT_UPDATE'
  | 'APPOINTMENT_CANCEL'
  | 'APPOINTMENT_RESCHEDULE'
  | 'QUEUE_TOKEN_CALLED'
  | 'CONSULTATION_NOTE_SAVED'
  | 'PRESCRIPTION_CREATED'
  | 'LAB_REPORT_UPLOADED'
  | 'DOCTOR_LEAVE_ADDED'
  | 'SCHEDULE_MODIFIED'
  | 'WAITLIST_MATCHED'
  | 'SYSTEM_SETTINGS_UPDATED';

export type AuditSeverity = 'info' | 'warning' | 'critical' | 'security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalHistory: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  qualifications: string[];
  experienceYears: number;
  bio: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  roomNumber: string;
  teleconsultAvailable: boolean;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  slotDurationMinutes: number; // e.g. 20
  bufferMinutes: number;       // e.g. 5
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headDoctorId?: string;
  location: string;
  activeDoctorsCount: number;
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  doctorName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  approved: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string; // e.g. "APT-2026-8921"
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit: string;
  notes?: string;
  teleconsultUrl?: string;
  queueTokenId?: string;
  tokenNumber?: number;
  fee: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueToken {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  tokenNumber: number; // e.g. 1, 2, 3...
  displayCode: string; // e.g. "CARD-004"
  status: TokenStatus;
  checkInTime: string;
  calledTime?: string;
  completedTime?: string;
  estimatedWaitMinutes: number;
  isDelayed?: boolean;
}

export interface WaitingListEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId?: string;
  doctorName?: string;
  departmentId: string;
  preferredDate: string;
  preferredTimeRange?: 'morning' | 'afternoon' | 'evening' | 'any';
  requestedAt: string;
  status: WaitlistStatus;
  notifiedAt?: string;
  matchedSlot?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "Twice daily after meals"
  durationDays: number;
  instructions: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weightKg?: number;
    spo2?: number;
  };
  symptoms: string[];
  diagnosis: string;
  clinicalNotes: string;
  treatmentPlan: string;
  followUpDate?: string;
  prescriptions: PrescriptionItem[];
  createdAt: string;
}

export interface LabReport {
  id: string;
  reportNumber: string; // e.g. "LAB-4091"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Microbiology' | 'Pathology' | 'Cardiology';
  testDate: string;
  status: LabReportStatus;
  resultsSummary: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  criticalValuesFlag: boolean;
  referenceRanges?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
  emailSent?: boolean;
  emailStatus?: 'unconfigured' | 'sent' | 'failed';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  severity: AuditSeverity;
}

export interface SystemSetting {
  id: string;
  hospitalName: string;
  hospitalAddress: string;
  contactEmail: string;
  contactPhone: string;
  defaultSlotDurationMinutes: number;
  defaultBufferMinutes: number;
  maxAdvanceBookingDays: number;
  cancellationCutoffHours: number;
  allowPatientCancellation: boolean;
  requirePrepayment: boolean;
  autoCallNextToken: boolean;
  teleconsultationProvider: string;
  emailNotificationsEnabled: boolean;
  maintenanceMode: boolean;
}

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:20"
  available: boolean;
  reason?: 'booked' | 'leave' | 'outside_hours' | 'buffer_conflict';
}

export interface SlotRecommendation {
  date: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  score: number;
  matchReason: string;
}
