# 🔧 Integración del Botón Admin en ProfileScreen

## 📱 **Cómo Integrar el Botón de Admin en tu ProfileScreen**

### **1. Importar el Componente:**

```typescript
// En tu ProfileScreen.tsx existente:
import { SimpleAdminButton } from '../components/affiliates/SimpleAdminButton';
```

### **2. Agregar el Botón en tu ProfileScreen:**

```typescript
// En tu componente ProfileScreen, donde tengas los botones de perfil:
export const ProfileScreen = ({ navigation, user }) => {
  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  return (
    <View style={styles.container}>
      {/* Tu contenido existente */}
      
      {/* Agregar este botón donde quieras que aparezca */}
      <SimpleAdminButton 
        onPress={handleAdminPress}
        userEmail={user?.email}
      />
      
      {/* Resto de tu contenido */}
    </View>
  );
};
```

### **3. Ejemplo Completo de Integración:**

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SimpleAdminButton } from '../components/affiliates/SimpleAdminButton';

export const ProfileScreen = ({ navigation, user }) => {
  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tu contenido existente del perfil */}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        {/* Botón de Admin - Solo aparece para angelfritas@gmail.com */}
        <SimpleAdminButton 
          onPress={handleAdminPress}
          userEmail={user?.email}
        />
        
        {/* Otros botones de configuración */}
        <TouchableOpacity style={styles.button}>
          <Text>Configuración General</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text>Notificaciones</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
```

### **4. Agregar la Ruta en tu Navegador:**

```typescript
// En tu Stack Navigator o donde manejes las rutas:
import { AdminAffiliatesScreen } from '../screens/AdminAffiliatesScreen';

// Agregar la ruta:
<Stack.Screen 
  name="AdminAffiliates" 
  component={AdminAffiliatesScreen} 
/>
```

## 🎯 **¿Qué Pasará?**

### **Para angelfritas@gmail.com:**
- ✅ **Verá el botón** "⚙️ Panel de Administración"
- ✅ **Al presionarlo** accederá al panel de administración
- ✅ **Podrá gestionar** afiliados y comisiones

### **Para otros usuarios:**
- ❌ **No verán el botón** (componente retorna null)
- ✅ **Acceso normal** a la ProfileScreen
- ✅ **Sin cambios** en su experiencia

## 🔧 **Personalización:**

### **Cambiar el Email Admin:**
```typescript
// En SimpleAdminButton.tsx, línea 14:
if (userEmail !== 'angelfritas@gmail.com') {
  return null;
}

// Cambiar por tu email:
if (userEmail !== 'tu-email@ejemplo.com') {
  return null;
}
```

### **Cambiar el Texto del Botón:**
```typescript
// En SimpleAdminButton.tsx, línea 20:
<Text style={styles.adminButtonText}>⚙️ Panel de Administración</Text>

// Cambiar por:
<Text style={styles.adminButtonText}>🔧 Gestionar Afiliados</Text>
```

### **Cambiar el Estilo:**
```typescript
// En SimpleAdminButton.tsx, modificar styles.adminButton:
adminButton: {
  backgroundColor: colors.green, // Cambiar color
  paddingHorizontal: 20,        // Cambiar padding
  borderRadius: 12,             // Cambiar border radius
  // ... otros estilos
}
```

## 🎉 **¡Listo para Usar!**

Ahora cuando te logees con `angelfritas@gmail.com` y vayas a tu ProfileScreen, verás el botón de administración y podrás acceder al panel de gestión de afiliados.

**El botón solo aparecerá para tu email específico, ningún otro usuario lo verá.**
