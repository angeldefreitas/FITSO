import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/colors';
import { ProgressService } from '../../services/progressService';
import { useProfile } from '../../contexts/ProfileContext';
import WeightPicker from '../WeightPicker';

interface ProgressEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'peso' | 'medidas';
  measurementType?: 'waist' | 'chest' | 'arm' | 'thigh' | 'hip';
  editingEntry?: any; // Para editar entrada existente
}

const ProgressEntryModal: React.FC<ProgressEntryModalProps> = ({
  visible,
  onClose,
  onSuccess,
  type,
  measurementType = 'waist',
  editingEntry
}) => {
  const [value, setValue] = useState(70);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar el contexto del perfil para actualización en tiempo real
  const { updateProfileWeight } = useProfile();

  useEffect(() => {
    if (editingEntry) {
      setValue(editingEntry.value);
      setSelectedDate(new Date(editingEntry.date));
    } else {
      setValue(70);
      setSelectedDate(new Date());
    }
  }, [editingEntry, visible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 handleDateChange ejecutado:', { event, selectedDate });
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getMeasurementTypeLabel = (type: string): string => {
    const labels = {
      waist: 'Cintura',
      chest: 'Pecho',
      arm: 'Brazo',
      thigh: 'Muslo',
      hip: 'Cadera'
    };
    return labels[type as keyof typeof labels] || 'Medida';
  };

  const handleSubmit = async () => {
    if (!value || value <= 0) {
      Alert.alert('Error', 'Por favor selecciona un peso válido');
      return;
    }

    const numericValue = value;

    setIsLoading(true);

    try {
      const dateString = formatDate(selectedDate);
      const isToday = ProgressService.isToday(dateString);

      if (type === 'peso') {
        if (editingEntry) {
          await ProgressService.updateWeightEntry(editingEntry.id, numericValue, dateString);
          // Si es edición de peso de hoy, también actualizar perfil
          if (isToday) {
            console.log('📅 Editando peso de hoy, actualizando perfil...');
            await updateProfileWeight(numericValue);
          }
        } else {
          // Usar la nueva función con sincronización automática
          await ProgressService.addWeightEntryWithSync(numericValue, dateString, updateProfileWeight);
        }
      } else {
        if (editingEntry) {
          // TODO: Implementar updateMeasurementEntry cuando sea necesario
          Alert.alert('Info', 'Edición de medidas próximamente disponible');
        } else {
          await ProgressService.addMeasurementEntry(numericValue, dateString, measurementType!);
        }
      }

      Alert.alert(
        'Éxito',
        isToday 
          ? `¡${type === 'peso' ? 'Peso' : 'Medida'} registrado y perfil actualizado!`
          : `¡${type === 'peso' ? 'Peso' : 'Medida'} registrado para ${dateString}!`
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving progress entry:', error);
      Alert.alert('Error', 'No se pudo guardar el registro. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const isToday = ProgressService.isToday(formatDate(selectedDate));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {editingEntry ? 'Editar' : 'Agregar'} {type === 'peso' ? 'Peso' : getMeasurementTypeLabel(measurementType!)}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Valor */}
            <View style={styles.inputGroup}>
              {type === 'peso' ? (
                <WeightPicker
                  value={value}
                  onValueChange={setValue}
                />
              ) : (
                <>
                  <Text style={styles.label}>
                    {`${getMeasurementTypeLabel(measurementType!)} (cm):`}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={value.toString()}
                    onChangeText={(text) => setValue(parseFloat(text) || 0)}
                    placeholder={`Ingresa el ${type === 'peso' ? 'peso' : 'valor'}`}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    autoFocus={true}
                  />
                </>
              )}
            </View>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  console.log('📅 Abriendo calendario...');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateButtonText}>
                  {selectedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
              
              {isToday && (
                <Text style={styles.todayIndicator}>
                  📅 Este es el peso de hoy - se actualizará tu perfil
                </Text>
              )}
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
                textColor={Colors.textPrimary}
                themeVariant="dark"
              />
            )}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Guardando...' : (editingEntry ? 'Actualizar' : 'Agregar')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  todayIndicator: {
    fontSize: 12,
    color: Colors.protein,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  datePicker: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.protein,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProgressEntryModal;
