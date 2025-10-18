import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface WaterGoalPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (goal: number) => void;
  currentGoal: number;
}

const WaterGoalPicker: React.FC<WaterGoalPickerProps> = ({
  visible,
  onClose,
  onConfirm,
  currentGoal,
}) => {
  const [tempWaterGoal, setTempWaterGoal] = useState(currentGoal);

  const handleConfirm = () => {
    onConfirm(tempWaterGoal);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Objetivo de Agua</Text>
            <Text style={styles.pickerModalSubtitle}>Selecciona cuántos vasos quieres beber al día</Text>
          </View>

          <View style={styles.pickerContainer}>
            <ScrollView 
              style={styles.pickerScrollView}
              contentContainerStyle={styles.pickerScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.pickerItem,
                    tempWaterGoal === num && styles.pickerItemSelected
                  ]}
                  onPress={() => setTempWaterGoal(num)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    tempWaterGoal === num && styles.pickerItemTextSelected
                  ]}>
                    {num} {num === 1 ? 'vaso' : 'vasos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerModalButtons}>
            <TouchableOpacity
              style={[styles.pickerModalButton, styles.pickerModalButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.pickerModalButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerModalButton, styles.pickerModalButtonConfirm]}
              onPress={handleConfirm}
            >
              <Text style={styles.pickerModalButtonTextConfirm}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  // Estilos para el modal de picker de agua
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  pickerModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '85%' as any,
    maxHeight: '70%' as any,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden' as const,
  },

  pickerModalHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center' as const,
  },

  pickerModalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center' as const,
  },

  pickerContainer: {
    maxHeight: 300,
  },

  pickerScrollView: {
    maxHeight: 300,
  },

  pickerScrollContent: {
    paddingVertical: 8,
  },

  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  pickerItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  pickerItemText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },

  pickerItemTextSelected: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: '700' as const,
  },

  pickerModalButtons: {
    flexDirection: 'row' as const,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },

  pickerModalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  pickerModalButtonCancel: {
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },

  pickerModalButtonConfirm: {
    backgroundColor: '#4A90E2',
  },

  pickerModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6c757d',
  },

  pickerModalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
};

export default WaterGoalPicker;
