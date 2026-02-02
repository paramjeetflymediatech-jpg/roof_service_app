import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, LEAD_STATUS } from '../utils/constants';

const AdminQuotesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { quote } = route?.params || {};
  const [selectedQuote, setSelectedQuote] = useState(quote);
  const [employees] = useState([
    { id: '1', name: 'Mike Johnson', specialty: 'Roof Repair', available: true },
    { id: '2', name: 'Sarah Williams', specialty: 'Installation', available: true },
    { id: '3', name: 'Tom Brown', specialty: 'Gutters', available: false },
    { id: '4', name: 'David Lee', specialty: 'General', available: true },
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await api.assignLead(selectedQuote.id, {
      //   employeeId: selectedEmployee.id,
      // });

      Alert.alert(
        'Success',
        `${selectedEmployee.name} has been assigned to this job. They will receive an email notification.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Quote',
      'Are you sure you want to reject this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // const response = await api.updateLead(selectedQuote.id, { status: 'rejected' });
              Alert.alert('Success', 'Quote has been rejected');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject quote');
            }
          },
        },
      ]
    );
  };

  const handleApprove = async () => {
    try {
      // const response = await api.updateLead(selectedQuote.id, { status: 'approved' });
      Alert.alert('Success', 'Quote has been approved. Please assign an employee.');
      setSelectedQuote({ ...selectedQuote, status: 'approved' });
    } catch (error) {
      Alert.alert('Error', 'Failed to approve quote');
    }
  };

  if (!selectedQuote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quote selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.quoteDetails}>
        <Text style={styles.title}>{selectedQuote.service}</Text>
        <Text style={styles.subtitle}>{selectedQuote.address}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Client:</Text>
          <Text style={styles.detailValue}>{selectedQuote.clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{selectedQuote.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedQuote.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{selectedQuote.date}</Text>
        </View>

        {selectedQuote.status === 'approved' && (
          <>
            <Text style={styles.sectionHeader}>Select Employee</Text>
            <FlatList
              data={employees}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.employeeCard,
                    !item.available && styles.employeeCardUnavailable,
                    selectedEmployee?.id === item.id && styles.employeeCardSelected,
                  ]}
                  onPress={() => item.available && setSelectedEmployee(item)}
                  disabled={!item.available}
                >
                  <View>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.employeeSpecialty}>{item.specialty}</Text>
                  </View>
                  {item.available ? (
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
                      <Text style={styles.statusText}>Available</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.textLight }]}>
                      <Text style={styles.statusText}>Busy</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.employeeList}
            />
          </>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {selectedQuote.status === 'pending' && (
          <>
            <Button
              title="Approve Quote"
              onPress={handleApprove}
              variant="success"
              style={styles.actionButton}
            />
            <Button
              title="Reject Quote"
              onPress={handleReject}
              variant="danger"
              style={styles.actionButton}
            />
          </>
        )}
        {selectedQuote.status === 'approved' && (
          <Button
            title={`Assign ${selectedEmployee?.name || 'Employee'}`}
            onPress={handleAssign}
            loading={loading}
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
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
  quoteDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 80,
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
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
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
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default AdminQuotesScreen;
