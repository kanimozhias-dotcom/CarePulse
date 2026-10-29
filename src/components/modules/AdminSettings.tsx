import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Activity, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Server,
  Lock,
  Mail
} from 'lucide-react';
import { Department, SystemSetting } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface AdminSettingsProps {
  onResetAllData: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onResetAllData }) => {
  const { user, role } = useAuth();
  const { showToast } = useNotification();

  const [settings, setSettings] = useState<SystemSetting>(() => storage.getSystemSettings());
  const [departments, setDepartments] = useState<Department[]>(() => storage.getDepartments());
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // New Department Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLocation, setDeptLocation] = useState('');

  const handleSaveOperationalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSystemSettings(settings, {
      id: user?.id || 'admin',
      name: user?.name || 'Administrator',
      role: 'admin',
    });
    showToast('success', 'Settings Saved', 'Hospital administrative parameters successfully applied.');
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      showToast('error', 'Missing Fields', 'Department name and unique code are required.');
      return;
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      description: deptDesc.trim() || 'Clinical outpatient department',
      location: deptLocation.trim() || 'Main Hospital Wing',
      activeDoctorsCount: 1,
    };

    storage.saveDepartment(newDept);
    setDepartments(storage.getDepartments());
    setShowAddDeptModal(false);
    showToast('success', 'Department Created', `${newDept.name} (${newDept.code}) added.`);

    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setDeptLocation('');
  };

  const handleDeleteDepartment = (id: string, name: string) => {
    storage.deleteDepartment(id);
    setDepartments(storage.getDepartments());
    showToast('info', 'Department Removed', `${name} department removed from directory.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin & Hospital Operational Settings</h2>
            <Badge variant="teal" size="sm">Module 11</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure clinical scheduling buffers, cancellation grace windows, clinical departments, and infrastructure health.
          </p>
        </div>

        <button
          onClick={onResetAllData}
          className="flex items-center gap-1.5 px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* Hospital Infrastructure Health Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Application & Services Health Status</h4>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational (99.98% Uptime)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-sans">Core Scheduling Engine</span>
            <span className="font-bold text-emerald-400">ONLINE</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">Deterministic Rules</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-sans">Digital Queue Dispatch</span>
            <span className="font-bold text-emerald-400">ONLINE</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">Active Polling 15s</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-sans">Diagnostics Vault Encrypt</span>
            <span className="font-bold text-emerald-400">ONLINE</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">AES-256 Mock Encrypted</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-sans">Notification Service</span>
            <span className="font-bold text-amber-400">IN-APP ACTIVE</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">SMTP Unconfigured</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operational Policies Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-teal-600" />
            Hospital Appointment & Cancellation Policies
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Global constraints enforced across patient booking wizards and doctor schedules.
          </p>

          <form onSubmit={handleSaveOperationalSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Medical Facility Official Name</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cancellation Cutoff Window (Hours)</label>
                <input
                  type="number"
                  value={settings.cancellationCutoffHours}
                  onChange={(e) => setSettings({ ...settings, cancellationCutoffHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Hours before slot that patient can cancel</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maximum Advance Booking (Days)</label>
                <input
                  type="number"
                  value={settings.maxAdvanceBookingDays}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Limit on how far ahead slots may be booked</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Slot Granularity (mins)</label>
                <select
                  value={settings.defaultSlotDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultSlotDurationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinic Sanitation Buffer (mins)</label>
                <select
                  value={settings.defaultBufferMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultBufferMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value={0}>0 Minutes</option>
                  <option value={5}>5 Minutes (Recommended)</option>
                  <option value={10}>10 Minutes</option>
                </select>
              </div>
            </div>

            {/* Checkbox options */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPatientCancellation}
                  onChange={(e) => setSettings({ ...settings, allowPatientCancellation: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Allow self-service patient cancellations within grace cutoff</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoCallNextToken}
                  onChange={(e) => setSettings({ ...settings, autoCallNextToken: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Auto-call next waiting token upon consultation conclusion</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requirePrepayment}
                  onChange={(e) => setSettings({ ...settings, requirePrepayment: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Require digital prepayment before appointment slot lock</span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Apply Operational Policies
              </button>
            </div>
          </form>
        </div>

        {/* Departments Management (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                Departments ({departments.length})
              </h3>
              <p className="text-xs text-slate-500">Clinical specialties and clinics</p>
            </div>

            <button
              onClick={() => setShowAddDeptModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[10px]">
                      {dept.code}
                    </span>
                    <span className="font-bold text-slate-900">{dept.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{dept.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{dept.location}</p>
                </div>

                <button
                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove department"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        title="Add Clinical Department"
        subtitle="Create an operational department and link specialized medical staff"
        maxWidth="md"
      >
        <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Department Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Ophthalmology"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Code <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="OPHT"
                maxLength={4}
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white uppercase font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location / Wing</label>
            <input
              type="text"
              placeholder="Building C, 3rd Floor"
              value={deptLocation}
              onChange={(e) => setDeptLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Scope & Description</label>
            <textarea
              rows={2}
              placeholder="Clinical eye exams, vision correction therapies, cataract surgery..."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddDeptModal(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
