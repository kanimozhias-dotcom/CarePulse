# CarePulse — Intelligent Healthcare Appointment & Patient Management System

A production-grade, full-stack hospital management and outpatient scheduling platform inspired by platforms like Hospitalo. Built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, **Recharts**, and an **Express/MongoDB** architecture.

---

## 🌟 Key Architecture & 11 Operational Modules

1. **Module 1: Clinician Directory & Smart Booking**
   - Multi-criteria specialist filtering (department, subspecialty, date, modality, consult fee).
   - Real-time discrete slot calculation with clinic buffer management (5–15 mins).
   - Immediate conflict diagnostics and smart alternative slot recommendations.
2. **Module 2: Digital Queue & Token Tracker**
   - Kiosk self-service check-in generating unique department tokens (e.g. `CARD-001`).
   - Live waiting estimations based on consultation pace and queue depth.
   - Physician token calling with instant audio/visual broadcast cues.
3. **Module 3: Clinical Desk & Teleconsult**
   - Outpatient examination desk for attending physicians.
   - Objective vitals capture (Blood Pressure, Heart Rate, Temp, Weight, SpO2).
   - ICD diagnosis, subjective clinical notes, treatment plans, and digital prescription builder (Rx).
   - Simulated WebRTC teleconsultation room with encrypted streaming, camera, and microphone controls.
4. **Module 4: Lab & Diagnostics Vault**
   - Encrypted diagnostic repository (Hematology, Biochemistry, Radiology, Microbiology, Pathology).
   - Critical value emergency flagging and standard reference range comparison.
   - Role-protected document viewing and verified PDF download simulation.
5. **Module 5: Clinician Schedule & Leave Roster**
   - Granular doctor shift configuration (start time, end time, slot durations, clinic buffers).
   - Leave period manager blocking date ranges and flagging conflicting existing appointments.
6. **Module 6: Hospital Analytics & Workload**
   - Outpatient census KPIs: Total patients, consultations, completion velocity, revenue, and cancellation rates.
   - Visual charts powered by Recharts (Daily booking trends, status distribution, doctor workload).
   - One-click CSV operational report export.
7. **Module 7: Security & RBAC System Audit Trail**
   - Immutable security audit log tracking actor identity, role, timestamp, IP address, and resource target.
   - Zero-knowledge clinical isolation (passwords, JWTs, and sensitive medical text never logged in plaintext).
8. **Module 8: Waiting-List & Smart Conflict Diagnostics**
   - Deterministic matching engine automatically allocating newly cancelled slots to eligible waitlist patients.
   - Detailed diagnostics for double bookings, leave conflicts, and out-of-shift requests.
9. **Module 9: Patient Management & EMR Registry**
   - Demographic records with deduplication guard (prevents duplicate MRNs by phone and email).
   - Documented drug and food allergies flagged to doctors during clinical encounters.
   - Emergency contact directory and historical appointment timeline.
10. **Module 10: Notifications & Reminders Hub**
    - High-visibility in-app notification center for confirmations, cancellations, and queue updates.
    - Transparent email delivery status indicators (`in-app active`, `SMTP relay: unconfigured`).
11. **Module 11: Admin & Hospital Operational Settings**
    - Hospital cancellation policies (cutoff grace hours, self-service cancellation rights).
    - Clinical department manager and real-time infrastructure uptime health monitors.

---

## 👥 Three Comprehensive User Roles

- **Patient** (`Sarah Jenkins`): Browse specialists, book slots, check in for queue tokens, review diagnoses, prescriptions, and lab documents.
- **Doctor** (`Dr. Marcus Vance`): Call queue tokens, log vitals, record ICD diagnoses, write prescriptions, manage weekly roster and leave requests.
- **Administrator** (`Alexander Cross`): Master overview, manage doctors, departments, system settings, conflict resolution, workload analytics, and security audit logs.
- *Tip: Use the persona switcher pill in the top navbar to instantly test any role without re-authenticating.*

---

## 🛠️ Local Installation & Execution

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional for standalone Express server, local or MongoDB Atlas)

### 2. Frontend Development Server
The frontend is pre-configured with client-side state persistence in `localStorage`, meaning all appointments, tokens, records, and audit logs are fully interactive immediately without any external database daemon.

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Backend Express Server (Standalone)
To run the dedicated Express REST API server:

```bash
# Configure .env from .env.example
cp .env.example .env

# Run standalone API server
npx tsx server/index.ts
```
The Express API starts on [http://localhost:5000](http://localhost:5000) with endpoints for `/api/auth`, `/api/doctors`, `/api/appointments`, `/api/queue`, and `/api/health`.

---

## 📊 Database Models (16 Mongoose Schemas)
Defined in `server/models/schemas.ts`:
1. `User` (Authentication, roles, bcrypt hash)
2. `Patient` (MRN, demographics, blood group, allergies, emergency contacts)
3. `Doctor` (Department reference, credentials, fees, shift hours, buffer)
4. `Department` (Code, title, location, head of department)
5. `DoctorLeave` (Date range, reason, approval)
6. `Appointment` (Reference number, status, patient/doctor ref, modality, fee)
7. `QueueToken` (Display code, sequence number, estimated wait, check-in time)
8. `WaitingListEntry` (Target date, time window, status, matched slot)
9. `Consultation` (Vitals, subjective notes, ICD diagnosis, treatment plan)
10. `Prescription` (Medication name, dosage, frequency, duration, instructions)
11. `LabReport` (Discipline category, test title, critical values, PDF link)
12. `Notification` (Type, message, read flag, delivery status)
13. `AuditLog` (Actor, action, resource, severity, IP address, timestamp)
14. `SystemSetting` (Cancellation window, max advance booking, slot defaults)

---

## 🧪 Verified Test Scenarios

- **Valid & Conflict Booking**: Attempting to book outside a clinician's working hours or during approved leave raises deterministic conflict diagnostics and presents smart alternatives.
- **Double-Booking Shield**: Server re-validates availability upon submission to prevent concurrent race conditions.
- **Queue Check-In**: Checking in an appointment issues a unique department token (e.g. `CARD-001`) and computes wait estimations.
- **Waiting-List Slot Release**: Cancelling an appointment matches the freed slot with waiting-list patients and dispatches an alert.
