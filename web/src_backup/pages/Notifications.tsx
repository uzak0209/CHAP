import React, { useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite,
  Comment,
  AdminPanelSettings,
  Event,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, markAllAsRead } from '../store/slices/notificationsSlice';
import { RootState } from '../store';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    // 通知を取得
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      // dispatch(setNotifications(data.notifications));
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return <Favorite color="error" />;
      case 'comment':
        return <Comment color="primary" />;
      case 'admin':
        return <AdminPanelSettings color="warning" />;
      case 'event':
        return <Event color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else {
      return `${days}日前`;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          通知
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        {unreadCount > 0 && (
          <IconButton onClick={handleMarkAllAsRead}>
            <Typography variant="body2" color="primary">
              すべて既読
            </Typography>
          </IconButton>
        )}
      </Box>

      <List>
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              通知はありません
            </Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                    }}
                  />
                )}
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default Notifications; 