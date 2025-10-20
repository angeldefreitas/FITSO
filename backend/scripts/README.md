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

### ⚙️ `setup-postgres.sh`
**Script de configuración de PostgreSQL**
- Configura la base de datos PostgreSQL
- Instala dependencias necesarias

## 🌱 Scripts de Seed

### 📊 `seed-massive-database.js`
**Base de datos masiva con 500+ alimentos**
- Contiene la base de datos completa de alimentos
- Incluye frutas, verduras, carnes, pescados, mariscos, lácteos, cereales, etc.
- Traducciones completas en ES/EN/PT
- Sinónimos para búsqueda avanzada
- Información nutricional detallada

## 🔄 Cómo Añadir Más Alimentos en el Futuro

### Opción 1: Modificar Script Existente (Recomendado)
1. Editar `seed-massive-database.js`
2. Añadir nuevos alimentos al array `massiveFoodsDatabase`
3. Hacer commit y push
4. Hacer manual deploy en Render

### Opción 2: Crear Nuevo Script de Seed
1. Crear nuevo archivo `seed-additional-foods-v2.js`
2. Seguir la estructura de `seed-massive-database.js`
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
node backend/scripts/seed-massive-database.js

# Verificar estado de la base de datos
node -e "require('./backend/src/config/database').query('SELECT COUNT(*) FROM fitso_foods').then(r => console.log('Alimentos:', r.rows[0].count))"
```

## 📝 Notas Importantes

- Los scripts se ejecutan automáticamente en producción
- No ejecutar scripts manualmente en producción
- Siempre probar cambios localmente antes de hacer deploy
- El sistema detecta duplicados automáticamente
- Los datos se añaden solo si no existen previamente
