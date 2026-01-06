
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
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      experimentalForceLongPolling: true 
    });
  } catch (e) { 
    console.error("Firebase Init Error", e); 
  }
}

const preparePayload = (log: any) => {
    return {
        moodLevel: Number(log.moodLevel || 50),
        text: String(log.text || "").trim(),
        theme: String(log.theme || "心情分享"),
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: String(log.authorSignature || "長亨旅人"),
        authorColor: String(log.authorColor || "#FFFFFF"),
        authorIcon: String(log.authorIcon || "Heart"), // 確保裝飾圖標被儲存
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
    const colRef = collection(db, "stations", "CHEUNG_HANG", "logs");
    const payload = preparePayload(log);
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
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
            authorIcon: data.authorIcon || 'Heart',
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
