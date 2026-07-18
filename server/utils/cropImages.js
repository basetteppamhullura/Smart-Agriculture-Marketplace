const defaultImage = "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80";

const cropImages = {
  // Rice Varieties
  "basmati rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  "basmati": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  "sona masuri": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
  "red rice": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
  "brown rice": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
  "paddy": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
  "ಭತ್ತ": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
  "ಅಕ್ಕಿ": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",

  // Millets
  "ragi": "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  "finger millet": "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  "ರಾಗಿ": "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  
  "jowar": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  "sorghum": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  "ಜೋಳ": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  
  "bajra": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
  "pearl millet": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
  "ಸಜ್ಜೆ": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",

  "foxtail millet": "https://images.unsplash.com/photo-1622484211148-717df3e4e976?auto=format&fit=crop&w=600&q=80",
  "navane": "https://images.unsplash.com/photo-1622484211148-717df3e4e976?auto=format&fit=crop&w=600&q=80",
  "ನವಣೆ": "https://images.unsplash.com/photo-1622484211148-717df3e4e976?auto=format&fit=crop&w=600&q=80",

  "little millet": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  "samai": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  "ಸಾಮೆ": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",

  "barnyard millet": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  "oodalu": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  "ಊದಲು": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",

  "kodo millet": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
  "harka": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
  "ಹರಕ": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",

  "proso millet": "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
  "baragu": "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
  "ಬರಗು": "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",

  // Grains
  "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  "ಗೋಧಿ": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  
  "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
  "corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
  "ಮೆಕ್ಕೆಜೋಳ": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",

  "barley": "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=600&q=80",
  "ಯವ": "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=600&q=80",

  "oats": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",
  "ಓಟ್ಸ್": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",

  // Pulses
  "toor dal": "https://images.unsplash.com/photo-1585994464166-51e600570b55?auto=format&fit=crop&w=600&q=80",
  "togari": "https://images.unsplash.com/photo-1585994464166-51e600570b55?auto=format&fit=crop&w=600&q=80",
  "ತೊಗರಿ": "https://images.unsplash.com/photo-1585994464166-51e600570b55?auto=format&fit=crop&w=600&q=80",

  "green gram": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",
  "hesaru": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",
  "ಹೆಸರು": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",

  "black gram": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  "uddina": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  "ಉದ್ದಿನ": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",

  "bengal gram": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  "kadale": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  "ಕಡಲೆ": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",

  "horse gram": "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=600&q=80",
  "huruli": "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=600&q=80",
  "ಹುರುಳಿ": "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=600&q=80",

  "cowpea": "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
  "alasande": "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
  "ಅಲಸಂದೆ": "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",

  // Oil Seeds
  "groundnut": "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=600&q=80",
  "peanut": "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=600&q=80",
  "ಕಡಲೆಕಾಯಿ": "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=600&q=80",

  "sesame": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
  "ellu": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
  "ಎಳ್ಳು": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",

  "sunflower": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
  "ಸೂರ್ಯಕಾಂತಿ": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",

  "castor": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
  "haralu": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
  "ಹರಳು": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",

  // Commercial Crops
  "sugarcane": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80",
  "ಕಬ್ಬು": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80",

  "cotton": "https://images.unsplash.com/photo-1594614271360-0ed9a570ae15?auto=format&fit=crop&w=600&q=80",
  "ಹತ್ತಿ": "https://images.unsplash.com/photo-1594614271360-0ed9a570ae15?auto=format&fit=crop&w=600&q=80",

  "arecanut": "https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80",
  "adike": "https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80",
  "ಅಡಿಕೆ": "https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80",

  "coconut": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  "ತೆಂಗಿನ": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",

  "turmeric": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  "ಅರಿಶಿನ": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",

  "ginger": "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  "ಶುಂಠಿ": "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",

  "pepper": "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80",
  "ಮೆಣಸು": "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80",

  "cardamom": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
  "elakki": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
  "ಏಲಕ್ಕಿ": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",

  // Fruits
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  "ಮಾವು": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",

  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
  "ಬಾಳೆಹಣ್ಣು": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",

  "grapes": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
  "ದ್ರಾಕ್ಷಿ": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",

  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
  "ಸೇಬು": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",

  "orange": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80",
  "ಕಿತ್ತಳೆ": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80",

  // Vegetables
  "tomato": "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80",
  "ಟೊಮೇಟೊ": "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80",

  "onion": "https://images.unsplash.com/photo-1580145690606-cd34c718c3a9?auto=format&fit=crop&w=600&q=80",
  "ಈರುಳ್ಳಿ": "https://images.unsplash.com/photo-1580145690606-cd34c718c3a9?auto=format&fit=crop&w=600&q=80",

  "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
  "ಆಲೂಗೆಡ್ಡೆ": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",

  "carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
  "ಕ್ಯಾರೆಟ್": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",

  "cabbage": "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=600&q=80",
  "ಕೋಸು": "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=600&q=80",

  "cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?auto=format&fit=crop&w=600&q=80",
  "ಹೂಕೋಸು": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?auto=format&fit=crop&w=600&q=80",

  "brinjal": "https://images.unsplash.com/photo-1528826722302-d3a148536b36?auto=format&fit=crop&w=600&q=80",
  "eggplant": "https://images.unsplash.com/photo-1528826722302-d3a148536b36?auto=format&fit=crop&w=600&q=80",
  "ಬದನೆಕಾಯಿ": "https://images.unsplash.com/photo-1528826722302-d3a148536b36?auto=format&fit=crop&w=600&q=80",

  "chilli": "https://images.unsplash.com/photo-1588252303782-cb80119cb665?auto=format&fit=crop&w=600&q=80",
  "ಮೆಣಸಿನಕಾಯಿ": "https://images.unsplash.com/photo-1588252303782-cb80119cb665?auto=format&fit=crop&w=600&q=80"
};

const getImageForCrop = (cropName) => {
  if (!cropName) return defaultImage;
  const nameLower = cropName.toLowerCase().trim();
  for (let keyword in cropImages) {
    if (nameLower.includes(keyword)) {
      return cropImages[keyword];
    }
  }
  return defaultImage;
};

module.exports = {
  cropImages,
  getImageForCrop
};
