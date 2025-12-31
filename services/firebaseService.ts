
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { CommunityLog } from "../types";

/**
 * 🛠️ 長亨車站雲端配置
 */
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

export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) return;
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    
    // 🧹 淨化資料：Firebase 不喜歡嵌套太深的物件或含有 undefined 的資料
    const payload = {
        moodLevel: Number(log.moodLevel),
        text: String(log.text || ""),
        theme: String(log.theme || "心情分享"),
        tags: Array.isArray(log.tags) ? log.tags : ["日常"],
        authorSignature: String(log.authorSignature || "匿名旅人"),
        authorColor: String(log.authorColor || "#8d7b68"),
        deviceType: String(log.deviceType || "裝置"),
        stationId: stationId,
        replyMessage: String(log.replyMessage || ""),
        createdAt: new Date().toISOString(),
        serverTime: serverTimestamp()
    };

    // 如果有卡片資料，轉化為單純的文字欄位以提高寫入成功率
    const finalPayload = log.fullCard ? {
        ...payload,
        quote: log.fullCard.quote,
        luckyItem: log.fullCard.luckyItem,
        imageUrl: log.fullCard.imageUrl || ""
    } : payload;

    await addDoc(colRef, finalPayload);
    console.log("✅ [Firebase] 成功寫入雲端");
    return true;
  } catch (e) {
    console.warn("⚠️ [Firebase] 寫入雲端被攔截，請確認 Firestore 規則是否為『測試模式』！", e);
    // 回傳 false 而不拋出錯誤，避免 UI 崩潰
    return false;
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const q = query(colRef, orderBy("createdAt", "desc"), limit(40));

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          // 將打平的資料重新組合回 CommunityLog 格式
          return {
              ...data,
              id: doc.id,
              timestamp: data.createdAt,
              fullCard: data.quote ? {
                  quote: data.quote,
                  theme: data.theme,
                  luckyItem: data.luckyItem,
                  imageUrl: data.imageUrl
              } : undefined
          } as CommunityLog;
      });
      callback(logs);
    }, (err) => {
      console.warn("Firebase Subscribe Warning", err);
    });
  } catch (e) { return () => {}; }
};

export const checkCloudStatus = () => isFirebaseConfigured;
