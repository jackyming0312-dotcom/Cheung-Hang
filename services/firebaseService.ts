
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
    // 使用 memoryLocalCache 並確保不保存到磁碟，這能解決手機看到舊資料的問題
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
        theme: String(log.theme || ""),
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: String(log.authorSignature || ""),
        authorColor: String(log.authorColor || ""),
        deviceType: String(log.deviceType || ""),
        stationId: "CHEUNG_HANG",
        replyMessage: String(log.replyMessage || ""),
        createdAt: new Date().toISOString(), // 備用本地時間
        // 內嵌卡片數據，攤平以利於查詢（如果未來需要）
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
            serverTime: serverTimestamp() // 重要：這是跨裝置同步的唯一真實基準
        };
        await setDoc(docRef, payload);
        return docRef.id;
    } catch (e) {
        console.error("Firebase Sync Write Error:", e);
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
  // 依據 serverTime 排序。如果沒有 serverTime，Firestore 預設會放在最前面或最後面
  const q = query(colRef, orderBy("serverTime", "desc"), limit(50));
  
  // { includeMetadataChanges: true } 確保本地修改能立即反映到 UI
  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        // 使用 { serverTimestamps: 'estimate' }。
        // 當 serverTime 還是 null 時（剛發送尚未抵達雲端），這會返回一個估計的時間，
        // 這樣就能保證 log.timestamp 永遠有值，不會在 CommunityBoard 被過濾掉。
        const data = doc.data({ serverTimestamps: 'estimate' });
        
        const finalTime = data.serverTime 
            ? data.serverTime.toDate().toISOString() 
            : data.createdAt;
        
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
