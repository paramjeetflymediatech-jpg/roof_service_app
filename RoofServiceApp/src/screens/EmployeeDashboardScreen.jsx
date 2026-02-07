import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, JOB_STATUS } from '../utils/constants';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};
  
const EmployeeDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  // Reload jobs whenever the dashboard screen focuses (after closing detail screen, etc.)
  useFocusEffect(
    React.useCallback(() => {
      loadJobs();
    }, [user?.id]),
  );

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await api.getEmployeeJobs(user.id);
      console.log('Employee jobs API response:', response.data);

      const raw =
        response.data?.items ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      const mappedJobs = raw.map(job => {
        const lead = job.lead || {};
        const scheduledDate = job.scheduledDate || lead.preferredDate || '';
        const createdDate = lead.createdAt || job.createdAt || '';

        return {
          id: String(job.id ?? lead.id ?? Math.random()),
          leadId: lead.id,
          service: lead.serviceType || 'Roof Service',
          address: lead.address || 'N/A',
          clientName: lead.name || 'Client',
          phone: lead.phone || 'N/A',
          status: job.status,
          date: createdDate ? formatDateLocal(createdDate) : '',
          preferredDate: scheduledDate ? formatDateLocal(scheduledDate) : '',
          inTime: job.startTime || lead.inTime || null,
          outTime: job.endTime || lead.outTime || null,
          notes: lead.message || job.notes || '',
        };
      });

      setJobs(mappedJobs);
    } catch (error) {
      console.log('Load jobs error:', error.response || error);
      Alert.alert('Error', 'Failed to load jobs');
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

  const getStatusText = status => {
    switch (status) {
      case JOB_STATUS.ASSIGNED:
      case 'pending':
      case 'accepted':
        return 'Not Started';
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
    await logout();
    // RootNavigator will switch to the auth stack (Onboarding/Login/Register)
  };

  const renderJobItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`${item.clientName} • ${item.address}`}
      status={getStatusText(item.status)}
      statusColor={getStatusColor(item.status)}
      onPress={() => navigation.navigate('EmployeeJobDetail', { job: item })}
    >
      <View style={styles.cardDetails}>
        {item.preferredDate && (
          <Text style={styles.detailText}>📅 Scheduled: {item.preferredDate}</Text>
        )}
        <Text style={styles.detailText}>📞 {item.phone}</Text>
        {item.inTime && (
          <Text style={styles.detailText}>🕐 In: {item.inTime}</Text>
        )}
        {item.outTime && (
          <Text style={styles.detailText}>🕐 Out: {item.outTime}</Text>
        )}
      </View>
    </Card>
  );

  // Filter jobs based on search query
  const filterJobs = (jobsList) => {
    if (!searchQuery.trim()) return jobsList;
    const query = searchQuery.toLowerCase();
    return jobsList.filter(
      (job) =>
        job.clientName?.toLowerCase().includes(query) ||
        job.address?.toLowerCase().includes(query) ||
        job.phone?.toLowerCase().includes(query) ||
        job.service?.toLowerCase().includes(query) ||
        job.date?.toLowerCase().includes(query) ||
        job.preferredDate?.toLowerCase().includes(query) ||
        job.inTime?.toLowerCase().includes(query) ||
        job.outTime?.toLowerCase().includes(query)
    );
  };

  const activeJobs = filterJobs(
    jobs.filter((job) => job.status !== JOB_STATUS.COMPLETED && job.status !== 'completed')
  );
  const completedJobs = filterJobs(
    jobs.filter((job) => job.status === JOB_STATUS.COMPLETED || job.status === 'completed')
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BrandLogo
            imageStyle={{ width: 40, height: 40, marginRight: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.welcomeText}>My Jobs</Text>
            <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
          </View>
        </View>
        <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client, address, phone..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeJobs.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedJobs.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Active Jobs</Text>

      <FlatList
        data={activeJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active jobs</Text>
          </View>
        }
      />

      {completedJobs.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.completedTitle]}>Completed Jobs</Text>
          <FlatList
            data={completedJobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Button
          title="My Jobs"
          size="small"
          onPress={() => {}}
          style={styles.footerButton}
        />
        <Button
          title="Profile"
          size="small"
          onPress={() => navigation.navigate('EmployeeProfile')}
          style={styles.footerButton}
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 40,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  completedTitle: {
    marginTop: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default EmployeeDashboardScreen;
