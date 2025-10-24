import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Colors } from '../../constants/colors';
import { affiliateApiService } from './services/affiliateApiService';

const colors = Colors;

interface AffiliateStats {
  total_referrals: number;
  premium_referrals: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  conversion_rate: number;
  affiliate_code: string;
}

interface AffiliateDashboardProps {
  onClose: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      console.log('🔄 [DASHBOARD] Obteniendo estadísticas...');
      const response = await affiliateApiService.getAffiliateDashboard();
      console.log('✅ [DASHBOARD] Respuesta recibida:', response);
      setStats(response);
    } catch (error) {
      console.error('❌ [DASHBOARD] Error obteniendo estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color?: string }> = ({ 
    title, 
    value, 
    subtitle, 
    color = colors.primary 
  }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    console.log('❌ [DASHBOARD] Stats es null, mostrando error');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar las estadísticas</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('✅ [DASHBOARD] Renderizando con stats:', stats);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Dashboard de Afiliado</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Código de afiliado */}
        <View style={styles.codeSection}>
          <Text style={styles.sectionTitle}>Mi Código de Referencia</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{stats.affiliate_code}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => {
                // Aquí implementarías la funcionalidad de copiar
                Alert.alert('Copiado', 'Código copiado al portapapeles');
              }}
            >
              <Text style={styles.copyButtonText}>Copiar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHelpText}>
            Comparte este código con tus seguidores para ganar comisiones
          </Text>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Referidos"
              value={stats.total_referrals}
              subtitle="Personas que usaron tu código"
            />
            <StatCard
              title="Conversiones Premium"
              value={stats.premium_referrals}
              subtitle="Referidos que se suscribieron"
              color={colors.green}
            />
            <StatCard
              title="Tasa de Conversión"
              value={`${stats.conversion_rate}%`}
              subtitle="% de referidos que se suscribieron"
              color={colors.blue}
            />
          </View>
        </View>

        {/* Comisiones */}
        <View style={styles.commissionsSection}>
          <Text style={styles.sectionTitle}>Comisiones</Text>
          <View style={styles.commissionsGrid}>
            <StatCard
              title="Total Generadas"
              value={`$${stats.total_commissions.toFixed(2)}`}
              subtitle="Comisiones totales ganadas"
              color={colors.green}
            />
            <StatCard
              title="Pendientes"
              value={`$${stats.pending_commissions.toFixed(2)}`}
              subtitle="Comisiones por pagar"
              color={colors.orange}
            />
            <StatCard
              title="Pagadas"
              value={`$${stats.paid_commissions.toFixed(2)}`}
              subtitle="Comisiones ya pagadas"
              color={colors.blue}
            />
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Comparte tu código con tus seguidores</Text>
            <Text style={styles.infoItem}>• Cuando se registren con tu código, quedan vinculados a ti</Text>
            <Text style={styles.infoItem}>• Si se suscriben a premium, ganas una comisión</Text>
            <Text style={styles.infoItem}>• Las comisiones se pagan mensualmente</Text>
            <Text style={styles.infoItem}>• Puedes ganar comisiones recurrentes por renovaciones</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ver Referidos Detallados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Historial de Comisiones
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  codeSection: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  codeHelpText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsSection: {
    margin: 16,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  commissionsSection: {
    margin: 16,
    marginTop: 0,
  },
  commissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoSection: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsSection: {
    margin: 16,
    marginTop: 0,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
});