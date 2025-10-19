import { Colors } from '../../constants/colors';

export const foodSearchScreenStyles = {
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    position: 'relative' as const,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 50,
    bottom: 20,
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
    zIndex: 1,
    pointerEvents: 'none' as const,
  },
  
  placeholder: {
    width: 32,
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  scanButtonsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 12,
    gap: 12,
  },

  // Banner Ad
  bannerAd: {
    marginTop: 16,
    marginBottom: 8,
  },

  scanButtonVertical: {
    flex: 1,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 80,
    position: 'relative' as const,
  },

  scanButtonMainAnimation: {
    width: 75,
    height: 75,
    marginBottom: 8,
  },

  scanButtonSubtext: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6c757d',
    textAlign: 'center' as const,
  },

  scanButtonDescription: {
    fontSize: 10,
    fontWeight: '400' as const,
    color: '#28a745',
    textAlign: 'center' as const,
    marginTop: 2,
  },

  scanButtonContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },

  usageCounterRight: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    backgroundColor: '#DC143C',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  usageCounterText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
  },

  premiumIconContainerLeft: {
    position: 'absolute' as const,
    top: -18, // -8 - 10 = -18
    left: -23, // -18 - 5 = -23
    width: 42, // 24 * 1.75 = 42
    height: 42, // 24 * 1.75 = 42
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  premiumIconLeft: {
    width: 42, // 24 * 1.75 = 42
    height: 42, // 24 * 1.75 = 42
  },

  // Overlay premium que tapa el botón completamente
  premiumOverlay: {
    position: 'absolute' as const,
    top: -17, // Posición específica solicitada
    left: -41, // Posición específica solicitada
    right: -41, // Posición específica solicitada
    bottom: -17, // Posición específica solicitada
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12, // Mismo radio que el botón
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1000,
    // Quitar width y height para que left/right funcionen correctamente
  },

  premiumOverlayContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
    flex: 1, // Ocupar todo el espacio disponible
  },

  premiumOverlayIcon: {
    width: 50,
    height: 50,
    marginBottom: -4, // 6 - 10 = -4 (disminuido 10px más)
  },

  premiumOverlayTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  premiumOverlayText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  searchInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingRight: 8,
  },
  
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },

  createButtonInSearch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2c3e50',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },

  createButtonInSearchText: {
    fontSize: 18,
    color: '#ffffff',
  },
  
  categoriesContainer: {
    marginBottom: 20,
  },
  
  categoriesList: {
    paddingHorizontal: 20,
  },
  
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
  },
  
  categoryButtonSelected: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  
  categoryButtonTextSelected: {
    color: '#ffffff',
  },
  
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 16,
  },
  
  foodList: {
    paddingBottom: 20,
  },
  
  foodItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  foodItemLeft: {
    flex: 1,
  },

  foodNameRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  
  foodCategory: {
    fontSize: 12,
    color: '#6c757d',
  },
  
  foodItemRight: {
    alignItems: 'flex-end' as const,
  },
  
  foodCalories: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  
  foodMacros: {
    flexDirection: 'row' as const,
  },
  
  macroText: {
    fontSize: 11,
    color: '#6c757d',
    marginLeft: 8,
  },

  // Estilos para subcategorías
  subcategoriesContainer: {
    marginBottom: 16,
  },

  subcategoriesList: {
    paddingHorizontal: 20,
  },

  subcategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 6,
  },

  subcategoryButtonSelected: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },

  subcategoryButtonText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6c757d',
  },

  subcategoryButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600' as const,
  },

  // Estilos adicionales para elementos de comida
  foodDescription: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
    fontStyle: 'italic' as const,
  },

  foodTags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: 4,
  },

  foodTag: {
    fontSize: 9,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },

  servingSize: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 4,
  },

  customLabel: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600' as const,
  },

  deleteCustomButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  deleteCustomButtonText: {
    fontSize: 12,
  },
};
