import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setInviteCode, setError, setLoading } from '../store/slices/authSlice';
import { RootState } from '../store';

const Login: React.FC = () => {
  const [inviteCode, setInviteCodeLocal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleInviteCodeSubmit = () => {
    if (!inviteCode.trim()) {
      dispatch(setError('招待コードを入力してください'));
      return;
    }
    
    dispatch(setInviteCode(inviteCode));
    // 招待コードの検証処理をここに追加
    // 成功したら次のステップに進む
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      dispatch(setError('メールアドレスとパスワードを入力してください'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Firebase認証処理をここに実装
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // dispatch(setUser(userCredential.user));
      
      // 成功したらオンボーディングまたはホーム画面に遷移
      navigate('/onboarding');
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            CHAP
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
            位置情報ベースのソーシャルアプリ
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAuthSubmit}>
            <TextField
              fullWidth
              label="招待コード"
              value={inviteCode}
              onChange={(e) => setInviteCodeLocal(e.target.value)}
              margin="normal"
              required
              placeholder="招待コードを入力してください"
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleInviteCodeSubmit}
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : '招待コードを確認'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                または
              </Typography>
            </Divider>

            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                isSignUp ? 'アカウント作成' : 'ログイン'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setIsSignUp(!isSignUp)}
              sx={{ mt: 1 }}
            >
              {isSignUp ? '既存のアカウントでログイン' : '新規アカウント作成'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              QRコードでスキャン
            </Typography>
            {/* QRコードスキャン機能をここに追加 */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 