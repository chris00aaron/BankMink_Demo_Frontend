import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Database } from 'lucide-react';
import { Button } from '@shared/components/ui/button';

interface BatchTransaction {
  id: string;
  clientId: string;
  amount: number;
  category: string;
  status: 'pending' | 'processing' | 'completed';
  confidence: number;
  prediction: 'legitimate' | 'fraud' | 'review';
}

export function BatchPrediction() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<BatchTransaction[]>([]);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processFile = () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    // Generar datos mock
    const mockData: BatchTransaction[] = Array.from({ length: 20 }, (_, i) => ({
      id: `TXN-${1000 + i}`,
      clientId: `CLI-${2000 + i}`,
      amount: Math.floor(Math.random() * 10000) + 100,
      category: ['Retail', 'Online', 'Transfer', 'ATM', 'Restaurant'][Math.floor(Math.random() * 5)],
      status: 'pending' as const,
      confidence: 0,
      prediction: 'legitimate' as const,
    }));

    setTransactions(mockData);

    // Simular procesamiento progresivo
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < mockData.length) {
        setTransactions((prev) =>
          prev.map((t, idx) => {
            if (idx === currentIndex) {
              const confidence = Math.random() * 100;
              let prediction: 'legitimate' | 'fraud' | 'review';

              if (confidence > 85) {
                prediction = 'legitimate';
              } else if (confidence < 50) {
                prediction = 'fraud';
              } else {
                prediction = 'review';
              }

              return {
                ...t,
                status: 'completed',
                confidence: +confidence.toFixed(1),
                prediction,
              };
            } else if (idx === currentIndex + 1) {
              return { ...t, status: 'processing' };
            }
            return t;
          })
        );

        currentIndex++;
        setProgress(Math.round((currentIndex / mockData.length) * 100));
      } else {
        setIsProcessing(false);
        clearInterval(interval);
      }
    }, 300);
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'legitimate':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'fraud':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'review':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'legitimate':
        return <CheckCircle className="w-4 h-4" />;
      case 'fraud':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predicción por Lotes</h1>
        <p className="text-gray-600 mt-1">Procesamiento masivo de transacciones mediante IA</p>
      </div>

      {/* Upload Area */}
      <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 p-8 shadow-lg">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />

          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>

            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Arrastre su archivo CSV aquí
                </p>
                <p className="text-sm text-gray-600">
                  o haga clic para seleccionar desde su ordenador
                </p>
              </div>
            )}

            {file && !isProcessing && (
              <Button
                onClick={processFile}
                className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
              >
                <Database className="w-4 h-4 mr-2" />
                Procesar Archivo
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Procesando transacciones...</span>
              <span className="text-blue-600 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {transactions.length > 0 && (
        <div className="backdrop-blur-xl bg-white/90 rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Resultados del Análisis</h2>
            <p className="text-sm text-gray-600 mt-1">
              {transactions.filter(t => t.status === 'completed').length} de {transactions.length} transacciones procesadas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ID Transacción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ID Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Confianza IA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {transaction.clientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full ${transaction.confidence > 85 ? 'bg-emerald-500' :
                                transaction.confidence < 50 ? 'bg-red-500' : 'bg-orange-500'
                                }`}
                              style={{ width: `${transaction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {transaction.confidence}%
                          </span>
                        </div>
                      ) : transaction.status === 'processing' ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <span className="text-sm text-gray-500">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.status === 'completed' ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPredictionColor(transaction.prediction)}`}>
                          {getPredictionIcon(transaction.prediction)}
                          {transaction.prediction === 'legitimate' ? 'Legítima' :
                            transaction.prediction === 'fraud' ? 'Fraude' : 'Revisar'}
                        </span>
                      ) : transaction.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-blue-600 bg-blue-50 border-blue-200">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Procesando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-gray-600 bg-gray-50 border-gray-200">
                          Pendiente
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
    </div>
  );
}