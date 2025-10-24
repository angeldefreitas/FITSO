import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface AffiliateStats {
  total_referrals: number;
  premium_referrals: number;
  total_commissions: number;
  paid_commissions: number;
  pending_commissions: number;
}

interface ConversionStats {
  total_referrals: number;
  premium_conversions: number;
  conversion_rate: number;
  avg_days_to_conversion: number;
}

interface AffiliateDashboardProps {
  affiliateCode: string;
  onRefresh?: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({
  affiliateCode,
  onRefresh
}) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Aquí harías la llamada real a la API
      // const response = await apiService.getAffiliateStats(affiliateCode);
      
      // Simulamos datos de ejemplo
      setTimeout(() => {
        setStats({
          total_referrals: 45,
          premium_referrals: 12,
          total_commissions: 1250.50,
          paid_commissions: 850.25,
          pending_commissions: 400.25
        });
        
        setConversionStats({
          total_referrals: 45,
          premium_conversions: 12,
          conversion_rate: 26.67,
          avg_days_to_conversion: 7.5
        });
        
        setLoading(false);
        setRefreshing(false);
      }, 1000);
      
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [affiliateCode]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
    onRefresh?.();
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, subtitle, color = colors.primary }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard de Afiliado</Text>
        <Text style={styles.headerSubtitle}>Código: {affiliateCode}</Text>
      </View>

      {/* Estadísticas Generales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Referidos"
            value={stats?.total_referrals || 0}
            subtitle="usuarios registrados"
            color={colors.blue}
          />
          <StatCard
            title="Conversiones Premium"
            value={stats?.premium_referrals || 0}
            subtitle="usuarios premium"
            color={colors.green}
          />
          <StatCard
            title="Tasa de Conversión"
            value={`${conversionStats?.conversion_rate || 0}%`}
            subtitle="conversión promedio"
            color={colors.orange}
          />
          <StatCard
            title="Días Promedio"
            value={`${conversionStats?.avg_days_to_conversion || 0} días`}
            subtitle="hasta conversión"
            color={colors.purple}
          />
        </View>
      </View>

      {/* Comisiones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Comisiones</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Ganado"
            value={`$${stats?.total_commissions || 0}`}
            subtitle="comisiones totales"
            color={colors.green}
          />
          <StatCard
            title="Pagado"
            value={`$${stats?.paid_commissions || 0}`}
            subtitle="ya recibido"
            color={colors.blue}
          />
          <StatCard
            title="Pendiente"
            value={`$${stats?.pending_commissions || 0}`}
            subtitle="por recibir"
            color={colors.orange}
          />
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ver Referidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ver Comisiones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Compartir Código</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Información del Código */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Información del Código</Text>
        <View style={styles.codeInfo}>
          <View style={styles.codeInfoRow}>
            <Text style={styles.codeInfoLabel}>Tu código:</Text>
            <Text style={styles.codeInfoValue}>{affiliateCode}</Text>
          </View>
          <View style={styles.codeInfoRow}>
            <Text style={styles.codeInfoLabel}>Link de referencia:</Text>
            <Text style={styles.codeInfoValue}>fitso.app/referral/{affiliateCode}</Text>
          </View>
        </View>
      </View>

      {/* Consejos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Consejos para Mejorar</Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipText}>• Comparte tu código en redes sociales</Text>
          <Text style={styles.tipText}>• Crea contenido sobre fitness y nutrición</Text>
          <Text style={styles.tipText}>• Ayuda a tus seguidores con consejos personalizados</Text>
          <Text style={styles.tipText}>• Muestra resultados reales de usar Fitso</Text>
        </View>
      </View>
    </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.grayLight,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  codeInfo: {
    backgroundColor: colors.grayLight,
    padding: 16,
    borderRadius: 8,
  },
  codeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  codeInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipsContainer: {
    backgroundColor: colors.blueLight,
    padding: 16,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.blue,
    marginBottom: 8,
    lineHeight: 20,
  },
});
