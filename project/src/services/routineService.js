import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ROUTINES_COLLECTION = 'routines';

const DEFAULT_ROUTINES = [
  { id: 'r1', name: 'Morning Glow', steps: 'Cleanser → Serum → SPF', category: 'skincare' },
  { id: 'r2', name: 'Night Repair', steps: 'Double cleanse → Night cream', category: 'skincare' },
];

/**
 * Saves a user's routines array to Firestore.
 */
export async function syncRoutinesToFirestore(userId, routinesList) {
  if (!userId) return;
  try {
    const routineRef = doc(db, ROUTINES_COLLECTION, userId);
    await setDoc(routineRef, {
      userId,
      items: routinesList.map((r) => ({
        id: String(r.id),
        name: r.name.trim(),
        steps: r.steps.trim(),
        category: r.category || 'skincare',
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing routines to Firestore:', error);
  }
}

/**
 * Retrieves a user's routines array from Firestore.
 * Falls back to DEFAULT_ROUTINES if no custom routines exist yet.
 */
export async function fetchRoutinesFromFirestore(userId) {
  if (!userId) return DEFAULT_ROUTINES;
  try {
    const routineRef = doc(db, ROUTINES_COLLECTION, userId);
    const snap = await getDoc(routineRef);
    if (snap.exists() && snap.data().items) {
      return snap.data().items;
    }
  } catch (error) {
    console.error('Error fetching routines from Firestore:', error);
  }
  return DEFAULT_ROUTINES;
}
