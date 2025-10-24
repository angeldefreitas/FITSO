# 🔧 Integración del Botón Admin en tu ProfileScreen Actual

## 📱 **Cómo Agregar el Botón de Admin a tu ProfileScreen**

### **1. Importar el Componente:**

```typescript
// En tu ProfileScreen.tsx actual:
import { ProfileAdminButtonSettings } from '../components/affiliates/ProfileAdminButtonSettings';
```

### **2. Agregar el Botón en la Sección de Configuración:**

```typescript
// En tu ProfileScreen, en la sección "Configuración", después de "Términos de Uso":
export const ProfileScreen = ({ navigation, user }) => {
  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  return (
    <View style={styles.container}>
      {/* Tu contenido existente */}
      
      {/* En la sección "Configuración", después de "Términos de Uso": */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        {/* Tus botones existentes */}
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Editar Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Cambiar Contraseña</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Notificaciones</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Privacidad</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Text>Términos de Uso</Text>
        </TouchableOpacity>

        {/* AGREGAR ESTE BOTÓN AQUÍ */}
        <ProfileAdminButtonSettings 
          onPress={handleAdminPress}
          userEmail={user?.email}
        />
      </View>
      
      {/* Resto de tu contenido */}
    </View>
  );
};
```

### **3. Agregar la Ruta en tu Navegador:**

```typescript
// En tu Stack Navigator o donde manejes las rutas:
import { AdminAffiliatesScreen } from '../screens/AdminAffiliatesScreen';

// Agregar la ruta:
<Stack.Screen 
  name="AdminAffiliates" 
  component={AdminAffiliatesScreen} 
/>
```

## 🎯 **¿Dónde Aparecerá el Botón?**

El botón aparecerá en la sección **"Configuración"**, después de **"Términos de Uso"** y antes de **"Zona de Peligro"**.

### **Orden de los Botones en Configuración:**
1. Editar Perfil
2. Cambiar Contraseña
3. Notificaciones
4. Privacidad
5. Términos de Uso
6. **⚙️ Panel de Administración** ← **NUEVO BOTÓN**
7. Zona de Peligro

## 🔧 **Personalización del Botón:**

### **Cambiar el Texto:**
```typescript
// En ProfileAdminButtonSettings.tsx, línea 25:
<Text style={styles.buttonText}>Panel de Administración</Text>

// Cambiar por:
<Text style={styles.buttonText}>Gestionar Afiliados</Text>
```

### **Cambiar el Icono:**
```typescript
// En ProfileAdminButtonSettings.tsx, línea 20:
<Text style={styles.icon}>⚙️</Text>

// Cambiar por:
<Text style={styles.icon}>👥</Text>
```

### **Cambiar el Color:**
```typescript
// En ProfileAdminButtonSettings.tsx, modificar styles.iconContainer:
iconContainer: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.green, // Cambiar color
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
```

## 🎯 **¿Qué Pasará?**

### **Para angelfritas@gmail.com:**
- ✅ **Verá el botón** "⚙️ Panel de Administración" en la sección Configuración
- ✅ **Al presionarlo** accederá al panel de administración
- ✅ **Podrá gestionar** afiliados y comisiones

### **Para otros usuarios:**
- ❌ **No verán el botón** (componente retorna null)
- ✅ **Acceso normal** a la ProfileScreen
- ✅ **Sin cambios** en su experiencia

## 🔍 **Verificación:**

### **Para Verificar que Funciona:**
1. **Asegúrate** de que tu email sea `angelfritas@gmail.com`
2. **Ve a ProfileScreen**
3. **Busca en la sección "Configuración"**
4. **Deberías ver** el botón "⚙️ Panel de Administración"

### **Si No Aparece:**
1. **Verifica** que el email sea exactamente `angelfritas@gmail.com`
2. **Verifica** que hayas importado el componente
3. **Verifica** que hayas agregado el botón en el JSX
4. **Verifica** que hayas pasado el `userEmail` como prop

## 🎉 **¡Listo para Usar!**

Ahora cuando te logees con `angelfritas@gmail.com` y vayas a tu ProfileScreen, verás el botón de administración en la sección de configuración y podrás acceder al panel de gestión de afiliados.

**El botón solo aparecerá para tu email específico, ningún otro usuario lo verá.**
