import { useEffect, useCallback, useRef } from 'react';
import { useSalesData } from './useSalesData';
import { usePurchaseData } from './usePurchaseData';
import { formatRupiah } from '@/utils/formatters';

interface DueInvoice {
  id: string;
  transactionNumber: string;
  customerName: string;
  dueDate: string;
  amount: number;
  type: 'sales' | 'purchase';
  daysUntilDue: number;
}

export const useNotifications = () => {
  const { sales } = useSalesData();
  const { purchases } = usePurchaseData();
  const notifiedRef = useRef<Set<string>>(new Set());
  const permissionRef = useRef<NotificationPermission>('default');

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission === 'granted';
    }

    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionRef.current !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/company-logo.png',
        badge: '/company-logo.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, []);

  // Get due invoices (due within 7 days or overdue)
  const getDueInvoices = useCallback((): DueInvoice[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueInvoices: DueInvoice[] = [];

    const checkDueDate = (
      dueDate: string | null,
      status: string,
      id: string,
      transactionNumber: string,
      customerName: string,
      amount: number,
      type: 'sales' | 'purchase'
    ) => {
      if (!dueDate || status === 'paid') return;

      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Include if due within 7 days or overdue
      if (diffDays <= 7) {
        dueInvoices.push({
          id,
          transactionNumber,
          customerName,
          dueDate,
          amount,
          type,
          daysUntilDue: diffDays,
        });
      }
    };

    sales.forEach((s) => {
      checkDueDate(
        s.due_date,
        s.status,
        s.id,
        s.transaction_number,
        s.customer_name,
        Number(s.grand_total),
        'sales'
      );
    });

    purchases.forEach((p) => {
      checkDueDate(
        p.due_date,
        p.status,
        p.id,
        p.transaction_number,
        p.supplier_name,
        Number(p.grand_total),
        'purchase'
      );
    });

    return dueInvoices.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [sales, purchases]);

  // Check and notify about due invoices
  const checkAndNotify = useCallback(() => {
    if (permissionRef.current !== 'granted') return;

    const dueInvoices = getDueInvoices();
    const newNotifications: DueInvoice[] = [];

    dueInvoices.forEach((invoice) => {
      const notificationKey = `${invoice.id}-${invoice.daysUntilDue}`;
      if (!notifiedRef.current.has(notificationKey)) {
        notifiedRef.current.add(notificationKey);
        newNotifications.push(invoice);
      }
    });

    // Group notifications
    const overdue = newNotifications.filter((i) => i.daysUntilDue < 0);
    const dueToday = newNotifications.filter((i) => i.daysUntilDue === 0);
    const dueSoon = newNotifications.filter((i) => i.daysUntilDue > 0 && i.daysUntilDue <= 3);

    if (overdue.length > 0) {
      showNotification(`⚠️ ${overdue.length} Faktur Terlambat!`, {
        body: overdue
          .slice(0, 3)
          .map((i) => `${i.transactionNumber} - ${i.customerName}`)
          .join('\n'),
        tag: 'overdue-invoices',
        requireInteraction: true,
      });
    }

    if (dueToday.length > 0) {
      showNotification(`📅 ${dueToday.length} Faktur Jatuh Tempo Hari Ini`, {
        body: dueToday
          .slice(0, 3)
          .map((i) => `${i.transactionNumber} - ${formatRupiah(i.amount)}`)
          .join('\n'),
        tag: 'due-today-invoices',
      });
    }

    if (dueSoon.length > 0) {
      showNotification(`🔔 ${dueSoon.length} Faktur Akan Jatuh Tempo`, {
        body: dueSoon
          .slice(0, 3)
          .map((i) => `${i.transactionNumber} - ${i.daysUntilDue} hari lagi`)
          .join('\n'),
        tag: 'due-soon-invoices',
      });
    }
  }, [getDueInvoices, showNotification]);

  // Initialize and check periodically
  useEffect(() => {
    // Request permission on mount
    requestPermission().then((granted) => {
      if (granted) {
        // Initial check after 2 seconds (give time for data to load)
        const initialTimer = setTimeout(checkAndNotify, 2000);
        
        // Check every 30 minutes
        const intervalTimer = setInterval(checkAndNotify, 30 * 60 * 1000);

        return () => {
          clearTimeout(initialTimer);
          clearInterval(intervalTimer);
        };
      }
    });
  }, [requestPermission, checkAndNotify]);

  return {
    requestPermission,
    showNotification,
    getDueInvoices,
    isSupported: 'Notification' in window,
    permission: permissionRef.current,
  };
};
