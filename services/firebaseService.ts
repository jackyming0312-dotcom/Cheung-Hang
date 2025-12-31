
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

// --- 自動檢測配置狀態 ---

const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "在此貼上您的 apiKey" && 
  firebaseConfig.apiKey.startsWith("AIza");

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🌟 [Firebase] 雲端引擎已啟動。");
  } catch (e) {
    console.error("❌ [Firebase] 初始化失敗", e);
  }
}

export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) {
    console.warn("⚠️ [Firebase] 未偵測到資料庫配置。");
    return;
  }
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    // 移除可能導致序列化失敗的 undefined 欄位
    const cleanLog = JSON.parse(JSON.stringify(log));
    
    const docRef = await addDoc(colRef, {
      ...cleanLog,
      serverTime: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    console.log("✅ [Firebase] 資料已送達雲端。ID:", docRef.id);
    return docRef.id;
  } catch (e: any) {
    console.error("❌ [Firebase] 同步失敗！請檢查 Firestore Rules 是否開啟。", e);
    throw e;
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    // 注意：這裡使用 createdAt 排序以確保「正在同步中」的資料也能排在正確位置
    const q = query(colRef, orderBy("createdAt", "desc"), limit(50));

    // includeMetadataChanges: true 允許本地寫入後立即觸發回調，無需等待伺服器回傳確認
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              timestamp: data.createdAt // 優先使用 ISO 字串確保排序一致性
          } as CommunityLog;
      });
      callback(logs);
    }, (error) => {
      console.error("⚠️ [Firebase] 監聽失敗:", error);
    });
  } catch (e) {
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
