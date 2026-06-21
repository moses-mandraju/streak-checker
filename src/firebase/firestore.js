import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

function assertFirestoreReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase Firestore is not configured yet. Add your environment values and reload the app.')
  }
}

export function habitsCollection(userId) {
  assertFirestoreReady()
  return collection(db, 'users', userId, 'habits')
}

export function habitDocument(userId, habitId) {
  assertFirestoreReady()
  return doc(db, 'users', userId, 'habits', habitId)
}

export function subscribeToHabits(userId, onData, onError) {
  if (!isFirebaseConfigured || !db) {
    onData([])
    return () => {}
  }

  const habitsQuery = query(habitsCollection(userId), orderBy('createdDate', 'desc'))

  return onSnapshot(
    habitsQuery,
    (snapshot) => {
      onData(snapshot.docs.map((habitDoc) => ({ id: habitDoc.id, ...habitDoc.data() })))
    },
    onError,
  )
}

export function createHabitDocument(userId, habit) {
  assertFirestoreReady()
  return addDoc(habitsCollection(userId), habit)
}

export function updateHabitDocument(userId, habitId, updates) {
  assertFirestoreReady()
  return updateDoc(habitDocument(userId, habitId), updates)
}

export function deleteHabitDocument(userId, habitId) {
  assertFirestoreReady()
  return deleteDoc(habitDocument(userId, habitId))
}
