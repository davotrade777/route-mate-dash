import { useState } from 'react';
import { Settings, Route, Scale, Clock, ShieldAlert, Save, RotateCcw, Info, AlertTriangle, Lock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { defaultRouteBalanceConfig, RouteBalanceConfig } from '@/types/routeBalanceConfig';
import { cn } from '@/lib/utils';

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export default function SettingsPage() {
  const [config, setConfig] = useState<RouteBalanceConfig>(defaultRouteBalanceConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof RouteBalanceConfig>(
    section: K,
    field: string,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Configuración guardada', {
      description: 'Las reglas de balance de asignación se han actualizado correctamente.',
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setConfig(defaultRouteBalanceConfig);
    setHasChanges(true);
    toast.info('Configuración restablecida a valores por defecto');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Configuración de Reglas</h1>
            <p className="text-sm text-muted-foreground">
              Control de asignación de fletes y balance de rutas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Restablecer
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1.5" />
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clasificación de rutas */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Clasificación de Rutas</CardTitle>
            </div>
            <CardDescription>
              Parámetros para clasificar rutas como largas o cortas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="criteria" className="text-sm">Criterio de clasificación</Label>
                <InfoTip text="Define cómo se determina si una ruta es larga o corta" />
              </div>
              <Select
                value={config.classification.classificationCriteria}
                onValueChange={v => update('classification', 'classificationCriteria', v)}
              >
                <SelectTrigger id="criteria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Solo distancia</SelectItem>
                  <SelectItem value="time">Solo tiempo estimado</SelectItem>
                  <SelectItem value="combined">Combinación (distancia + tiempo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(config.classification.classificationCriteria === 'distance' || config.classification.classificationCriteria === 'combined') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Umbral distancia ruta larga</Label>
                    <InfoTip text="Distancia mínima en km para que una ruta sea clasificada como larga" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {config.classification.longRouteDistanceThreshold} km
                  </Badge>
                </div>
                <Slider
                  value={[config.classification.longRouteDistanceThreshold]}
                  onValueChange={([v]) => update('classification', 'longRouteDistanceThreshold', v)}
                  min={50}
                  max={1000}
                  step={10}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>50 km</span>
                  <span>1000 km</span>
                </div>
              </div>
            )}

            {(config.classification.classificationCriteria === 'time' || config.classification.classificationCriteria === 'combined') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Umbral tiempo ruta larga</Label>
                    <InfoTip text="Tiempo mínimo estimado en horas para clasificar como ruta larga" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {config.classification.longRouteTimeThreshold} h
                  </Badge>
                </div>
                <Slider
                  value={[config.classification.longRouteTimeThreshold]}
                  onValueChange={([v]) => update('classification', 'longRouteTimeThreshold', v)}
                  min={1}
                  max={24}
                  step={0.5}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 h</span>
                  <span>24 h</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regla de balance */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Regla de Balance</CardTitle>
            </div>
            <CardDescription>
              Distribución máxima/mínima entre rutas largas y cortas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm">Máximo rutas largas</Label>
                  <InfoTip text="Porcentaje máximo de asignaciones que pueden ser rutas largas" />
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {config.balanceRule.maxLongRoutePercentage}%
                </Badge>
              </div>
              <Slider
                value={[config.balanceRule.maxLongRoutePercentage]}
                onValueChange={([v]) => {
                  update('balanceRule', 'maxLongRoutePercentage', v);
                  update('balanceRule', 'minShortRoutePercentage', 100 - v);
                }}
                min={10}
                max={90}
                step={5}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Mínimo rutas cortas (calculado)</span>
              <Badge variant="outline" className="font-mono text-xs">
                {config.balanceRule.minShortRoutePercentage}%
              </Badge>
            </div>

            {/* Visual bar */}
            <div className="space-y-1.5">
              <div className="flex h-3 rounded-full overflow-hidden border">
                <div
                  className="bg-primary transition-all duration-300"
                  style={{ width: `${config.balanceRule.maxLongRoutePercentage}%` }}
                />
                <div
                  className="bg-muted transition-all duration-300"
                  style={{ width: `${config.balanceRule.minShortRoutePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Rutas largas ({config.balanceRule.maxLongRoutePercentage}%)</span>
                <span>Rutas cortas ({config.balanceRule.minShortRoutePercentage}%)</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="consecutive" className="text-sm">Máx. rutas largas consecutivas</Label>
                <InfoTip text="Cantidad máxima de rutas largas seguidas antes de generar una alerta o bloqueo" />
              </div>
              <Input
                id="consecutive"
                type="number"
                min={1}
                max={20}
                value={config.balanceRule.maxConsecutiveLongRoutes}
                onChange={e => update('balanceRule', 'maxConsecutiveLongRoutes', parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ventana de análisis */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Ventana de Análisis</CardTitle>
            </div>
            <CardDescription>
              Período o cantidad de viajes para evaluar el balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">Tipo de ventana</Label>
              <Select
                value={config.analysisWindow.windowType}
                onValueChange={v => update('analysisWindow', 'windowType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trips">Últimos N viajes</SelectItem>
                  <SelectItem value="time">Período de tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.analysisWindow.windowType === 'trips' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Cantidad de viajes</Label>
                    <InfoTip text="Últimos N viajes del transportista a considerar para el cálculo de balance" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {config.analysisWindow.lastNTrips} viajes
                  </Badge>
                </div>
                <Slider
                  value={[config.analysisWindow.lastNTrips]}
                  onValueChange={([v]) => update('analysisWindow', 'lastNTrips', v)}
                  min={5}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Período (días)</Label>
                    <InfoTip text="Período de tiempo en días para evaluar el historial del transportista" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {config.analysisWindow.timePeriodDays} días
                  </Badge>
                </div>
                <Slider
                  value={[config.analysisWindow.timePeriodDays]}
                  onValueChange={([v]) => update('analysisWindow', 'timePeriodDays', v)}
                  min={7}
                  max={180}
                  step={7}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>7 días</span>
                  <span>180 días</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas y bloqueos */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Alertas y Bloqueos</CardTitle>
            </div>
            <CardDescription>
              Comportamiento del sistema ante incumplimiento de reglas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium">Alertas preventivas</p>
                  <p className="text-xs text-muted-foreground">
                    Mostrar alerta antes de aprobar un flete que incumple la regla
                  </p>
                </div>
              </div>
              <Switch
                checked={config.alerts.showPreventiveAlert}
                onCheckedChange={v => update('alerts', 'showPreventiveAlert', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Bloqueo automático</p>
                  <p className="text-xs text-muted-foreground">
                    Bloquear asignación al exceder límites definidos
                  </p>
                </div>
              </div>
              <Switch
                checked={config.alerts.autoBlockOnExceed}
                onCheckedChange={v => update('alerts', 'autoBlockOnExceed', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Justificación obligatoria</p>
                  <p className="text-xs text-muted-foreground">
                    Requerir justificación para excepciones (registro de auditoría)
                  </p>
                </div>
              </div>
              <Switch
                checked={config.alerts.requireJustification}
                onCheckedChange={v => update('alerts', 'requireJustification', v)}
              />
            </div>

            {config.alerts.autoBlockOnExceed && config.alerts.requireJustification && (
              <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Modo activo:</span> El sistema bloqueará la asignación cuando se excedan los límites. 
                  El planificador podrá continuar únicamente ingresando una justificación, 
                  la cual quedará registrada con usuario, fecha, hora, motivo y flete asociado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
