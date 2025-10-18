import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { ProgressService } from '../../services/progressService';
import { ProgressData, TimeFilter } from '../../types/progress';

interface ProgressTrackingProps {
  onPress?: () => void;
  onChartPress?: () => void;
  onCaloriesBurnedChange?: (calories: number) => void;
  selectedDate?: Date; // Fecha seleccionada para las calorías quemadas
}

type ChartType = 'peso' | 'medidas';

interface CaloriesData {
  current: number;
  goal: number;
  percentage: number;
  isManual: boolean; // Si fue agregado manualmente
  date: string; // Fecha específica para las calorías quemadas
}

const { width: screenWidth } = Dimensions.get('window');

const ProgressTracking: React.FC<ProgressTrackingProps> = ({
  onPress,
  onChartPress,
  onCaloriesBurnedChange,
  selectedDate = new Date(),
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('peso');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para calorías quemadas
  const [caloriesData, setCaloriesData] = useState<CaloriesData>({
    current: 0,
    goal: 750,
    percentage: 0,
    isManual: false,
    date: selectedDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
  });
  const [showCaloriesModal, setShowCaloriesModal] = useState(false);
  const [caloriesInputValue, setCaloriesInputValue] = useState(50);
  const [caloriesGoalInput, setCaloriesGoalInput] = useState(750);
  const [showGoalInput, setShowGoalInput] = useState(false);

  // Cargar datos de progreso limitados a 3 meses
  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const data = await ProgressService.getProgressData(selectedChart, '3months');
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      // En caso de error, usar datos vacíos
      setProgressData({
        filteredEntries: [],
        summary: { totalEntries: 0, averageValue: 0, trend: 'stable' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos de calorías por fecha específica
  const loadCaloriesData = async () => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const savedData = await AsyncStorage.getItem(`caloriesData_${dateKey}`);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCaloriesData(parsedData);
        
        // Notificar al componente padre sobre las calorías cargadas
        if (onCaloriesBurnedChange) {
          onCaloriesBurnedChange(parsedData.current);
        }
      } else {
        // Si no hay datos para esta fecha, usar valores por defecto
        const defaultData = {
          current: 0,
          goal: 750,
          percentage: 0,
          isManual: false,
          date: dateKey,
        };
        setCaloriesData(defaultData);
        
        // Notificar al componente padre
        if (onCaloriesBurnedChange) {
          onCaloriesBurnedChange(0);
        }
      }
    } catch (error) {
      console.error('Error loading calories data:', error);
    }
  };

  // Guardar datos de calorías por fecha específica
  const saveCaloriesData = async (newData: CaloriesData) => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const dataWithDate = { ...newData, date: dateKey };
      await AsyncStorage.setItem(`caloriesData_${dateKey}`, JSON.stringify(dataWithDate));
      setCaloriesData(dataWithDate);
    } catch (error) {
      console.error('Error saving calories data:', error);
    }
  };

  // Agregar calorías manualmente
  const handleAddCalories = async (amount: number) => {
    try {
      const newCalories = Math.max(0, caloriesData.current + amount);
      const newPercentage = (newCalories / caloriesData.goal) * 100;
      
      const newData: CaloriesData = {
        ...caloriesData,
        current: newCalories,
        percentage: newPercentage,
        isManual: true,
      };
      
      await saveCaloriesData(newData);
      
      // Notificar al componente padre sobre el cambio
      if (onCaloriesBurnedChange) {
        onCaloriesBurnedChange(newCalories);
      }
    } catch (error) {
      console.error('Error adding calories:', error);
      Alert.alert('Error', 'No se pudieron agregar las calorías');
    }
  };

  // Quitar calorías manualmente
  const handleRemoveCalories = async (amount: number) => {
    try {
      const newCalories = Math.max(0, caloriesData.current - amount);
      const newPercentage = (newCalories / caloriesData.goal) * 100;
      
      const newData: CaloriesData = {
        ...caloriesData,
        current: newCalories,
        percentage: newPercentage,
        isManual: true,
      };
      
      await saveCaloriesData(newData);
      
      // Notificar al componente padre sobre el cambio
      if (onCaloriesBurnedChange) {
        onCaloriesBurnedChange(newCalories);
      }
    } catch (error) {
      console.error('Error removing calories:', error);
      Alert.alert('Error', 'No se pudieron quitar las calorías');
    }
  };

  // Actualizar meta de calorías
  const handleUpdateGoal = async () => {
    try {
      if (caloriesGoalInput <= 0) {
        Alert.alert('Error', 'La meta debe ser mayor a 0');
        return;
      }

      const newPercentage = (caloriesData.current / caloriesGoalInput) * 100;
      
      const newData: CaloriesData = {
        ...caloriesData,
        goal: caloriesGoalInput,
        percentage: newPercentage,
      };
      
      await saveCaloriesData(newData);
      setShowGoalInput(false);
      
      Alert.alert('¡Meta actualizada!', `Nueva meta: ${caloriesGoalInput} calorías`);
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'No se pudo actualizar la meta');
    }
  };

  useEffect(() => {
    loadProgressData();
    loadCaloriesData();
  }, [selectedChart]);

  // Recargar datos de calorías cuando cambie la fecha
  useEffect(() => {
    loadCaloriesData();
  }, [selectedDate]);

  const renderChart = () => {
    if (!progressData || progressData.filteredEntries.length === 0) {
      return (
        <TouchableOpacity 
          style={styles.chartContainer}
          onPress={() => {
            if (onChartPress) {
              onChartPress();
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {selectedChart === 'peso' ? 'Evolución del Peso' : 'Medidas Corporales'}
            </Text>
            <Text style={styles.chartUnit}>
              {selectedChart === 'peso' ? 'kg' : 'cm'}
            </Text>
          </View>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              {selectedChart === 'peso' 
                ? 'Agrega tu primer peso para ver la evolución'
                : 'Agrega tu primera medida para ver la evolución'
              }
            </Text>
          </View>
        </TouchableOpacity>
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

    // Dimensiones fijas del gráfico para el componente pequeño
    const chartWidth = screenWidth * 0.35;
    const chartHeight = 75;
    const chartPadding = 8;

    return (
      <TouchableOpacity style={styles.chartContainer} onPress={onChartPress} activeOpacity={0.8}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {selectedChart === 'peso' ? 'Evolución del Peso' : 'Medidas Corporales'}
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
              {data.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = data[index - 1];
                
                // Calcular posiciones dentro del área del gráfico con margen adicional para los puntos
                const pointRadius = 4; // Radio del punto
                const effectiveHeight = chartHeight - chartPadding * 2 - pointRadius * 2;
                const effectiveWidth = chartWidth - chartPadding * 2 - pointRadius * 2;
                
                const currentY = chartPadding + pointRadius + effectiveHeight - ((point.value - minValue) / range) * effectiveHeight;
                const prevY = chartPadding + pointRadius + effectiveHeight - ((prevPoint.value - minValue) / range) * effectiveHeight;
                const currentX = chartPadding + pointRadius + ((index / (data.length - 1)) * effectiveWidth);
                const prevX = chartPadding + pointRadius + (((index - 1) / (data.length - 1)) * effectiveWidth);
                
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
                        backgroundColor: selectedChart === 'peso' ? Colors.protein : Colors.carbs
                      }
                    ]}
                  />
                );
              })}
            </View>
            
            {/* Puntos de datos */}
            {data.map((point, index) => {
              // Usar la misma lógica de cálculo que las líneas
              const pointRadius = 4;
              const effectiveHeight = chartHeight - chartPadding * 2 - pointRadius * 2;
              const effectiveWidth = chartWidth - chartPadding * 2 - pointRadius * 2;
              
              const y = chartPadding + pointRadius + effectiveHeight - ((point.value - minValue) / range) * effectiveHeight;
              const x = chartPadding + pointRadius + ((index / (data.length - 1)) * effectiveWidth);
              
              // Ajustar posición de la etiqueta para evitar que se corte
              let labelLeft = -15;
              if (index === 0) {
                // Primer punto (más antiguo) - alinear a la izquierda
                labelLeft = -8;
              } else if (index === data.length - 1) {
                // Último punto (más reciente) - alinear a la derecha
                labelLeft = -22;
              }
              
              return (
                <View key={index} style={[styles.chartPoint, { left: x - 4, top: y - 4 }]}>
                  <View 
                    style={[
                      styles.chartDot,
                      {
                        backgroundColor: selectedChart === 'peso' ? Colors.protein : Colors.carbs
                      }
                    ]} 
                  />
                  <Text style={[styles.xAxisLabel, { left: labelLeft, bottom: -12 }]}>{point.date}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActivitySection = () => {
    const progress = Math.min(caloriesData.percentage, 100);
    const circumference = 2 * Math.PI * 50; // Radio de 50
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.activitySection}>
        <TouchableOpacity 
          style={styles.caloriesContainer}
          onPress={() => setShowCaloriesModal(true)}
          activeOpacity={0.7}
        >
          {/* Título y botón fuera del círculo */}
          <View style={styles.caloriesHeader}>
            <Text style={styles.caloriesTitle}>Calorías Quemadas</Text>
            <TouchableOpacity 
              style={styles.plusButton}
              onPress={() => setShowCaloriesModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Círculo de progreso */}
          <View style={styles.circleContainer}>
            <Svg width={120} height={120}>
              {/* Círculo de fondo */}
              <Circle
                cx={60}
                cy={60}
                r={50}
                stroke="rgba(0, 0, 0, 0.1)"
                strokeWidth={8}
                fill="none"
              />
              {/* Círculo de progreso */}
              <Circle
                cx={60}
                cy={60}
                r={50}
                stroke={Colors.protein}
                strokeWidth={8}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </Svg>
            
            {/* Contenido del centro del círculo */}
            <View style={styles.circleContent}>
              <LottieView
                source={require('../../../assets/run man run!!!.json')}
                autoPlay
                loop
                style={styles.runningAnimation}
              />
              <Text style={styles.caloriesNumber}>{caloriesData.current}</Text>
            </View>
          </View>
          
          {/* Meta fuera del círculo */}
          <Text style={styles.caloriesGoal}>Meta: {caloriesData.goal} kcal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => {
        if (onChartPress) {
          onChartPress();
        } else if (onPress) {
          onPress();
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progreso</Text>
          <Text style={styles.subtitle}>Evolución y actividad</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Lado izquierdo - Gráfico */}
          <View style={styles.leftSection}>
            {/* Selector de gráfico */}
            <View style={styles.chartSelector}>
              <TouchableOpacity 
                style={[styles.selectorButton, selectedChart === 'peso' && styles.selectorButtonActive]}
                onPress={() => {
                  setSelectedChart('peso');
                  if (onChartPress) {
                    onChartPress();
                  }
                }}
              >
                <Text style={[styles.selectorText, selectedChart === 'peso' && styles.selectorTextActive]}>
                  Peso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectorButton, selectedChart === 'medidas' && styles.selectorButtonActive]}
                onPress={() => {
                  setSelectedChart('medidas');
                  if (onChartPress) {
                    onChartPress();
                  }
                }}
              >
                <Text style={[styles.selectorText, selectedChart === 'medidas' && styles.selectorTextActive]}>
                  Medidas
                </Text>
              </TouchableOpacity>
            </View>
            
            {renderChart()}
          </View>

          {/* Lado derecho - Actividad */}
          <View style={styles.rightSection}>
            {renderActivitySection()}
          </View>
        </View>
      </View>

      {/* Modal de calorías quemadas */}
      <Modal
        visible={showCaloriesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCaloriesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calorías Quemadas</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCaloriesModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.caloriesInputSection}>
              <Text style={styles.caloriesInputTitle}>
                Agregar o quitar calorías:
              </Text>
              
              <View style={styles.caloriesInputContainer}>
                <TouchableOpacity 
                  style={styles.caloriesInputButton}
                  onPress={() => handleRemoveCalories(caloriesInputValue)}
                >
                  <Text style={styles.caloriesInputButtonText}>-</Text>
                </TouchableOpacity>
                
                <TextInput
                  style={styles.caloriesInput}
                  value={caloriesInputValue.toString()}
                  onChangeText={(text) => setCaloriesInputValue(parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                
                <TouchableOpacity 
                  style={styles.caloriesInputButton}
                  onPress={() => handleAddCalories(caloriesInputValue)}
                >
                  <Text style={styles.caloriesInputButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.caloriesGoalSection}>
                <View style={styles.caloriesGoalHeader}>
                  <Text style={styles.caloriesCurrentInfo}>
                    Actual: {caloriesData.current} kcal / Meta: {caloriesData.goal} kcal
                  </Text>
                  <TouchableOpacity 
                    style={styles.editGoalButton}
                    onPress={() => setShowGoalInput(!showGoalInput)}
                  >
                    <Text style={styles.editGoalButtonText}>✏️</Text>
                  </TouchableOpacity>
                </View>
                
                {showGoalInput && (
                  <View style={styles.goalInputContainer}>
                    <Text style={styles.goalInputLabel}>Nueva meta:</Text>
                    <View style={styles.goalInputRow}>
                      <TextInput
                        style={styles.goalInput}
                        value={caloriesGoalInput.toString()}
                        onChangeText={(text) => setCaloriesGoalInput(parseInt(text) || 0)}
                        keyboardType="numeric"
                        placeholder="750"
                        placeholderTextColor={Colors.textSecondary}
                      />
                      <Text style={styles.goalInputUnit}>kcal</Text>
                    </View>
                    <View style={styles.goalInputButtons}>
                      <TouchableOpacity 
                        style={[styles.goalInputButton, styles.cancelButton]}
                        onPress={() => {
                          setShowGoalInput(false);
                          setCaloriesGoalInput(caloriesData.goal);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.goalInputButton, styles.saveButton]}
                        onPress={handleUpdateGoal}
                      >
                        <Text style={styles.saveButtonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  gradient: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
  },
  // Estilos del selector de gráfico
  chartSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 2,
    marginBottom: 6,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#000000',
  },
  selectorText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  selectorTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Estilos del gráfico
  chartContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  chartUnit: {
    fontSize: 10,
    color: '#666666',
  },
  chartArea: {
    flexDirection: 'row',
    height: 95,
    overflow: 'visible',
    marginBottom: 5,
  },
  yAxis: {
    width: 25,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  yAxisLabel: {
    fontSize: 8,
    color: '#666666',
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
    height: 2,
    position: 'absolute',
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  xAxisLabel: {
    fontSize: 7,
    color: '#666666',
    position: 'absolute',
    textAlign: 'center',
    minWidth: 30,
    maxWidth: 40,
    overflow: 'visible',
  },
  // Gráfico vacío
  emptyChart: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  // Estilos de actividad
  activitySection: {
    gap: 8,
    justifyContent: 'flex-start',
    paddingTop: 0,
    marginTop: -49,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    minHeight: 60, // Altura fija para mantener consistencia
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityCardTransparent: {
    backgroundColor: 'transparent',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingRight: 8, // Más padding para el ícono 🔗
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  activityLabelCentered: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  activityProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40, // Altura fija para alineación perfecta
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  progressGoal: {
    fontSize: 7,
    color: '#666666',
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    color: '#666666',
  },
  // Estilos de botones de calorías
  calorieButtons: {
    flexDirection: 'row',
    gap: 3,
  },
  calorieButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieButtonText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  // Estilos para input de calorías
  caloriesInputSection: {
    gap: 20,
  },
  caloriesInputTitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
  },
  caloriesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  caloriesInputButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  caloriesInputButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  caloriesInput: {
    width: 80,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  caloriesCurrentInfo: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  // Estilos para sección de meta de calorías
  caloriesGoalSection: {
    gap: 12,
  },
  caloriesGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editGoalButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  editGoalButtonText: {
    fontSize: 16,
  },
  goalInputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  goalInputLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  goalInputUnit: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  goalInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  goalInputButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#000000',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Nuevos estilos para el componente de calorías reescrito
  caloriesContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 0,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  caloriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'left',
  },
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6c757d',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 8,
  },
  plusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    top: -12,
    left: 0,
    paddingTop: -10,
  },
  runningAnimation: {
    width: 75,
    height: 75,
    marginBottom: 0,
  },
  caloriesNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: -10,
  },
  caloriesGoal: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ProgressTracking;