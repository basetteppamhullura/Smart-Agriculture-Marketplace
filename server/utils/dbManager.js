const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Auction = require('../models/Auction');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Question = require('../models/Question');
const Negotiation = require('../models/Negotiation');
const { getImageForCrop } = require('./cropImages');

// Simple local JSON db helpers
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const readJson = (filename) => {
  const filePath = path.join(dataDir, `${filename}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const writeJson = (filename, data) => {
  const filePath = path.join(dataDir, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const db = {
  useLocalMock: () => {
    // If mongo state is not connected, use JSON mock
    return mongoose.connection.readyState !== 1;
  }
};

// Seed Users
const seedUsers = [
  {
    _id: "user_farmer_1",
    name: "Basappa Gowda",
    email: "farmer1@agri.com",
    role: "farmer",
    location: "Mandya, Karnataka",
    isVerified: true,
    smartFarmingScore: { overallScore: 4.8, ratingsCount: 15 },
    avatarUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
    hasTrustedBadge: true,
    walletBalance: 25000
  },
  {
    _id: "user_farmer_2",
    name: "Malleshappa Belagavi",
    email: "farmer2@agri.com",
    role: "farmer",
    location: "Nashik, Maharashtra",
    isVerified: true,
    smartFarmingScore: { overallScore: 4.2, ratingsCount: 8 },
    avatarUrl: "https://images.unsplash.com/photo-1566385278603-755fa0c3453b?auto=format&fit=crop&w=300&q=80",
    hasTrustedBadge: false,
    walletBalance: 12000
  },
  {
    _id: "user_buyer_1",
    name: "Ramesh Kumar (Retailer)",
    email: "buyer1@agri.com",
    role: "buyer",
    location: "Bengaluru, Karnataka",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    walletBalance: 85000,
    favoriteFarmers: ["user_farmer_1"]
  },
  {
    _id: "user_admin_1",
    name: "Agri Expert Admin",
    email: "admin@agri.com",
    role: "admin",
    location: "Bengaluru, Karnataka",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    walletBalance: 0
  }
];

// Seed Crops (35 Karnataka regional crops)
const seedCrops = [
  {
    _id: "crop_1",
    farmer: "user_farmer_1",
    name: "Sona Masuri Rice (Aged)",
    localName: "ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ (Sona Masuri)",
    category: "Grains",
    quantity: 2500,
    qualityGrade: "Premium",
    harvestDate: "2026-07-08T00:00:00.000Z",
    location: "Mandya, Karnataka",
    district: "Mandya",
    village: "Koppa Village",
    listingMode: "buynow",
    price: 55,
    aiPriceRecommended: 52,
    imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 180, ordersCount: 4, revenue: 22000 },
    description: "Lightweight, unpolished aged Sona Masuri rice. Sourced from organic Mandya belt.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: "crop_2",
    farmer: "user_farmer_1",
    name: "Basmati Rice (Long-Grain)",
    localName: "ಬಾಸ್ಮತಿ ಅಕ್ಕಿ (Basmati)",
    category: "Grains",
    quantity: 1500,
    qualityGrade: "Premium",
    harvestDate: "2026-07-10T00:00:00.000Z",
    location: "Mysuru, Karnataka",
    district: "Mysuru",
    village: "Bannur",
    listingMode: "buynow",
    price: 95,
    aiPriceRecommended: 90,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 120, ordersCount: 1, revenue: 9500 },
    description: "Slender grains with rich aroma, aged 12 months for culinary quality.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: "crop_3",
    farmer: "user_farmer_1",
    name: "Red Rice (Matta)",
    localName: "ಕೆಂಪು ಅಕ್ಕಿ (Red Rice)",
    category: "Grains",
    quantity: 1200,
    qualityGrade: "A",
    harvestDate: "2026-07-11T00:00:00.000Z",
    location: "Shivamogga, Karnataka",
    district: "Shivamogga",
    village: "Sagar",
    listingMode: "buynow",
    price: 68,
    aiPriceRecommended: 65,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 82, ordersCount: 0, revenue: 0 },
    description: "Thick unpolished red grains containing vital minerals. Harvested in forest soils.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_4",
    farmer: "user_farmer_2",
    name: "Brown Rice (Nutritious)",
    localName: "ಕಂದು ಅಕ್ಕಿ (Brown Rice)",
    category: "Grains",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-12T00:00:00.000Z",
    location: "Dharwad, Karnataka",
    district: "Dharwad",
    village: "Hubli Rural",
    listingMode: "buynow",
    price: 70,
    aiPriceRecommended: 68,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 60, ordersCount: 1, revenue: 7000 },
    description: "Cleaned whole grain brown rice, retaining healthy outer bran husk layer.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    _id: "crop_5",
    farmer: "user_farmer_2",
    name: "Paddy Rice (Raw)",
    localName: "ಭತ್ತ (Paddy)",
    category: "Grains",
    quantity: 5000,
    qualityGrade: "B",
    harvestDate: "2026-07-05T00:00:00.000Z",
    location: "Belagavi, Karnataka",
    district: "Belagavi",
    village: "Gokak",
    listingMode: "buynow",
    price: 24,
    aiPriceRecommended: 22,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 72, ordersCount: 0, revenue: 0 },
    description: "Raw unprocessed paddy from harvest fields. Ready for local sheller mills.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    _id: "crop_6",
    farmer: "user_farmer_2",
    name: "Ragi (Finger Millet)",
    localName: "ರಾಗಿ (Finger Millet)",
    category: "Millets",
    quantity: 4000,
    qualityGrade: "Premium",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Tumakuru, Karnataka",
    district: "Tumakuru",
    village: "Kunigal",
    listingMode: "buynow",
    price: 42,
    aiPriceRecommended: 40,
    imageUrl: "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 245, ordersCount: 15, revenue: 64000 },
    description: "Nutritious calcium-rich red finger millets, highly recommended for health mix formulations.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    _id: "crop_7",
    farmer: "user_farmer_2",
    name: "White Jowar (Sorghum)",
    localName: "ಬಿಳಿ ಜೋಳ (Jowar)",
    category: "Millets",
    quantity: 2000,
    qualityGrade: "A",
    harvestDate: "2026-07-11T00:00:00.000Z",
    location: "Vijayapura, Karnataka",
    district: "Vijayapura",
    village: "Sindagi",
    listingMode: "buynow",
    price: 45,
    aiPriceRecommended: 42,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80", // fallback grain
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 90, ordersCount: 3, revenue: 13500 },
    description: "White Sorghum (Jowar) grains, ideal for healthy bhakri/roti flour.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_8",
    farmer: "user_farmer_1",
    name: "Pearl Millet (Bajra)",
    localName: "ಸಜ್ಜೆ (Bajra)",
    category: "Millets",
    quantity: 1800,
    qualityGrade: "B",
    harvestDate: "2026-07-06T00:00:00.000Z",
    location: "Ballari, Karnataka",
    district: "Ballari",
    village: "Kampli",
    listingMode: "buynow",
    price: 35,
    aiPriceRecommended: 32,
    imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 64, ordersCount: 2, revenue: 7000 },
    description: "Pearl Millet (Sajje) grains, excellent winter nutrition source, sourced locally.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    _id: "crop_9",
    farmer: "user_farmer_2",
    name: "Foxtail Millet (Navane)",
    localName: "ನವಣೆ (Foxtail Millet)",
    category: "Millets",
    quantity: 900,
    qualityGrade: "A",
    harvestDate: "2026-07-10T00:00:00.000Z",
    location: "Dharwad, Karnataka",
    district: "Dharwad",
    village: "Navalgund",
    listingMode: "buynow",
    price: 75,
    aiPriceRecommended: 72,
    imageUrl: "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 80, ordersCount: 1, revenue: 7500 },
    description: "Dehulled organic Foxtail Millet (Navane) loaded with vitamins and fibers.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_10",
    farmer: "user_farmer_2",
    name: "Little Millet (Samai)",
    localName: "ಸಾಮೆ (Little Millet)",
    category: "Millets",
    quantity: 700,
    qualityGrade: "A",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    village: "Tarikere",
    listingMode: "buynow",
    price: 80,
    aiPriceRecommended: 78,
    imageUrl: "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 45, ordersCount: 1, revenue: 8000 },
    description: "Tiny nutrient-rich little millet grains, sourced from rainfed farming systems.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    _id: "crop_11",
    farmer: "user_farmer_1",
    name: "Barnyard Millet (Oodalu)",
    localName: "ಊದಲು (Barnyard Millet)",
    category: "Millets",
    quantity: 600,
    qualityGrade: "B",
    harvestDate: "2026-07-13T00:00:00.000Z",
    location: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    village: "Kadur",
    listingMode: "buynow",
    price: 85,
    aiPriceRecommended: 82,
    imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 52, ordersCount: 0, revenue: 0 },
    description: "Barnyard millet (Oodalu), low glycemic index health grain.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: "crop_12",
    farmer: "user_farmer_1",
    name: "Kodo Millet (Harka)",
    localName: "ಹರಕ (Kodo Millet)",
    category: "Millets",
    quantity: 800,
    qualityGrade: "A",
    harvestDate: "2026-07-11T00:00:00.000Z",
    location: "Tumakuru, Karnataka",
    district: "Tumakuru",
    village: "Tiptur",
    listingMode: "buynow",
    price: 90,
    aiPriceRecommended: 88,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 68, ordersCount: 2, revenue: 18000 },
    description: "Kodo millets processed and dehulled. High antioxidant property grains.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_13",
    farmer: "user_farmer_2",
    name: "Proso Millet (Baragu)",
    localName: "ಬರಗು (Proso Millet)",
    category: "Millets",
    quantity: 500,
    qualityGrade: "A",
    harvestDate: "2026-07-10T00:00:00.000Z",
    location: "Tumakuru, Karnataka",
    district: "Tumakuru",
    village: "Sira",
    listingMode: "buynow",
    price: 88,
    aiPriceRecommended: 85,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 35, ordersCount: 0, revenue: 0 },
    description: "Dehulled Proso millets, ideal for making porridge and grain mixes.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: "crop_14",
    farmer: "user_farmer_2",
    name: "Premium Wheat Grains",
    localName: "ಗೋಧಿ (Wheat)",
    category: "Grains",
    quantity: 3500,
    qualityGrade: "Premium",
    harvestDate: "2026-07-07T00:00:00.000Z",
    location: "Belagavi, Karnataka",
    district: "Belagavi",
    village: "Athani",
    listingMode: "buynow",
    price: 32,
    aiPriceRecommended: 30,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 104, ordersCount: 1, revenue: 14000 },
    description: "Premium wheat grains harvested in black cotton soils of Athani region.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    _id: "crop_15",
    farmer: "user_farmer_1",
    name: "Golden Maize (Corn)",
    localName: "ಮೆಕ್ಕೆಜೋಳ (Maize)",
    category: "Grains",
    quantity: 4000,
    qualityGrade: "A",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Dharwad, Karnataka",
    district: "Dharwad",
    village: "Kalghatgi",
    listingMode: "buynow",
    price: 22,
    aiPriceRecommended: 20,
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 82, ordersCount: 4, revenue: 17600 },
    description: "Hybrid feed maize grains, low moisture count, excellent quality.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    _id: "crop_16",
    farmer: "user_farmer_1",
    name: "Barley Grains (Jau)",
    localName: "ಯವ ಧಾನ್ಯ (Barley)",
    category: "Grains",
    quantity: 1500,
    qualityGrade: "B",
    harvestDate: "2026-07-12T00:00:00.000Z",
    location: "Belagavi, Karnataka",
    district: "Belagavi",
    village: "Savadatti",
    listingMode: "buynow",
    price: 40,
    aiPriceRecommended: 38,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 68, ordersCount: 1, revenue: 4000 },
    description: "Clean hull-less barley grains, great for milling flour or brewing inputs.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_17",
    farmer: "user_farmer_2",
    name: "Steel-Cut Oats",
    localName: "ಓಟ್ಸ್ ಧಾನ್ಯ (Oats)",
    category: "Grains",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-06T00:00:00.000Z",
    location: "Mysuru, Karnataka",
    district: "Mysuru",
    village: "Hunsur",
    listingMode: "buynow",
    price: 110,
    aiPriceRecommended: 105,
    imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 115, ordersCount: 4, revenue: 44000 },
    description: "Premium raw oat groats cut into steel bits, perfect for rich oatmeal breakfast bowls.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    _id: "crop_18",
    farmer: "user_farmer_1",
    name: "Green Gram (Hesaru Bele)",
    localName: "ಹೆಸರು ಬೇಳೆ (Green Gram)",
    category: "Pulses",
    quantity: 1200,
    qualityGrade: "A",
    harvestDate: "2026-07-13T00:00:00.000Z",
    location: "Dharwad, Karnataka",
    district: "Dharwad",
    village: "Hubli",
    listingMode: "buynow",
    price: 105,
    aiPriceRecommended: 100,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 90, ordersCount: 2, revenue: 21000 },
    description: "Nutritious green gram, split yellow skinless lentils of premium grade.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: "crop_19",
    farmer: "user_farmer_1",
    name: "Black Gram (Uddina Bele)",
    localName: "ಉದ್ದಿನ ಬೇಳೆ (Black Gram)",
    category: "Pulses",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-11T00:00:00.000Z",
    location: "Mysuru, Karnataka",
    district: "Mysuru",
    village: "T Narasipura",
    listingMode: "buynow",
    price: 120,
    aiPriceRecommended: 115,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 80, ordersCount: 2, revenue: 24000 },
    description: "Split dehulled black gram, ideal for preparing batters.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: "crop_20",
    farmer: "user_farmer_1",
    name: "Bengal Gram (Kadale Bele)",
    localName: "ಕಡಲೆ ಬೇಳೆ (Bengal Gram)",
    category: "Pulses",
    quantity: 1500,
    qualityGrade: "A",
    harvestDate: "2026-07-08T00:00:00.000Z",
    location: "Vijayapura, Karnataka",
    district: "Vijayapura",
    village: "Muddebihal",
    listingMode: "buynow",
    price: 78,
    aiPriceRecommended: 75,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 66, ordersCount: 2, revenue: 15600 },
    description: "Yellow split chickpeas, harvested in black soil fields.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    _id: "crop_21",
    farmer: "user_farmer_1",
    name: "Toor Dal (Togari Bele)",
    localName: "ತೊಗರಿ ಬೇಳೆ (Toor Dal)",
    category: "Pulses",
    quantity: 1200,
    qualityGrade: "Premium",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Vijayapura, Karnataka",
    district: "Vijayapura",
    village: "Sindagi",
    listingMode: "buynow",
    price: 135,
    aiPriceRecommended: 130,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 104, ordersCount: 4, revenue: 54000 },
    description: "Premium unpolished Togari Bele.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_22",
    farmer: "user_farmer_1",
    name: "Horse Gram (Huruli)",
    localName: "ಹುರುಳಿ ಬೇಳೆ (Horse Gram)",
    category: "Pulses",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-06T00:00:00.000Z",
    location: "Hassan, Karnataka",
    district: "Hassan",
    village: "Holenarasipura",
    listingMode: "buynow",
    price: 60,
    aiPriceRecommended: 58,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 50, ordersCount: 1, revenue: 6000 },
    description: "Traditional protein-rich local horse gram, harvested organically.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    _id: "crop_23",
    farmer: "user_farmer_1",
    name: "Cowpea (Alasande)",
    localName: "ಅಲಸಂದೆ (Cowpea)",
    category: "Pulses",
    quantity: 800,
    qualityGrade: "A",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Tumakuru, Karnataka",
    district: "Tumakuru",
    village: "Gubbi",
    listingMode: "buynow",
    price: 72,
    aiPriceRecommended: 70,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 42, ordersCount: 0, revenue: 0 },
    description: "Traditional black-eyed peas, dry crop from Gubbi farms.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_24",
    farmer: "user_farmer_1",
    name: "Premium Groundnuts",
    localName: "ಕಡಲೆಕಾಯಿ (Groundnut)",
    category: "Oil Seeds",
    quantity: 2000,
    qualityGrade: "Premium",
    harvestDate: "2026-07-05T00:00:00.000Z",
    location: "Tumakuru, Karnataka",
    district: "Tumakuru",
    village: "Gubbi",
    listingMode: "buynow",
    price: 90,
    aiPriceRecommended: 88,
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 135, ordersCount: 5, revenue: 45000 },
    description: "Hand-selected bold groundnuts, ideal for oil press extraction.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    _id: "crop_25",
    farmer: "user_farmer_2",
    name: "Organic Sesame Seeds (Ellu)",
    localName: "ಎಳ್ಳು (Sesame Seeds)",
    category: "Oil Seeds",
    quantity: 800,
    qualityGrade: "A",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Hassan, Karnataka",
    district: "Hassan",
    village: "Channarayapatna",
    listingMode: "buynow",
    price: 160,
    aiPriceRecommended: 155,
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 72, ordersCount: 1, revenue: 16000 },
    description: "Cleaned white sesame seeds, rich in flavor, harvested traditionally.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_26",
    farmer: "user_farmer_1",
    name: "Sunflower Seeds",
    localName: "ಸೂರ್ಯಕಾಂತಿ ಬಿತ್ತನೆ (Sunflower)",
    category: "Oil Seeds",
    quantity: 1200,
    qualityGrade: "A",
    harvestDate: "2026-07-10T00:00:00.000Z",
    location: "Ballari, Karnataka",
    district: "Ballari",
    village: "Kampli",
    listingMode: "buynow",
    price: 85,
    aiPriceRecommended: 80,
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 90, ordersCount: 3, revenue: 25500 },
    description: "Oil-rich hybrid sunflower seeds, dry-processed for oil mills.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: "crop_27",
    farmer: "user_farmer_2",
    name: "Castor Seeds (Haralu)",
    localName: "ಹರಳೆಣ್ಣೆ ಬೀಜ (Castor)",
    category: "Oil Seeds",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-06T00:00:00.000Z",
    location: "Mysuru, Karnataka",
    district: "Mysuru",
    village: "Nanjangud",
    listingMode: "buynow",
    price: 68,
    aiPriceRecommended: 65,
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 50, ordersCount: 1, revenue: 6800 },
    description: "High-grade castor oil seeds harvested from Nanjangud drylands.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    _id: "crop_28",
    farmer: "user_farmer_1",
    name: "Arecanut (Supari Grains)",
    localName: "ಅಡಿಕೆ (Arecanut)",
    category: "Commercial Crops",
    quantity: 1500,
    qualityGrade: "Premium",
    harvestDate: "2026-07-03T00:00:00.000Z",
    location: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    village: "Koppa",
    listingMode: "buynow",
    price: 460,
    aiPriceRecommended: 450,
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 420, ordersCount: 8, revenue: 368000 },
    description: "Sun-dried de-husked arecanut (adike) from high-altitude Malnad plantations.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    _id: "crop_29",
    farmer: "user_farmer_1",
    name: "Matured Desi Coconuts",
    localName: "ತೆಂಗಿನಕಾಯಿ (Coconut)",
    category: "Commercial Crops",
    quantity: 5000,
    qualityGrade: "A",
    harvestDate: "2026-07-12T00:00:00.000Z",
    location: "Hassan, Karnataka",
    district: "Hassan",
    village: "Arasikere",
    listingMode: "buynow",
    price: 18,
    aiPriceRecommended: 17,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 145, ordersCount: 3, revenue: 54000 },
    description: "Matured Hassan coconuts, high water and copra thickness.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_30",
    farmer: "user_farmer_1",
    name: "Raw Sugarcane Stalks",
    localName: "ಕಬ್ಬು (Sugarcane)",
    category: "Commercial Crops",
    quantity: 8000,
    qualityGrade: "A",
    harvestDate: "2026-07-15T00:00:00.000Z",
    location: "Mandya, Karnataka",
    district: "Mandya",
    village: "Maddur",
    listingMode: "buynow",
    price: 3,
    aiPriceRecommended: 2.8,
    imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "farm-pickup",
    status: "available",
    analytics: { views: 180, ordersCount: 2, revenue: 24000 },
    description: "Fresh juice-rich sugarcane stalks, ideal for jaggery processing mills.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: "crop_31",
    farmer: "user_farmer_2",
    name: "BT Cotton Bolls",
    localName: "ಹತ್ತಿ (Cotton)",
    category: "Commercial Crops",
    quantity: 3000,
    qualityGrade: "A",
    harvestDate: "2026-07-11T00:00:00.000Z",
    location: "Dharwad, Karnataka",
    district: "Dharwad",
    village: "Hubli Rural",
    listingMode: "buynow",
    price: 68,
    aiPriceRecommended: 65,
    imageUrl: "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80", // fallback cotton icon
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 90, ordersCount: 0, revenue: 0 },
    description: "Pure white BT cotton bolls, hand-plucked, ideal for spinning mills.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: "crop_32",
    farmer: "user_farmer_2",
    name: "Organic Turmeric Rhizomes",
    localName: "ಅರಿಶಿನ (Turmeric)",
    category: "Commercial Crops",
    quantity: 1200,
    qualityGrade: "Premium",
    harvestDate: "2026-07-09T00:00:00.000Z",
    location: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    village: "Tarikere",
    listingMode: "buynow",
    price: 140,
    aiPriceRecommended: 135,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80", // fallback turmeric
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 98, ordersCount: 2, revenue: 28000 },
    description: "High curcumin finger turmeric roots, sun-dried, premium grade.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "crop_33",
    farmer: "user_farmer_2",
    name: "Fresh Sakleshpur Ginger",
    localName: "ಶುಂಠಿ (Ginger)",
    category: "Commercial Crops",
    quantity: 1000,
    qualityGrade: "A",
    harvestDate: "2026-07-10T00:00:00.000Z",
    location: "Hassan, Karnataka",
    district: "Hassan",
    village: "Sakleshpur",
    listingMode: "buynow",
    price: 90,
    aiPriceRecommended: 85,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 84, ordersCount: 1, revenue: 9000 },
    description: "Freshly harvested aromatic ginger roots, high moisture, punchy flavour.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: "crop_34",
    farmer: "user_farmer_1",
    name: "Dry Malnad Black Pepper",
    localName: "ಕರಿಮೆಣಸು (Black Pepper)",
    category: "Spices",
    quantity: 500,
    qualityGrade: "Premium",
    harvestDate: "2026-07-06T00:00:00.000Z",
    location: "Shivamogga, Karnataka",
    district: "Shivamogga",
    village: "Sagar",
    listingMode: "buynow",
    price: 480,
    aiPriceRecommended: 475,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 198, ordersCount: 6, revenue: 144000 },
    description: "Sun-dried black pepper from Malnad spices estates, ready for trade.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    _id: "crop_35",
    farmer: "user_farmer_1",
    name: "Green Cardamom (Elakki)",
    localName: "ಏಲಕ್ಕಿ (Cardamom)",
    category: "Spices",
    quantity: 300,
    qualityGrade: "Premium",
    harvestDate: "2026-07-08T00:00:00.000Z",
    location: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    village: "Mudigere",
    listingMode: "buynow",
    price: 1800,
    aiPriceRecommended: 1750,
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"],
    stockStatus: "in-stock",
    deliveryOption: "logistics-delivery",
    status: "available",
    analytics: { views: 240, ordersCount: 4, revenue: 720000 },
    description: "7.5mm+ bold green cardamom capsules, rich aroma from Mudigere forests.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  }
];

const seedAuctions = [
  {
    _id: "auction_1",
    crop: "crop_2",
    durationHours: 24,
    startTime: new Date(Date.now() - 3600000 * 4).toISOString(), // started 4 hrs ago
    endTime: new Date(Date.now() + 3600000 * 20).toISOString(),  // ends in 20 hrs
    bids: [
      { buyer: "user_buyer_1", amount: 32, timestamp: new Date(Date.now() - 3600000 * 3).toISOString() }
    ],
    highestBid: 32,
    highestBidder: "user_buyer_1",
    status: "active",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const seedReviews = [
  {
    _id: "review_1",
    crop: "crop_1",
    buyer: "user_buyer_1",
    buyerName: "Ramesh Kumar (Retailer)",
    rating: 5,
    sentiment: "Good",
    comment: "Excellent grain quality. The packaging was multi-layered and clean. The Sona Masuri grains are well-aged, and they cook beautifully. Fast logistics delivery as well!",
    recommend: true,
    images: [
      "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80"
    ],
    purchaseDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    likes: ["user_farmer_2"],
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    _id: "review_2",
    crop: "crop_6",
    buyer: "user_buyer_1",
    buyerName: "Ramesh Kumar (Retailer)",
    rating: 4,
    sentiment: "Good",
    comment: "Ragi grains are clean and free of stones. Packaging was standard. Highly recommend for organic breakfast preparation.",
    recommend: true,
    images: [],
    purchaseDate: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    likes: [],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];

const seedQuestions = [
  {
    _id: "question_1",
    crop: "crop_1",
    asker: "user_buyer_1",
    askerName: "Ramesh Kumar (Retailer)",
    questionText: "Is this Sona Masuri crop certified organic and chemical free?",
    answers: [
      {
        responder: "user_farmer_1",
        responderName: "Basappa Gowda",
        answerText: "Yes, it is cultivated under natural farming protocols using Jeevamrutha manure. No synthetic chemicals were applied.",
        isVerifiedBuyer: false,
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Helper to seed database if empty
const seedAllData = async () => {
  const salt = await bcrypt.genSalt(10);
  const defaultHashPassword = await bcrypt.hash("password123", salt);

  if (!db.useLocalMock()) {
    // Seed MongoDB
    try {
      const uCount = await User.countDocuments();
      if (uCount === 0) {
        // Hash seed passwords
        const usersToInsert = seedUsers.map(u => ({ ...u, password: defaultHashPassword }));
        await User.insertMany(usersToInsert);
        const cropsToInsert = seedCrops.map(c => {
          const img = getImageForCrop(c.name);
          return { 
            ...c, 
            imageUrl: img, 
            images: [img],
            minPriceAcceptable: c.minPriceAcceptable || Math.round(c.price * 0.8)
          };
        });
        await Crop.insertMany(cropsToInsert);
        await Auction.insertMany(seedAuctions);
        await Review.insertMany(seedReviews);
        await Question.insertMany(seedQuestions);
        console.log('MongoDB Seeded successfully.');
      }
    } catch (err) {
      console.error('Failed to seed MongoDB:', err.message);
    }
  } else {
    // Seed JSON
    const localUsers = readJson('users');
    if (localUsers.length === 0) {
      const usersToInsert = seedUsers.map(u => ({ ...u, password: defaultHashPassword }));
      writeJson('users', usersToInsert);
      const cropsToInsert = seedCrops.map(c => {
        const img = getImageForCrop(c.name);
        return { 
          ...c, 
          imageUrl: img, 
          images: [img],
          minPriceAcceptable: c.minPriceAcceptable || Math.round(c.price * 0.8)
        };
      });
      writeJson('crops', cropsToInsert);
      writeJson('auctions', seedAuctions);
      writeJson('reviews', seedReviews);
      writeJson('questions', seedQuestions);
      writeJson('orders', []);
      console.log('Local JSON Database Seeded successfully.');
    }
  }
};

// Generic DB model layer adapter
const dbManager = {
  seed: seedAllData,

  users: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await User.find(query).select('-password');
      let data = readJson('users');
      return data.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      }).map(u => { const { password, ...rest } = u; return rest; });
    },
    findOne: async (query) => {
      if (!db.useLocalMock()) return await User.findOne(query);
      let data = readJson('users');
      return data.find(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await User.findById(id).select('-password');
      let data = readJson('users');
      let userObj = data.find(item => item._id === id);
      if (!userObj) return null;
      const { password, ...rest } = userObj;
      return rest;
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await User.create(doc);
      let data = readJson('users');
      const newDoc = { _id: generateId(), ...doc, walletBalance: doc.walletBalance || 0 };
      data.push(newDoc);
      writeJson('users', data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await User.findByIdAndUpdate(id, update, { new: true });
      let data = readJson('users');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;
      const updatedItem = { ...data[index], ...update };
      data[index] = updatedItem;
      writeJson('users', data);
      return updatedItem;
    }
  },

  crops: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Crop.find(query).populate('farmer', 'name isVerified smartFarmingScore hasTrustedBadge avatarUrl');
      let data = readJson('crops');
      let users = readJson('users');
      
      let filtered = data.filter(item => {
        for (let k in query) {
          if (k === 'name' && query[k] && query[k].$regex) {
            const re = new RegExp(query[k].$regex, 'i');
            if (!re.test(item.name)) return false;
          } else if (k === '$or' && Array.isArray(query[k])) {
            // Check if matches any $or query
            const matchesOr = query[k].some(orQ => {
              for (let orKey in orQ) {
                if (orQ[orKey] && orQ[orKey].$regex) {
                  const re = new RegExp(orQ[orKey].$regex, 'i');
                  if (re.test(item[orKey] || '')) return true;
                } else if (item[orKey] === orQ[orKey]) {
                  return true;
                }
              }
              return false;
            });
            if (!matchesOr) return false;
          } else if (item[k] !== query[k] && k !== 'name' && k !== '$or') {
            return false;
          }
        }
        return true;
      });

      // Populate farmer details
      return filtered.map(crop => {
        const farmerObj = users.find(u => u._id === crop.farmer) || { name: 'Unknown Farmer', smartFarmingScore: { overallScore: 4.5 }, hasTrustedBadge: false, avatarUrl: '' };
        return {
          ...crop,
          farmer: {
            _id: farmerObj._id,
            name: farmerObj.name,
            isVerified: farmerObj.isVerified,
            smartFarmingScore: farmerObj.smartFarmingScore,
            hasTrustedBadge: farmerObj.hasTrustedBadge,
            avatarUrl: farmerObj.avatarUrl || ''
          }
        };
      });
    },
    findOne: async (query) => {
      if (!db.useLocalMock()) return await Crop.findOne(query).populate('farmer', 'name isVerified smartFarmingScore hasTrustedBadge avatarUrl');
      let data = readJson('crops');
      let crop = data.find(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
      if (!crop) return null;
      let users = readJson('users');
      const farmerObj = users.find(u => u._id === crop.farmer) || { name: 'Unknown Farmer', smartFarmingScore: { overallScore: 4.5 }, hasTrustedBadge: false, avatarUrl: '' };
      return {
        ...crop,
        farmer: {
          _id: farmerObj._id,
          name: farmerObj.name,
          isVerified: farmerObj.isVerified,
          smartFarmingScore: farmerObj.smartFarmingScore,
          hasTrustedBadge: farmerObj.hasTrustedBadge,
          avatarUrl: farmerObj.avatarUrl || ''
        }
      };
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Crop.findById(id).populate('farmer', 'name isVerified smartFarmingScore hasTrustedBadge avatarUrl');
      let data = readJson('crops');
      let crop = data.find(item => item._id === id);
      if (!crop) return null;
      let users = readJson('users');
      const farmerObj = users.find(u => u._id === crop.farmer) || { name: 'Unknown Farmer', smartFarmingScore: { overallScore: 4.5 }, hasTrustedBadge: false, avatarUrl: '' };
      return {
        ...crop,
        farmer: {
          _id: farmerObj._id,
          name: farmerObj.name,
          isVerified: farmerObj.isVerified,
          smartFarmingScore: farmerObj.smartFarmingScore,
          hasTrustedBadge: farmerObj.hasTrustedBadge,
          avatarUrl: farmerObj.avatarUrl || ''
        }
      };
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Crop.create(doc);
      let data = readJson('crops');
      const newDoc = { _id: generateId(), ...doc, status: 'available', createdAt: new Date().toISOString() };
      data.push(newDoc);
      writeJson('crops', data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Crop.findByIdAndUpdate(id, update, { new: true });
      let data = readJson('crops');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;
      const updatedItem = { ...data[index], ...update };
      if (update.$set) Object.assign(updatedItem, update.$set);
      if (update.$inc) {
        updatedItem.analytics = updatedItem.analytics || { views: 0, ordersCount: 0, revenue: 0 };
        for (let k in update.$inc) {
          if (k.startsWith('analytics.')) {
            const field = k.split('.')[1];
            updatedItem.analytics[field] = (updatedItem.analytics[field] || 0) + update.$inc[k];
          } else {
            updatedItem[k] = (updatedItem[k] || 0) + update.$inc[k];
          }
        }
      }
      data[index] = updatedItem;
      writeJson('crops', data);
      return updatedItem;
    },
    findByIdAndDelete: async (id) => {
      if (!db.useLocalMock()) return await Crop.findByIdAndDelete(id);
      let data = readJson('crops');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;
      const deletedItem = data.splice(index, 1)[0];
      writeJson('crops', data);
      return deletedItem;
    }
  },

  auctions: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Auction.find(query).populate('crop').populate('highestBidder', 'name');
      let auctions = readJson('auctions');
      let crops = readJson('crops');
      let users = readJson('users');

      let filtered = auctions.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });

      return filtered.map(auc => {
        const cropObj = crops.find(c => c._id === auc.crop) || { name: 'Unknown Crop' };
        const bidderObj = users.find(u => u._id === auc.highestBidder) || null;
        return {
          ...auc,
          crop: cropObj,
          highestBidder: bidderObj ? { _id: bidderObj._id, name: bidderObj.name } : null
        };
      });
    },
    findOne: async (query) => {
      if (!db.useLocalMock()) return await Auction.findOne(query).populate('crop').populate('highestBidder', 'name');
      let auctions = readJson('auctions');
      let auc = auctions.find(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
      if (!auc) return null;
      let crops = readJson('crops');
      let users = readJson('users');
      const cropObj = crops.find(c => c._id === auc.crop) || { name: 'Unknown Crop' };
      const bidderObj = users.find(u => u._id === auc.highestBidder) || null;
      return {
        ...auc,
        crop: cropObj,
        highestBidder: bidderObj ? { _id: bidderObj._id, name: bidderObj.name } : null
      };
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Auction.findById(id).populate('crop').populate('highestBidder', 'name');
      let auctions = readJson('auctions');
      let auc = auctions.find(item => item._id === id);
      if (!auc) return null;
      let crops = readJson('crops');
      let users = readJson('users');
      const cropObj = crops.find(c => c._id === auc.crop) || { name: 'Unknown Crop' };
      const bidderObj = users.find(u => u._id === auc.highestBidder) || null;
      return {
        ...auc,
        crop: cropObj,
        highestBidder: bidderObj ? { _id: bidderObj._id, name: bidderObj.name } : null
      };
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Auction.create(doc);
      let auctions = readJson('auctions');
      const newDoc = { 
        _id: generateId(), 
        ...doc, 
        bids: [], 
        highestBid: doc.highestBid || 0,
        status: 'active', 
        createdAt: new Date().toISOString() 
      };
      auctions.push(newDoc);
      writeJson('auctions', auctions);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Auction.findByIdAndUpdate(id, update, { new: true });
      let auctions = readJson('auctions');
      let index = auctions.findIndex(item => item._id === id);
      if (index === -1) return null;
      const updatedItem = { ...auctions[index], ...update };
      auctions[index] = updatedItem;
      writeJson('auctions', auctions);
      return updatedItem;
    }
  },

  orders: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Order.find(query).populate('crop').populate('farmer', 'name').populate('buyer', 'name');
      let orders = readJson('orders');
      let crops = readJson('crops');
      let users = readJson('users');

      let filtered = orders.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });

      return filtered.map(ord => {
        const cropObj = crops.find(c => c._id === ord.crop) || { name: 'Unknown Crop' };
        const farmerObj = users.find(u => u._id === ord.farmer) || { name: 'Unknown Farmer' };
        const buyerObj = users.find(u => u._id === ord.buyer) || { name: 'Unknown Buyer' };
        return {
          ...ord,
          crop: cropObj,
          farmer: farmerObj,
          buyer: buyerObj
        };
      });
    },
    findOne: async (query) => {
      if (!db.useLocalMock()) return await Order.findOne(query).populate('crop').populate('farmer', 'name').populate('buyer', 'name');
      let orders = readJson('orders');
      let ord = orders.find(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
      if (!ord) return null;
      let crops = readJson('crops');
      let users = readJson('users');
      const cropObj = crops.find(c => c._id === ord.crop) || { name: 'Unknown Crop' };
      const farmerObj = users.find(u => u._id === ord.farmer) || { name: 'Unknown Farmer' };
      const buyerObj = users.find(u => u._id === ord.buyer) || { name: 'Unknown Buyer' };
      return {
        ...ord,
        crop: cropObj,
        farmer: farmerObj,
        buyer: buyerObj
      };
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Order.findById(id).populate('crop').populate('farmer', 'name').populate('buyer', 'name');
      let orders = readJson('orders');
      let ord = orders.find(item => item._id === id);
      if (!ord) return null;
      let crops = readJson('crops');
      let users = readJson('users');
      const cropObj = crops.find(c => c._id === ord.crop) || { name: 'Unknown Crop' };
      const farmerObj = users.find(u => u._id === ord.farmer) || { name: 'Unknown Farmer' };
      const buyerObj = users.find(u => u._id === ord.buyer) || { name: 'Unknown Buyer' };
      return {
        ...ord,
        crop: cropObj,
        farmer: farmerObj,
        buyer: buyerObj
      };
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Order.create(doc);
      let orders = readJson('orders');
      const newDoc = { 
        _id: generateId(), 
        ...doc, 
        paymentStatus: doc.paymentStatus || 'pending',
        deliveryStatus: doc.deliveryStatus || 'pending',
        createdAt: new Date().toISOString() 
      };
      orders.push(newDoc);
      writeJson('orders', orders);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Order.findByIdAndUpdate(id, update, { new: true });
      let orders = readJson('orders');
      let index = orders.findIndex(item => item._id === id);
      if (index === -1) return null;
      const updatedItem = { ...orders[index], ...update };
      orders[index] = updatedItem;
      writeJson('orders', orders);
      return updatedItem;
    }
  negotiations: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Negotiation.find(query);
      let data = readJson('negotiations');
      return data.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Negotiation.findById(id).populate('crop').populate('buyer', 'name').populate('seller', 'name');
      let data = readJson('negotiations');
      return data.find(item => item._id === id) || null;
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Negotiation.create(doc);
      let data = readJson('negotiations');
      const newDoc = { 
        _id: generateId(), 
        ...doc, 
        messages: doc.messages || [],
        createdAt: new Date().toISOString() 
      };
      data.push(newDoc);
      writeJson('negotiations', data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Negotiation.findByIdAndUpdate(id, update, { new: true });
      let data = readJson('negotiations');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;
      
      let updatedItem = { ...data[index] };
      if (update.$push && update.$push.messages) {
        updatedItem.messages = updatedItem.messages || [];
        updatedItem.messages.push({ _id: generateId(), ...update.$push.messages, createdAt: new Date().toISOString() });
      } else {
        Object.assign(updatedItem, update);
      }
      
      data[index] = updatedItem;
      writeJson('negotiations', data);
      return updatedItem;
    }
  },

  reviews: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Review.find(query);
      let data = readJson('reviews');
      return data.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Review.findById(id);
      let data = readJson('reviews');
      return data.find(item => item._id === id) || null;
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Review.create(doc);
      let data = readJson('reviews');
      const newDoc = { _id: generateId(), ...doc, likes: doc.likes || [], createdAt: new Date().toISOString() };
      data.push(newDoc);
      writeJson('reviews', data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Review.findByIdAndUpdate(id, update, { new: true });
      let data = readJson('reviews');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;
      
      let updatedItem = { ...data[index] };
      if (update.$push && update.$push.likes) {
        updatedItem.likes = updatedItem.likes || [];
        if (!updatedItem.likes.includes(update.$push.likes)) {
          updatedItem.likes.push(update.$push.likes);
        }
      } else if (update.$pull && update.$pull.likes) {
        updatedItem.likes = updatedItem.likes || [];
        updatedItem.likes = updatedItem.likes.filter(id => id !== update.$pull.likes);
      } else {
        Object.assign(updatedItem, update);
      }
      
      data[index] = updatedItem;
      writeJson('reviews', data);
      return updatedItem;
    }
  },

  questions: {
    find: async (query = {}) => {
      if (!db.useLocalMock()) return await Question.find(query);
      let data = readJson('questions');
      return data.filter(item => {
        for (let k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      if (!db.useLocalMock()) return await Question.findById(id);
      let data = readJson('questions');
      return data.find(item => item._id === id) || null;
    },
    create: async (doc) => {
      if (!db.useLocalMock()) return await Question.create(doc);
      let data = readJson('questions');
      const newDoc = { _id: generateId(), ...doc, answers: doc.answers || [], createdAt: new Date().toISOString() };
      data.push(newDoc);
      writeJson('questions', data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (!db.useLocalMock()) return await Question.findByIdAndUpdate(id, update, { new: true });
      let data = readJson('questions');
      let index = data.findIndex(item => item._id === id);
      if (index === -1) return null;

      let updatedItem = { ...data[index] };
      if (update.$push && update.$push.answers) {
        updatedItem.answers = updatedItem.answers || [];
        updatedItem.answers.push({ _id: generateId(), ...update.$push.answers, createdAt: new Date().toISOString() });
      } else {
        Object.assign(updatedItem, update);
      }

      data[index] = updatedItem;
      writeJson('questions', data);
      return updatedItem;
    }
  }
};

module.exports = dbManager;
