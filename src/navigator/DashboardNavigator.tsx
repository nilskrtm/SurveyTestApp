import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../screens/dashboard/OverviewScreen';
import IonIcons from 'react-native-vector-icons/Ionicons';
import SettingsScreen from '../screens/dashboard/SettingsScreen';
import DeviceControllerUtil from '../util/DeviceControllerUtil';
import { useAppSelector } from '../redux/hooks';
import { selectIsDeviceOwner, selectIsVotingsSyncing } from '../redux/generalSlice';
import ChooseSurveyNavigator from './ChooseSurveyNavigator';
import { useFocusEffect } from '@react-navigation/native';
import TimeUtil from '../util/TimeUtil';
import { StyleProp, Text, TextStyle } from 'react-native';
import VotingsScreen from '../screens/dashboard/VotingsScreen';

const HeaderRight: (props: { style?: StyleProp<TextStyle> | undefined }) => React.JSX.Element = (
  props
) => {
  const [dateString, setDateString] = useState(TimeUtil.getDateAsString(new Date()));

  useEffect(() => {
    const refresher: ReturnType<typeof setInterval> = setInterval(() => {
      setDateString(TimeUtil.getDateAsString(new Date()));
    }, 1000);

    return () => clearInterval(refresher);
  }, []);

  return <Text style={props.style}>{dateString}</Text>;
};

const DashboardNavigator: () => React.JSX.Element = () => {
  const Tab = createBottomTabNavigator();

  const isDeviceOwner: boolean = useAppSelector(selectIsDeviceOwner);
  const syncing: boolean = useAppSelector(selectIsVotingsSyncing);

  const tabBarIcon: (name: string, color: string, size: number) => React.JSX.Element = (
    name,
    color,
    size
  ) => {
    return <IonIcons name={name} size={size} color={color} />;
  };

  const headerRight: () => React.JSX.Element = () => {
    return (
      <HeaderRight
        style={{
          color: 'white',
          fontFamily: 'sans-serif-medium',
          fontWeight: '500',
          fontSize: 19,
          marginRight: 15
        }}
      />
    );
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - DashboardNavigator');

    DeviceControllerUtil.stopLockTask();

    return () => {
      console.log('[Lifecycle] Unmount - DashboardNavigator');
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      DeviceControllerUtil.stopLockTask();
    }, [])
  );

  return (
    <Tab.Navigator
      initialRouteName={'OverviewScreen'}
      screenOptions={{
        headerShown: true,
        headerRight: headerRight,
        headerStyle: {
          backgroundColor: '#6404ec'
        },
        headerTintColor: '#FFFFFF',
        headerTitle: 'GBU-SmartData',
        tabBarActiveTintColor: '#6404ec',
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: {
          fontWeight: 'normal'
        },
        unmountOnBlur: false
      }}>
      <Tab.Screen
        name="OverviewScreen"
        component={OverviewScreen}
        options={{
          tabBarLabel: 'Übersicht',
          tabBarIcon: ({ color, size }) => tabBarIcon('home-outline', color, size),
          tabBarBadge: undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }}
      />
      <Tab.Screen
        name="VotingsScreen"
        component={VotingsScreen}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Abstimmungen',
          tabBarItemStyle: syncing ? { opacity: 0.5 } : {},
          tabBarIcon: ({ color, size }) => tabBarIcon('podium-outline', color, size),
          tabBarBadge: undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }}
        listeners={{
          tabPress: (event) => {
            if (syncing) {
              event.preventDefault();
            }
          }
        }}
      />
      <Tab.Screen
        name="ChooseSurveyNavigator"
        component={ChooseSurveyNavigator}
        options={{
          tabBarLabel: 'Umfrage wählen',
          tabBarIcon: ({ color, size }) => tabBarIcon('albums-outline', color, size),
          tabBarBadge: undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }}
      />
      <Tab.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Einstellungen',
          tabBarIcon: ({ color, size }) => tabBarIcon('settings-outline', color, size),
          tabBarBadge: !isDeviceOwner ? '!' : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardNavigator;
