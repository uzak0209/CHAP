'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Shield, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const slides = [
  {
    icon: Users,
    title: '地域のつながり',
    description: '近所の人々と気軽にコミュニケーションを取り、地域の情報を共有しましょう。',
  },
  {
    icon: MapPin,
    title: '位置情報について',
    description: '位置情報を使用して、あなたの近くの投稿やイベントを表示します。プライバシーは保護されます。',
  },
  {
    icon: Shield,
    title: 'プライバシー保護',
    description: '個人情報は厳重に保護され、位置情報は一般的な地域のみが共有されます。',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const router = useRouter();

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted') {
        setLocationPermission('granted');
        router.push('/');
      } else {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission('granted');
            router.push('/');
          },
          () => setLocationPermission('denied'),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    } catch (error) {
      setLocationPermission('denied');
    }
  };

  const skipOnboarding = () => router.push('/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <OnboardingSlide slide={slides[currentSlide]} />
          
          <OnboardingProgress 
            current={currentSlide} 
            total={slides.length} 
          />
          
          <OnboardingNavigation
            currentSlide={currentSlide}
            totalSlides={slides.length}
            onNext={nextSlide}
            onPrev={prevSlide}
            onRequestLocation={requestLocationPermission}
            onSkip={skipOnboarding}
            locationPermission={locationPermission}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function OnboardingSlide({ slide }: { slide: typeof slides[0] }) {
  const Icon = slide.icon;
  return (
    <div className="text-center mb-8">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
      <p className="text-gray-600 leading-relaxed">{slide.description}</p>
    </div>
  );
}

function OnboardingProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center mb-6">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full mx-1 ${
            index === current ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function OnboardingNavigation({ 
  currentSlide, 
  totalSlides, 
  onNext, 
  onPrev, 
  onRequestLocation, 
  onSkip,
  locationPermission 
}: {
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  onRequestLocation: () => void;
  onSkip: () => void;
  locationPermission: 'pending' | 'granted' | 'denied';
}) {
  const isLastSlide = currentSlide === totalSlides - 1;
  
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={currentSlide === 0 ? onSkip : onPrev}
        disabled={locationPermission === 'granted'}
      >
        {currentSlide === 0 ? (
          'スキップ'
        ) : (
          <>
            <ChevronLeft className="w-4 h-4 mr-1" />
            戻る
          </>
        )}
      </Button>
      
      <Button
        onClick={isLastSlide ? onRequestLocation : onNext}
        disabled={locationPermission === 'granted'}
      >
        {isLastSlide ? (
          locationPermission === 'denied' ? '続行' : '位置情報を許可'
        ) : (
          <>
            次へ
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
} 