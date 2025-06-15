const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Register new user
exports.register = async (req, res) => {
  try {
    const { nom, email, password, role, site } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create user
    const user = await User.create({
      nom,
      email,
      password,
      role: role || 'Technicien',
      site: site || '-',
      status: 'actif'
    });
    
    // Update lastLogin
    user.lastLogin = Date.now();
    await user.save();
    
    // Create notification
    await Notification.create({
      title: 'Nouvel utilisateur',
      message: `Un nouvel utilisateur ${nom} (${role || 'Technicien'}) a été créé.`,
      role: 'Admin'
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        site: user.site,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is locked
    if (user.status === 'verrouillé') {
      return res.status(401).json({ message: 'Your account is locked. Please contact an administrator.' });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        site: user.site,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user profile', error: error.message });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  try {
    const { nom, email, site, phone, bio, username, currentPassword, newPassword } = req.body;
    
    // Build update object with only allowed fields
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (email) updateData.email = email;
    if (site) updateData.site = site;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    
    // Handle username field - only update if provided and not empty
    if (username !== undefined) {
      // If username is empty string, set it to null to avoid unique constraint issues
      updateData.username = username.trim() === '' ? null : username.trim();
    }
    
    // Check if email is being changed and if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }
    
    // Check if username is being changed and if it's already in use
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: req.user.id } // Exclude current user
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé par un autre utilisateur' });
      }
    }
    
    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Get user with password
      const user = await User.findById(req.user.id);
      
      // Check if current password matches
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Le mot de passe actuel est incorrect' });
      }
      
      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      }
      
      // Set new password
      user.password = newPassword;
      await user.save(); // This will trigger the pre-save hook to hash the password
      
      // Create notification for password change
      await Notification.create({
        title: 'Mot de passe modifié',
        message: `L'utilisateur ${user.nom} a modifié son mot de passe.`,
        role: 'Admin',
        userId: user._id
      });
    }
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Create notification for profile update if fields other than password were updated
    if (Object.keys(updateData).length > 0) {
      await Notification.create({
        title: 'Profil mis à jour',
        message: `L'utilisateur ${updatedUser.nom} a mis à jour son profil.`,
        role: 'Admin',
        userId: updatedUser._id
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Create email message
    const message = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
      <a href="${resetUrl}" target="_blank">Réinitialiser le mot de passe</a>
      <p>Ce lien expirera dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    `;
    
    // Send email
    await transporter.sendMail({
      from: `"TTCONNECT" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      html: message
    });
    
    // Create notification
    await Notification.create({
      title: 'Demande de réinitialisation de mot de passe',
      message: `L'utilisateur ${user.nom} a demandé une réinitialisation de mot de passe.`,
      role: 'Admin',
      userId: user._id
    });
    
    res.status(200).json({ message: 'Email envoyé' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    
    // Clear reset fields
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    }
    
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de réinitialisation' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Create notification
    await Notification.create({
      title: 'Mot de passe réinitialisé',
      message: `L'utilisateur ${user.nom} a réinitialisé son mot de passe.`,
      role: 'Admin',
      userId: user._id
    });
    
    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};