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
import { useTranslation } from 'react-i18next';
import i18n from '../../config/i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/colors';
import progressService from '../../services/progressService';
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
  const { t } = useTranslation();
  
  // Función para obtener el locale correcto
  const getLocale = () => {
    switch (i18n.language) {
      case 'es': return 'es-ES';
      case 'en': return 'en-GB';
      case 'pt': return 'pt-PT';
      default: return 'es-ES';
    }
  };
  const [value, setValue] = useState(70);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingWeightEntry, setExistingWeightEntry] = useState<any>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  
  // Usar el contexto del perfil para actualización en tiempo real
  const { updateProfileWeight } = useProfile();

  useEffect(() => {
    if (editingEntry) {
      setValue(editingEntry.value);
      setSelectedDate(new Date(editingEntry.date));
      setExistingWeightEntry(null);
    } else {
      setValue(70);
      setSelectedDate(new Date());
      checkExistingWeight();
    }
  }, [editingEntry, visible]);

  // Verificar si ya existe un peso para la fecha seleccionada
  const checkExistingWeight = async () => {
    if (type !== 'peso') return;
    
    try {
      setIsCheckingExisting(true);
      const dateString = formatDate(selectedDate);
      const existingEntries = await progressService.getWeightEntriesByDate(dateString);
      
      if (existingEntries.entries && existingEntries.entries.length > 0) {
        // Tomar el peso más reciente del día
        const latestEntry = existingEntries.entries[0];
        setExistingWeightEntry(latestEntry);
        setValue(latestEntry.weight);
      } else {
        setExistingWeightEntry(null);
      }
    } catch (error) {
      console.error('Error checking existing weight:', error);
      setExistingWeightEntry(null);
    } finally {
      setIsCheckingExisting(false);
    }
  };

  // Verificar peso existente cuando cambia la fecha
  useEffect(() => {
    if (!editingEntry && type === 'peso') {
      checkExistingWeight();
    }
  }, [selectedDate, type, editingEntry]);

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
      const isToday = progressService.isToday(dateString);

      if (type === 'peso') {
        if (editingEntry) {
          // Editar entrada existente
          await progressService.updateWeightEntry(editingEntry.id, {
            weight: numericValue,
            entry_date: dateString
          });
          // Si es edición de peso de hoy, también actualizar perfil
          if (isToday) {
            console.log('📅 Editando peso de hoy, actualizando perfil...');
            await updateProfileWeight(numericValue);
          }
        } else if (existingWeightEntry) {
          // Actualizar peso existente del día
          await progressService.updateWeightEntry(existingWeightEntry.id, {
            weight: numericValue,
            entry_date: dateString
          });
          console.log('📅 Actualizando peso existente del día');
          
          // Si es peso de hoy, también actualizar perfil
          if (isToday) {
            console.log('📅 Actualizando peso de hoy, actualizando perfil...');
            await updateProfileWeight(numericValue);
          }
        } else {
          // Agregar nueva entrada de peso
          await progressService.addWeightEntry({
            weight: numericValue,
            entry_date: dateString
          });
          
          // Si es peso de hoy, también actualizar perfil
          if (isToday) {
            console.log('📅 Agregando peso de hoy, actualizando perfil...');
            await updateProfileWeight(numericValue);
          }
        }
      } else {
        if (editingEntry) {
          // TODO: Implementar updateMeasurementEntry cuando sea necesario
          Alert.alert('Info', 'Edición de medidas próximamente disponible');
        } else {
          await progressService.addMeasurementEntry(numericValue, dateString, measurementType!);
        }
      }

      const actionText = editingEntry ? 'actualizado' : 
                        existingWeightEntry ? 'actualizado' : 'registrado';
      
      Alert.alert(
        t('alerts.success'),
        isToday 
          ? t('progress.entryAddedAndProfileUpdated')
          : t('progress.entryAddedForDate')
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

  const isToday = progressService.isToday(formatDate(selectedDate));

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
                {editingEntry ? t('modals.edit') : 
                 existingWeightEntry ? t('modals.update') : t('modals.add')} {type === 'peso' ? t('progress.weight') : getMeasurementTypeLabel(measurementType!)}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Valor */}
            <View style={styles.inputGroup}>
              {isCheckingExisting && (
                <Text style={styles.checkingText}>
                  🔍 Verificando si ya existe peso para este día...
                </Text>
              )}
              {existingWeightEntry && !editingEntry && (
                <Text style={styles.existingWeightText}>
                  ⚠️ Ya existe un peso para este día: {existingWeightEntry.weight}kg
                </Text>
              )}
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
                    placeholder={`Ingresa el valor`}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    autoFocus={true}
                  />
                </>
              )}
            </View>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('progress.date')}:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  console.log('📅 Abriendo calendario...');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateButtonText}>
                  {selectedDate.toLocaleDateString(getLocale(), {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
              
              {isToday && (
                <Text style={styles.todayIndicator}>
                  📅 {t('progress.todayWeightIndicator')}
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
                <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? t('modals.loading') : 
                   editingEntry ? t('modals.update') : 
                   existingWeightEntry ? t('modals.update') : t('modals.add')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  todayIndicator: {
    fontSize: 13,
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#DC143C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC143C',
    fontWeight: '500',
  },
  datePicker: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b0b0b0',
  },
  submitButton: {
    backgroundColor: '#DC143C',
    borderWidth: 1,
    borderColor: '#DC143C',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  checkingText: {
    fontSize: 14,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  existingWeightText: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
});

export default ProgressEntryModal;
