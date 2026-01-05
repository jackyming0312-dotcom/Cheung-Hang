
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
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
    // 移除 persistentLocalCache，確保所有裝置看到的都是最新的雲端即時數據
    db = getFirestore(app);
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
        // createdAt 僅作為備份，排序應優先使用 serverTime
        createdAt: log.timestamp || new Date().toISOString()
    };
    
    if (log.fullCard) {
        p.quote = log.fullCard.quote || "";
        p.luckyItem = log.fullCard.luckyItem || "";
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
            // 強制使用伺服器時間，這是跨裝置同步成功的關鍵
            serverTime: serverTimestamp() 
        });
        return docRef.id;
    } catch (e) {
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
  // 優先使用 serverTime 進行排序，解決裝置間時間不對稱問題
  const q = query(colRef, orderBy("serverTime", "desc"), limit(60));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        // 如果 serverTime 尚未生成（還在傳輸中），回退到本地 createdAt
        const finalTime = data.serverTime ? data.serverTime.toDate().toISOString() : data.createdAt;
        
        return { 
            ...data, 
            id: doc.id, 
            timestamp: finalTime, 
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
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
