import apiClient from './client';

/**
 * FR1 - POST /users/{userID}/profile
 */
export async function savePersonalInfo(userID, profilePayload) {
  const response = await apiClient.post(`/users/${userID}/profile`, profilePayload);
  return response.data;
}

/**
 * FR2 - PUT /users/{userID}/profile
 */
export async function updatePersonalInfo(userID, profilePayload) {
  const response = await apiClient.put(`/users/${userID}/profile`, profilePayload);
  return response.data;
}