import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { CapsuleCard } from '../components/CapsuleCard';
import { EmptyState } from '../components/EmptyState';
import StorageService from '../services/StorageService';
import { Capsule, CapsuleType } from '../types';
import { COLORS, EMOTIONS } from '../constants';
import { formatUnlockDate } from '../utils/dateHelpers';
import Icon from 'react-native-vector-icons/Ionicons';

interface CategoryScreenProps {
  route: {
    params: {
      type: CapsuleType;
    };
  };
  navigation: any;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ route, navigation }) => {
  const { type } = route.params;
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [filteredCapsules, setFilteredCapsules] = useState<Capsule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [filterBy, setFilterBy] = useState<string>('all');

  useEffect(() => {
    loadCapsules();
  }, [type]);

  useEffect(() => {
    filterAndSort();
  }, [capsules, searchQuery, sortBy, filterBy]);

  const loadCapsules = async () => {
    try {
      const data = await StorageService.getCapsulesByType(type);
      
      // Check for unlocked future capsules
      if (type === 'future') {
        const now = Date.now();
        for (const capsule of data) {
          if (!capsule.isUnlocked && capsule.unlockDate && capsule.unlockDate <= now) {
            await StorageService.updateCapsule(capsule.id, { isUnlocked: true });
            capsule.isUnlocked = true;
          }
        }
      }
      
      setCapsules(data);
    } catch (error) {
      console.error('Failed to load capsules:', error);
    }
  };

  const filterAndSort = () => {
    let filtered = [...capsules];
    
    // Search
    if (searchQuery.trim()) {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type-specific filtering
    if (type === 'future' && filterBy !== 'all') {
      filtered = filtered.filter(c => 
        filterBy === 'locked' ? !c.isUnlocked : c.isUnlocked
      );
    } else if (type === 'lift' && filterBy !== 'all') {
      filtered = filtered.filter(c => c.emotion === filterBy);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (type === 'future' && !a.isUnlocked && !b.isUnlocked) {
        // Sort locked future capsules by unlock date
        return (a.unlockDate || 0) - (b.unlockDate || 0);
      }
      return sortBy === 'recent' 
        ? b.createdAt - a.createdAt 
        : a.createdAt - b.createdAt;
    });
    
    setFilteredCapsules(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCapsules();
    setRefreshing(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'daily': return 'Daily Capsules';
      case 'future': return 'Future Capsules';
      case 'lift': return 'Lift Capsules';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'daily': return '📝';
      case 'future': return '📮';
      case 'lift': return '💗';
    }
  };

  const getFilterOptions = () => {
    if (type === 'future') {
      return ['all', 'locked', 'unlocked'];
    } else if (type === 'lift') {
      return ['all', ...EMOTIONS];
    }
    return ['all'];
  };

  const getFilterDisplayText = (filter: string) => {
    if (filter === 'all') return 'All';
    if (filter === 'locked') return 'Locked';
    if (filter === 'unlocked') return 'Unlocked';
    return filter;
  };

  const nextFilter = () => {
    const options = getFilterOptions();
    const current = options.indexOf(filterBy);
    setFilterBy(options[(current + 1) % options.length]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search capsules..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortBy(sortBy === 'recent' ? 'oldest' : 'recent')}
        >
          <Icon 
            name={sortBy === 'recent' ? 'arrow-down' : 'arrow-up'} 
            size={16} 
            color={COLORS.accent} 
          />
          <Text style={styles.filterText}>
            {sortBy === 'recent' ? 'Recent' : 'Oldest'}
          </Text>
        </TouchableOpacity>
        
        {getFilterOptions().length > 1 && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={nextFilter}
          >
            <Icon name="filter" size={16} color={COLORS.accent} />
            <Text style={styles.filterText}>
              {getFilterDisplayText(filterBy)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {filteredCapsules.length} of {capsules.length} capsules
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Navigation Bar */}
      <View style={styles.nav}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color={COLORS.accent} />
        </TouchableOpacity>
        
        <View style={styles.navCenter}>
          <Text style={styles.navIcon}>{getIcon()}</Text>
          <Text style={styles.navTitle}>{getTitle()}</Text>
        </View>
        
        <View style={styles.navRight} />
      </View>
      
      <FlatList
        data={filteredCapsules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CapsuleCard 
            capsule={item} 
            onPress={() => navigation.navigate('Playback', { capsule: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState type={type} searchQuery={searchQuery} />}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  navRight: {
    width: 44,
  },
  header: {
    padding: 20,
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  filterText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default CategoryScreen;