import apiClient from './client';

/**
 * FR10 - GET /users/{userID}/for-you?kitchenID=...
 */
export async function getForYouRecipes(userID, kitchenID) {
  const response = await apiClient.get(`/users/${userID}/for-you`, {
    params: { kitchenID }
  });
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR12 & FR13 - GET /users/{userID}/home?query=...&filters=...
 */
export async function searchHomeRecipes(userID, query = '', filters = []) {
  const params = {};
  if (query && query.trim()) params.query = query.trim();
  if (Array.isArray(filters) && filters.length > 0) {
    params.filters = filters.join(',');
  }
  const response = await apiClient.get(`/users/${userID}/home`, { params });
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR20 - GET /discovery?kitchenID=...
 */
export async function getDiscoveryRecipes(kitchenID) {
  const response = await apiClient.get('/discovery', {
    params: { kitchenID }
  });
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR11 - GET /users/{userID}/recipes?kitchenID=...&RecipeID=...
 */
export async function getRecipePreview(userID, kitchenID, recipeID) {
  const response = await apiClient.get(`/users/${userID}/recipes`, {
    params: { kitchenID, RecipeID: recipeID }
  });
  return response.data;
}

/**
 * FR15 - GET /users/{userID}/recipes/{recipeID}?kitchenID=...
 */
export async function getFullRecipe(userID, recipeID, kitchenID) {
  const response = await apiClient.get(`/users/${userID}/recipes/${recipeID}`, {
    params: { kitchenID }
  });
  return response.data;
}

/**
 * FR16 - GET /users/{userID}/recipes/{recipeID}/alternatives?kitchenID=...
 */
export async function getRecipeAlternatives(userID, recipeID, kitchenID) {
  const response = await apiClient.get(
    `/users/${userID}/recipes/${recipeID}/alternatives`,
    { params: { kitchenID } }
  );
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR14 - PUT /users/{userID}/favorites?kitchenID=...
 */
export async function addToFavorites(userID, kitchenID, recipeID) {
  const response = await apiClient.put(
    `/users/${userID}/favorites`,
    { recipeID: Number(recipeID) },
    { params: { kitchenID } }
  );
  return response.data;
}

/**
 * FR21 - PUT /users/{userID}/recipes/{recipeID}/ratings
 */
export async function submitRecipeRating(userID, recipeID, rating) {
  const response = await apiClient.put(
    `/users/${userID}/recipes/${recipeID}/ratings`,
    { rating: Number(rating) }
  );
  return response.data;
}

/**
 * FR17 - POST /users/{userID}/post
 */
export async function submitNewRecipe(userID, recipePayload) {
  const response = await apiClient.post(`/users/${userID}/post`, recipePayload);
  return response.data;
}