import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  QrCode,
  ContentCopy,
  LocationOn,
  Schedule,
  People,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RoomSettings {
  title: string;
  description: string;
  duration: number; // 時間（分）
  maxParticipants: number;
  isPrivate: boolean;
  allowImages: boolean;
  allowStamps: boolean;
  locationRadius: number; // km
}

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
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
  const [createdRoom, setCreatedRoom] = useState<{
    id: string;
    inviteCode: string;
    qrCodeUrl: string;
  } | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleInputChange = (field: keyof RoomSettings, value: any) => {
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
    } catch (error: any) {
      setError(error.message);
    } finally {
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
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ルーム作成完了
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom color="primary">
                🎉 ルームが作成されました！
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {roomSettings.title}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  招待コード
                </Typography>
                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                   <Chip
                     label={createdRoom.inviteCode}
                     color="primary"
                     size="medium"
                     sx={{ fontSize: '1.2rem', px: 2 }}
                   />
                   <IconButton onClick={copyInviteCode} color="primary">
                     <ContentCopy />
                   </IconButton>
                 </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<QrCode />}
                onClick={() => setShowQRDialog(true)}
                sx={{ mb: 2 }}
              >
                QRコードを表示
              </Button>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleJoinRoom}
                  size="large"
                >
                  ルームに参加
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/chat-rooms')}
                  size="large"
                >
                  ルーム一覧に戻る
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* ルーム情報 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ルーム設定
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="body2">
                  <strong>制限時間:</strong> {roomSettings.duration}分
                </Typography>
                <Typography variant="body2">
                  <strong>最大参加者:</strong> {roomSettings.maxParticipants}人
                </Typography>
                <Typography variant="body2">
                  <strong>範囲:</strong> {roomSettings.locationRadius}km
                </Typography>
                <Typography variant="body2">
                  <strong>プライベート:</strong> {roomSettings.isPrivate ? 'はい' : 'いいえ'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* QRコードダイアログ */}
        <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
          <DialogTitle>QRコード</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <img
              src={createdRoom.qrCodeUrl}
              alt="Room QR Code"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              このQRコードをスキャンしてルームに参加
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQRDialog(false)}>閉じる</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ルーム作成フォーム
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/chat-rooms')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            新しいルーム作成
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings />
              基本設定
            </Typography>
            
            <TextField
              fullWidth
              label="ルームタイトル"
              value={roomSettings.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              margin="normal"
              required
              placeholder="例：桜祭りイベント"
            />

            <TextField
              fullWidth
              label="説明（任意）"
              value={roomSettings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
              multiline
              rows={2}
              placeholder="ルームの説明を入力してください"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule />
              時間設定
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>制限時間</InputLabel>
              <Select
                value={roomSettings.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                label="制限時間"
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People />
              参加者設定
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>最大参加者数</InputLabel>
              <Select
                value={roomSettings.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                label="最大参加者数"
              >
                {participantOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}人
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={roomSettings.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                />
              }
              label="プライベートルーム（招待コードが必要）"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              位置設定
            </Typography>
            
            <Typography gutterBottom>
              参加可能範囲: {roomSettings.locationRadius}km
            </Typography>
            <Slider
              value={roomSettings.locationRadius}
              onChange={(_, value) => handleInputChange('locationRadius', value)}
              min={0.1}
              max={10}
              step={0.1}
              marks={[
                { value: 0.5, label: '0.5km' },
                { value: 1, label: '1km' },
                { value: 5, label: '5km' },
                { value: 10, label: '10km' },
              ]}
              valueLabelDisplay="auto"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              チャット機能
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={roomSettings.allowImages}
                  onChange={(e) => handleInputChange('allowImages', e.target.checked)}
                />
              }
              label="画像送信を許可"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={roomSettings.allowStamps}
                  onChange={(e) => handleInputChange('allowStamps', e.target.checked)}
                />
              }
              label="スタンプ送信を許可"
            />
          </CardContent>
        </Card>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleCreateRoom}
          disabled={isCreating}
          sx={{ py: 2 }}
        >
          {isCreating ? 'ルーム作成中...' : 'ルームを作成'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateRoom;