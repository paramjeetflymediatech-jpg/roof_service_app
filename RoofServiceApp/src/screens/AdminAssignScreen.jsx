import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const AdminAssignScreen = ({ route }) => {
  const navigation = useNavigation();
  const { quote } = route?.params || {};
  const { user } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState(quote);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(''); // YYYY-MM-DD
  const [selectedSlot, setSelectedSlot] = useState(null); // 'morning' | 'afternoon' | 'evening'
  const [busyEmployeeIds, setBusyEmployeeIds] = useState([]); // employees already booked for selected date/slot

  useEffect(() => {
    loadEmployees();
  }, []);

  // Whenever scheduled date or slot changes, recompute which employees are busy
  useEffect(() => {
    const updateAvailability = async () => {
      if (!scheduledDate || !selectedSlot) {
        setBusyEmployeeIds([]);
        return;
      }
      try {
        const res = await api.getAllJobs({});
        const raw =
          res.data?.items ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        const [year, month, day] = scheduledDate.split('-').map(Number);
        if (!year || !month || !day) {
          setBusyEmployeeIds([]);
          return;
        }
        const getSlot = dateStr => {
          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return null;
          const h = d.getHours();
          if (h < 12) return 'morning';
          if (h < 17) return 'afternoon';
          return 'evening';
        };

        const idsSet = new Set();
        raw.forEach(job => {
          // Check for both property names
          const sDate = job.scheduledDate || job.scheduled_date;
          if (!sDate) return;

          const dt = new Date(sDate);
          if (Number.isNaN(dt.getTime())) return;

          if (
            dt.getFullYear() === year &&
            dt.getMonth() + 1 === month &&
            dt.getDate() === day
          ) {
            const slot = getSlot(dt.toISOString());
            if (slot === selectedSlot) {
              const status = job.status;
              if (
                status === 'pending' ||
                status === 'accepted' ||
                status === 'in_progress'
              ) {
                idsSet.add(job.employeeId || job.employee_id);
              }
            }
          }
        });

        setBusyEmployeeIds(Array.from(idsSet));
      } catch (error) {
        console.log('Availability check error:', error);
        setBusyEmployeeIds([]);
      }
    };

    updateAvailability();
  }, [scheduledDate, selectedSlot]);

  const loadEmployees = async () => {
    try {
      const response = await api.getUsers('employee');
      const list =
        response?.data?.items ||
        response?.data?.data ||
        response?.data?.users ||
        response?.data ||
        [];
      setEmployees(list);
    } catch (error) {
      //   console.log('Load employees error:', error);
      Alert.alert('Error', 'Failed to load employees');
    }
  };

  const handleApprove = async () => {
    try {
      await api.updateLead(selectedQuote.id, {
        status: LEAD_STATUS.APPROVED,
      });

      setSelectedQuote({
        ...selectedQuote,
        status: LEAD_STATUS.APPROVED,
      });

      Alert.alert('Success', 'Quote approved. Please assign an employee.');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve quote');
    }
  };

  const handleReject = async () => {
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

  const buildScheduledDate = () => {
    if (!scheduledDate || !selectedSlot) return null;
    const [year, month, day] = scheduledDate.split('-').map(Number);
    if (!year || !month || !day) return null;
    let hour = 9;
    if (selectedSlot === 'afternoon') hour = 13;
    if (selectedSlot === 'evening') hour = 17;
    const d = new Date(year, month - 1, day, hour, 0, 0, 0);
    return d.toISOString();
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }
    if (!scheduledDate || !selectedSlot) {
      Alert.alert('Error', 'Please select a date and time slot for the job.');
      return;
    }
    const scheduledISO = buildScheduledDate();
    if (!scheduledISO) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);
    try {
      await api.assignLead(selectedQuote.id, {
        employeeId: selectedEmployee.id,
        status: LEAD_STATUS.ASSIGNED,
        adminid: user.id,
        scheduledDate: scheduledISO,
      });

      Alert.alert(
        'Success',
        `${selectedEmployee.name} has been assigned successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedQuote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quote selected</Text>
      </View>
    );
  }

  const hasCompletionDetails =
    selectedQuote.status === LEAD_STATUS.COMPLETED &&
    (selectedQuote.employeeNotes ||
      (Array.isArray(selectedQuote.completionImages) &&
        selectedQuote.completionImages.length > 0));
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details & Assignment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quote Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.serviceTitle}>{selectedQuote.service}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: COLORS.primary }]}>
                {selectedQuote.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <InfoItem
              icon="👤"
              label="Client"
              value={selectedQuote.clientName}
            />
            <InfoItem icon="📍" label="Address" value={selectedQuote.address} />
            <InfoItem icon="📞" label="Phone" value={selectedQuote.phone} />
            <InfoItem icon="📧" label="Email" value={selectedQuote.email} />
            <InfoItem
              icon="📅"
              label="Preferred"
              value={selectedQuote.preferedDate}
            />
            <InfoItem icon="🕒" label="Requested" value={selectedQuote.date} />
          </View>
        </View>

        {/* Assigned Employee Details (If Assigned) */}
        {selectedQuote.assignedEmployee && (
          <>
            <Text style={styles.sectionTitle}>👷 Assigned Employee</Text>
            <View style={styles.card}>
              <View style={styles.infoGrid}>
                <InfoItem
                  icon="👤"
                  label="Name"
                  value={selectedQuote.assignedEmployee.name}
                />
                <InfoItem
                  icon="📞"
                  label="Phone"
                  value={selectedQuote.assignedEmployee.phone}
                />
                <InfoItem
                  icon="📧"
                  label="Email"
                  value={selectedQuote.assignedEmployee.email}
                />
                <InfoItem
                  icon="📥"
                  label="Start Work Time"
                  value={
                    selectedQuote.inTime !== null ? selectedQuote.inTime : 'Not Started'
                  }
                />
                <InfoItem
                  icon="📥"
                  label="End Work Time"
                  value={selectedQuote.outTime!==null?selectedQuote.outTime:'Not Completed'}
                />
              </View>
            </View>
          </>
        )}

        {/* Schedule Section - Hide if already assigned/completed */}
        {selectedQuote.status !== LEAD_STATUS.ASSIGNED &&
          selectedQuote.status !== LEAD_STATUS.COMPLETED &&
          selectedQuote.status !== LEAD_STATUS.IN_PROGRESS && (
            <>
              <Text style={styles.sectionTitle}>📅 Schedule Job</Text>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={scheduledDate}
                    onChangeText={setScheduledDate}
                    placeholder="2026-02-07"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <Text
                  style={[styles.inputLabel, { marginTop: verticalScale(12) }]}
                >
                  Time Slot
                </Text>
                <View style={styles.slotContainer}>
                  {[
                    { id: 'morning', label: 'Morning', sub: '9am - 12pm' },
                    { id: 'afternoon', label: 'Afternoon', sub: '1pm - 5pm' },
                    { id: 'evening', label: 'Evening', sub: '5pm - 8pm' },
                  ].map(slot => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.slotButton,
                        selectedSlot === slot.id && styles.slotButtonActive,
                      ]}
                      onPress={() => setSelectedSlot(slot.id)}
                    >
                      <Text
                        style={[
                          styles.slotTitle,
                          selectedSlot === slot.id && styles.slotTextActive,
                        ]}
                      >
                        {slot.label}
                      </Text>
                      <Text
                        style={[
                          styles.slotSub,
                          selectedSlot === slot.id && styles.slotTextActive,
                        ]}
                      >
                        {slot.sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

        {/* Employee Selection */}
        {selectedQuote.status === LEAD_STATUS.APPROVED && (
          <>
            <Text style={styles.sectionTitle}>👷 Select Employee</Text>
            <View style={styles.employeeList}>
              {employees.map(item => {
                const isSelected = selectedEmployee?.id === item.id;
                const isBusy = busyEmployeeIds.includes(item.id);
                const isAvailable = !isBusy;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.employeeCard,
                      !isAvailable && styles.employeeCardDisabled,
                      isSelected && styles.employeeCardActive,
                    ]}
                    onPress={() => isAvailable && setSelectedEmployee(item)}
                    disabled={!isAvailable}
                  >
                    <View style={styles.employeeAvatar}>
                      <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>{item.name}</Text>
                      <Text style={styles.employeeRole}>{item.role}</Text>
                    </View>
                    <View
                      style={[
                        styles.availabilityBadge,
                        {
                          backgroundColor: isAvailable
                            ? COLORS.success + '20'
                            : COLORS.textLight + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.availabilityText,
                          {
                            color: isAvailable
                              ? COLORS.success
                              : COLORS.textLight,
                          },
                        ]}
                      >
                        {isAvailable ? 'Available' : 'Busy'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Completion Details */}
        {hasCompletionDetails && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Job Completion</Text>
            <View style={styles.divider} />
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{selectedQuote.employeeNotes}</Text>

            {Array.isArray(selectedQuote.completionImages) &&
              selectedQuote.completionImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageScroll}
                >
                  {selectedQuote.completionImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.url || img.uri }}
                      style={styles.completionImage}
                    />
                  ))}
                </ScrollView>
              )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {selectedQuote.status === LEAD_STATUS.PENDING ? (
            <View style={styles.rowButtons}>
              <Button
                title="Reject"
                onPress={handleReject}
                variant="outline"
                style={{ flex: 1, borderColor: COLORS.error }}
                textStyle={{ color: COLORS.error }}
              />
              <Button
                title="Approve"
                onPress={handleApprove}
                style={{ flex: 1, backgroundColor: COLORS.success }}
              />
            </View>
          ) : selectedQuote.status === LEAD_STATUS.APPROVED ? (
            <Button
              title={
                selectedEmployee
                  ? `Assign to ${selectedEmployee.name}`
                  : 'Select an Employee'
              }
              onPress={handleAssign}
              loading={loading}
              disabled={!selectedEmployee}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  serviceTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(16),
    opacity: 0.5,
  },
  infoGrid: {
    gap: verticalScale(16),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: moderateScale(18),
    marginRight: moderateScale(12),
    width: moderateScale(24),
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: moderateScale(11),
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: COLORS.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(12),
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: verticalScale(8),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: moderateScale(14),
    color: COLORS.text,
  },
  slotContainer: {
    flexDirection: 'row',
    gap: moderateScale(10),
    flexWrap: 'wrap',
  },
  slotButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  slotButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  slotTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  slotSub: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
  },
  slotTextActive: {
    color: COLORS.primary,
  },
  employeeList: {
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  employeeCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  employeeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  employeeAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  avatarText: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: COLORS.text,
  },
  employeeRole: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  availabilityBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  availabilityText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(12),
  },
  notesLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: verticalScale(8),
  },
  notesText: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(16),
    fontStyle: 'italic',
  },
  imageScroll: {
    marginTop: verticalScale(8),
  },
  completionImage: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(12),
    marginRight: moderateScale(12),
  },
  actionsContainer: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  rowButtons: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  errorText: {
    textAlign: 'center',
    marginTop: verticalScale(40),
    fontSize: moderateScale(16),
    color: COLORS.textLight,
  },
});

export default AdminAssignScreen;
