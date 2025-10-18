import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, ScrollView, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import Svg, { Path } from 'react-native-svg';
import { NutritionGoals, calculateNutritionProgress } from '../lib/nutritionCalculator';

interface BottomNavigationProps {
  activeTab: 'diario' | 'perfil';
  onTabChange: (tab: 'diario' | 'perfil') => void;
  onAddPress?: () => void;
  onProgressPress?: () => void;
  nutritionGoals?: NutritionGoals | null;
  consumed?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'recommendation' | 'reminder' | 'achievement';
  timestamp: Date;
  read: boolean;
}

export default function BottomNavigation({ activeTab, onTabChange, onAddPress, onProgressPress, nutritionGoals, consumed }: BottomNavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Generar recomendaciones nutricionales
  const getNutritionRecommendations = () => {
    if (!nutritionGoals || !consumed) return [];
    
    const progress = calculateNutritionProgress(nutritionGoals, consumed);
    const recommendations = [];
    
    // Recomendación de calorías
    if (progress.calories.percentage < 50) {
      recommendations.push({
        id: 'calories-low',
        title: 'Necesitas más calorías',
        message: `Te faltan ${progress.calories.remaining} calorías para alcanzar tu objetivo diario.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '🍽️',
        color: Colors.warning,
      });
    } else if (progress.calories.percentage > 100) {
      recommendations.push({
        id: 'calories-high',
        title: 'Has excedido las calorías',
        message: `Has consumido ${Math.abs(progress.calories.remaining)} calorías más de tu objetivo.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '⚠️',
        color: Colors.error,
      });
    } else if (progress.calories.percentage >= 90) {
      recommendations.push({
        id: 'calories-good',
        title: '¡Excelente progreso!',
        message: `Solo te faltan ${progress.calories.remaining} calorías para alcanzar tu meta.`,
        type: 'achievement' as const,
        timestamp: new Date(),
        read: false,
        icon: '🎯',
        color: Colors.success,
      });
    }
    
    // Recomendación de proteína
    if (progress.protein.percentage < 70) {
      recommendations.push({
        id: 'protein-low',
        title: 'Aumenta tu proteína',
        message: `Te faltan ${progress.protein.remaining}g de proteína. Considera agregar carne, pescado o legumbres.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '🥩',
        color: Colors.warning,
      });
    } else if (progress.protein.percentage >= 90) {
      recommendations.push({
        id: 'protein-good',
        title: 'Proteína óptima',
        message: `¡Excelente! Has alcanzado ${Math.round(progress.protein.percentage)}% de tu objetivo de proteína.`,
        type: 'achievement' as const,
        timestamp: new Date(),
        read: false,
        icon: '💪',
        color: Colors.success,
      });
    }
    
    // Recomendación de carbohidratos
    if (progress.carbs.percentage < 50) {
      recommendations.push({
        id: 'carbs-low',
        title: 'Necesitas más carbohidratos',
        message: `Te faltan ${progress.carbs.remaining}g de carbohidratos. Agrega arroz, pasta o frutas.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '🍞',
        color: Colors.warning,
      });
    } else if (progress.carbs.percentage > 120) {
      recommendations.push({
        id: 'carbs-high',
        title: 'Reduce los carbohidratos',
        message: `Has excedido tu objetivo de carbohidratos en ${Math.abs(progress.carbs.remaining)}g.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '📉',
        color: Colors.error,
      });
    }
    
    // Recomendación de grasas
    if (progress.fat.percentage < 60) {
      recommendations.push({
        id: 'fat-low',
        title: 'Aumenta las grasas saludables',
        message: `Te faltan ${progress.fat.remaining}g de grasas. Agrega aguacate, nueces o aceite de oliva.`,
        type: 'recommendation' as const,
        timestamp: new Date(),
        read: false,
        icon: '🥑',
        color: Colors.warning,
      });
    } else if (progress.fat.percentage >= 90) {
      recommendations.push({
        id: 'fat-good',
        title: 'Grasas equilibradas',
        message: `¡Perfecto! Has alcanzado ${Math.round(progress.fat.percentage)}% de tu objetivo de grasas.`,
        type: 'achievement' as const,
        timestamp: new Date(),
        read: false,
        icon: '✨',
        color: Colors.success,
      });
    }
    
    return recommendations;
  };

  const notifications = getNutritionRecommendations();
  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationIcon = () => (
    <Svg width={30} height={30} viewBox="0 0 24 24" fill={Colors.textPrimary}>
      <Path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/>
      <Path fill={Colors.textPrimary} d="M12 2a7 7 0 0 0-7 7v3.528a1 1 0 0 1-.105.447l-1.717 3.433A1.1 1.1 0 0 0 4.162 18h15.676a1.1 1.1 0 0 0 .984-1.592l-1.716-3.433a1 1 0 0 1-.106-.447V9a7 7 0 0 0-7-7m0 19a3 3 0 0 1-2.83-2h5.66A3 3 0 0 1 12 21"/>
    </Svg>
  );

  const ProfileIcon = () => (
    <Svg width={30} height={30} viewBox="0 0 24 24" fill={Colors.textPrimary}>
      <Path
        fillRule="evenodd"
        d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
        clipRule="evenodd"
      />
    </Svg>
  );

  const HomeIcon = () => (
    <Svg width={30} height={30} viewBox="0 0 512 512" fill={Colors.textPrimary}>
      <Path d="M261.56 101.28a8 8 0 0 0-11.06 0L66.4 277.15a8 8 0 0 0-2.47 5.79L63.9 448a32 32 0 0 0 32 32H192a16 16 0 0 0 16-16V328a8 8 0 0 1 8-8h80a8 8 0 0 1 8 8v136a16 16 0 0 0 16 16h96.06a32 32 0 0 0 32-32V282.94a8 8 0 0 0-2.47-5.79Z"/>
      <Path d="m490.91 244.15l-74.8-71.56V64a16 16 0 0 0-16-16h-48a16 16 0 0 0-16 16v32l-57.92-55.38C272.77 35.14 264.71 32 256 32c-8.68 0-16.72 3.14-22.14 8.63l-212.7 203.5c-6.22 6-7 15.87-1.34 22.37A16 16 0 0 0 43 267.56L250.5 69.28a8 8 0 0 1 11.06 0l207.52 198.28a16 16 0 0 0 22.59-.44c6.14-6.36 5.63-16.86-.76-22.97"/>
    </Svg>
  );

  const AddIcon = () => (
    <Svg width={60} height={60} viewBox="0 0 24 24" fill="#ffffff">
      <Path
        fillRule="evenodd"
        d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75S22.75 17.937 22.75 12S17.937 1.25 12 1.25M12.75 8a.75.75 0 0 0-1.5 0v3.25H8a.75.75 0 0 0 0 1.5h3.25V16a.75.75 0 0 0 1.5 0v-3.25H16a.75.75 0 0 0 0-1.5h-3.25z"
        clipRule="evenodd"
      />
    </Svg>
  );

  const ChartIcon = () => (
    <Svg width={30} height={30} viewBox="0 0 16 16" fill={Colors.textPrimary}>
      <Path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0m14.28 2.53l-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06L4.28 9.78a.75.75 0 0 1-1.042-.018a.75.75 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.75.75 0 0 1 1.042.018a.75.75 0 0 1 .018 1.042"/>
    </Svg>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {/* Diario */}
        <TouchableOpacity
          style={[
            styles.navButton,
            activeTab === 'diario' && styles.activeNavButton
          ]}
          onPress={() => onTabChange('diario')}
        >
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <HomeIcon />
            </View>
          </View>
        </TouchableOpacity>

        {/* Progreso */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            if (onProgressPress) {
              onProgressPress();
            }
          }}
        >
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <ChartIcon />
            </View>
          </View>
        </TouchableOpacity>

        {/* Botón + central */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (onAddPress) {
              onAddPress();
            }
          }}
        >
          <View style={styles.addIcon}>
            <AddIcon />
          </View>
        </TouchableOpacity>

        {/* Perfil */}
        <TouchableOpacity
          style={[
            styles.navButton,
            activeTab === 'perfil' && styles.activeNavButton
          ]}
          onPress={() => onTabChange('perfil')}
        >
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <ProfileIcon />
            </View>
          </View>
        </TouchableOpacity>

        {/* Notificaciones */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setShowNotifications(true)}
        >
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <NotificationIcon />
            </View>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de Notificaciones */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationsContainer}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Notificaciones</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <View style={[
                          styles.notificationTypeBadge,
                          notification.type === 'achievement' && styles.achievementBadge,
                          notification.type === 'recommendation' && styles.recommendationBadge,
                          notification.type === 'reminder' && styles.reminderBadge,
                        ]}>
                          <Text style={styles.notificationTypeText}>
                            {notification.icon}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>
                        {notification.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noRecommendations}>
                  <Text style={styles.noRecommendationsText}>🎉 ¡Excelente! Estás cumpliendo todos tus objetivos nutricionales.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40, // Más espacio desde el borde inferior
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(69, 0, 0, 0.95)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 350,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeNavButton: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: -20, // Hace que sobresalga del bottomnav
  },
  addIcon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  addVertical: {
    position: 'absolute',
    width: 2,
    height: 14,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  
  // Icono de casa/diario
  houseIcon: {
    width: 16,
    height: 14,
    alignItems: 'center',
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.textPrimary,
  },
  houseBase: {
    width: 12,
    height: 8,
    backgroundColor: Colors.textPrimary,
    marginTop: -1,
  },
  houseDoor: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 5,
    backgroundColor: 'rgba(42, 42, 42, 1)',
    borderRadius: 1,
  },
  
  // Icono de gráfico/progreso
  chartIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    width: 16,
  },
  chartBar1: {
    width: 3,
    height: 8,
    backgroundColor: Colors.textPrimary,
    marginRight: 2,
  },
  chartBar2: {
    width: 3,
    height: 12,
    backgroundColor: Colors.textPrimary,
    marginRight: 2,
  },
  chartBar3: {
    width: 3,
    height: 6,
    backgroundColor: Colors.textPrimary,
  },
  
  // Icono de campana
  bellIcon: {
    width: 14,
    height: 16,
    alignItems: 'center',
  },
  bellBody: {
    width: 12,
    height: 10,
    backgroundColor: Colors.textPrimary,
    borderRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  bellClapper: {
    width: 2,
    height: 4,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
    marginTop: 2,
  },
  
  // Icono de engranaje
  gearIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: 8,
    height: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 4,
  },
  gearTooth1: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 4,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  gearTooth2: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 4,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  gearTooth3: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  gearTooth4: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },

  // Estilos para notificaciones
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(42, 42, 42, 0.95)',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 12,
  },
  notificationTypeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBadge: {
    backgroundColor: '#FFF3CD',
  },
  recommendationBadge: {
    backgroundColor: '#D1ECF1',
  },
  reminderBadge: {
    backgroundColor: '#F8D7DA',
  },
  notificationTypeText: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#ADB5BD',
    fontWeight: '500',
  },

  noRecommendations: {
    padding: 40,
    alignItems: 'center',
  },
  noRecommendationsText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
});
