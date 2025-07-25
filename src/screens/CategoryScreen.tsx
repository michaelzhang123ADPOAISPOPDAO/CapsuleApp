import React, { useState, useEffect, useCallback } from 'react';
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
import { Capsule } from '../types';
import { COLORS, EMOTIONS, TYPOGRAPHY, SPACING, LAYOUT } from '../constants';
import Icon from '../components/Icon';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type CategoryScreenProps = StackScreenProps<RootStackParamList, 'Category'>;

const CategoryScreen: React.FC<CategoryScreenProps> = ({ route, navigation }) => {
  const { type } = route.params;
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [filteredCapsules, setFilteredCapsules] = useState<Capsule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadCapsules = useCallback(async () => {
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
  }, [type]);

  const filterAndSort = useCallback(() => {
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
  }, [capsules, searchQuery, sortBy, filterBy, type]);

  useEffect(() => {
    loadCapsules();
  }, [type, loadCapsules]);

  useEffect(() => {
    filterAndSort();
  }, [capsules, searchQuery, sortBy, filterBy, filterAndSort]);

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

  const getIconName = () => {
    switch (type) {
      case 'daily': return 'daily';
      case 'future': return 'future';
      case 'lift': return 'lift';
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
            <Icon name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortBy(sortBy === 'recent' ? 'oldest' : 'recent')}
        >
          <Text style={styles.filterText}>
            {sortBy === 'recent' ? 'Recent' : 'Oldest'}
          </Text>
        </TouchableOpacity>
        
        {getFilterOptions().length > 1 && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={nextFilter}
          >
            <Text style={styles.filterText}>
              {getFilterDisplayText(filterBy)}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        >
          <Icon 
            name={viewMode === 'list' ? 'grid' : 'list'} 
            size={16} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>
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
          <Icon name="back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.navCenter}>
          <Icon name={getIconName()} size={20} color={COLORS.textPrimary} />
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
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
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
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
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
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 50,
    paddingBottom: SPACING.md,
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
    gap: SPACING.xs,
  },
  navTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
  },
  navRight: {
    width: 44,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    ...TYPOGRAPHY.body,
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius,
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
  },
  filterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  stats: {
    alignItems: 'center',
  },
  statsText: {
    ...TYPOGRAPHY.timestamp,
    color: COLORS.textSecondary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.screenPadding,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
});

export default CategoryScreen;