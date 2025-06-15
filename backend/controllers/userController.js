const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { nom, email, password, role, site, status, username } = req.body;
    
    // Check if user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    console.log(username);
    const user = new User({
      nom,
      email,
      password,
      role,
      site,
      status,
      username
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { nom, email, role, site, status, password } = req.body;
    
    // Build update object
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (site) updateData.site = site;
    if (status) updateData.status = status;
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['Admin', 'Manager', 'Technicien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const users = await User.find({ role, status: 'actif' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
};

// Update user status (lock/unlock)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['actif', 'inactif', 'verrouillé'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();
    
    // Count users by role
    const technicians = await User.countDocuments({ role: 'Technicien' });
    const managers = await User.countDocuments({ role: 'Manager' });
    const admins = await User.countDocuments({ role: 'Admin' });
    
    // Count users by status
    const activeUsers = await User.countDocuments({ status: 'actif' });
    const inactiveUsers = await User.countDocuments({ status: 'inactif' });
    const lockedUsers = await User.countDocuments({ status: 'verrouillé' });
    
    res.json({
      totalUsers,
      technicians,
      managers,
      admins,
      activeUsers,
      inactiveUsers,
      lockedUsers
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
  }
}; 