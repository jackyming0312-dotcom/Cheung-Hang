
import { initializeApp } from "firebase/app";
// Fix: Consolidate Firestore imports to resolve "no exported member" errors which often occur in certain build environments when using multiline imports for sub-packages
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { CommunityLog } from "../types";

/**
 * 🛠️ 長亨車站雲端配置
 * 
 * 操作步驟：
 * 1. 在 Firebase 控制台點擊左上角「齒輪 -> Project settings」
 * 2. 下拉找到「Your apps」，點擊「</>」圖示註冊 App
 * 3. 複製畫面上的 firebaseConfig 物件內容並貼在下方：
 */
const firebaseConfig = {
  apiKey: "在此貼上您的 apiKey",
  authDomain: "在此貼上您的 authDomain",
  projectId: "在此貼上您的 projectId",
  storageBucket: "在此貼上您的 storageBucket",
  messagingSenderId: "在此貼上您的 messagingSenderId",
  appId: "在此貼上您的 appId"
};

// --- 以下代碼請勿改動 ---

const isFirebaseConfigured = 
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
