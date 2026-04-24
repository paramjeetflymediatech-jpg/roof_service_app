import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from '../components/BrandLogo';
import { api } from '../config/api';
import { COLORS, JOB_STATUS, SHADOWS, LocalTime } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse existing hero image or a new one if available
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const isToday = dateString => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const EmployeeDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadJobs();
    }, [user?.id]),
  );

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await api.getEmployeeJobs(user.id);
      const raw =
        response.data?.items ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      const mappedJobs = raw.map(job => {
        const lead = job.lead || {};
        const scheduledDate = job.scheduledDate || lead.preferredDate || '';
        const createdDate = lead.createdAt || job.createdAt || '';
        const completedDate = lead.updatedAt || job.updatedAt || '';

        return {
          id: String(job.id ?? lead.id ?? Math.random()),
          leadId: lead.id,
          service: lead.serviceType || 'Roof Service',
          address: `${lead.address} ${lead?.city || ''}` || 'N/A',
          clientName: lead.name || 'Client',
          phone: lead.phone || 'N/A',
          status: job.status,
          date: createdDate ? formatDateLocal(createdDate) : '',
          preferredDate: scheduledDate ? formatDateLocal(scheduledDate) : '',
          rawDate: scheduledDate, // Keep raw date for sorting/filtering
          inTime: LocalTime(job.startTime) || LocalTime(lead.inTime) || null,
          outTime: LocalTime(job.endTime) || LocalTime(lead.outTime) || null,
          notes: lead.message || job.notes || '',
          employeeNotes: lead.employee_notes || job.employeeNotes || '',
          lead: lead,
          afterImages: job.afterImages,
          completedDate: completedDate ? formatDateLocal(completedDate) : '',
        };
      });

      setJobs(mappedJobs);
    } catch (error) {
      console.log('Load jobs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const getStatusColor = status => {
    switch (status) {
      case JOB_STATUS.ASSIGNED:
      case 'pending':
      case 'accepted':
        return COLORS.info;
      case JOB_STATUS.IN_PROGRESS:
      case 'in_progress':
        return COLORS.warning;
      case JOB_STATUS.COMPLETED:
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case JOB_STATUS.ASSIGNED:
      case 'pending':
        return 'New';
      case 'accepted':
        return 'Accepted';
      case JOB_STATUS.IN_PROGRESS:
      case 'in_progress':
        return 'In Progress';
      case JOB_STATUS.COMPLETED:
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => await logout(),
      },
    ]);
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.jobCard,
        item.status === JOB_STATUS.IN_PROGRESS && styles.activeJobCard,
      ]}
      onPress={() => navigation.navigate('EmployeeJobDetail', { job: item })}
    >
      <View style={styles.jobHeader}>
        <View
          style={[
            styles.jobIconContainer,
            item.status === JOB_STATUS.IN_PROGRESS && {
              backgroundColor: COLORS.white,
            },
          ]}
        >
          <Text style={styles.jobIcon}>
            {item.status === JOB_STATUS.IN_PROGRESS ? '🔥' : '🔨'}
          </Text>
        </View>
        <View style={styles.jobHeaderText}>
          <Text style={styles.jobService}>{item.service}</Text>
          <Text style={styles.jobClient}>{item.clientName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.jobDetails}>
        <View style={styles.jobDetailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <View style={styles.jobDetailItem}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text
            style={[
              styles.detailText,
              isToday(item.rawDate) && {
                color: COLORS.primary,
                fontWeight: '700',
              },
            ]}
          >
            {isToday(item.rawDate)
              ? 'Today'
              : item.preferredDate || 'Not scheduled'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Filter for Dashboard: Active In Progress OR Assigned Today/Future
  // We want to focus on "What do I need to do now?"

  const getDashboardJobs = () => {
    // Priority 1: Jobs currently in progress
    const inProgress = jobs.filter(
      j => j.status === JOB_STATUS.IN_PROGRESS || j.status === 'in_progress',
    );

    // Priority 2: Assigned/Accepted jobs for today or future
    const upcoming = jobs
      .filter(j => {
        const isNotStarted =
          j.status === JOB_STATUS.ASSIGNED ||
          j.status === 'pending' ||
          j.status === 'accepted';
        return isNotStarted; // Show all upcoming unstarted work, sorted by date in UI
      })
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

    return [...inProgress, ...upcoming].slice(0, 5); // Limit to top 5 most relevant
  };

  const dashboardJobs = getDashboardJobs();
  const activeCount = jobs.filter(
    j => j.status !== JOB_STATUS.COMPLETED && j.status !== 'completed',
  ).length;
  const hasActiveJob = jobs.some(
    j => j.status === JOB_STATUS.IN_PROGRESS || j.status === 'in_progress'
  );
  const completedCount = jobs.filter(
    j => j.status === JOB_STATUS.COMPLETED || j.status === 'completed',
  ).length;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero Header */}
      <ImageBackground
        source={HERO_IMAGE}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={[styles.headerOverlay, { paddingTop: insets.top > 0 ? insets.top + verticalScale(10) : verticalScale(20) }]}>
          <View style={styles.topBar}>
            <BrandLogo
              imageStyle={{
                width: moderateScale(30),
                height: moderateScale(30),
              }}
              tintColor={COLORS.white}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'Employee'}!
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <FlatList
          data={dashboardJobs}
          keyExtractor={item => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={() => (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>

              <TouchableOpacity
                style={[styles.createJobHero, hasActiveJob && styles.createJobHeroDisabled]}
                onPress={() => {
                  if (hasActiveJob) {
                    Alert.alert(
                      'Job In Progress',
                      'You already have an active job. Please pause or complete it before creating a new one.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    navigation.navigate('EmployeeCreateJob');
                  }
                }}
              >
                <View style={styles.createJobContent}>
                  <View style={styles.createJobIconContainer}>
                    <Text style={styles.createJobIcon}>➕</Text>
                  </View>
                  <View>
                    <Text style={styles.createJobTitle}>Create Manual Job</Text>
                    <Text style={styles.createJobSub}>Start work without pre-assignment</Text>
                  </View>
                </View>
                <Text style={styles.createJobArrow}>→</Text>
              </TouchableOpacity>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Access</Text>
              </View>

              {/* Services and Gallery Cards */}
              <View style={styles.quickAccessRow}>
                <TouchableOpacity
                  style={styles.quickAccessCard}
                  onPress={() => navigation.navigate('EmployeeServices')}
                >
                  <Text style={styles.quickAccessIcon}>🔨</Text>
                  <Text style={styles.quickAccessLabel}>Services</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAccessCard}
                  onPress={() => navigation.navigate('EmployeeGallery')}
                >
                  <Text style={styles.quickAccessIcon}>🖼️</Text>
                  <Text style={styles.quickAccessLabel}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAccessCard}
                  onPress={() => navigation.navigate('EmployeeTimesheet')}
                >
                  <Text style={styles.quickAccessIcon}>⏰</Text>
                  <Text style={styles.quickAccessLabel}>Timesheet</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EmployeeMyJobs')}
                >
                  <Text style={styles.seeAllText}>See All →</Text>
                </TouchableOpacity>
              </View>

              {dashboardJobs.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>🎉 You're all caught up!</Text>
                  <Text style={styles.emptySubText}>
                    No immediate jobs scheduled.
                  </Text>
                  <TouchableOpacity
                    style={styles.viewJobsButton}
                    onPress={() => navigation.navigate('EmployeeMyJobs')}
                  >
                    <Text style={styles.viewJobsText}>View All Jobs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => { }}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>🏠</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeMyJobs')}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navLabel}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeTimesheet')}
        >
          <Text style={styles.navIcon}>⏰</Text>
          <Text style={styles.navLabel}>Timesheet</Text>
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
  headerBackground: {
    width: '100%',
    height: verticalScale(240),
  },
  headerImage: {
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    padding: moderateScale(20),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoutButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
  },
  logoutText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  welcomeContainer: {
    marginBottom: verticalScale(20),
  },
  greeting: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  dateText: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.medium,
    position: 'absolute',
    bottom: -verticalScale(30), // Overlap
    left: moderateScale(20),
    right: moderateScale(20),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    flex: 1,
    marginTop: verticalScale(40),
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(100),
    marginTop: verticalScale(10),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
    gap: moderateScale(12),
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quickAccessIcon: {
    fontSize: moderateScale(40),
    marginBottom: verticalScale(8),
  },
  quickAccessLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: moderateScale(30),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginTop: verticalScale(10),
    ...SHADOWS.small,
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  emptySubText: {
    color: COLORS.textLight,
    marginBottom: verticalScale(16),
  },
  viewJobsButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(20),
    backgroundColor: '#f0f0f0',
    borderRadius: moderateScale(20),
  },
  viewJobsText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    ...SHADOWS.small,
  },
  activeJobCard: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  jobIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  jobIcon: {
    fontSize: moderateScale(20),
  },
  jobHeaderText: {
    flex: 1,
  },
  jobService: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  jobClient: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(12),
    opacity: 0.5,
  },
  jobDetails: {
    flexDirection: 'column',
    gap: verticalScale(6),
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: moderateScale(14),
    width: moderateScale(20),
    textAlign: 'center',
    marginRight: moderateScale(8),
  },
  detailText: {
    fontSize: moderateScale(13),
    color: COLORS.text,
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
  createJobHero: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  createJobContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  createJobIconContainer: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(15),
  },
  createJobIcon: {
    fontSize: moderateScale(22),
  },
  createJobTitle: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  createJobSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(12),
  },
  createJobArrow: {
    color: COLORS.white,
    fontSize: moderateScale(20),
    fontWeight: '700',
    opacity: 0.8,
  },
  createJobHeroDisabled: {
    backgroundColor: '#A0AEC0',
    opacity: 0.8,
  },
});

export default EmployeeDashboardScreen;
