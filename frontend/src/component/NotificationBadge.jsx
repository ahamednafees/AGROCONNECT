import React, { useState, useEffect } from "react";
import { getUserNotifications } from "../services/climateService";

const NotificationBadge = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const notifications = await getUserNotifications(userId);
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span className="badge bg-danger rounded-pill ms-2">
      {unreadCount}
    </span>
  );
};

export default NotificationBadge;
