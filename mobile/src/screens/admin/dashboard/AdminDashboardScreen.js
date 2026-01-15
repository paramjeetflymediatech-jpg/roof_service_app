import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

function AdminDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.text}>This is a simple admin area. You can extend it later.</Text>
      <View style={{ height: 12 }} />
      <Button title="View Leads" onPress={() => navigation.navigate('AdminLeads')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4b5563',
  },
});

export default AdminDashboardScreen;
