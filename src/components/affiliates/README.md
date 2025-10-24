# Sistema de Afiliados - Estructura Consolidada

Esta carpeta contiene todo el código relacionado con el sistema de afiliados de Fitso, organizado de manera modular y fácil de mantener.

## 📁 Estructura de Carpetas

```
src/components/affiliates/
├── screens/                    # Pantallas de afiliados
│   ├── AffiliateDashboardScreen.tsx    # Pantalla principal del dashboard
│   ├── AdminAffiliatesScreen.tsx       # Pantalla de administración
│   └── ReferralCodeScreen.tsx          # Pantalla de código de referencia
├── hooks/                      # Hooks personalizados
│   ├── useUserType.ts          # Hook para determinar tipo de usuario
│   └── useUserTypeReal.ts      # Hook real para tipo de usuario
├── services/                   # Servicios de API
│   └── affiliateApiService.ts  # Servicio principal de afiliados
├── components/                 # Componentes reutilizables
│   ├── AdminPanel.tsx          # Panel de administración
│   ├── AffiliateDashboard.tsx  # Dashboard de afiliados
│   ├── AffiliateDashboardButton.tsx
│   ├── AffiliateButton.tsx
│   ├── AdminButton.tsx
│   ├── ProfileAdminButton.tsx
│   ├── ProfileAdminButtonSettings.tsx
│   ├── ReferralCodeInput.tsx
│   ├── SimpleAdminButton.tsx
│   ├── UserAccessButtons.tsx
│   ├── UserAccessButtonsReal.tsx
│   └── UserReferralInfo.tsx
├── index.ts                    # Archivo de exportaciones principal
└── README.md                   # Este archivo
```

## 🚀 Uso

### Importación Simple
```typescript
import { 
  AffiliateDashboardScreen,
  AdminAffiliatesScreen,
  ReferralCodeScreen,
  useUserType,
  affiliateApiService
} from '../components/affiliates';
```

### Importación Específica
```typescript
import { AffiliateDashboard } from '../components/affiliates/AffiliateDashboard';
import { useUserTypeReal } from '../components/affiliates/hooks/useUserTypeReal';
```

## 🔧 Componentes Principales

### Pantallas
- **AffiliateDashboardScreen**: Pantalla principal para afiliados
- **AdminAffiliatesScreen**: Panel de administración para admins
- **ReferralCodeScreen**: Pantalla para ingresar código de referencia

### Hooks
- **useUserType**: Determina el tipo de usuario (admin/affiliate/user)
- **useUserTypeReal**: Versión real del hook con validación de API

### Servicios
- **affiliateApiService**: Servicio principal para todas las operaciones de afiliados

## 📝 Notas de Desarrollo

- Todos los archivos están organizados por funcionalidad
- Las importaciones están centralizadas en `index.ts`
- Los servicios manejan automáticamente la autenticación
- Los hooks están optimizados para el rendimiento
- Los componentes son reutilizables y modulares

## 🔄 Migración Completada

✅ Todas las pantallas movidas desde `/src/screens/`
✅ Todos los hooks movidos desde `/src/hooks/`
✅ Servicio movido desde `/src/services/`
✅ Todas las importaciones actualizadas
✅ Errores de linting corregidos
✅ Estructura modular implementada
