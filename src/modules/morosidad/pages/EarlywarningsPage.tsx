import { useState, useEffect, useCallback } from 'react';
import { Card } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Slider } from '@shared/components/ui/slider';
import { Switch } from '@shared/components/ui/switch';
import { Badge } from '@shared/components/ui/badge';
import {
    Bell,
    AlertTriangle,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    Target,
    Settings,
    Mail,
    Phone,
    CheckCircle,
    ArrowRight,
    Calendar,
    Loader2,
    ChevronDown,
    Plus,
    Shield
} from 'lucide-react';
import type { DefaultPolicy, Alerta, EarlyWarningsPreview } from '../types/morosidad.types';
import {
    getAllPolicies,
    getActivePolicy,
    activatePolicy,
    getWarningsPreview
} from '../services/morosidadService';

export function EarlyWarningsPage() {
    // Estados de configuración temporal (no persiste)
    const [umbralRiesgo, setUmbralRiesgo] = useState([30]);
    const [diasAnticipacion, setDiasAnticipacion] = useState([7]);
    const [alertasActivas, setAlertasActivas] = useState(true);

    // Estados de datos
    const [policies, setPolicies] = useState<DefaultPolicy[]>([]);
    const [activePolicy, setActivePolicy] = useState<DefaultPolicy | null>(null);
    const [warningsData, setWarningsData] = useState<EarlyWarningsPreview | null>(null);

    // Estados de UI
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [showPolicySelector, setShowPolicySelector] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [policiesData, activePolicyData] = await Promise.all([
                    getAllPolicies(),
                    getActivePolicy()
                ]);
                setPolicies(policiesData);
                setActivePolicy(activePolicyData);

                // Inicializar sliders con valores de política activa
                if (activePolicyData) {
                    setUmbralRiesgo([Math.round((1 - activePolicyData.thresholdApproval) * 100)]);
                    setDiasAnticipacion([activePolicyData.daysGraceDefault || 7]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar datos');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Cargar preview de alertas cuando cambian los parámetros
    const loadWarningsPreview = useCallback(async () => {
        if (!alertasActivas) {
            setWarningsData(null);
            return;
        }
        try {
            setIsLoadingPreview(true);
            const data = await getWarningsPreview(umbralRiesgo[0], diasAnticipacion[0]);
            setWarningsData(data);
        } catch (err) {
            console.error('Error loading warnings preview:', err);
        } finally {
            setIsLoadingPreview(false);
        }
    }, [umbralRiesgo, diasAnticipacion, alertasActivas]);

    // Debounce para evitar muchas llamadas
    useEffect(() => {
        const timer = setTimeout(() => {
            loadWarningsPreview();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadWarningsPreview]);

    // Activar política
    const handleActivatePolicy = async (policyId: number) => {
        try {
            const activated = await activatePolicy(policyId);
            setActivePolicy(activated);
            setShowPolicySelector(false);
            // Actualizar sliders
            setUmbralRiesgo([Math.round((1 - activated.thresholdApproval) * 100)]);
            setDiasAnticipacion([activated.daysGraceDefault || 7]);
            // Recargar lista de políticas
            const updatedPolicies = await getAllPolicies();
            setPolicies(updatedPolicies);
        } catch (err) {
            console.error('Error activating policy:', err);
        }
    };

    const getPriorityColor = (prioridad: string) => {
        switch (prioridad) {
            case 'urgente': return 'border-red-200 bg-red-50';
            case 'alta': return 'border-orange-200 bg-orange-50';
            case 'media': return 'border-yellow-200 bg-yellow-50';
            default: return 'border-zinc-200 bg-zinc-50';
        }
    };

    const getPriorityBadgeVariant = (prioridad: string) => {
        switch (prioridad) {
            case 'urgente': return 'destructive';
            case 'alta': return 'default';
            case 'media': return 'secondary';
            default: return 'outline';
        }
    };

    const getPriorityIcon = (tipo: string) => {
        switch (tipo) {
            case 'critico': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'alto': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            case 'tendencia': return <TrendingUp className="w-5 h-5 text-yellow-600" />;
            case 'vencimiento': return <Clock className="w-5 h-5 text-blue-600" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const alertas: Alerta[] = warningsData?.alertas || [];
    const totalCuentasEnAlerta = warningsData?.totalCuentasEnAlerta || 0;
    const totalDineroEnRiesgo = warningsData?.totalDineroEnRiesgo || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-zinc-500">Cargando alertas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sistema de Alertas Tempranas</h1>
                <p className="text-zinc-600">
                    Monitoreo proactivo y detección automática de patrones de riesgo
                </p>
            </div>

            {/* Política Activa */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Política Activa</p>
                            <p className="text-lg font-semibold text-zinc-900">
                                {activePolicy?.policyName || 'Sin política activa'}
                            </p>
                            {activePolicy && (
                                <p className="text-xs text-zinc-500">
                                    Umbral: {Math.round((1 - activePolicy.thresholdApproval) * 100)}% |
                                    Días gracia: {activePolicy.daysGraceDefault} |
                                    LGD: {(activePolicy.factorLgd * 100).toFixed(1)}%
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <Button
                            variant="outline"
                            className="gap-2 bg-white"
                            onClick={() => setShowPolicySelector(!showPolicySelector)}
                        >
                            Cambiar Política
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                        {showPolicySelector && (
                            <div className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border z-50">
                                <div className="p-2">
                                    {policies.map((policy) => (
                                        <button
                                            key={policy.idPolicy}
                                            onClick={() => handleActivatePolicy(policy.idPolicy)}
                                            className={`w-full text-left p-3 rounded-lg hover:bg-zinc-50 ${policy.isActive ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{policy.policyName}</span>
                                                {policy.isActive && (
                                                    <Badge variant="default" className="text-xs">Activa</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Umbral: {Math.round((1 - policy.thresholdApproval) * 100)}% |
                                                Aprobada por: {policy.approvedBy}
                                            </p>
                                        </button>
                                    ))}
                                    {policies.length === 0 && (
                                        <p className="text-sm text-zinc-500 text-center py-4">
                                            No hay políticas registradas
                                        </p>
                                    )}
                                </div>
                                <div className="border-t p-2">
                                    <Button variant="ghost" className="w-full gap-2 text-blue-600">
                                        <Plus className="w-4 h-4" />
                                        Crear Nueva Política
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Panel de configuración temporal */}
            <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <div>
                            <h2 className="font-semibold text-zinc-900">Vista Previa de Alertas</h2>
                            <p className="text-xs text-zinc-500">Modifica temporalmente los umbrales para simular efectos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-700">Alertas Activas</span>
                        <Switch
                            checked={alertasActivas}
                            onCheckedChange={setAlertasActivas}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-zinc-700">
                                Umbral de Probabilidad de Pago (%)
                            </label>
                            <span className="text-sm font-bold text-blue-600">{umbralRiesgo[0]}%</span>
                        </div>
                        <Slider
                            defaultValue={[30]}
                            value={umbralRiesgo}
                            onValueChange={setUmbralRiesgo}
                            max={50}
                            min={10}
                            step={1}
                            className="py-4"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Generar alerta cuando la probabilidad esté por debajo de este valor
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-zinc-700">
                                Días de Gracia (post-vencimiento)
                            </label>
                            <span className="text-sm font-bold text-blue-600">{diasAnticipacion[0]} días</span>
                        </div>
                        <Slider
                            defaultValue={[7]}
                            value={diasAnticipacion}
                            onValueChange={setDiasAnticipacion}
                            max={30}
                            min={1}
                            step={1}
                            className="py-4"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Días después del vencimiento antes de considerar una cuenta como morosa
                        </p>
                    </div>
                </div>
            </Card>

            {/* Métricas de alertas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Bell className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-600">Alertas Activas</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {isLoadingPreview ? '...' : alertas.length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-600">Cuentas en Alerta</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {isLoadingPreview ? '...' : totalCuentasEnAlerta}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-600">Exposición Total</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {isLoadingPreview ? '...' : `$${Math.round(totalDineroEnRiesgo / 1000)}K`}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Lista de alertas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900">Alertas Detectadas</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Enviar Reporte
                        </Button>
                    </div>
                </div>

                {isLoadingPreview ? (
                    <Card className="p-12 text-center bg-white border-0 shadow-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-zinc-500">Calculando alertas...</p>
                    </Card>
                ) : alertas.length === 0 ? (
                    <Card className="p-12 text-center bg-white border-0 shadow-sm">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 mb-2">No hay alertas activas</h3>
                        <p className="text-zinc-600">
                            {alertasActivas
                                ? 'Todos los indicadores están dentro de los parámetros normales'
                                : 'Las alertas están desactivadas'}
                        </p>
                    </Card>
                ) : (
                    alertas.map((alerta) => (
                        <Card key={alerta.id} className={`p-6 border ${getPriorityColor(alerta.prioridad)} shadow-sm`}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    {getPriorityIcon(alerta.tipo)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900 mb-1">{alerta.titulo}</h3>
                                            <p className="text-sm text-zinc-600">{alerta.descripcion}</p>
                                        </div>
                                        <Badge variant={getPriorityBadgeVariant(alerta.prioridad) as any} className="uppercase tracking-wide">
                                            {alerta.prioridad}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm">
                                                <span className="text-zinc-600">Cuentas: </span>
                                                <span className="font-medium">{alerta.cuentasAfectadas}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm">
                                                <span className="text-zinc-600">En riesgo: </span>
                                                <span className="font-medium">${Math.round(alerta.dineroEnRiesgo).toLocaleString()}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm text-zinc-600">
                                                {new Date(alerta.fecha).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 p-4 rounded-lg mb-4 backdrop-blur-sm">
                                        <div className="flex items-start gap-2">
                                            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-600 mb-1">Acción Recomendada:</p>
                                                <p className="text-sm text-zinc-800">{alerta.accionRecomendada}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                            <ArrowRight className="w-4 h-4" />
                                            Ver Clientes Afectados
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-2 bg-white">
                                            <Phone className="w-4 h-4" />
                                            Iniciar Campaña
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                            Marcar como Atendida
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Panel de acciones automatizadas */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-none">
                <h3 className="mb-4 font-semibold text-blue-900">Acciones Automatizadas Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-medium">Notificación por Email</h4>
                        </div>
                        <p className="text-xs text-zinc-600 mb-3">
                            Envío automático de correos a clientes en riesgo con recordatorios de pago
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                            Configurar
                        </Button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-medium">Notificación por SMS</h4>
                        </div>
                        <p className="text-xs text-zinc-600 mb-3">
                            Mensajes de texto automáticos con recordatorios y opciones de pago
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                            Configurar
                        </Button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-medium">Asignación a Gestores</h4>
                        </div>
                        <p className="text-xs text-zinc-600 mb-3">
                            Distribución automática de casos a gestores de cobranza según prioridad
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                            Configurar
                        </Button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-medium">Ofertas Personalizadas</h4>
                        </div>
                        <p className="text-xs text-zinc-600 mb-3">
                            Generación de propuestas de refinanciamiento según perfil de cliente
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                            Configurar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
