import { useFilterStore, type SortOption } from '../../stores/filterStore';

// Reset store between tests
beforeEach(() => {
  useFilterStore.getState().resetFilters();
});

describe('filterStore', () => {
  describe('initial state', () => {
    it('should have empty makes array', () => {
      expect(useFilterStore.getState().makes).toEqual([]);
    });

    it('should have empty models array', () => {
      expect(useFilterStore.getState().models).toEqual([]);
    });

    it('should have default year range', () => {
      const [min, max] = useFilterStore.getState().yearRange;
      expect(min).toBe(2000);
      expect(max).toBe(new Date().getFullYear() + 1);
    });

    it('should have default price range 0 to 1,000,000', () => {
      expect(useFilterStore.getState().priceRange).toEqual([0, 1_000_000]);
    });

    it('should have default mileage range 0 to 300,000', () => {
      expect(useFilterStore.getState().mileageRange).toEqual([0, 300_000]);
    });

    it('should default sortBy to newest', () => {
      expect(useFilterStore.getState().sortBy).toBe('newest');
    });

    it('should have null transmission', () => {
      expect(useFilterStore.getState().transmission).toBeNull();
    });

    it('should have null city', () => {
      expect(useFilterStore.getState().city).toBeNull();
    });

    it('should have null query', () => {
      expect(useFilterStore.getState().query).toBeNull();
    });
  });

  describe('setFilter', () => {
    it('should set makes', () => {
      useFilterStore.getState().setFilter('makes', ['Toyota', 'Honda']);
      expect(useFilterStore.getState().makes).toEqual(['Toyota', 'Honda']);
    });

    it('should set models', () => {
      useFilterStore.getState().setFilter('models', ['Corolla']);
      expect(useFilterStore.getState().models).toEqual(['Corolla']);
    });

    it('should set price range', () => {
      useFilterStore.getState().setFilter('priceRange', [100_000, 500_000]);
      expect(useFilterStore.getState().priceRange).toEqual([100_000, 500_000]);
    });

    it('should set year range', () => {
      useFilterStore.getState().setFilter('yearRange', [2015, 2024]);
      expect(useFilterStore.getState().yearRange).toEqual([2015, 2024]);
    });

    it('should set mileage range', () => {
      useFilterStore.getState().setFilter('mileageRange', [0, 50_000]);
      expect(useFilterStore.getState().mileageRange).toEqual([0, 50_000]);
    });

    it('should set transmission', () => {
      useFilterStore.getState().setFilter('transmission', 'automatic');
      expect(useFilterStore.getState().transmission).toBe('automatic');
    });

    it('should set city', () => {
      useFilterStore.getState().setFilter('city', 'Srinagar');
      expect(useFilterStore.getState().city).toBe('Srinagar');
    });

    it('should set sortBy', () => {
      const options: SortOption[] = ['price_asc', 'price_desc', 'newest', 'mileage', 'year'];
      for (const option of options) {
        useFilterStore.getState().setFilter('sortBy', option);
        expect(useFilterStore.getState().sortBy).toBe(option);
      }
    });

    it('should set body types', () => {
      useFilterStore.getState().setFilter('bodyTypes', ['SUV', 'Sedan']);
      expect(useFilterStore.getState().bodyTypes).toEqual(['SUV', 'Sedan']);
    });

    it('should set fuel types', () => {
      useFilterStore.getState().setFilter('fuelTypes', ['Petrol', 'Diesel']);
      expect(useFilterStore.getState().fuelTypes).toEqual(['Petrol', 'Diesel']);
    });

    it('should set colors', () => {
      useFilterStore.getState().setFilter('colors', ['White', 'Black']);
      expect(useFilterStore.getState().colors).toEqual(['White', 'Black']);
    });

    it('should set query', () => {
      useFilterStore.getState().setFilter('query', 'swift dzire');
      expect(useFilterStore.getState().query).toBe('swift dzire');
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to initial state', () => {
      // Set various filters
      useFilterStore.getState().setFilter('makes', ['Maruti']);
      useFilterStore.getState().setFilter('city', 'Delhi');
      useFilterStore.getState().setFilter('sortBy', 'price_asc');
      useFilterStore.getState().setFilter('transmission', 'manual');
      useFilterStore.getState().setFilter('priceRange', [50_000, 200_000]);

      // Reset
      useFilterStore.getState().resetFilters();

      const state = useFilterStore.getState();
      expect(state.makes).toEqual([]);
      expect(state.city).toBeNull();
      expect(state.sortBy).toBe('newest');
      expect(state.transmission).toBeNull();
      expect(state.priceRange).toEqual([0, 1_000_000]);
    });
  });

  describe('activeFilterCount', () => {
    it('should return 0 for default state', () => {
      expect(useFilterStore.getState().activeFilterCount()).toBe(0);
    });

    it('should count makes as one filter', () => {
      useFilterStore.getState().setFilter('makes', ['Toyota']);
      expect(useFilterStore.getState().activeFilterCount()).toBe(1);
    });

    it('should count each changed filter category', () => {
      useFilterStore.getState().setFilter('makes', ['Toyota']);
      useFilterStore.getState().setFilter('city', 'Mumbai');
      useFilterStore.getState().setFilter('transmission', 'automatic');
      expect(useFilterStore.getState().activeFilterCount()).toBe(3);
    });

    it('should count modified price range as one filter', () => {
      useFilterStore.getState().setFilter('priceRange', [100_000, 500_000]);
      expect(useFilterStore.getState().activeFilterCount()).toBe(1);
    });

    it('should count modified year range as one filter', () => {
      useFilterStore.getState().setFilter('yearRange', [2018, 2024]);
      expect(useFilterStore.getState().activeFilterCount()).toBe(1);
    });

    it('should count modified mileage range as one filter', () => {
      useFilterStore.getState().setFilter('mileageRange', [0, 50_000]);
      expect(useFilterStore.getState().activeFilterCount()).toBe(1);
    });

    it('should not count sortBy or query as active filters', () => {
      useFilterStore.getState().setFilter('sortBy', 'price_asc');
      useFilterStore.getState().setFilter('query', 'honda city');
      expect(useFilterStore.getState().activeFilterCount()).toBe(0);
    });

    it('should count all categories when all filters are active', () => {
      useFilterStore.getState().setFilter('makes', ['Toyota']);
      useFilterStore.getState().setFilter('models', ['Fortuner']);
      useFilterStore.getState().setFilter('yearRange', [2018, 2024]);
      useFilterStore.getState().setFilter('priceRange', [500_000, 900_000]);
      useFilterStore.getState().setFilter('mileageRange', [0, 50_000]);
      useFilterStore.getState().setFilter('bodyTypes', ['SUV']);
      useFilterStore.getState().setFilter('fuelTypes', ['Diesel']);
      useFilterStore.getState().setFilter('transmission', 'automatic');
      useFilterStore.getState().setFilter('colors', ['White']);
      useFilterStore.getState().setFilter('city', 'Srinagar');
      useFilterStore.getState().setFilter('numOwners', 1);
      useFilterStore.getState().setFilter('inspectionStatus', 'verified');
      expect(useFilterStore.getState().activeFilterCount()).toBe(12);
    });
  });
});
