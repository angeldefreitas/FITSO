// Configuración específica para Expo Go
// Este archivo maneja las diferencias entre Expo Go y builds nativos

export const isExpoGo = (): boolean => {
  return __DEV__ && (
    (global as any).expo?.modules?.ExpoGo ||
    (global as any).__DEV__ ||
    typeof (global as any).expo !== 'undefined'
  );
};

export const getExpoGoConfig = () => {
  const isExpo = isExpoGo();
  
  return {
    isExpoGo: isExpo,
    // RevenueCat no funciona en Expo Go
    revenueCatEnabled: !isExpo,
    // Google Mobile Ads no funciona en Expo Go
    adsEnabled: !isExpo,
    // Usar URL de producción directamente en Expo Go
    useProductionAPI: isExpo,
    // Mensajes específicos para Expo Go
    messages: {
      revenueCatNotAvailable: 'Las compras in-app no están disponibles en Expo Go. Usa la versión nativa de la app para acceder a funciones premium.',
      adsNotAvailable: 'Los anuncios no están disponibles en Expo Go. Usa la versión nativa de la app para ver anuncios.',
      premiumFeaturesLimited: 'Algunas funciones premium están limitadas en Expo Go. Usa la versión nativa para acceso completo.',
    }
  };
};

export default getExpoGoConfig;
