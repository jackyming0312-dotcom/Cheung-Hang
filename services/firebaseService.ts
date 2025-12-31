
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { CommunityLog } from "../types";

/**
 * 🛠️ 長亨車站雲端配置 - 已更新為您的專屬金鑰
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
    console.log("🌟 [Firebase] 雲端引擎已啟動，長亨車站已聯網。");
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
      serverTime: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (e: any) {
    console.error("❌ [Firebase] 上傳失敗。請確認 Firestore 是否已開啟『測試模式』！", e);
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const q = query(colRef, orderBy("serverTime", "desc"), limit(50));

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
      console.warn("⚠️ [Firebase] 無法讀取資料，請檢查 Firestore 規則是否為測試模式。");
    });
  } catch (e) {
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
