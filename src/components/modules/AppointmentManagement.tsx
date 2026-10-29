import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  Eye, 
  User, 
  Stethoscope
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState<Appointment[]>(() => storage.getAppointments());
  const doctors = useMemo(() => storage.getDoctors(), []);
  const departments = useMemo(() => storage.getDepartments(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
      const matchesDept = selectedDept === 'all' || a.departmentId === selectedDept;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [appointments, searchTerm, selectedStatus, selectedDept]);

  const handleStatusChange = (apptId: string, newStatus: AppointmentStatus) => {
    storage.updateAppointment(apptId, { status: newStatus }, {
      id: user?.id || 'admin',
      name: user?.name || 'Administrator',
      role: 'admin',
    });
    setAppointments(storage.getAppointments());
    showToast('success', 'Status Updated', `Appointment transitioned to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Master Appointment Operations</h2>
            <Badge variant="teal" size="sm">Admin Portal</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global scheduling ledger across all outpatient specialties, conflict resolution, and status management.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
          {filteredAppointments.length} Appointments Found
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference, patient name, or doctor..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-consultation">In-Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Master Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3.5 pl-4">Booking Ref</th>
                <th className="py-3.5">Patient Details</th>
                <th className="py-3.5">Attending Doctor</th>
                <th className="py-3.5">Date & Time Slot</th>
                <th className="py-3.5">Modality</th>
                <th className="py-3.5">Status Lifecycle</th>
                <th className="py-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {appt.appointmentNumber}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{appt.patientName}</div>
                      <div className="text-[10px] text-slate-400">{appt.patientPhone}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">Dr. {appt.doctorName}</div>
                      <div className="text-[10px] text-teal-600">{appt.doctorSpecialization}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-800">{appt.date}</div>
                      <div className="text-[11px] text-slate-400">{appt.startTime} - {appt.endTime}</div>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={appt.type === 'teleconsult' ? 'purple' : 'teal'} size="sm">
                        {appt.type}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value as any)}
                        className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-consultation">In-Consultation</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-Show</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-right pr-4">
                      <button
                        onClick={() => setDetailAppt(appt)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="View Full Booking Record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {detailAppt && (
        <Modal
          isOpen={!!detailAppt}
          onClose={() => setDetailAppt(null)}
          title={`Booking File: ${detailAppt.appointmentNumber}`}
          subtitle={`Created on: ${new Date(detailAppt.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium">Patient:</span>
                <p className="font-bold text-slate-900">{detailAppt.patientName}</p>
                <p className="text-[11px] text-slate-500">{detailAppt.patientEmail} • {detailAppt.patientPhone}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Clinician:</span>
                <p className="font-bold text-slate-900">Dr. {detailAppt.doctorName}</p>
                <p className="text-[11px] text-teal-600">{detailAppt.doctorSpecialization}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date & Slot:</span>
                <p className="font-bold text-slate-900">{detailAppt.date} ({detailAppt.startTime} - {detailAppt.endTime})</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Fee & Billing:</span>
                <p className="font-bold text-emerald-700">${detailAppt.fee} (Paid)</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Reason for Encounter:</span>
              <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed">
                {detailAppt.reasonForVisit}
              </p>
            </div>

            {detailAppt.teleconsultUrl && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-mono text-[11px] break-all">
                <span className="font-bold block font-sans">Teleconsult Link:</span>
                {detailAppt.teleconsultUrl}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDetailAppt(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
