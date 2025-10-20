import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  style?: any;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  const currentLangData = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.buttonText}>
          {currentLangData?.flag} {currentLangData?.name}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🌍 {t('language.selectLanguage')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.languageList}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  currentLanguage === language.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[
                  styles.languageName,
                  currentLanguage === language.code && styles.selectedLanguageText
                ]}>
                  {language.name}
                </Text>
                {currentLanguage === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  languageList: {
    flex: 1,
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLanguage: {
    backgroundColor: '#007AFF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: 'white',
  },
  checkmark: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher;
