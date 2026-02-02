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

// Mock data for demo
const mockQuotes = [
  {
    id: '1',
    service: 'Roof Repair',
    address: '123 Main St, City',
    status: 'pending',
    date: '2024-01-15',
    description: 'Leak in the roof after storm',
  },
  {
    id: '2',
    service: 'New Roof Installation',
    address: '456 Oak Ave, Town',
    status: 'approved',
    date: '2024-01-10',
    description: 'Complete roof replacement',
  },
  {
    id: '3',
    service: 'Gutter Cleaning',
    address: '789 Pine Rd, Village',
    status: 'completed',
    date: '2024-01-05',
    description: 'Annual gutter maintenance',
  },
];

const ClientHomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await api.getLeads();
      setQuotes(mockQuotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
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
      case LEAD_STATUS.APPROVED:
      case LEAD_STATUS.ASSIGNED:
        return COLORS.info;
      case LEAD_STATUS.COMPLETED:
        return COLORS.success;
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
      subtitle={`${item.address} • ${item.date}`}
      status={item.status}
      statusColor={getStatusColor(item.status)}
    >
      <Text style={styles.description}>{item.description}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name || 'Client'}</Text>
        </View>
        <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Request New Quote"
          onPress={() => navigation.navigate('ClientQuote')}
          style={styles.actionButton}
        />
      </View>

      <Text style={styles.sectionTitle}>My Quotes</Text>

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
            <Text style={styles.emptySubtext}>Request a quote to get started</Text>
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
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    width: '100%',
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
  description: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default ClientHomeScreen;
