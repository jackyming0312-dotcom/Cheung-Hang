
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  Timestamp 
} from "firebase/firestore";
import { CommunityLog } from "../types";

// 重要：這裡需要您在 Firebase Console 建立專案後填入您的 Config
// 但為了讓 App 能夠運作，我會實作一個「模擬雲端 (Mock Cloud)」邏輯，
// 這樣當您填入真實 Config 時，它會自動無縫接軌。
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

// 只有在您填入了真實專案 ID 時才初始化 Firebase
const isFirebaseConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let db: any = null;
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

/**
 * 送出心聲到雲端 (跨設備同步核心)
 */
export const syncLogToCloud = async (stationId: string, log: CommunityLog) => {
  if (!db) {
    console.warn("Firebase 未配置，心聲將僅保存在本地。");
    return;
  }

  try {
    const colRef = collection(db, "stations", stationId, "logs");
    await addDoc(colRef, {
      ...log,
      timestamp: Timestamp.now() // 使用伺服器時間確保排序正確
    });
  } catch (e) {
    console.error("雲端同步失敗", e);
  }
};

/**
 * 訂閱雲端即時更新 (Real-time Listener)
 * 這是實現「手機自動看到電腦內容」的關鍵函數
 */
export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};

  const colRef = collection(db, "stations", stationId, "logs");
  const q = query(colRef, orderBy("timestamp", "desc"), limit(50));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            // 將 Firestore Timestamp 轉回 ISO 字串以符合 App 邏輯
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        } as CommunityLog;
    });
    callback(logs);
  }, (error) => {
    console.error("監聽雲端失敗", error);
  });
};

export const checkCloudStatus = () => isFirebaseConfigured;
