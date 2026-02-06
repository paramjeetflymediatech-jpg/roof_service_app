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

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const AdminDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | assigned | completed
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
        date: formatDateLocal(item.date || item.created_at || item.createdAt),
        email: item.email || 'N/A',
        preferedDate: formatDateLocal(item.preferredDate || item.prefered_date || item.preferedDate),
        assignedTo:
          item.assignedEmployee?.name ||
          item.assignedTo?.name ||
          item.assigned_to ||
          null,
        employeeStartTime: item.employeeStartTime || null,
        employeeEndTime: item.employeeEndTime || null,
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
    // RootNavigator will switch to the auth stack (Onboarding/Login/Register)
  };

  const filteredQuotes = quotes.filter(quote => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return quote.status === LEAD_STATUS.PENDING;
    if (statusFilter === 'assigned') return quote.status === LEAD_STATUS.ASSIGNED;
    if (statusFilter === 'completed') return quote.status === LEAD_STATUS.COMPLETED;
    return true;
  });

  const renderQuoteItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`${item.clientName} • ${item.address}`}
      status={item.status}
      statusColor={getStatusColor(item.status)}
      onPress={() => navigation.navigate('AdminAssign', { quote: item })}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.quoteClient}>{item.clientName}</Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusPillText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.quoteAddress}>{item.address}</Text>
      <View style={styles.cardDetailsRow}>
        <Text style={styles.detailText}>📅 {item.date}</Text>
        <Text style={styles.detailText}>📞 {item.phone}</Text>
      </View>
      {item.assignedTo && (
        <Text style={styles.assignedText}>👷 Assigned: {item.assignedTo}</Text>
      )}
      {(item.employeeStartTime || item.employeeEndTime) && (
        <Text style={styles.assignedText}>
          🕒 Work Time:{' '}
          {item.employeeStartTime || '--:--'}
          {item.employeeEndTime ? ` - ${item.employeeEndTime}` : ''}
        </Text>
      )}
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

      {/* Filters */}
      <View style={styles.filterRow}>
        <Button
          title="All"
          size="small"
          variant={statusFilter === 'all' ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setStatusFilter('all')}
        />
        <Button
          title="Pending"
          size="small"
          variant={statusFilter === 'pending' ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setStatusFilter('pending')}
        />
        <Button
          title="Assigned"
          size="small"
          variant={statusFilter === 'assigned' ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setStatusFilter('assigned')}
        />
        <Button
          title="Completed"
          size="small"
          variant={statusFilter === 'completed' ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setStatusFilter('completed')}
        />
      </View>

      {/* List */}
      <Text style={styles.sectionTitle}>Quote Requests</Text>

      <FlatList
        data={filteredQuotes}
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
        style={styles.list}
      />

      {/* Footer navigation */}
      <View style={styles.footer}>
        <Button
          title="Dashboard"
          onPress={() => navigation.navigate('AdminDashboard')}
          variant="outline"
          size="small"
          style={styles.footerButton}
        />
        {/* <Button
          title="Quotes"
          onPress={() => navigation.navigate('AdminQuotes', { quote: null })}
          size="small"
          style={styles.footerButton}
        />
        <Button
          title="Assign"
          onPress={() => navigation.navigate('AdminAssign', { quote: null })}
          size="small"
          variant="outline"
          style={styles.footerButton}
        /> */}
        <Button
          title="Users"
          onPress={() => navigation.navigate('AdminUsers')}
          size="small"
          variant="outline"
          style={styles.footerButton}
        />
      </View>
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
    paddingBottom: 70,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '22%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quoteClient: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  quoteAddress: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  assignedText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
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

export default AdminDashboardScreen;
