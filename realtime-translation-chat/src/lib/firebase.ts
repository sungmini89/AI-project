/**
 * @fileoverview Firebase 설정 및 초기화
 *
 * 이 파일은 Firebase 서비스의 설정과 초기화를 담당합니다.
 * Firestore 데이터베이스, 인증, 에뮬레이터 연결 등을 관리합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

// Firebase v9+ modular SDK 설정 (무료 티어 최적화)
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
} from "firebase/firestore";

/**
 * Firebase 무료 티어 제한사항:
 * - Firestore: 20,000 읽기/일, 20,000 쓰기/일, 1GB 저장
 * - Authentication: 무제한 (익명 로그인)
 * - Hosting: 10GB 대역폭/월
 */

/**
 * Firebase 설정 객체
 * 환경 변수에서 Firebase 프로젝트 설정을 가져옵니다
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
export const app = initializeApp(firebaseConfig);

// 인증 및 Firestore 인스턴스
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * 개발 환경에서 Firebase 에뮬레이터 연결
 *
 * @description
 * VITE_USE_EMULATOR=true 환경 변수가 설정된 경우에만 에뮬레이터를 연결합니다.
 * 실제 Firebase 연결 시에는 에뮬레이터를 사용하지 않습니다.
 */
if (
  import.meta.env.VITE_USE_EMULATOR === "true" &&
  import.meta.env.DEV &&
  !auth.emulatorConfig
) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Firebase 에뮬레이터 연결됨");
  } catch (error) {
    console.warn("Firebase 에뮬레이터 연결 실패:", error);
  }
}

/**
 * Firebase 연결 상태를 확인합니다
 *
 * @description
 * Firestore 데이터베이스에 간단한 읽기 시도를 통해 연결 상태를 테스트합니다.
 *
 * @returns {Promise<boolean>} 연결 성공 시 true, 실패 시 false
 *
 * @example
 * const isConnected = await checkFirebaseConnection();
 * if (isConnected) {
 *   console.log('Firebase에 성공적으로 연결되었습니다');
 * } else {
 *   console.error('Firebase 연결에 실패했습니다');
 * }
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Firestore 연결 테스트 - 간단한 읽기 시도
    const testDoc = doc(db, "test", "connection");
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.error("Firebase 연결 오류:", error);
    return false;
  }
};
