import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  AppBar,
  Toolbar,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  PhotoCamera,
  AccessTime,
  ArrowBack,
  MoreVert,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: 'text' | 'image' | 'stamp';
  timestamp: string;
}

interface ChatRoom {
  id: string;
  title: string;
  description: string;
  expiresAt: string;
  participantCount: number;
  maxParticipants: number;
}

const Chat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [stampDialogOpen, setStampDialogOpen] = useState(false);

  // サンプルデータ
  useEffect(() => {
    // 実際のAPIからデータを取得
    const sampleRoom: ChatRoom = {
      id: roomId || '1',
      title: '桜祭りイベント',
      description: '上野公園での桜祭りチャット',
      expiresAt: '2024-04-15T18:00:00Z',
      participantCount: 12,
      maxParticipants: 50,
    };
    
    const sampleMessages: Message[] = [
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
    if (!room) return;
    
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
    if (!newMessage.trim()) return;
    
    const message: Message = {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLeaveRoom = () => {
    // ルーム退出処理
    navigate('/chat-rooms');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const stamps = ['🌸', '👍', '❤️', '😊', '🎉', '👏', '🔥', '✨'];

  const handleStampSelect = (stamp: string) => {
    const message: Message = {
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>ルームを読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/chat-rooms')}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1, ml: 1 }}>
            <Typography variant="h6" noWrap>
              {room.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<AccessTime />}
                label={`残り${timeLeft}`}
                size="small"
                color="warning"
                variant="outlined"
              />
              <Typography variant="caption">
                {room.participantCount}/{room.maxParticipants}人
              </Typography>
            </Box>
          </Box>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLeaveRoom}>
          <ExitToApp sx={{ mr: 1 }} />
          ルームを退出
        </MenuItem>
      </Menu>

      {/* メッセージ一覧 */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              mb: 2,
              justifyContent: message.userId === 'current-user' ? 'flex-end' : 'flex-start',
            }}
          >
            {message.userId !== 'current-user' && (
              <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                {message.userName.charAt(0)}
              </Avatar>
            )}
            <Box sx={{ maxWidth: '70%' }}>
              {message.userId !== 'current-user' && (
                <Typography variant="caption" color="text.secondary">
                  {message.userName}
                </Typography>
              )}
              <Card
                sx={{
                  bgcolor: message.userId === 'current-user' ? 'primary.main' : 'grey.100',
                  color: message.userId === 'current-user' ? 'white' : 'text.primary',
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  {message.type === 'stamp' ? (
                    <Typography variant="h4" align="center">
                      {message.content}
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* メッセージ入力 */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setStampDialogOpen(true)}>
                  <EmojiEmotions />
                </IconButton>
                <IconButton>
                  <PhotoCamera />
                </IconButton>
                <IconButton onClick={handleSendMessage} color="primary">
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* スタンプ選択ダイアログ */}
      <Dialog open={stampDialogOpen} onClose={() => setStampDialogOpen(false)}>
        <DialogTitle>スタンプを選択</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {stamps.map((stamp) => (
              <Button
                key={stamp}
                onClick={() => handleStampSelect(stamp)}
                sx={{ fontSize: '2rem', minWidth: 60, minHeight: 60 }}
              >
                {stamp}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Chat;
