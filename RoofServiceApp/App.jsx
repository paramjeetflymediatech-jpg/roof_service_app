// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setOnUnauthorized } from './src/config/api';
import { COLORS } from './src/utils/constants';

// Auth Context
const AuthContext = createContext(null);
// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function for API interceptor
  const forceLogout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    // Register logout callback with API interceptor
    setOnUnauthorized(forceLogout);
    checkAuthState();
  }, [forceLogout]);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Validate user still exists in backend
        const response = await api.getUserById(parsedUser._id || parsedUser.id);
        if (response.data && response.data.user) {
          // User exists, update with latest data
          const updatedUser = { ...parsedUser, ...response.data.user };
          setUser(updatedUser);
        } else {
          // User not found, logout
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.log('Auth state check error:', error);
      // If API returns 404 or 401, user was deleted or unauthorized
      if (error.response?.status === 404 || error.response?.status === 401) {
        await AsyncStorage.removeItem('user');
        setUser(null);
      } else {
        // For other errors (network issues), use cached user data
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async userData => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import ClientQuoteScreen from './src/screens/ClientQuoteScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminQuotesScreen from './src/screens/AdminQuotesScreen';
import AdminAssignScreen from './src/screens/AdminAssignScreen';
import EmployeeDashboardScreen from './src/screens/EmployeeDashboardScreen';
import EmployeeJobDetailScreen from './src/screens/EmployeeJobDetailScreen';
import EmployeeProfileScreen from './src/screens/EmployeeProfileScreen';
import ClientLeadDetailScreen from './src/screens/ClientLeadDetailScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';

// Stack Navigator
const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isAuthenticated = !!user;

  // Unauthenticated stack: onboarding + auth screens
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  const role = user?.role;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'admin' && isAuthenticated && (
        <>
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
          />
          <Stack.Screen name="AdminQuotes" component={AdminQuotesScreen} />
          <Stack.Screen name="AdminAssign" component={AdminAssignScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        </>
      )}

      {role === 'employee' && isAuthenticated && (
        <>
          <Stack.Screen
            name="EmployeeDashboard"
            component={EmployeeDashboardScreen}
          />
          <Stack.Screen
            name="EmployeeJobDetail"
            component={EmployeeJobDetailScreen}
          />
          <Stack.Screen
            name="EmployeeProfile"
            component={EmployeeProfileScreen}
          />
        </>
      )}

      {role !== 'admin' && role !== 'employee' && isAuthenticated && (
        <>
          <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
          <Stack.Screen name="ClientQuote" component={ClientQuoteScreen} />
          <Stack.Screen
            name="ClientLeadDetail"
            component={ClientLeadDetailScreen}
          />
          <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
