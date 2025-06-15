const Notification = require('../models/Notification');

// Get all notifications for a specific role or user
exports.getNotifications = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id;

    // Find notifications for this role, for all roles, or specifically for this user
    const notifications = await Notification.find({
      $or: [
        { role: role },
        { role: 'All' },
        { userId: userId }
      ]
    }).sort({ time: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, role, userId } = req.body;

    const notification = new Notification({
      title,
      message,
      role: role || 'All',
      userId: userId || null
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    await notification.remove();
    res.status(200).json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id;
    
    await Notification.updateMany(
      { 
        $or: [
          { role: role },
          { role: 'All' },
          { userId: userId }
        ],
        isRead: false
      },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' });
  }
};

// Get security alerts
exports.getSecurityAlerts = async (req, res) => {
  try {
    // Find security-related notifications (last 10)
    const alerts = await Notification.find({
      title: { $regex: /sécurité|alerte|connexion|tentative|échec|security|alert|login|attempt|failed/i }
    })
    .sort({ time: -1 })
    .limit(10)
    .lean();
    
    // Format for the dashboard
    const formattedAlerts = alerts.map(alert => ({
      title: alert.title,
      message: alert.message,
      time: alert.time || alert.createdAt,
      priority: alert.title.toLowerCase().includes('échec') || 
               alert.title.toLowerCase().includes('failed') ? 'high' : 'medium'
    }));
    
    res.status(200).json(formattedAlerts);
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des alertes de sécurité' });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    // Find recent notifications (last 10)
    const activities = await Notification.find({
      title: { $not: { $regex: /sécurité|alerte|connexion|tentative|échec|security|alert|login|attempt|failed/i } }
    })
    .sort({ time: -1 })
    .limit(10)
    .lean();
    
    // Format for the dashboard
    const formattedActivities = activities.map(activity => {
      // Determine activity type based on title
      let type = 'update';
      if (activity.title.toLowerCase().includes('nouvel') || 
          activity.title.toLowerCase().includes('créé') ||
          activity.title.toLowerCase().includes('new') ||
          activity.title.toLowerCase().includes('created')) {
        type = 'create';
      } else if (activity.title.toLowerCase().includes('supprimé') ||
                activity.title.toLowerCase().includes('deleted')) {
        type = 'delete';
      }
      
      return {
        title: activity.title,
        message: activity.message,
        time: activity.time || activity.createdAt,
        type,
        user: activity.user || 'Système'
      };
    });
    
    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des activités récentes' });
  }
};

// Get count of unread alerts
exports.getAlertsCount = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id;
    
    // Count unread notifications for this role, for all roles, or specifically for this user
    const count = await Notification.countDocuments({
      $or: [
        { role: role },
        { role: 'All' },
        { userId: userId }
      ],
      isRead: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error counting alerts:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des alertes' });
  }
}; 