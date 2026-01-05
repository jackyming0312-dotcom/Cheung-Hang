
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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
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
    // 使用更先進的持久化緩存設置，對 iOS Safari 尤其重要
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

/**
 * 強力保存：確保資料成功發送到雲端
 */
export const saveLogToCloud = async (log: Omit<CommunityLog, 'id'>) => {
    if (!db) return null;
    try {
        const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
        const payload = {
            moodLevel: Number(log.moodLevel),
            text: String(log.text),
            theme: String(log.theme),
            tags: log.tags || [],
            authorSignature: log.authorSignature || "旅人",
            authorColor: log.authorColor || "#8d7b68",
            deviceType: log.deviceType || "行動裝置",
            stationId: "CHEUNG_HANG",
            replyMessage: log.replyMessage || "",
            createdAt: new Date().toISOString(),
            localTimestamp: Date.now(), // 這是解決同步排序的核心
            serverTime: serverTimestamp(),
            quote: log.fullCard?.quote || "",
            luckyItem: log.fullCard?.luckyItem || "",
            category: log.fullCard?.category || "",
            relaxationMethod: log.fullCard?.relaxationMethod || "",
            styleHint: log.fullCard?.styleHint || "warm"
        };
        const docRef = await addDoc(colRef, payload);
        return docRef.id;
    } catch (e) {
        console.error("Firebase Write Error:", e);
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
 * 實時監聽：不論在哪台設備，只要有更新就立刻觸發 callback
 */
export const subscribeToStation = (callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  
  const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
  // 獲取最新的 50 筆紀錄，完全根據時間戳排序
  const q = query(colRef, orderBy("localTimestamp", "desc"), limit(50));
  
  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data, 
            id: doc.id, 
            timestamp: data.createdAt || new Date(data.localTimestamp).toISOString(), 
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
  }, (err) => {
    console.error("Subscription failed:", err);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
