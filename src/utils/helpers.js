import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZecV2aqggBPU0Cz3uMddPBgYjYEIPxBk",
  authDomain: "arbitro-elite-pro.firebaseapp.com",
  projectId: "arbitro-elite-pro",
  storageBucket: "arbitro-elite-pro.firebasestorage.app",
  messagingSenderId: "68607121848",
  appId: "1:68607121848:web:ddf9877819c067c139974d",
  measurementId: "G-K41JZF3RCP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const storage = getStorage(app);

export const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Se agrega T12:00:00 a las fechas para evitar que la zona horaria retrase el día
export function formatDate(d) {
  if (!d) return "";
  const date = new Date(d + 'T12:00:00'); 
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getBirthdaysThisMonth(athletes) {
  const now = new Date();
  const m = now.getMonth();
  return athletes.filter(a => {
    if (!a.birthDate) return false;
    return new Date(a.birthDate + 'T12:00:00').getMonth() === m;
  });
}

// Lógica corregida para calcular exactamente si el cumpleaños es HOY
export function getDaysUntilBirthday(birthDate) {
  if (!birthDate) return -1;
  const now = new Date();
  const bd = new Date(birthDate + 'T12:00:00');
  
  // ¡Si es el mismo mes y el mismo día, es hoy! Retorna 0.
  if (now.getMonth() === bd.getMonth() && now.getDate() === bd.getDate()) {
    return 0;
  }

  // Si no es hoy, calculamos cuántos días faltan
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());

  if (next < today) {
    next.setFullYear(today.getFullYear() + 1); // Lo pasamos al año que viene
  }

  return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

export function getAge(birthDate) {
  if (!birthDate) return 0;
  const now = new Date();
  const bd = new Date(birthDate + 'T12:00:00');
  let age = now.getFullYear() - bd.getFullYear();
  if (now.getMonth() < bd.getMonth() || (now.getMonth() === bd.getMonth() && now.getDate() < bd.getDate())) age--;
  return age;
}

// ------------------------------------------------------------------
// BASE DE DATOS Y STORAGE
// ------------------------------------------------------------------

export async function loadData(key, fallback) {
  try {
    const docRef = doc(db, "lobos_db", key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || fallback;
    } else {
      return fallback;
    }
  } catch (error) {
    console.error(`Error cargando ${key}:`, error);
    return fallback;
  }
}

export async function saveData(key, val) {
  try {
    const docRef = doc(db, "lobos_db", key);
    await setDoc(docRef, { items: val });
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);
  }
}

export async function uploadFile(file, folder = "general") {
  if (!file) return null;
  const filename = `${generateId()}_${file.name}`;
  const fileRef = storageRef(storage, `${folder}/${filename}`);

  try {
    const snapshot = await uploadBytesResumable(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    return null;
  }
}