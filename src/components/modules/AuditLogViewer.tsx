import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Lock, 
  Download, 
  RotateCw, 
  User, 
  Terminal, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AuditLog, AuditSeverity } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.resourceId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = selectedSeverity === 'all' || l.severity === selectedSeverity;
      const matchesRole = selectedRole === 'all' || l.actorRole === selectedRole;

      return matchesSearch && matchesSeverity && matchesRole;
    });
  }, [logs, searchTerm, selectedSeverity, selectedRole]);

  const refreshLogs = () => {
    setLogs(storage.getAuditLogs());
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Severity', 'Actor Name', 'Actor Role', 'Actor ID', 'Resource', 'Resource ID', 'Description', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      l.action,
      l.severity,
      `"${l.actorName}"`,
      l.actorRole,
      l.actorId,
      l.resourceType,
      l.resourceId,
      `"${l.description.replace(/"/g, '""')}"`,
      l.ipAddress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carepulse_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadgeVariant = (s: AuditSeverity) => {
    switch (s) {
      case 'critical':
        return 'rose';
      case 'warning':
        return 'amber';
      case 'security':
        return 'purple';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & RBAC System Audit Trail</h2>
            <Badge variant="purple" size="sm">Module 7</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable operational ledger tracking user authentication, clinical record edits, appointment life-cycles, and administrative modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshLogs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trail</span>
          </button>
        </div>
      </div>

      {/* Security Guarantee Box */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Zero-Knowledge Clinical Content Isolation</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-md font-mono">HIPAA & GDPR Aligned</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Audit log stores transaction provenance (actor, timestamp, IP, resource target) without logging raw plaintext passwords, authentication tokens, or unredacted health records.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, resource ID, or description..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="security">Security</option>
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3.5 pl-4">Timestamp (UTC)</th>
                <th className="py-3.5">Action Code</th>
                <th className="py-3.5">Severity</th>
                <th className="py-3.5">Actor Details</th>
                <th className="py-3.5">Resource Affected</th>
                <th className="py-3.5">Description</th>
                <th className="py-3.5 pr-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-sans">
                    No audit records matching the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={getSeverityBadgeVariant(log.severity)} size="sm" dot>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 font-sans">
                      <div className="font-bold text-slate-800">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono capitalize">
                        {log.actorRole} ({log.actorId})
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-teal-700">
                      {log.resourceType}:{log.resourceId}
                    </td>
                    <td className="py-3 font-sans text-slate-700 max-w-md text-xs leading-relaxed">
                      {log.description}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
