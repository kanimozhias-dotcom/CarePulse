import { 
  Appointment, 
  AuditLog, 
  Consultation, 
  Department, 
  Doctor, 
  DoctorLeave, 
  LabReport, 
  Notification, 
  Patient, 
  QueueToken, 
  SystemSetting, 
  User, 
  WaitingListEntry 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'carepulse_users_v1',
  PATIENTS: 'carepulse_patients_v1',
  DOCTORS: 'carepulse_doctors_v1',
  DEPARTMENTS: 'carepulse_departments_v1',
  APPOINTMENTS: 'carepulse_appointments_v1',
  DOCTOR_LEAVES: 'carepulse_doctor_leaves_v1',
  QUEUE_TOKENS: 'carepulse_queue_tokens_v1',
  WAITING_LIST: 'carepulse_waiting_list_v1',
  CONSULTATIONS: 'carepulse_consultations_v1',
  LAB_REPORTS: 'carepulse_lab_reports_v1',
  NOTIFICATIONS: 'carepulse_notifications_v1',
  AUDIT_LOGS: 'carepulse_audit_logs_v1',
  SYSTEM_SETTINGS: 'carepulse_system_settings_v1',
  INITIALIZED: 'carepulse_data_initialized_v1',
};

// Seed Data
const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Cardiology',
    code: 'CARD',
    description: 'Specialized diagnosis and treatment of heart disease and cardiovascular conditions.',
    location: 'Building A, 3rd Floor',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-2',
    name: 'Neurology',
    code: 'NEUR',
    description: 'Expert care for neurological disorders, stroke management, and nerve diseases.',
    location: 'Building B, 2nd Floor',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-3',
    name: 'Pediatrics',
    code: 'PEDI',
    description: 'Comprehensive child healthcare, newborn care, immunizations, and developmental medicine.',
    location: 'Building C, 1st Floor',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-4',
    name: 'Orthopedics & Sports Medicine',
    code: 'ORTH',
    description: 'Advanced joint replacement, spine surgery, trauma rehabilitation, and sports injuries.',
    location: 'Building A, Ground Floor',
    activeDoctorsCount: 1,
  },
  {
    id: 'dept-5',
    name: 'General Medicine',
    code: 'GENM',
    description: 'Primary care, chronic illness management, preventative health screenings, and fever clinics.',
    location: 'Building D, 1st Floor',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-6',
    name: 'Dermatology',
    code: 'DERM',
    description: 'Clinical dermatology, skin cancer screenings, allergy testing, and cosmetic procedures.',
    location: 'Building B, 4th Floor',
    activeDoctorsCount: 1,
  },
];

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    userId: 'user-doc-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@carepulse.hospital',
    phone: '+1 (555) 234-5678',
    specialization: 'Senior Interventional Cardiologist',
    departmentId: 'dept-1',
    departmentName: 'Cardiology',
    qualifications: ['MD (Harvard Medical School)', 'FACC', 'Board Certified Cardiology'],
    experienceYears: 16,
    bio: 'Pioneered minimally invasive coronary interventions with over 3,000 successful catheterizations and stent procedures.',
    consultationFee: 175,
    rating: 4.9,
    reviewCount: 142,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'A-304',
    teleconsultAvailable: true,
    workingDays: [1, 2, 3, 4, 5], // Mon - Fri
    workingHours: { start: '09:00', end: '16:00' },
    slotDurationMinutes: 20,
    bufferMinutes: 5,
  },
  {
    id: 'doc-2',
    userId: 'user-doc-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@carepulse.hospital',
    phone: '+1 (555) 345-6789',
    specialization: 'Consultant Neurologist & Neurophysiologist',
    departmentId: 'dept-2',
    departmentName: 'Neurology',
    qualifications: ['MD (Johns Hopkins)', 'PhD Neurosciences', 'FAAN'],
    experienceYears: 12,
    bio: 'Specialist in migraine management, epilepsy diagnosis, neurodegenerative disorders, and EEG diagnostics.',
    consultationFee: 190,
    rating: 4.85,
    reviewCount: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813589-32213d803623?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'B-210',
    teleconsultAvailable: true,
    workingDays: [1, 2, 3, 5], // Mon, Tue, Wed, Fri
    workingHours: { start: '08:30', end: '15:30' },
    slotDurationMinutes: 30,
    bufferMinutes: 5,
  },
  {
    id: 'doc-3',
    userId: 'user-doc-3',
    name: 'David Chen',
    email: 'david.chen@carepulse.hospital',
    phone: '+1 (555) 456-7890',
    specialization: 'Lead Pediatric Specialist',
    departmentId: 'dept-3',
    departmentName: 'Pediatrics',
    qualifications: ['MD (Stanford Medicine)', 'FAAP'],
    experienceYears: 14,
    bio: 'Dedicated to compassionate pediatric care from neonatal stages to adolescence, focusing on growth milestones.',
    consultationFee: 140,
    rating: 4.95,
    reviewCount: 210,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'C-102',
    teleconsultAvailable: true,
    workingDays: [1, 2, 3, 4, 6], // Mon - Thu, Sat
    workingHours: { start: '09:00', end: '17:00' },
    slotDurationMinutes: 20,
    bufferMinutes: 5,
  },
  {
    id: 'doc-4',
    userId: 'user-doc-4',
    name: 'Amara Okafor',
    email: 'amara.okafor@carepulse.hospital',
    phone: '+1 (555) 567-8901',
    specialization: 'Orthopedic Surgeon & Arthroscopy Fellow',
    departmentId: 'dept-4',
    departmentName: 'Orthopedics & Sports Medicine',
    qualifications: ['MBBS', 'MS Ortho (Oxford)', 'FRCS'],
    experienceYears: 11,
    bio: 'Keyhole joint reconstruction, ACL repairs, arthritis therapies, and post-traumatic knee surgery specialist.',
    consultationFee: 165,
    rating: 4.88,
    reviewCount: 84,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'A-108',
    teleconsultAvailable: false,
    workingDays: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    workingHours: { start: '10:00', end: '18:00' },
    slotDurationMinutes: 25,
    bufferMinutes: 5,
  },
  {
    id: 'doc-5',
    userId: 'user-doc-5',
    name: 'Sophia Sterling',
    email: 'sophia.sterling@carepulse.hospital',
    phone: '+1 (555) 678-9012',
    specialization: 'Chief of General Internal Medicine',
    departmentId: 'dept-5',
    departmentName: 'General Medicine',
    qualifications: ['MD (Columbia)', 'FACP'],
    experienceYears: 18,
    bio: 'Holistic chronic illness management, hypertension, diabetic care, and preventative longevity consultations.',
    consultationFee: 130,
    rating: 4.92,
    reviewCount: 189,
    avatarUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'D-115',
    teleconsultAvailable: true,
    workingDays: [1, 2, 3, 4, 5], // Mon - Fri
    workingHours: { start: '08:00', end: '16:00' },
    slotDurationMinutes: 20,
    bufferMinutes: 5,
  },
  {
    id: 'doc-6',
    userId: 'user-doc-6',
    name: 'Julian Hayes',
    email: 'julian.hayes@carepulse.hospital',
    phone: '+1 (555) 789-0123',
    specialization: 'Electrophysiologist & Cardiologist',
    departmentId: 'dept-1',
    departmentName: 'Cardiology',
    qualifications: ['MD (Yale)', 'CEPS', 'FACC'],
    experienceYears: 9,
    bio: 'Arrhythmia management, pacemaker implantation, cardiac resynchronization therapy, and ablation procedures.',
    consultationFee: 180,
    rating: 4.79,
    reviewCount: 62,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    roomNumber: 'A-309',
    teleconsultAvailable: true,
    workingDays: [2, 3, 4, 5, 6], // Tue - Sat
    workingHours: { start: '09:30', end: '17:00' },
    slotDurationMinutes: 20,
    bufferMinutes: 5,
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    userId: 'user-pat-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 912-3456',
    dob: '1988-06-14',
    gender: 'female',
    bloodGroup: 'A+',
    address: '428 Willow Creek Way, Suite 3, Metro City',
    emergencyContact: {
      name: 'Michael Jenkins',
      relationship: 'Spouse',
      phone: '+1 (555) 912-8877',
    },
    allergies: ['Penicillin', 'Sulfa drugs'],
    medicalHistory: ['Mild asthma since childhood', 'Stage 1 Hypertension (diagnosed 2023)'],
    insuranceProvider: 'BlueCross Health Premier',
    insurancePolicyNumber: 'BC-9048-2819',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'pat-2',
    userId: 'user-pat-2',
    name: 'Robert Torres',
    email: 'robert.torres@example.com',
    phone: '+1 (555) 823-4567',
    dob: '1975-11-22',
    gender: 'male',
    bloodGroup: 'O+',
    address: '710 Pinecrest Blvd, Metro City',
    emergencyContact: {
      name: 'Maria Torres',
      relationship: 'Daughter',
      phone: '+1 (555) 823-9900',
    },
    allergies: ['Aspirin', 'Shellfish'],
    medicalHistory: ['Type 2 Diabetes Mellitus', 'Coronary artery stent placed in 2021'],
    insuranceProvider: 'United Healthcare Choice Plus',
    insurancePolicyNumber: 'UHC-4410-9921',
    createdAt: '2025-02-14T11:30:00Z',
  },
  {
    id: 'pat-3',
    userId: 'user-pat-3',
    name: 'Liam Gallagher',
    email: 'liam.g@example.com',
    phone: '+1 (555) 734-5678',
    dob: '2018-04-05',
    gender: 'male',
    bloodGroup: 'B+',
    address: '15 Maple Grove Terrace, Metro City',
    emergencyContact: {
      name: 'Fiona Gallagher',
      relationship: 'Mother',
      phone: '+1 (555) 734-0012',
    },
    allergies: ['Peanuts'],
    medicalHistory: ['Eczema', 'Seasonal allergic rhinitis'],
    insuranceProvider: 'Aetna Open Access',
    insurancePolicyNumber: 'AET-7712-3841',
    createdAt: '2025-03-01T14:00:00Z',
  },
  {
    id: 'pat-4',
    userId: 'user-pat-4',
    name: 'Chloe Montgomery',
    email: 'chloe.m@example.com',
    phone: '+1 (555) 645-6789',
    dob: '1995-08-30',
    gender: 'female',
    bloodGroup: 'AB-',
    address: '88 Harborview View, Metro City',
    emergencyContact: {
      name: 'Evelyn Montgomery',
      relationship: 'Sister',
      phone: '+1 (555) 645-1122',
    },
    allergies: ['Latex'],
    medicalHistory: ['Chronic migraine with aura', 'Occasional tension headaches'],
    insuranceProvider: 'Cigna Global Health',
    insurancePolicyNumber: 'CIG-1284-9003',
    createdAt: '2025-03-12T10:15:00Z',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-pat-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    role: 'patient',
    phone: '+1 (555) 912-3456',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'user-doc-1',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@carepulse.hospital',
    role: 'doctor',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'user-admin-1',
    name: 'Alexander Cross',
    email: 'admin@carepulse.hospital',
    role: 'admin',
    phone: '+1 (555) 100-2000',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2024-10-01T00:00:00Z',
  },
];

const INITIAL_LEAVES: DoctorLeave[] = [
  {
    id: 'leave-1',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    reason: 'Annual Cardiology World Congress Speaker',
    approved: true,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'leave-2',
    doctorId: 'doc-2',
    doctorName: 'Elena Rostova',
    startDate: '2026-11-18',
    endDate: '2026-11-19',
    reason: 'Advanced Neuro-Imaging Symposium',
    approved: true,
    createdAt: '2026-10-20T11:00:00Z',
  },
];

// Helper to get formatted date string for today and future days
function getDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    appointmentNumber: 'APT-2026-1001',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    patientPhone: '+1 (555) 912-3456',
    patientEmail: 'sarah.jenkins@example.com',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    doctorSpecialization: 'Senior Interventional Cardiologist',
    departmentId: 'dept-1',
    date: getDateString(0), // Today
    startTime: '09:00',
    endTime: '09:20',
    type: 'in-person',
    status: 'in-consultation',
    reasonForVisit: 'Periodic echocardiogram follow-up and slight shortness of breath after exertion',
    queueTokenId: 'tok-1',
    tokenNumber: 1,
    fee: 175,
    paid: true,
    createdAt: '2026-10-25T14:30:00Z',
    updatedAt: '2026-10-28T09:05:00Z',
  },
  {
    id: 'apt-2',
    appointmentNumber: 'APT-2026-1002',
    patientId: 'pat-2',
    patientName: 'Robert Torres',
    patientPhone: '+1 (555) 823-4567',
    patientEmail: 'robert.torres@example.com',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    doctorSpecialization: 'Senior Interventional Cardiologist',
    departmentId: 'dept-1',
    date: getDateString(0), // Today
    startTime: '09:25',
    endTime: '09:45',
    type: 'in-person',
    status: 'confirmed',
    reasonForVisit: 'Hypertension prescription review and blood pressure calibration',
    queueTokenId: 'tok-2',
    tokenNumber: 2,
    fee: 175,
    paid: true,
    createdAt: '2026-10-26T09:15:00Z',
    updatedAt: '2026-10-26T09:15:00Z',
  },
  {
    id: 'apt-3',
    appointmentNumber: 'APT-2026-1003',
    patientId: 'pat-4',
    patientName: 'Chloe Montgomery',
    patientPhone: '+1 (555) 645-6789',
    patientEmail: 'chloe.m@example.com',
    doctorId: 'doc-2',
    doctorName: 'Elena Rostova',
    doctorSpecialization: 'Consultant Neurologist & Neurophysiologist',
    departmentId: 'dept-2',
    date: getDateString(0), // Today
    startTime: '10:00',
    endTime: '10:30',
    type: 'teleconsult',
    status: 'scheduled',
    reasonForVisit: 'Severe cluster headache recurrence and visual aura changes',
    teleconsultUrl: 'https://carepulse.hospital/teleconsult/room-neur-4091',
    fee: 190,
    paid: true,
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'apt-4',
    appointmentNumber: 'APT-2026-1004',
    patientId: 'pat-3',
    patientName: 'Liam Gallagher',
    patientPhone: '+1 (555) 734-5678',
    patientEmail: 'liam.g@example.com',
    doctorId: 'doc-3',
    doctorName: 'David Chen',
    doctorSpecialization: 'Lead Pediatric Specialist',
    departmentId: 'dept-3',
    date: getDateString(1), // Tomorrow
    startTime: '10:00',
    endTime: '10:20',
    type: 'in-person',
    status: 'confirmed',
    reasonForVisit: '6-year developmental screening & booster vaccinations',
    fee: 140,
    paid: false,
    createdAt: '2026-10-26T16:20:00Z',
    updatedAt: '2026-10-26T16:20:00Z',
  },
  {
    id: 'apt-5',
    appointmentNumber: 'APT-2026-1005',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    patientPhone: '+1 (555) 912-3456',
    patientEmail: 'sarah.jenkins@example.com',
    doctorId: 'doc-5',
    doctorName: 'Sophia Sterling',
    doctorSpecialization: 'Chief of General Internal Medicine',
    departmentId: 'dept-5',
    date: getDateString(3),
    startTime: '11:00',
    endTime: '11:20',
    type: 'in-person',
    status: 'scheduled',
    reasonForVisit: 'Routine annual metabolic panel review & lipid profile discussion',
    fee: 130,
    paid: true,
    createdAt: '2026-10-27T12:00:00Z',
    updatedAt: '2026-10-27T12:00:00Z',
  },
  {
    id: 'apt-6',
    appointmentNumber: 'APT-2026-0988',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    patientPhone: '+1 (555) 912-3456',
    patientEmail: 'sarah.jenkins@example.com',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    doctorSpecialization: 'Senior Interventional Cardiologist',
    departmentId: 'dept-1',
    date: getDateString(-14),
    startTime: '14:00',
    endTime: '14:20',
    type: 'in-person',
    status: 'completed',
    reasonForVisit: 'Initial cardiovascular consultation & stress test booking',
    fee: 175,
    paid: true,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-14T14:25:00Z',
  },
  {
    id: 'apt-7',
    appointmentNumber: 'APT-2026-0950',
    patientId: 'pat-2',
    patientName: 'Robert Torres',
    patientPhone: '+1 (555) 823-4567',
    patientEmail: 'robert.torres@example.com',
    doctorId: 'doc-4',
    doctorName: 'Amara Okafor',
    doctorSpecialization: 'Orthopedic Surgeon & Arthroscopy Fellow',
    departmentId: 'dept-4',
    date: getDateString(-5),
    startTime: '11:00',
    endTime: '11:25',
    type: 'in-person',
    status: 'completed',
    reasonForVisit: 'Bilateral knee joint discomfort following stairs',
    fee: 165,
    paid: true,
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-10-23T11:30:00Z',
  },
];

const INITIAL_QUEUE_TOKENS: QueueToken[] = [
  {
    id: 'tok-1',
    appointmentId: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    departmentName: 'Cardiology',
    tokenNumber: 1,
    displayCode: 'CARD-001',
    status: 'in-consultation',
    checkInTime: '08:52 AM',
    calledTime: '09:02 AM',
    estimatedWaitMinutes: 0,
  },
  {
    id: 'tok-2',
    appointmentId: 'apt-2',
    patientId: 'pat-2',
    patientName: 'Robert Torres',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    departmentName: 'Cardiology',
    tokenNumber: 2,
    displayCode: 'CARD-002',
    status: 'waiting',
    checkInTime: '09:10 AM',
    estimatedWaitMinutes: 15,
  },
  {
    id: 'tok-3',
    appointmentId: 'apt-temp-3',
    patientId: 'pat-4',
    patientName: 'Chloe Montgomery',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    departmentName: 'Cardiology',
    tokenNumber: 3,
    displayCode: 'CARD-003',
    status: 'waiting',
    checkInTime: '09:18 AM',
    estimatedWaitMinutes: 35,
  },
];

const INITIAL_WAITING_LIST: WaitingListEntry[] = [
  {
    id: 'wait-1',
    patientId: 'pat-4',
    patientName: 'Chloe Montgomery',
    patientPhone: '+1 (555) 645-6789',
    patientEmail: 'chloe.m@example.com',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    departmentId: 'dept-1',
    preferredDate: getDateString(1),
    preferredTimeRange: 'morning',
    requestedAt: '2026-10-27T15:20:00Z',
    status: 'pending',
  },
  {
    id: 'wait-2',
    patientId: 'pat-2',
    patientName: 'Robert Torres',
    patientPhone: '+1 (555) 823-4567',
    patientEmail: 'robert.torres@example.com',
    doctorId: 'doc-2',
    doctorName: 'Elena Rostova',
    departmentId: 'dept-2',
    preferredDate: getDateString(2),
    preferredTimeRange: 'afternoon',
    requestedAt: '2026-10-28T08:10:00Z',
    status: 'pending',
  },
];

const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'cons-1',
    appointmentId: 'apt-6',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    date: getDateString(-14),
    vitals: {
      bloodPressure: '128/82',
      heartRate: 74,
      temperature: 98.4,
      weightKg: 64.2,
      spo2: 99,
    },
    symptoms: ['Exertional palpitations', 'Mild ankle edema after standing', 'Occasional fatigue'],
    diagnosis: 'Mild Sinus Tachycardia with early essential hypertension',
    clinicalNotes: 'Cardiac auscultation normal S1/S2 without murmurs. Lungs clear to percussion and auscultation. Recommended low sodium Mediterranean diet and baseline lipid/cardiac marker profile.',
    treatmentPlan: 'Maintain hydration, initiate Metoprolol Succinate 25mg daily, repeat ECG and 2D-Echo in 2 weeks.',
    followUpDate: getDateString(0),
    prescriptions: [
      {
        id: 'rx-1',
        medicationName: 'Metoprolol Succinate ER',
        dosage: '25mg',
        frequency: 'Once daily in the morning',
        durationDays: 30,
        instructions: 'Take with food or immediately after breakfast. Do not abruptly discontinue.',
      },
      {
        id: 'rx-2',
        medicationName: 'CoQ10 Cardiovascular Support',
        dosage: '100mg',
        frequency: 'Once daily',
        durationDays: 60,
        instructions: 'Dietary antioxidant supplement for mitochondrial myocardial support.',
      },
    ],
    createdAt: '2026-10-14T14:25:00Z',
  },
];

const INITIAL_LAB_REPORTS: LabReport[] = [
  {
    id: 'lab-1',
    reportNumber: 'LAB-2026-8801',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    testName: 'Comprehensive Metabolic Panel (CMP-14) & Lipid Profile',
    category: 'Biochemistry',
    testDate: getDateString(-10),
    status: 'completed',
    resultsSummary: 'Total Cholesterol: 198 mg/dL (Normal). LDL: 112 mg/dL. HDL: 58 mg/dL. Fasting Glucose: 92 mg/dL. Kidney Function (eGFR): >90 mL/min.',
    fileUrl: '#mock-file-cmp',
    fileName: 'sarah_jenkins_cmp_lipid_oct2026.pdf',
    fileSizeBytes: 245000,
    criticalValuesFlag: false,
    referenceRanges: 'Cholesterol <200 mg/dL, Fasting Glucose 70-99 mg/dL',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'lab-2',
    reportNumber: 'LAB-2026-8802',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    doctorId: 'doc-1',
    doctorName: 'Marcus Vance',
    testName: 'Transthoracic 2D Doppler Echocardiogram',
    category: 'Cardiology',
    testDate: getDateString(-3),
    status: 'reviewed',
    resultsSummary: 'Left Ventricular Ejection Fraction (LVEF): 62% (Preserved). No regional wall motion abnormalities. Normal valvular hemodynamics.',
    fileUrl: '#mock-file-echo',
    fileName: 'sarah_jenkins_echo_doppler_oct2026.pdf',
    fileSizeBytes: 1820000,
    criticalValuesFlag: false,
    referenceRanges: 'Normal LVEF: 55-70%',
    createdAt: '2026-10-25T16:00:00Z',
  },
  {
    id: 'lab-3',
    reportNumber: 'LAB-2026-8803',
    patientId: 'pat-2',
    patientName: 'Robert Torres',
    doctorId: 'doc-5',
    doctorName: 'Sophia Sterling',
    testName: 'Hemoglobin A1c & Renal Microalbuminuria Screen',
    category: 'Biochemistry',
    testDate: getDateString(-7),
    status: 'completed',
    resultsSummary: 'HbA1c: 6.8% (Target < 7.0% for controlled diabetes). Serum Creatinine: 1.05 mg/dL. Microalbumin: Negative.',
    fileUrl: '#mock-file-a1c',
    fileName: 'robert_torres_hba1c_oct2026.pdf',
    fileSizeBytes: 310000,
    criticalValuesFlag: false,
    referenceRanges: 'Target HbA1c < 7.0%',
    createdAt: '2026-10-21T09:30:00Z',
  },
  {
    id: 'lab-4',
    reportNumber: 'LAB-2026-8804',
    patientId: 'pat-4',
    patientName: 'Chloe Montgomery',
    doctorId: 'doc-2',
    doctorName: 'Elena Rostova',
    testName: 'High-Resolution Brain MRI with Contrast',
    category: 'Radiology',
    testDate: getDateString(-2),
    status: 'reviewed',
    resultsSummary: 'No acute intracranial pathology. Ventricles and sulci normal for age. No signs of aneurysm or space-occupying lesions.',
    fileUrl: '#mock-file-mri',
    fileName: 'chloe_montgomery_brain_mri_oct2026.pdf',
    fileSizeBytes: 4200000,
    criticalValuesFlag: false,
    referenceRanges: 'Intact cerebrovascular anatomy',
    createdAt: '2026-10-26T14:15:00Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-pat-1',
    title: 'Appointment Confirmed Today',
    message: 'Your cardiology consultation with Dr. Marcus Vance is scheduled for 09:00 AM today at Room A-304.',
    type: 'booking_confirmed',
    read: false,
    link: '/appointments',
    createdAt: '2026-10-28T07:30:00Z',
    emailSent: false,
    emailStatus: 'unconfigured',
  },
  {
    id: 'notif-2',
    userId: 'user-pat-1',
    title: 'Diagnostic Report Available',
    message: 'Your Transthoracic 2D Doppler Echocardiogram results have been reviewed and uploaded to your vault.',
    type: 'lab_ready',
    read: true,
    link: '/lab-reports',
    createdAt: '2026-10-25T16:15:00Z',
    emailSent: false,
    emailStatus: 'unconfigured',
  },
  {
    id: 'notif-3',
    userId: 'user-doc-1',
    title: 'Patient Queue Activated',
    message: 'Patient Sarah Jenkins has checked in and is currently inside consultation room A-304.',
    type: 'queue_update',
    read: false,
    link: '/queue',
    createdAt: '2026-10-28T08:55:00Z',
    emailSent: false,
    emailStatus: 'unconfigured',
  },
  {
    id: 'notif-4',
    userId: 'user-admin-1',
    title: 'Leave Request Approved',
    message: 'Dr. Marcus Vance scheduled leave for Cardiology World Congress (Nov 10-12, 2026).',
    type: 'doctor_leave',
    read: true,
    link: '/schedules',
    createdAt: '2026-10-15T10:05:00Z',
    emailSent: false,
    emailStatus: 'unconfigured',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-28T08:52:10Z',
    actorId: 'user-pat-1',
    actorName: 'Sarah Jenkins',
    actorRole: 'patient',
    action: 'QUEUE_TOKEN_CALLED',
    resourceType: 'QueueToken',
    resourceId: 'tok-1',
    description: 'Patient checked in at self-kiosk; Queue Token #1 (CARD-001) generated.',
    ipAddress: '192.168.10.45',
    severity: 'info',
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-28T09:02:44Z',
    actorId: 'user-doc-1',
    actorName: 'Dr. Marcus Vance',
    actorRole: 'doctor',
    action: 'APPOINTMENT_UPDATE',
    resourceType: 'Appointment',
    resourceId: 'apt-1',
    description: 'Status transitioned from scheduled to in-consultation for APT-2026-1001.',
    ipAddress: '10.0.4.12',
    severity: 'info',
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-27T10:00:15Z',
    actorId: 'user-pat-4',
    actorName: 'Chloe Montgomery',
    actorRole: 'patient',
    action: 'APPOINTMENT_CREATE',
    resourceType: 'Appointment',
    resourceId: 'apt-3',
    description: 'Teleconsultation booked for Neurology with Dr. Elena Rostova.',
    ipAddress: '172.56.21.90',
    severity: 'info',
  },
  {
    id: 'aud-4',
    timestamp: '2026-10-26T16:20:00Z',
    actorId: 'user-admin-1',
    actorName: 'Alexander Cross',
    actorRole: 'admin',
    action: 'SCHEDULE_MODIFIED',
    resourceType: 'Doctor',
    resourceId: 'doc-3',
    description: 'Adjusted default slot duration from 15m to 20m for Pediatrics.',
    ipAddress: '10.0.1.1',
    severity: 'warning',
  },
  {
    id: 'aud-5',
    timestamp: '2026-10-25T16:00:00Z',
    actorId: 'user-doc-1',
    actorName: 'Dr. Marcus Vance',
    actorRole: 'doctor',
    action: 'LAB_REPORT_UPLOADED',
    resourceType: 'LabReport',
    resourceId: 'lab-2',
    description: 'Uploaded verified 2D Echocardiogram result for patient Sarah Jenkins.',
    ipAddress: '10.0.4.12',
    severity: 'info',
  },
];

const INITIAL_SETTINGS: SystemSetting = {
  id: 'setting-1',
  hospitalName: 'CarePulse University Medical Center',
  hospitalAddress: '1000 Medical Center Parkway, Metro City, CA 90210',
  contactEmail: 'contact@carepulse.hospital',
  contactPhone: '+1 (800) 555-CARE',
  defaultSlotDurationMinutes: 20,
  defaultBufferMinutes: 5,
  maxAdvanceBookingDays: 60,
  cancellationCutoffHours: 4,
  allowPatientCancellation: true,
  requirePrepayment: false,
  autoCallNextToken: false,
  teleconsultationProvider: 'Integrated Secure WebRTC Desk',
  emailNotificationsEnabled: false, // marked as unconfigured
  maintenanceMode: false,
};

/**
 * Storage Controller Class
 */
class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetAllToDemoData();
    }
  }

  public resetAllToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.DOCTOR_LEAVES, JSON.stringify(INITIAL_LEAVES));
    localStorage.setItem(STORAGE_KEYS.QUEUE_TOKENS, JSON.stringify(INITIAL_QUEUE_TOKENS));
    localStorage.setItem(STORAGE_KEYS.WAITING_LIST, JSON.stringify(INITIAL_WAITING_LIST));
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
    localStorage.setItem(STORAGE_KEYS.LAB_REPORTS, JSON.stringify(INITIAL_LAB_REPORTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save failed:', e);
    }
  }

  // --- Users & Patients ---
  getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getPatients(): Patient[] {
    return this.getItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find((p) => p.id === id || p.userId === id);
  }

  savePatient(patient: Patient): void {
    const list = this.getPatients();
    const idx = list.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      list[idx] = patient;
    } else {
      list.unshift(patient);
    }
    this.setItem(STORAGE_KEYS.PATIENTS, list);
  }

  // --- Doctors & Departments ---
  getDoctors(): Doctor[] {
    return this.getItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id || d.userId === id);
  }

  saveDoctor(doctor: Doctor): void {
    const list = this.getDoctors();
    const idx = list.findIndex((d) => d.id === doctor.id);
    if (idx >= 0) {
      list[idx] = doctor;
    } else {
      list.push(doctor);
    }
    this.setItem(STORAGE_KEYS.DOCTORS, list);
  }

  getDepartments(): Department[] {
    return this.getItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  saveDepartment(dept: Department): void {
    const list = this.getDepartments();
    const idx = list.findIndex((d) => d.id === dept.id);
    if (idx >= 0) {
      list[idx] = dept;
    } else {
      list.push(dept);
    }
    this.setItem(STORAGE_KEYS.DEPARTMENTS, list);
  }

  deleteDepartment(id: string): void {
    const list = this.getDepartments().filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.DEPARTMENTS, list);
  }

  // --- Leaves ---
  getDoctorLeaves(): DoctorLeave[] {
    return this.getItem(STORAGE_KEYS.DOCTOR_LEAVES, INITIAL_LEAVES);
  }

  addDoctorLeave(leave: Omit<DoctorLeave, 'id' | 'createdAt'>): DoctorLeave {
    const list = this.getDoctorLeaves();
    const newLeave: DoctorLeave = {
      ...leave,
      id: `leave-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newLeave);
    this.setItem(STORAGE_KEYS.DOCTOR_LEAVES, list);
    return newLeave;
  }

  cancelDoctorLeave(id: string): void {
    const list = this.getDoctorLeaves().filter((l) => l.id !== id);
    this.setItem(STORAGE_KEYS.DOCTOR_LEAVES, list);
  }

  // --- Appointments ---
  getAppointments(): Appointment[] {
    return this.getItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.getAppointments().find((a) => a.id === id);
  }

  createAppointment(apptData: Omit<Appointment, 'id' | 'appointmentNumber' | 'createdAt' | 'updatedAt'>): Appointment {
    const list = this.getAppointments();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppt: Appointment = {
      ...apptData,
      id: `apt-${Date.now()}`,
      appointmentNumber: `APT-2026-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newAppt);
    this.setItem(STORAGE_KEYS.APPOINTMENTS, list);

    // Record Audit
    this.recordAudit({
      actorId: newAppt.patientId,
      actorName: newAppt.patientName,
      actorRole: 'patient',
      action: 'APPOINTMENT_CREATE',
      resourceType: 'Appointment',
      resourceId: newAppt.id,
      description: `Created appointment ${newAppt.appointmentNumber} with Dr. ${newAppt.doctorName} on ${newAppt.date} at ${newAppt.startTime}.`,
      severity: 'info',
    });

    // Create Notification
    this.createNotification({
      userId: newAppt.patientId,
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${newAppt.doctorName} on ${newAppt.date} at ${newAppt.startTime} has been scheduled. Ref: ${newAppt.appointmentNumber}`,
      type: 'booking_confirmed',
      read: false,
      link: '/appointments',
    });

    return newAppt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>, actor?: { id: string; name: string; role: any }): Appointment | null {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const old = list[idx];
    const updated = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.setItem(STORAGE_KEYS.APPOINTMENTS, list);

    if (actor) {
      this.recordAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: updates.status === 'cancelled' ? 'APPOINTMENT_CANCEL' : 'APPOINTMENT_UPDATE',
        resourceType: 'Appointment',
        resourceId: id,
        description: `Updated appointment ${updated.appointmentNumber}: ${JSON.stringify(updates)}`,
        severity: updates.status === 'cancelled' ? 'warning' : 'info',
      });
    }

    // Check if slot cancellation frees up a slot for waiting list
    if (updates.status === 'cancelled') {
      this.checkWaitingListForSlot(old.doctorId, old.date, old.startTime, old.endTime);
    }

    return updated;
  }

  // --- Queue & Tokens ---
  getQueueTokens(): QueueToken[] {
    return this.getItem(STORAGE_KEYS.QUEUE_TOKENS, INITIAL_QUEUE_TOKENS);
  }

  checkInAndGenerateToken(appointmentId: string): QueueToken | null {
    const appt = this.getAppointmentById(appointmentId);
    if (!appt) return null;

    const tokens = this.getQueueTokens();
    const existing = tokens.find((t) => t.appointmentId === appointmentId);
    if (existing) return existing;

    const dept = this.getDepartments().find((d) => d.id === appt.departmentId);
    const codePrefix = dept ? dept.code : 'GEN';
    
    // Count tokens today for this department/doctor
    const count = tokens.filter((t) => t.doctorId === appt.doctorId).length + 1;
    const displayCode = `${codePrefix}-${count.toString().padStart(3, '0')}`;

    const waitingTokens = tokens.filter((t) => t.doctorId === appt.doctorId && t.status === 'waiting');
    const estimatedWaitMinutes = waitingTokens.length * 18;

    const newToken: QueueToken = {
      id: `tok-${Date.now()}`,
      appointmentId: appt.id,
      patientId: appt.patientId,
      patientName: appt.patientName,
      doctorId: appt.doctorId,
      doctorName: appt.doctorName,
      departmentName: dept?.name || 'General',
      tokenNumber: count,
      displayCode,
      status: 'waiting',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes,
    };

    tokens.push(newToken);
    this.setItem(STORAGE_KEYS.QUEUE_TOKENS, tokens);

    // Update appointment
    this.updateAppointment(appt.id, {
      queueTokenId: newToken.id,
      tokenNumber: newToken.tokenNumber,
      status: 'confirmed',
    });

    this.recordAudit({
      actorId: appt.patientId,
      actorName: appt.patientName,
      actorRole: 'patient',
      action: 'QUEUE_TOKEN_CALLED',
      resourceType: 'QueueToken',
      resourceId: newToken.id,
      description: `Patient checked in. Assigned Token ${displayCode}. Estimated wait: ${estimatedWaitMinutes}m.`,
      severity: 'info',
    });

    return newToken;
  }

  callNextToken(doctorId: string): QueueToken | null {
    const tokens = this.getQueueTokens();
    const waitingIdx = tokens.findIndex((t) => t.doctorId === doctorId && t.status === 'waiting');
    if (waitingIdx === -1) return null;

    // Mark previous in-consultation as completed
    tokens.forEach((t) => {
      if (t.doctorId === doctorId && t.status === 'in-consultation') {
        t.status = 'completed';
        t.completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    });

    const targetToken = tokens[waitingIdx];
    targetToken.status = 'in-consultation';
    targetToken.calledTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    targetToken.estimatedWaitMinutes = 0;

    // Recalculate estimated wait for remaining waiting tokens
    let waitCount = 0;
    tokens.forEach((t) => {
      if (t.doctorId === doctorId && t.status === 'waiting') {
        waitCount++;
        t.estimatedWaitMinutes = waitCount * 18;
      }
    });

    this.setItem(STORAGE_KEYS.QUEUE_TOKENS, tokens);

    // Update corresponding appointment
    if (targetToken.appointmentId) {
      this.updateAppointment(targetToken.appointmentId, {
        status: 'in-consultation',
      });
    }

    this.recordAudit({
      actorId: doctorId,
      actorName: targetToken.doctorName,
      actorRole: 'doctor',
      action: 'QUEUE_TOKEN_CALLED',
      resourceType: 'QueueToken',
      resourceId: targetToken.id,
      description: `Doctor called Token ${targetToken.displayCode} (${targetToken.patientName}) into consultation.`,
      severity: 'info',
    });

    return targetToken;
  }

  updateTokenStatus(tokenId: string, status: QueueToken['status']): void {
    const tokens = this.getQueueTokens();
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;

    token.status = status;
    if (status === 'completed') {
      token.completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (token.appointmentId) {
        this.updateAppointment(token.appointmentId, { status: 'completed' });
      }
    }
    this.setItem(STORAGE_KEYS.QUEUE_TOKENS, tokens);
  }

  // --- Waiting List ---
  getWaitingList(): WaitingListEntry[] {
    return this.getItem(STORAGE_KEYS.WAITING_LIST, INITIAL_WAITING_LIST);
  }

  addToWaitingList(entry: Omit<WaitingListEntry, 'id' | 'requestedAt' | 'status'>): WaitingListEntry {
    const list = this.getWaitingList();
    const newEntry: WaitingListEntry = {
      ...entry,
      id: `wait-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    list.unshift(newEntry);
    this.setItem(STORAGE_KEYS.WAITING_LIST, list);

    this.createNotification({
      userId: entry.patientId,
      title: 'Added to Waiting List',
      message: `You've joined the priority waiting list for Dr. ${entry.doctorName || 'Specialist'} on ${entry.preferredDate}. You will be alerted immediately when a slot opens!`,
      type: 'waitlist_available',
      read: false,
      link: '/waiting-list',
    });

    return newEntry;
  }

  checkWaitingListForSlot(doctorId: string, date: string, startTime: string, endTime: string): void {
    const list = this.getWaitingList();
    const candidate = list.find(
      (w) =>
        w.status === 'pending' &&
        w.preferredDate === date &&
        (!w.doctorId || w.doctorId === doctorId)
    );

    if (candidate) {
      candidate.status = 'notified';
      candidate.notifiedAt = new Date().toISOString();
      candidate.matchedSlot = { date, startTime, endTime };
      this.setItem(STORAGE_KEYS.WAITING_LIST, list);

      // Create notification
      this.createNotification({
        userId: candidate.patientId,
        title: 'Slot Available from Waiting List!',
        message: `A cancelled slot with Dr. ${candidate.doctorName || 'your requested specialist'} on ${date} at ${startTime} has opened up. Click here to confirm!`,
        type: 'waitlist_available',
        read: false,
        link: `/book?doctorId=${doctorId}&date=${date}&time=${startTime}`,
      });

      this.recordAudit({
        actorId: 'system',
        actorName: 'Deterministic Smart Scheduler',
        actorRole: 'admin',
        action: 'WAITLIST_MATCHED',
        resourceType: 'WaitingListEntry',
        resourceId: candidate.id,
        description: `Matched newly freed slot (${date} ${startTime}) to waiting-list patient ${candidate.patientName}.`,
        severity: 'info',
      });
    }
  }

  // --- Consultations & Prescriptions ---
  getConsultations(): Consultation[] {
    return this.getItem(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
  }

  saveConsultation(consultation: Omit<Consultation, 'id' | 'createdAt'>): Consultation {
    const list = this.getConsultations();
    const newCons: Consultation = {
      ...consultation,
      id: `cons-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newCons);
    this.setItem(STORAGE_KEYS.CONSULTATIONS, list);

    // Update appointment status to completed
    if (newCons.appointmentId) {
      this.updateAppointment(newCons.appointmentId, { status: 'completed' });
    }

    this.recordAudit({
      actorId: newCons.doctorId,
      actorName: 'Attending Doctor',
      actorRole: 'doctor',
      action: 'CONSULTATION_NOTE_SAVED',
      resourceType: 'Consultation',
      resourceId: newCons.id,
      description: `Saved clinical notes & diagnosis: ${newCons.diagnosis} for patient ${newCons.patientId}.`,
      severity: 'info',
    });

    return newCons;
  }

  // --- Lab Reports ---
  getLabReports(): LabReport[] {
    return this.getItem(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
  }

  saveLabReport(report: Omit<LabReport, 'id' | 'createdAt' | 'reportNumber'>): LabReport {
    const list = this.getLabReports();
    const num = Math.floor(1000 + Math.random() * 9000);
    const newReport: LabReport = {
      ...report,
      id: `lab-${Date.now()}`,
      reportNumber: `LAB-2026-${num}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReport);
    this.setItem(STORAGE_KEYS.LAB_REPORTS, list);

    this.recordAudit({
      actorId: report.doctorId,
      actorName: report.doctorName,
      actorRole: 'doctor',
      action: 'LAB_REPORT_UPLOADED',
      resourceType: 'LabReport',
      resourceId: newReport.id,
      description: `Uploaded ${newReport.testName} (${newReport.reportNumber}) for patient ${newReport.patientName}.`,
      severity: newReport.criticalValuesFlag ? 'critical' : 'info',
    });

    this.createNotification({
      userId: report.patientId,
      title: 'New Diagnostic Report Ready',
      message: `Your ${report.testName} report has been filed and is ready to view.`,
      type: 'lab_ready',
      read: false,
      link: '/lab-reports',
    });

    return newReport;
  }

  // --- Notifications ---
  getNotifications(): Notification[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  createNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const list = this.getNotifications();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      emailSent: false,
      emailStatus: 'unconfigured', // as required by spec: clearly label unconfigured email delivery
    };
    list.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  recordAudit(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || '127.0.0.1 (Local Client)',
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- System Settings ---
  getSystemSettings(): SystemSetting {
    return this.getItem(STORAGE_KEYS.SYSTEM_SETTINGS, INITIAL_SETTINGS);
  }

  saveSystemSettings(settings: SystemSetting, actor?: { id: string; name: string; role: any }): void {
    this.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, settings);
    if (actor) {
      this.recordAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'SYSTEM_SETTINGS_UPDATED',
        resourceType: 'SystemSetting',
        resourceId: settings.id,
        description: 'Hospital administrative operational parameters updated.',
        severity: 'warning',
      });
    }
  }
}

export const storage = new StorageService();
