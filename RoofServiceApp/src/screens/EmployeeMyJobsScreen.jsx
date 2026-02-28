import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../config/api';
import { COLORS, JOB_STATUS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};
const formatTime = time => {
  if (!time) return '';

  const date = new Date(time);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const TABS = ['All', 'New', 'Active', 'Completed'];

const EmployeeMyJobsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadJobs(1, true);
  }, [activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      loadJobs(1, true);
    }, [user?.id, activeTab]),
  );

  const getStatusFilter = () => {
    if (activeTab === 'New') return JOB_STATUS.ASSIGNED; // Backend logic might need to be flexible for multiple statuses
    if (activeTab === 'Active') return JOB_STATUS.IN_PROGRESS;
    if (activeTab === 'Completed') return JOB_STATUS.COMPLETED;
    return null;
  };

  const loadJobs = async (pageNum = 1, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const status = getStatusFilter();
      const response = await api.getEmployeeJobs(user.id, {
        page: pageNum,
        limit: 10,
        status: status,
      });

      const { data, total, pages } = response.data;
      const raw = Array.isArray(data) ? data : [];

      const mappedJobs = raw.map(job => {
        const lead = job.lead || {};
        const scheduledDate = job.scheduledDate || lead.preferredDate || '';
        const createdDate = lead.createdAt || job.createdAt || '';
        const completedDate = lead.updatedAt || job.updatedAt || '';
        return {
          id: String(job.id ?? lead.id ?? Math.random()),
          leadId: lead.id,
          service: lead.serviceType || 'Roof Service',
          address: `${lead.address} ${lead?.city || ''} ` || 'N/A',
          city: lead.city || '',
          clientName: lead.name || 'Client',
          phone: lead.phone || 'N/A',
          status: job.status,
          date: createdDate ? formatDateLocal(createdDate) : '',
          preferredDate: scheduledDate ? formatDateLocal(scheduledDate) : '',
          inTime: formatTime(job.startTime) || formatTime(lead.inTime) || null,
          outTime: formatTime(job.endTime) || formatTime(lead.outTime) || null,
          notes: lead.message || job.notes || '',
          employeeNotes: lead.employee_notes || job.employeeNotes || '',
          lead: lead,
          afterImages: job.afterImages,
          actualHours: job.actualHours || job.actual_hours || 0,
          actual_hours: job.actual_hours || job.actualHours || 0,
          completedDate: completedDate ? formatDateLocal(completedDate) : '',
        };
      });

      if (isInitial) {
        setJobs(mappedJobs);
      } else {
        setJobs(prev => [...prev, ...mappedJobs]);
      }

      setPage(pageNum);
      setHasMore(pageNum < pages);
    } catch (error) {
      console.log('Load jobs error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadJobs(page + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs(1, true);
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

  const getFilteredJobs = () => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(
      job =>
        job.clientName?.toLowerCase().includes(query) ||
        job.address?.toLowerCase().includes(query) ||
        job.service?.toLowerCase().includes(query),
    );
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.jobCard}
      onPress={() => navigation.navigate('EmployeeJobDetail', { job: item })}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobIconContainer}>
          <Text style={styles.jobIcon}>🔨</Text>
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
          <Text style={styles.detailText}>
            {item.preferredDate || 'Not scheduled'}
          </Text>
        </View>
        {item.actualHours > 0 && (
          <View style={styles.jobDetailItem}>
            <Text style={styles.detailIcon}>⏲️</Text>
            <Text style={styles.detailText}>
              {item.actualHours} hrs worked
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>All Jobs</Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search client, address..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === item && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab(item)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item && styles.tabTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      <FlatList
        data={getFilteredJobs()}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading jobs...' : 'No jobs found in this category.'}
            </Text>
          </View>
        )}
      />

      {/* Footer Nav - Replicated to maintain context */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeDashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <View style={styles.navItem} onPress={() => { }}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>💼</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>Jobs</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(34),
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
  searchContainer: {
    padding: moderateScale(20),
    backgroundColor: COLORS.white,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(46),
  },
  searchIcon: {
    fontSize: moderateScale(16),
    marginRight: moderateScale(8),
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: COLORS.text,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: verticalScale(12),
  },
  tabsContent: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(12),
  },
  tabItem: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: '#F0F4F8',
    marginRight: moderateScale(8),
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    ...SHADOWS.small,
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
  emptyState: {
    alignItems: 'center',
    padding: moderateScale(40),
  },
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(12),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(30) : verticalScale(12),
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
});

export default EmployeeMyJobsScreen;
