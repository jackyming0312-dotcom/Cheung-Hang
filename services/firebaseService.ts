
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { CommunityLog } from "../types";

// 注意：請確保在您的環境變數或此處填入正確的 Firebase 配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

// 檢查 Firebase 是否已配置 (檢測是否仍為預設預留字串)
const isFirebaseConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.projectId !== "";

let db: any = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase 初始化失敗", e);
  }
}

/**
 * 送出心聲到雲端 (跨設備同步核心)
 */
export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) {
    console.warn("Firebase 未配置，心聲將僅保存在本地設備。");
    return;
  }

  try {
    const colRef = collection(db, "stations", stationId, "logs");
    // 使用 serverTimestamp 確保所有設備的時間線一致，不受本機時間誤差影響
    await addDoc(colRef, {
      ...log,
      serverTime: serverTimestamp() 
    });
  } catch (e) {
    console.error("雲端同步失敗:", e);
  }
};

/**
 * 訂閱雲端即時更新 (這是讓其他設備「立即看見」的關鍵)
 */
export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) {
    console.warn("無法啟動即時同步：Firebase 未連接。");
    return () => {};
  }

  try {
    const colRef = collection(db, "stations", stationId, "logs");
    // 監聽最近的 50 則紀錄，按伺服器時間排序
    const q = query(colRef, orderBy("serverTime", "desc"), limit(50));

    // onSnapshot 會在資料庫有任何變動時立即觸發回呼
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              // 優雅處理時間轉換
              timestamp: data.serverTime ? data.serverTime.toDate().toISOString() : data.timestamp
          } as CommunityLog;
      });
      console.log(`[Firebase] 接收到來自 ${stationId} 的即時更新，共 ${logs.length} 則紀錄。`);
      callback(logs);
    }, (error) => {
      console.error("Firebase 訂閱發生錯誤:", error);
    });
  } catch (e) {
    console.error("設定監聽器失敗:", e);
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
