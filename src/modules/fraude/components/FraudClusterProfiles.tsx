import { useState, useEffect, useCallback } from 'react';
import {
    Users, Clock, DollarSign, MapPin, ShoppingBag,
    RefreshCw, AlertTriangle, Loader2, TrendingUp
} from 'lucide-react';
import { apiRequest } from '../../../shared/services/apiClient';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ClusterProfile {
    clusterId: number;
    label: string;
    fraudCount: number;
    pctOfTotal: number;
    avgAmount: number;
    avgHour: number;
    avgAge: number;
    avgDistanceKm: number;
    topCategory: string | null;
    topState: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLUSTER_COLORS = [
    { bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-600', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    { bg: 'bg-violet-50', border: 'border-violet-200', accent: 'bg-violet-600', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
    { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-600', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
];

function getColor(idx: number) {
    return CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
}

function formatHour(h: number): string {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const period = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return `${hr12}:${min.toString().padStart(2, '0')} ${period}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FraudClusterProfiles() {
    const [profiles, setProfiles] = useState<ClusterProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

    // ── Carga inicial ────────────────────────────────────────────────────────
    const loadProfiles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await apiRequest<ClusterProfile[]>('/fraud/stats/clusters');
            setProfiles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar perfiles.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadProfiles(); }, [loadProfiles]);

    // ── Actualización manual (trigger K-Means) ───────────────────────────────
    const handleRefresh = async () => {
        setIsRefreshing(true);
        setRefreshMsg(null);
        setError(null);
        try {
            const result = await apiRequest<{ profiles: ClusterProfile[]; message: string }>(
                '/fraud/stats/clusters/refresh', 'POST'
            );
            setProfiles(result.profiles);
            setRefreshMsg(result.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar perfiles.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Perfiles de Defraudadores
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Análisis K-Means sobre transacciones ALTO RIESGO · Actualización semanal automática
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700
                     bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRefreshing
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <RefreshCw className="w-3.5 h-3.5" />
                    }
                    {isRefreshing ? 'Analizando...' : 'Actualizar análisis'}
                </button>
            </div>

            {/* Mensaje de refresh */}
            {refreshMsg && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    ✓ {refreshMsg}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
            )}

            {/* Sin datos */}
            {!isLoading && !error && profiles.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Sin análisis disponible</p>
                    <p className="text-xs mt-1">Pulsa "Actualizar análisis" para generar los perfiles.</p>
                </div>
            )}

            {/* Tarjetas de perfil */}
            {!isLoading && profiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profiles.map((profile, idx) => {
                        const color = getColor(idx);
                        return (
                            <div
                                key={profile.clusterId}
                                className={`rounded-xl border ${color.bg} ${color.border} p-4 shadow-sm hover:shadow-md transition-shadow`}
                            >
                                {/* Cabecera de tarjeta */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${color.badge}`}>
                                            Perfil {profile.clusterId + 1}
                                        </span>
                                        <h3 className={`text-sm font-semibold leading-tight ${color.text}`}>
                                            {profile.label}
                                        </h3>
                                    </div>
                                    {/* Barra de porcentaje */}
                                    <div className="ml-3 text-right flex-shrink-0">
                                        <span className={`text-xl font-bold ${color.text}`}>
                                            {profile.pctOfTotal.toFixed(1)}%
                                        </span>
                                        <p className="text-[10px] text-gray-500">{profile.fraudCount} fraudes</p>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="w-full bg-white/60 rounded-full h-1.5 mb-3">
                                    <div
                                        className={`h-1.5 rounded-full ${color.accent}`}
                                        style={{ width: `${Math.min(profile.pctOfTotal, 100)}%` }}
                                    />
                                </div>

                                {/* Métricas */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">${profile.avgAmount.toFixed(0)}</span>
                                        <span className="text-gray-400">prom.</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">{formatHour(profile.avgHour)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Users className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">{profile.avgAge.toFixed(0)} años</span>
                                        <span className="text-gray-400">prom.</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">{profile.avgDistanceKm.toFixed(0)} km</span>
                                    </div>
                                    {profile.topCategory && (
                                        <div className="col-span-2 flex items-center gap-1.5 text-gray-600">
                                            <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                            <span className="font-medium truncate">{profile.topCategory}</span>
                                            {profile.topState && (
                                                <span className="text-gray-400 ml-auto flex-shrink-0">· {profile.topState}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FraudClusterProfiles;
