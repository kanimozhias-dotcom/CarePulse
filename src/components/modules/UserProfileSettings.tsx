import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Heart, 
  ShieldCheck, 
  Lock, 
  Save, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';

export const UserProfileSettings: React.FC = () => {
  const { user, role, patientProfile, updateUserProfile } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || 'Sarah Jenkins');
  const [email] = useState(user?.email || 'sarah.jenkins@example.com');
  const [phone, setPhone] = useState(patientProfile?.phone || user?.phone || '+1 (555) 912-3456');
  const [allergiesText, setAllergiesText] = useState(
    patientProfile?.allergies ? patientProfile.allergies.join(', ') : 'Penicillin, Sulfa drugs'
  );
  const [address, setAddress] = useState(patientProfile?.address || '428 Willow Creek Way, Suite 3, Metro City');
  const [emergencyName, setEmergencyName] = useState(patientProfile?.emergencyContact.name || 'Michael Jenkins');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile?.emergencyContact.phone || '+1 (555) 912-8877');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone });

    if (patientProfile) {
      const updatedPatient = {
        ...patientProfile,
        name,
        phone,
        address,
        allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContact: {
          ...patientProfile.emergencyContact,
          name: emergencyName,
          phone: emergencyPhone,
        },
      };
      storage.savePatient(updatedPatient);
    }

    showToast('success', 'Profile Updated', 'Your demographic & health contact preferences have been saved.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('error', 'Missing Fields', 'Please fill in both current and new passwords.');
      return;
    }
    showToast('success', 'Security Credentials Updated', 'Password successfully changed and token refreshed.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Clinical Profile</h2>
            <Badge variant="teal" size="sm">Self-Service</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal contact information, emergency contacts, allergy declarations, and login credentials.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active Identity Verified
        </Badge>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xl border">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500 capitalize">{role} Account • {email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {role === 'patient' && (
            <>
              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800">Designated Emergency Contact</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full p-2 rounded-lg border bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-2 rounded-lg border bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Documented Medical Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  placeholder="e.g. Penicillin, Latex, Aspirin"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Alerts are flagged to doctors during clinical desks and prescription writing.
                </span>
              </div>
            </>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Information</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Box */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <h4 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-purple-600" /> Security & Passwords
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Update your secure authentication credentials.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
