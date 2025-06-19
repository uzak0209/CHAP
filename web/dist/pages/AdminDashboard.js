import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Avatar, Alert, Tabs, Tab, AppBar, Toolbar, Badge, Menu, MenuItem, TextField, InputAdornment, } from '@mui/material';
import { Dashboard, Report, Delete, Block, Visibility, Search, FilterList, Refresh, Warning, Cancel, ExitToApp, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('suspend');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    // サンプルデータ
    useEffect(() => {
        // 実際のAPIからデータを取得
        const sampleUsers = [
            {
                id: '1',
                name: '田中太郎',
                email: 'tanaka@example.com',
                avatar: '',
                status: 'active',
                joinedAt: '2024-01-15',
                lastActive: '2024-04-15T10:30:00Z',
                postsCount: 25,
                reportsCount: 0,
            },
            {
                id: '2',
                name: '佐藤花子',
                email: 'sato@example.com',
                avatar: '',
                status: 'flagged',
                joinedAt: '2024-02-01',
                lastActive: '2024-04-14T15:20:00Z',
                postsCount: 12,
                reportsCount: 3,
            },
        ];
        const samplePosts = [
            {
                id: '1',
                userId: '1',
                userName: '田中太郎',
                content: '桜が綺麗に咲いています！',
                location: '上野公園',
                createdAt: '2024-04-15T09:00:00Z',
                status: 'active',
                reportsCount: 0,
                likesCount: 15,
                commentsCount: 3,
            },
            {
                id: '2',
                userId: '2',
                userName: '佐藤花子',
                content: '不適切な内容を含む投稿...',
                location: '渋谷',
                createdAt: '2024-04-14T14:30:00Z',
                status: 'flagged',
                reportsCount: 5,
                likesCount: 2,
                commentsCount: 1,
            },
        ];
        const sampleReports = [
            {
                id: '1',
                reporterId: '3',
                reporterName: '山田次郎',
                targetType: 'post',
                targetId: '2',
                reason: 'inappropriate_content',
                description: '不適切な内容が含まれています',
                status: 'pending',
                createdAt: '2024-04-14T16:00:00Z',
            },
        ];
        const sampleChatRooms = [
            {
                id: '1',
                title: '桜祭りイベント',
                participantCount: 12,
                maxParticipants: 50,
                status: 'active',
                createdAt: '2024-04-15T08:00:00Z',
                expiresAt: '2024-04-15T18:00:00Z',
                messageCount: 45,
            },
        ];
        setUsers(sampleUsers);
        setPosts(samplePosts);
        setReports(sampleReports);
        setChatRooms(sampleChatRooms);
    }, []);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    const handleAction = (item, action) => {
        setSelectedItem(item);
        setActionType(action);
        setActionDialogOpen(true);
    };
    const executeAction = async () => {
        if (!selectedItem)
            return;
        try {
            // APIで実際のアクションを実行
            const response = await fetch(`/api/admin/${actionType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetType: currentTab === 0 ? 'user' : 'post',
                    targetId: selectedItem.id,
                }),
            });
            if (response.ok) {
                // 成功時の処理
                console.log(`${actionType} executed successfully`);
                // データを再取得
            }
        }
        catch (error) {
            console.error('Action failed:', error);
        }
        finally {
            setActionDialogOpen(false);
            setSelectedItem(null);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'flagged':
            case 'pending': return 'warning';
            case 'suspended':
            case 'banned':
            case 'removed': return 'error';
            default: return 'default';
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ja-JP');
    };
    const getActionLabel = () => {
        switch (actionType) {
            case 'suspend': return 'アカウント停止';
            case 'ban': return 'アカウント凍結';
            case 'delete': return '削除';
            case 'restore': return '復元';
            default: return 'アクション';
        }
    };
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalPosts: posts.length,
        flaggedPosts: posts.filter(p => p.status === 'flagged').length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        activeChatRooms: chatRooms.filter(r => r.status === 'active').length,
    };
    return (_jsxs(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' }, children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(Dashboard, { sx: { mr: 2 } }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u7BA1\u7406\u8005\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx(IconButton, { color: "inherit", onClick: () => navigate('/login'), children: _jsx(ExitToApp, {}) })] }) }), _jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "\u7DCF\u30E6\u30FC\u30B6\u30FC\u6570" }), _jsx(Typography, { variant: "h4", children: stats.totalUsers }), _jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["\u30A2\u30AF\u30C6\u30A3\u30D6: ", stats.activeUsers] })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "\u7DCF\u6295\u7A3F\u6570" }), _jsx(Typography, { variant: "h4", children: stats.totalPosts }), _jsxs(Typography, { variant: "body2", color: "warning.main", children: ["\u30D5\u30E9\u30B0\u4ED8\u304D: ", stats.flaggedPosts] })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "\u672A\u51E6\u7406\u30EC\u30DD\u30FC\u30C8" }), _jsx(Typography, { variant: "h4", color: "warning.main", children: stats.pendingReports })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "\u30A2\u30AF\u30C6\u30A3\u30D6\u30EB\u30FC\u30E0" }), _jsx(Typography, { variant: "h4", children: stats.activeChatRooms })] }) }) })] }), _jsxs(Card, { children: [_jsxs(Tabs, { value: currentTab, onChange: handleTabChange, sx: { borderBottom: 1, borderColor: 'divider' }, children: [_jsx(Tab, { label: "\u30E6\u30FC\u30B6\u30FC\u7BA1\u7406" }), _jsx(Tab, { label: "\u6295\u7A3F\u7BA1\u7406" }), _jsx(Tab, { label: "\u30EC\u30DD\u30FC\u30C8" }), _jsx(Tab, { label: "\u30C1\u30E3\u30C3\u30C8\u30EB\u30FC\u30E0" })] }), _jsxs(Box, { sx: { p: 2, display: 'flex', gap: 2, alignItems: 'center' }, children: [_jsx(TextField, { size: "small", placeholder: "\u691C\u7D22...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), InputProps: {
                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Search, {}) })),
                                        }, sx: { flexGrow: 1 } }), _jsx(IconButton, { onClick: (e) => setFilterAnchorEl(e.currentTarget), children: _jsx(FilterList, {}) }), _jsx(IconButton, { children: _jsx(Refresh, {}) })] }), currentTab === 0 && (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u30E6\u30FC\u30B6\u30FC" }), _jsx(TableCell, { children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx(TableCell, { children: "\u6295\u7A3F\u6570" }), _jsx(TableCell, { children: "\u30EC\u30DD\u30FC\u30C8\u6570" }), _jsx(TableCell, { children: "\u6700\u7D42\u30A2\u30AF\u30C6\u30A3\u30D6" }), _jsx(TableCell, { children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx(TableBody, { children: users.map((user) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Avatar, { children: user.name.charAt(0) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: "bold", children: user.name }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: user.email })] })] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: user.status, color: getStatusColor(user.status), size: "small" }) }), _jsx(TableCell, { children: user.postsCount }), _jsx(TableCell, { children: user.reportsCount > 0 ? (_jsx(Badge, { badgeContent: user.reportsCount, color: "error", children: _jsx(Warning, { color: "warning" }) })) : (user.reportsCount) }), _jsx(TableCell, { children: formatDate(user.lastActive) }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", onClick: () => handleAction(user, 'suspend'), children: _jsx(Block, {}) }), _jsx(IconButton, { size: "small", onClick: () => handleAction(user, 'ban'), children: _jsx(Cancel, {}) }), _jsx(IconButton, { size: "small", children: _jsx(Visibility, {}) })] })] }, user.id))) })] }) })), currentTab === 1 && (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u6295\u7A3F\u8005" }), _jsx(TableCell, { children: "\u5185\u5BB9" }), _jsx(TableCell, { children: "\u5834\u6240" }), _jsx(TableCell, { children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx(TableCell, { children: "\u30EC\u30DD\u30FC\u30C8" }), _jsx(TableCell, { children: "\u6295\u7A3F\u65E5\u6642" }), _jsx(TableCell, { children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx(TableBody, { children: posts.map((post) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: post.userName }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", noWrap: true, sx: { maxWidth: 200 }, children: post.content }) }), _jsx(TableCell, { children: post.location }), _jsx(TableCell, { children: _jsx(Chip, { label: post.status, color: getStatusColor(post.status), size: "small" }) }), _jsx(TableCell, { children: post.reportsCount > 0 ? (_jsx(Badge, { badgeContent: post.reportsCount, color: "error", children: _jsx(Report, { color: "error" }) })) : (post.reportsCount) }), _jsx(TableCell, { children: formatDate(post.createdAt) }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", onClick: () => handleAction(post, 'delete'), children: _jsx(Delete, {}) }), _jsx(IconButton, { size: "small", children: _jsx(Visibility, {}) })] })] }, post.id))) })] }) })), currentTab === 2 && (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u30EC\u30DD\u30FC\u30BF\u30FC" }), _jsx(TableCell, { children: "\u5BFE\u8C61" }), _jsx(TableCell, { children: "\u7406\u7531" }), _jsx(TableCell, { children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx(TableCell, { children: "\u30EC\u30DD\u30FC\u30C8\u65E5\u6642" }), _jsx(TableCell, { children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx(TableBody, { children: reports.map((report) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: report.reporterName }), _jsx(TableCell, { children: _jsx(Chip, { label: report.targetType, variant: "outlined", size: "small" }) }), _jsx(TableCell, { children: report.reason }), _jsx(TableCell, { children: _jsx(Chip, { label: report.status, color: getStatusColor(report.status), size: "small" }) }), _jsx(TableCell, { children: formatDate(report.createdAt) }), _jsx(TableCell, { children: _jsx(Button, { size: "small", variant: "outlined", children: "\u78BA\u8A8D" }) })] }, report.id))) })] }) })), currentTab === 3 && (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u30EB\u30FC\u30E0\u540D" }), _jsx(TableCell, { children: "\u53C2\u52A0\u8005" }), _jsx(TableCell, { children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u6570" }), _jsx(TableCell, { children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx(TableCell, { children: "\u4F5C\u6210\u65E5\u6642" }), _jsx(TableCell, { children: "\u671F\u9650" }), _jsx(TableCell, { children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx(TableBody, { children: chatRooms.map((room) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: room.title }), _jsxs(TableCell, { children: [room.participantCount, "/", room.maxParticipants] }), _jsx(TableCell, { children: room.messageCount }), _jsx(TableCell, { children: _jsx(Chip, { label: room.status, color: getStatusColor(room.status), size: "small" }) }), _jsx(TableCell, { children: formatDate(room.createdAt) }), _jsx(TableCell, { children: formatDate(room.expiresAt) }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", children: _jsx(Visibility, {}) }), _jsx(IconButton, { size: "small", children: _jsx(Block, {}) })] })] }, room.id))) })] }) }))] })] }), _jsxs(Dialog, { open: actionDialogOpen, onClose: () => setActionDialogOpen(false), children: [_jsxs(DialogTitle, { children: [getActionLabel(), "\u306E\u78BA\u8A8D"] }), _jsxs(DialogContent, { children: [_jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: "\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u3059\u3053\u3068\u304C\u3067\u304D\u306A\u3044\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002" }), _jsxs(Typography, { children: [selectedItem?.name || selectedItem?.content || selectedItem?.title, "\u306B\u5BFE\u3057\u3066", getActionLabel(), "\u3092\u5B9F\u884C\u3057\u307E\u3059\u304B\uFF1F"] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setActionDialogOpen(false), children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: executeAction, color: "error", variant: "contained", children: "\u5B9F\u884C" })] })] }), _jsxs(Menu, { anchorEl: filterAnchorEl, open: Boolean(filterAnchorEl), onClose: () => setFilterAnchorEl(null), children: [_jsx(MenuItem, { children: "\u3059\u3079\u3066" }), _jsx(MenuItem, { children: "\u30A2\u30AF\u30C6\u30A3\u30D6\u306E\u307F" }), _jsx(MenuItem, { children: "\u30D5\u30E9\u30B0\u4ED8\u304D\u306E\u307F" }), _jsx(MenuItem, { children: "\u505C\u6B62\u4E2D\u306E\u307F" })] })] }));
};
export default AdminDashboard;
