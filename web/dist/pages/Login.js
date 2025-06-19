import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Divider, } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setInviteCode, setError, setLoading } from '../store/slices/authSlice';
const Login = () => {
    const [inviteCode, setInviteCodeLocal] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);
    const handleInviteCodeSubmit = () => {
        if (!inviteCode.trim()) {
            dispatch(setError('招待コードを入力してください'));
            return;
        }
        dispatch(setInviteCode(inviteCode));
        // 招待コードの検証処理をここに追加
        // 成功したら次のステップに進む
    };
    const handleAuthSubmit = async (e) => {
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
        }
        catch (error) {
            dispatch(setError(error.message));
        }
        finally {
            dispatch(setLoading(false));
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }, children: _jsx(Card, { sx: { maxWidth: 400, width: '100%' }, children: _jsxs(CardContent, { sx: { p: 4 }, children: [_jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, align: "center", children: "CHAP" }), _jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", gutterBottom: true, children: "\u4F4D\u7F6E\u60C5\u5831\u30D9\u30FC\u30B9\u306E\u30BD\u30FC\u30B7\u30E3\u30EB\u30A2\u30D7\u30EA" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error })), _jsxs(Box, { component: "form", onSubmit: handleAuthSubmit, children: [_jsx(TextField, { fullWidth: true, label: "\u62DB\u5F85\u30B3\u30FC\u30C9", value: inviteCode, onChange: (e) => setInviteCodeLocal(e.target.value), margin: "normal", required: true, placeholder: "\u62DB\u5F85\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx(Button, { fullWidth: true, variant: "contained", onClick: handleInviteCodeSubmit, disabled: isLoading, sx: { mt: 2 }, children: isLoading ? _jsx(CircularProgress, { size: 24 }) : '招待コードを確認' }), _jsx(Divider, { sx: { my: 3 }, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u307E\u305F\u306F" }) }), _jsx(TextField, { fullWidth: true, label: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9", type: "email", value: email, onChange: (e) => setEmail(e.target.value), margin: "normal", required: true }), _jsx(TextField, { fullWidth: true, label: "\u30D1\u30B9\u30EF\u30FC\u30C9", type: "password", value: password, onChange: (e) => setPassword(e.target.value), margin: "normal", required: true }), _jsx(Button, { fullWidth: true, type: "submit", variant: "contained", disabled: isLoading, sx: { mt: 3 }, children: isLoading ? (_jsx(CircularProgress, { size: 24 })) : (isSignUp ? 'アカウント作成' : 'ログイン') }), _jsx(Button, { fullWidth: true, variant: "text", onClick: () => setIsSignUp(!isSignUp), sx: { mt: 1 }, children: isSignUp ? '既存のアカウントでログイン' : '新規アカウント作成' })] }), _jsx(Box, { sx: { mt: 3, textAlign: 'center' }, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "QR\u30B3\u30FC\u30C9\u3067\u30B9\u30AD\u30E3\u30F3" }) })] }) }) }));
};
export default Login;
