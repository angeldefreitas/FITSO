# API de Calorías Quemadas - Fitso MVP

## Descripción

La API de calorías quemadas permite a los usuarios registrar, consultar y gestionar sus calorías quemadas diarias. Esta funcionalidad se integra con el sistema de seguimiento de progreso de la aplicación Fitso.

## Endpoints

### Base URL
```
/api/progress/calories-burned
```

### 1. Obtener Calorías Quemadas por Fecha

**GET** `/date/:date`

Obtiene las calorías quemadas para una fecha específica. Si no existe una entrada para esa fecha, se crea una con valores por defecto.

**Parámetros:**
- `date` (string, requerido): Fecha en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "calories_burned": 300,
    "calories_goal": 750,
    "entry": {
      "id": "uuid",
      "calories_burned": 300,
      "calories_goal": 750,
      "entry_date": "2024-01-15",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 2. Obtener Calorías Quemadas por Rango de Fechas

**GET** `/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

Obtiene las calorías quemadas en un rango de fechas con estadísticas.

**Parámetros de consulta:**
- `startDate` (string, requerido): Fecha de inicio en formato YYYY-MM-DD
- `endDate` (string, requerido): Fecha de fin en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "entries": [
      {
        "id": "uuid",
        "calories_burned": 300,
        "calories_goal": 750,
        "entry_date": "2024-01-15",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "stats": {
      "total_entries": 1,
      "avg_calories_burned": 300,
      "max_calories_burned": 300,
      "min_calories_burned": 300,
      "total_calories_burned": 300,
      "avg_calories_goal": 750
    },
    "average_daily": 300
  }
}
```

### 3. Obtener Historial de Calorías Quemadas

**GET** `/history?limit=30`

Obtiene el historial de calorías quemadas ordenado por fecha descendente.

**Parámetros de consulta:**
- `limit` (number, opcional): Número de días a obtener (por defecto: 30)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "entry_date": "2024-01-15",
        "calories_burned": 300,
        "calories_goal": 750
      }
    ],
    "count": 1
  }
}
```

### 4. Obtener Entrada Específica por ID

**GET** `/:id`

Obtiene una entrada específica de calorías quemadas por su ID.

**Parámetros:**
- `id` (string, requerido): UUID de la entrada

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "calories_burned": 300,
    "calories_goal": 750,
    "entry_date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Agregar/Actualizar Calorías Quemadas

**POST** `/`

Agrega una nueva entrada de calorías quemadas o actualiza una existente para la misma fecha.

**Body:**
```json
{
  "calories_burned": 300,
  "calories_goal": 750,
  "entry_date": "2024-01-15"
}
```

**Campos:**
- `calories_burned` (number, requerido): Calorías quemadas (0-10000)
- `calories_goal` (number, opcional): Objetivo de calorías (100-10000, por defecto: 750)
- `entry_date` (string, requerido): Fecha en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "message": "Entrada de calorías quemadas agregada exitosamente",
  "data": {
    "id": "uuid",
    "calories_burned": 300,
    "calories_goal": 750,
    "entry_date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Actualizar Entrada Existente

**PUT** `/:id`

Actualiza una entrada existente de calorías quemadas.

**Parámetros:**
- `id` (string, requerido): UUID de la entrada

**Body:**
```json
{
  "calories_burned": 450,
  "calories_goal": 800
}
```

**Campos (todos opcionales):**
- `calories_burned` (number): Calorías quemadas (0-10000)
- `calories_goal` (number): Objetivo de calorías (100-10000)
- `entry_date` (string): Fecha en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "message": "Entrada de calorías quemadas actualizada exitosamente",
  "data": {
    "id": "uuid",
    "calories_burned": 450,
    "calories_goal": 800,
    "entry_date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

### 7. Eliminar Entrada

**DELETE** `/:id`

Elimina una entrada de calorías quemadas.

**Parámetros:**
- `id` (string, requerido): UUID de la entrada

**Respuesta:**
```json
{
  "success": true,
  "message": "Entrada de calorías quemadas eliminada exitosamente"
}
```

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer:

```
Authorization: Bearer <token>
```

## Validaciones

### Calorías Quemadas
- Debe ser un número entero
- Rango: 0-10000
- Requerido para crear/actualizar

### Objetivo de Calorías
- Debe ser un número entero
- Rango: 100-10000
- Opcional (por defecto: 750)

### Fecha
- Formato: YYYY-MM-DD
- Requerido para crear
- Opcional para actualizar

## Códigos de Error

### 400 Bad Request
- Datos de entrada inválidos
- Formato de fecha incorrecto
- Valores fuera de rango

### 401 Unauthorized
- Token de autenticación faltante o inválido

### 403 Forbidden
- No tienes permisos para acceder/modificar esta entrada

### 404 Not Found
- Entrada no encontrada

### 500 Internal Server Error
- Error interno del servidor

## Ejemplos de Uso

### JavaScript/React Native
```javascript
// Obtener calorías quemadas para hoy
const getCaloriesBurned = async (date) => {
  const response = await fetch(`/api/progress/calories-burned/date/${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Agregar calorías quemadas
const addCaloriesBurned = async (caloriesBurned, date) => {
  const response = await fetch('/api/progress/calories-burned', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      calories_burned: caloriesBurned,
      entry_date: date
    })
  });
  return await response.json();
};
```

### cURL
```bash
# Obtener calorías quemadas para una fecha
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/progress/calories-burned/date/2024-01-15

# Agregar calorías quemadas
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"calories_burned": 300, "entry_date": "2024-01-15"}' \
     http://localhost:3000/api/progress/calories-burned
```

## Base de Datos

La funcionalidad utiliza la tabla `user_daily_calories`:

```sql
CREATE TABLE user_daily_calories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calories_burned INTEGER NOT NULL DEFAULT 0,
    calories_goal INTEGER NOT NULL DEFAULT 750,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_date)
);
```

## Pruebas

Para probar la funcionalidad, ejecuta:

```bash
cd backend
node scripts/test-calories-burned.js
```

Este script incluye pruebas para todos los endpoints y validaciones.
