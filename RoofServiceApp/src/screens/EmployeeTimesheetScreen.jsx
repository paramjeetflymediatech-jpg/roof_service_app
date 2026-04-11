import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../App';
import { api } from '../config/api';
import { COLORS, SHADOWS, FONTS, LocalTime } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import moment from 'moment';

const EmployeeTimesheetScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [timesheet, setTimesheet] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchTimesheet = useCallback(async () => {
    const employeeId = user?.id || user?._id;
    if (!employeeId) {
      console.log('No employee ID found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getTimesheet(employeeId, {
        startDate,
        endDate,
      });
      if (response.data?.success) {
        setTimesheet(response.data.data.timesheet);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.log('Fetch timesheet error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id || user?._id) {
        fetchTimesheet();
      }
    }, [fetchTimesheet, user?.id, user?._id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimesheet();
    setRefreshing(false);
  };

  const applyFilters = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setShowFilterModal(false);
  };

  const onDateChangeStart = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempStart(moment(selectedDate).format('YYYY-MM-DD'));
    } 
  };

  const onDateChangeEnd = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempEnd(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const renderDayItem = ({ item }) => (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayText}>{item.dayOfWeek}</Text>
          <Text style={styles.dateText}>{moment(item.date).format('MMM DD, YYYY')}</Text>
        </View>
        <View style={[styles.hoursBadge, item.isOvertime && styles.overtimeBadge]}>
          <Text style={[styles.hoursText, item.isOvertime && styles.overtimeText]}>
            {item.totalHours} hrs
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dayDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Shift</Text>
          <Text style={styles.detailValue}>
            {LocalTime(item.startTime)} - {item.endTime ? LocalTime(item.endTime) : 'Active'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Break</Text>
          <Text style={styles.detailValue}>{item.breakHours} hrs</Text>
        </View>
        {item.isOvertime && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: COLORS.error }]}>Overtime</Text>
            <Text style={[styles.detailValue, { color: COLORS.error }]}>
              {item.overtimeHours} hrs
            </Text>
          </View>
        )}
      </View>

      {item.sessions && item.sessions.length > 0 && (
        <View style={styles.sessionsContainer}>
          <Text style={styles.sessionsHeader}>Daily Sessions</Text>
          {item.sessions.map((session, idx) => (
            <View key={session.id || idx} style={styles.sessionItem}>
              <View style={styles.sessionDot} />
              <View style={styles.sessionInfo}>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionTime}>
                    {LocalTime(session.startTime)} - {session.endTime ? LocalTime(session.endTime) : 'Active'}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {session.duration ? (session.duration / 3600).toFixed(2) : '0.00'} hrs
                  </Text>
                </View>
                <Text style={styles.sessionLead} numberOfLines={1}>
                  {session.leadName} {session.serviceType ? `(${session.serviceType})` : ''}
                </Text>
                {session.leadAddress && (
                  <Text style={styles.sessionAddress} numberOfLines={1}>
                    📍 {session.leadAddress}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
  
  const renderOvertimeBreakdown = () => {
    if (!summary || summary.totalHours === 0) return null;
    
    // Calculate regular hours (capped at 8 per day implicitly via the backend summary)
    const regularHours = Math.max(0, summary.totalHours - summary.totalOvertimeHours).toFixed(2);
    
    return (
      <View style={styles.calculationCard}>
        <View style={styles.calcHeader}>
          <Text style={styles.calcTitle}>Overtime Calculation</Text>
          <View style={styles.policyBadge}>
            <Text style={styles.policyText}>8h Threshold</Text>
          </View>
        </View>
        
        <View style={styles.calcRow}>
          <View style={styles.calcCol}>
            <Text style={styles.calcLabel}>Total Hours</Text>
            <Text style={styles.calcValue}>{summary.totalHours.toFixed(2)}</Text>
          </View>
          <Text style={styles.calcOperator}>-</Text>
          <View style={styles.calcCol}>
            <Text style={styles.calcLabel}>Regular</Text>
            <Text style={styles.calcValue}>{regularHours}</Text>
          </View>
          <Text style={styles.calcOperator}>=</Text>
          <View style={styles.calcCol}>
            <Text style={styles.calcLabel}>Overtime</Text>
            <Text style={[styles.calcValue, { color: COLORS.error }]}>{summary.totalOvertimeHours.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.calcFooter}>
          <Text style={styles.calcNote}>* Calculations based on daily work exceeding 8 hours.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + verticalScale(10) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Timesheet</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Text style={styles.filterIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {summary && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.totalHours}</Text>
              <Text style={styles.summaryLabel}>Total Hours</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.error }]}>{summary.totalOvertimeHours}</Text>
              <Text style={styles.summaryLabel}>Overtime</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.daysWorked}</Text>
              <Text style={styles.summaryLabel}>Days</Text>
            </View>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={timesheet}
          keyExtractor={(item) => item.date}
          renderItem={renderDayItem}
          ListHeaderComponent={renderOvertimeBreakdown}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⏰</Text>
              <Text style={styles.emptyText}>No records found</Text>
              <Text style={styles.emptySubText}>Try adjusting your date range</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Date Range</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.pickerField} 
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.pickerFieldText}>
                  {moment(tempStart).format('MMM DD, YYYY')}
                </Text>
                <Text style={styles.pickerFieldIcon}>📅</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={moment(tempStart).toDate()}
                  mode="date"
                  display="default"
                  onChange={onDateChangeStart}
                  maximumDate={moment(tempEnd).toDate()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.pickerField} 
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.pickerFieldText}>
                  {moment(tempEnd).format('MMM DD, YYYY')}
                </Text>
                <Text style={styles.pickerFieldIcon}>📅</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={moment(tempEnd).toDate()}
                  mode="date"
                  display="default"
                  onChange={onDateChangeEnd}
                  minimumDate={moment(tempStart).toDate()}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.resetBtn]}
                onPress={() => {
                  const start = moment().startOf('month').format('YYYY-MM-DD');
                  const end = moment().format('YYYY-MM-DD');
                  setTempStart(start);
                  setTempEnd(end);
                  setStartDate(start);
                  setEndDate(end);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.applyBtn]}
                onPress={applyFilters}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeDashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeMyJobs')}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navLabel}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { }}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>⏰</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>Timesheet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeProfile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
    ...SHADOWS.small,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
  },
  backButton: {
    padding: moderateScale(5),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: COLORS.text,
  },
  filterButton: {
    padding: moderateScale(5),
  },
  filterIcon: {
    fontSize: moderateScale(20),
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    marginTop: verticalScale(2),
  },
  summaryDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
  },
  listContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    ...SHADOWS.small,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  dayText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  dateText: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
  },
  hoursBadge: {
    backgroundColor: '#E7F5E8',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  overtimeBadge: {
    backgroundColor: '#FEE2E2',
  },
  hoursText: {
    color: COLORS.success,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  overtimeText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
    marginBottom: verticalScale(12),
  },
  dayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    marginBottom: verticalScale(2),
  },
  detailValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionsContainer: {
    marginTop: verticalScale(16),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  sessionsHeader: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(10),
  },
  sessionItem: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
  },
  sessionDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: COLORS.primary,
    marginTop: verticalScale(6),
    marginRight: moderateScale(10),
  },
  sessionInfo: {
    flex: 1,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  sessionTime: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.text,
  },
  sessionDuration: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.primary,
  },
  sessionLead: {
    fontSize: moderateScale(12),
    color: COLORS.text,
    fontWeight: '500',
  },
  sessionAddress: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    marginTop: verticalScale(1),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: verticalScale(60),
  },
  emptyIcon: {
    fontSize: moderateScale(60),
    marginBottom: verticalScale(16),
    opacity: 0.5,
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginTop: verticalScale(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(6),
  },
  input: {
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: moderateScale(12),
    marginTop: verticalScale(8),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F0F4F8',
  },
  resetBtn: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  resetBtnText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  applyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  closeModalBtn: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: COLORS.textLight,
    fontSize: moderateScale(14),
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  calculationCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  calcTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.text,
  },
  policyBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  policyText: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(10),
  },
  calcCol: {
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  calcValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  calcOperator: {
    fontSize: moderateScale(18),
    color: COLORS.textLight,
    fontWeight: '300',
    marginTop: verticalScale(14),
  },
  calcFooter: {
    marginTop: verticalScale(16),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  calcNote: {
    fontSize: moderateScale(11),
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  pickerField: {
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerFieldText: {
    fontSize: moderateScale(15),
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerFieldIcon: {
    fontSize: moderateScale(16),
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-around',
    ...SHADOWS.large,
    zIndex: 1000,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: moderateScale(22),
    color: COLORS.textLight,
    marginBottom: verticalScale(2),
  },
  navLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    fontWeight: '600',
  },
});

export default EmployeeTimesheetScreen;
