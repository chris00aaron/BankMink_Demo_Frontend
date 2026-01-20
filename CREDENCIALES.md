# 🔐 XRAI Framework - Credenciales de Acceso

## 👨‍💼 Administrador

**Acceso Completo a Todos los Servicios + Auditoría + Gestión de Usuarios**

- **Usuario:** `admin`
- **Contraseña:** `admin123`

---

## 👷 Operarios

Cada operario tiene acceso únicamente a su servicio asignado:

### Morosidad Detalle
- **Usuario:** `op-morosidad`
- **Contraseña:** `mora123`

### Anomalías Transaccionales (Detección de Fraude)
- **Usuario:** `op-anomalias`
- **Contraseña:** `anom123`

### Demanda Efectivo
- **Usuario:** `op-demanda`
- **Contraseña:** `dema123`

### Fuga Demanda
- **Usuario:** `op-fuga`
- **Contraseña:** `fuga123`

---

## 📋 Descripción de Roles

### Administrador
- ✅ Acceso a todos los servicios
- ✅ Módulo de Auditoría
- ✅ Gestión de Usuarios
- ✅ Puede navegar entre servicios desde la página principal
- ✅ Tiene botón "Volver al Inicio" en todos los módulos

### Operarios
- ✅ Acceso limitado a su servicio específico
- ❌ No pueden acceder a otros servicios
- ❌ No tienen acceso a Auditoría ni Gestión de Usuarios
- 📌 Al iniciar sesión, van directamente a su servicio asignado
- ❌ No tienen botón para volver a la página principal (excepto el operario de Anomalías Transaccionales que puede volver al dashboard)

---

## 🚀 Servicios Disponibles

1. **Morosidad Detalle** - Análisis de patrones de morosidad
2. **Anomalías Transaccionales** - Detección de fraude (COMPLETAMENTE FUNCIONAL)
3. **Demanda Efectivo** - Predicción de demanda en cajeros
4. **Fuga Demanda** - Detección de riesgo de abandono de clientes

> **Nota:** Solo el servicio de "Anomalías Transaccionales" está completamente implementado. Los demás muestran una página de "Módulo en Desarrollo".
