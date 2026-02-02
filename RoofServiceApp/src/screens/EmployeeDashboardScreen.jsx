import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, JOB_STATUS } from '../utils/constants';

// Mock data for employee jobs
const mockJobs = [
  {
    id: '1',
    service: 'Roof Repair',
    address: '123 Main St, City',
    clientName: 'John Doe',
    phone: '555-0101',
    status: JOB_STATUS.ASSIGNED,
    date: '2024-01-15',
    notes: 'Leak in the roof, check gutters first',
  },
  {
    id: '2',
    service: 'New Roof Installation',
    address: '456 Oak Ave, Town',
    clientName: 'Jane Smith',
    phone: '555-0102',
    status: JOB_STATUS.IN_PROGRESS,
    date: '2024-01-14',
    notes: 'Complete installation, bring extra materials',
    inTime: '09:00 AM',
  },
  {
    id: '3',
    service: 'Gutter Cleaning',
    address: '789 Pine Rd, Village',
    clientName: 'Bob Wilson',
    phone: '555-0103',
    status: JOB_STATUS.COMPLETED,
    date: '2024-01-13',
    notes: 'Annual cleaning done',
    inTime: '08:30 AM',
    outTime: '11:45 AM',
  },
];

const EmployeeDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await api.getEmployeeJobs(user.id);
      setJobs(mockJobs);
    } catch (error) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_STATUS.ASSIGNED:
        return COLORS.info;
      case JOB_STATUS.IN_PROGRESS:
        return COLORS.warning;
      case JOB_STATUS.COMPLETED:
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case JOB_STATUS.ASSIGNED:
        return 'Not Started';
      case JOB_STATUS.IN_PROGRESS:
        return 'In Progress';
      case JOB_STATUS.COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  };

  const handleLogout = async () => {
    await logout();
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
        <Text style={styles.detailText}>📅 {item.date}</Text>
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

  const activeJobs = jobs.filter(
    (job) => job.status !== JOB_STATUS.COMPLETED
  );
  const completedJobs = jobs.filter(
    (job) => job.status === JOB_STATUS.COMPLETED
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>My Jobs</Text>
          <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
        </View>
        <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
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
});

export default EmployeeDashboardScreen;
