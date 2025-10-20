import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Dimensions,
  StyleSheet 
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

interface NumberPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  label: string;
  modalTitle?: string;
  customOptions?: number[];
}

const { height: screenHeight } = Dimensions.get('window');

export default function NumberPicker({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit = '',
  placeholder = 'Seleccionar',
  label,
  modalTitle,
  customOptions
}: NumberPickerProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const generateNumbers = () => {
    // Si hay opciones personalizadas, usarlas
    if (customOptions) {
      return customOptions.sort((a, b) => a - b);
    }
    
    // Si no, generar números normalmente
    const numbers = [];
    for (let i = min; i <= max; i += step) {
      // Redondear según el número de decimales del step para evitar errores de precisión
      const decimals = step.toString().split('.')[1]?.length || 0;
      const roundedNumber = Math.round(i * Math.pow(10, decimals)) / Math.pow(10, decimals);
      numbers.push(roundedNumber);
    }
    return numbers;
  };

  const numbers = generateNumbers();
  const itemHeight = 50;
  const visibleItems = 5;
  const pickerHeight = itemHeight * visibleItems;

  const handleConfirm = () => {
    onValueChange(tempValue);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsVisible(false);
  };


  // Scroll to initial value when modal opens
  useEffect(() => {
    if (isVisible) {
      const index = numbers.indexOf(tempValue);
      if (index !== -1) {
        setTimeout(() => {
          // This will be handled by the ScrollView's onMomentumScrollEnd
        }, 100);
      }
    }
  }, [isVisible, tempValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.pickerText}>
          {value ? `${value}${unit}` : (placeholder || t('modals.select') || 'Seleccionar')}
        </Text>
        <Text style={styles.pickerIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>{t('modals.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {modalTitle || label}
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>{t('modals.confirm')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <ScrollView
                style={styles.picker}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                contentOffset={{ x: 0, y: numbers.indexOf(tempValue) * itemHeight }}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
                  const newValue = numbers[index];
                  if (newValue !== undefined) {
                    setTempValue(newValue);
                  }
                }}
              >
                {numbers.map((number, index) => (
                  <TouchableOpacity
                    key={number}
                    style={[
                      styles.pickerItem,
                      { height: itemHeight },
                      tempValue === number && styles.pickerItemSelected
                    ]}
                    onPress={() => setTempValue(number)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempValue === number && styles.pickerItemTextSelected
                    ]}>
                      {number}{unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 0,
  },
  
  pickerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  
  pickerIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Para el safe area en iOS
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 60,
  },
  
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
    minWidth: 60,
    textAlign: 'left',
  },
  
  confirmButton: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  
  pickerContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  picker: {
    height: 250,
    width: '100%',
  },
  
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  pickerItemSelected: {
    backgroundColor: Colors.accent + '20',
  },
  
  pickerItemText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  
  pickerItemTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
