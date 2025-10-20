import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { ProgressEntry, WeightEntry, MeasurementEntry } from '../../types/progress';

interface ProgressHistoryProps {
  entries: ProgressEntry[];
  type: 'peso' | 'medidas';
  onEditEntry?: (entry: ProgressEntry) => void;
  onDeleteEntry?: (entry: ProgressEntry) => void;
}

const ProgressHistory: React.FC<ProgressHistoryProps> = ({
  entries,
  type,
  onEditEntry,
  onDeleteEntry
}) => {
  const { t } = useTranslation();
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar si es hoy
    if (date.toDateString() === today.toDateString()) {
      return t('daily.today');
    }

    // Verificar si es ayer
    if (date.toDateString() === yesterday.toDateString()) {
      return t('daily.yesterday');
    }

    // Formato normal
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMeasurementTypeLabel = (entry: MeasurementEntry): string => {
    const labels = {
      waist: 'Cintura',
      chest: 'Pecho',
      arm: 'Brazo',
      thigh: 'Muslo',
      hip: 'Cadera'
    };
    return labels[entry.type] || 'Medida';
  };

  const renderEntry = ({ item }: { item: ProgressEntry }) => {
    const isWeightEntry = 'type' in item === false; // WeightEntry no tiene 'type'
    const unit = isWeightEntry ? 'kg' : 'cm';
    const label = isWeightEntry 
      ? 'Peso' 
      : getMeasurementTypeLabel(item as MeasurementEntry);

    return (
      <View style={styles.entryItem}>
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryValue}>
              {item.value.toFixed(1)} {unit}
            </Text>
            <Text style={styles.entryLabel}>{label}</Text>
          </View>
          <Text style={styles.entryDate}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.entryActions}>
          {onEditEntry && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEditEntry(item)}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDeleteEntry && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDeleteEntry(item)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t('progress.noRecords')}</Text>
        <Text style={styles.emptySubtitle}>
          {type === 'peso' 
            ? t('progress.addFirstWeightToStart')
            : t('progress.addFirstMeasurementToStart')
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros</Text>
        <Text style={styles.count}>{entries.length} registros</Text>
      </View>
      
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={true}
        scrollEnabled={false}
      />
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
  count: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 10,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  entryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 40,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProgressHistory;
