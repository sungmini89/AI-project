// 알림 관리자 컴포넌트

import React, { useEffect } from 'react';
import { useUIStore } from '../../stores';

export const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    autoClose?: boolean;
    duration?: number;
  };
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove
}) => {
  const { type, title, message } = notification;

  // 자동 닫기 타이머
  useEffect(() => {
    if (notification.autoClose) {
      const timer = setTimeout(() => {
        onRemove();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.autoClose, notification.duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'error': return 'text-red-800 dark:text-red-200';
      default: return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={`
        ${getBgColor()} ${getTextColor()}
        p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-fade-in-right
      `}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-2 text-lg opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationManager;