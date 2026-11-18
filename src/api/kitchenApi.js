import apiClient from './client';

/**
 * FR6 - GET /users/{userID}/my-kitchen/{kitchenID}/total-ingredients
 */
export async function getKitchenIngredients(userID, kitchenID) {
  const response = await apiClient.get(
    `/users/${userID}/my-kitchen/${kitchenID}/total-ingredients`
  );
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR5 - GET /users/{userID}/my-kitchen/{kitchenID}/search?query=...
 */
export async function searchIngredients(userID, kitchenID, query) {
  const response = await apiClient.get(
    `/users/${userID}/my-kitchen/${kitchenID}/search`,
    { params: { query } }
  );
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * FR3 - POST /users/{userID}/my-kitchen/{kitchenID}/ingredients
 */
export async function addIngredientToKitchen(userID, kitchenID, ingredientBody) {
  const response = await apiClient.post(
    `/users/${userID}/my-kitchen/${kitchenID}/ingredients`,
    ingredientBody
  );
  return response.data;
}

/**
 * FR4 - POST /users/{userID}/my-kitchen/{kitchenID}/manual-addition
 */
export async function createManualIngredient(userID, kitchenID, manualBody) {
  const response = await apiClient.post(
    `/users/${userID}/my-kitchen/${kitchenID}/manual-addition`,
    manualBody
  );
  return response.data;
}

/**
 * FR8 - PUT /users/{userID}/my-kitchen/{kitchenID}/total-ingredients/{kitchenIngredientID}
 */
export async function updateKitchenIngredient(
  userID,
  kitchenID,
  kitchenIngredientID,
  updatedBody
) {
  const response = await apiClient.put(
    `/users/${userID}/my-kitchen/${kitchenID}/total-ingredients/${kitchenIngredientID}`,
    updatedBody
  );
  return response.data;
}

/**
 * FR7 - DELETE /users/{userID}/my-kitchen/{kitchenID}/total-ingredients/{kitchenIngredientID}
 */
export async function deleteKitchenIngredient(
  userID,
  kitchenID,
  kitchenIngredientID
) {
  const response = await apiClient.delete(
    `/users/${userID}/my-kitchen/${kitchenID}/total-ingredients/${kitchenIngredientID}`
  );
  return response.data;
}

/**
 * FR9 - GET /users/{userID}/notifications?kitchenID=...
 */
export async function getExpirationNotifications(userID, kitchenID) {
  const response = await apiClient.get(`/users/${userID}/notifications`, {
    params: { kitchenID }
  });
  return Array.isArray(response.data) ? response.data : [];
}