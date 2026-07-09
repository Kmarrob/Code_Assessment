// frontend/src/components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellDot, Check, X, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { notificationService } from '../services/notification.service.js';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationService.getNotifications(1, 20, 'all');
      // 🔴 CORREÇÃO: A API retorna os dados em 'data', não em 'notifications'
      setNotifications(result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setError('Não foi possível carregar as notificações');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar apenas a contagem de não lidas
  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Erro ao carregar contagem:', err);
    }
  };

  // Carregar ao montar e quando o usuário mudar
  useEffect(() => {
    loadUnreadCount();
  }, [user]);

  // Carregar lista completa ao abrir o dropdown
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Marcar notificação como lida
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Atualizar lista
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setIsMarkingAll(true);
    try {
      const count = await notificationService.markAllAsRead();
      
      // Atualizar lista
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Excluir notificação
  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remover da lista
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Erro ao excluir notificação:', err);
    }
  };

  // Navegar para o link
  const handleNavigate = (link?: string) => {
    if (link) {
      window.location.href = link;
    }
    setIsOpen(false);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    if (diffDays < 7) return `${diffDays} d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Obter ícone baseado no tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return '📋';
      case 'response': return '📝';
      case 'review_request': return '🔍';
      case 'review_completed': return '📋';
      case 'user_inactivated': return '👤';
      case 'control_revoked': return '🚫';
      case 'reminder': return '⏰';
      case 'control_updated': return '📌';
      default: return '📬';
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Botão do sino */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notificações"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 p-4 text-red-600 text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Nenhuma notificação</p>
                <p className="text-sm">Você está em dia!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNavigate(notification.link)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-gray-900`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                className="p-0.5 text-blue-600 hover:text-blue-800"
                                title="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification._id);
                              }}
                              className="p-0.5 text-gray-400 hover:text-red-600"
                              title="Excluir"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navegar para página de notificações (se existir)
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;