import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import BottomNavigation from '../components/BottomNavigation';
import BannerAd from '../components/BannerAd';
import progressService from '../services/progressService';
import { ProgressData, TimeFilter, ProgressEntry } from '../types/progress';
import ProgressEntryModal from '../components/modals/ProgressEntryModal';
import TimeFilterSelector from '../components/ui/TimeFilterSelector';
import ProgressSummary from '../components/ui/ProgressSummary';
import ProgressHistory from '../components/ui/ProgressHistory';
import { useProfile } from '../contexts/ProfileContext';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressTrackingScreenProps {
  onClose: () => void;
  onTabChange?: (tab: 'diario' | 'perfil') => void;
  onAddPress?: () => void;
  currentTab?: 'diario' | 'perfil';
}

type ChartType = 'peso' | 'medidas';

const ProgressTrackingScreen: React.FC<ProgressTrackingScreenProps> = ({ onClose, onTabChange, onAddPress, currentTab = 'diario' }) => {
  const { t } = useTranslation();
  const [selectedChart, setSelectedChart] = useState<ChartType>('peso');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('6months');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook para sincronización del perfil en tiempo real
  const { profile, refreshProfile } = useProfile();

  // Cargar datos de progreso
  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando datos de progreso...', { selectedChart, selectedTimeFilter, profileWeight: profile?.weight });
      const data = await progressService.getProgressData(selectedChart, selectedTimeFilter);
      setProgressData(data);
      console.log('✅ Datos de progreso cargados:', data.entries.length, 'entradas');
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert(t('alerts.error'), t('progress.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, [selectedChart, selectedTimeFilter, profile]);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowEntryModal(true);
  };

  const handleEditEntry = (entry: ProgressEntry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (entry: ProgressEntry) => {
    Alert.alert(
      t('progress.deleteRecord'),
      t('progress.deleteRecordMessage'),
      [
        { text: t('modals.cancel'), style: 'cancel' },
        {
          text: t('modals.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if ('type' in entry) {
                // Es una medida - por ahora no implementado
                Alert.alert(t('alerts.info'), t('progress.deleteMeasuresSoon'));
              } else {
                await progressService.deleteWeightEntry(entry.id);
                await loadProgressData();
              }
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert(t('alerts.error'), t('progress.deleteError'));
            }
          }
        }
      ]
    );
  };

  const handleEntrySuccess = async () => {
    // Recargar datos de progreso
    await loadProgressData();
    
    // Si es peso, también recargar el perfil para mostrar el peso actualizado
    if (selectedChart === 'peso') {
      console.log('🔄 Actualizando perfil en tiempo real...');
      await refreshProfile();
      if (profile) {
        console.log('📊 Perfil actualizado - Peso actual:', profile.weight);
      }
    }
  };


  const renderChart = () => {
    if (!progressData || progressData.filteredEntries.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {selectedChart === 'peso' ? t('progress.weightEvolution') : t('progress.bodyMeasurements')}
            </Text>
            <Text style={styles.chartUnit}>
              {selectedChart === 'peso' ? 'kg' : 'cm'}
            </Text>
          </View>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              {selectedChart === 'peso'
                ? t('progress.addFirstWeight')
                : t('progress.addFirstMeasurement')
              }
            </Text>
          </View>
        </View>
      );
    }

    // Convertir datos para el gráfico
    const data = progressData.filteredEntries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      }),
      value: entry.value
    }));

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1; // Evitar división por cero

    // Dimensiones fijas del gráfico
    const chartWidth = screenWidth - 100; // 50px de margen a cada lado
    const chartHeight = 200;
    const chartPadding = 20;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {selectedChart === 'peso' ? t('progress.weightEvolution') : t('progress.bodyMeasurements')}
          </Text>
          <Text style={styles.chartUnit}>
            {selectedChart === 'peso' ? 'kg' : 'cm'}
          </Text>
        </View>
        
        <View style={styles.chartArea}>
          {/* Eje Y (valores) */}
          <View style={styles.yAxis}>
            {[maxValue, minValue + range * 0.5, minValue].map((value, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {value.toFixed(1)}
              </Text>
            ))}
          </View>
          
          {/* Gráfico de línea */}
          <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
            {/* Línea de progreso */}
            <View style={[styles.lineContainer, { width: chartWidth, height: chartHeight }]}>
              {data.length === 1 ? (
                // Línea recta simbólica para un solo valor
                <View
                  style={[
                    styles.chartLine,
                    {
                      left: chartPadding,
                      top: chartPadding + (chartHeight - chartPadding * 2) / 2,
                      width: chartWidth - chartPadding * 2,
                      height: 3,
                      backgroundColor: '#DC143C', // Rojo
                      opacity: 0.6
                    }
                  ]}
                />
              ) : (
                // Líneas normales para múltiples valores
                data.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = data[index - 1];
                  
                  // Calcular posiciones dentro del área del gráfico
                  const currentY = chartPadding + (chartHeight - chartPadding * 2) - ((point.value - minValue) / range) * (chartHeight - chartPadding * 2);
                  const prevY = chartPadding + (chartHeight - chartPadding * 2) - ((prevPoint.value - minValue) / range) * (chartHeight - chartPadding * 2);
                  const currentX = chartPadding + ((index / (data.length - 1)) * (chartWidth - chartPadding * 2));
                  const prevX = chartPadding + (((index - 1) / (data.length - 1)) * (chartWidth - chartPadding * 2));
                  
                  const length = Math.sqrt(Math.pow(currentX - prevX, 2) + Math.pow(currentY - prevY, 2));
                  const angle = Math.atan2(currentY - prevY, currentX - prevX) * (180 / Math.PI);
                  
                  return (
                    <View
                      key={`line-${index}`}
                      style={[
                        styles.chartLine,
                        {
                          left: prevX,
                          top: prevY,
                          width: length,
                          transform: [{ rotate: `${angle}deg` }],
                          backgroundColor: '#DC143C' // Rojo
                        }
                      ]}
                    />
                  );
                })
              )}
            </View>
            
            {/* Etiquetas de fechas (sin puntos) */}
            {data.map((point, index) => {
              const x = chartPadding + ((index / (data.length - 1)) * (chartWidth - chartPadding * 2));
              
              // Ajustar posición de la etiqueta para evitar que se corte
              let labelLeft = -20;
              if (index === 0) {
                // Primer punto (más antiguo) - alinear a la izquierda
                labelLeft = -10;
              } else if (index === data.length - 1) {
                // Último punto (más reciente) - alinear a la derecha
                labelLeft = -30;
              }
              
              return (
                <Text 
                  key={index} 
                  style={[
                    styles.xAxisLabel, 
                    { 
                      left: x + labelLeft, 
                      bottom: -5, // Justo debajo del gráfico
                      color: '#000000', // Negro
                      fontWeight: '500'
                    }
                  ]}
                >
                  {point.date}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const getTimeFilterLabel = (filter: TimeFilter): string => {
    return t(`progress.timeFilters.${filter}`);
  };

  return (
    <LinearGradient
      colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Header con título */}
        <View style={styles.appHeader}>
          <Text style={styles.appTitle}>FITSO</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Ad */}
        <BannerAd style={styles.bannerAd} />

        {/* Selector de gráfico */}
        <View style={styles.chartSelector}>
          <TouchableOpacity 
            style={[styles.selectorButton, selectedChart === 'peso' && styles.selectorButtonActive]}
            onPress={() => setSelectedChart('peso')}
          >
            <Text style={[styles.selectorText, selectedChart === 'peso' && styles.selectorTextActive]}>
              {t('progress.weight')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.selectorButton, selectedChart === 'medidas' && styles.selectorButtonActive]}
            onPress={() => setSelectedChart('medidas')}
          >
            <Text style={[styles.selectorText, selectedChart === 'medidas' && styles.selectorTextActive]}>
              {t('progress.measurements')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro de tiempo */}
        <TimeFilterSelector
          selectedFilter={selectedTimeFilter}
          onFilterChange={setSelectedTimeFilter}
        />

        {/* Indicador de peso actual del perfil */}
        {selectedChart === 'peso' && profile && (
          <View style={styles.profileWeightIndicator}>
            <Text style={styles.profileWeightLabel}>{t('progress.currentProfileWeight')}</Text>
            <Text style={styles.profileWeightValue}>{profile.weight} kg</Text>
            <Text style={styles.profileWeightSubtext}>
              {profile.lastUpdated ? 
                `${t('progress.updated')}: ${new Date(profile.lastUpdated).toLocaleString('es-ES')}` : 
                t('progress.syncedInRealTime')
              }
            </Text>
          </View>
        )}

        {/* Resumen de progreso */}
        {progressData && (
          <ProgressSummary
            summary={progressData.summary}
            type={selectedChart}
            timeFilter={getTimeFilterLabel(selectedTimeFilter)}
          />
        )}

        {/* Gráfico */}
        {renderChart()}

        {/* Historial de registros */}
        {progressData && (
          <ProgressHistory
            entries={progressData.filteredEntries}
            type={selectedChart}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {/* Botón para agregar nuevo registro */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
            <Text style={styles.addButtonText}>
              + {t('modals.add')} {selectedChart === 'peso' ? t('progress.weight') : t('progress.measurements')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espacio adicional para scroll */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      {onTabChange && (
        <BottomNavigation 
          activeTab={currentTab} 
          onTabChange={(tab) => {
            onTabChange(tab);
            onClose(); // Cerrar ProgressTrackingScreen al navegar
          }}
          onAddPress={onAddPress}
          onProgressPress={() => {}} // No hacer nada ya que estamos en esta pantalla
        />
      )}

      {/* Modal de entrada de datos */}
      <ProgressEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={handleEntrySuccess}
        type={selectedChart}
        editingEntry={editingEntry}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120,
  },
  // Banner Ad
  bannerAd: {
    marginBottom: 8,
  },
  // Header de la aplicación
  appHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  // Selector de gráfico
  chartSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: Colors.textPrimary,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  // Estilos del gráfico
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  chartUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartArea: {
    flexDirection: 'row',
    height: 260,
    overflow: 'visible',
    marginBottom: 10,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  yAxisLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chart: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  chartLine: {
    height: 3,
    position: 'absolute',
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    position: 'absolute',
    textAlign: 'center',
    minWidth: 50,
    maxWidth: 60,
    overflow: 'visible',
  },
  // Gráfico vacío
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Botón de agregar
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: Colors.protein,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  // Indicador de peso del perfil
  profileWeightIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileWeightLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileWeightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileWeightSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ProgressTrackingScreen;
