export const profileScreenStyles = {
  container: {
    flex: 1,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  gradientBackground: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Espacio para el bottom navigation
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
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center' as const,
  },
  
  header: {
    alignItems: 'center' as const,
    marginBottom: 32,
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center' as const,
  },
  
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  inputGroup: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 24,
  },
  
  halfWidth: {
    width: '48%' as const,
  },
  
  goalsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  
  goalCard: {
    width: '48%' as const,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  goalCardActive: {
    borderColor: '#DC143C',
    backgroundColor: '#fef2f2',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  goalEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  
  goalText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'center' as const,
  },
  
  goalTextActive: {
    color: '#DC143C',
    fontWeight: '700' as const,
  },
  
  saveButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  
  saveButtonDisabled: {
    backgroundColor: '#f3f4f6',
    shadowOpacity: 0.1,
    borderColor: '#d1d5db',
  },
  
  saveButtonText: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  
  // Estilos para botones de género
  genderContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  
  genderButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  genderButtonActive: {
    borderColor: '#DC143C',
    backgroundColor: '#fef2f2',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  genderIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  genderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  
  genderTextActive: {
    color: '#DC143C',
    fontWeight: '700' as const,
  },
  
  // Estilos para botones de actividad
  activityGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 8,
  },
  
  activityButton: {
    width: '48%' as const,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  activityButtonActive: {
    borderColor: '#DC143C',
    backgroundColor: '#fef2f2',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  activityIcon: {
    fontSize: 20,
    marginBottom: 6,
    textAlign: 'center' as const,
  },
  
  activityTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  
  activityTitleActive: {
    color: '#DC143C',
    fontWeight: '700' as const,
  },
  
  activitySubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center' as const,
    lineHeight: 12,
  },
  
  activitySubtitleActive: {
    color: '#DC143C',
    fontWeight: '500' as const,
  },

  // Estilos para el wrapper de pickers
  pickerWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};
