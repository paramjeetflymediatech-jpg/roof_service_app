import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { api } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

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
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: verticalScale(40) }} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No lead selected</Text>
            <Button title="Back" onPress={() => navigation.goBack()} size="small" />
          </View>
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
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{service}</Text>
          <Text style={styles.subtitle}>{address}</Text>
        </View>
        <BrandLogo imageStyle={{ width: moderateScale(40), height: moderateScale(40) }} resizeMode="contain" />
      </View>

      <Card title="Lead Details" style={styles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.info }]}>
             <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{preferedDate || 'N/A'}</Text>
        </View>
        
        {!!description && (
          <View style={styles.detailRowColumn}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.descriptionValue}>{description}</Text>
          </View>
        )}
      </Card>

      <Card title="Assigned Employee" style={styles.card}>
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
          <View style={[styles.detailRow, { marginTop: verticalScale(8) }]}>
            <Text style={styles.detailLabel}>Work Time:</Text>
            <Text style={styles.detailValue}>
              {employeeStartTime || '--:--'}
              {employeeEndTime ? ` - ${employeeEndTime}` : ''}
            </Text>
          </View>
        )}
      </Card>

      {Array.isArray(completionImages) && completionImages.length > 0 && (
        <Card title="Work Photos" style={styles.card}>
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
        variant="outline"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: verticalScale(20),
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  headerInfo: {
    flex: 1,
    marginRight: moderateScale(16),
  },
  title: {
    fontSize: moderateScale(FONTS.sizes.h2),
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    marginTop: verticalScale(4),
  },
  card: {
    marginBottom: verticalScale(16),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  detailRowColumn: {
    marginTop: verticalScale(8),
  },
  detailLabel: {
    width: moderateScale(100),
    fontSize: moderateScale(FONTS.sizes.body),
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 1,
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.text,
    fontWeight: '500',
  },
  descriptionValue: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.text,
    lineHeight: verticalScale(20),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imagesRow: {
    flexDirection: 'row',
    gap: moderateScale(12),
    paddingVertical: verticalScale(8),
  },
  image: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(8),
    backgroundColor: '#eee',
  },
  backButton: {
    marginTop: verticalScale(16),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  errorText: {
    fontSize: moderateScale(FONTS.sizes.h3),
    color: COLORS.textLight,
    marginBottom: verticalScale(16),
  },
});

export default ClientLeadDetailScreen;
