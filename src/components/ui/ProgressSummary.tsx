import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { ProgressSummary as ProgressSummaryType } from '../../types/progress';

interface ProgressSummaryProps {
  summary: ProgressSummaryType;
  type: 'peso' | 'medidas';
  timeFilter: string;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  summary,
  type,
  timeFilter
}) => {
  const { t } = useTranslation();
  const unit = type === 'peso' ? 'kg' : 'cm';
  const changeIcon = summary.isIncrease ? '↗️' : '↘️';
  const changeColor = summary.isIncrease ? '#FF6B6B' : '#4ECDC4';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('progress.progressSummary')}</Text>
        <Text style={styles.timeFilter}>{timeFilter}</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Peso/Medida Inicial */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {type === 'peso' ? t('progress.initialWeight') : t('progress.initialMeasurement')}
          </Text>
          <Text style={styles.metricValue}>
            {summary.initialValue.toFixed(1)} {unit}
          </Text>
          {type === 'peso' && (
            <Text style={styles.metricSubtext}>{t('progress.fromProfile')}</Text>
          )}
        </View>

        {/* Peso/Medida Actual */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>{t('progress.current')}</Text>
          <Text style={styles.metricValue}>
            {summary.currentValue.toFixed(1)} {unit}
          </Text>
        </View>

        {/* Cambio */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>{t('progress.change')}</Text>
          <View style={styles.changeContainer}>
            <Text style={styles.changeIcon}>{changeIcon}</Text>
            <Text style={[styles.changeValue, { color: changeColor }]}>
              {summary.change.toFixed(1)} {unit}
            </Text>
            <Text style={[styles.changePercentage, { color: changeColor }]}>
              ({summary.isIncrease ? '+' : '-'}{summary.changePercentage.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Mensaje motivacional */}
      {summary.change > 0 && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {summary.isIncrease 
              ? `¡Has ganado ${summary.change.toFixed(1)} ${unit}! 💪`
              : `¡Has perdido ${summary.change.toFixed(1)} ${unit}! 🎉`
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  timeFilter: {
    fontSize: 14,
    color: Colors.protein,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  metricSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  changeContainer: {
    alignItems: 'center',
  },
  changeIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changePercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProgressSummary;
