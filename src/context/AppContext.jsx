import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_KITCHEN_ID, DEFAULT_USER_ID } from '../utils/constants';
import { getKitchenIngredients, getExpirationNotifications } from '../api/kitchenApi';
import { savePersonalInfo, updatePersonalInfo } from '../api/profileApi';
import { addToFavorites } from '../api/recipesApi';

const AppContext = createContext(null);

function resolveInitialIds() {
  const prevEnvUser = localStorage.getItem('menou_env_userID');
  const prevEnvKitchen = localStorage.getItem('menou_env_kitchenID');
  const currentEnvUser = String(DEFAULT_USER_ID);
  const currentEnvKitchen = String(DEFAULT_KITCHEN_ID);

  if (prevEnvUser !== currentEnvUser || prevEnvKitchen !== currentEnvKitchen) {
    localStorage.setItem('menou_env_userID', currentEnvUser);
    localStorage.setItem('menou_env_kitchenID', currentEnvKitchen);
    localStorage.setItem('menou_userID', currentEnvUser);
    localStorage.setItem('menou_kitchenID', currentEnvKitchen);
    return { uid: DEFAULT_USER_ID, kid: DEFAULT_KITCHEN_ID };
  }

  const savedUser = localStorage.getItem('menou_userID');
  const savedKitchen = localStorage.getItem('menou_kitchenID');
  return {
    uid: savedUser ? Number(savedUser) : DEFAULT_USER_ID,
    kid: savedKitchen ? Number(savedKitchen) : DEFAULT_KITCHEN_ID
  };
}

function getSavedProfile(uid) {
  const saved = localStorage.getItem(`menou_profile_${uid}`);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function getSavedFavorites(uid) {
  const saved = localStorage.getItem(`menou_favorites_${uid}`);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function extractRecipeId(arg1, arg2) {
  for (const candidate of [arg1, arg2]) {
    if (candidate === undefined || candidate === null) continue;
    if (
      typeof candidate === 'object' &&
      ('nativeEvent' in candidate || 'preventDefault' in candidate)
    ) {
      continue;
    }
    if (typeof candidate === 'object' && 'recipeID' in candidate) {
      const id = Number(candidate.recipeID);
      if (!Number.isNaN(id) && id > 0) return id;
    }
    const id = Number(candidate);
    if (!Number.isNaN(id) && id > 0) return id;
  }
  return null;
}

export function AppProvider({ children }) {
  const initialIds = resolveInitialIds();
  const [userID, setUserID] = useState(initialIds.uid);
  const [kitchenID, setKitchenID] = useState(initialIds.kid);

  const [profile, setProfile] = useState(() => getSavedProfile(initialIds.uid));
  const [favorites, setFavorites] = useState(() => getSavedFavorites(initialIds.uid));
  const [kitchenIngredients, setKitchenIngredients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingKitchen, setLoadingKitchen] = useState(false);

  useEffect(() => {
    setProfile(getSavedProfile(userID));
    setFavorites(getSavedFavorites(userID));
  }, [userID]);

  const refreshKitchenIngredients = useCallback(async () => {
    if (!userID || !kitchenID) return [];
    setLoadingKitchen(true);
    try {
      const items = await getKitchenIngredients(userID, kitchenID);
      const safeItems = Array.isArray(items) ? items : [];
      setKitchenIngredients(safeItems);
      return safeItems;
    } catch {
      setKitchenIngredients([]);
      return [];
    } finally {
      setLoadingKitchen(false);
    }
  }, [userID, kitchenID]);

  const refreshNotifications = useCallback(async () => {
    if (!userID || !kitchenID) return [];
    try {
      const list = await getExpirationNotifications(userID, kitchenID);
      const safeList = Array.isArray(list) ? list : [];
      setNotifications(safeList);
      return safeList;
    } catch {
      setNotifications([]);
      return [];
    }
  }, [userID, kitchenID]);

  useEffect(() => {
    refreshKitchenIngredients();
    refreshNotifications();
  }, [refreshKitchenIngredients, refreshNotifications]);

  const dismissNotification = useCallback((notificationID) => {
    setNotifications((prev) =>
      prev.filter((n) => n.notificationID !== notificationID)
    );
  }, []);

  const login = useCallback((newUserId, newKitchenId) => {
    const uid = Number(newUserId);
    const kid = Number(newKitchenId || newUserId);
    localStorage.setItem('menou_userID', String(uid));
    localStorage.setItem('menou_kitchenID', String(kid));
    setUserID(uid);
    setKitchenID(kid);
  }, []);

  const logout = useCallback(() => {
    localStorage.setItem('menou_userID', String(DEFAULT_USER_ID));
    localStorage.setItem('menou_kitchenID', String(DEFAULT_KITCHEN_ID));
    setUserID(DEFAULT_USER_ID);
    setKitchenID(DEFAULT_KITCHEN_ID);
  }, []);

  const saveUserProfile = useCallback(
    async (payload, isUpdate) => {
      const shouldUpdate = typeof isUpdate === 'boolean' ? isUpdate : Boolean(profile);
      let data;
      try {
        data = shouldUpdate
          ? await updatePersonalInfo(userID, payload)
          : await savePersonalInfo(userID, payload);
      } catch {
        data = shouldUpdate
          ? await savePersonalInfo(userID, payload)
          : await updatePersonalInfo(userID, payload);
      }

      localStorage.setItem(`menou_profile_${userID}`, JSON.stringify(payload));
      setProfile(payload);
      return data;
    },
    [userID, profile]
  );

  const syncFavoritesFromRecipes = useCallback(
    (recipesList) => {
      if (!Array.isArray(recipesList) || recipesList.length === 0) return;

      const storageKey = `menou_favorites_${userID}`;
      if (localStorage.getItem(storageKey) !== null) return;

      const filledIds = recipesList
        .filter((r) => r.heartIcon === 'filled')
        .map((r) => Number(r.recipeID));

      localStorage.setItem(storageKey, JSON.stringify(filledIds));
      if (filledIds.length > 0) {
        setFavorites(filledIds);
      }
    },
    [userID]
  );

  const isRecipeFavorite = useCallback(
    (recipeOrId) => {
      if (recipeOrId && typeof recipeOrId === 'object') {
        const id = Number(recipeOrId.recipeID);
        return favorites.includes(id);
      }
      return favorites.includes(Number(recipeOrId));
    },
    [favorites]
  );

  const toggleFavoriteRecipe = useCallback(
    async (arg1, arg2) => {
      const numericId = extractRecipeId(arg1, arg2);
      if (!numericId) return null;

      setFavorites((prev) => {
        const exists = prev.includes(numericId);
        const updated = exists
          ? prev.filter((id) => id !== numericId)
          : [...prev, numericId];
        localStorage.setItem(`menou_favorites_${userID}`, JSON.stringify(updated));
        return updated;
      });

      try {
        return await addToFavorites(userID, kitchenID, numericId);
      } catch {
        return null;
      }
    },
    [userID, kitchenID]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const session = {
    isAuthenticated: Boolean(userID),
    userID,
    kitchenID
  };

  return (
    <AppContext.Provider
      value={{
        session,
        userID,
        kitchenID,
        profile,
        personalInfo: profile,
        hasProfile: Boolean(profile),
        saveUserProfile,
        saveProfile: saveUserProfile,
        kitchenIngredients,
        kitchenItems: kitchenIngredients,
        loadingKitchen,
        refreshKitchenIngredients,
        refreshKitchen: refreshKitchenIngredients,
        notifications,
        unreadCount,
        refreshNotifications,
        dismissNotification,
        favorites,
        favoriteIds: favorites,
        isRecipeFavorite,
        isRecipeFavourite: isRecipeFavorite,
        toggleFavoriteRecipe,
        toggleRecipeFavorite: toggleFavoriteRecipe,
        toggleFavorite: toggleFavoriteRecipe,
        toggleFavorites: toggleFavoriteRecipe,
        toggleFavouriteRecipe: toggleFavoriteRecipe,
        toggleRecipeFavourite: toggleFavoriteRecipe,
        toggleFavourite: toggleFavoriteRecipe,
        handleToggleFavorite: toggleFavoriteRecipe,
        addFavorite: toggleFavoriteRecipe,
        addToFavorites: toggleFavoriteRecipe,
        saveFavorite: toggleFavoriteRecipe,
        syncFavoritesFromRecipes,
        login,
        loginAsUser: login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}