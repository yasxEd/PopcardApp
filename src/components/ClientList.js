import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  TextInput 
} from 'react-native';
import { useGetClientsQuery } from '../store/clientsApi';

const { width } = Dimensions.get('window');

const ClientsList = ({ navigation }) => {
  const { data: clients = [], isLoading, isFetching, isError } = useGetClientsQuery();

  // Search state
  const [search, setSearch] = useState('');

  // Filtered clients based on search
  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.trim().toLowerCase();
    return clients.filter(
      c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Avatar color always black, text always white
  const getAvatarColor = () => '#000000';

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.clientCard,
        { transform: [{ scale: 1 }] }
      ]}
      activeOpacity={0.95}
      onPress={() => {
        // Add navigation to client detail if needed
        // navigation.navigate('ClientDetail', { clientId: item.id });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.clientMainInfo}>
          <Text style={styles.clientName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.clientPhone}>{item.phone}</Text>
        </View>
        {/* Remove pointsBadge from here */}
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>@</Text>
            </View>
          </View>
          <Text style={styles.clientInfo} numberOfLines={1}>{item.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.totalVisits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statDivider} />
          {/* Points in place of date of joining */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
        {/* Joining date below, centered */}
        <View style={styles.joinedDateContainer}>
          <Text style={styles.joinedDateText}>
            {item.dateCreated
              ? `Member since ${new Date(item.dateCreated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit',
                })}`
              : 'Member since -'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>Failed to load clients. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo in center, back on left, client count on right */}
      <View style={styles.headerContainer}>
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
          <View style={styles.clientCountContainer}>
            <Text style={styles.clientCountText}>{clients.length}</Text>
          </View>
        </View>
        
        {/* Search input */}
        {clients.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={styles.searchButton}>
              <TextInput
                style={styles.searchText}
                placeholder="Search clients..."
                placeholderTextColor="#888888"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id?.toString() || item.phone}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredClients.length === 0 && styles.emptyListContainer
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>👥</Text>
            </View>
            <Text style={styles.emptyTitle}>No clients yet</Text>
            <Text style={styles.emptyText}>Start adding clients to see them here</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add First Client</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    // Remove borderRadius and backgroundColor for no circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
    marginRight: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 48,
  },
  clientCountContainer: {
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clientCountText: {
    fontSize: 18,
    fontWeight: '400', // Make it a bit not bold
    color: '#000000',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchText: {
    fontSize: 16,
    color: '#888888',
    flex: 1,
  },

  // List Styles
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Card Styles
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#000000',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  clientMainInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 15,
    color: '#222222',
    fontWeight: '500',
  },
  pointsBadge: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 20,
  },

  cardBody: {
    padding: 20,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
  },
  clientInfo: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
  },
  joinedDateContainer: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedDateText: {
    fontSize: 14,
    color: '#888888', // more greyish
    fontWeight: '400',
    textAlign: 'center',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#222222',
    marginTop: 16,
    fontWeight: '500',
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#222222',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty States
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
    color: '#000000',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#222222',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClientsList;