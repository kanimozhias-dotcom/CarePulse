/**
 * CarePulse - Intelligent Healthcare Appointment and Patient Management System
 * Inspired by modern hospital management platforms such as Hospitalo.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BookingWizardModal } from './components/modules/BookingWizardModal';
import { ClinicianDirectory } from './components/modules/ClinicianDirectory';
import { QueueTracker } from './components/modules/QueueTracker';
import { ClinicalDesk } from './components/modules/ClinicalDesk';
import { LabVault } from './components/modules/LabVault';
import { ScheduleRoster } from './components/modules/ScheduleRoster';
import { HospitalAnalytics } from './components/modules/HospitalAnalytics';
import { AuditLogViewer } from './components/modules/AuditLogViewer';
import { WaitingListManager } from './components/modules/WaitingListManager';
import { PatientManagement } from './components/modules/PatientManagement';
import { NotificationCenter } from './components/modules/NotificationCenter';
import { AdminSettings } from './components/modules/AdminSettings';
import { PatientDashboard } from './components/modules/PatientDashboard';
import { DoctorDashboard } from './components/modules/DoctorDashboard';
import { AdminDashboard } from './components/modules/AdminDashboard';
import { MyAppointments } from './components/modules/MyAppointments';
import { MyMedicalRecords } from './components/modules/MyMedicalRecords';
import { DoctorManagement } from './components/modules/DoctorManagement';
import { AppointmentManagement } from './components/modules/AppointmentManagement';
import { UserProfileSettings } from './components/modules/UserProfileSettings';
import { LandingPage } from './components/modules/LandingPage';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { storage } from './services/storage';

function MainApp() {
  const { role, user } = useAuth();
  const { showToast } = useNotification();

  // Active view state
  const [activeView, setActiveView] = useState<string>(() => {
    if (role === 'patient') return 'patient-dashboard';
    if (role === 'doctor') return 'doctor-dashboard';
    return 'admin-dashboard';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | undefined>(undefined);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleOpenBooking = (doctorId?: string) => {
    setBookingDoctorId(doctorId);
    setShowBookingModal(true);
  };

  const handleResetData = () => {
    storage.resetAllToDemoData();
    setShowResetConfirm(false);
    showToast('success', 'Database Reset', 'Demo hospital clinical records restored to factory default.');
    // Trigger re-render by staying on current view
    setActiveView('patient-dashboard');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return (
          <LandingPage
            onBookNow={() => handleOpenBooking()}
            onExploreDoctors={() => setActiveView('doctors')}
            onTrackQueue={() => setActiveView('queue')}
            onGoToDashboard={() => {
              if (role === 'patient') setActiveView('patient-dashboard');
              else if (role === 'doctor') setActiveView('doctor-dashboard');
              else setActiveView('admin-dashboard');
            }}
          />
        );

      case 'patient-dashboard':
        return (
          <PatientDashboard
            onBookAppointment={() => handleOpenBooking()}
            onNavigate={(view) => setActiveView(view)}
          />
        );

      case 'doctor-dashboard':
        return (
          <DoctorDashboard
            onNavigate={(view) => setActiveView(view)}
          />
        );

      case 'admin-dashboard':
        return (
          <AdminDashboard
            onNavigate={(view) => setActiveView(view)}
          />
        );

      case 'doctors':
        return (
          <ClinicianDirectory
            onBookDoctor={(docId) => handleOpenBooking(docId)}
          />
        );

      case 'queue':
        return <QueueTracker />;

      case 'clinical-desk':
        return <ClinicalDesk />;

      case 'my-appointments':
        return (
          <MyAppointments
            onBookAppointment={() => handleOpenBooking()}
            onNavigate={(view) => setActiveView(view)}
          />
        );

      case 'my-records':
        return <MyMedicalRecords />;

      case 'lab-reports':
        return <LabVault />;

      case 'schedules':
        return <ScheduleRoster />;

      case 'analytics':
        return <HospitalAnalytics />;

      case 'waiting-list':
        return <WaitingListManager />;

      case 'patient-management':
        return <PatientManagement />;

      case 'doctor-management':
        return <DoctorManagement />;

      case 'appointment-management':
        return <AppointmentManagement />;

      case 'notifications':
        return <NotificationCenter onNavigate={(view) => setActiveView(view)} />;

      case 'audit-logs':
        return <AuditLogViewer />;

      case 'settings':
        return <AdminSettings onResetAllData={() => setShowResetConfirm(true)} />;

      case 'profile':
        return <UserProfileSettings />;

      default:
        return (
          <PatientDashboard
            onBookAppointment={() => handleOpenBooking()}
            onNavigate={(view) => setActiveView(view)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main Workspace: Sidebar + Dynamic Content Container */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onResetData={() => setShowResetConfirm(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        initialDoctorId={bookingDoctorId}
        onSuccess={(apptId) => {
          // If in patient view, refresh
        }}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Demo Healthcare Database?"
        message="This will repopulate all 11 modules with standard demonstration records (patients, clinicians, appointments, tokens, lab files, and audit logs). Any custom entries made in this session will be restored."
        confirmLabel="Reset to Default Demo State"
        variant="warning"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
