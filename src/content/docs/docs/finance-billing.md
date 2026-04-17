---
title: Finanzas y Facturación
description: Integración del frontend con el módulo de finanzas y facturación del backend.
---

Este documento describe cómo el frontend debe integrarse con el API del módulo de finanzas y el flujo de facturación automática descrito en el backend (`/api/v1/finance` y `/api/v1/medical`).

## 1. Flujo de la Consulta Médica y Facturación Automática

El proceso principal de negocio automatizado ocurre al momento de atender y finalizar una cita médica.

### 1.1 Iniciar Consulta
- **Endpoint**:
  ```http
  POST /api/v1/medical/consultation
  ```
- **Vista Asociada**: Pantalla de atención médica (Doctor).
- **Acción UI**: Se llama al momento en que el doctor empieza a atender al paciente.
- **Payload**: El frontend puede omitir `started_at` (el backend asume la hora actual por defecto).
- **Estado**: Se debe guardar el `ID` de esta consulta retornada (`consultationId`) en el estado global/local de la aplicación para poder vincular insumos y finalizarla posteriormente.

### 1.2 Agregar Insumos a la Consulta (Opcional)
- **Endpoint**:
  ```http
  POST /api/v1/inventory/supply-consultation
  ```
- **Vista Asociada**: Sección "Insumos" o "Materiales Utilizados" dentro de la pantalla de consulta.
- **Componente Sugerido**: Un Autocomplete/Buscador de productos del inventario y un input para la cantidad requerida.
- **Payload**: Requiere enviar `consultationId`, `productId` y `quantity`.
- **Nota**: El backend acumulará estos insumos y formarán parte automática de la factura al finalizar.

### 1.3 Finalizar Consulta (Disparador de Facturación)
- **Endpoint**:
  ```http
  PUT /api/v1/medical/consultation/:id
  ```
- **Vista Asociada**: Botón final "Finalizar Consulta".
- **Payload**: Se debe enviar el parámetro `finished_at` (fecha y hora actual en ISO).
- **Triggers**: Al enviar el request, el backend automáticamente genera la **Factura (Status: Proforma)** con los ítems (Costo de consulta + insumos cargados).
- **⚠️ Manejo de Errores Crítico (Modo Estricto)**:
  - La creación automática de la factura **fallará en el backend** si el sistema no tiene configurado al menos 1 **Tasa de Cambio (ExchangeRate)** activa, 1 **Impuesto (Tax)** activo o 1 **Estado de Factura**. En ese caso, la consulta **no se dará por finalizada**.
  - El frontend **debe** capturar mediante un bloque `.catch()` el error devuelto por la API (ej. `400 Bad Request` o mensaje de validación) y mostrar al doctor un modal o alerta grave indicando: *"No se pudo finalizar la consulta debido a que faltan configuraciones del módulo de finanzas (Tasa de cambio/Impuestos). Contacte a administración."*

## 2. Configuración Financiera (Administración)

El panel administrativo requiere pantallas de gestión tipo CRUD (Create, Read, Update, Delete) para mantener los catálogos del sistema actualizados. Todas estas rutas cuelgan de `/api/v1/finance/*`.

### 2.1 Tasas de Cambio (`/finance/exchange-rate`)
- **Endpoints**:
  ```http
  GET /api/v1/finance/exchange-rate
  POST /api/v1/finance/exchange-rate
  PUT /api/v1/finance/exchange-rate/:id
  ```
- **Tipo de Interfaz**: Tabla con histórico y formulario modal para nueva tasa.
- **Acción Clave**: Crear (`POST`) o editar (`PUT`) con el payload `{ "rate": 38.5, "is_active": true }`.
- **Regla UI**: Al activar una nueva tasa, el backend automáticamente desactivará las anteriores. El frontend solo debe refrescar el listado general tras el request exitoso.

### 2.2 Impuestos (`/finance/tax`)
- **Endpoints**:
  ```http
  GET /api/v1/finance/tax
  POST /api/v1/finance/tax
  PUT /api/v1/finance/tax/:id
  ```
- **Tipo de Interfaz**: Formulario y listado. Los campos base son `name` (ej. IVA), `code`, `rate` (porcentaje ej. 16) y `is_active`.

### 2.3 Métodos de Pago (`/finance/payment-method`)
- **Endpoints**:
  ```http
  GET /api/v1/finance/payment-method
  POST /api/v1/finance/payment-method
  PUT /api/v1/finance/payment-method/:id
  ```
- **Tipo de Interfaz**: Formulario especificando `type` (Efectivo, Transferencia), `currency` (USD, VES).
- **Aviso visual**: Este catálogo es crucial para el cálculo de IGTF, ya que el backend detecta el cobro IGTF bajo la regla (Efectivo + Divisa Extranjera).

### 2.4 Estados de Factura (`/finance/status-invoice`)
- **Endpoints**:
  ```http
  GET /api/v1/finance/status-invoice
  POST /api/v1/finance/status-invoice
  PUT /api/v1/finance/status-invoice/:id
  ```
- **Recomendación UI**: Interfaz básica de gestión. Se asume que el backend arranca con `Proforma` (creado vía Seed o UI).

## 3. Visualización de Facturas y Pagos

### 3.1 Listado y Detalles de Factura (`/finance/invoice`)
- **Endpoints**:
  ```http
  GET /api/v1/finance/invoice
  GET /api/v1/finance/invoice/:id
  ```
- **Vista Principal**: Tabla de facturación y "Cuentas por Cobrar" localizada bajo Recepción o Administración.
- **Vista de Detalle**: Al visualizar una factura específica (o la proforma generada por el doctor al finalizar), se debe mostrar:
  - Lista de ítems autogenerados con descripción automática: *"Consulta - Odontología"* y *"Insumo - Anestesia (x2)"*.
  - Mostrar los totales duales retornados (ej. `total_usd` y `total_bs`, multiplicados por el backend basándose en el current ExchangeRate).

### 3.2 Registro de Pagos (`/finance/invoice-payment`)
- **Componente**: Un modal `Crear Pago` sobre la vista detalle de la factura (Proforma).
- **Acción API**:
  ```http
  POST /api/v1/finance/invoice-payment
  ```
- **Payload a renderizar**:
  ```json
  {
    "invoiceId": "id_oculto_factura",
    "paymentMethodId": "select_metodo_pago",
    "currencyId": "select_moneda",
    "amount_paid": "input_monto_dinero"
  }
  ```
- **Alerta al cajero IGTF**: El backend recalcula el costo `igtf_amount` (3%) en los pagos detectados bajo la regla Divisa Física. El frontend puede opcionalmente mostrar una nota dinámica si el usuario selecciona USD + Efectivo avisando "Este pago generará retención local de IGTF 3%".
