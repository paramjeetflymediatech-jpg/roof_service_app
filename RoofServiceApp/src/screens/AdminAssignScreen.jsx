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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS } from '../utils/constants';

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
          if (!job.scheduledDate && !job.scheduled_date) return;
          const dt = new Date(job.scheduledDate || job.scheduled_date);
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
        console.log('Availability check error:', error.response || error);
        setBusyEmployeeIds([]);
      }
    };

    updateAvailability();
  }, [scheduledDate, selectedSlot]);

  console.log(user, 'user');

  /* ---------------- Load Employees ---------------- */
  const loadEmployees = async () => {
    try {
      const response = await api.getUsers('employee');

      // ✅ Safe normalization for backend variations
      const list =
        response?.data?.items ||
        response?.data?.data ||
        response?.data?.users ||
        response?.data ||
        [];

      setEmployees(list);
    } catch (error) {
      console.log('Load employees error:', error?.response || error);
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
  console.log(selectedQuote, 'selected quote');

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Quote Details */}
      <View style={styles.quoteDetails}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>{selectedQuote.service}</Text>
          <BrandLogo imageStyle={{ width: 40, height: 40 }} resizeMode="contain" />
        </View>
        <Text style={styles.subtitle}>{selectedQuote.address}</Text>

        <InfoRow label="Client" value={selectedQuote.clientName} />
        <InfoRow label="Phone" value={selectedQuote.phone} />
        <InfoRow label="Email" value={selectedQuote.email} />
        <InfoRow label="Prefered Date" value={selectedQuote.preferedDate} />
        <InfoRow label="Job Post date" value={selectedQuote.date} />

        <Text style={styles.sectionHeader}>Schedule Job</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Day:</Text>
          <TextInput
            style={styles.dateInput}
            value={scheduledDate}
            onChangeText={setScheduledDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.slotRow}>
          <TouchableOpacity
            style={[
              styles.slotChip,
              selectedSlot === 'morning' && styles.slotChipSelected,
            ]}
            onPress={() => setSelectedSlot('morning')}
          >
            <Text
              style={[
                styles.slotChipText,
                selectedSlot === 'morning' && styles.slotChipTextSelected,
              ]}
            >
              Morning (9–12)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.slotChip,
              selectedSlot === 'afternoon' && styles.slotChipSelected,
            ]}
            onPress={() => setSelectedSlot('afternoon')}
          >
            <Text
              style={[
                styles.slotChipText,
                selectedSlot === 'afternoon' && styles.slotChipTextSelected,
              ]}
            >
              Afternoon (13–17)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.slotChip,
              selectedSlot === 'evening' && styles.slotChipSelected,
            ]}
            onPress={() => setSelectedSlot('evening')}
          >
            <Text
              style={[
                styles.slotChipText,
                selectedSlot === 'evening' && styles.slotChipTextSelected,
              ]}
            >
              Evening (17–20)
            </Text>
          </TouchableOpacity>
        </View>

        {selectedQuote.employeeStartTime && (
          <InfoRow
            label="Start Time"
            value={selectedQuote.employeeStartTime}
          />
        )}
        {selectedQuote.employeeEndTime && (
          <InfoRow label="End Time" value={selectedQuote.employeeEndTime} />
        )}
        {selectedQuote.inTime && (
          <InfoRow label="In Time" value={selectedQuote.inTime} />
        )}
        {selectedQuote.outTime && (
          <InfoRow label="Out Time" value={selectedQuote.outTime} />
        )}

        {/* Employee List */}
        {selectedQuote.status === LEAD_STATUS.APPROVED && (
          <>
            <Text style={styles.sectionHeader}>Select Employee</Text>

            <FlatList
              data={employees}
              keyExtractor={(item, index) => String(item?.id ?? index)}
              contentContainerStyle={styles.employeeList}
              renderItem={({ item }) => {
                const isSelected = selectedEmployee?.id === item.id;
                const isBusy = busyEmployeeIds.includes(item.id);
                const isAvailable = !isBusy;

                return (
                  <TouchableOpacity
                    style={[
                      styles.employeeCard,
                      !isAvailable && styles.employeeCardUnavailable,
                      isSelected && styles.employeeCardSelected,
                    ]}
                    onPress={() => isAvailable && setSelectedEmployee(item)}
                    disabled={!isAvailable}
                  >
                    <View>
                      <Text style={styles.employeeName}>{item.name}</Text>
                      <Text style={styles.employeeSpecialty}>
                        {item.specialty || 'General'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isAvailable
                            ? COLORS.success
                            : COLORS.textLight,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {isAvailable ? 'Available' : 'Busy'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {selectedQuote.status === LEAD_STATUS.PENDING && (
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

        {selectedQuote.status === LEAD_STATUS.APPROVED && (
          <Button
            title={`Assign ${selectedEmployee?.name || 'Employee'}`}
            onPress={handleAssign}
            loading={loading}
            disabled={!selectedEmployee}
          />
        )}
      </View>

      {/* Completion details for admin when job is done */}
      {hasCompletionDetails && (
        <View style={styles.completionContainer}>
          <Text style={styles.sectionHeader}>Job Completion Details</Text>
          {selectedQuote.employeeNotes && (
            <View style={styles.completionNotesBox}>
              <Text style={styles.completionLabel}>Employee Notes</Text>
              <Text style={styles.completionText}>
                {selectedQuote.employeeNotes}
              </Text>
            </View>
          )}

          {Array.isArray(selectedQuote.completionImages) &&
            selectedQuote.completionImages.length > 0 && (
              <View style={styles.completionImagesSection}>
                <Text style={styles.completionLabel}>Work Photos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.completionImagesRow}
                >
                  {selectedQuote.completionImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.url || img.uri }}
                      style={styles.completionImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
        </View>
      )}
    </ScrollView>
  );
};

/* ---------- Small helper component ---------- */
const InfoRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 10,
  },
  detailLabel: {
    width: 80,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 1,
    color: COLORS.text,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: COLORS.text,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    backgroundColor: 'white',
  },
  slotChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotChipText: {
    fontSize: 12,
    color: COLORS.text,
  },
  slotChipTextSelected: {
    color: 'white',
  },
  employeeList: {
    gap: 10,
  },
  employeeCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
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
  completionContainer: {
    marginTop: 24,
  },
  completionNotesBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  completionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  completionText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  completionImagesSection: {
    marginTop: 16,
  },
  completionImagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  completionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textLight,
  },
});

export default AdminAssignScreen;
