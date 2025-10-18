# Sistema de Seguimiento de Progreso

## Descripción
Sistema completo de seguimiento de progreso similar a MyFitnessPal que permite registrar peso y medidas corporales con fechas específicas.

## Características Principales

### 1. Entrada de Datos Inteligente
- **Entrada con fecha**: El usuario puede ingresar peso/medidas para hoy o fechas pasadas
- **Actualización automática**: Si es de hoy, actualiza perfil + gráfico; si es del pasado, solo gráfico
- **Validación**: Validación de valores numéricos y fechas

### 2. Filtros de Tiempo
- 1 mes
- 2 meses  
- 3 meses
- 6 meses
- 1 año
- Desde el peso inicial
- Todos los registros

### 3. Métricas de Progreso
- **Peso inicial** del perfil del usuario (datos biométricos)
- **Peso actual** (más reciente del período seleccionado)
- **Cambio absoluto** (kg/cm)
- **Cambio porcentual** (%)
- **Indicador visual** de aumento/disminución

### 4. Historial de Registros
- Lista cronológica de todos los registros
- Sin opción de fotos (como solicitado)
- Opciones de editar y eliminar
- Formato de fecha legible

### 5. Gráfico Dinámico
- Gráfico de línea que se actualiza con datos reales
- Escala automática basada en los datos
- Puntos interactivos con fechas
- Manejo de estados vacíos

## Archivos Creados

### Tipos y Interfaces
- `src/types/progress.ts` - Definiciones de tipos TypeScript

### Servicios
- `src/services/progressService.ts` - Lógica de almacenamiento y cálculos

### Componentes UI
- `src/components/modals/ProgressEntryModal.tsx` - Modal para entrada de datos
- `src/components/ui/TimeFilterSelector.tsx` - Selector de filtros de tiempo
- `src/components/ui/ProgressSummary.tsx` - Resumen de métricas
- `src/components/ui/ProgressHistory.tsx` - Historial de registros

### Hooks
- `src/hooks/custom/useProgressTracking.ts` - Hook personalizado para manejo de estado

### Pantalla Principal
- `src/screens/ProgressTrackingScreen.tsx` - Pantalla principal actualizada

## Uso

### Agregar Nuevo Registro
```typescript
// El usuario presiona el botón "Agregar Peso/Medida"
// Se abre el modal ProgressEntryModal
// Usuario ingresa valor y selecciona fecha
// Si es de hoy: actualiza perfil + gráfico
// Si es del pasado: solo actualiza gráfico
```

### Filtrar por Tiempo
```typescript
// Usuario selecciona filtro de tiempo
// Se recalculan las métricas para ese período
// Se actualiza el gráfico con datos filtrados
// Se muestra el historial correspondiente
```

### Editar/Eliminar Registros
```typescript
// Usuario presiona botón de editar en el historial
// Se abre el modal con datos pre-cargados
// Usuario modifica y guarda
// Se actualiza automáticamente toda la interfaz
```

## Almacenamiento
- Utiliza AsyncStorage para persistencia local
- Datos estructurados en JSON
- Ordenamiento automático por timestamp
- Manejo de errores robusto

## Lógica del Peso Inicial

### Para Peso
- **Peso inicial**: Se toma del perfil del usuario (datos biométricos)
- **Peso actual**: El peso más reciente del período seleccionado
- **Cálculo**: `cambio = peso_actual - peso_del_perfil`

### Para Medidas
- **Medida inicial**: Se toma del primer registro del período seleccionado
- **Medida actual**: La medida más reciente del período seleccionado
- **Cálculo**: `cambio = medida_actual - medida_inicial`

### Comportamiento del Gráfico

#### Sin Registros Adicionales
- Muestra una línea recta con el peso del perfil
- El peso inicial y actual son iguales (peso del perfil)
- Cambio = 0 kg

#### Con Registros Adicionales
- Muestra una curva desde el peso del perfil hasta el peso actual
- El peso del perfil se agrega automáticamente al inicio del período seleccionado
- Crea una línea de progreso visual completa

#### Ejemplo Práctico
- **Peso del perfil**: 77 kg
- **Registro del 5 de octubre**: 70 kg
- **Período**: 6 meses
- **Resultado**: Línea desde 77 kg (inicio del período) hasta 70 kg (5 de octubre)

Esta lógica asegura que siempre haya datos para mostrar y que el progreso se calcule desde el peso base del usuario.

## Dependencias Agregadas
- `@react-native-community/datetimepicker` - Selector de fechas

## Correcciones Implementadas

### Problema de Sincronización del Perfil
- **Problema**: Al ingresar peso de hoy, no se actualizaba el perfil del usuario
- **Causa**: Inconsistencia en las claves de almacenamiento entre servicios
- **Solución**: Unificación de claves de almacenamiento (`@fitso_user_profile`)
- **Resultado**: El peso del perfil se actualiza automáticamente al ingresar peso de hoy

### Logs de Depuración
- Agregados logs detallados para verificar la actualización del perfil
- Función `verifyProfileSync()` para diagnosticar problemas de sincronización
- Verificación automática del perfil después de actualizar peso

## Mejoras Implementadas

### 1. Un Solo Peso por Día
- **Regla**: Solo puede haber un registro de peso por día
- **Comportamiento**: Si se ingresa un nuevo peso para el mismo día, se elimina automáticamente el anterior
- **Aplicación**: Tanto para agregar como para editar registros

### 2. Sincronización Automática
- **Función**: `addWeightEntryWithSync()` maneja la sincronización automática
- **Condición**: Solo se sincroniza si el peso es de hoy
- **Resultado**: Sincronización completamente automática, sin botones manuales

### 3. Actualización en Tiempo Real
- **Hook**: `useProfileSync()` escucha eventos de actualización
- **Eventos**: Sistema de eventos personalizados para notificar cambios
- **Resultado**: El perfil se actualiza inmediatamente sin reiniciar la app

### 4. Indicador Visual del Perfil
- **Componente**: Muestra el peso actual del perfil en tiempo real
- **Información**: Peso actual, fecha de última actualización
- **Ubicación**: En la pantalla de progreso, solo para peso

### 5. Mejoras en la Experiencia de Usuario
- **Eliminación automática**: No permite duplicados de peso por día
- **Feedback visual**: Indicador claro del peso actual del perfil
- **Sincronización transparente**: Completamente automática, sin intervención del usuario
- **Interfaz simplificada**: Sin botones de sincronización manual innecesarios

## Corrección de Duplicados

### Problema de Tarjetas Duplicadas
- **Problema**: Se creaban dos tarjetas cuando se ingresaba un peso de hoy
- **Causa**: El sistema agregaba tanto el peso del perfil como el peso ingresado
- **Solución**: Simplificación de la lógica - solo mostrar registros reales del usuario
- **Resultado**: Una sola tarjeta por peso ingresado, sin duplicados

## Solución de Actualización en Tiempo Real

### Problema de Sincronización del Perfil
- **Problema**: El perfil no se actualizaba en tiempo real, requería reiniciar la app
- **Causa**: Sistema de eventos personalizados no funcionaba correctamente en React Native
- **Solución**: Implementación de Context API de React para manejo de estado global
- **Resultado**: Actualización instantánea del perfil sin reiniciar la app

### Arquitectura de la Solución
- **ProfileContext**: Contexto de React para manejo global del perfil
- **ProfileProvider**: Proveedor que envuelve toda la aplicación
- **useProfile**: Hook personalizado para acceder al contexto
- **Actualización bidireccional**: Cambios se reflejan en todas las pantallas

### Componentes Actualizados
- **App.tsx**: Envuelto con ProfileProvider
- **ProgressEntryModal**: Usa contexto para actualización inmediata
- **ProfileScreen**: Sincronizado con el contexto
- **ProgressTrackingScreen**: Muestra peso actual en tiempo real

## Próximas Mejoras
- [ ] Soporte completo para medidas corporales (edición/eliminación)
- [ ] Exportación de datos
- [ ] Notificaciones de recordatorio
- [ ] Metas de progreso
- [ ] Comparación con períodos anteriores
