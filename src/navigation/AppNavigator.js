import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions, Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SettingScreen from '../screens/SettingsScreen.js';
import AddPointsScreen from '../screens/AddPointsScreen';
import ClientsList from '../components/ClientList';

const { width: screenWidth } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        animation: 'fade',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 24,
          marginHorizontal: 60,
          elevation: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderRadius: 100,
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          paddingHorizontal: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = require('../../assets/home.png');
          } else if (route.name === 'Settings') {
            iconSource = require('../../assets/settings.png');
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: size,
                height: size,
                tintColor: color,
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
              resizeMode="contain"
            />
          );
        },
      })}
      sceneContainerStyle={{
        backgroundColor: 'transparent',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingScreen} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddPoints" component={AddPointsScreen} />
        <Stack.Screen name="ClientsList" component={ClientsList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
