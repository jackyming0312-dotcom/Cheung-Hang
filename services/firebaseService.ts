
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
  enableIndexedDbPersistence,
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
    // 使用高級配置：強制長輪詢解決行動網路連線不穩問題
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      experimentalForceLongPolling: true 
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

/**
 * 核心：資料扁平化處理，確保 Firestore 100% 接受格式
 */
const preparePayload = (log: any) => {
    return {
        moodLevel: Number(log.moodLevel || 50),
        text: String(log.text || "").trim(),
        theme: String(log.theme || "心情分享"),
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: String(log.authorSignature || "長亨旅人"),
        authorColor: String(log.authorColor || "#8d7b68"),
        deviceType: String(log.deviceType || "行動裝置"),
        stationId: "CHEUNG_HANG",
        replyMessage: String(log.replyMessage || ""),
        createdAt: new Date().toISOString(),
        localTimestamp: Date.now(),
        serverTime: serverTimestamp(),
        // 扁平化卡片資料
        card_quote: String(log.fullCard?.quote || ""),
        card_luckyItem: String(log.fullCard?.luckyItem || ""),
        card_category: String(log.fullCard?.category || "情緒共處"),
        card_relaxation: String(log.fullCard?.relaxationMethod || ""),
        card_style: String(log.fullCard?.styleHint || "warm")
    };
};

export const saveLogToCloud = async (log: Omit<CommunityLog, 'id'>) => {
    if (!db) throw new Error("FIREBASE_NOT_INIT");
    
    try {
        const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
        const payload = preparePayload(log);
        const docRef = await addDoc(colRef, payload);
        return docRef.id;
    } catch (e: any) {
        console.error("Cloud Save Detailed Error:", e.code, e.message);
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
  // 增加限制數量以優化手機效能
  const q = query(colRef, orderBy("localTimestamp", "desc"), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            moodLevel: data.moodLevel,
            text: data.text,
            theme: data.theme,
            tags: data.tags,
            authorSignature: data.authorSignature,
            authorColor: data.authorColor,
            deviceType: data.deviceType,
            replyMessage: data.replyMessage,
            timestamp: data.createdAt,
            localTimestamp: data.localTimestamp,
            fullCard: {
                quote: data.card_quote || "",
                theme: data.theme || "",
                luckyItem: data.card_luckyItem || "",
                category: data.card_category || "情緒共處",
                relaxationMethod: data.card_relaxation || "",
                styleHint: data.card_style || 'warm'
            }
        } as CommunityLog;
    });
    callback(logs);
  }, (err) => {
      console.error("Sync Stream Error:", err);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
