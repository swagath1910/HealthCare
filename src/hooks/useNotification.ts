import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  isVisible: boolean;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      message,
      isVisible: true
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification('success', message);
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification('error', message);
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification('warning', message);
  }, [showNotification]);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    hideNotification
  };
};