import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Person,
  Chat,
  Settings,
  Logout,
  PhotoCamera,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

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
    } catch (error) {
      console.error('プロフィールの更新に失敗しました:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Box sx={{ p: 2 }}>
      {/* プロフィール情報 */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={user.photoURL}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              component="span"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <Typography variant="h5" gutterBottom>
          {user.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          参加中のルーム: 3個
        </Typography>

        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEdit}
          sx={{ mt: 2 }}
        >
          プロフィール編集
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* メニュー */}
      <List>
        <ListItem button onClick={() => navigate('/chat')}>
          <ListItemIcon>
            <Chat />
          </ListItemIcon>
          <ListItemText primary="参加中のルーム" />
        </ListItem>
        <ListItem button onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="設定" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="ログアウト" />
        </ListItem>
      </List>

      {/* プロフィール編集ダイアログ */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
        <DialogTitle>プロフィール編集</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="表示名"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="自己紹介"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 