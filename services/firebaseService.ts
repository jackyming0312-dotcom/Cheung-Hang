
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  collection, 
  setDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  where 
} from "firebase/firestore";
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
    
    // 移除 persistentMultipleTabManager()
    // 多頁籤管理在行動版 Safari 的隱私模式或特定背景運行時常導致 IndexedDB 鎖死
    // 使用基礎 persistentLocalCache() 即可支援手機端的離線儲存
    db = initializeFirestore(app, {
      cache: persistentLocalCache({}),
      experimentalForceLongPolling: true 
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
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
        p.relaxationMethod = log.fullCard.relaxationMethod || "";
    }
    return p;
};

/**
 * 寫入雲端。因為開啟了離線快取，此操作會立即在本地完成，伺服器同步在背景進行。
 */
export const syncLogToCloud = async (stationId: string, log: CommunityLog): Promise<string | null> => {
  if (!db) return null;
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const newDocRef = doc(colRef); 
    const docId = newDocRef.id;
    
    await setDoc(newDocRef, {
        ...preparePayload(log),
        serverTime: serverTimestamp()
    });
    
    return docId;
  } catch (e) {
    console.error("Firebase Write Error:", e);
    return null;
  }
};

export const updateLogOnCloud = async (stationId: string, docId: string, updates: Partial<CommunityLog>) => {
    if (!db || !docId) return;
    try {
        const docRef = doc(db, "stations", stationId, "logs", docId);
        const payload = preparePayload(updates);
        Object.keys(payload).forEach(key => (payload[key] === "" || payload[key] === null) && delete payload[key]);
        await updateDoc(docRef, payload);
    } catch (e) {
        console.error("Firebase Update Error:", e);
    }
};

export const deleteLogsBefore = async (stationId: string, beforeIsoStr: string) => {
    if (!db) return 0;
    try {
        const colRef = collection(db, "stations", stationId, "logs");
        const q = query(colRef, where("createdAt", "<", beforeIsoStr));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "stations", stationId, "logs", d.id)));
        await Promise.all(deletePromises);
        return snapshot.size;
    } catch (e) {
        console.error("Firebase Delete Error:", e);
        return 0;
    }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  const colRef = collection(db, "stations", stationId, "logs");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(60));

  return onSnapshot(q, (snapshot) => {
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
                category: data.category,
                relaxationMethod: data.relaxationMethod
            } : undefined
        } as CommunityLog;
    });
    callback(logs);
  }, (err) => {
    console.warn("Firestore Snapshot error (expected when offline):", err);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
