'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { scraperAPI, ScrapingSchedule } from '@/lib/api/scraper/scraper-api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScheduleForm {
  frequency: string;
  hour: string;
  minute: string;
  enabled: boolean;
}

export function ScheduleConfig() {
  const [schedules, setSchedules] = useState<Record<string, ScheduleForm>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const targets = await scraperAPI.getTargets();
      
      // Initialize schedule forms for each target
      const scheduleForms: Record<string, ScheduleForm> = {};
      targets.forEach(target => {
        scheduleForms[target.name] = {
          frequency: target.frequency,
          hour: '9', // Default hour
          minute: '0', // Default minute
          enabled: target.enabled,
        };
      });
      
      setSchedules(scheduleForms);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las programaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (targetName: string) => {
    setSaving(targetName);
    try {
      const schedule = schedules[targetName];
      const cronExpression = generateCronExpression(schedule);
      
      await scraperAPI.updateSchedule(targetName, {
        cron_expression: cronExpression,
        enabled: schedule.enabled,
      });

      toast({
        title: 'Programación guardada',
        description: `La programación para ${targetName} ha sido actualizada`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la programación',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const generateCronExpression = (schedule: ScheduleForm): string => {
    const { frequency, hour, minute } = schedule;
    
    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'every_2_days':
        return `${minute} ${hour} */2 * *`;
      case 'every_3_days':
        return `${minute} ${hour} */3 * *`;
      case 'weekly':
        return `${minute} ${hour} * * 1`; // Every Monday
      default:
        return `${minute} ${hour} * * *`;
    }
  };

  const getNextRun = (schedule: ScheduleForm): string => {
    if (!schedule.enabled) return 'Deshabilitado';
    
    const now = new Date();
    let nextRun = setHours(setMinutes(now, parseInt(schedule.minute)), parseInt(schedule.hour));
    
    // If the time has passed today, move to next occurrence
    if (nextRun <= now) {
      switch (schedule.frequency) {
        case 'daily':
          nextRun = addDays(nextRun, 1);
          break;
        case 'every_2_days':
          nextRun = addDays(nextRun, 2);
          break;
        case 'every_3_days':
          nextRun = addDays(nextRun, 3);
          break;
        case 'weekly':
          nextRun = addDays(nextRun, 7);
          break;
      }
    }
    
    return format(nextRun, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es });
  };

  const updateSchedule = (targetName: string, field: keyof ScheduleForm, value: any) => {
    setSchedules(prev => ({
      ...prev,
      [targetName]: {
        ...prev[targetName],
        [field]: value,
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Las programaciones se ejecutan automáticamente según la configuración. 
          Los horarios están en hora local de Argentina (UTC-3).
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {Object.entries(schedules).map(([targetName, schedule]) => (
          <Card key={targetName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{targetName}</CardTitle>
                <Switch
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => updateSchedule(targetName, 'enabled', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor={`frequency-${targetName}`}>Frecuencia</Label>
                  <Select
                    value={schedule.frequency}
                    onValueChange={(value) => updateSchedule(targetName, 'frequency', value)}
                  >
                    <SelectTrigger id={`frequency-${targetName}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="every_2_days">Cada 2 días</SelectItem>
                      <SelectItem value="every_3_days">Cada 3 días</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`hour-${targetName}`}>Hora</Label>
                  <Select
                    value={schedule.hour}
                    onValueChange={(value) => updateSchedule(targetName, 'hour', value)}
                  >
                    <SelectTrigger id={`hour-${targetName}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`minute-${targetName}`}>Minutos</Label>
                  <Select
                    value={schedule.minute}
                    onValueChange={(value) => updateSchedule(targetName, 'minute', value)}
                  >
                    <SelectTrigger id={`minute-${targetName}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">:00</SelectItem>
                      <SelectItem value="15">:15</SelectItem>
                      <SelectItem value="30">:30</SelectItem>
                      <SelectItem value="45">:45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima ejecución: {getNextRun(schedule)}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => saveSchedule(targetName)}
                  disabled={saving === targetName}
                >
                  {saving === targetName ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}