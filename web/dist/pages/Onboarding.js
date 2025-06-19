import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stepper, Step, StepLabel, Alert, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLocationPermission } from '../store/slices/locationSlice';
const Onboarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [locationGranted, setLocationGranted] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const steps = [
        {
            title: 'CHAPへようこそ',
            content: '位置情報ベースのソーシャルアプリで、近くの人とつながりましょう。',
            image: '🎉'
        },
        {
            title: '位置情報の利用',
            content: 'あなたの現在地周辺の投稿を表示するために位置情報を使用します。プライバシーは保護されます。',
            image: '📍'
        },
        {
            title: 'プライバシーについて',
            content: 'あなたの投稿は設定した範囲内のユーザーにのみ表示されます。個人情報は適切に管理されます。',
            image: '🔒'
        },
        {
            title: 'コミュニティガイドライン',
            content: '他のユーザーを尊重し、適切な投稿を行ってください。不適切な投稿は削除される場合があります。',
            image: '🤝'
        }
    ];
    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // オンボーディング完了
            navigate('/');
        }
        else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };
    const requestLocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocationGranted(true);
                dispatch(setLocationPermission('granted'));
            }, (error) => {
                console.error('位置情報の取得に失敗しました:', error);
                dispatch(setLocationPermission('denied'));
            });
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }, children: _jsx(Box, { sx: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Card, { sx: { maxWidth: 400, width: '100%' }, children: _jsxs(CardContent, { sx: { p: 4 }, children: [_jsx(Stepper, { activeStep: activeStep, sx: { mb: 4 }, children: steps.map((label, index) => (_jsx(Step, { children: _jsx(StepLabel, {}) }, index))) }), _jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h1", sx: { fontSize: '4rem', mb: 2 }, children: steps[activeStep].image }), _jsx(Typography, { variant: "h5", component: "h1", gutterBottom: true, children: steps[activeStep].title }), _jsx(Typography, { variant: "body1", color: "text.secondary", children: steps[activeStep].content })] }), activeStep === 1 && !locationGranted && (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "\u4F4D\u7F6E\u60C5\u5831\u306E\u8A31\u53EF\u304C\u5FC5\u8981\u3067\u3059" })), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Button, { disabled: activeStep === 0, onClick: handleBack, children: "\u623B\u308B" }), activeStep === 1 && !locationGranted ? (_jsx(Button, { variant: "contained", onClick: requestLocationPermission, children: "\u4F4D\u7F6E\u60C5\u5831\u3092\u8A31\u53EF" })) : (_jsx(Button, { variant: "contained", onClick: handleNext, children: activeStep === steps.length - 1 ? '開始' : '次へ' }))] })] }) }) }) }));
};
export default Onboarding;
