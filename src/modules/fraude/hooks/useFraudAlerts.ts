import { useState, useEffect, useCallback, useRef } from 'react';
import { fraudService, FraudAlert, FraudAlertsPage, AlertsParams } from '../services/fraudService';

interface UseFraudAlertsOptions {
    autoRefresh?: boolean;           // Habilitar polling
    refreshInterval?: number;        // Intervalo en ms (default: 10000)
    initialSize?: number;            // Cantidad inicial por página
    initialSortBy?: 'score' | 'date'; // Ordenamiento inicial
    initialDateFilter?: 'today' | 'week' | 'all'; // Filtro de fecha inicial
}

interface UseFraudAlertsReturn {
    // Datos
    alerts: FraudAlert[];
    selectedAlert: FraudAlert | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;

    // Estado
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;

    // Filtros actuales
    filters: AlertsParams;

    // Acciones
    selectAlert: (alert: FraudAlert) => void;
    loadAlertDetail: (predictionId: number) => Promise<void>;
    setPage: (page: number) => void;
    setVeredicto: (veredicto: string) => void;
    setSearch: (search: string) => void;
    setSortBy: (sortBy: 'score' | 'date') => void;
    setDateFilter: (dateFilter: 'today' | 'week' | 'all') => void;
    refresh: () => Promise<void>;
}

/**
 * Hook personalizado para manejar alertas de fraude
 * Incluye polling automático, filtros, búsqueda y paginación
 */
export function useFraudAlerts(options: UseFraudAlertsOptions = {}): UseFraudAlertsReturn {
    const {
        autoRefresh = true,
        refreshInterval = 10000,
        initialSize = 20,
        initialSortBy = 'score',
        initialDateFilter = 'all',
    } = options;

    // Estado de datos
    const [alertsData, setAlertsData] = useState<FraudAlertsPage | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

    // Estado de UI
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filters, setFilters] = useState<AlertsParams>({
        page: 0,
        size: initialSize,
        sortBy: initialSortBy,
        order: 'desc',
        veredicto: undefined,
        search: undefined,
        dateFilter: initialDateFilter,
    });

    // Ref para el intervalo de polling
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Función para cargar alertas
    const loadAlerts = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            else setIsRefreshing(true);

            setError(null);
            const data = await fraudService.getAlerts(filters);
            setAlertsData(data);

            // Si hay alertas y no hay ninguna seleccionada, seleccionar la primera
            if (data.content.length > 0 && !selectedAlert) {
                setSelectedAlert(data.content[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar alertas');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filters, selectedAlert]);

    // Cargar alertas al montar y cuando cambian los filtros
    useEffect(() => {
        loadAlerts(true);
    }, [filters]);

    // Configurar polling
    useEffect(() => {
        if (autoRefresh) {
            pollingRef.current = setInterval(() => {
                loadAlerts(false);
            }, refreshInterval);
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, loadAlerts]);

    // Cargar detalle de una alerta específica
    const loadAlertDetail = useCallback(async (predictionId: number) => {
        try {
            const detail = await fraudService.getAlertDetail(predictionId);
            setSelectedAlert(detail);
        } catch (err) {
            console.error('Error al cargar detalle:', err);
        }
    }, []);

    // Acciones
    const selectAlert = useCallback((alert: FraudAlert) => {
        setSelectedAlert(alert);
        // Si no tiene detalles SHAP, cargarlos
        if (!alert.detalles_riesgo) {
            loadAlertDetail(alert.prediction_id);
        }
    }, [loadAlertDetail]);

    const setPage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const setVeredicto = useCallback((veredicto: string) => {
        setFilters(prev => ({ ...prev, veredicto, page: 0 }));
    }, []);

    const setSearch = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search, page: 0 }));
    }, []);

    const setSortBy = useCallback((sortBy: 'score' | 'date') => {
        setFilters(prev => ({ ...prev, sortBy, page: 0 }));
    }, []);

    const setDateFilter = useCallback((dateFilter: 'today' | 'week' | 'all') => {
        setFilters(prev => ({ ...prev, dateFilter, page: 0 }));
    }, []);

    const refresh = useCallback(async () => {
        await loadAlerts(false);
    }, [loadAlerts]);

    return {
        // Datos
        alerts: alertsData?.content || [],
        selectedAlert,
        totalElements: alertsData?.total_elements || 0,
        totalPages: alertsData?.total_pages || 0,
        currentPage: alertsData?.page || 0,
        hasNext: alertsData?.has_next || false,
        hasPrevious: alertsData?.has_previous || false,

        // Estado
        isLoading,
        isRefreshing,
        error,

        // Filtros
        filters,

        // Acciones
        selectAlert,
        loadAlertDetail,
        setPage,
        setVeredicto,
        setSearch,
        setSortBy,
        setDateFilter,
        refresh,
    };
}

export default useFraudAlerts;
