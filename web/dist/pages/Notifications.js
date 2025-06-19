import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography, IconButton, Chip, Divider, } from '@mui/material';
import { Notifications as NotificationsIcon, Favorite, Comment, AdminPanelSettings, Event, } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, markAllAsRead } from '../store/slices/notificationsSlice';
const Notifications = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    useEffect(() => {
        // 通知を取得
        fetchNotifications();
    }, []);
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            // dispatch(setNotifications(data.notifications));
        }
        catch (error) {
            console.error('通知の取得に失敗しました:', error);
        }
    };
    const handleNotificationClick = (notificationId) => {
        dispatch(markAsRead(notificationId));
    };
    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'reaction':
                return _jsx(Favorite, { color: "error" });
            case 'comment':
                return _jsx(Comment, { color: "primary" });
            case 'admin':
                return _jsx(AdminPanelSettings, { color: "warning" });
            case 'event':
                return _jsx(Event, { color: "success" });
            default:
                return _jsx(NotificationsIcon, {});
        }
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 60) {
            return `${minutes}分前`;
        }
        else if (hours < 24) {
            return `${hours}時間前`;
        }
        else {
            return `${days}日前`;
        }
    };
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", children: ["\u901A\u77E5", unreadCount > 0 && (_jsx(Chip, { label: unreadCount, color: "error", size: "small", sx: { ml: 1 } }))] }), unreadCount > 0 && (_jsx(IconButton, { onClick: handleMarkAllAsRead, children: _jsx(Typography, { variant: "body2", color: "primary", children: "\u3059\u3079\u3066\u65E2\u8AAD" }) }))] }), _jsx(List, { children: notifications.length === 0 ? (_jsxs(Box, { sx: { textAlign: 'center', py: 4 }, children: [_jsx(NotificationsIcon, { sx: { fontSize: 48, color: 'text.secondary', mb: 2 } }), _jsx(Typography, { variant: "body1", color: "text.secondary", children: "\u901A\u77E5\u306F\u3042\u308A\u307E\u305B\u3093" })] })) : (notifications.map((notification, index) => (_jsxs(React.Fragment, { children: [_jsxs(ListItem, { button: true, onClick: () => handleNotificationClick(notification.id), sx: {
                                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                            }, children: [_jsx(ListItemIcon, { children: getNotificationIcon(notification.type) }), _jsx(ListItemText, { primary: notification.title, secondary: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: notification.message }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: formatTime(notification.createdAt) })] }) }), !notification.isRead && (_jsx(Box, { sx: {
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'primary.main',
                                    } }))] }), index < notifications.length - 1 && _jsx(Divider, {})] }, notification.id)))) })] }));
};
export default Notifications;
