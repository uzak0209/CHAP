import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Card, CardContent, Typography, Switch, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, AppBar, Toolbar, IconButton, FormControl, Select, MenuItem, } from '@mui/material';
import { ArrowBack, Notifications, LocationOn, Security, Help, ExitToApp, Delete, Person, Brightness6, Info, ContactSupport, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const Settings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        notifications: {
            posts: true,
            comments: true,
            mentions: true,
            admin: true,
        },
        location: {
            mode: 'app-only',
            shareLevel: 'approximate',
        },
        appearance: {
            theme: 'system',
            language: 'ja',
        },
        privacy: {
            profileVisible: true,
            locationVisible: false,
        },
    });
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
        // 自動保存
        saveSettings();
    };
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // APIで設定を保存
            const response = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            if (response.ok) {
                setSaveMessage('設定を保存しました');
                setTimeout(() => setSaveMessage(null), 3000);
            }
        }
        catch (error) {
            console.error('設定の保存に失敗しました:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleLogout = async () => {
        try {
            // ログアウト処理
            await fetch('/api/auth/logout', { method: 'POST' });
            navigate('/login');
        }
        catch (error) {
            console.error('ログアウトに失敗しました:', error);
        }
    };
    const handleDeleteAccount = async () => {
        try {
            // アカウント削除処理
            await fetch('/api/user/delete', { method: 'DELETE' });
            navigate('/login');
        }
        catch (error) {
            console.error('アカウント削除に失敗しました:', error);
        }
    };
    const locationModeLabels = {
        always: '常時取得',
        'app-only': 'アプリ使用時のみ',
        disabled: '無効',
    };
    const shareLevelLabels = {
        exact: '正確な位置',
        approximate: 'おおよその位置',
        city: '市区町村レベル',
    };
    const themeLabels = {
        light: 'ライト',
        dark: 'ダーク',
        system: 'システム設定に従う',
    };
    const languageLabels = {
        ja: '日本語',
        en: 'English',
    };
    return (_jsxs(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' }, children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", onClick: () => navigate(-1), children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u8A2D\u5B9A" })] }) }), _jsxs(Box, { sx: { p: 2 }, children: [saveMessage && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, children: saveMessage })), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Notifications, {}), "\u901A\u77E5\u8A2D\u5B9A"] }), _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u65B0\u3057\u3044\u6295\u7A3F", secondary: "\u5468\u8FBA\u306E\u65B0\u3057\u3044\u6295\u7A3F\u3092\u901A\u77E5" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.notifications.posts, onChange: (e) => handleSettingChange('notifications', 'posts', e.target.checked) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u30B3\u30E1\u30F3\u30C8", secondary: "\u6295\u7A3F\u3078\u306E\u30B3\u30E1\u30F3\u30C8\u3092\u901A\u77E5" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.notifications.comments, onChange: (e) => handleSettingChange('notifications', 'comments', e.target.checked) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u30E1\u30F3\u30B7\u30E7\u30F3", secondary: "\u3042\u306A\u305F\u3078\u306E\u8A00\u53CA\u3092\u901A\u77E5" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.notifications.mentions, onChange: (e) => handleSettingChange('notifications', 'mentions', e.target.checked) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u7BA1\u7406\u8005\u304B\u3089\u306E\u304A\u77E5\u3089\u305B", secondary: "\u91CD\u8981\u306A\u304A\u77E5\u3089\u305B\u3084\u30A4\u30D9\u30F3\u30C8\u60C5\u5831" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.notifications.admin, onChange: (e) => handleSettingChange('notifications', 'admin', e.target.checked) }) })] })] })] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(LocationOn, {}), "\u4F4D\u7F6E\u60C5\u5831\u8A2D\u5B9A"] }), _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u4F4D\u7F6E\u60C5\u5831\u306E\u53D6\u5F97" }), _jsx(ListItemSecondaryAction, { children: _jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: _jsxs(Select, { value: settings.location.mode, onChange: (e) => handleSettingChange('location', 'mode', e.target.value), children: [_jsx(MenuItem, { value: "always", children: "\u5E38\u6642\u53D6\u5F97" }), _jsx(MenuItem, { value: "app-only", children: "\u30A2\u30D7\u30EA\u4F7F\u7528\u6642\u306E\u307F" }), _jsx(MenuItem, { value: "disabled", children: "\u7121\u52B9" })] }) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u4F4D\u7F6E\u60C5\u5831\u306E\u5171\u6709\u30EC\u30D9\u30EB" }), _jsx(ListItemSecondaryAction, { children: _jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: _jsxs(Select, { value: settings.location.shareLevel, onChange: (e) => handleSettingChange('location', 'shareLevel', e.target.value), children: [_jsx(MenuItem, { value: "exact", children: "\u6B63\u78BA\u306A\u4F4D\u7F6E" }), _jsx(MenuItem, { value: "approximate", children: "\u304A\u304A\u3088\u305D\u306E\u4F4D\u7F6E" }), _jsx(MenuItem, { value: "city", children: "\u5E02\u533A\u753A\u6751\u30EC\u30D9\u30EB" })] }) }) })] })] })] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Brightness6, {}), "\u5916\u89B3"] }), _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u30C6\u30FC\u30DE" }), _jsx(ListItemSecondaryAction, { children: _jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: _jsxs(Select, { value: settings.appearance.theme, onChange: (e) => handleSettingChange('appearance', 'theme', e.target.value), children: [_jsx(MenuItem, { value: "light", children: "\u30E9\u30A4\u30C8" }), _jsx(MenuItem, { value: "dark", children: "\u30C0\u30FC\u30AF" }), _jsx(MenuItem, { value: "system", children: "\u30B7\u30B9\u30C6\u30E0\u8A2D\u5B9A" })] }) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u8A00\u8A9E" }), _jsx(ListItemSecondaryAction, { children: _jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: _jsxs(Select, { value: settings.appearance.language, onChange: (e) => handleSettingChange('appearance', 'language', e.target.value), children: [_jsx(MenuItem, { value: "ja", children: "\u65E5\u672C\u8A9E" }), _jsx(MenuItem, { value: "en", children: "English" })] }) }) })] })] })] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Security, {}), "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC"] }), _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u516C\u958B", secondary: "\u4ED6\u306E\u30E6\u30FC\u30B6\u30FC\u304C\u3042\u306A\u305F\u306E\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u898B\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.privacy.profileVisible, onChange: (e) => handleSettingChange('privacy', 'profileVisible', e.target.checked) }) })] }), _jsxs(ListItem, { children: [_jsx(ListItemText, { primary: "\u4F4D\u7F6E\u60C5\u5831\u3092\u8868\u793A", secondary: "\u6295\u7A3F\u306B\u4F4D\u7F6E\u60C5\u5831\u3092\u8868\u793A\u3057\u307E\u3059" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: settings.privacy.locationVisible, onChange: (e) => handleSettingChange('privacy', 'locationVisible', e.target.checked) }) })] })] })] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u305D\u306E\u4ED6" }), _jsxs(List, { children: [_jsxs(ListItem, { button: true, onClick: () => navigate('/profile'), children: [_jsx(ListItemIcon, { children: _jsx(Person, {}) }), _jsx(ListItemText, { primary: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u7DE8\u96C6" })] }), _jsxs(ListItem, { button: true, onClick: () => navigate('/help'), children: [_jsx(ListItemIcon, { children: _jsx(Help, {}) }), _jsx(ListItemText, { primary: "\u30D8\u30EB\u30D7\u30FB\u4F7F\u3044\u65B9" })] }), _jsxs(ListItem, { button: true, onClick: () => navigate('/contact'), children: [_jsx(ListItemIcon, { children: _jsx(ContactSupport, {}) }), _jsx(ListItemText, { primary: "\u304A\u554F\u3044\u5408\u308F\u305B" })] }), _jsxs(ListItem, { button: true, onClick: () => navigate('/about'), children: [_jsx(ListItemIcon, { children: _jsx(Info, {}) }), _jsx(ListItemText, { primary: "\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066" })] })] })] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, color: "error", children: "\u30A2\u30AB\u30A6\u30F3\u30C8\u7BA1\u7406" }), _jsxs(List, { children: [_jsxs(ListItem, { button: true, onClick: () => setLogoutDialogOpen(true), children: [_jsx(ListItemIcon, { children: _jsx(ExitToApp, { color: "warning" }) }), _jsx(ListItemText, { primary: "\u30ED\u30B0\u30A2\u30A6\u30C8", primaryTypographyProps: { color: 'warning.main' } })] }), _jsxs(ListItem, { button: true, onClick: () => setDeleteAccountDialogOpen(true), children: [_jsx(ListItemIcon, { children: _jsx(Delete, { color: "error" }) }), _jsx(ListItemText, { primary: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664", secondary: "\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u305B\u307E\u305B\u3093", primaryTypographyProps: { color: 'error.main' } })] })] })] }) })] }), _jsxs(Dialog, { open: logoutDialogOpen, onClose: () => setLogoutDialogOpen(false), children: [_jsx(DialogTitle, { children: "\u30ED\u30B0\u30A2\u30A6\u30C8" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u30ED\u30B0\u30A2\u30A6\u30C8\u3057\u307E\u3059\u304B\uFF1F" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setLogoutDialogOpen(false), children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: handleLogout, color: "warning", variant: "contained", children: "\u30ED\u30B0\u30A2\u30A6\u30C8" })] })] }), _jsxs(Dialog, { open: deleteAccountDialogOpen, onClose: () => setDeleteAccountDialogOpen(false), children: [_jsx(DialogTitle, { color: "error.main", children: "\u30A2\u30AB\u30A6\u30F3\u30C8\u524A\u9664" }), _jsxs(DialogContent, { children: [_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: _jsx(Typography, { variant: "body2", children: "\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u3059\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3002" }) }), _jsx(Typography, { children: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3059\u308B\u3068\u3001\u4EE5\u4E0B\u306E\u30C7\u30FC\u30BF\u304C\u3059\u3079\u3066\u524A\u9664\u3055\u308C\u307E\u3059\uFF1A" }), _jsxs(Box, { component: "ul", sx: { mt: 1, pl: 2 }, children: [_jsx("li", { children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u60C5\u5831" }), _jsx("li", { children: "\u6295\u7A3F\u3057\u305F\u30B3\u30F3\u30C6\u30F3\u30C4" }), _jsx("li", { children: "\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74" }), _jsx("li", { children: "\u8A2D\u5B9A\u60C5\u5831" })] }), _jsx(Typography, { sx: { mt: 2 }, children: "\u672C\u5F53\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteAccountDialogOpen(false), children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: handleDeleteAccount, color: "error", variant: "contained", children: "\u524A\u9664\u3059\u308B" })] })] })] }));
};
export default Settings;
