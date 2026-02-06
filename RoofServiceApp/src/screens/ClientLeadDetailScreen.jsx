import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../utils/constants';
import { api } from '../config/api';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const ClientLeadDetailScreen = () => {
  const navigation = useNavigation();
  const { lead: initialLead } = useRoute().params || {};

  const [lead, setLead] = useState(initialLead || null);
  const [employee, setEmployee] = useState({ name: initialLead?.assignedEmployeeName, phone: initialLead?.assignedEmployeePhone });
  const [loading, setLoading] = useState(!initialLead);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!initialLead?.id) return;
      try {
        setLoading(true);
        // Fetch latest lead data
        const res = await api.getLeadById(initialLead.id);
        const apiLead = res.data || {};

        // Merge API lead fields into existing mapped lead shape
        const mergedLead = {
          ...(initialLead || {}),
          status: apiLead.status || initialLead.status,
          description: apiLead.message || apiLead.description || initialLead.description,
          employeeStartTime: apiLead.employeeStartTime || initialLead.employeeStartTime,
          employeeEndTime: apiLead.employeeEndTime || initialLead.employeeEndTime,
          completionImages: apiLead.completionImages || initialLead.completionImages,
          date: formatDateLocal(apiLead.createdAt || initialLead.date),
          preferedDate: apiLead.preferredDate ? formatDateLocal(apiLead.preferredDate) : initialLead.preferedDate,
        };

        setLead(mergedLead);

        // If we know assigned employee id, fetch latest employee info
        const assignedToId = apiLead.assignedToId || apiLead.assigned_to_id;
        if (assignedToId) {
          try {
            const uRes = await api.getUserById(assignedToId);
            const u = uRes.data || {};
            setEmployee({ name: u.name || employee.name, phone: u.phone || employee.phone });
          } catch (e) {
            // keep existing employee state on error
          }
        }
      } catch (error) {
        console.log('Client lead detail fetch error:', error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [initialLead]);

  if (!lead) {
    return (
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.errorText}>No lead selected</Text>
            <Button title="Back" onPress={() => navigation.goBack()} />
          </>
        )}
      </View>
    );
  }

  const {
    service,
    address,
    status,
    date,
    preferedDate,
    description,
    employeeStartTime,
    employeeEndTime,
    completionImages,
  } = lead;
  

  const assignedEmployeeName = employee?.name || lead.assignedEmployeeName;
  const assignedEmployeePhone = employee?.phone || lead.assignedEmployeePhone;

  const statusLabel = status ? status.toString().replace(/_/g, ' ') : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{service}</Text>
      <Text style={styles.subtitle}>{address}</Text>

      <Card title="Lead Details">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={styles.detailValue}>{statusLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{preferedDate}</Text>
        </View>
        
        {!!description && (
          <View style={styles.detailRowColumn}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{description}</Text>
          </View>
        )}
      </Card>

      <Card title="Assigned Employee">
        {assignedEmployeeName ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{assignedEmployeeName}</Text>
            </View>
            {assignedEmployeePhone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{assignedEmployeePhone}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.detailValue}>No employee assigned yet.</Text>
        )}

        {(employeeStartTime || employeeEndTime) && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Work Time:</Text>
            <Text style={styles.detailValue}>
              {employeeStartTime || '--:--'}
              {employeeEndTime ? ` - ${employeeEndTime}` : ''}
            </Text>
          </View>
        )}
      </Card>

      {Array.isArray(completionImages) && completionImages.length > 0 && (
        <Card title="Work Photos">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesRow}
          >
            {completionImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.url || img.uri }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        </Card>
      )}

      <Button
        title="Back to My Quotes"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 30,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailRowColumn: {
    marginTop: 8,
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
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  backButton: {
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ClientLeadDetailScreen;
