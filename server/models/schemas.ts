/**
 * Mongoose Schemas & Models for MongoDB
 * Implements 16 entities with timestamps, validation, indexes, and relations
 */

export interface IMongooseSchemaDef {
  modelName: string;
  schema: any;
}

// Pseudo/Type-safe Mongoose Schema representation compatible with TypeScript
export const SchemaDefinitions = {
  // 1. User
  User: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', index: true },
    phone: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },

  // 2. Patient
  Patient: {
    userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    allergies: [{ type: String }],
    medicalHistory: [{ type: String }],
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
  },

  // 3. Department
  Department: {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    headDoctorId: { type: 'ObjectId', ref: 'Doctor' },
    location: { type: String },
    activeDoctorsCount: { type: Number, default: 0 },
  },

  // 4. Doctor
  Doctor: {
    userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true },
    phone: { type: String },
    specialization: { type: String, required: true, index: true },
    departmentId: { type: 'ObjectId', ref: 'Department', required: true, index: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String },
    consultationFee: { type: Number, required: true },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    avatarUrl: { type: String },
    roomNumber: { type: String, required: true },
    teleconsultAvailable: { type: Boolean, default: true },
    workingDays: [{ type: Number }], // 0-6
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    slotDurationMinutes: { type: Number, default: 20 },
    bufferMinutes: { type: Number, default: 5 },
  },

  // 5. DoctorLeave
  DoctorLeave: {
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true },
    approved: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },

  // 6. Appointment
  Appointment: {
    appointmentNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true, index: true },
    departmentId: { type: 'ObjectId', ref: 'Department', required: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ['in-person', 'teleconsult'], default: 'in-person' },
    status: { 
      type: String, 
      enum: ['scheduled', 'confirmed', 'in-consultation', 'completed', 'cancelled', 'no-show'], 
      default: 'scheduled',
      index: true 
    },
    reasonForVisit: { type: String, required: true },
    notes: { type: String },
    teleconsultUrl: { type: String },
    queueTokenId: { type: 'ObjectId', ref: 'QueueToken' },
    fee: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },

  // 7. QueueToken
  QueueToken: {
    appointmentId: { type: 'ObjectId', ref: 'Appointment', required: true, index: true },
    patientId: { type: 'ObjectId', ref: 'Patient', required: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true, index: true },
    tokenNumber: { type: Number, required: true },
    displayCode: { type: String, required: true, index: true },
    status: { 
      type: String, 
      enum: ['waiting', 'called', 'in-consultation', 'completed', 'delayed', 'skipped'], 
      default: 'waiting',
      index: true
    },
    checkInTime: { type: Date, default: Date.now },
    calledTime: { type: Date },
    completedTime: { type: Date },
    estimatedWaitMinutes: { type: Number, default: 15 },
  },

  // 8. WaitingListEntry
  WaitingListEntry: {
    patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor' },
    departmentId: { type: 'ObjectId', ref: 'Department', required: true },
    preferredDate: { type: String, required: true, index: true },
    preferredTimeRange: { type: String, enum: ['morning', 'afternoon', 'evening', 'any'], default: 'any' },
    status: { type: String, enum: ['pending', 'notified', 'booked', 'expired', 'cancelled'], default: 'pending', index: true },
    requestedAt: { type: Date, default: Date.now },
    notifiedAt: { type: Date },
  },

  // 9. Consultation
  Consultation: {
    appointmentId: { type: 'ObjectId', ref: 'Appointment', required: true, index: true },
    patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true, index: true },
    date: { type: Date, default: Date.now },
    vitals: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      weightKg: { type: Number },
      spo2: { type: Number },
    },
    symptoms: [{ type: String }],
    diagnosis: { type: String, required: true },
    clinicalNotes: { type: String },
    treatmentPlan: { type: String },
    followUpDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },

  // 10. Prescription
  Prescription: {
    consultationId: { type: 'ObjectId', ref: 'Consultation', required: true, index: true },
    patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true },
    medications: [{
      medicationName: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      durationDays: { type: Number, required: true },
      instructions: { type: String },
    }],
    createdAt: { type: Date, default: Date.now },
  },

  // 11. LabReport
  LabReport: {
    reportNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
    doctorId: { type: 'ObjectId', ref: 'Doctor', required: true },
    testName: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Pathology', 'Cardiology'],
      required: true 
    },
    testDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed', 'reviewed', 'critical'], default: 'completed' },
    resultsSummary: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSizeBytes: { type: Number },
    criticalValuesFlag: { type: Boolean, default: false },
    referenceRanges: { type: String },
    createdAt: { type: Date, default: Date.now },
  },

  // 12. Notification
  Notification: {
    userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
    emailSent: { type: Boolean, default: false },
    emailStatus: { type: String, default: 'unconfigured' },
    createdAt: { type: Date, default: Date.now },
  },

  // 13. AuditLog
  AuditLog: {
    timestamp: { type: Date, default: Date.now, index: true },
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    description: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    severity: { type: String, enum: ['info', 'warning', 'critical', 'security'], default: 'info' },
  },

  // 14. SystemSetting
  SystemSetting: {
    hospitalName: { type: String, default: 'CarePulse University Medical Center' },
    hospitalAddress: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    defaultSlotDurationMinutes: { type: Number, default: 20 },
    defaultBufferMinutes: { type: Number, default: 5 },
    maxAdvanceBookingDays: { type: Number, default: 60 },
    cancellationCutoffHours: { type: Number, default: 4 },
    allowPatientCancellation: { type: Boolean, default: true },
    requirePrepayment: { type: Boolean, default: false },
    autoCallNextToken: { type: Boolean, default: false },
    teleconsultationProvider: { type: String, default: 'Integrated WebRTC' },
    emailNotificationsEnabled: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
  },
};
