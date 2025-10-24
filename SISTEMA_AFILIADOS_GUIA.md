# 🎯 Sistema de Afiliados - Guía Completa

## 📋 **¿Cómo Funciona el Sistema?**

### **1. Flujo General del Sistema**

```
Influencer/Entrenador → Recibe Código → Usuario usa Código → Usuario se hace Premium → Comisión Automática
```

### **2. Proceso Detallado**

#### **Paso 1: Crear Código de Afiliado (Admin)**
- El administrador crea un código único para cada influencer
- Ejemplo: "FITNESS_GURU", "NUTRICIONISTA_PRO"
- Se establece el porcentaje de comisión (por defecto 30%)

#### **Paso 2: Usuario Registra Código**
- El usuario ingresa sus datos básicos
- Después de los datos biométricos, se le pregunta por el código de referencia
- El sistema valida el código y lo asocia al usuario

#### **Paso 3: Conversión a Premium**
- Cuando el usuario paga por premium, se genera automáticamente la primera comisión
- El sistema calcula: `comisión = precio_suscripción * porcentaje_comisión`

#### **Paso 4: Comisiones Recurrentes**
- Por cada renovación mensual/anual, se genera una nueva comisión
- El afiliado gana mientras el usuario mantenga premium

---

## 🎮 **¿Cómo Controlar el Sistema?**

### **👨‍💼 Panel de Administración**

#### **Crear Nuevos Afiliados:**
1. Ve al Panel de Administración
2. Presiona "Crear Nuevo Afiliado"
3. Completa:
   - Nombre del afiliado
   - Email (opcional)
   - Porcentaje de comisión (por defecto 30%)
4. El sistema genera automáticamente un código único

#### **Gestionar Afiliados Existentes:**
- **Ver estadísticas**: Total referidos, conversiones, comisiones
- **Activar/Desactivar**: Controlar qué afiliados están activos
- **Ver detalles**: Historial completo de cada afiliado

#### **Procesar Pagos:**
- Ver comisiones pendientes
- Marcar comisiones como pagadas
- Generar reportes de pagos

### **👥 Dashboard de Afiliados**

#### **Para Influencers/Entrenadores:**
- **Ver estadísticas**: Cuántos referidos tienen, cuántos se convirtieron
- **Tasa de conversión**: Porcentaje de usuarios que se hicieron premium
- **Comisiones ganadas**: Total ganado, pagado y pendiente
- **Compartir código**: Link directo para compartir

---

## 🔧 **Configuración del Sistema**

### **Backend (Ya Configurado)**

#### **Base de Datos:**
```sql
-- Tablas principales:
- affiliate_codes: Códigos de afiliados
- user_referrals: Referencias de usuarios
- affiliate_commissions: Comisiones generadas
- affiliate_payments: Pagos realizados
```

#### **API Endpoints:**
```
POST /api/affiliates/codes          # Crear código de afiliado
GET  /api/affiliates/codes          # Listar códigos activos
POST /api/affiliates/referral       # Registrar código de referencia
GET  /api/affiliates/stats/:code    # Estadísticas del afiliado
POST /api/affiliates/payments       # Procesar pagos
```

### **Frontend (Componentes Creados)**

#### **Componentes Principales:**
- `ReferralCodeInput`: Input para código de referencia
- `AffiliateDashboard`: Dashboard para afiliados
- `AdminPanel`: Panel de administración
- `AffiliateApiService`: Servicio para llamadas API

#### **Pantallas:**
- `ReferralCodeScreen`: Pantalla para ingresar código
- `AdminAffiliatesScreen`: Pantalla de administración
- `AffiliateDashboardScreen`: Pantalla de dashboard

---

## 💰 **Configuración de Comisiones**

### **Porcentajes por Defecto:**
- **Comisión estándar**: 30%
- **Comisión premium**: 35% (para influencers top)
- **Comisión básica**: 25% (para nuevos afiliados)

### **Configuración Personalizada:**
- Cada afiliado puede tener su propio porcentaje
- Se puede cambiar en cualquier momento
- Los cambios no afectan comisiones ya generadas

### **Cálculo de Comisiones:**
```
Comisión = Precio de Suscripción × Porcentaje de Comisión

Ejemplo:
- Suscripción mensual: $9.99
- Porcentaje: 30%
- Comisión: $9.99 × 0.30 = $2.997 ≈ $3.00
```

---

## 📊 **Monitoreo y Estadísticas**

### **Métricas Clave:**
1. **Total de Afiliados**: Cuántos códigos activos hay
2. **Total de Referidos**: Cuántos usuarios usaron códigos
3. **Tasa de Conversión**: % de referidos que se hicieron premium
4. **Comisiones Generadas**: Total de dinero en comisiones
5. **Comisiones Pagadas**: Cuánto se ha pagado a afiliados
6. **Comisiones Pendientes**: Cuánto falta por pagar

### **Reportes Disponibles:**
- Reporte mensual de afiliados
- Reporte de comisiones por período
- Reporte de conversiones por afiliado
- Reporte de pagos realizados

---

## 🚀 **Implementación en tu App**

### **1. Integrar en el Flujo de Registro:**

```typescript
// En tu pantalla de registro, después de los datos biométricos:
navigation.navigate('ReferralCodeScreen', { userData });
```

### **2. Agregar Botones de Acceso a Pantallas Principales:**

```typescript
// En cualquier pantalla principal (Home, Dashboard, etc.):
import { UserAccessButtons } from '../components/affiliates/UserAccessButtons';

// En tu componente:
<UserAccessButtons navigation={navigation} userId={currentUser.id} />
```

### **3. Agregar a la Navegación:**

```typescript
// En tu stack navigator:
<Stack.Screen 
  name="ReferralCodeScreen" 
  component={ReferralCodeScreen} 
/>
<Stack.Screen 
  name="AdminAffiliates" 
  component={AdminAffiliatesScreen} 
/>
<Stack.Screen 
  name="AffiliateDashboard" 
  component={AffiliateDashboardScreen} 
/>
```

### **4. Configurar Usuarios Admin:**

```typescript
// En tu AuthContext o donde manejes usuarios:
const adminEmails = [
  'admin@fitso.com',
  'tu-email@fitso.com',
  'developer@fitso.com'
];

// El sistema detectará automáticamente si es admin por email
```

---

## 🎯 **Casos de Uso Típicos**

### **Para Influencers:**
1. Reciben su código único
2. Lo comparten en redes sociales
3. Sus seguidores lo usan al registrarse
4. Reciben comisiones por cada conversión
5. Pueden ver sus estadísticas en tiempo real

### **Para Usuarios:**
1. Ven el código en redes sociales
2. Se registran en la app
3. Ingresan el código de referencia
4. Se hacen premium (opcional)
5. El influencer recibe su comisión

### **Para Administradores:**
1. Crean códigos para influencers
2. Monitorean el rendimiento
3. Procesan pagos de comisiones
4. Analizan métricas del sistema

---

## 🔒 **Seguridad y Validaciones**

### **Validaciones Implementadas:**
- Códigos únicos y no duplicables
- Validación de códigos activos/inactivos
- Un usuario solo puede tener un código de referencia
- Comisiones solo se generan para códigos válidos
- Tracking completo de todas las transacciones

### **Medidas de Seguridad:**
- Autenticación requerida para todas las operaciones
- Validación de permisos de administrador
- Logs de todas las operaciones
- Backup automático de datos de comisiones

---

## 🎯 **Sistema de Acceso Simplificado**

### **¿Cómo Funciona el Acceso?**

#### **Para Administradores:**
- Al logearse con un email de admin, automáticamente verán el botón "⚙️ Admin Panel"
- No necesitan códigos especiales ni pantallas separadas
- Acceso directo desde cualquier pantalla principal

#### **Para Afiliados:**
- Al logearse, si tienen un código de afiliado asociado, verán el botón "📊 Mi Dashboard"
- Acceso directo a sus estadísticas y comisiones
- No necesitan pantallas de acceso separadas

#### **Para Usuarios Normales:**
- No ven botones especiales
- Acceso normal a la aplicación
- Pueden usar códigos de referencia al registrarse

### **Configuración de Emails Admin:**
```typescript
// En tu AuthContext o configuración:
const adminEmails = [
  'admin@fitso.com',        // Tu email principal
  'angel@fitso.com',        // Tu email personal
  'developer@fitso.com'     // Email de desarrollo
];
```

## 📱 **Próximos Pasos**

### **Para Implementar:**
1. **Inicializar base de datos**: `node scripts/init-affiliate-system.js`
2. **Configurar emails admin**: Agregar tus emails a la lista de administradores
3. **Integrar botones**: Agregar `UserAccessButtons` a tus pantallas principales
4. **Crear códigos de prueba**: Usar el panel de administración
5. **Integrar en registro**: Agregar `ReferralCodeScreen` al flujo
6. **Probar el sistema**: Registrar usuarios con códigos
7. **Configurar pagos**: Establecer método de pago a afiliados

### **Para Mejorar:**
- Notificaciones push para afiliados
- Sistema de niveles (bronce, plata, oro)
- Bonificaciones por metas alcanzadas
- Integración con redes sociales
- Dashboard web para afiliados

---

## 🎉 **¡Sistema Listo!**

Tu sistema de afiliados está completamente implementado y listo para usar. Es escalable, seguro y fácil de gestionar. Los influencers pueden empezar a ganar comisiones inmediatamente después de que implementes el frontend en tu flujo de registro.
