import { useState, useMemo } from 'react';
import { Card } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@shared/components/ui/select';
import {
    Filter,
    Download,
    Users,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Calendar,
    GraduationCap,
    Heart,
    Cake,
    FileText,
    BarChart3
} from 'lucide-react';
import { mockClients } from '../utils/mockData';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const COLORS = {
    Crítico: '#dc2626',
    Alto: '#ea580c',
    Medio: '#f59e0b',
    Bajo: '#22c55e'
};

export function BatchPredictionPage() {
    const [filters, setFilters] = useState({
        edadMin: '',
        edadMax: '',
        educacion: 'all',
        estadoCivil: 'all',
        fechaDesde: '',
        fechaHasta: ''
    });

    const [showResults, setShowResults] = useState(false);

    // Filtrar clientes basado en los criterios
    const filteredClients = useMemo(() => {
        return mockClients.filter(client => {
            // Filtro por edad
            if (filters.edadMin && client.edad < parseInt(filters.edadMin)) return false;
            if (filters.edadMax && client.edad > parseInt(filters.edadMax)) return false;

            // Filtro por educación
            if (filters.educacion !== 'all' && client.educacion !== filters.educacion) return false;

            // Filtro por estado civil
            if (filters.estadoCivil !== 'all' && client.estadoCivil !== filters.estadoCivil) return false;

            // Filtro por fecha de registro
            if (filters.fechaDesde && client.fechaRegistro < filters.fechaDesde) return false;
            if (filters.fechaHasta && client.fechaRegistro > filters.fechaHasta) return false;

            return true;
        });
    }, [filters]);

    // Calcular estadísticas del lote filtrado
    const batchStats = useMemo(() => {
        const total = filteredClients.length;
        const enRiesgo = filteredClients.filter(c => c.probabilidadPago < 50).length;
        const dineroEnRiesgo = filteredClients
            .filter(c => c.probabilidadPago < 50)
            .reduce((sum, c) => sum + c.montoCuota, 0);
        const promedioProb = filteredClients.reduce((sum, c) => sum + c.probabilidadPago, 0) / (total || 1);

        return {
            total,
            enRiesgo,
            dineroEnRiesgo,
            promedioProb,
            porNivel: {
                Crítico: filteredClients.filter(c => c.nivelRiesgo === 'Crítico').length,
                Alto: filteredClients.filter(c => c.nivelRiesgo === 'Alto').length,
                Medio: filteredClients.filter(c => c.nivelRiesgo === 'Medio').length,
                Bajo: filteredClients.filter(c => c.nivelRiesgo === 'Bajo').length
            }
        };
    }, [filteredClients]);

    const handleApplyFilters = () => {
        setShowResults(true);
    };

    const handleClearFilters = () => {
        setFilters({
            edadMin: '',
            edadMax: '',
            educacion: 'all',
            estadoCivil: 'all',
            fechaDesde: '',
            fechaHasta: ''
        });
        setShowResults(false);
    };

    const exportResults = () => {
        const csv = [
            ['ID', 'Nombre', 'Edad', 'Educación', 'Estado Civil', 'Probabilidad de Pago', 'Nivel de Riesgo', 'Monto Cuota'].join(','),
            ...filteredClients.map(c => [
                c.id,
                c.nombre,
                c.edad,
                c.educacion,
                c.estadoCivil,
                c.probabilidadPago,
                c.nivelRiesgo,
                c.montoCuota
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prediccion_lotes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Datos para gráfico de distribución por nivel de riesgo
    const riskDistributionData = [
        { nivel: 'Crítico', cantidad: batchStats.porNivel.Crítico },
        { nivel: 'Alto', cantidad: batchStats.porNivel.Alto },
        { nivel: 'Medio', cantidad: batchStats.porNivel.Medio },
        { nivel: 'Bajo', cantidad: batchStats.porNivel.Bajo }
    ];

    // Datos para gráfico de distribución por educación
    const educationDistribution = useMemo(() => {
        const groups = ['Primaria', 'Secundaria', 'Universitaria', 'Postgrado'];
        return groups.map(edu => ({
            educacion: edu,
            cantidad: filteredClients.filter(c => c.educacion === edu).length,
            enRiesgo: filteredClients.filter(c => c.educacion === edu && c.probabilidadPago < 50).length
        }));
    }, [filteredClients]);

    // Datos para gráfico de distribución por estado civil
    const maritalStatusDistribution = useMemo(() => {
        const groups = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];
        return groups.map(status => ({
            estado: status,
            cantidad: filteredClients.filter(c => c.estadoCivil === status).length,
            enRiesgo: filteredClients.filter(c => c.estadoCivil === status && c.probabilidadPago < 50).length
        }));
    }, [filteredClients]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Predicción por Lotes</h1>
                <p className="text-zinc-600">
                    Analiza grupos de clientes aplicando filtros demográficos y temporales
                </p>
            </div>

            {/* Panel de filtros */}
            <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-zinc-900">Filtros de Segmentación</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Filtro por edad */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm text-zinc-700">
                            <Cake className="w-4 h-4 text-zinc-500" />
                            Rango de Edad
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.edadMin}
                                onChange={(e) => setFilters({ ...filters, edadMin: e.target.value })}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.edadMax}
                                onChange={(e) => setFilters({ ...filters, edadMax: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Filtro por educación */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm text-zinc-700">
                            <GraduationCap className="w-4 h-4 text-zinc-500" />
                            Nivel de Educación
                        </label>
                        <Select
                            value={filters.educacion}
                            onValueChange={(val) => setFilters({ ...filters, educacion: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar nivel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Primaria">Primaria</SelectItem>
                                <SelectItem value="Secundaria">Secundaria</SelectItem>
                                <SelectItem value="Universitaria">Universitaria</SelectItem>
                                <SelectItem value="Postgrado">Postgrado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por estado civil */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm text-zinc-700">
                            <Heart className="w-4 h-4 text-zinc-500" />
                            Estado Civil
                        </label>
                        <Select
                            value={filters.estadoCivil}
                            onValueChange={(val) => setFilters({ ...filters, estadoCivil: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Soltero">Soltero</SelectItem>
                                <SelectItem value="Casado">Casado</SelectItem>
                                <SelectItem value="Divorciado">Divorciado</SelectItem>
                                <SelectItem value="Viudo">Viudo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por fecha de registro - desde */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm text-zinc-700">
                            <Calendar className="w-4 h-4 text-zinc-500" />
                            Fecha de Registro Desde
                        </label>
                        <Input
                            type="date"
                            value={filters.fechaDesde}
                            onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                        />
                    </div>

                    {/* Filtro por fecha de registro - hasta */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm text-zinc-700">
                            <Calendar className="w-4 h-4 text-zinc-500" />
                            Fecha de Registro Hasta
                        </label>
                        <Input
                            type="date"
                            value={filters.fechaHasta}
                            onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                        />
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-6">
                    <Button onClick={handleApplyFilters} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <BarChart3 className="w-4 h-4" />
                        Aplicar Filtros y Analizar
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                        Limpiar Filtros
                    </Button>
                </div>
            </Card>

            {/* Resultados */}
            {showResults && (
                <>
                    {/* Métricas principales del lote */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-600">Total Clientes</p>
                                    <p className="text-2xl font-bold text-zinc-900">{batchStats.total}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-600">En Riesgo</p>
                                    <p className="text-2xl font-bold text-zinc-900">{batchStats.enRiesgo}</p>
                                    <p className="text-xs text-zinc-500">
                                        {batchStats.total > 0
                                            ? `${((batchStats.enRiesgo / batchStats.total) * 100).toFixed(1)}%`
                                            : '0%'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-600">Dinero en Riesgo</p>
                                    <p className="text-2xl font-bold text-zinc-900">${Math.round(batchStats.dineroEnRiesgo).toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-600">Prob. Promedio de Pago</p>
                                    <p className="text-2xl font-bold text-zinc-900">{batchStats.promedioProb.toFixed(1)}%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Gráficos de distribución */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Distribución por nivel de riesgo */}
                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <h3 className="mb-4 font-semibold text-zinc-900">Distribución por Nivel de Riesgo</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={riskDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.nivel}: ${entry.cantidad}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="cantidad"
                                    >
                                        {riskDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.nivel as keyof typeof COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Distribución por educación */}
                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <h3 className="mb-4 font-semibold text-zinc-900">Distribución por Nivel Educativo</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={educationDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="educacion" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f4f4f5' }} />
                                    <Legend />
                                    <Bar dataKey="cantidad" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="enRiesgo" fill="#ef4444" name="En Riesgo" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Distribución por estado civil */}
                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <h3 className="mb-4 font-semibold text-zinc-900">Distribución por Estado Civil</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={maritalStatusDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="estado" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f4f4f5' }} />
                                    <Legend />
                                    <Bar dataKey="cantidad" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="enRiesgo" fill="#ef4444" name="En Riesgo" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Resumen por nivel de riesgo */}
                        <Card className="p-6 bg-white border-0 shadow-sm">
                            <h3 className="mb-4 font-semibold text-zinc-900">Resumen por Nivel de Riesgo</h3>
                            <div className="space-y-3">
                                {Object.entries(batchStats.porNivel).map(([nivel, cantidad]) => (
                                    <div
                                        key={nivel}
                                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: COLORS[nivel as keyof typeof COLORS] }}
                                            />
                                            <span className="text-sm font-medium text-zinc-700">{nivel}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-zinc-900">{cantidad} clientes</p>
                                            <p className="text-xs text-zinc-500">
                                                {batchStats.total > 0
                                                    ? `${((cantidad / batchStats.total) * 100).toFixed(1)}%`
                                                    : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Tabla de resultados */}
                    <Card className="overflow-hidden bg-white border-0 shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-zinc-900">Resultados Detallados</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {batchStats.total} clientes en el lote filtrado
                                </p>
                            </div>
                            <Button onClick={exportResults} variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                Exportar CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">ID</th>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Nombre</th>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Edad</th>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Educación</th>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Estado Civil</th>
                                        <th className="text-right py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Prob. Pago</th>
                                        <th className="text-left py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Nivel Riesgo</th>
                                        <th className="text-right py-3 px-6 text-xs text-zinc-500 font-medium uppercase tracking-wider">Monto Cuota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredClients.slice(0, 50).map((client) => (
                                        <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="py-3 px-6 text-sm text-zinc-900">{client.id}</td>
                                            <td className="py-3 px-6 text-sm text-zinc-900 font-medium">{client.nombre}</td>
                                            <td className="py-3 px-6 text-sm text-zinc-600">{client.edad}</td>
                                            <td className="py-3 px-6 text-sm text-zinc-600">{client.educacion}</td>
                                            <td className="py-3 px-6 text-sm text-zinc-600">{client.estadoCivil}</td>
                                            <td className="py-3 px-6 text-sm text-right font-medium">{client.probabilidadPago.toFixed(1)}%</td>
                                            <td className="py-3 px-6 text-sm">
                                                <span
                                                    className="px-2 py-1 rounded-full text-xs text-white font-medium"
                                                    style={{ backgroundColor: COLORS[client.nivelRiesgo] }}
                                                >
                                                    {client.nivelRiesgo}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-sm text-right text-zinc-900">
                                                ${client.montoCuota.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClients.length > 50 && (
                                <div className="p-4 bg-zinc-50 text-center text-sm text-zinc-500">
                                    Mostrando 50 de {filteredClients.length} resultados. Exporta el CSV para ver todos.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Insights */}
                    <Card className="p-6 bg-blue-50 border-blue-100 border shadow-none">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                                <h3 className="mb-3 font-semibold text-blue-900">Insights del Lote Analizado</h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-blue-800">
                                        → El {((batchStats.enRiesgo / (batchStats.total || 1)) * 100).toFixed(1)}% del lote presenta riesgo de morosidad
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        → Exposición financiera total: ${Math.round(batchStats.dineroEnRiesgo).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        → Probabilidad promedio de pago: {batchStats.promedioProb.toFixed(1)}%
                                    </p>
                                    {batchStats.porNivel.Crítico > 0 && (
                                        <p className="text-sm text-red-700 font-medium">
                                            → ⚠️ {batchStats.porNivel.Crítico} clientes requieren atención inmediata (riesgo crítico)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
