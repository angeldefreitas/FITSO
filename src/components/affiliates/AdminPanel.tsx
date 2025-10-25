import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Colors } from '../../constants/colors';
import { affiliateApiService } from './services/affiliateApiService';
import { BalanceDashboard } from './BalanceDashboard';

const colors = Colors;

interface AffiliateData {
  user_id: string;
  name: string;
  email: string;
  member_since: string;
  affiliate_code: string;
  commission_percentage: number;
  is_active: boolean;
  code_created_at: string;
  stats: {
    total_referrals: number;
    premium_referrals: number;
    total_commissions: number;
    pending_commissions: number;
    paid_commissions: number;
    conversion_rate: number;
  };
}

interface AdminDashboardData {
  summary: {
    total_affiliates: number;
    total_referrals: number;
    total_premium_referrals: number;
    total_commissions: number;
    pending_commissions: number;
    paid_commissions: number;
    overall_conversion_rate: number;
  };
  affiliates: AffiliateData[];
}

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showCommissionsModal, setShowCommissionsModal] = useState(false);
  const [showReferralsModal, setShowReferralsModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [newAffiliate, setNewAffiliate] = useState({
    affiliate_name: '',
    email: '',
    commission_percentage: '30'
  });
  const [newAffiliateAccount, setNewAffiliateAccount] = useState({
    email: '',
    name: '',
    password: '',
    referralCode: '',
    commissionPercentage: '30'
  });

  const fetchAffiliates = async () => {
    try {
      console.log('🔍 [ADMIN] Cargando datos de afiliados...');
      const response = await affiliateApiService.getAdminDashboard();
      console.log('✅ [ADMIN] Datos recibidos:', response);
      
      setDashboardData(response);
      setLoading(false);
      setRefreshing(false);
      
    } catch (error) {
      console.error('❌ [ADMIN] Error cargando afiliados:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'No se pudieron cargar los afiliados');
    }
  };

  const fetchCommissions = async () => {
    try {
      console.log('🔍 [ADMIN] Cargando comisiones...');
      
      // Obtener comisiones pendientes de todos los afiliados
      const response = await affiliateApiService.getPendingPayments();
      console.log('✅ [ADMIN] Comisiones obtenidas:', response);
      
      setCommissions(response || []);
    } catch (error) {
      console.error('❌ [ADMIN] Error cargando comisiones:', error);
      Alert.alert('Error', 'No se pudieron cargar las comisiones');
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAffiliates();
  };

  const createAffiliate = async () => {
    if (!newAffiliate.affiliate_name.trim()) {
      Alert.alert('Error', 'El nombre del afiliado es requerido');
      return;
    }

    try {
      // Aquí harías la llamada real a la API
      // const response = await apiService.createAffiliateCode(newAffiliate);
      
      Alert.alert('Éxito', 'Código de afiliado creado exitosamente');
      setShowCreateAccountModal(false);
      setNewAffiliate({ affiliate_name: '', email: '', commission_percentage: '30' });
      fetchAffiliates();
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el código de afiliado');
    }
  };

  const handleCreateAccount = async () => {
    try {
      // Validar campos requeridos
      if (!newAffiliateAccount.email || !newAffiliateAccount.name || !newAffiliateAccount.password || !newAffiliateAccount.referralCode) {
        Alert.alert('Error', 'Todos los campos son requeridos');
        return;
      }

      // Llamada real a la API
      const accountData = {
        ...newAffiliateAccount,
        commissionPercentage: parseFloat(newAffiliateAccount.commissionPercentage)
      };
      const response = await affiliateApiService.createAffiliateAccount(accountData);
      
      // Simular éxito
      Alert.alert('Éxito', 'Cuenta de afiliado creada correctamente');
      setShowCreateAccountModal(false);
      setNewAffiliateAccount({
        email: '',
        name: '',
        password: '',
        referralCode: '',
        commissionPercentage: '30'
      });
      fetchAffiliates();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cuenta de afiliado');
    }
  };

  const handleViewReferrals = async (affiliate: AffiliateData) => {
    try {
      console.log('🔍 [ADMIN] Cargando referidos para:', affiliate.name);
      setSelectedAffiliate(affiliate);
      
      // Llamada real a la API para obtener referidos
      const response = await affiliateApiService.getAffiliateReferrals(affiliate.affiliate_code, {
        limit: 100, // Obtener hasta 100 referidos
        offset: 0
      });
      
      console.log('✅ [ADMIN] Referidos obtenidos:', response);
      setReferrals(response || []);
      setShowReferralsModal(true);
    } catch (error) {
      console.error('❌ [ADMIN] Error cargando referidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los referidos');
    }
  };

  const handleManageAffiliate = (affiliate: AffiliateData) => {
    setSelectedAffiliate(affiliate);
    setShowManageModal(true);
  };

  const toggleAffiliateStatus = async (affiliateCode: string, isActive: boolean) => {
    try {
      console.log('🔄 [ADMIN] Cambiando estado del código:', affiliateCode, 'a:', !isActive);
      
      // Llamada real a la API
      const response = await affiliateApiService.toggleAffiliateCode(affiliateCode, !isActive);
      
      Alert.alert(
        'Éxito', 
        `Código ${!isActive ? 'activado' : 'desactivado'} exitosamente. ${!isActive ? 'El afiliado volverá a ganar comisiones.' : 'La app ahora gana el 100% de las comisiones de este afiliado.'}`
      );
      
      setShowManageModal(false);
      fetchAffiliates();
      
    } catch (error) {
      console.error('❌ [ADMIN] Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del código');
    }
  };

  const updateCommissionPercentage = async (affiliateCode: string, newPercentage: number) => {
    try {
      console.log('💰 [ADMIN] Actualizando comisión para:', affiliateCode, 'a:', newPercentage + '%');
      
      // Llamada real a la API
      const response = await affiliateApiService.updateCommissionPercentage(affiliateCode, newPercentage);
      
      Alert.alert('Éxito', `Porcentaje de comisión actualizado a ${newPercentage}%`);
      setShowManageModal(false);
      fetchAffiliates();
      
    } catch (error) {
      console.error('❌ [ADMIN] Error actualizando comisión:', error);
      Alert.alert('Error', 'No se pudo actualizar el porcentaje de comisión');
    }
  };

  const processPayout = async (affiliateCode: string, affiliateName: string) => {
    try {
      // Obtener comisiones pendientes del afiliado
      const commissions = await affiliateApiService.getAffiliateCommissions(affiliateCode);
      const pendingCommissions = commissions.filter((c: any) => !c.is_paid);
      
      if (pendingCommissions.length === 0) {
        Alert.alert('Sin comisiones', 'Este afiliado no tiene comisiones pendientes de pago');
        return;
      }

      const totalAmount = pendingCommissions.reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount), 0);
      
      Alert.alert(
        'Procesar Pago',
        `¿Procesar pago de $${totalAmount.toFixed(2)} a ${affiliateName}?\n\nComisiones pendientes: ${pendingCommissions.length}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Procesar', 
            onPress: async () => {
              try {
                const response = await affiliateApiService.processPayout(
                  affiliateCode, 
                  totalAmount, 
                  `Pago de comisiones - ${affiliateName}`
                );
                
                Alert.alert('Éxito', 'Pago procesado exitosamente');
                fetchAffiliates();
              } catch (error) {
                console.error('❌ [ADMIN] Error procesando pago:', error);
                Alert.alert('Error', 'No se pudo procesar el pago');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ [ADMIN] Error obteniendo comisiones:', error);
      Alert.alert('Error', 'No se pudieron obtener las comisiones del afiliado');
    }
  };

  const handleChangeCommission = (affiliateCode: string, currentPercentage: number) => {
    Alert.prompt(
      'Cambiar Comisión',
      `Porcentaje actual: ${currentPercentage}%\n\nIngresa el nuevo porcentaje (0-100):`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Actualizar',
          onPress: (text) => {
            const newPercentage = parseFloat(text);
            if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
              Alert.alert('Error', 'Por favor ingresa un porcentaje válido entre 0 y 100');
              return;
            }
            updateCommissionPercentage(affiliateCode, newPercentage);
          }
        }
      ],
      'plain-text',
      currentPercentage.toString()
    );
  };

  const AffiliateCard: React.FC<{ affiliate: AffiliateData }> = ({ affiliate }) => (
    <View style={styles.affiliateCard}>
      <View style={styles.affiliateHeader}>
        <View style={styles.affiliateInfo}>
          <Text style={styles.affiliateName}>{affiliate.name}</Text>
          <Text style={styles.affiliateCode}>Código: {affiliate.affiliate_code}</Text>
          <Text style={styles.affiliateEmail}>{affiliate.email}</Text>
          <Text style={styles.memberSince}>
            Miembro desde: {new Date(affiliate.member_since).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.affiliateStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: affiliate.is_active ? colors.green : colors.red }
          ]}>
            <Text style={styles.statusText}>
              {affiliate.is_active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          <Text style={styles.commissionText}>
            {affiliate.commission_percentage}% comisión
          </Text>
        </View>
      </View>

      <View style={styles.affiliateStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{affiliate.stats.total_referrals}</Text>
          <Text style={styles.statLabel}>Referidos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{affiliate.stats.premium_referrals}</Text>
          <Text style={styles.statLabel}>Premium</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${affiliate.stats.total_commissions.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Comisiones</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{affiliate.stats.conversion_rate}%</Text>
          <Text style={styles.statLabel}>Conversión</Text>
        </View>
      </View>

            <View style={styles.affiliateActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.blue }]}
                onPress={() => handleViewReferrals(affiliate)}
              >
                <Text style={styles.actionButtonText}>Ver Referidos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.green }]}
                onPress={() => processPayout(affiliate.affiliate_code, affiliate.name)}
              >
                <Text style={styles.actionButtonText}>💰 Pagar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.orange }]}
                onPress={() => handleManageAffiliate(affiliate)}
              >
                <Text style={styles.actionButtonText}>Gestionar</Text>
              </TouchableOpacity>
            </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando afiliados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
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
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Resumen General</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dashboardData?.summary.total_affiliates || 0}</Text>
              <Text style={styles.summaryLabel}>Total Afiliados</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dashboardData?.summary.total_referrals || 0}
              </Text>
              <Text style={styles.summaryLabel}>Total Referidos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                ${dashboardData?.summary.total_commissions.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.summaryLabel}>Total Comisiones</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dashboardData?.summary.overall_conversion_rate.toFixed(1) || '0.0'}%
              </Text>
              <Text style={styles.summaryLabel}>Conversión</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.createButton, styles.createAccountButton]}
            onPress={() => setShowCreateAccountModal(true)}
          >
            <Text style={styles.createButtonText}>+ Crear Cuenta de Afiliado</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.createButton, styles.commissionsButton]}
            onPress={() => {
              setShowCommissionsModal(true);
              fetchCommissions();
            }}
          >
            <Text style={styles.createButtonText}>💰 Gestionar Comisiones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.green }]}
            onPress={() => setShowBalanceModal(true)}
          >
            <Text style={styles.createButtonText}>📊 Ver Balance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.affiliatesSection}>
          <Text style={styles.sectionTitle}>👥 Lista de Afiliados</Text>
          {dashboardData?.affiliates.map((affiliate) => (
            <AffiliateCard key={affiliate.user_id} affiliate={affiliate} />
          )) || []}
        </View>
      </ScrollView>


      {/* Modal para Crear Cuenta de Afiliado */}
      <Modal
        visible={showCreateAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Cuenta de Afiliado</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateAccountModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Email del Afiliado</Text>
              <TextInput
                style={styles.input}
                value={newAffiliateAccount.email}
                onChangeText={(text) => setNewAffiliateAccount({...newAffiliateAccount, email: text})}
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Nombre del Afiliado</Text>
              <TextInput
                style={styles.input}
                value={newAffiliateAccount.name}
                onChangeText={(text) => setNewAffiliateAccount({...newAffiliateAccount, name: text})}
                placeholder="Nombre completo"
              />

              <Text style={styles.inputLabel}>Contraseña Inicial</Text>
              <TextInput
                style={styles.input}
                value={newAffiliateAccount.password}
                onChangeText={(text) => setNewAffiliateAccount({...newAffiliateAccount, password: text})}
                placeholder="Contraseña temporal"
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Código de Referido</Text>
              <TextInput
                style={styles.input}
                value={newAffiliateAccount.referralCode}
                onChangeText={(text) => setNewAffiliateAccount({...newAffiliateAccount, referralCode: text})}
                placeholder="Código único"
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>Comisión (%)</Text>
              <TextInput
                style={styles.input}
                value={newAffiliateAccount.commissionPercentage}
                onChangeText={(text) => setNewAffiliateAccount({...newAffiliateAccount, commissionPercentage: text})}
                placeholder="30"
                keyboardType="numeric"
              />

              <Text style={styles.infoText}>
                ℹ️ El afiliado podrá cambiar su contraseña después del primer login.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateAccountModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateAccount}
              >
                <Text style={styles.saveButtonText}>Crear Cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Gestión de Comisiones */}
      <Modal
        visible={showCommissionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommissionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gestión de Comisiones</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCommissionsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commissionsList}>
              {commissions.map((commission) => (
                <View key={commission.id} style={styles.commissionCard}>
                  <View style={styles.commissionHeader}>
                    <Text style={styles.commissionCode}>{commission.affiliate_code}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: commission.is_paid ? colors.green : colors.orange }
                    ]}>
                      <Text style={styles.statusText}>
                        {commission.is_paid ? 'Pagada' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commissionAmount}>
                    ${commission.commission_amount.toFixed(2)}
                  </Text>
                  <Text style={styles.commissionDetails}>
                    Suscripción: ${commission.subscription_amount.toFixed(2)}
                  </Text>
                  {commission.is_paid && commission.paid_date && (
                    <Text style={styles.paidDate}>
                      Pagada: {new Date(commission.paid_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Referidos */}
      <Modal
        visible={showReferralsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReferralsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Referidos de {selectedAffiliate?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReferralsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.referralsList}>
              {referrals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No hay referidos para este afiliado</Text>
                </View>
              ) : (
                referrals.map((referral) => (
                  <View key={referral.id} style={styles.referralCard}>
                    <View style={styles.referralHeader}>
                      <Text style={styles.referralName}>{referral.user_name || 'Usuario'}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: referral.is_premium ? colors.green : colors.orange }
                      ]}>
                        <Text style={styles.statusText}>
                          {referral.is_premium ? 'Premium' : 'Gratuito'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.referralEmail}>{referral.user_email || 'Sin email'}</Text>
                    <Text style={styles.referralDate}>
                      Registrado: {new Date(referral.referral_date).toLocaleDateString()}
                    </Text>
                    {referral.is_premium && referral.premium_conversion_date && (
                      <Text style={styles.conversionDate}>
                        Convertido: {new Date(referral.premium_conversion_date).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Gestión de Afiliado */}
      <Modal
        visible={showManageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Gestionar {selectedAffiliate?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowManageModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.affiliateInfoCard}>
                <Text style={styles.infoLabel}>Código:</Text>
                <Text style={styles.infoValue}>{selectedAffiliate?.affiliate_code}</Text>
                
                <Text style={styles.infoLabel}>Estado:</Text>
                <Text style={[styles.infoValue, { 
                  color: selectedAffiliate?.is_active ? colors.green : colors.red,
                  fontWeight: '600'
                }]}>
                  {selectedAffiliate?.is_active ? 'Activo' : 'Inactivo'}
                </Text>
                
                <Text style={styles.infoLabel}>Comisión actual:</Text>
                <Text style={styles.infoValue}>{selectedAffiliate?.commission_percentage}%</Text>
                
                <Text style={styles.infoLabel}>Referidos totales:</Text>
                <Text style={styles.infoValue}>{selectedAffiliate?.stats.total_referrals}</Text>
                
                <Text style={styles.infoLabel}>Referidos premium:</Text>
                <Text style={styles.infoValue}>{selectedAffiliate?.stats.premium_referrals}</Text>
              </View>

              <View style={styles.managementActions}>
                <TouchableOpacity
                  style={[styles.managementButton, { backgroundColor: colors.blue }]}
                  onPress={() => handleChangeCommission(selectedAffiliate?.affiliate_code || '', selectedAffiliate?.commission_percentage || 0)}
                >
                  <Text style={styles.managementButtonText}>Cambiar Comisión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.managementButton, { 
                    backgroundColor: selectedAffiliate?.is_active ? colors.red : colors.green 
                  }]}
                  onPress={() => {
                    const action = selectedAffiliate?.is_active ? 'Desactivar' : 'Activar';
                    const message = selectedAffiliate?.is_active 
                      ? '¿Estás seguro? La app ganará el 100% de las comisiones de este afiliado.'
                      : '¿Estás seguro? El afiliado volverá a ganar comisiones.';
                    
                    Alert.alert(
                      `${action} Código`,
                      message,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                          text: action, 
                          style: selectedAffiliate?.is_active ? 'destructive' : 'default',
                          onPress: () => toggleAffiliateStatus(
                            selectedAffiliate?.affiliate_code || '', 
                            selectedAffiliate?.is_active || false
                          )
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.managementButtonText}>
                    {selectedAffiliate?.is_active ? 'Desactivar Código' : 'Activar Código'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Balance */}
      <Modal
        visible={showBalanceModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowBalanceModal(false)}
      >
        <BalanceDashboard onClose={() => setShowBalanceModal(false)} />
      </Modal>
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
    fontSize: 24,
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
  summarySection: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionsSection: {
    margin: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    backgroundColor: colors.green,
  },
  commissionsButton: {
    backgroundColor: colors.orange,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  affiliatesSection: {
    margin: 16,
  },
  affiliateCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  affiliateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  affiliateInfo: {
    flex: 1,
  },
  affiliateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  affiliateCode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  affiliateEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  affiliateStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  commissionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  affiliateStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: colors.grayLight,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  affiliateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  commissionsList: {
    maxHeight: 400,
  },
  commissionCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commissionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  commissionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  commissionDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  paidDate: {
    fontSize: 12,
    color: colors.green,
    fontStyle: 'italic',
  },
  referralsList: {
    maxHeight: 400,
  },
  referralCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  referralEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  conversionDate: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
  },
  affiliateInfoCard: {
    backgroundColor: colors.grayLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  managementActions: {
    gap: 12,
  },
  managementButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  managementButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
