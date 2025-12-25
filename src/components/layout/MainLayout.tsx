import { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSupported, requestPermission } = useNotifications();
  const { toast } = useToast();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    if (isSupported && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setShowNotificationPrompt(false);
    
    if (granted) {
      toast({
        title: 'Notifikasi Aktif',
        description: 'Anda akan menerima pengingat faktur tepat waktu.',
      });
    }
  };

  const handleDismissPrompt = () => setShowNotificationPrompt(false);

  return (
    <div className="min-h-screen">
      <Header />
      <Navigation />
      
      {/* Notification Permission Prompt */}
      <AnimatePresence>
        {showNotificationPrompt && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)]"
          >
            <div className="glass-card rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Bell className="w-6 h-6 text-primary animate-bounce" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base">Aktifkan Notifikasi?</h4>
                  <p className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">
                    Jangan lewatkan faktur penting. Kami akan mengingatkan Anda sebelum jatuh tempo.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <Button size="sm" onClick={handleEnableNotifications} className="rounded-xl px-6 font-bold">
                      Ya, Aktifkan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleDismissPrompt} className="rounded-xl font-bold text-muted-foreground hover:bg-primary/5">
                      Lain Kali
                    </Button>
                  </div>
                </div>
                <button 
                  onClick={handleDismissPrompt}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <BellOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
