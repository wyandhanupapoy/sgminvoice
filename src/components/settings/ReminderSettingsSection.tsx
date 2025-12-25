import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useReminderSettings, ReminderSettings } from '@/hooks/useReminderSettings';
import { Clock, Bell, Calendar, Loader2 } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DAYS_OPTIONS = [
  { value: 1, label: 'H-1 (1 hari sebelum)' },
  { value: 3, label: 'H-3 (3 hari sebelum)' },
  { value: 7, label: 'H-7 (7 hari sebelum)' },
  { value: 14, label: 'H-14 (14 hari sebelum)' },
  { value: 30, label: 'H-30 (30 hari sebelum)' },
];

export function ReminderSettingsSection() {
  const { settings, isLoading, isSaving, saveSettings } = useReminderSettings();
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleSave = () => {
    saveSettings(localSettings);
  };

  const handleDayToggle = (day: number, checked: boolean) => {
    const newDays = checked
      ? [...localSettings.days_before_due, day].sort((a, b) => a - b)
      : localSettings.days_before_due.filter((d) => d !== day);
    
    setLocalSettings({ ...localSettings, days_before_due: newDays });
  };

  const formatTime = (hour: number) => {
    return hour.toString().padStart(2, '0');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Reminder Otomatis
          </CardTitle>
          <CardDescription>
            Kirim email pengingat otomatis untuk faktur yang akan jatuh tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Aktifkan Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Kirim email reminder secara otomatis
              </p>
            </div>
            <Switch
              id="enabled"
              checked={localSettings.enabled}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, enabled: checked })
              }
            />
          </div>

          {/* Schedule Time */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waktu Pengiriman
            </Label>
            <div className="flex items-center gap-2">
              <Select
                value={localSettings.schedule_hour.toString()}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, schedule_hour: parseInt(value) })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {formatTime(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-lg font-medium">:</span>
              <Select
                value={localSettings.schedule_minute.toString()}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, schedule_minute: parseInt(value) })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((minute) => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {formatTime(minute)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">WIB</span>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Frekuensi
            </Label>
            <Select
              value={localSettings.frequency}
              onValueChange={(value: 'daily' | 'weekdays' | 'weekly') =>
                setLocalSettings({ ...localSettings, frequency: value })
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Setiap Hari</SelectItem>
                <SelectItem value="weekdays">Hari Kerja (Senin-Jumat)</SelectItem>
                <SelectItem value="weekly">Mingguan (Setiap Senin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Days Before Due */}
          <div className="space-y-3">
            <Label>Kirim Reminder Untuk</Label>
            <p className="text-sm text-muted-foreground">
              Pilih kapan reminder akan dikirim sebelum jatuh tempo
            </p>
            <div className="grid gap-3">
              {DAYS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${option.value}`}
                    checked={localSettings.days_before_due.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleDayToggle(option.value, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`day-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              * Reminder juga akan dikirim untuk faktur yang sudah jatuh tempo (sampai 30 hari)
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
