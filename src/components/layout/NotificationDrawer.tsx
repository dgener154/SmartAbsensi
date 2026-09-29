import React from 'react';
import { X, Check, Bell, AlertCircle, Info, CheckCircle2, Clock } from 'lucide-react';
import { AppNotification } from '../../types';
import { storage } from '../../services/storageService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh
}) => {
  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    onRefresh();
  };

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead();
    onRefresh();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <h3 className="font-semibold text-sm text-slate-900">Notifikasi Sistem</h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {notifications.filter(n => !n.isRead).length} baru
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs bg-white">
          <span className="text-slate-500">Pemberitahuan Terkini</span>
          <button
            onClick={handleMarkAllRead}
            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Tandai semua dibaca
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-200 opacity-75'
                    : 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>{n.title}</span>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          SISTEM ABSENSI SEKOLAH TERPADU
        </div>
      </div>
    </div>
  );
};
