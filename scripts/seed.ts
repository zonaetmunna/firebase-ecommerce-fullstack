import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import firebaseApp from "../src/firebase/firebase.config";

// Check if Firebase is properly configured
function checkFirebaseConfig() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n📝 Please follow these steps:");
    console.error("1. Copy env.template to .env.local");
    console.error(
      "2. Update .env.local with your Firebase project configuration"
    );
    console.error(
      "3. Create a Firebase project at https://console.firebase.google.com/"
    );
    console.error("4. Enable Authentication, Firestore, and Storage");
    console.error("5. Get your Firebase config from Project Settings");
    console.error("\n📖 See SETUP_GUIDE.md for detailed instructions");
    return false;
  }

  return true;
}

// Initialize Firebase services only if config is valid
let db: any;
let auth: any;

if (checkFirebaseConfig()) {
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
} else {
  process.exit(1);
}

// Sample categories
const categories = [
  {
    name: "Electronics",
    description: "Latest electronic gadgets and devices",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
    isActive: true,
    productCount: 0,
  },
  {
    name: "Clothing",
    description: "Fashion and apparel for all occasions",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    isActive: true,
    productCount: 0,
  },
  {
    name: "Books",
    description: "Educational and entertainment books",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    isActive: true,
    productCount: 0,
  },
  {
    name: "Home & Garden",
    description: "Everything for your home and garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    isActive: true,
    productCount: 0,
  },
  {
    name: "Sports",
    description: "Sports equipment and accessories",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    isActive: true,
    productCount: 0,
  },
];

// Sample products
const products = [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 999,
    category: "Electronics",
    color: "Natural Titanium",
    size: "128GB",
    stock: 50,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    ],
    rating: 4.8,
    brand: "Apple",
    featured: true,
    tags: ["smartphone", "apple", "ios", "premium"],
    specifications: {
      Display: "6.1-inch Super Retina XDR",
      Processor: "A17 Pro chip",
      Storage: "128GB",
      Camera: "48MP Main + 12MP Ultra Wide",
      Battery: "Up to 23 hours video playback",
    },
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone with AI features",
    price: 799,
    category: "Electronics",
    color: "Phantom Black",
    size: "256GB",
    stock: 30,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400",
    ],
    rating: 4.6,
    brand: "Samsung",
    featured: true,
    tags: ["smartphone", "android", "samsung", "ai"],
    specifications: {
      Display: "6.2-inch Dynamic AMOLED 2X",
      Processor: "Snapdragon 8 Gen 3",
      Storage: "256GB",
      Camera: "50MP Main + 12MP Ultra Wide",
      Battery: "4000mAh",
    },
  },
  {
    name: "Men's Classic T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear",
    price: 29.99,
    category: "Clothing",
    color: "Navy Blue",
    size: "L",
    stock: 100,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
    ],
    rating: 4.2,
    brand: "BasicWear",
    featured: false,
    tags: ["clothing", "t-shirt", "cotton", "casual"],
    specifications: {
      Material: "100% Cotton",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "Made in USA",
    },
  },
  {
    name: "JavaScript: The Complete Guide",
    description: "Comprehensive guide to modern JavaScript programming",
    price: 49.99,
    category: "Books",
    color: "N/A",
    size: "Paperback",
    stock: 75,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    ],
    rating: 4.7,
    brand: "TechBooks",
    featured: true,
    tags: ["programming", "javascript", "web development", "education"],
    specifications: {
      Pages: "892",
      Publisher: "TechBooks Publishing",
      Language: "English",
      ISBN: "978-1234567890",
    },
  },
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "Electronics",
    color: "Black",
    size: "One Size",
    stock: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
    ],
    rating: 4.5,
    brand: "AudioTech",
    featured: true,
    tags: ["headphones", "wireless", "audio", "noise-cancelling"],
    specifications: {
      "Battery Life": "30 hours",
      Driver: "40mm dynamic drivers",
      Connectivity: "Bluetooth 5.0",
      Weight: "250g",
    },
  },
];

// Sample orders
const orders = [
  {
    userId: "user123",
    userEmail: "john@example.com",
    items: [
      {
        productId: "prod1",
        name: "iPhone 15 Pro",
        price: 999,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        size: "128GB",
        color: "Natural Titanium",
      },
    ],
    totalAmount: 999,
    subtotal: 999,
    shippingCost: 0,
    tax: 79.92,
    orderDate: serverTimestamp(),
    orderStatus: "processing" as const,
    paymentStatus: "completed" as const,
    paymentMethod: "credit_card" as const,
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      phone: "+1234567890",
    },
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      zip: 10001,
    },
    trackingNumber: "TRK123456789",
    notes: "Handle with care",
  },
];

// Sample notifications
const notifications = [
  {
    type: "order" as const,
    title: "New Order Received",
    message: "Order #12345 has been placed by john@example.com",
    isRead: false,
  },
  {
    type: "product" as const,
    title: "Low Stock Alert",
    message: "iPhone 15 Pro is running low on stock (5 items remaining)",
    isRead: false,
  },
  {
    type: "user" as const,
    title: "New User Registration",
    message: "A new user has registered: jane@example.com",
    isRead: true,
  },
  {
    type: "system" as const,
    title: "System Update",
    message: "The system has been updated to version 2.1.0",
    isRead: true,
  },
];

// System settings
const systemSettings = {
  siteName: "Firebase Commerce",
  siteDescription: "Complete ecommerce solution with Firebase",
  siteEmail: "admin@firebasecommerce.com",
  sitePhone: "+1 (555) 123-4567",
  siteAddress: "123 Commerce Street, City, State 12345",
  currency: "USD",
  taxRate: 0.08,
  shippingRate: 9.99,
  featuredProductsLimit: 8,
  allowUserRegistration: true,
  requireEmailVerification: false,
  maintenanceMode: false,
};

// Seed function
export async function seedFirebase() {
  try {
    console.log("Starting Firebase seeding...");

    // 1. Create admin user
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "admin@firebasecommerce.com",
        "admin123"
      );

      await updateProfile(userCredential.user, {
        displayName: "Admin User",
      });

      // Add admin user to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: "Admin User",
        email: "admin@firebasecommerce.com",
        role: "admin",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Admin user created successfully");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log("ℹ️  Admin user already exists");
      } else {
        console.error("❌ Error creating admin user:", error);
      }
    }

    // 2. Seed categories
    console.log("🌱 Seeding categories...");
    for (const category of categories) {
      await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("✅ Categories seeded successfully");

    // 3. Seed products
    console.log("🌱 Seeding products...");
    for (const product of products) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("✅ Products seeded successfully");

    // 4. Seed orders
    console.log("🌱 Seeding orders...");
    for (const order of orders) {
      await addDoc(collection(db, "orders"), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("✅ Orders seeded successfully");

    // 5. Seed notifications
    console.log("🌱 Seeding notifications...");
    for (const notification of notifications) {
      await addDoc(collection(db, "notifications"), {
        ...notification,
        createdAt: serverTimestamp(),
      });
    }
    console.log("✅ Notifications seeded successfully");

    // 6. Seed system settings
    console.log("🌱 Seeding system settings...");
    await setDoc(doc(db, "settings", "system"), {
      ...systemSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ System settings seeded successfully");

    console.log("🎉 Firebase seeding completed successfully!");
    console.log("📧 Admin credentials:");
    console.log("   Email: admin@firebasecommerce.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding Firebase:", error);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedFirebase();
}
