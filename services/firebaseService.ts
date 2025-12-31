
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { CommunityLog } from "../types";

/**
 * 🛠️ 跨手機同步執行指南：
 * 
 * 1. 請將您在 Firebase 控制台「專案設定」中取得的 Config 貼在下方。
 * 2. 務必確認 Firestore Database 已經開啟「Test Mode」。
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // 👈 從 Firebase 複製 API Key 貼到這裡
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID", // 👈 貼上您的專案 ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 偵測是否已成功配置
const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.apiKey.startsWith("AIza");

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🚀 [Firebase] 雲端同步模式已啟動。");
  } catch (e) {
    console.error("❌ [Firebase] 初始化失敗", e);
  }
}

export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) return;
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    await addDoc(colRef, {
      ...log,
      serverTime: serverTimestamp(), // 使用伺服器時間確保同步順序一致
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("[Firebase] 上傳失敗:", e);
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const q = query(colRef, orderBy("serverTime", "desc"), limit(50));

    // 即時監聽：當 A 手機留言，B 手機的畫面會自動更新
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              timestamp: data.serverTime ? data.serverTime.toDate().toISOString() : data.createdAt
          } as CommunityLog;
      });
      callback(logs);
    }, (error) => {
      console.error("[Firebase] 監聽失敗 (請確認資料庫已設為 Test Mode):", error);
    });
  } catch (e) {
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
