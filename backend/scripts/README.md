# Scripts de Base de Datos FITSO

## 📋 Scripts Esenciales

### 🚀 `deploy-fitso-foods.js`
**Script principal de despliegue automático**
- Se ejecuta automáticamente en producción cuando se despliega la aplicación
- Crea las tablas necesarias: `fitso_foods`, `fitso_food_translations`, `fitso_food_synonyms`
- Sembra la base de datos con 500+ alimentos si está vacía
- Añade alimentos adicionales si hay menos de 500

### 🗄️ `init-db.js`
**Script de inicialización de base de datos**
- Crea las tablas básicas del sistema (users, profiles, etc.)
- Se ejecuta una sola vez al configurar la base de datos

### 👑 `make-user-admin.js`
**Script para hacer usuario administrador**
- Convierte un usuario normal en administrador
- Útil para configurar el primer admin del sistema

### 🤝 `make-user-affiliate.js`
**Script para hacer usuario afiliado**
- Convierte un usuario normal en afiliado
- Le otorga premium automáticamente
- Crea código de afiliado único
- Configura porcentaje de comisión

### 🏗️ `migrate-to-production.sql`
**Script de migración del sistema de afiliados**
- Crea todas las tablas del sistema de afiliados
- Incluye: affiliate_codes, user_referrals, affiliate_commissions, affiliate_payments
- Configura índices optimizados para rendimiento
- Incluye validaciones y documentación completa

## 🌱 Scripts de Seed

### 📊 `deploy-fitso-foods.js` (Incluye Seed)
**Base de datos masiva con 500+ alimentos**
- Contiene la base de datos completa de alimentos integrada
- Incluye frutas, verduras, carnes, pescados, mariscos, lácteos, cereales, etc.
- Traducciones completas en ES/EN/PT
- Sinónimos para búsqueda avanzada
- Información nutricional detallada

## 🔄 Cómo Añadir Más Alimentos en el Futuro

### Opción 1: Modificar Script Existente (Recomendado)
1. Editar `deploy-fitso-foods.js`
2. Añadir nuevos alimentos al array `massiveFoodsDatabase`
3. Hacer commit y push
4. Hacer manual deploy en Render

### Opción 2: Crear Nuevo Script de Seed
1. Crear nuevo archivo `seed-additional-foods-v2.js`
2. Seguir la estructura del array `massiveFoodsDatabase` en `deploy-fitso-foods.js`
3. Añadir al `deploy-fitso-foods.js`:
   ```javascript
   const seedAdditionalFoodsV2 = require('./seed-additional-foods-v2');
   await seedAdditionalFoodsV2();
   ```
4. Hacer commit, push y manual deploy

### Estructura de un Alimento
```javascript
{
  name: 'Nombre del Alimento',
  brand: 'Generic',
  calories_per_100g: 100,
  protein_per_100g: 10.0,
  carbs_per_100g: 20.0,
  fat_per_100g: 5.0,
  fiber_per_100g: 3.0,
  sugar_per_100g: 2.0,
  sodium_per_100g: 10,
  category: 'Categoría',
  subcategory: 'Subcategoría',
  tags: ['tag1', 'tag2', 'tag3'],
  translations: {
    en: { name: 'Food Name', description: 'Description', unit_short: 'g', unit_long: 'gram' },
    pt: { name: 'Nome do Alimento', description: 'Descrição', unit_short: 'g', unit_long: 'grama' }
  },
  synonyms: {
    es: ['sinónimo1', 'sinónimo2'],
    en: ['synonym1', 'synonym2'],
    pt: ['sinônimo1', 'sinônimo2']
  }
}
```

## 🚀 Proceso de Despliegue

1. **Desarrollo Local**: Modificar scripts según sea necesario
2. **Commit y Push**: Subir cambios al repositorio
3. **Manual Deploy**: Ir a Render Dashboard y hacer "Manual Deploy"
4. **Verificación**: El script se ejecutará automáticamente en producción

## 📊 Estado Actual de la Base de Datos

- **Total de Alimentos**: 500+ alimentos
- **Idiomas Soportados**: Español (ES), Inglés (EN), Portugués (PT)
- **Categorías**: Frutas, Verduras, Carnes, Pescados, Mariscos, Lácteos, Cereales, Frutos Secos, Legumbres, Aceites, Bebidas, Snacks, Condimentos
- **Información Nutricional**: Completa (calorías, macros, micronutrientes)
- **Sistema Anti-Duplicados**: Integrado

## 🔧 Comandos Útiles

```bash
# Ejecutar script localmente (para testing)
node backend/scripts/deploy-fitso-foods.js

# Verificar estado de la base de datos
node -e "require('./backend/src/config/database').query('SELECT COUNT(*) FROM fitso_foods').then(r => console.log('Alimentos:', r.rows[0].count))"

# Hacer usuario admin
node backend/scripts/make-user-admin.js

# Hacer usuario afiliado
node backend/scripts/make-user-affiliate.js usuario@email.com "Nombre Afiliado" 25

# Listar afiliados
node backend/scripts/make-user-affiliate.js list

# Ejecutar migración de afiliados (en PostgreSQL)
# Ejecutar: backend/scripts/migrate-to-production.sql
```

## 📝 Notas Importantes

- Los scripts se ejecutan automáticamente en producción
- No ejecutar scripts manualmente en producción
- Siempre probar cambios localmente antes de hacer deploy
- El sistema detecta duplicados automáticamente
- Los datos se añaden solo si no existen previamente
