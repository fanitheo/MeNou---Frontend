import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { DEFAULT_USER_ID, DEFAULT_KITCHEN_ID } from '../utils/constants';
import {
  getKitchenIngredients,
  getExpirationNotifications
} from '../api/kitchenApi';
import { addToFavorites } from '../api/recipesApi';

const AppContext = createContext(null);
const STORAGE_KEY = 'menou_session_v1';

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return {
      isAuthenticated: true,
      userID: DEFAULT_USER_ID,
      kitchenID: DEFAULT_KITCHEN_ID,
      username: 'Chef',
      hasProfile: false,
      profileData: null
    };
  });

  const [kitchenIngredients, setKitchenIngredients] = useState([]);
  const [kitchenLoading, setKitchenLoading] = useState(false);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [session]);

  const refreshKitchen = useCallback(async () => {
    if (!session.isAuthenticated) return [];
    setKitchenLoading(true);
    try {
      const items = await getKitchenIngredients(session.userID, session.kitchenID);
      setKitchenIngredients(items);
      return items;
    } catch {
      return [];
    } finally {
      setKitchenLoading(false);
    }
  }, [session.isAuthenticated, session.userID, session.kitchenID]);

  const refreshNotifications = useCallback(async () => {
    if (!session.isAuthenticated) return;
    try {
      const alerts = await getExpirationNotifications(session.userID, session.kitchenID);
      setBackendNotifications(alerts);
    } catch {
      setBackendNotifications([]);
    }
  }, [session.isAuthenticated, session.userID, session.kitchenID]);

  useEffect(() => {
    refreshKitchen();
    refreshNotifications();
  }, [refreshKitchen, refreshNotifications]);

  // AD-8 & S-4: Merge backend expiration alerts with inventory items expiring in 1–3 days
  const notifications = useMemo(() => {
    const merged = [...backendNotifications];
    const existingIds = new Set(merged.map((n) => n.kitchenIngredientID));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    kitchenIngredients.forEach((item) => {
      if (existingIds.has(item.kitchenIngredientID)) return;
      const qtyNum = Number(item.quantity);
      if (Number.isNaN(qtyNum) || qtyNum <= 0 || !item.expirationDate) return;

      const exp = new Date(item.expirationDate);
      if (Number.isNaN(exp.getTime())) return;
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1 && diffDays <= 3) {
        merged.push({
          notificationID: `local-${item.kitchenIngredientID}`,
          kitchenIngredientID: item.kitchenIngredientID,
          message: `${item.ingredientName}: Expires in ${diffDays} day${
            diffDays === 1 ? '' : 's'
          }!`,
          timeSent: new Date().toISOString()
        });
      }
    });

    return merged;
  }, [backendNotifications, kitchenIngredients]);

  const updateSession = (patch) => {
    setSession((prev) => ({ ...prev, ...patch }));
  };

  const logout = () => {
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
  };

  const toggleFavoriteRecipe = async (recipe) => {
    const id = Number(recipe.recipeID);
    await addToFavorites(session.userID, session.kitchenID, id);
    setFavoriteRecipes((prev) => {
      const exists = prev.some((item) => Number(item.recipeID) === id);
      if (exists) {
        return prev.filter((item) => Number(item.recipeID) !== id);
      }
      return [...prev, recipe];
    });
  };

  const isRecipeFavorite = (recipeID) =>
    favoriteRecipes.some((item) => Number(item.recipeID) === Number(recipeID));

  return (
    <AppContext.Provider
      value={{
        session,
        updateSession,
        logout,
        kitchenIngredients,
        setKitchenIngredients,
        kitchenLoading,
        refreshKitchen,
        notifications,
        refreshNotifications,
        favoriteRecipes,
        toggleFavoriteRecipe,
        isRecipeFavorite
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}