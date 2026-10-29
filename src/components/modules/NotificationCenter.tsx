import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Notification, NotificationType } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

interface NotificationCenterProps {
  onNavigate?: (view: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotification();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'bookings' | 'queue' | 'waitlist'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'unread') return !n.read;
      if (activeFilter === 'bookings') return n.type.includes('booking');
      if (activeFilter === 'queue') return n.type === 'queue_update';
      if (activeFilter === 'waitlist') return n.type === 'waitlist_available';
      return true;
    });
  }, [notifications, activeFilter]);

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'booking_cancelled':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'queue_update':
        return <Clock className="w-4 h-4 text-teal-600" />;
      case 'waitlist_available':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'lab_ready':
        return <Bell className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications & Reminders Hub</h2>
            <Badge variant="teal" size="sm">Module 10</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time clinical alerts, booking confirmations, queue calls, and priority waiting-list updates.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-teal-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Email Integration Delivery Disclaimer Banner (as required by prompt) */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 text-xs text-sky-900">
        <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold flex items-center gap-2">
            <span>Hospital Dispatch Relay Service Status:</span>
            <span className="text-[10px] bg-sky-200/80 text-sky-800 px-2 py-0.2 rounded-md font-mono">
              In-App Dispatch Active • SMTP Relay: Unconfigured
            </span>
          </div>
          <p className="text-[11px] text-sky-800 mt-1 leading-relaxed">
            All reminders, confirmations, and queue calls are actively published to this in-app notifications stream. External SMTP gateway credentials can be linked in Admin Settings.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${notifications.filter((n) => !n.read).length})` },
          { id: 'bookings', label: 'Appointments' },
          { id: 'queue', label: 'Queue & Tokens' },
          { id: 'waitlist', label: 'Waiting List' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No notifications in this category</p>
            <p className="text-[11px] text-slate-400 mt-0.5">You're completely up to date!</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !notif.read ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">{notif.message}</p>
                  
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="font-mono">Email Status: {notif.emailStatus || 'unconfigured'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-1.5 text-xs text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notif.link && onNavigate && (
                  <button
                    onClick={() => onNavigate(notif.link!.replace('/', ''))}
                    className="p-1.5 text-xs text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
