import { initializeApp } from "firebase/app";
import {
  getAuth
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  query,
  getDocs,
  deleteDoc,
  where,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { generateWordPair } from "./words";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ---------------- ROOM MANAGEMENT ---------------- */

export async function createRoom(roomId) {
  await setDoc(doc(db, "rooms", roomId), {
    score: [0, 0],
    turn: "blue",
    wordPair: generateWordPair(),
    isGuessing: false,
    createdAt: serverTimestamp(),
  });
}

export async function roomExists(roomId) {
  try {
    const docRef = doc(db, "rooms", roomId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists(); // true/false
  } catch (err) {
    console.error("Error checking room:", err);
    return false;
  }
}

export async function cleanupOldRooms() {
  try {
    const roomsRef = collection(db, "rooms");
    const cutoff = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(roomsRef, where("createdAt", "<", cutoff));
    const snapshot = await getDocs(q);
    const deletes = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "rooms", docSnap.id))
    );
    await Promise.all(deletes);
    console.log(`Deleted ${deletes.length} old room(s)`);
    return deletes.length;
  } catch (err) {
    console.error("Error cleaning old rooms:", err);
    return 0;
  }
}

/* ---------------- LISTENERS ---------------- */

export const listenToRoom = (roomId, callback) => {
  const roomRef = doc(db, "rooms", roomId);
  return onSnapshot(roomRef, callback);
};

/* ---------------- GAME LOGIC ---------------- */

export async function nextGame(roomId) {
  await updateDoc(doc(db, "rooms", roomId), {
    score: [0, 0],
    turn: "blue",
    isGuessing: false,
    wordPair: generateWordPair(),
    updatedAt: serverTimestamp(),
  });
}

export async function startGuess(roomId) {
  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data();
  if (room.isGuessing) return; // someone already guessing

  await updateDoc(ref, { isGuessing: true });
}

export async function submitGuess(roomId, team, guessText) {
  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data();
  const correctWord = team === "blue" ? room.wordPair[0] : room.wordPair[1];

  let score = [...room.score];

  if (guessText.trim().toLowerCase() === correctWord.toLowerCase()) {
    team === "blue" ? score[0]++ : score[1]++;
  } else {
    team === "blue" ? score[1]++ : score[0]++;
  }

  await updateDoc(ref, {
    score,
    wordPair: generateWordPair(),
    isGuessing: false,
    turn: room.turn === "blue" ? "red" : "blue",
  });
}

export async function passTurn(roomId) {
  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data();
  await updateDoc(ref, {
    turn: room.turn === "blue" ? "red" : "blue",
  });
}

export async function awardPoint(roomId, team) {
  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const score = [...snap.data().score];
  team === "blue" ? score[0]++ : score[1]++;

  await updateDoc(ref, {
    score,
    wordPair: generateWordPair(),
    isGuessing: false,
    turn: team,
  });
}
