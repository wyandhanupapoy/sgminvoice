import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ReminderSettings {
  id?: string;
  enabled: boolean;
  schedule_hour: number;
  schedule_minute: number;
  frequency: 'daily' | 'weekdays' | 'weekly';
  days_before_due: number[];
}

const defaultSettings: ReminderSettings = {
  enabled: true,
  schedule_hour: 8,
  schedule_minute: 0,
  frequency: 'daily',
  days_before_due: [1, 3, 7],
};

export function useReminderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          enabled: data.enabled,
          schedule_hour: data.schedule_hour,
          schedule_minute: data.schedule_minute,
          frequency: data.frequency as 'daily' | 'weekdays' | 'weekly',
          days_before_due: data.days_before_due,
        });
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: ReminderSettings) => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (newSettings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('reminder_settings')
          .update({
            enabled: newSettings.enabled,
            schedule_hour: newSettings.schedule_hour,
            schedule_minute: newSettings.schedule_minute,
            frequency: newSettings.frequency,
            days_before_due: newSettings.days_before_due,
          })
          .eq('id', newSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('reminder_settings')
          .insert({
            user_id: user.id,
            enabled: newSettings.enabled,
            schedule_hour: newSettings.schedule_hour,
            schedule_minute: newSettings.schedule_minute,
            frequency: newSettings.frequency,
            days_before_due: newSettings.days_before_due,
          })
          .select()
          .single();

        if (error) throw error;
        newSettings.id = data.id;
      }

      setSettings(newSettings);
      toast({
        title: 'Berhasil',
        description: 'Pengaturan reminder berhasil disimpan.',
      });
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      toast({
        title: 'Gagal',
        description: 'Gagal menyimpan pengaturan reminder.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
  };
}
