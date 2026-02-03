import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS } from '../utils/constants';

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
      const response = await api.getLeads();
      // Backend returns { items, total, ... }
      const allLeads = response.data?.items || [];
      // Filter to this client's leads if email available
      const clientLeads = user?.email
        ? allLeads.filter(lead => lead.email?.toLowerCase() === user.email.toLowerCase())
        : allLeads;

      const mapped = clientLeads.map(lead => ({
        id: String(lead.id),
        service: lead.serviceType || 'Roof Service',
        address: lead.address || lead.city || 'N/A',
        status: lead.status,
        date: (lead.createdAt || '').slice(0, 10),
        description: lead.message || lead.description || '',
        assignedEmployeeName:
          lead.assignedEmployee?.name || lead.assignedTo?.name || null,
        assignedEmployeePhone:
          lead.assignedEmployee?.phone || lead.assignedTo?.phone || null,
      }));

      setQuotes(mapped);
    } catch (error) {
      console.log('Load quotes error:', error.response || error);
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

  const getStatusColor = status => {
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
    navigation.navigate('Login');
  };

  const renderQuoteItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`${item.address} • ${item.date}`}
      status={item.status}
      statusColor={getStatusColor(item.status)}
    >
      <Text style={styles.description}>{item.description}</Text>
      {item.assignedEmployeeName && (
        <Text style={styles.assignedText}>
          Assigned Employee: {item.assignedEmployeeName}
          {item.assignedEmployeePhone ? ` (${item.assignedEmployeePhone})` : ''}
        </Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name || 'Client'}</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="small"
        />
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
        keyExtractor={item => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotes yet</Text>
            <Text style={styles.emptySubtext}>
              Request a quote to get started
            </Text>
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
    marginTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 20,
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
  assignedText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
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
