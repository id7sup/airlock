"use client";

import { useState, useEffect } from "react";
import { Bell, Eye, Download, Clock, Lock, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotificationsAction, markAsReadAction } from "@/lib/actions/notifications";
import type { NotificationType } from "@/services/notifications";
import { useUser } from "@clerk/nextjs";

export function NotificationCenter() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotificationsAction();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && !isOpen) {
        try {
          const data = await getNotificationsAction(5);
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        } catch (e) {}
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user, isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadAction(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "VIEW": return <Eye className="w-4 h-4 text-orange-500" />;
      case "DOWNLOAD": return <Download className="w-4 h-4 text-brand-primary" />;
      case "EXPIRATION": return <Clock className="w-4 h-4 text-red-500" />;
      case "PASSWORD_ACCESS": return <Lock className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getMessage = (n: any) => {
    const meta = n.metadata || {};
    switch (n.type) {
      case "VIEW": return `Dossier "${meta.folderName}" consulté.`;
      case "DOWNLOAD": return `"${meta.fileName}" téléchargé.`;
      case "EXPIRATION": return `Lien "${meta.folderName}" expiré.`;
      case "PASSWORD_ACCESS": return `Accès déverrouillé pour "${meta.folderName}".`;
      default: return "Activité détectée.";
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 bg-[#f5f5f7] hover:bg-black/5 rounded-2xl flex items-center justify-center transition-all active:scale-90"
      >
        <Bell className="w-5 h-5 text-black/40" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-2 sm:mt-4 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-black/[0.03] z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-black/[0.03] flex items-center justify-between">
                <h3 className="text-base font-medium text-black">Notifications</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white rounded-full uppercase tracking-widest">
                  {unreadCount} news
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Chargement...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm font-medium text-black/30">Aucune notification.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/[0.02]">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-5 hover:bg-[#fbfbfd] transition-colors flex items-start gap-4 relative group ${!n.isRead ? 'bg-black/[0.02]' : ''}`}
                      >
                        <div className="w-10 h-10 bg-[#f5f5f7] rounded-xl mt-0.5 flex items-center justify-center shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-[13px] leading-snug ${!n.isRead ? 'font-medium text-black' : 'text-black/40'}`}>
                            {getMessage(n)}
                          </p>
                          <p className="text-[10px] font-bold text-black/20 uppercase tracking-tight">
                            {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="w-7 h-7 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#f5f5f7]/50 border-t border-black/[0.03]">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-white rounded-xl text-[11px] font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors shadow-sm"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
