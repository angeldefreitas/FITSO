import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FoodItem, FoodCategory, FoodSubcategory } from '../../types/food';

interface CreateFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (food: FoodItem) => void;
}

const CreateFoodModal: React.FC<CreateFoodModalProps> = ({ visible, onClose, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('otros' as FoodCategory);
  const [subcategory, setSubcategory] = useState<FoodSubcategory>('otros' as FoodSubcategory);

  const handleSave = () => {
    if (!name.trim() || !calories.trim()) {
      Alert.alert(t('alerts.validationError'), t('auth.allFieldsRequired'));
      return;
    }

    const customFood: FoodItem = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      category,
      subcategory,
      description: description.trim() || undefined,
      servingSize: '100g',
      tags: ['personalizado', 'creado-por-ti'],
      isCustom: true,
    };

    onSave(customFood);
    
    // Limpiar formulario
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setDescription('');
  };

  const handleNumericInput = (text: string, setter: (value: string) => void) => {
    const numericRegex = /^\d*\.?\d{0,2}$/;
    if (numericRegex.test(text) || text === '') {
      setter(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('food.addCustom')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('food.name')}
              placeholderTextColor="#6c757d"
              style={styles.input}
            />

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('food.descriptionOptional')}
              placeholderTextColor="#6c757d"
              style={styles.input}
            />

            <Text style={styles.nutritionLabel}>
              {t('food.nutritionalValuesPer100g')}
            </Text>
            
            <View style={styles.row}>
              <TextInput
                value={calories}
                onChangeText={(text) => handleNumericInput(text, setCalories)}
                placeholder={t('food.calories')}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                value={protein}
                onChangeText={(text) => handleNumericInput(text, setProtein)}
                placeholder={t('food.protein')}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                value={carbs}
                onChangeText={(text) => handleNumericInput(text, setCarbs)}
                placeholder={t('food.carbohydratesG')}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                value={fat}
                onChangeText={(text) => handleNumericInput(text, setFat)}
                placeholder={t('food.fatsG')}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>{t('modals.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
  },
  content: {
    padding: 24,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
    marginBottom: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#2c3e50',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default CreateFoodModal;
