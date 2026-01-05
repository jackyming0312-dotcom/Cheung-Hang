
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
  getDocs
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
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

/**
 * 核心儲存函數：確保資料 100% 寫入
 */
export const saveLogToCloud = async (log: Omit<CommunityLog, 'id'>) => {
    if (!db) {
        console.error("Database not ready");
        return null;
    }
    
    try {
        const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
        
        // 建立完整 Payload，確保所有排序鍵都有值
        const now = Date.now();
        const payload = {
            moodLevel: Number(log.moodLevel),
            text: String(log.text),
            theme: String(log.theme),
            tags: log.tags || [],
            authorSignature: log.authorSignature || "長亨旅人",
            authorColor: log.authorColor || "#8d7b68",
            deviceType: log.deviceType || "行動裝置",
            stationId: "CHEUNG_HANG",
            replyMessage: log.replyMessage || "",
            createdAt: new Date().toISOString(),
            localTimestamp: now, // 強制寫入毫秒時間戳
            serverTime: serverTimestamp(), // 雲端校準
            quote: log.fullCard?.quote || "",
            luckyItem: log.fullCard?.luckyItem || "",
            category: log.fullCard?.category || "",
            relaxationMethod: log.fullCard?.relaxationMethod || "",
            styleHint: log.fullCard?.styleHint || "warm"
        };
        
        // 使用 addDoc 並等待其完成
        const docRef = await addDoc(colRef, payload);
        console.log("Write Success - Document ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Cloud Write FAILED:", e);
        throw e;
    }
};

export const deleteLog = async (docId: string) => {
    if (!db || !docId) return;
    try {
        await deleteDoc(doc(db, "stations", "CHEUNG_HANG", "logs", docId));
    } catch (e) { }
};

/**
 * 實時訂閱：增加容錯與強制排序
 */
export const subscribeToStation = (callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  
  const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
  // 擴大 limit 至 100 筆，確保舊紀錄不會被過早擠掉
  const q = query(colRef, orderBy("localTimestamp", "desc"), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data, 
            id: doc.id, 
            // 優先使用 createdAt 確保時間顯示正確
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
