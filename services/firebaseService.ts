
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
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
      localCache: memoryLocalCache()
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

export const getNewLogRef = (stationId: string) => {
    if (!db) return null;
    return doc(collection(db, "stations", stationId, "logs"));
};

const preparePayload = (log: Partial<CommunityLog>) => {
    return {
        moodLevel: Number(log.moodLevel || 50),
        text: String(log.text || ""),
        theme: String(log.theme || "心情筆記"),
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: String(log.authorSignature || "神祕旅人"),
        authorColor: String(log.authorColor || "#8d7b68"),
        deviceType: String(log.deviceType || "未知設備"),
        stationId: "CHEUNG_HANG",
        replyMessage: String(log.replyMessage || ""),
        createdAt: new Date().toISOString(),
        localTimestamp: Date.now(), // 這是跨裝置同步的關鍵排序鍵
        quote: log.fullCard?.quote || "",
        luckyItem: log.fullCard?.luckyItem || "",
        category: log.fullCard?.category || "",
        relaxationMethod: log.fullCard?.relaxationMethod || "",
        styleHint: log.fullCard?.styleHint || "warm"
    };
};

export const syncLogWithRef = async (docRef: any, log: CommunityLog) => {
    if (!db || !docRef) return null;
    try {
        const payload = {
            ...preparePayload(log),
            serverTime: serverTimestamp() 
        };
        await setDoc(docRef, payload);
        return docRef.id;
    } catch (e) {
        console.error("Firebase Write Failed:", e);
        return null;
    }
};

export const deleteLog = async (stationId: string, docId: string) => {
    if (!db || !docId) return;
    try {
        await deleteDoc(doc(db, "stations", stationId, "logs", docId));
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
  // 核心：使用 localTimestamp 降序排列，獲取最新 100 筆，不論日期
  const q = query(colRef, orderBy("localTimestamp", "desc"), limit(100));
  
  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data({ serverTimestamps: 'estimate' });
        
        // 確保 timestamp 永遠存在，優先使用估計的 serverTime，若無則使用 localTimestamp 生成的 ISO
        const finalTime = data.serverTime && typeof data.serverTime.toDate === 'function'
            ? data.serverTime.toDate().toISOString() 
            : data.createdAt || new Date(data.localTimestamp).toISOString();
        
        return { 
            ...data, 
            id: doc.id, 
            timestamp: finalTime, 
            fullCard: {
                quote: data.quote, 
                theme: data.theme, 
                luckyItem: data.luckyItem,
                category: data.category, 
                relaxationMethod: data.relaxationMethod,
                styleHint: data.styleHint || 'warm'
            }
        } as CommunityLog;
    });
    
    callback(logs);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
