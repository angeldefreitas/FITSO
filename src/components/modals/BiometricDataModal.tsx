import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import AgePicker from '../AgePicker';
import WeightPicker from '../WeightPicker';
import HeightPicker from '../HeightPicker';
import GenderPicker from '../GenderPicker';
import ActivityLevelPicker from '../ActivityLevelPicker';

interface BiometricDataModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: BiometricData) => void;
  initialData?: BiometricData;
  loading?: boolean;
}

export interface BiometricData {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

const BiometricDataModal: React.FC<BiometricDataModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

  useEffect(() => {
    if (initialData) {
      setAge(initialData.age);
      setHeightCm(initialData.heightCm);
      setWeightKg(initialData.weightKg);
      setGender(initialData.gender);
      setActivityLevel(initialData.activityLevel);
    }
  }, [initialData]);

  const handleSave = () => {
    const data: BiometricData = {
      age,
      heightCm,
      weightKg,
      gender,
      activityLevel,
    };
    onSave(data);
  };

  const handleCancel = () => {
    Alert.alert(
      'Descartar Cambios',
      '¿Estás seguro de que quieres descartar los cambios?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', style: 'destructive', onPress: onClose },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.biometricData')}</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>{t('modals.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            {t('profile.updateBasicInfo')}
          </Text>

          {/* Edad */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.age')}</Text>
            <AgePicker
              value={age}
              onValueChange={setAge}
            />
          </View>

          {/* Peso y Altura */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>{t('auth.weight')} (kg)</Text>
              <WeightPicker
                value={weightKg}
                onValueChange={setWeightKg}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>{t('auth.height')} (cm)</Text>
              <HeightPicker
                value={heightCm}
                onValueChange={setHeightCm}
              />
            </View>
          </View>

          {/* Sexo biológico */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.gender')}</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => setGender('male')}
              >
                <Text style={styles.genderIcon}>♂</Text>
                <Text style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextActive
                ]}>
                  {t('auth.male')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => setGender('female')}
              >
                <Text style={styles.genderIcon}>♀</Text>
                <Text style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextActive
                ]}>
                  {t('auth.female')}
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Nivel de actividad física */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.activityLevel')}</Text>
            <View style={styles.activityGrid}>
              <TouchableOpacity
                style={[
                  styles.activityButton,
                  activityLevel === 'sedentary' && styles.activityButtonActive
                ]}
                onPress={() => setActivityLevel('sedentary')}
              >
                <Text style={styles.activityIcon}>🛋️</Text>
                <Text style={[
                  styles.activityTitle,
                  activityLevel === 'sedentary' && styles.activityTitleActive
                ]}>
                  {t('auth.sedentary')}
                </Text>
                <Text style={[
                  styles.activitySubtitle,
                  activityLevel === 'sedentary' && styles.activitySubtitleActive
                ]}>
                  {t('auth.sedentaryDescription')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityButton,
                  activityLevel === 'light' && styles.activityButtonActive
                ]}
                onPress={() => setActivityLevel('light')}
              >
                <Text style={styles.activityIcon}>🚶</Text>
                <Text style={[
                  styles.activityTitle,
                  activityLevel === 'light' && styles.activityTitleActive
                ]}>
                  {t('auth.light')}
                </Text>
                <Text style={[
                  styles.activitySubtitle,
                  activityLevel === 'light' && styles.activitySubtitleActive
                ]}>
                  {t('auth.lightDescription')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityButton,
                  activityLevel === 'moderate' && styles.activityButtonActive
                ]}
                onPress={() => setActivityLevel('moderate')}
              >
                <Text style={styles.activityIcon}>🏃</Text>
                <Text style={[
                  styles.activityTitle,
                  activityLevel === 'moderate' && styles.activityTitleActive
                ]}>
                  {t('auth.moderate')}
                </Text>
                <Text style={[
                  styles.activitySubtitle,
                  activityLevel === 'moderate' && styles.activitySubtitleActive
                ]}>
                  {t('auth.moderateDescription')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityButton,
                  activityLevel === 'active' && styles.activityButtonActive
                ]}
                onPress={() => setActivityLevel('active')}
              >
                <Text style={styles.activityIcon}>💪</Text>
                <Text style={[
                  styles.activityTitle,
                  activityLevel === 'active' && styles.activityTitleActive
                ]}>
                  {t('auth.active')}
                </Text>
                <Text style={[
                  styles.activitySubtitle,
                  activityLevel === 'active' && styles.activitySubtitleActive
                ]}>
                  {t('auth.activeDescription')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  genderIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  genderText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  genderTextActive: {
    color: Colors.primary,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  activityTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activitySubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  activityTitleActive: {
    color: Colors.primary,
  },
  activitySubtitleActive: {
    color: Colors.primary,
  },
});

export default BiometricDataModal;
