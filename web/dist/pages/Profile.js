import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Avatar, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton, } from '@mui/material';
import { Edit, Chat, Settings, Logout, PhotoCamera, } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const handleEdit = () => {
        if (user) {
            setDisplayName(user.displayName);
            setBio(''); // 実際のbioデータを設定
        }
        setIsEditing(true);
    };
    const handleSave = async () => {
        try {
            // プロフィール更新APIを呼び出し
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName,
                    bio,
                }),
            });
            if (response.ok) {
                setIsEditing(false);
                // ユーザー情報を更新
                // dispatch(updateUser({ displayName, bio }));
            }
        }
        catch (error) {
            console.error('プロフィールの更新に失敗しました:', error);
        }
    };
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // 画像アップロード処理
            const formData = new FormData();
            formData.append('avatar', file);
            fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            });
        }
    };
    if (!user) {
        return null;
    }
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 3 }, children: [_jsxs(Box, { sx: { position: 'relative', display: 'inline-block' }, children: [_jsx(Avatar, { src: user.photoURL, sx: { width: 100, height: 100, mb: 2 } }), _jsx("input", { accept: "image/*", style: { display: 'none' }, id: "avatar-upload", type: "file", onChange: handleImageUpload }), _jsx("label", { htmlFor: "avatar-upload", children: _jsx(IconButton, { component: "span", sx: {
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    }, children: _jsx(PhotoCamera, {}) }) })] }), _jsx(Typography, { variant: "h5", gutterBottom: true, children: user.displayName }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: user.email }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u53C2\u52A0\u4E2D\u306E\u30EB\u30FC\u30E0: 3\u500B" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Edit, {}), onClick: handleEdit, sx: { mt: 2 }, children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u7DE8\u96C6" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(List, { children: [_jsxs(ListItem, { button: true, onClick: () => navigate('/chat'), children: [_jsx(ListItemIcon, { children: _jsx(Chat, {}) }), _jsx(ListItemText, { primary: "\u53C2\u52A0\u4E2D\u306E\u30EB\u30FC\u30E0" })] }), _jsxs(ListItem, { button: true, onClick: () => navigate('/settings'), children: [_jsx(ListItemIcon, { children: _jsx(Settings, {}) }), _jsx(ListItemText, { primary: "\u8A2D\u5B9A" })] }), _jsxs(ListItem, { button: true, onClick: handleLogout, children: [_jsx(ListItemIcon, { children: _jsx(Logout, {}) }), _jsx(ListItemText, { primary: "\u30ED\u30B0\u30A2\u30A6\u30C8" })] })] }), _jsxs(Dialog, { open: isEditing, onClose: () => setIsEditing(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u7DE8\u96C6" }), _jsxs(DialogContent, { children: [_jsx(TextField, { fullWidth: true, label: "\u8868\u793A\u540D", value: displayName, onChange: (e) => setDisplayName(e.target.value), margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "\u81EA\u5DF1\u7D39\u4ECB", value: bio, onChange: (e) => setBio(e.target.value), margin: "normal", multiline: true, rows: 3 })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setIsEditing(false), children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: handleSave, variant: "contained", children: "\u4FDD\u5B58" })] })] })] }));
};
export default Profile;
