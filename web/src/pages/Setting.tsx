import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Notifications,
  LocationOn,
  Security,
  Help,
  ExitToApp,
  Delete,
  Person,
  Brightness6,
  Language,
  Info,
  ContactSupport,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
  notifications: {
    posts: boolean;
    comments: boolean;
    mentions: boolean;
    admin: boolean;
  };
  location: {
    mode: 'always' | 'app-only' | 'disabled';
    shareLevel: 'exact' | 'approximate' | 'city';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'ja' | 'en';
  };
  privacy: {
    profileVisible: boolean;
    locationVisible: boolean;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<UserSettings>({
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
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
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // ログアウト処理
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // アカウント削除処理
      await fetch('/api/user/delete', { method: 'DELETE' });
      navigate('/login');
    } catch (error) {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            設定
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {saveMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {saveMessage}
          </Alert>
        )}

        {/* 通知設定 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications />
              通知設定
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="新しい投稿"
                  secondary="周辺の新しい投稿を通知"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.posts}
                    onChange={(e) => handleSettingChange('notifications', 'posts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="コメント"
                  secondary="投稿へのコメントを通知"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.comments}
                    onChange={(e) => handleSettingChange('notifications', 'comments', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="メンション"
                  secondary="あなたへの言及を通知"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.mentions}
                    onChange={(e) => handleSettingChange('notifications', 'mentions', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="管理者からのお知らせ"
                  secondary="重要なお知らせやイベント情報"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.admin}
                    onChange={(e) => handleSettingChange('notifications', 'admin', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* 位置情報設定 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              位置情報設定
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="位置情報の取得" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.location.mode}
                      onChange={(e) => handleSettingChange('location', 'mode', e.target.value)}
                    >
                      <MenuItem value="always">常時取得</MenuItem>
                      <MenuItem value="app-only">アプリ使用時のみ</MenuItem>
                      <MenuItem value="disabled">無効</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="位置情報の共有レベル" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.location.shareLevel}
                      onChange={(e) => handleSettingChange('location', 'shareLevel', e.target.value)}
                    >
                      <MenuItem value="exact">正確な位置</MenuItem>
                      <MenuItem value="approximate">おおよその位置</MenuItem>
                      <MenuItem value="city">市区町村レベル</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* 外観設定 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brightness6 />
              外観
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="テーマ" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.appearance.theme}
                      onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    >
                      <MenuItem value="light">ライト</MenuItem>
                      <MenuItem value="dark">ダーク</MenuItem>
                      <MenuItem value="system">システム設定</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="言語" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.appearance.language}
                      onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    >
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* プライバシー設定 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security />
              プライバシー
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="プロフィールを公開"
                  secondary="他のユーザーがあなたのプロフィールを見ることができます"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="位置情報を表示"
                  secondary="投稿に位置情報を表示します"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.privacy.locationVisible}
                    onChange={(e) => handleSettingChange('privacy', 'locationVisible', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* その他 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              その他
            </Typography>
            <List>
              <ListItem button onClick={() => navigate('/profile')}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="プロフィール編集" />
              </ListItem>
              <ListItem button onClick={() => navigate('/help')}>
                <ListItemIcon>
                  <Help />
                </ListItemIcon>
                <ListItemText primary="ヘルプ・使い方" />
              </ListItem>
              <ListItem button onClick={() => navigate('/contact')}>
                <ListItemIcon>
                  <ContactSupport />
                </ListItemIcon>
                <ListItemText primary="お問い合わせ" />
              </ListItem>
              <ListItem button onClick={() => navigate('/about')}>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText primary="アプリについて" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* アカウント管理 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              アカウント管理
            </Typography>
            <List>
              <ListItem button onClick={() => setLogoutDialogOpen(true)}>
                <ListItemIcon>
                  <ExitToApp color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="ログアウト"
                  primaryTypographyProps={{ color: 'warning.main' }}
                />
              </ListItem>
              <ListItem button onClick={() => setDeleteAccountDialogOpen(true)}>
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="アカウントを削除"
                  secondary="この操作は取り消せません"
                  primaryTypographyProps={{ color: 'error.main' }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* ログアウト確認ダイアログ */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>ログアウト</DialogTitle>
        <DialogContent>
          <Typography>
            ログアウトしますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleLogout} color="warning" variant="contained">
            ログアウト
          </Button>
        </DialogActions>
      </Dialog>

      {/* アカウント削除確認ダイアログ */}
      <Dialog open={deleteAccountDialogOpen} onClose={() => setDeleteAccountDialogOpen(false)}>
        <DialogTitle color="error.main">アカウント削除</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              この操作は取り消すことができません。
            </Typography>
          </Alert>
          <Typography>
            アカウントを削除すると、以下のデータがすべて削除されます：
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>プロフィール情報</li>
            <li>投稿したコンテンツ</li>
            <li>チャット履歴</li>
            <li>設定情報</li>
          </Box>
          <Typography sx={{ mt: 2 }}>
            本当にアカウントを削除しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
