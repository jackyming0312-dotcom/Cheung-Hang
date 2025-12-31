
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { CommunityLog } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBEGjXzQ4mWllK9xqBw-W_UzRf4kTmpTSc",
  authDomain: "cheung-hang-18d82.firebaseapp.com",
  projectId: "cheung-hang-18d82",
  storageBucket: "cheung-hang-18d82.firebasestorage.app",
  messagingSenderId: "192349198294",
  appId: "1:192349198294:web:2081a3f233cf20864bb677",
  measurementId: "G-KB7RGYH2C8"
};

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");
let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) { console.error("Firebase Init Error", e); }
}

// 淨化資料格式，確保 Firebase 接受
const preparePayload = (log: Partial<CommunityLog>) => {
    return {
        moodLevel: Number(log.moodLevel || 50),
        text: String(log.text || ""),
        theme: String(log.theme || "同步中..."),
        tags: Array.isArray(log.tags) ? log.tags : ["連線中"],
        authorSignature: String(log.authorSignature || "匿名旅人"),
        authorColor: String(log.authorColor || "#8d7b68"),
        deviceType: String(log.deviceType || "裝置"),
        stationId: "CHEUNG_HANG",
        replyMessage: String(log.replyMessage || ""),
        createdAt: log.timestamp || new Date().toISOString(),
        quote: log.fullCard?.quote || "",
        luckyItem: log.fullCard?.luckyItem || "",
        imageUrl: log.fullCard?.imageUrl || ""
    };
};

export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) return null;
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const docRef = await addDoc(colRef, {
        ...preparePayload(log),
        serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Firebase Write Error", e);
    return null;
  }
};

export const updateLogOnCloud = async (stationId: string, docId: string, updates: Partial<CommunityLog>) => {
    if (!db || !docId) return;
    try {
        const docRef = doc(db, "stations", stationId, "logs", docId);
        await updateDoc(docRef, preparePayload(updates));
    } catch (e) {
        console.error("Firebase Update Error", e);
    }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  const colRef = collection(db, "stations", stationId, "logs");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(30));

  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: data.createdAt,
            fullCard: data.quote ? {
                quote: data.quote,
                theme: data.theme,
                luckyItem: data.luckyItem,
                imageUrl: data.imageUrl,
                category: data.category
            } : undefined
        } as CommunityLog;
    });
    callback(logs);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
