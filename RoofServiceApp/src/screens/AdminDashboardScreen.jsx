import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS } from '../utils/constants';

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
      const response = await api.getLeads();

      console.log('Leads API response:', response.data);

      const rawItems =
        response.data?.items ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      const normalizedItems = rawItems.map(item => ({
        id: item.id || item._id || item.lead_id,
        clientName: item.clientName || item.client_name || item.name || 'N/A',
        service: item.serviceType || item.service_name || 'N/A',
        address: item.address || 'N/A',
        phone: item.phone || item.phone_number || 'N/A',
        status: item.status || LEAD_STATUS.PENDING,
        date:
          item.date ||
          item.created_at?.split('T')[0] ||
          new Date().toISOString().split('T')[0],
        assignedTo:
          item.assignedEmployee?.name ||
          item.assignedTo?.name ||
          item.assigned_to ||
          null,
        // Completion info for admin review
        inTime: item.inTime || null,
        outTime: item.outTime || null,
        employeeNotes: item.employeeNotes || null,
        completionImages: item.completionImages || null,
      }));

      setQuotes(normalizedItems);
      calculateStats(normalizedItems);
    } catch (error) {
      console.log('Admin load quotes error:', error);
      Alert.alert('Error', 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = data => {
    setStats({
      pending: data.filter(q => q.status === LEAD_STATUS.PENDING).length,
      reviewed: data.filter(q => q.status === LEAD_STATUS.REVIEWED).length,
      approved: data.filter(q => q.status === LEAD_STATUS.APPROVED).length,
      assigned: data.filter(q => q.status === LEAD_STATUS.ASSIGNED).length,
      completed: data.filter(q => q.status === LEAD_STATUS.COMPLETED).length,
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuotes();
    setRefreshing(false);
  }, []);

  const getStatusColor = status => {
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
    navigation.replace('Login');
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
          <Text style={styles.detailText}>
            👷 Assigned: {item.assignedTo}
          </Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Dashboard</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="small"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Reviewed" value={stats.reviewed} />
        <StatCard label="Assigned" value={stats.assigned} />
        <StatCard label="Done" value={stats.completed} />
      </View>

      {/* List */}
      <Text style={styles.sectionTitle}>Quote Requests</Text>

      <FlatList
        data={quotes}
        keyExtractor={(item, index) =>
          item.id?.toString() || index.toString()
        }
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quotes found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

/* ---------- Small Components ---------- */

const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 40,
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
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
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
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default AdminDashboardScreen;
