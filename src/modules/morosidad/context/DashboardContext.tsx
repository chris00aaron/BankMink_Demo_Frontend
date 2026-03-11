import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getDashboardData } from '../services/morosidadService';
import type { DashboardData } from '../types/morosidad.types';

interface DashboardContextType {
    data: DashboardData | null;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carga inicial — solo si no hay datos
    useEffect(() => {
        if (!data) {
            const load = async () => {
                try {
                    setIsLoading(true);
                    const result = await getDashboardData();
                    setData(result);
                    setError(null);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }
    }, []); // Solo al montar el provider

    // Refetch silencioso — no muestra loader de pantalla completa
    const refresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const result = await getDashboardData();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    return (
        <DashboardContext.Provider value={{ data, isLoading, isRefreshing, error, refresh }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
    return ctx;
}
