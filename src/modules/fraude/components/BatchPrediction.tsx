import { useState, useEffect } from 'react';
import {
  CheckCircle, AlertTriangle, Loader2, Database, RefreshCw,
  Play, Clock, TrendingUp, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { batchService, PendingTransaction, BatchItemResult } from '../services/batchService';

export function BatchPrediction() {
  // Estado
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingList, setPendingList] = useState<PendingTransaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchItemResult[]>([]);
  const [summary, setSummary] = useState<{
    totalProcessed: number;
    totalFrauds: number;
    totalLegitimate: number;
    totalErrors: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPendingTable, setShowPendingTable] = useState(true);
  const [batchSize, setBatchSize] = useState(100);

  // Cargar conteo al montar
  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    setIsLoadingPending(true);
    setError(null);
    try {
      const [countRes, listRes] = await Promise.all([
        batchService.getPendingCount(),
        batchService.getPendingTransactions(batchSize)
      ]);
      setPendingCount(countRes.pending_count);
      setPendingList(listRes);
      setSelectedIds(new Set(listRes.map(t => t.id_transaction)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pendingList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingList.map(t => t.id_transaction)));
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleProcess = async () => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    setResults([]);
    setSummary(null);
    setError(null);

    try {
      const result = await batchService.processBatch(Array.from(selectedIds));
      setResults(result.results);
      setSummary({
        totalProcessed: result.total_processed,
        totalFrauds: result.total_frauds,
        totalLegitimate: result.total_legitimate,
        totalErrors: result.total_errors,
      });
      // Recargar pendientes
      await loadPendingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    setResults([]);
    setSummary(null);
    setError(null);

    try {
      const result = await batchService.processNextBatch(batchSize);
      setResults(result.results);
      setSummary({
        totalProcessed: result.total_processed,
        totalFrauds: result.total_frauds,
        totalLegitimate: result.total_legitimate,
        totalErrors: result.total_errors,
      });
      // Recargar pendientes
      await loadPendingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const getVeredictoColor = (veredicto: string) => {
    if (veredicto === 'ALTO RIESGO') return 'text-red-600 bg-red-50 border-red-200';
    if (veredicto === 'LEGÍTIMO') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción por Lotes</h1>
        <p className="text-gray-600 mt-1">
          Procesa múltiples transacciones pendientes de análisis
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-3xl font-bold text-blue-600">
                {isLoadingPending ? '...' : pendingCount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Seleccionadas</p>
              <p className="text-3xl font-bold text-purple-600">{selectedIds.size}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {summary && (
          <>
            <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-emerald-200 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Legítimas</p>
                  <p className="text-3xl font-bold text-emerald-600">{summary.totalLegitimate}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-red-200 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Alto Riesgo</p>
                  <p className="text-3xl font-bold text-red-600">{summary.totalFrauds}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Cantidad:</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={loadPendingData}
              disabled={isLoadingPending}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingPending ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleProcess}
              disabled={isProcessing || selectedIds.size === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Procesar Seleccionadas ({selectedIds.size})
                </>
              )}
            </Button>
            <Button
              onClick={handleProcessAll}
              disabled={isProcessing || pendingCount === 0}
              variant="outline"
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Procesar Todo ({Math.min(batchSize, pendingCount)})
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Transactions Table */}
      {pendingList.length > 0 && (
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div
            className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => setShowPendingTable(!showPendingTable)}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Transacciones Pendientes ({pendingList.length})
            </h2>
            {showPendingTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>

          {showPendingTable && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === pendingList.length && pendingList.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tarjeta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingList.map((t) => (
                    <tr key={t.id_transaction} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(t.id_transaction)}
                          onChange={() => handleSelectOne(t.id_transaction)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{t.trans_num}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(t.trans_date_time)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{t.customer_name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{t.cc_num_masked}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ${t.amt?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.category?.replace(/_/g, ' ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados del Procesamiento
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {summary?.totalProcessed} transacciones procesadas •
              {' '}<span className="text-emerald-600 font-medium">{summary?.totalLegitimate} legítimas</span> •
              {' '}<span className="text-red-600 font-medium">{summary?.totalFrauds} fraudes</span>
              {summary?.totalErrors ? <span className="text-amber-600"> • {summary.totalErrors} errores</span> : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Transacción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Veredicto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.trans_num || `ID: ${r.id_transaction}`}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.amt ? `$${r.amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {r.score !== null && r.score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${r.score > 0.5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${r.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {(r.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {r.veredicto ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getVeredictoColor(r.veredicto)}`}>
                          {r.veredicto === 'ALTO RIESGO' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {r.veredicto}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle className="w-4 h-4" /> OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-sm" title={r.error_message}>
                          Error: {r.error_message?.substring(0, 30)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingList.length === 0 && !isLoadingPending && (
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-12 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">¡Todo al día!</h3>
          <p className="text-gray-500 mt-1">No hay transacciones pendientes de análisis</p>
        </div>
      )}
    </div>
  );
}