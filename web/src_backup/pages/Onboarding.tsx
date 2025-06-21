import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLocationPermission } from '../store/slices/locationSlice';

const Onboarding: React.FC = () => {
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
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          dispatch(setLocationPermission('granted'));
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          dispatch(setLocationPermission('denied'));
        }
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel></StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                {steps[activeStep].image}
              </Typography>
              <Typography variant="h5" component="h1" gutterBottom>
                {steps[activeStep].title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {steps[activeStep].content}
              </Typography>
            </Box>

            {activeStep === 1 && !locationGranted && (
              <Alert severity="info" sx={{ mb: 2 }}>
                位置情報の許可が必要です
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                戻る
              </Button>
              
              {activeStep === 1 && !locationGranted ? (
                <Button
                  variant="contained"
                  onClick={requestLocationPermission}
                >
                  位置情報を許可
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? '開始' : '次へ'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Onboarding; 