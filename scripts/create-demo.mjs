import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZ2kqpAfNoC_vcjttZubNIja-gdmG_2UQ",
  authDomain: "th-hub-5883e.firebaseapp.com",
  projectId: "th-hub-5883e",
  storageBucket: "th-hub-5883e.firebasestorage.app",
  messagingSenderId: "114911097865",
  appId: "1:114911097865:web:777ec6a91d11f2922ab4d8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = "demo@thhub.co.uk";
const password = "demo1234";
const name = "Demo Client";

try {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    name,
    role: "client",
    checkInDay: "Monday",
    createdAt: Date.now(),
  });
  console.log("Demo account created successfully!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`UID: ${cred.user.uid}`);
  console.log("\nThis account has NO active subscription - it will see the locked/welcome screen.");
  process.exit(0);
} catch (err) {
  if (err.code === "auth/email-already-in-use") {
    console.log("Demo account already exists!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("\nLog in with these credentials to see the inactive client experience.");
    process.exit(0);
  }
  console.error("Error:", err.message);
  process.exit(1);
}
