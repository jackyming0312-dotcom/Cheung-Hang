
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

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

// 檢查 Firebase 是否已配置
const isFirebaseConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID";

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
    console.warn("Firebase 未配置，心聲將僅保存在本地。");
    return;
  }

  try {
    const colRef = collection(db, "stations", stationId, "logs");
    await addDoc(colRef, {
      ...log,
      timestamp: Timestamp.now()
    });
  } catch (e) {
    console.error("雲端同步失敗", e);
  }
};

/**
 * 訂閱雲端即時更新
 */
export const subscribeToStation = (stationId: string, callback: (logs: CommunityLog[]) => void) => {
  if (!db) return () => {};

  try {
    const colRef = collection(db, "stations", stationId, "logs");
    const q = query(colRef, orderBy("timestamp", "desc"), limit(50));

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
          } as CommunityLog;
      });
      callback(logs);
    }, (error) => {
      console.error("監聽雲端失敗", error);
    });
  } catch (e) {
    console.error("設定監聽器失敗", e);
    return () => {};
  }
};

export const checkCloudStatus = () => isFirebaseConfigured;
