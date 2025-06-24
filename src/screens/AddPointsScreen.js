import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import ClientInfo from '../components/ClientInfo';
import { useAddPointsToClientMutation, useScanClientMutation } from '../store/clientsApi';
import { useDispatch, useSelector } from 'react-redux';
import { clientsApi } from '../store/clientsApi';

const AddPointsScreen = ({ navigation, route }) => {
  const [addPoints, { isLoading }] = useAddPointsToClientMutation();
  const [scanClient] = useScanClientMutation();
  const [client, setClient] = useState(route?.params?.client || null);
  const [fetching, setFetching] = useState(!route?.params?.client);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    // Only scan if no client is passed via params
    if (!client) {
      setFetching(true);
      scanClient()
        .unwrap()
        .then(data => {
          if (isMounted) {
            setClient(data);
            setFetching(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            Alert.alert('Error', 'Failed to fetch client. Please try again.');
            setFetching(false);
          }
        });
    } else {
      setFetching(false);
    }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPoints = async (pointsToAdd) => {
    try {
      const result = await addPoints({
        id: client.id,
        points: pointsToAdd,
      }).unwrap();

      // Optionally update local client state for immediate UI feedback
      setClient(prev => ({
        ...prev,
        points: result.points,
        totalVisits: result.totalVisits,
      }));

      // Get the latest client from cache after mutation
      const state = dispatch((_, getState) => getState());
      const updatedClient =
        client?.id
          ? clientsApi.endpoints.getClientById.select(client.id)(state)?.data
          : null;

      const totalPoints =
        updatedClient && typeof updatedClient.points === 'number'
          ? updatedClient.points
          : result.points;

      navigation.navigate('MainTabs', {
        screen: 'Home',
        params: {
          success: true,
          pointsAdded: pointsToAdd,
          totalPoints,
        },
      });

      return result; // So ClientInfo can update local state if needed
    } catch (error) {
      Alert.alert('Error', 'Failed to add points. Please try again.');
      console.error('Add points failed:', error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row: Back Icon + Logo */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* Spacer to balance row */}
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {fetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#000" />
            <Text>Loading client...</Text>
          </View>
        ) : (
          <ClientInfo
            client={client}
            onAddPoints={handleAddPoints}
            addPointsLoading={isLoading}
            // onPointsAdded={...} // Optionally pass if you want to do more
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 18,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
    marginLeft: 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 100, // 5% smaller than 120
    height: 38, // 5% smaller than 40
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 0,
  },
});

export default AddPointsScreen;