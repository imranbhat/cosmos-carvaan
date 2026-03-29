import { useSellStore, type PhotoSlot } from '../../stores/sellStore';

// Reset store between tests
beforeEach(() => {
  useSellStore.getState().reset();
});

const mockPhotos: PhotoSlot[] = [
  { uri: 'file:///photo1.jpg', position: 0, label: 'Front', uploaded: false },
  { uri: 'file:///photo2.jpg', position: 1, label: 'Back', uploaded: false },
  { uri: 'file:///photo3.jpg', position: 2, label: 'Left', uploaded: true, remoteUrl: 'https://cdn.example.com/photo3.jpg' },
];

describe('sellStore', () => {
  describe('initial state', () => {
    it('should start at step 1', () => {
      expect(useSellStore.getState().currentStep).toBe(1);
    });

    it('should have null makeId', () => {
      expect(useSellStore.getState().makeId).toBeNull();
    });

    it('should have null modelId', () => {
      expect(useSellStore.getState().modelId).toBeNull();
    });

    it('should have null variantId', () => {
      expect(useSellStore.getState().variantId).toBeNull();
    });

    it('should have null year', () => {
      expect(useSellStore.getState().year).toBeNull();
    });

    it('should have null mileage', () => {
      expect(useSellStore.getState().mileage).toBeNull();
    });

    it('should have null condition', () => {
      expect(useSellStore.getState().condition).toBeNull();
    });

    it('should have null color', () => {
      expect(useSellStore.getState().color).toBeNull();
    });

    it('should have 1 owner by default', () => {
      expect(useSellStore.getState().numOwners).toBe(1);
    });

    it('should have empty description', () => {
      expect(useSellStore.getState().description).toBe('');
    });

    it('should have empty photos array', () => {
      expect(useSellStore.getState().photos).toEqual([]);
    });

    it('should have null price', () => {
      expect(useSellStore.getState().price).toBeNull();
    });

    it('should have negotiable set to true', () => {
      expect(useSellStore.getState().negotiable).toBe(true);
    });

    it('should have null city', () => {
      expect(useSellStore.getState().city).toBeNull();
    });

    it('should have no editing listing id', () => {
      expect(useSellStore.getState().editingListingId).toBeNull();
    });
  });

  describe('setStep', () => {
    it('should update current step', () => {
      useSellStore.getState().setStep(2);
      expect(useSellStore.getState().currentStep).toBe(2);
    });

    it('should allow stepping forward and backward', () => {
      useSellStore.getState().setStep(3);
      expect(useSellStore.getState().currentStep).toBe(3);
      useSellStore.getState().setStep(1);
      expect(useSellStore.getState().currentStep).toBe(1);
    });
  });

  describe('updateField', () => {
    it('should update makeId', () => {
      useSellStore.getState().updateField('makeId', 'make-uuid-123');
      expect(useSellStore.getState().makeId).toBe('make-uuid-123');
    });

    it('should update modelId', () => {
      useSellStore.getState().updateField('modelId', 'model-uuid-456');
      expect(useSellStore.getState().modelId).toBe('model-uuid-456');
    });

    it('should update variantId', () => {
      useSellStore.getState().updateField('variantId', 'variant-uuid-789');
      expect(useSellStore.getState().variantId).toBe('variant-uuid-789');
    });

    it('should update year', () => {
      useSellStore.getState().updateField('year', 2022);
      expect(useSellStore.getState().year).toBe(2022);
    });

    it('should update mileage', () => {
      useSellStore.getState().updateField('mileage', 45000);
      expect(useSellStore.getState().mileage).toBe(45000);
    });

    it('should update condition', () => {
      useSellStore.getState().updateField('condition', 'excellent');
      expect(useSellStore.getState().condition).toBe('excellent');
    });

    it('should update color', () => {
      useSellStore.getState().updateField('color', 'Pearl White');
      expect(useSellStore.getState().color).toBe('Pearl White');
    });

    it('should update numOwners', () => {
      useSellStore.getState().updateField('numOwners', 2);
      expect(useSellStore.getState().numOwners).toBe(2);
    });

    it('should update description', () => {
      useSellStore.getState().updateField('description', 'Well maintained car');
      expect(useSellStore.getState().description).toBe('Well maintained car');
    });

    it('should update price', () => {
      useSellStore.getState().updateField('price', 750000);
      expect(useSellStore.getState().price).toBe(750000);
    });

    it('should update negotiable', () => {
      useSellStore.getState().updateField('negotiable', false);
      expect(useSellStore.getState().negotiable).toBe(false);
    });

    it('should update city', () => {
      useSellStore.getState().updateField('city', 'Srinagar');
      expect(useSellStore.getState().city).toBe('Srinagar');
    });
  });

  describe('setPhotos', () => {
    it('should set photos array', () => {
      useSellStore.getState().setPhotos(mockPhotos);
      expect(useSellStore.getState().photos).toEqual(mockPhotos);
    });

    it('should replace existing photos', () => {
      useSellStore.getState().setPhotos(mockPhotos);
      const newPhotos: PhotoSlot[] = [
        { uri: 'file:///new.jpg', position: 0, label: 'Front', uploaded: false },
      ];
      useSellStore.getState().setPhotos(newPhotos);
      expect(useSellStore.getState().photos).toEqual(newPhotos);
      expect(useSellStore.getState().photos).toHaveLength(1);
    });

    it('should allow setting empty photos array', () => {
      useSellStore.getState().setPhotos(mockPhotos);
      useSellStore.getState().setPhotos([]);
      expect(useSellStore.getState().photos).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset all fields to initial values', () => {
      // Set up a draft with data
      useSellStore.getState().setStep(3);
      useSellStore.getState().updateField('makeId', 'make-123');
      useSellStore.getState().updateField('modelId', 'model-456');
      useSellStore.getState().updateField('year', 2022);
      useSellStore.getState().updateField('mileage', 30000);
      useSellStore.getState().updateField('price', 500000);
      useSellStore.getState().setPhotos(mockPhotos);

      // Reset
      useSellStore.getState().reset();

      const state = useSellStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.editingListingId).toBeNull();
      expect(state.makeId).toBeNull();
      expect(state.modelId).toBeNull();
      expect(state.variantId).toBeNull();
      expect(state.year).toBeNull();
      expect(state.mileage).toBeNull();
      expect(state.condition).toBeNull();
      expect(state.price).toBeNull();
      expect(state.photos).toEqual([]);
      expect(state.negotiable).toBe(true);
      expect(state.numOwners).toBe(1);
      expect(state.description).toBe('');
    });
  });

  describe('loadForEdit', () => {
    it('should load listing data for editing', () => {
      useSellStore.getState().loadForEdit({
        listingId: 'listing-abc',
        makeId: 'make-123',
        modelId: 'model-456',
        year: 2021,
        mileage: 25000,
        price: 600000,
        condition: 'good',
        color: 'Silver',
        city: 'Srinagar',
      });

      const state = useSellStore.getState();
      expect(state.editingListingId).toBe('listing-abc');
      expect(state.makeId).toBe('make-123');
      expect(state.modelId).toBe('model-456');
      expect(state.year).toBe(2021);
      expect(state.mileage).toBe(25000);
      expect(state.price).toBe(600000);
      expect(state.condition).toBe('good');
      expect(state.color).toBe('Silver');
      expect(state.city).toBe('Srinagar');
      expect(state.currentStep).toBe(1);
    });

    it('should reset unspecified fields to initial values', () => {
      // First set some data
      useSellStore.getState().updateField('description', 'Old description');
      useSellStore.getState().updateField('numOwners', 3);

      // Load for edit without those fields
      useSellStore.getState().loadForEdit({
        listingId: 'listing-xyz',
        makeId: 'make-999',
      });

      const state = useSellStore.getState();
      expect(state.editingListingId).toBe('listing-xyz');
      expect(state.makeId).toBe('make-999');
      expect(state.description).toBe('');
      expect(state.numOwners).toBe(1);
    });
  });
});
