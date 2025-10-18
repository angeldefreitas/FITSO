import { Colors } from '../../constants/colors';

export const onboardingScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.accent,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  form: {
    flex: 1,
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    width: '48%',
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  input: {
    fontSize: 16,
  },
  
  goalsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-around',
    marginTop: 8,
  },
  
  goalButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  goalButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  
  goalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  goalText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  
  goalTextActive: {
    color: Colors.textPrimary,
  },
  
  saveButton: {
    marginTop: 32,
  },
  
  saveButtonDisabled: {
    opacity: 0.5,
  },
};
