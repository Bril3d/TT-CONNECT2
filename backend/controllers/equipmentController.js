const Antenna = require('../models/Antenna');
const TransmissionEquipment = require('../models/TransmissionEquipment');
const RadioEquipment = require('../models/RadioEquipment');
const Site = require('../models/Site');
const mongoose = require('mongoose');

// ANTENNA CONTROLLERS
// Get all antennas for a site
exports.getSiteAntennas = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Find antennas for this site
    const antennas = await Antenna.find({ site: site._id });
    
    res.status(200).json(antennas);
  } catch (error) {
    console.error('Error fetching antennas:', error);
    res.status(500).json({ message: 'Error fetching antennas' });
  }
};

// Add antenna to site
exports.addAntenna = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Create new antenna with reference to site
    const newAntenna = new Antenna({
      site: site._id,
      ...req.body
    });
    
    const savedAntenna = await newAntenna.save();
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(site._id, { $inc: { equipmentCount: 1 } });
    
    res.status(201).json(savedAntenna);
  } catch (error) {
    console.error('Error adding antenna:', error);
    res.status(500).json({ message: 'Error adding antenna' });
  }
};

// Update antenna
exports.updateAntenna = async (req, res) => {
  try {
    const antennaId = req.params.antennaId;
    
    const updatedAntenna = await Antenna.findByIdAndUpdate(
      antennaId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAntenna) {
      return res.status(404).json({ message: 'Antenna not found' });
    }
    
    res.status(200).json(updatedAntenna);
  } catch (error) {
    console.error('Error updating antenna:', error);
    res.status(500).json({ message: 'Error updating antenna' });
  }
};

// Delete antenna
exports.deleteAntenna = async (req, res) => {
  try {
    const antennaId = req.params.antennaId;
    
    const antenna = await Antenna.findById(antennaId);
    
    if (!antenna) {
      return res.status(404).json({ message: 'Antenna not found' });
    }
    
    // Get site ID before deleting antenna
    const siteId = antenna.site;
    
    // Delete the antenna
    await Antenna.findByIdAndDelete(antennaId);
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(siteId, { $inc: { equipmentCount: -1 } });
    
    res.status(200).json({ message: 'Antenna deleted successfully' });
  } catch (error) {
    console.error('Error deleting antenna:', error);
    res.status(500).json({ message: 'Error deleting antenna' });
  }
};

// TRANSMISSION EQUIPMENT CONTROLLERS
// Get all transmission equipment for a site
exports.getSiteTransmissionEquipment = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Find transmission equipment for this site
    const equipment = await TransmissionEquipment.find({ site: site._id });
    
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching transmission equipment:', error);
    res.status(500).json({ message: 'Error fetching transmission equipment' });
  }
};

// Add transmission equipment to site
exports.addTransmissionEquipment = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Create new transmission equipment with reference to site
    const newEquipment = new TransmissionEquipment({
      site: site._id,
      ...req.body
    });
    
    const savedEquipment = await newEquipment.save();
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(site._id, { $inc: { equipmentCount: 1 } });
    
    res.status(201).json(savedEquipment);
  } catch (error) {
    console.error('Error adding transmission equipment:', error);
    res.status(500).json({ message: 'Error adding transmission equipment' });
  }
};

// Update transmission equipment
exports.updateTransmissionEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId;
    
    const updatedEquipment = await TransmissionEquipment.findByIdAndUpdate(
      equipmentId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Transmission equipment not found' });
    }
    
    res.status(200).json(updatedEquipment);
  } catch (error) {
    console.error('Error updating transmission equipment:', error);
    res.status(500).json({ message: 'Error updating transmission equipment' });
  }
};

// Delete transmission equipment
exports.deleteTransmissionEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId;
    
    const equipment = await TransmissionEquipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Transmission equipment not found' });
    }
    
    // Get site ID before deleting equipment
    const siteId = equipment.site;
    
    // Delete the equipment
    await TransmissionEquipment.findByIdAndDelete(equipmentId);
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(siteId, { $inc: { equipmentCount: -1 } });
    
    res.status(200).json({ message: 'Transmission equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting transmission equipment:', error);
    res.status(500).json({ message: 'Error deleting transmission equipment' });
  }
};

// RADIO EQUIPMENT CONTROLLERS
// Get all radio equipment for a site
exports.getSiteRadioEquipment = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Find radio equipment for this site
    const equipment = await RadioEquipment.find({ site: site._id });
    
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching radio equipment:', error);
    res.status(500).json({ message: 'Error fetching radio equipment' });
  }
};

// Add radio equipment to site
exports.addRadioEquipment = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Create new radio equipment with reference to site
    const newEquipment = new RadioEquipment({
      site: site._id,
      ...req.body
    });
    
    const savedEquipment = await newEquipment.save();
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(site._id, { $inc: { equipmentCount: 1 } });
    
    res.status(201).json(savedEquipment);
  } catch (error) {
    console.error('Error adding radio equipment:', error);
    res.status(500).json({ message: 'Error adding radio equipment' });
  }
};

// Update radio equipment
exports.updateRadioEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId;
    
    const updatedEquipment = await RadioEquipment.findByIdAndUpdate(
      equipmentId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Radio equipment not found' });
    }
    
    res.status(200).json(updatedEquipment);
  } catch (error) {
    console.error('Error updating radio equipment:', error);
    res.status(500).json({ message: 'Error updating radio equipment' });
  }
};

// Delete radio equipment
exports.deleteRadioEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId;
    
    const equipment = await RadioEquipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Radio equipment not found' });
    }
    
    // Get site ID before deleting equipment
    const siteId = equipment.site;
    
    // Delete the equipment
    await RadioEquipment.findByIdAndDelete(equipmentId);
    
    // Update equipment count on site
    await Site.findByIdAndUpdate(siteId, { $inc: { equipmentCount: -1 } });
    
    res.status(200).json({ message: 'Radio equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting radio equipment:', error);
    res.status(500).json({ message: 'Error deleting radio equipment' });
  }
};

// BULK OPERATIONS
// Add multiple equipment items at once when creating or updating a site
exports.addBulkEquipment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { siteId, antennas = [], transmission = [], radio = [] } = req.body;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Process antennas
    const antennaPromises = antennas.map(antenna => {
      const newAntenna = new Antenna({
        site: site._id,
        ...antenna
      });
      return newAntenna.save({ session });
    });
    
    // Process transmission equipment
    const transmissionPromises = transmission.map(equipment => {
      const newEquipment = new TransmissionEquipment({
        site: site._id,
        ...equipment
      });
      return newEquipment.save({ session });
    });
    
    // Process radio equipment
    const radioPromises = radio.map(equipment => {
      const newEquipment = new RadioEquipment({
        site: site._id,
        ...equipment
      });
      return newEquipment.save({ session });
    });
    
    // Execute all promises
    const [savedAntennas, savedTransmission, savedRadio] = await Promise.all([
      Promise.all(antennaPromises),
      Promise.all(transmissionPromises),
      Promise.all(radioPromises)
    ]);
    
    // Update equipment count on site
    const totalEquipment = antennas.length + transmission.length + radio.length;
    await Site.findByIdAndUpdate(
      site._id, 
      { equipmentCount: totalEquipment },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      message: 'Equipment added successfully',
      antennas: savedAntennas,
      transmission: savedTransmission,
      radio: savedRadio
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding bulk equipment:', error);
    res.status(500).json({ message: 'Error adding equipment', error: error.message });
  }
};

// Get all equipment for a site
exports.getAllSiteEquipment = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    
    // Find the site by its custom ID field
    const site = await Site.findOne({ id: siteId });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Find all equipment for this site
    const [antennas, transmission, radio] = await Promise.all([
      Antenna.find({ site: site._id }),
      TransmissionEquipment.find({ site: site._id }),
      RadioEquipment.find({ site: site._id })
    ]);
    
    res.status(200).json({
      antennas,
      transmission,
      radio
    });
  } catch (error) {
    console.error('Error fetching site equipment:', error);
    res.status(500).json({ message: 'Error fetching site equipment' });
  }
}; 