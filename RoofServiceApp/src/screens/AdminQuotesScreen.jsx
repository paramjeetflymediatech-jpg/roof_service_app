import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS } from '../utils/constants';
import { useAuth } from '../../App';
const AdminQuotesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { quote } = route?.params || {};
  const { user } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState(quote || null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);


 console.log(user,'user');
  /* ---------------- Load Employees ---------------- */

  const loadEmployees = async () => {
     
    try {
      const response = await api.getUsers('employee');
      console.log('Employees API response:', response.data);

      const rawEmployees =
        response.data?.items ||
        response.data?.data ||
        response.data?.users ||
        (Array.isArray(response.data) ? response.data : []);

      const normalizedEmployees = rawEmployees.map(emp => ({
        id: emp.id || emp._id || emp.user_id,
        name: emp.name || emp.full_name || 'Unknown',
        specialty: emp.specialty || emp.role || 'General',
        available: emp.available ?? true,
      }));

      setEmployees(normalizedEmployees);
    } catch (error) {
      console.log('Load employees error:', error);
      Alert.alert('Error', 'Failed to load employees');
    }
  };

  /* ---------------- Helpers ---------------- */

  const normalizeStatus = status => status?.toLowerCase();

  /* ---------------- Quote Actions ---------------- */

  const handleApprove = async () => {
    try {
      await api.updateLead(selectedQuote.id, {
        status: LEAD_STATUS.APPROVED,
      });

      Alert.alert('Success', 'Quote approved. Assign an employee.');
      setSelectedQuote({
        ...selectedQuote,
        status: LEAD_STATUS.APPROVED,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to approve quote');
    }
  };

  const handleReject = () => {
    Alert.alert('Reject Quote', 'Are you sure you want to reject this quote?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.updateLead(selectedQuote.id, {
              status: LEAD_STATUS.REJECTED,
            });
            Alert.alert('Success', 'Quote rejected');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to reject quote');
          }
        },
      },
    ]);
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    setLoading(true);
    try {
      await api.assignLead(selectedQuote.id, {
        employeeId: selectedEmployee.id,
        status: LEAD_STATUS.ASSIGNED,
        adminid: user.id,
      });

      Alert.alert('Success', `${selectedEmployee.name} assigned successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Guards ---------------- */

  if (!selectedQuote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quote selected</Text>
      </View>
    );
  }

  const status = normalizeStatus(selectedQuote.status);

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <View style={styles.quoteDetails}>
        <Text style={styles.title}>{selectedQuote.service}</Text>
        <Text style={styles.subtitle}>{selectedQuote.address}</Text>

        <DetailRow label="Client" value={selectedQuote.clientName} />
        <DetailRow label="Phone" value={selectedQuote.phone} />
        <DetailRow label="Email" value={selectedQuote.email || 'N/A'} />
        <DetailRow label="Date" value={selectedQuote.date} />
        <DetailRow label="Status" value={selectedQuote.status} />

        {status === 'approved' && (
          <>
            <Text style={styles.sectionHeader}>Select Employee</Text>

            <FlatList
              data={employees}
              keyExtractor={(item, index) => String(item.id ?? index)}
              contentContainerStyle={styles.employeeList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.employeeCard,
                    !item.available && styles.employeeCardUnavailable,
                    selectedEmployee?.id === item.id &&
                      styles.employeeCardSelected,
                  ]}
                  disabled={!item.available}
                  onPress={() => setSelectedEmployee(item)}
                >
                  <View>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.employeeSpecialty}>
                      {item.specialty}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.available
                          ? COLORS.success
                          : COLORS.textLight,
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.available ? 'Available' : 'Busy'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {status === 'pending' && (
          <>
            <Button
              title="Approve Quote"
              variant="success"
              onPress={handleApprove}
            />
            <Button
              title="Reject Quote"
              variant="danger"
              onPress={handleReject}
            />
          </>
        )}

        {status === 'approved' && (
          <Button
            title={`Assign ${selectedEmployee?.name || 'Employee'}`}
            loading={loading}
            disabled={!selectedEmployee}
            onPress={handleAssign}
          />
        )}
      </View>
    </View>
  );
};

/* ---------------- Small Components ---------------- */

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  quoteDetails: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 90,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: COLORS.text,
  },
  employeeList: {
    gap: 10,
  },
  employeeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  employeeCardUnavailable: {
    opacity: 0.5,
  },
  employeeCardSelected: {
    borderColor: COLORS.primary,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  employeeSpecialty: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 40,
  },
});

export default AdminQuotesScreen;
