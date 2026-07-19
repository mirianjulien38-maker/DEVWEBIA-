import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from 'firebase/firestore';

// Interface representing our database schema
export interface DbUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  credits: number;
  tokensUsed: number;
  bonusClaimsCount: number;
  lastBonusClaimed?: string;
  createdAt: string;
  deployments?: {
    repoName: string;
    repoUrl: string;
    pagesUrl: string;
    updatedAt: string;
  }[];
  submissions?: {
    id: string;
    projectName: string;
    formName: string;
    data: Record<string, any>;
    submittedAt: string;
  }[];
}

export interface DbPaymentClaim {
  id: string;
  email: string;
  plan: "10000ar" | "20000ar" | "50000ar";
  transactionRef: string;
  senderPhone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface DbSchema {
  users: DbUser[];
  geminiKeys: string[];
  payments: DbPaymentClaim[];
  currentKeyIndex: number;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), 'data-store.json');

// In-memory cache
let cachedDb: DbSchema = {
  users: [],
  geminiKeys: [],
  payments: [],
  currentKeyIndex: 0
};

let firestoreInitialized = false;
let dbInstance: Firestore | null = null;
let firstFirestoreSnapshotReceived = false;

// Initialize Firebase Client SDK lazily using API keys and config
function getFirestoreInstance(): Firestore | null {
  if (dbInstance) return dbInstance;
  if (firestoreInitialized) return null;

  try {
    let firebaseConfig: any = {
      projectId: "gen-lang-client-0195622465"
    };
    let databaseId = "";
    
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        firebaseConfig = {
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          appId: config.appId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId
        };
        if (config.firestoreDatabaseId) {
          databaseId = config.firestoreDatabaseId;
        }
      }
    } catch (e) {
      console.warn("Failed to load firebase-applet-config.json for projectId:", e);
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    firestoreInitialized = true;
    console.log(`🔥 Firebase Client SDK initialized successfully (Database: ${databaseId || '(default)'})`);
    setupFirestoreSync();
    return dbInstance;
  } catch (error) {
    firestoreInitialized = true; // prevent repeated attempts if it fails hard
    console.error("⚠️ Failed to initialize Firebase Client SDK / Firestore. Falling back to 100% local database storage.", error);
    return null;
  }
}

// Read database
export function readDb(): DbSchema {
  // Try reading from local file if memory is empty
  if (cachedDb.users.length === 0 && cachedDb.payments.length === 0) {
    try {
      if (fs.existsSync(LOCAL_STORE_PATH)) {
        const fileContent = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
        const parsed = JSON.parse(fileContent);
        cachedDb = {
          users: parsed.users || [],
          geminiKeys: parsed.geminiKeys || [],
          payments: parsed.payments || [],
          currentKeyIndex: parsed.currentKeyIndex || 0
        };
      }
    } catch (e) {
      console.error("Failed to read local data-store.json:", e);
    }
  }
  return cachedDb;
}

// Write database
export function writeDb(newDb: DbSchema) {
  cachedDb = newDb;

  // 1. Write to local file store
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(newDb, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to write data-store.json locally:", e);
  }

  // 2. Write to Firestore asynchroneously (if initialized and we already got first snapshot)
  // This avoids wiping Firestore state before first snapshot load!
  const db = getFirestoreInstance();
  if (db && firstFirestoreSnapshotReceived) {
    try {
      const docRef = doc(db, 'app_state', 'v1');
      setDoc(docRef, newDb)
        .then(() => {
          // console.log("✅ Firestore sync completed");
        })
        .catch((e) => {
          console.error("Firestore sync write failed:", e);
        });
    } catch (e) {
      console.error("Error writing to Firestore collection:", e);
    }
  }
}

// Real-time listener for Firestore updates
function setupFirestoreSync() {
  const db = getFirestoreInstance();
  if (!db) return;

  try {
    console.log("📡 Listening to Firestore realtime updates on app_state/v1...");
    const docRef = doc(db, 'app_state', 'v1');
    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as DbSchema;
        if (data) {
          // Merge safely or override
          cachedDb = {
            users: data.users || [],
            geminiKeys: data.geminiKeys || [],
            payments: data.payments || [],
            currentKeyIndex: data.currentKeyIndex || 0
          };
          // Write back to local store to keep them in sync
          try {
            fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(cachedDb, null, 2), 'utf8');
          } catch (e) {}
          // console.log("🔄 Realtime state synced from Firestore snapshot");
        }
      } else {
        console.log("ℹ️ No Firestore doc found. Initializing with local data...");
        // If Firestore doc doesn't exist, we save our current local db to it
        firstFirestoreSnapshotReceived = true;
        writeDb(readDb());
      }
      firstFirestoreSnapshotReceived = true;
    }, (error) => {
      console.error("Firestore snapshot listener encountered error:", error);
      // Fallback: mark as received to allow writing
      firstFirestoreSnapshotReceived = true;
    });

    // Timeout protective fallback: if Firestore does not respond within 3.5 seconds, unblock writes anyway
    setTimeout(() => {
      if (!firstFirestoreSnapshotReceived) {
        console.warn("⏳ Firestore connection timeout (3.5s). Unblocking local database writes.");
        firstFirestoreSnapshotReceived = true;
      }
    }, 3500);

  } catch (e) {
    console.error("Error setting up Firestore listener:", e);
    firstFirestoreSnapshotReceived = true;
  }
}

// Rotation de clé Gemini
export function rotateGeminiKey(): string | null {
  const db = readDb();
  if (!db.geminiKeys || db.geminiKeys.length === 0) {
    return null;
  }
  const key = db.geminiKeys[db.currentKeyIndex % db.geminiKeys.length];
  db.currentKeyIndex = (db.currentKeyIndex + 1) % db.geminiKeys.length;
  writeDb(db);
  return key;
}

// Auto init firestore
getFirestoreInstance();
