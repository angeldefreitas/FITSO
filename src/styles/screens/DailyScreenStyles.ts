import { Colors } from '../../constants/colors';

export const dailyScreenStyles = {
  container: {
    flex: 1,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  scrollView: {
    flex: 1,
    paddingBottom: 200, // Espacio adicional para el bottom navigation y más scroll
  },

  // Banner Ad
  bannerAd: {
    marginBottom: 8,
  },

  // Header de la aplicación
  appHeader: {
    paddingTop: 60,
    paddingBottom: 0,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  appTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center' as const,
  },

  premiumBadge: {
    width: 90,
    height: 90,
    marginTop: -20,
    marginBottom: -35,
  },
  
  // Sección de calorías
  caloriesSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 160, // Altura mínima para asegurar espacio suficiente
    height: 160, // Altura fija para forzar alineación
  },
  
  caloriesLeft: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
  
  caloriesConsumedNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  
  caloriesConsumedLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  caloriesCenter: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
  
  caloriesRemainingNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  
  caloriesRemainingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  
  caloriesRight: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
  
  caloriesGoalNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  
  caloriesGoalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  // Tarjeta de macros
  macrosCard: {
    backgroundColor: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Estilos para el contenedor split
  splitSectionContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    minHeight: 180,
    alignItems: 'flex-start' as const,
  },

  splitSectionLeft: {
    flex: 1,
  },

  splitSectionRight: {
    flex: 1,
  },
};
