import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import ContactScreen from '../screens/contact/ContactScreen';
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import AdminLeadsScreen from '../screens/admin/leads/AdminLeadsScreen';

const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      <AdminStack.Screen name="AdminLeads" component={AdminLeadsScreen} options={{ title: 'Leads' }} />
    </AdminStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Services" component={ServicesScreen} />
        <Tab.Screen name="Contact" component={ContactScreen} />
        <Tab.Screen name="Admin" component={AdminStackNavigator} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
