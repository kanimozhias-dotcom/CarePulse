import React, { useMemo } from 'react';
import { 
  HeartPulse, 
  CalendarCheck, 
  Clock, 
  ShieldCheck, 
  Video, 
  Award, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Stethoscope,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';

interface LandingPageProps {
  onBookNow: () => void;
  onExploreDoctors: () => void;
  onTrackQueue: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBookNow,
  onExploreDoctors,
  onTrackQueue,
  onGoToDashboard,
}) => {
  const departments = useMemo(() => storage.getDepartments(), []);
  const doctors = useMemo(() => storage.getDoctors(), []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 rounded-3xl p-8 sm:p-14 border border-slate-200/60 shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full text-xs font-bold text-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Intelligent Hospital Operations Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            World-Class Clinical Care,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
              Zero Waiting Friction.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Experience next-generation patient care with conflict-free scheduling, live digital queue tokens, secure teleconsultations, and instant diagnostic records.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onBookNow}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-102 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>

            <button
              onClick={onTrackQueue}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 shadow-xs transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Live Queue Tracker</span>
            </button>

            <button
              onClick={onGoToDashboard}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Enter Care Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/70 max-w-lg text-xs">
            <div>
              <span className="text-2xl font-black text-slate-900 block">99.8%</span>
              <span className="text-[11px] text-slate-500">On-Time Clinic Start</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">18 mins</span>
              <span className="text-[11px] text-slate-500">Average Wait Time</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">4.92 / 5</span>
              <span className="text-[11px] text-slate-500">Patient Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Decorative Graphic Background */}
        <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 hidden lg:block opacity-90 pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Hospital Capabilities
          </h2>
          <p className="text-xs text-slate-500">
            Engineered to eliminate administrative delays and guarantee patient scheduling integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Deterministic Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time conflict detection prevents double bookings, respects clinical shift hours, and enforces sterilization buffers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Digital Token Tracker</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Self-service kiosk check-in assigns unique tokens with dynamically calculated waiting time estimations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Clinical Desk & Teleconsult</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrated examination room with vitals capture, ICD diagnostic recording, and digital prescription issuance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Audit Trail & Vault</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Role-based access control (RBAC) and immutable tamper-evident transaction logs protecting sensitive medical data.
            </p>
          </div>
        </div>
      </section>

      {/* Medical Departments Carousel/Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Departments & Specialties</h2>
            <p className="text-xs text-slate-500 mt-0.5">Specialized medical wards and experienced consultant departments</p>
          </div>
          <button
            onClick={onExploreDoctors}
            className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Doctors</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={onExploreDoctors}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {dept.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{dept.location}</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mt-3 group-hover:text-teal-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
                <span>View Specialists</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Featured Lead Clinicians</h2>
            <p className="text-xs text-slate-500 mt-0.5">Board-certified senior consultants accepting new patient consultations</p>
          </div>
          <button
            onClick={onExploreDoctors}
            className="text-xs text-teal-600 font-bold hover:underline"
          >
            Browse Full Directory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {doctors.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border"
                  />
                  <div>
                    <Badge variant="teal" size="sm">{doc.departmentName}</Badge>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1">Dr. {doc.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{doc.specialization}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {doc.bio}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                  </div>
                  <span className="font-bold text-slate-800">${doc.consultationFee}</span>
                </div>
              </div>

              <button
                onClick={onBookNow}
                className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                Book with Dr. {doc.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-slate-800 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-white ml-1">Verified Patient Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Trusted by Over 45,000 Outpatients</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            "The live queue tracker and instant conflict diagnosis completely changed our family's hospital experience. We were notified right when Dr. Vance was ready."
          </p>
          <div className="pt-2 text-xs font-bold text-teal-400">
            — Sarah J., Cardiology Outpatient
          </div>
        </div>
      </section>
    </div>
  );
};
