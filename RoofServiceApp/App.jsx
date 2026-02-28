import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setOnUnauthorized } from './src/config/api';
import { COLORS } from './src/utils/constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
        if (response.data && response.data?.data) {
          // User exists, update with latest data
          const updatedUser = { ...parsedUser, ...response.data.data };
          setUser(updatedUser);
        } else {
          // User not found, logout
          await AsyncStorage.removeItem('user');
          Alert.alert('User not found');
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
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import ClientQuoteScreen from './src/screens/ClientQuoteScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
// AdminQuotesScreen removed
import AdminAssignScreen from './src/screens/AdminAssignScreen';
import EmployeeDashboardScreen from './src/screens/EmployeeDashboardScreen';
import EmployeeJobDetailScreen from './src/screens/EmployeeJobDetailScreen';
import EmployeeProfileScreen from './src/screens/EmployeeProfileScreen';
import EmployeeServicesScreen from './src/screens/EmployeeServicesScreen';
import EmployeeGalleryScreen from './src/screens/EmployeeGalleryScreen';
import ClientLeadDetailScreen from './src/screens/ClientLeadDetailScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import AdminProfileScreen from './src/screens/AdminProfileScreen';
import AdminLeadsScreen from './src/screens/AdminLeadsScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminServicesScreen from './src/screens/AdminServicesScreen';
import AdminGalleryScreen from './src/screens/AdminGalleryScreen';
import ClientServicesScreen from './src/screens/ClientServicesScreen';
import ClientGalleryScreen from './src/screens/ClientGalleryScreen';
import ClientMyQuotesScreen from './src/screens/ClientMyQuotesScreen';
import EmployeeMyJobsScreen from './src/screens/EmployeeMyJobsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';
import ClientEstimateScreen from './src/screens/ClientEstimateScreen';
import ClientInvoiceScreen from './src/screens/ClientInvoiceScreen';
import AdminEstimatesScreen from './src/screens/AdminEstimatesScreen';
import AdminCreateEstimateScreen from './src/screens/AdminCreateEstimateScreen';
import AdminInvoicesScreen from './src/screens/AdminInvoicesScreen';
import AdminCreateInvoiceScreen from './src/screens/AdminCreateInvoiceScreen';

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
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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
          <Stack.Screen name="AdminAssign" component={AdminAssignScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
          <Stack.Screen name="AdminLeads" component={AdminLeadsScreen} />
          <Stack.Screen name="AdminServices" component={AdminServicesScreen} />
          <Stack.Screen name="AdminGallery" component={AdminGalleryScreen} />
          <Stack.Screen name="AdminEstimates" component={AdminEstimatesScreen} />
          <Stack.Screen name="AdminCreateEstimate" component={AdminCreateEstimateScreen} />
          <Stack.Screen name="AdminInvoices" component={AdminInvoicesScreen} />
          <Stack.Screen name="AdminCreateInvoice" component={AdminCreateInvoiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="TermsConditions"
            component={TermsConditionsScreen}
          />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
        </>
      )}

      {role === 'employee' && isAuthenticated && (
        <>
          <Stack.Screen
            name="EmployeeDashboard"
            component={EmployeeDashboardScreen}
          />
          <Stack.Screen
            name="EmployeeMyJobs"
            component={EmployeeMyJobsScreen}
          />
          <Stack.Screen
            name="EmployeeJobDetail"
            component={EmployeeJobDetailScreen}
          />
          <Stack.Screen
            name="EmployeeProfile"
            component={EmployeeProfileScreen}
          />
          <Stack.Screen
            name="EmployeeServices"
            component={EmployeeServicesScreen}
          />
          <Stack.Screen
            name="EmployeeGallery"
            component={EmployeeGalleryScreen}
          />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="TermsConditions"
            component={TermsConditionsScreen}
          />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
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
          <Stack.Screen
            name="ClientServices"
            component={ClientServicesScreen}
          />
          <Stack.Screen name="ClientGallery" component={ClientGalleryScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="TermsConditions"
            component={TermsConditionsScreen}
          />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
          <Stack.Screen
            name="ClientMyQuotes"
            component={ClientMyQuotesScreen}
          />
          <Stack.Screen
            name="ClientEstimate"
            component={ClientEstimateScreen}
          />
          <Stack.Screen name="ClientInvoice" component={ClientInvoiceScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
