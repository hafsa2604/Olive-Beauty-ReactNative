import { apiClient } from './apiClient';

/**
 * Saves a user's routines array to Firestore via the REST API.
 */
export async function syncRoutinesToFirestore(userId, routinesList) {
  if (!userId) return;
  try {
    const payload = {
      routines: routinesList.map((r) => ({
        id: String(r.id),
        name: r.name.trim(),
        steps: r.steps.trim(),
        category: r.category || 'skincare',
      }))
    };
    return await apiClient.post(`/api/routines/${userId}`, payload);
  } catch (error) {
    console.error('API syncRoutinesToFirestore error:', error);
  }
}

/**
 * Retrieves a user's routines array from Firestore via the REST API.
 */
export async function fetchRoutinesFromFirestore(userId) {
  if (!userId) {
    return [
      { id: 'r1', name: 'Morning Glow', steps: 'Cleanser → Serum → SPF', category: 'skincare' },
      { id: 'r2', name: 'Night Repair', steps: 'Double cleanse → Night cream', category: 'skincare' },
    ];
  }
  
  try {
    return await apiClient.get(`/api/routines/${userId}`);
  } catch (error) {
    console.error('API fetchRoutinesFromFirestore error:', error);
  }

  return [
    { id: 'r1', name: 'Morning Glow', steps: 'Cleanser → Serum → SPF', category: 'skincare' },
    { id: 'r2', name: 'Night Repair', steps: 'Double cleanse → Night cream', category: 'skincare' },
  ];
}
