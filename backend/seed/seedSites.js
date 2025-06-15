const mongoose = require('mongoose');
require('dotenv').config();
const Site = require('../models/Site');

// Mock data for sites
const sitesData = [
  {
    id: "TUN-GSM-042",
    name: "Tunis Centre",
    address: "Avenue Habib Bourguiba, Tunis",
    coordinates: "36.8065, 10.1815",
    category: "macro",
    type: "outdoor",
    status: "active",
    technologies: ["2G", "3G", "4G"],
    lastMaintenance: "15/04/2023",
    equipmentCount: 8,
  },
  {
    id: "SFX-GSM-118",
    name: "Sfax Nord",
    address: "Route de Tunis, Sfax",
    coordinates: "34.7478, 10.7661",
    category: "micro",
    type: "outdoor",
    status: "active",
    technologies: ["2G", "3G", "4G", "5G"],
    lastMaintenance: "03/03/2023",
    equipmentCount: 12,
  },
  {
    id: "NBL-GSM-073",
    name: "Nabeul Est",
    address: "Avenue Habib Bourguiba, Nabeul",
    coordinates: "36.4513, 10.7381",
    category: "macro",
    type: "outdoor",
    status: "maintenance",
    technologies: ["2G", "3G", "4G"],
    lastMaintenance: "22/02/2023",
    equipmentCount: 9,
  },
  {
    id: "BZT-GSM-091",
    name: "Bizerte Port",
    address: "Port de Bizerte, Bizerte",
    coordinates: "37.2744, 9.8739",
    category: "micro",
    type: "outdoor",
    status: "active",
    technologies: ["2G", "3G", "4G"],
    lastMaintenance: "10/01/2023",
    equipmentCount: 7,
  },
  {
    id: "SUS-GSM-054",
    name: "Sousse Plage",
    address: "Boulevard du 14 Janvier, Sousse",
    coordinates: "35.8245, 10.6346",
    category: "macro",
    type: "outdoor",
    status: "inactive",
    technologies: ["2G", "3G"],
    lastMaintenance: "05/12/2022",
    equipmentCount: 5,
  },
  {
    id: "KRN-GSM-032",
    name: "Kairouan Centre",
    address: "Avenue de la République, Kairouan",
    coordinates: "35.6784, 10.0963",
    category: "macro",
    type: "indoor",
    status: "archived",
    technologies: ["2G", "3G", "4G"],
    lastMaintenance: "18/11/2022",
    equipmentCount: 6,
  },
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing sites
      await Site.deleteMany({});
      console.log('Cleared existing sites');
      
      // Insert new sites
      const sites = await Site.insertMany(sitesData);
      console.log(`${sites.length} sites inserted successfully`);
      
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error seeding sites:', error);
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 