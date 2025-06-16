const Site = require('../models/Site');
const Antenna = require('../models/Antenna');
const TransmissionEquipment = require('../models/TransmissionEquipment');
const RadioEquipment = require('../models/RadioEquipment');
const mongoose = require('mongoose');

// Get all sites
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sites' });
  }
};

// Get site by ID
exports.getSiteById = async (req, res) => {
  try {
    const site = await Site.findOne({ id: req.params.id });
    
    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    res.status(200).json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du site' });
  }
};

// Create new site
exports.createSite = async (req, res) => {
  try {
    console.log('Creating site with data:', JSON.stringify(req.body, null, 2));
    
    // Extract equipment data from request body
    const { antennas = [], transmission = [], radio = [], ...siteData } = req.body;
    
    console.log('Site data after extraction:', JSON.stringify(siteData, null, 2));
    console.log('Equipment data:', {
      antennas: antennas.length,
      transmission: transmission.length,
      radio: radio.length
    });
    
    // Filter out equipment with empty required fields
    const validAntennas = antennas.filter(antenna => 
      antenna.model && antenna.model.trim() !== '' &&
      antenna.type && antenna.type.trim() !== '' &&
      antenna.band && antenna.band.trim() !== ''
    );
    
    const validTransmission = transmission.filter(equipment => 
      equipment.model && equipment.model.trim() !== '' &&
      equipment.capacity && equipment.capacity.trim() !== ''
    );
    
    const validRadio = radio.filter(equipment => 
      equipment.model && equipment.model.trim() !== '' &&
      equipment.technology && equipment.technology.trim() !== ''
    );
    
    console.log(`Filtered equipment counts: antennas=${validAntennas.length}, transmission=${validTransmission.length}, radio=${validRadio.length}`);
    
    // Check if site with this ID already exists
    const existingSite = await Site.findOne({ id: siteData.id });
    if (existingSite) {
      console.log('Site with ID already exists:', siteData.id);
      return res.status(400).json({ message: 'Un site avec cet ID existe déjà' });
    }
    
    // Create new site
    const newSite = new Site(siteData);
    
    // Set equipment count based on valid equipment
    newSite.equipmentCount = validAntennas.length + validTransmission.length + validRadio.length;
    
    // Validate site data before saving
    try {
      await newSite.validateSync();
      console.log('Site validation passed');
    } catch (validationError) {
      console.error('Site validation error:', validationError);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.errors 
      });
    }
    
    const savedSite = await newSite.save();
    console.log('Site saved successfully with ID:', savedSite._id);
    
    // Process equipment if provided
    if (validAntennas.length > 0 || validTransmission.length > 0 || validRadio.length > 0) {
      console.log('Processing equipment...');
      
      try {
        // Process antennas
        const antennaPromises = validAntennas.map(antenna => {
          console.log('Creating antenna:', antenna);
          const newAntenna = new Antenna({
            site: savedSite._id,
            ...antenna
          });
          
          // Validate antenna data
          try {
            newAntenna.validateSync();
          } catch (validationError) {
            console.error('Antenna validation error:', validationError);
            throw new Error(`Antenna validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newAntenna.save();
        });
        
        // Process transmission equipment
        const transmissionPromises = validTransmission.map(equipment => {
          console.log('Creating transmission equipment:', equipment);
          const newEquipment = new TransmissionEquipment({
            site: savedSite._id,
            ...equipment
          });
          
          // Validate transmission equipment data
          try {
            newEquipment.validateSync();
          } catch (validationError) {
            console.error('Transmission equipment validation error:', validationError);
            throw new Error(`Transmission equipment validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newEquipment.save();
        });
        
        // Process radio equipment
        const radioPromises = validRadio.map(equipment => {
          console.log('Creating radio equipment:', equipment);
          const newEquipment = new RadioEquipment({
            site: savedSite._id,
            ...equipment
          });
          
          // Validate radio equipment data
          try {
            newEquipment.validateSync();
          } catch (validationError) {
            console.error('Radio equipment validation error:', validationError);
            throw new Error(`Radio equipment validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newEquipment.save();
        });
        
        // Execute all promises
        console.log('Saving all equipment...');
        await Promise.all([
          Promise.all(antennaPromises),
          Promise.all(transmissionPromises),
          Promise.all(radioPromises)
        ]);
        console.log('All equipment saved successfully');
      } catch (equipmentError) {
        console.error('Error processing equipment:', equipmentError);
        // If equipment creation fails, we should clean up the site we created
        await Site.findByIdAndDelete(savedSite._id);
        throw equipmentError; // Re-throw to be caught by the outer try/catch
      }
    }
    
    console.log('Site creation completed successfully');
    
    res.status(201).json(savedSite);
  } catch (error) {
    console.error('Error creating site:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Erreur lors de la création du site';
    let statusCode = 500;
    
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      errorMessage = 'Erreur de validation des données';
      statusCode = 400;
      console.error('Validation error details:', error.errors || error.message);
    } else if (error.code === 11000) {
      errorMessage = 'Erreur de clé dupliquée';
      statusCode = 400;
      console.error('Duplicate key details:', error.keyValue);
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update site
exports.updateSite = async (req, res) => {
  try {
    console.log('Updating site with data:', JSON.stringify(req.body, null, 2));
    
    // Extract equipment data from request body
    const { antennas = [], transmission = [], radio = [], ...siteData } = req.body;
    
    // Find site by ID
    const site = await Site.findOne({ id: req.params.id });
    
    if (!site) {
      console.log('Site not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    // Update site data
    const updatedSite = await Site.findOneAndUpdate(
      { id: req.params.id },
      siteData,
      { new: true, runValidators: true }
    );
    
    console.log('Site updated successfully:', updatedSite._id);
    
    // If equipment data is provided, handle equipment updates
    if (antennas.length > 0 || transmission.length > 0 || radio.length > 0) {
      console.log('Updating equipment...');
      
      try {
        // Delete existing equipment for this site
        await Promise.all([
          Antenna.deleteMany({ site: site._id }),
          TransmissionEquipment.deleteMany({ site: site._id }),
          RadioEquipment.deleteMany({ site: site._id })
        ]);
        
        console.log('Existing equipment deleted');
        
        // Filter out antennas with empty required fields
        const validAntennas = antennas.filter(antenna => 
          antenna.model && antenna.model.trim() !== '' &&
          antenna.type && antenna.type.trim() !== '' &&
          antenna.band && antenna.band.trim() !== ''
        );
        
        // Filter out transmission equipment with empty required fields
        const validTransmission = transmission.filter(equipment => 
          equipment.model && equipment.model.trim() !== '' &&
          equipment.capacity && equipment.capacity.trim() !== ''
        );
        
        // Filter out radio equipment with empty required fields
        const validRadio = radio.filter(equipment => 
          equipment.model && equipment.model.trim() !== '' &&
          equipment.technology && equipment.technology.trim() !== ''
        );
        
        console.log(`Filtered equipment counts: antennas=${validAntennas.length}, transmission=${validTransmission.length}, radio=${validRadio.length}`);
        
        // Process new antennas
        const antennaPromises = validAntennas.map(antenna => {
          console.log('Creating updated antenna:', antenna);
          const newAntenna = new Antenna({
            site: site._id,
            ...antenna
          });
          
          // Validate antenna data
          try {
            newAntenna.validateSync();
          } catch (validationError) {
            console.error('Antenna validation error:', validationError);
            throw new Error(`Antenna validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newAntenna.save();
        });
        
        // Process new transmission equipment
        const transmissionPromises = validTransmission.map(equipment => {
          console.log('Creating updated transmission equipment:', equipment);
          const newEquipment = new TransmissionEquipment({
            site: site._id,
            ...equipment
          });
          
          // Validate transmission equipment data
          try {
            newEquipment.validateSync();
          } catch (validationError) {
            console.error('Transmission equipment validation error:', validationError);
            throw new Error(`Transmission equipment validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newEquipment.save();
        });
        
        // Process new radio equipment
        const radioPromises = validRadio.map(equipment => {
          console.log('Creating updated radio equipment:', equipment);
          const newEquipment = new RadioEquipment({
            site: site._id,
            ...equipment
          });
          
          // Validate radio equipment data
          try {
            newEquipment.validateSync();
          } catch (validationError) {
            console.error('Radio equipment validation error:', validationError);
            throw new Error(`Radio equipment validation error: ${JSON.stringify(validationError.errors)}`);
          }
          
          return newEquipment.save();
        });
        
        // Execute all promises
        console.log('Saving all updated equipment...');
        await Promise.all([
          Promise.all(antennaPromises),
          Promise.all(transmissionPromises),
          Promise.all(radioPromises)
        ]);
        
        console.log('All equipment updated successfully');
        
        // Update equipment count
        const totalEquipment = validAntennas.length + validTransmission.length + validRadio.length;
        await Site.findByIdAndUpdate(
          site._id,
          { equipmentCount: totalEquipment }
        );
      } catch (equipmentError) {
        console.error('Error updating equipment:', equipmentError);
        throw equipmentError;
      }
    }
    
    console.log('Site update completed successfully');
    
    res.status(200).json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Erreur lors de la mise à jour du site';
    let statusCode = 500;
    
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      errorMessage = 'Erreur de validation des données';
      statusCode = 400;
      console.error('Validation error details:', error.errors || error.message);
    } else if (error.code === 11000) {
      errorMessage = 'Erreur de clé dupliquée';
      statusCode = 400;
      console.error('Duplicate key details:', error.keyValue);
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Archive site
exports.archiveSite = async (req, res) => {
  try {
    const site = await Site.findOneAndUpdate(
      { id: req.params.id },
      { status: 'archived' },
      { new: true }
    );
    
    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    res.status(200).json(site);
  } catch (error) {
    console.error('Error archiving site:', error);
    res.status(500).json({ message: 'Erreur lors de l\'archivage du site' });
  }
};

// Delete site
exports.deleteSite = async (req, res) => {
  try {
    console.log('Attempting to delete site with ID:', req.params.id);
    
    // Find site by ID
    const site = await Site.findOne({ id: req.params.id });
    
    if (!site) {
      console.log('Site not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    // Delete all equipment associated with this site
    console.log('Deleting associated equipment for site:', site._id);
    await Promise.all([
      Antenna.deleteMany({ site: site._id }),
      TransmissionEquipment.deleteMany({ site: site._id }),
      RadioEquipment.deleteMany({ site: site._id })
    ]);
    
    // Delete the site
    console.log('Deleting site:', site._id);
    await Site.findOneAndDelete({ id: req.params.id });
    
    console.log('Site and all equipment deleted successfully');
    
    res.status(200).json({ message: 'Site supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du site' });
  }
};

// Filter sites
exports.filterSites = async (req, res) => {
  try {
    const { status, category, technology, search } = req.query;
    const query = {};
    
    // Add filters to query
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (technology && technology !== 'all') {
      query.technologies = technology;
    }
    
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sites = await Site.find(query);
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error filtering sites:', error);
    res.status(500).json({ message: 'Erreur lors du filtrage des sites' });
  }
};

// Get site with all equipment
exports.getSiteWithEquipment = async (req, res) => {
  try {
    // Find site by ID
    const site = await Site.findOne({ id: req.params.id });
    
    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }
    
    // Find all equipment for this site
    const [antennas, transmission, radio] = await Promise.all([
      Antenna.find({ site: site._id }),
      TransmissionEquipment.find({ site: site._id }),
      RadioEquipment.find({ site: site._id })
    ]);
    
    // Combine site data with equipment data
    const siteWithEquipment = {
      ...site.toObject(),
      equipment: {
        antennas,
        transmission,
        radio
      }
    };
    
    res.status(200).json(siteWithEquipment);
  } catch (error) {
    console.error('Error fetching site with equipment:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du site et de ses équipements' });
  }
};
