import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";

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

async function main() {
  // Sign in as coach - we need owner permissions
  console.log("Signing in...");
  // Try to find owner credentials - use the first owner account
  // You'll need to provide coach email/password
  const coachEmail = process.argv[2];
  const coachPassword = process.argv[3];
  if (!coachEmail || !coachPassword) {
    console.log("Usage: node scripts/populate-mealplan.mjs <coach-email> <coach-password>");
    process.exit(1);
  }
  await signInWithEmailAndPassword(auth, coachEmail, coachPassword);
  console.log("Signed in as coach.");

  // Find James Wilson
  const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "client")));
  let jamesUid = null;

  usersSnap.forEach((d) => {
    const data = d.data();
    if (data.name?.toLowerCase().includes("james wilson")) {
      jamesUid = data.uid;
      console.log(`Found James Wilson: ${data.name} (${data.uid})`);
    }
  });

  if (!jamesUid) {
    console.log("James Wilson not found. Listing all clients:");
    usersSnap.forEach((d) => {
      const data = d.data();
      console.log(`  - ${data.name} (${data.uid})`);
    });
    process.exit(1);
  }

  // Check existing meal plan
  const planDoc = await getDoc(doc(db, "users", jamesUid, "mealPlan", "current"));
  if (planDoc.exists()) {
    console.log("Existing meal plan found, updating with proper macros...");
  } else {
    console.log("No meal plan found, creating one...");
  }

  // Create a realistic meal plan with proper macros
  const mealPlan = {
    freeCalories: 200,
    waterTargetLitres: 3,
    meals: [
      {
        label: "M1",
        items: ["Porridge oats 50g", "1 scoop whey protein", "100g Blueberries"],
        note: "Mixed with water not milk",
        estimatedCalories: 380,
        estimatedProtein: 32,
        estimatedCarbs: 48,
        estimatedFat: 6,
      },
      {
        label: "M2",
        items: ["Greek yoghurt 150g", "20g almonds", "1 banana"],
        estimatedCalories: 320,
        estimatedProtein: 18,
        estimatedCarbs: 35,
        estimatedFat: 12,
      },
      {
        label: "M3",
        items: ["180g chicken breast", "120g rice (cooked weight)", "Greens/salad/veg"],
        estimatedCalories: 450,
        estimatedProtein: 48,
        estimatedCarbs: 42,
        estimatedFat: 6,
      },
      {
        label: "M4",
        items: ["120g tuna in water", "Wholemeal wrap", "Salad", "10g light mayo"],
        estimatedCalories: 350,
        estimatedProtein: 38,
        estimatedCarbs: 28,
        estimatedFat: 8,
      },
      {
        label: "M5",
        items: ["200g lean beef mince 5%", "150g sweet potato", "Mixed vegetables"],
        estimatedCalories: 480,
        estimatedProtein: 45,
        estimatedCarbs: 40,
        estimatedFat: 14,
      },
      {
        label: "M6",
        items: ["1 scoop casein protein", "200ml almond milk"],
        note: "Before bed",
        estimatedCalories: 140,
        estimatedProtein: 26,
        estimatedCarbs: 4,
        estimatedFat: 2,
      },
    ],
    optionalSnack: "Low cal jelly or sugar free ice lolly",
    supplements: ["Creatine 5g daily", "Vitamin D 4000iu", "Omega 3 fish oil"],
    notes: [
      "Drink at least 3L water throughout the day",
      "Meal timing is flexible - fit around your schedule",
      "Swap chicken for turkey or white fish if preferred",
    ],
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, "users", jamesUid, "mealPlan", "current"), mealPlan);
  console.log("\nMeal plan saved successfully!");

  // Calculate totals
  const totalCals = mealPlan.meals.reduce((s, m) => s + (m.estimatedCalories || 0), 0);
  const totalProtein = mealPlan.meals.reduce((s, m) => s + (m.estimatedProtein || 0), 0);
  const totalCarbs = mealPlan.meals.reduce((s, m) => s + (m.estimatedCarbs || 0), 0);
  const totalFat = mealPlan.meals.reduce((s, m) => s + (m.estimatedFat || 0), 0);

  console.log(`\nDaily totals (6 meals):`);
  console.log(`  Calories: ${totalCals} kcal`);
  console.log(`  Protein: ${totalProtein}g`);
  console.log(`  Carbs: ${totalCarbs}g`);
  console.log(`  Fat: ${totalFat}g`);
  console.log(`  + ${mealPlan.freeCalories} free calories`);

  // Also set nutrition targets
  await setDoc(doc(db, "users", jamesUid, "settings", "nutritionTargets"), {
    calories: totalCals + mealPlan.freeCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat + 10, // little buffer for free cals
  });
  console.log(`\nNutrition targets set: ${totalCals + mealPlan.freeCalories} kcal / ${totalProtein}g P / ${totalCarbs}g C / ${totalFat + 10}g F`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
