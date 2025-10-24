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
import { affiliateApiServiceReal } from '../../services/affiliateApiServiceReal';

const colors = Colors;

interface AffiliateCode {
  id: string;
  code: string;
  affiliate_name: string;
  email?: string;
  commission_percentage: number;
  is_active: boolean;
  total_referrals: number;
  premium_referrals: number;
  total_commissions: number;
  created_at: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [affiliates, setAffiliates] = useState<AffiliateCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
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
      // Aquí harías la llamada real a la API
      // const response = await apiService.getAllAffiliateCodes();
      
      // Simulamos datos de ejemplo
      setTimeout(() => {
        setAffiliates([
          {
            id: '1',
            code: 'FITNESS_GURU',
            affiliate_name: 'Fitness Guru',
            email: 'guru@example.com',
            commission_percentage: 30,
            is_active: true,
            total_referrals: 45,
            premium_referrals: 12,
            total_commissions: 1250.50,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            code: 'NUTRICIONISTA_PRO',
            affiliate_name: 'Nutricionista Pro',
            email: 'nutri@example.com',
            commission_percentage: 25,
            is_active: true,
            total_referrals: 32,
            premium_referrals: 8,
            total_commissions: 890.25,
            created_at: '2024-01-20T14:15:00Z'
          },
          {
            id: '3',
            code: 'TRAINER_ELITE',
            affiliate_name: 'Trainer Elite',
            email: 'trainer@example.com',
            commission_percentage: 35,
            is_active: false,
            total_referrals: 28,
            premium_referrals: 6,
            total_commissions: 650.75,
            created_at: '2024-01-25T09:45:00Z'
          }
        ]);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
      
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'No se pudieron cargar los afiliados');
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
      setShowCreateModal(false);
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
      const response = await affiliateApiServiceReal.createAffiliateAccount(accountData);
      
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

  const toggleAffiliateStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Aquí harías la llamada real a la API
      // const response = await apiService.toggleAffiliateStatus(id, !currentStatus);
      
      Alert.alert('Éxito', `Afiliado ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      fetchAffiliates();
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del afiliado');
    }
  };

  const AffiliateCard: React.FC<{ affiliate: AffiliateCode }> = ({ affiliate }) => (
    <View style={styles.affiliateCard}>
      <View style={styles.affiliateHeader}>
        <View style={styles.affiliateInfo}>
          <Text style={styles.affiliateName}>{affiliate.affiliate_name}</Text>
          <Text style={styles.affiliateCode}>Código: {affiliate.code}</Text>
          {affiliate.email && (
            <Text style={styles.affiliateEmail}>{affiliate.email}</Text>
          )}
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
          <Text style={styles.statValue}>{affiliate.total_referrals}</Text>
          <Text style={styles.statLabel}>Referidos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{affiliate.premium_referrals}</Text>
          <Text style={styles.statLabel}>Premium</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${affiliate.total_commissions}</Text>
          <Text style={styles.statLabel}>Comisiones</Text>
        </View>
      </View>

      <View style={styles.affiliateActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: affiliate.is_active ? colors.red : colors.green }
          ]}
          onPress={() => toggleAffiliateStatus(affiliate.id, affiliate.is_active)}
        >
          <Text style={styles.actionButtonText}>
            {affiliate.is_active ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.blue }]}>
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
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
              <Text style={styles.summaryValue}>{affiliates.length}</Text>
              <Text style={styles.summaryLabel}>Total Afiliados</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {affiliates.filter(a => a.is_active).length}
              </Text>
              <Text style={styles.summaryLabel}>Activos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                ${affiliates.reduce((sum, a) => sum + a.total_commissions, 0).toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Total Comisiones</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Crear Nuevo Afiliado</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.createButton, styles.createAccountButton]}
            onPress={() => setShowCreateAccountModal(true)}
          >
            <Text style={styles.createButtonText}>+ Crear Cuenta Completa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.affiliatesSection}>
          <Text style={styles.sectionTitle}>👥 Lista de Afiliados</Text>
          {affiliates.map((affiliate) => (
            <AffiliateCard key={affiliate.id} affiliate={affiliate} />
          ))}
        </View>
      </ScrollView>

      {/* Modal para crear nuevo afiliado */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Nuevo Afiliado</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Afiliado *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fitness Influencer"
                value={newAffiliate.affiliate_name}
                onChangeText={(text) => setNewAffiliate({ ...newAffiliate, affiliate_name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="influencer@example.com"
                value={newAffiliate.email}
                onChangeText={(text) => setNewAffiliate({ ...newAffiliate, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Porcentaje de Comisión (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                value={newAffiliate.commission_percentage}
                onChangeText={(text) => setNewAffiliate({ ...newAffiliate, commission_percentage: text })}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={createAffiliate}>
              <Text style={styles.saveButtonText}>Crear Afiliado</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

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
});
