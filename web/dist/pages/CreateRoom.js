import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Slider, Switch, FormControlLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, AppBar, Toolbar, } from '@mui/material';
import { ArrowBack, QrCode, ContentCopy, LocationOn, Schedule, People, Settings, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const CreateRoom = () => {
    const navigate = useNavigate();
    const [roomSettings, setRoomSettings] = useState({
        title: '',
        description: '',
        duration: 60,
        maxParticipants: 50,
        isPrivate: false,
        allowImages: true,
        allowStamps: true,
        locationRadius: 1,
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createdRoom, setCreatedRoom] = useState(null);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [error, setError] = useState(null);
    const durationOptions = [
        { value: 30, label: '30分' },
        { value: 60, label: '1時間' },
        { value: 120, label: '2時間' },
        { value: 180, label: '3時間' },
        { value: 360, label: '6時間' },
        { value: 720, label: '12時間' },
        { value: 1440, label: '24時間' },
    ];
    const participantOptions = [10, 20, 30, 50, 100];
    const handleInputChange = (field, value) => {
        setRoomSettings(prev => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleCreateRoom = async () => {
        // バリデーション
        if (!roomSettings.title.trim()) {
            setError('ルームタイトルを入力してください');
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            // APIでルーム作成（実際の実装では適切なAPIエンドポイントを使用）
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...roomSettings,
                    expiresAt: new Date(Date.now() + roomSettings.duration * 60 * 1000).toISOString(),
                }),
            });
            if (!response.ok) {
                throw new Error('ルーム作成に失敗しました');
            }
            // サンプルレスポンス（実際のAPIレスポンスに合わせて調整）
            const mockRoom = {
                id: 'room_' + Date.now(),
                inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CHAP_ROOM_${Date.now()}`,
            };
            setCreatedRoom(mockRoom);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setIsCreating(false);
        }
    };
    const copyInviteCode = () => {
        if (createdRoom) {
            navigator.clipboard.writeText(createdRoom.inviteCode);
            // トースト通知などでコピー完了を知らせる
        }
    };
    const handleJoinRoom = () => {
        if (createdRoom) {
            navigate(`/chat/${createdRoom.id}`);
        }
    };
    // ルーム作成完了画面
    if (createdRoom) {
        return (_jsxs(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' }, children: [_jsx(AppBar, { position: "static", children: _jsx(Toolbar, { children: _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u30EB\u30FC\u30E0\u4F5C\u6210\u5B8C\u4E86" }) }) }), _jsxs(Box, { sx: { p: 3 }, children: [_jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "h5", gutterBottom: true, color: "primary", children: "\uD83C\uDF89 \u30EB\u30FC\u30E0\u304C\u4F5C\u6210\u3055\u308C\u307E\u3057\u305F\uFF01" }), _jsx(Typography, { variant: "body1", color: "text.secondary", gutterBottom: true, children: roomSettings.title }), _jsxs(Box, { sx: { my: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u62DB\u5F85\u30B3\u30FC\u30C9" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }, children: [_jsx(Chip, { label: createdRoom.inviteCode, color: "primary", size: "medium", sx: { fontSize: '1.2rem', px: 2 } }), _jsx(IconButton, { onClick: copyInviteCode, color: "primary", children: _jsx(ContentCopy, {}) })] })] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(QrCode, {}), onClick: () => setShowQRDialog(true), sx: { mb: 2 }, children: "QR\u30B3\u30FC\u30C9\u3092\u8868\u793A" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'center' }, children: [_jsx(Button, { variant: "contained", onClick: handleJoinRoom, size: "large", children: "\u30EB\u30FC\u30E0\u306B\u53C2\u52A0" }), _jsx(Button, { variant: "outlined", onClick: () => navigate('/chat-rooms'), size: "large", children: "\u30EB\u30FC\u30E0\u4E00\u89A7\u306B\u623B\u308B" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u30EB\u30FC\u30E0\u8A2D\u5B9A" }), _jsxs(Box, { sx: { display: 'grid', gap: 1 }, children: [_jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "\u5236\u9650\u6642\u9593:" }), " ", roomSettings.duration, "\u5206"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "\u6700\u5927\u53C2\u52A0\u8005:" }), " ", roomSettings.maxParticipants, "\u4EBA"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "\u7BC4\u56F2:" }), " ", roomSettings.locationRadius, "km"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8:" }), " ", roomSettings.isPrivate ? 'はい' : 'いいえ'] })] })] }) })] }), _jsxs(Dialog, { open: showQRDialog, onClose: () => setShowQRDialog(false), children: [_jsx(DialogTitle, { children: "QR\u30B3\u30FC\u30C9" }), _jsxs(DialogContent, { sx: { textAlign: 'center' }, children: [_jsx("img", { src: createdRoom.qrCodeUrl, alt: "Room QR Code", style: { maxWidth: '100%', height: 'auto' } }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "\u3053\u306EQR\u30B3\u30FC\u30C9\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u3066\u30EB\u30FC\u30E0\u306B\u53C2\u52A0" })] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setShowQRDialog(false), children: "\u9589\u3058\u308B" }) })] })] }));
    }
    // ルーム作成フォーム
    return (_jsxs(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' }, children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", onClick: () => navigate('/chat-rooms'), children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u65B0\u3057\u3044\u30EB\u30FC\u30E0\u4F5C\u6210" })] }) }), _jsxs(Box, { sx: { p: 3 }, children: [error && (_jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error })), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Settings, {}), "\u57FA\u672C\u8A2D\u5B9A"] }), _jsx(TextField, { fullWidth: true, label: "\u30EB\u30FC\u30E0\u30BF\u30A4\u30C8\u30EB", value: roomSettings.title, onChange: (e) => handleInputChange('title', e.target.value), margin: "normal", required: true, placeholder: "\u4F8B\uFF1A\u685C\u796D\u308A\u30A4\u30D9\u30F3\u30C8" }), _jsx(TextField, { fullWidth: true, label: "\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09", value: roomSettings.description, onChange: (e) => handleInputChange('description', e.target.value), margin: "normal", multiline: true, rows: 2, placeholder: "\u30EB\u30FC\u30E0\u306E\u8AAC\u660E\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" })] }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Schedule, {}), "\u6642\u9593\u8A2D\u5B9A"] }), _jsxs(FormControl, { fullWidth: true, margin: "normal", children: [_jsx(InputLabel, { children: "\u5236\u9650\u6642\u9593" }), _jsx(Select, { value: roomSettings.duration, onChange: (e) => handleInputChange('duration', e.target.value), label: "\u5236\u9650\u6642\u9593", children: durationOptions.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) })] })] }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(People, {}), "\u53C2\u52A0\u8005\u8A2D\u5B9A"] }), _jsxs(FormControl, { fullWidth: true, margin: "normal", children: [_jsx(InputLabel, { children: "\u6700\u5927\u53C2\u52A0\u8005\u6570" }), _jsx(Select, { value: roomSettings.maxParticipants, onChange: (e) => handleInputChange('maxParticipants', e.target.value), label: "\u6700\u5927\u53C2\u52A0\u8005\u6570", children: participantOptions.map((option) => (_jsxs(MenuItem, { value: option, children: [option, "\u4EBA"] }, option))) })] }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: roomSettings.isPrivate, onChange: (e) => handleInputChange('isPrivate', e.target.checked) }), label: "\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8\u30EB\u30FC\u30E0\uFF08\u62DB\u5F85\u30B3\u30FC\u30C9\u304C\u5FC5\u8981\uFF09", sx: { mt: 1 } })] }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(LocationOn, {}), "\u4F4D\u7F6E\u8A2D\u5B9A"] }), _jsxs(Typography, { gutterBottom: true, children: ["\u53C2\u52A0\u53EF\u80FD\u7BC4\u56F2: ", roomSettings.locationRadius, "km"] }), _jsx(Slider, { value: roomSettings.locationRadius, onChange: (_, value) => handleInputChange('locationRadius', value), min: 0.1, max: 10, step: 0.1, marks: [
                                        { value: 0.5, label: '0.5km' },
                                        { value: 1, label: '1km' },
                                        { value: 5, label: '5km' },
                                        { value: 10, label: '10km' },
                                    ], valueLabelDisplay: "auto" })] }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u30C1\u30E3\u30C3\u30C8\u6A5F\u80FD" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: roomSettings.allowImages, onChange: (e) => handleInputChange('allowImages', e.target.checked) }), label: "\u753B\u50CF\u9001\u4FE1\u3092\u8A31\u53EF" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: roomSettings.allowStamps, onChange: (e) => handleInputChange('allowStamps', e.target.checked) }), label: "\u30B9\u30BF\u30F3\u30D7\u9001\u4FE1\u3092\u8A31\u53EF" })] }) }), _jsx(Button, { fullWidth: true, variant: "contained", size: "large", onClick: handleCreateRoom, disabled: isCreating, sx: { py: 2 }, children: isCreating ? 'ルーム作成中...' : 'ルームを作成' })] })] }));
};
export default CreateRoom;
