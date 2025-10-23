import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import apiService from '../services/apiService';
import { useTranslation } from 'react-i18next';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

export default function OfflineIndicator({ 
  onRetry 
}: OfflineIndicatorProps) {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const connected = apiService.isConnected();
      const offlineMode = apiService.isOfflineMode();
      const nowOffline = !connected || offlineMode;
      
      setIsOffline(nowOffline);
    };

    // Verificar estado inicial
    checkConnection();

    // Verificar cada 2 segundos
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isOffline && !isCheckingConnection) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              {isCheckingConnection ? '🔄' : isOffline ? '⚠️' : '🌐'}
            </Text>
            {isOffline && (
              <View style={styles.pulseDot} />
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isCheckingConnection ? t('offline.checking') : 
               isOffline ? t('offline.title') : t('offline.connected')}
            </Text>
            <Text style={styles.subtitle}>
              {isCheckingConnection ? t('offline.checkingMessage') :
               isOffline ? t('offline.message') : t('offline.synced')}
            </Text>
          </View>
          
          {isOffline && onRetry && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>↻</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  icon: {
    fontSize: 16,
  },
  pulseDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff6b6b',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  subtitle: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
    fontWeight: '400',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
