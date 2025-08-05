import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { persistor } from '../store';
import { clearAllPersistedData, clearPersistedData } from '../store/persistConfig';
import { clearAllState } from '../store/slices/authSlice';

export const usePersistence = () => {
  const dispatch = useDispatch();

  // Clear all persisted data and reset Redux state
  const clearAllData = useCallback(async () => {
    try {
      // Clear Redux state
      dispatch(clearAllState());
      
      // Purge persisted data
      await persistor.purge();
      
      // Clear localStorage manually as backup
      clearAllPersistedData();
      

      return true;
    } catch (error) {
      console.error('Error clearing persisted data:', error);
      return false;
    }
  }, [dispatch]);

  // Clear specific slice data
  const clearSliceData = useCallback(async (sliceKey) => {
    try {
      clearPersistedData(sliceKey);

      return true;
    } catch (error) {
      console.error(`Error clearing data for slice ${sliceKey}:`, error);
      return false;
    }
  }, []);

  // Flush persisted data to storage
  const flushData = useCallback(async () => {
    try {
      await persistor.flush();

      return true;
    } catch (error) {
      console.error('Error flushing persisted data:', error);
      return false;
    }
  }, []);

  // Pause persistence
  const pausePersistence = useCallback(() => {
    persistor.pause();
  }, []);

  // Resume persistence
  const resumePersistence = useCallback(() => {
    persistor.resume();
  }, []);

  // Get persistence status
  const getPersistenceStatus = useCallback(() => {
    return {
      isPaused: persistor.getState().bootstrapped,
      isRehydrated: persistor.getState().bootstrapped,
    };
  }, []);

  return {
    clearAllData,
    clearSliceData,
    flushData,
    pausePersistence,
    resumePersistence,
    getPersistenceStatus,
  };
}; 