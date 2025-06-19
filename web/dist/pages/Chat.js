import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, TextField, IconButton, Typography, Avatar, Chip, Dialog, DialogTitle, DialogContent, Button, AppBar, Toolbar, InputAdornment, Menu, MenuItem, } from '@mui/material';
import { Send, EmojiEmotions, PhotoCamera, AccessTime, ArrowBack, MoreVert, ExitToApp, } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
const Chat = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [room, setRoom] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [stampDialogOpen, setStampDialogOpen] = useState(false);
    // サンプルデータ
    useEffect(() => {
        // 実際のAPIからデータを取得
        const sampleRoom = {
            id: roomId || '1',
            title: '桜祭りイベント',
            description: '上野公園での桜祭りチャット',
            expiresAt: '2024-04-15T18:00:00Z',
            participantCount: 12,
            maxParticipants: 50,
        };
        const sampleMessages = [
            {
                id: '1',
                userId: '1',
                userName: '田中太郎',
                userAvatar: '',
                content: '桜がとても綺麗ですね！',
                type: 'text',
                timestamp: '2024-04-15T14:30:00Z',
            },
            {
                id: '2',
                userId: '2',
                userName: '佐藤花子',
                userAvatar: '',
                content: '🌸',
                type: 'stamp',
                timestamp: '2024-04-15T14:31:00Z',
            },
        ];
        setRoom(sampleRoom);
        setMessages(sampleMessages);
    }, [roomId]);
    // 自動削除タイマー
    useEffect(() => {
        if (!room)
            return;
        const updateTimer = () => {
            const now = new Date();
            const expiresAt = new Date(room.expiresAt);
            const diff = expiresAt.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft('期限切れ');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}時間${minutes}分`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000); // 1分ごとに更新
        return () => clearInterval(interval);
    }, [room]);
    // メッセージを最下部にスクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSendMessage = () => {
        if (!newMessage.trim())
            return;
        const message = {
            id: Date.now().toString(),
            userId: 'current-user',
            userName: '現在のユーザー',
            userAvatar: '',
            content: newMessage,
            type: 'text',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const handleMenuClick = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };
    const handleLeaveRoom = () => {
        // ルーム退出処理
        navigate('/chat-rooms');
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };
    const stamps = ['🌸', '👍', '❤️', '😊', '🎉', '👏', '🔥', '✨'];
    const handleStampSelect = (stamp) => {
        const message = {
            id: Date.now().toString(),
            userId: 'current-user',
            userName: '現在のユーザー',
            userAvatar: '',
            content: stamp,
            type: 'stamp',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, message]);
        setStampDialogOpen(false);
    };
    if (!room) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx(Typography, { children: "\u30EB\u30FC\u30E0\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." }) }));
    }
    return (_jsxs(Box, { sx: { height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsx(AppBar, { position: "static", color: "primary", children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", onClick: () => navigate('/chat-rooms'), children: _jsx(ArrowBack, {}) }), _jsxs(Box, { sx: { flexGrow: 1, ml: 1 }, children: [_jsx(Typography, { variant: "h6", noWrap: true, children: room.title }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Chip, { icon: _jsx(AccessTime, {}), label: `残り${timeLeft}`, size: "small", color: "warning", variant: "outlined" }), _jsxs(Typography, { variant: "caption", children: [room.participantCount, "/", room.maxParticipants, "\u4EBA"] })] })] }), _jsx(IconButton, { color: "inherit", onClick: handleMenuClick, children: _jsx(MoreVert, {}) })] }) }), _jsx(Menu, { anchorEl: menuAnchorEl, open: Boolean(menuAnchorEl), onClose: handleMenuClose, children: _jsxs(MenuItem, { onClick: handleLeaveRoom, children: [_jsx(ExitToApp, { sx: { mr: 1 } }), "\u30EB\u30FC\u30E0\u3092\u9000\u51FA"] }) }), _jsxs(Box, { sx: { flexGrow: 1, overflow: 'auto', p: 1 }, children: [messages.map((message) => (_jsxs(Box, { sx: {
                            display: 'flex',
                            mb: 2,
                            justifyContent: message.userId === 'current-user' ? 'flex-end' : 'flex-start',
                        }, children: [message.userId !== 'current-user' && (_jsx(Avatar, { sx: { mr: 1, width: 32, height: 32 }, children: message.userName.charAt(0) })), _jsxs(Box, { sx: { maxWidth: '70%' }, children: [message.userId !== 'current-user' && (_jsx(Typography, { variant: "caption", color: "text.secondary", children: message.userName })), _jsx(Card, { sx: {
                                            bgcolor: message.userId === 'current-user' ? 'primary.main' : 'grey.100',
                                            color: message.userId === 'current-user' ? 'white' : 'text.primary',
                                        }, children: _jsxs(CardContent, { sx: { p: 1, '&:last-child': { pb: 1 } }, children: [message.type === 'stamp' ? (_jsx(Typography, { variant: "h4", align: "center", children: message.content })) : (_jsx(Typography, { variant: "body2", children: message.content })), _jsx(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        textAlign: 'right',
                                                        mt: 0.5,
                                                        opacity: 0.7,
                                                    }, children: formatTime(message.timestamp) })] }) })] })] }, message.id))), _jsx("div", { ref: messagesEndRef })] }), _jsx(Box, { sx: { p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }, children: _jsx(TextField, { fullWidth: true, multiline: true, maxRows: 3, value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...", InputProps: {
                        endAdornment: (_jsxs(InputAdornment, { position: "end", children: [_jsx(IconButton, { onClick: () => setStampDialogOpen(true), children: _jsx(EmojiEmotions, {}) }), _jsx(IconButton, { children: _jsx(PhotoCamera, {}) }), _jsx(IconButton, { onClick: handleSendMessage, color: "primary", children: _jsx(Send, {}) })] })),
                    } }) }), _jsxs(Dialog, { open: stampDialogOpen, onClose: () => setStampDialogOpen(false), children: [_jsx(DialogTitle, { children: "\u30B9\u30BF\u30F3\u30D7\u3092\u9078\u629E" }), _jsx(DialogContent, { children: _jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }, children: stamps.map((stamp) => (_jsx(Button, { onClick: () => handleStampSelect(stamp), sx: { fontSize: '2rem', minWidth: 60, minHeight: 60 }, children: stamp }, stamp))) }) })] })] }));
};
export default Chat;
