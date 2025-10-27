import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { affiliateApiService } from './services/affiliateApiService';

const colors = Colors;

interface BalanceData {
  stripe: {
    available: number;
    pending: number;
    currency: string;
  } | null;
  commissions: {
    total_paid: number;
    pending: number;
    total_payments_made: number;
  };
  subscriptions: {
    total: number;
    total_revenue: number;
    apple_cut: number;
    net_revenue: number;
    premium_with_referral: number;
    premium_without_referral: number;
  };
  profit: {
    estimated: number;
    margin_percentage: string;
  };
  stripe_configured: boolean;
}

interface Transfer {
  id: string;
  amount: number;
  stripe_transfer_id: string;
  status: string;
  description: string;
  created_at: string;
  paid_at?: string;
  affiliate_name: string;
  affiliate_email: string;
  affiliate_code: string;
}

interface BalanceDashboardProps {
  onClose?: () => void;
}

export const BalanceDashboard: React.FC<BalanceDashboardProps> = ({ onClose }) => {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransfers, setShowTransfers] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await affiliateApiService.getBalance();
      setBalance(response.data);
    } catch (error) {
      console.error('Error cargando balance:', error);
      Alert.alert('Error', 'No se pudo cargar el balance');
    } finally {
      setLoading(false);
    }
  };

  const loadTransfers = async () => {
    try {
      const response = await affiliateApiService.getTransferHistory();
      setTransfers(response.data.transfers);
    } catch (error) {
      console.error('Error cargando transferencias:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de transferencias');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBalance();
    if (showTransfers) {
      await loadTransfers();
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Stripe usa centavos
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return colors.green;
      case 'pending':
        return colors.orange;
      case 'failed':
        return colors.red;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando balance...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Balance y Finanzas</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance de Stripe */}
        {balance?.stripe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏦 Balance Stripe</Text>
            <View style={styles.balanceCard}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Disponible:</Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(balance.stripe.available, balance.stripe.currency)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Pendiente:</Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(balance.stripe.pending, balance.stripe.currency)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!balance?.stripe_configured && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Stripe no está configurado. Configura las variables de entorno para ver el balance real.
            </Text>
          </View>
        )}

        {/* Estadísticas de Comisiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💸 Comisiones</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${balance?.commissions?.total_paid ? balance.commissions.total_paid.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Total Pagado</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${balance?.commissions?.pending ? balance.commissions.pending.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Pendiente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {balance?.commissions?.total_payments_made || 0}
              </Text>
              <Text style={styles.statLabel}>Pagos Realizados</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas de Suscripciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Suscripciones</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${balance?.subscriptions?.total_revenue ? balance.subscriptions.total_revenue.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Ingresos Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${balance?.subscriptions?.apple_cut ? balance.subscriptions.apple_cut.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Apple (30%)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${balance?.subscriptions?.net_revenue ? balance.subscriptions.net_revenue.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Neto (70%)</Text>
            </View>
          </View>
          
          {/* Desglose de Usuarios Premium */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Desglose de Usuarios Premium</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔄 Con Referral (Generan comisiones):</Text>
              <Text style={styles.infoValue}>
                {balance?.subscriptions?.premium_with_referral || 0} usuarios
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Sin Referral (100% de la app):</Text>
              <Text style={styles.infoValue}>
                {balance?.subscriptions?.premium_without_referral || 0} usuarios
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontWeight: 'bold' }]}>Total Premium:</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>
                {balance?.subscriptions?.total || 0} usuarios
              </Text>
            </View>
          </View>
        </View>

        {/* Ganancia Estimada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Ganancia Estimada</Text>
          <View style={styles.profitCard}>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Ganancia:</Text>
              <Text style={[styles.profitAmount, { color: colors.green }]}>
                ${balance?.profit?.estimated ? balance.profit.estimated.toFixed(2) : '0.00'}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Margen:</Text>
              <Text style={styles.profitAmount}>
                {balance?.profit?.margin_percentage || '0.00'}%
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Historial */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              setShowTransfers(!showTransfers);
              if (!showTransfers) {
                loadTransfers();
              }
            }}
          >
            <Text style={styles.historyButtonText}>
              {showTransfers ? 'Ocultar' : 'Ver'} Historial de Transferencias
            </Text>
          </TouchableOpacity>
        </View>

        {/* Historial de Transferencias */}
        {showTransfers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Transferencias Recientes</Text>
            {transfers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay transferencias aún</Text>
              </View>
            ) : (
              transfers.map((transfer) => (
                <View key={transfer.id} style={styles.transferItem}>
                  <View style={styles.transferHeader}>
                    <Text style={styles.transferAmount}>
                      ${transfer.amount ? parseFloat(transfer.amount).toFixed(2) : '0.00'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transfer.status) }]}>
                      <Text style={styles.statusText}>{transfer.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.transferDescription}>{transfer.description}</Text>
                  <Text style={styles.transferAffiliate}>
                    {transfer.affiliate_name} ({transfer.affiliate_code})
                  </Text>
                  <Text style={styles.transferDate}>
                    {formatDate(transfer.created_at)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
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
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  warningCard: {
    backgroundColor: colors.orange + '20',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
  },
  warningText: {
    fontSize: 14,
    color: colors.orange,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  profitCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profitLabel: {
    fontSize: 16,
    color: colors.text,
  },
  profitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  transferItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  transferDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  transferAffiliate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  transferDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

