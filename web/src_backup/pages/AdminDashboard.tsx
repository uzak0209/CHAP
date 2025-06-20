import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Alert,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard,
  People,
  Message,
  Report,
  Delete,
  Block,
  Visibility,
  Search,
  FilterList,
  Refresh,
  Warning,
  CheckCircle,
  Cancel,
  MoreVert,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned' | 'flagged';
  joinedAt: string;
  lastActive: string;
  postsCount: number;
  reportsCount: number;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  location: string;
  createdAt: string;
  status: 'active' | 'flagged' | 'removed';
  reportsCount: number;
  likesCount: number;
  commentsCount: number;
}

interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

interface ChatRoom {
  id: string;
  title: string;
  participantCount: number;
  maxParticipants: number;
  status: 'active' | 'expired' | 'suspended';
  createdAt: string;
  expiresAt: string;
  messageCount: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'ban' | 'delete' | 'restore'>('suspend');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // サンプルデータ
  useEffect(() => {
    // 実際のAPIからデータを取得
    const sampleUsers: User[] = [
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

    const samplePosts: Post[] = [
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

    const sampleReports: Report[] = [
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

    const sampleChatRooms: ChatRoom[] = [
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAction = (item: any, action: 'suspend' | 'ban' | 'delete' | 'restore') => {
    setSelectedItem(item);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedItem) return;

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
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'flagged': case 'pending': return 'warning';
      case 'suspended': case 'banned': case 'removed': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            管理者ダッシュボード
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/login')}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* 統計情報 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  総ユーザー数
                </Typography>
                <Typography variant="h4">
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  アクティブ: {stats.activeUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  総投稿数
                </Typography>
                <Typography variant="h4">
                  {stats.totalPosts}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  フラグ付き: {stats.flaggedPosts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  未処理レポート
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pendingReports}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  アクティブルーム
                </Typography>
                <Typography variant="h4">
                  {stats.activeChatRooms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* タブ */}
        <Card>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="ユーザー管理" />
            <Tab label="投稿管理" />
            <Tab label="レポート" />
            <Tab label="チャットルーム" />
          </Tabs>

          {/* 検索・フィルター */}
          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
              <FilterList />
            </IconButton>
            <IconButton>
              <Refresh />
            </IconButton>
          </Box>

          {/* ユーザー管理タブ */}
          {currentTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ユーザー</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>投稿数</TableCell>
                    <TableCell>レポート数</TableCell>
                    <TableCell>最終アクティブ</TableCell>
                    <TableCell>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar>{user.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.postsCount}</TableCell>
                      <TableCell>
                        {user.reportsCount > 0 ? (
                          <Badge badgeContent={user.reportsCount} color="error">
                            <Warning color="warning" />
                          </Badge>
                        ) : (
                          user.reportsCount
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleAction(user, 'suspend')}>
                          <Block />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleAction(user, 'ban')}>
                          <Cancel />
                        </IconButton>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 投稿管理タブ */}
          {currentTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>投稿者</TableCell>
                    <TableCell>内容</TableCell>
                    <TableCell>場所</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>レポート</TableCell>
                    <TableCell>投稿日時</TableCell>
                    <TableCell>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.userName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {post.content}
                        </Typography>
                      </TableCell>
                      <TableCell>{post.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={post.status}
                          color={getStatusColor(post.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {post.reportsCount > 0 ? (
                          <Badge badgeContent={post.reportsCount} color="error">
                            <Report color="error" />
                          </Badge>
                        ) : (
                          post.reportsCount
                        )}
                      </TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleAction(post, 'delete')}>
                          <Delete />
                        </IconButton>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* レポートタブ */}
          {currentTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>レポーター</TableCell>
                    <TableCell>対象</TableCell>
                    <TableCell>理由</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>レポート日時</TableCell>
                    <TableCell>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.targetType}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          確認
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* チャットルームタブ */}
          {currentTab === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ルーム名</TableCell>
                    <TableCell>参加者</TableCell>
                    <TableCell>メッセージ数</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>作成日時</TableCell>
                    <TableCell>期限</TableCell>
                    <TableCell>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.title}</TableCell>
                      <TableCell>
                        {room.participantCount}/{room.maxParticipants}
                      </TableCell>
                      <TableCell>{room.messageCount}</TableCell>
                      <TableCell>
                        <Chip
                          label={room.status}
                          color={getStatusColor(room.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(room.createdAt)}</TableCell>
                      <TableCell>{formatDate(room.expiresAt)}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Block />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      {/* アクション確認ダイアログ */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>{getActionLabel()}の確認</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            この操作は取り消すことができない場合があります。
          </Alert>
          <Typography>
            {selectedItem?.name || selectedItem?.content || selectedItem?.title}に対して
            {getActionLabel()}を実行しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={executeAction} color="error" variant="contained">
            実行
          </Button>
        </DialogActions>
      </Dialog>

      {/* フィルターメニュー */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem>すべて</MenuItem>
        <MenuItem>アクティブのみ</MenuItem>
        <MenuItem>フラグ付きのみ</MenuItem>
        <MenuItem>停止中のみ</MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;
