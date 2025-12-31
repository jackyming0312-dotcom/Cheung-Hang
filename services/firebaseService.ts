
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
    db = initializeFirestore(app, {
      cache: persistentLocalCache({}),
      experimentalForceLongPolling: true 
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

// 預先取得 Doc Reference，用於更穩定的同步
export const getNewLogRef = (stationId: string) => {
    if (!db) return null;
    return doc(collection(db, "stations", stationId, "logs"));
};

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

export const syncLogWithRef = async (docRef: any, log: CommunityLog) => {
    if (!db || !docRef) return null;
    try {
        await setDoc(docRef, { 
            ...preparePayload(log), 
            serverTime: serverTimestamp() 
        });
        return docRef.id;
    } catch (e) {
        return null;
    }
};

export const updateLogOnCloud = async (stationId: string, docId: string, updates: Partial<CommunityLog>) => {
    if (!db || !docId) return;
    try {
        const docRef = doc(db, "stations", stationId, "logs", docId);
        const payload = preparePayload(updates);
        // 清理空值
        Object.keys(payload).forEach(key => (payload[key] === "" || payload[key] === null) && delete payload[key]);
        await updateDoc(docRef, payload);
    } catch (e) { }
};

export const deleteLog = async (stationId: string, docId: string) => {
    if (!db || !docId) return;
    try {
        const docRef = doc(db, "stations", stationId, "logs", docId);
        await deleteDoc(docRef);
    } catch (e) { }
};

export const deleteLogsAfterDate = async (stationId: string, afterIsoStr: string) => {
    if (!db) return 0;
    try {
        const colRef = collection(db, "stations", stationId, "logs");
        const q = query(colRef, where("createdAt", ">=", afterIsoStr));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "stations", stationId, "logs", d.id)));
        await Promise.all(deletePromises);
        return snapshot.size;
    } catch (e) { return 0; }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  const colRef = collection(db, "stations", stationId, "logs");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(60));
  
  // 啟用 includeMetadataChanges: true 讓本地寫入立即觸發 UI 更新
  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, timestamp: data.createdAt, 
            fullCard: data.quote ? {
                quote: data.quote, theme: data.theme, luckyItem: data.luckyItem,
                imageUrl: data.imageUrl, category: data.category, relaxationMethod: data.relaxationMethod
            } : undefined
        } as CommunityLog;
    });
    callback(logs);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
