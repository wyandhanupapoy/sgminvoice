-- Create reminder_settings table
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  schedule_hour INTEGER NOT NULL DEFAULT 8,
  schedule_minute INTEGER NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'daily',
  days_before_due INTEGER[] NOT NULL DEFAULT ARRAY[1, 3, 7],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_hour CHECK (schedule_hour >= 0 AND schedule_hour <= 23),
  CONSTRAINT valid_minute CHECK (schedule_minute >= 0 AND schedule_minute <= 59),
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekdays', 'weekly'))
);

-- Enable RLS
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own reminder settings" 
ON public.reminder_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder settings" 
ON public.reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings" 
ON public.reminder_settings FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reminder_settings_updated_at
BEFORE UPDATE ON public.reminder_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();