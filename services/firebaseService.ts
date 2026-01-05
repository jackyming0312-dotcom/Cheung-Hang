
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
    // 強制停用本地硬碟快取，改用記憶體快取。這是解決手機/電腦顯示不同步的最有效方法。
    // 這樣可以確保每次讀取都是直接面向雲端資料庫。
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
        createdAt: new Date().toISOString()
    };
    
    if (log.fullCard) {
        p.quote = log.fullCard.quote || "";
        p.luckyItem = log.fullCard.luckyItem || "";
        p.category = log.fullCard.category || "";
        p.relaxationMethod = log.fullCard.relaxationMethod || "";
        p.styleHint = log.fullCard.styleHint || "warm";
    }
    return p;
};

export const syncLogWithRef = async (docRef: any, log: CommunityLog) => {
    if (!db || !docRef) return null;
    try {
        // 使用 serverTimestamp() 確保全球裝置排序一致
        await setDoc(docRef, { 
            ...preparePayload(log), 
            serverTime: serverTimestamp() 
        });
        return docRef.id;
    } catch (e) {
        console.error("Sync Error:", e);
        return null;
    }
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
  // 依據 serverTime 降序排列，獲取最近的 60 筆心聲
  const q = query(colRef, orderBy("serverTime", "desc"), limit(60));
  
  // includeMetadataChanges: true 是為了即時捕捉「待定寫入」，提高同步感
  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // 處理 serverTime 的延遲（還沒同步完成時會是 null，這時用本地 createdAt 墊檔）
        let finalTime;
        if (data.serverTime) {
            finalTime = data.serverTime.toDate().toISOString();
        } else {
            finalTime = data.createdAt || new Date().toISOString();
        }
        
        return { 
            ...data, 
            id: doc.id, 
            timestamp: finalTime, 
            fullCard: data.quote ? {
                quote: data.quote, 
                theme: data.theme, 
                luckyItem: data.luckyItem,
                category: data.category, 
                relaxationMethod: data.relaxationMethod,
                styleHint: data.styleHint || 'warm'
            } : undefined
        } as CommunityLog;
    });
    
    // 如果數據是由本地發出的（hasPendingWrites），則不需要等待伺服器確認，直接顯示
    callback(logs);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
