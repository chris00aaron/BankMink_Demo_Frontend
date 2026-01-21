import { useState } from 'react';
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
    Calendar
} from 'lucide-react';
import { mockClients } from '../utils/mockData';

interface Alert {
    id: string;
    tipo: 'critico' | 'alto' | 'tendencia' | 'vencimiento';
    titulo: string;
    descripcion: string;
    clientesAfectados: number;
    dineroEnRiesgo: number;
    prioridad: 'urgente' | 'alta' | 'media';
    fecha: string;
    accionRecomendada: string;
}

export function EarlyWarningsPage() {
    const [umbralRiesgo, setUmbralRiesgo] = useState([30]);
    const [diasAnticipacion, setDiasAnticipacion] = useState([7]);
    const [alertasActivas, setAlertasActivas] = useState(true);

    // Generar alertas basadas en los datos
    const generarAlertas = (): Alert[] => {
        if (!alertasActivas) return [];

        const alertas: Alert[] = [];

        // Alerta 1: Clientes con riesgo crítico
        const clientesCriticos = mockClients.filter(c => c.probabilidadPago < 15);
        if (clientesCriticos.length > 0) {
            alertas.push({
                id: 'alert-1',
                tipo: 'critico',
                titulo: 'Clientes en Riesgo Crítico',
                descripcion: `${clientesCriticos.length} clientes tienen menos de 15% de probabilidad de pago`,
                clientesAfectados: clientesCriticos.length,
                dineroEnRiesgo: clientesCriticos.reduce((sum, c) => sum + c.montoCuota, 0),
                prioridad: 'urgente',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Contacto inmediato y evaluación de reestructuración'
            });
        }

        // Alerta 2: Aumento de morosidad en segmento joven
        const clientesJovenes = mockClients.filter(c => c.edad < 30);
        const jovenesMorosos = clientesJovenes.filter(c => c.probabilidadPago < 50);
        if (jovenesMorosos.length > clientesJovenes.length * 0.3) {
            alertas.push({
                id: 'alert-2',
                tipo: 'tendencia',
                titulo: 'Tendencia de Riesgo en Clientes Jóvenes',
                descripcion: `${((jovenesMorosos.length / (clientesJovenes.length || 1)) * 100).toFixed(1)}% de clientes menores de 30 años están en riesgo`,
                clientesAfectados: jovenesMorosos.length,
                dineroEnRiesgo: jovenesMorosos.reduce((sum, c) => sum + c.montoCuota, 0),
                prioridad: 'alta',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Revisar políticas de crédito para este segmento'
            });
        }

        // Alerta 3: Clientes con múltiples cuotas atrasadas
        const multipleAtrasos = mockClients.filter(c => c.cuotasAtrasadas >= 3);
        if (multipleAtrasos.length > 0) {
            alertas.push({
                id: 'alert-3',
                tipo: 'alto',
                titulo: 'Clientes con Múltiples Cuotas Atrasadas',
                descripcion: `${multipleAtrasos.length} clientes tienen 3 o más cuotas atrasadas`,
                clientesAfectados: multipleAtrasos.length,
                dineroEnRiesgo: multipleAtrasos.reduce((sum, c) => sum + c.montoCuota * c.cuotasAtrasadas, 0),
                prioridad: 'urgente',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Activar protocolo de cobranza avanzada'
            });
        }

        // Alerta 4: Deterioro en clientes con educación primaria
        const clientesPrimaria = mockClients.filter(c => c.educacion === 'Primaria');
        const primariaMorosos = clientesPrimaria.filter(c => c.probabilidadPago < 50);
        if (clientesPrimaria.length > 0 && primariaMorosos.length > clientesPrimaria.length * 0.4) {
            alertas.push({
                id: 'alert-4',
                tipo: 'tendencia',
                titulo: 'Alto Riesgo en Clientes con Educación Primaria',
                descripcion: `${((primariaMorosos.length / clientesPrimaria.length) * 100).toFixed(1)}% de este segmento presenta riesgo`,
                clientesAfectados: primariaMorosos.length,
                dineroEnRiesgo: primariaMorosos.reduce((sum, c) => sum + c.montoCuota, 0),
                prioridad: 'media',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Programa de educación financiera y acompañamiento'
            });
        }

        // Alerta 5: Clientes divorciados con alto riesgo
        const clientesDivorciados = mockClients.filter(c => c.estadoCivil === 'Divorciado');
        const divorciadosMorosos = clientesDivorciados.filter(c => c.probabilidadPago < umbralRiesgo[0]);
        if (divorciadosMorosos.length > 0) {
            alertas.push({
                id: 'alert-5',
                tipo: 'alto',
                titulo: 'Clientes Divorciados en Riesgo',
                descripcion: `${divorciadosMorosos.length} clientes divorciados bajo el umbral de ${umbralRiesgo[0]}%`,
                clientesAfectados: divorciadosMorosos.length,
                dineroEnRiesgo: divorciadosMorosos.reduce((sum, c) => sum + c.montoCuota, 0),
                prioridad: 'alta',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Evaluación de situación personal y opciones de pago'
            });
        }

        // Alerta 6: Nuevos clientes con indicadores de riesgo
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 6);
        const clientesNuevos = mockClients.filter(c => new Date(c.fechaRegistro) > fechaLimite);
        const nuevosRiesgo = clientesNuevos.filter(c => c.probabilidadPago < 50);
        if (nuevosRiesgo.length > 0) {
            alertas.push({
                id: 'alert-6',
                tipo: 'tendencia',
                titulo: 'Clientes Nuevos con Señales de Riesgo',
                descripcion: `${nuevosRiesgo.length} clientes con menos de 6 meses presentan riesgo temprano`,
                clientesAfectados: nuevosRiesgo.length,
                dineroEnRiesgo: nuevosRiesgo.reduce((sum, c) => sum + c.montoCuota, 0),
                prioridad: 'media',
                fecha: new Date().toISOString(),
                accionRecomendada: 'Revisión de proceso de originación de créditos'
            });
        }

        return alertas;
    };

    const alertas = generarAlertas();

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
            case 'alta': return 'default'; // Using default for high
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

    const totalClientesEnAlerta = alertas.reduce((sum, a) => sum + a.clientesAfectados, 0);
    const totalDineroEnRiesgo = alertas.reduce((sum, a) => sum + a.dineroEnRiesgo, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sistema de Alertas Tempranas</h1>
                <p className="text-zinc-600">
                    Monitoreo proactivo y detección automática de patrones de riesgo
                </p>
            </div>

            {/* Panel de configuración */}
            <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <h2 className="font-semibold text-zinc-900">Configuración de Alertas</h2>
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
                                Días de Anticipación
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
                            Días antes del vencimiento para generar alertas preventivas
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
                            <p className="text-2xl font-bold text-zinc-900">{alertas.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-600">Clientes en Alerta</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalClientesEnAlerta}</p>
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
                            <p className="text-2xl font-bold text-zinc-900">${Math.round(totalDineroEnRiesgo / 1000)}K</p>
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

                {alertas.length === 0 ? (
                    <Card className="p-12 text-center bg-white border-0 shadow-sm">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 mb-2">No hay alertas activas</h3>
                        <p className="text-zinc-600">
                            Todos los indicadores están dentro de los parámetros normales
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
                                                <span className="text-zinc-600">Clientes: </span>
                                                <span className="font-medium">{alerta.clientesAfectados}</span>
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
