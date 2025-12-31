
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
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
  } catch (e) { console.error("Firebase Init Error", e); }
}

export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) return;
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    
    // 🔥 重要：平整化資料以確保 Firebase 能夠順利解析
    const payload = {
        moodLevel: log.moodLevel,
        text: log.text || "",
        theme: log.theme || "心情分享",
        tags: Array.isArray(log.tags) ? log.tags : [],
        authorSignature: log.authorSignature || "匿名旅人",
        authorColor: log.authorColor || "#8d7b68",
        deviceType: log.deviceType || "手機",
        stationId: stationId,
        replyMessage: log.replyMessage || "",
        createdAt: new Date().toISOString(),
        serverTime: serverTimestamp(),
        // 將複雜物件轉為 JSON 字串存儲，避免嵌套深度過大
        cardJson: log.fullCard ? JSON.stringify(log.fullCard) : null
    };

    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (e) {
    console.error("🔥 [Firebase] 寫入雲端失敗，請確認資料庫 Rules！", e);
    throw e;
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const q = query(colRef, orderBy("createdAt", "desc"), limit(50));

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          let fullCard = null;
          if (data.cardJson) {
              try { fullCard = JSON.parse(data.cardJson); } catch(e) {}
          }
          return {
              ...data,
              id: doc.id,
              fullCard: fullCard,
              timestamp: data.createdAt
          } as CommunityLog;
      });
      callback(logs);
    }, (err) => {
      console.error("Firebase Subscribe Error", err);
    });
  } catch (e) { return () => {}; }
};

export const checkCloudStatus = () => isFirebaseConfigured;
