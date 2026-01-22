import { UserRole } from "../types/index";

/**
 * CREDENCIALES DE ACCESO:
 * 
 * ADMINISTRADOR:
 * - Usuario: admin
 * - Contraseña: admin123
 * - Acceso: Todos los servicios + Auditoría + Gestión de Usuarios
 * 
 * OPERARIOS:
 * - Usuario: op-morosidad | Contraseña: mora123 | Servicio: Morosidad Detalle
 * - Usuario: op-anomalias | Contraseña: anom123 | Servicio: Anomalías Transaccionales
 * - Usuario: op-demanda | Contraseña: dema123 | Servicio: Demanda Efectivo
 * - Usuario: op-fuga | Contraseña: fuga123 | Servicio: Fuga Demanda
 */
export const mockUsers: Record<string, { password: string; role: UserRole; name: string }> = {
  'admin': { password: 'admin123', role: 'admin', name: 'Administrador' },
  'op-morosidad': { password: 'mora123', role: 'operario-morosidad', name: 'Operario Morosidad' },
  'op-anomalias': { password: 'anom123', role: 'operario-anomalias', name: 'Operario Anomalías' },
  'op-demanda': { password: 'dema123', role: 'operario-demanda-efectivo', name: 'Operario Demanda Efectivo' },
  'op-fuga': { password: 'fuga123', role: 'operario-fuga-demanda', name: 'Operario Fuga Demanda' },
};