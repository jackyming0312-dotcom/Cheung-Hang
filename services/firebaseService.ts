
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
    console.warn("⚠️ [Firebase] 未偵測到資料庫配置，將使用本地存儲。");
    return;
  }
  try {
    console.log(`📤 [Firebase] 正在同步至 stations/${stationId}/logs ...`);
    const colRef = collection(db, "stations", stationId, "logs");
    const docRef = await addDoc(colRef, {
      ...log,
      serverTime: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    console.log("✅ [Firebase] 同步成功！文檔 ID:", docRef.id);
  } catch (e: any) {
    console.error("❌ [Firebase] 同步失敗！可能是因為 Rules 未開啟或網路問題。", e);
    // 拋出錯誤讓 UI 知道失敗了
    throw e;
  }
};

export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, "stations", stationId, "logs");
    // 根據服務器時間排序，最多取 50 條
    const q = query(colRef, orderBy("serverTime", "desc"), limit(50));

    console.log("👂 [Firebase] 開始監聽長亨雲端動態...");
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              // 如果服務器時間還沒算好，先用本地時間墊檔
              timestamp: data.serverTime ? data.serverTime.toDate().toISOString() : data.createdAt
          } as CommunityLog;
      });
      callback(logs);
    }, (error) => {
      console.error("⚠️ [Firebase] 讀取資料失敗，請確認 Firestore 規則是否設為『測試模式』。錯誤碼:", error.code);
    });
  } catch (e) {
    console.error("❌ [Firebase] 訂閱過程發生錯誤", e);
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
