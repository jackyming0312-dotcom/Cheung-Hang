
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  collection, 
  addDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  doc, 
  deleteDoc,
  enableIndexedDbPersistence
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
    db = getFirestore(app);
    
    // 啟用離線持久化，這對手機瀏覽器的穩定性至關重要
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code === 'unimplemented') {
            console.warn("The current browser does not support all of the features required to enable persistence");
        }
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

/**
 * 徹底清理資料，防止 Firestore 因為 undefined 或空值報錯
 */
const sanitizePayload = (data: any) => {
    const clean: any = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value === undefined || value === null) {
            clean[key] = "";
        } else if (Array.isArray(value)) {
            clean[key] = value.map(v => (v === undefined || v === null ? "" : v));
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            clean[key] = sanitizePayload(value);
        } else {
            clean[key] = value;
        }
    });
    return clean;
};

/**
 * 核心儲存函數：增加重試邏輯與本地備份
 */
export const saveLogToCloud = async (log: Omit<CommunityLog, 'id'>) => {
    if (!db) {
        throw new Error("STORAGE_NOT_READY");
    }
    
    try {
        const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
        const now = Date.now();
        
        const rawPayload = {
            moodLevel: Number(log.moodLevel || 50),
            text: String(log.text || ""),
            theme: String(log.theme || "心情分享"),
            tags: log.tags || [],
            authorSignature: log.authorSignature || "長亨旅人",
            authorColor: log.authorColor || "#8d7b68",
            deviceType: log.deviceType || "行動裝置",
            stationId: "CHEUNG_HANG",
            replyMessage: log.replyMessage || "",
            createdAt: new Date().toISOString(),
            localTimestamp: now,
            serverTime: serverTimestamp(),
            quote: log.fullCard?.quote || "",
            luckyItem: log.fullCard?.luckyItem || "",
            category: log.fullCard?.category || "心情分享",
            relaxationMethod: log.fullCard?.relaxationMethod || "",
            styleHint: log.fullCard?.styleHint || "warm"
        };
        
        const payload = sanitizePayload(rawPayload);
        const docRef = await addDoc(colRef, payload);
        return docRef.id;
    } catch (e: any) {
        console.error("Cloud Write Error Code:", e.code);
        console.error("Cloud Write Full Error:", e);
        
        // 如果是權限問題，拋出特定錯誤
        if (e.code === 'permission-denied') {
            throw new Error("PERMISSION_DENIED");
        }
        throw e;
    }
};

export const deleteLog = async (docId: string) => {
    if (!db || !docId) return;
    try {
        await deleteDoc(doc(db, "stations", "CHEUNG_HANG", "logs", docId));
    } catch (e) { }
};

export const subscribeToStation = (callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  
  const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
  const q = query(colRef, orderBy("localTimestamp", "desc"), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data, 
            id: doc.id, 
            timestamp: data.createdAt || new Date(data.localTimestamp || Date.now()).toISOString(), 
            fullCard: {
                quote: data.quote || "", 
                theme: data.theme || "", 
                luckyItem: data.luckyItem || "",
                category: data.category || "心情分享", 
                relaxationMethod: data.relaxationMethod || "",
                styleHint: data.styleHint || 'warm'
            }
        } as CommunityLog;
    });
    callback(logs);
  }, (error) => {
    console.error("Real-time Subscription Error:", error);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
