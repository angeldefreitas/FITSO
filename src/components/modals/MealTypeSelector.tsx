import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MealTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onMealTypeSelect: (mealType: string) => void;
}

const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  visible,
  onClose,
  onMealTypeSelect,
}) => {
  const { t } = useTranslation();
  
  const mealTypes = [
    { type: 'Desayuno', icon: '🥞', translation: t('daily.breakfast') },
    { type: 'Almuerzo', icon: '🍲', translation: t('daily.lunch') },
    { type: 'Snacks', icon: '🥑', translation: t('daily.snacks') },
    { type: 'Cena', icon: '🍗', translation: t('daily.dinner') }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.mealTypeSelectorContainer}>
          <View style={styles.mealTypeSelectorHeader}>
            <Text style={styles.mealTypeSelectorTitle}>{t('daily.whatWillYouEat')}</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.mealTypeSelectorCloseButton}
            >
              <Text style={styles.mealTypeSelectorCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealTypeGrid}>
            {mealTypes.map((mealType) => (
              <TouchableOpacity
                key={mealType.type}
                style={styles.mealTypeCard}
                onPress={() => onMealTypeSelect(mealType.type)}
              >
                <Text style={styles.mealTypeEmoji}>{mealType.icon}</Text>
                <Text style={styles.mealTypeText}>{mealType.translation}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  // Estilos para el modal de selección de tipo de comida
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  mealTypeSelectorContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    width: '90%' as any,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden' as const,
  },

  mealTypeSelectorHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  mealTypeSelectorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2c3e50',
  },

  mealTypeSelectorCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  mealTypeSelectorCloseButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6c757d',
  },

  mealTypeGrid: {
    padding: 16,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },

  mealTypeCard: {
    width: '47%' as any,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  mealTypeEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },

  mealTypeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2c3e50',
    textAlign: 'center' as const,
  },
};

export default MealTypeSelector;
