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
import { COLORS, LEAD_STATUS } from '../utils/constants';

// Mock data for admin
const mockQuotes = [
  {
    id: '1',
    clientName: 'John Doe',
    service: 'Roof Repair',
    address: '123 Main St, City',
    status: 'pending',
    date: '2024-01-15',
    phone: '555-0101',
    email: 'john@email.com',
  },
  {
    id: '2',
    clientName: 'Jane Smith',
    service: 'New Roof Installation',
    address: '456 Oak Ave, Town',
    status: 'reviewed',
    date: '2024-01-14',
    phone: '555-0102',
    email: 'jane@email.com',
  },
  {
    id: '3',
    clientName: 'Bob Wilson',
    service: 'Storm Damage',
    address: '789 Pine Rd, Village',
    status: 'approved',
    date: '2024-01-13',
    phone: '555-0103',
    email: 'bob@email.com',
    assignedTo: 'Mike Worker',
  },
];

const AdminDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    reviewed: 0,
    approved: 0,
    assigned: 0,
    completed: 0,
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await api.getLeads();
      setQuotes(mockQuotes);
      calculateStats(mockQuotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      pending: data.filter((q) => q.status === 'pending').length,
      reviewed: data.filter((q) => q.status === 'reviewed').length,
      approved: data.filter((q) => q.status === 'approved').length,
      assigned: data.filter((q) => q.status === 'assigned').length,
      completed: data.filter((q) => q.status === 'completed').length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotes();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case LEAD_STATUS.PENDING:
        return COLORS.warning;
      case LEAD_STATUS.REVIEWED:
        return COLORS.info;
      case LEAD_STATUS.APPROVED:
      case LEAD_STATUS.ASSIGNED:
        return COLORS.success;
      case LEAD_STATUS.COMPLETED:
        return COLORS.primary;
      case LEAD_STATUS.REJECTED:
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderQuoteItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`${item.clientName} • ${item.address}`}
      status={item.status}
      statusColor={getStatusColor(item.status)}
      onPress={() => navigation.navigate('AdminAssign', { quote: item })}
    >
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>📅 {item.date}</Text>
        <Text style={styles.detailText}>📞 {item.phone}</Text>
        {item.assignedTo && (
          <Text style={styles.detailText}>👷 Assigned: {item.assignedTo}</Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Dashboard</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>
        <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.reviewed}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.assigned}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quote Requests</Text>

      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotes yet</Text>
          </View>
        }
      />
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
    width: '22%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
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

export default AdminDashboardScreen;
