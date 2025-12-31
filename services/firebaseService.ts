
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

const preparePayload = (log: Partial<CommunityLog>) => {
    const p: any = {
        moodLevel: Number(log.moodLevel || 50),
        text: String(log.text || ""),
        theme: String(log.theme || ""),
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: String(log.authorSignature || ""),
        authorColor: String(log.authorColor || ""),
        deviceType: String(log.deviceType || ""),
        stationId: "CHEUNG_HANG",
        replyMessage: String(log.replyMessage || ""),
        createdAt: log.timestamp || new Date().toISOString()
    };
    
    if (log.fullCard) {
        p.quote = log.fullCard.quote || "";
        p.luckyItem = log.fullCard.luckyItem || "";
        p.imageUrl = log.fullCard.imageUrl || "";
        p.category = log.fullCard.category || "";
    }
    return p;
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
        const payload = preparePayload(updates);
        // 移除空值欄位，避免覆蓋掉原本已有的資料
        Object.keys(payload).forEach(key => (payload[key] === "" || payload[key] === null) && delete payload[key]);
        await updateDoc(docRef, payload);
    } catch (e) {
        console.error("Firebase Update Error", e);
    }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  const colRef = collection(db, "stations", stationId, "logs");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(40));

  // 關鍵優化：啟用 includeMetadataChanges，讓本地寫入瞬間反映在 UI 上
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
