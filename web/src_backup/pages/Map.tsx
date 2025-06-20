import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Drawer,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
  Badge,
  Paper,
  Grid,
} from '@mui/material';
import {
  Map as MapIcon,
  FilterList,
  TrendingUp,
  LocationOn,
  Layers,
  Settings,
  Info,
  Close,
  Refresh,
  ZoomIn,
  ZoomOut,
  MyLocation,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TrendData {
  word: string;
  count: number;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: 'event' | 'food' | 'weather' | 'transport' | 'emergency' | 'other';
  intensity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface RegionData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  trends: TrendData[];
  totalMentions: number;
}

const Map: React.FC = () => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendData | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['event', 'food', 'weather', 'transport', 'emergency', 'other']));
  const [intensityFilter, setIntensityFilter] = useState<string[]>(['low', 'medium', 'high']);
  const [timeRange, setTimeRange] = useState<number>(24); // 時間
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRegionLabels, setShowRegionLabels] = useState(true);

  // サンプルデータ
  useEffect(() => {
    const sampleTrends: TrendData[] = [
      {
        word: '桜',
        count: 150,
        region: '上野',
        coordinates: { lat: 35.7148, lng: 139.7753 },
        category: 'event',
        intensity: 'high',
        timestamp: '2024-04-15T10:00:00Z',
      },
      {
        word: 'ラーメン',
        count: 89,
        region: '渋谷',
        coordinates: { lat: 35.6598, lng: 139.7006 },
        category: 'food',
        intensity: 'medium',
        timestamp: '2024-04-15T09:30:00Z',
      },
      {
        word: '雨',
        count: 234,
        region: '新宿',
        coordinates: { lat: 35.6896, lng: 139.6917 },
        category: 'weather',
        intensity: 'high',
        timestamp: '2024-04-15T08:00:00Z',
      },
      {
        word: '電車遅延',
        count: 67,
        region: '品川',
        coordinates: { lat: 35.6284, lng: 139.7387 },
        category: 'transport',
        intensity: 'medium',
        timestamp: '2024-04-15T07:45:00Z',
      },
      {
        word: 'カフェ',
        count: 45,
        region: '表参道',
        coordinates: { lat: 35.6657, lng: 139.7100 },
        category: 'food',
        intensity: 'low',
        timestamp: '2024-04-15T11:15:00Z',
      },
    ];

    const sampleRegions: RegionData[] = [
      {
        name: '上野',
        coordinates: { lat: 35.7148, lng: 139.7753 },
        trends: sampleTrends.filter(t => t.region === '上野'),
        totalMentions: 150,
      },
      {
        name: '渋谷',
        coordinates: { lat: 35.6598, lng: 139.7006 },
        trends: sampleTrends.filter(t => t.region === '渋谷'),
        totalMentions: 89,
      },
      {
        name: '新宿',
        coordinates: { lat: 35.6896, lng: 139.6917 },
        trends: sampleTrends.filter(t => t.region === '新宿'),
        totalMentions: 234,
      },
    ];

    setTrends(sampleTrends);
    setRegions(sampleRegions);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      event: '#FF6B6B',
      food: '#4ECDC4',
      weather: '#45B7D1',
      transport: '#96CEB4',
      emergency: '#FFEAA7',
      other: '#DDA0DD',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getIntensitySize = (intensity: string) => {
    switch (intensity) {
      case 'high': return 40;
      case 'medium': return 30;
      case 'low': return 20;
      default: return 25;
    }
  };

  const filteredTrends = trends.filter(trend => 
    selectedCategories.has(trend.category) && 
    intensityFilter.includes(trend.intensity)
  );

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const handleTrendClick = (trend: TrendData) => {
    setSelectedTrend(trend);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  const categoryLabels = {
    event: 'イベント',
    food: 'グルメ',
    weather: '天気',
    transport: '交通',
    emergency: '緊急',
    other: 'その他',
  };

  const intensityLabels = {
    low: '低',
    medium: '中',
    high: '高',
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <MapIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            トレンドマップ
          </Typography>
          <IconButton color="inherit" onClick={() => setFilterDrawerOpen(true)}>
            <FilterList />
          </IconButton>
          <IconButton color="inherit">
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#f0f0f0' }}>
        {/* 地図エリア（実際の実装では Google Maps や Leaflet などを使用） */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: 'linear-gradient(45deg, #e8f5e8 0%, #f0f8ff 100%)',
            overflow: 'hidden',
          }}
        >
          {/* トレンドポイント */}
          {filteredTrends.map((trend, index) => (
            <Box
              key={index}
              onClick={() => handleTrendClick(trend)}
              sx={{
                position: 'absolute',
                left: `${20 + (index * 15) % 60}%`,
                top: `${20 + (index * 20) % 60}%`,
                width: getIntensitySize(trend.intensity),
                height: getIntensitySize(trend.intensity),
                borderRadius: '50%',
                backgroundColor: getCategoryColor(trend.category),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.2)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  textAlign: 'center',
                }}
              >
                {trend.word}
              </Typography>
            </Box>
          ))}

          {/* 地域ラベル */}
          {showRegionLabels && regions.map((region, index) => (
            <Box
              key={region.name}
              sx={{
                position: 'absolute',
                left: `${25 + (index * 20) % 50}%`,
                top: `${80 - (index * 10) % 30}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 8px',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {region.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                {region.totalMentions}件
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 地図コントロール */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <IconButton
            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            size="small"
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            size="small"
          >
            <ZoomOut />
          </IconButton>
          <IconButton
            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            size="small"
          >
            <MyLocation />
          </IconButton>
        </Box>

        {/* 凡例 */}
        <Card
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            minWidth: 200,
            maxWidth: 300,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" gutterBottom>
              カテゴリ別色分け
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Grid item xs={6} key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getCategoryColor(key),
                      }}
                    />
                    <Typography variant="caption">{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* フィルタードロワー */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">フィルター</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* カテゴリフィルター */}
          <Typography variant="subtitle1" gutterBottom>
            カテゴリ
          </Typography>
          <List dense>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <ListItem key={key} sx={{ px: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedCategories.has(key)}
                      onChange={() => handleCategoryToggle(key)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getCategoryColor(key),
                        }}
                      />
                      {label}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* 時間範囲フィルター */}
          <Typography variant="subtitle1" gutterBottom>
            時間範囲: {timeRange}時間
          </Typography>
          <Slider
            value={timeRange}
            onChange={(_, value) => setTimeRange(value as number)}
            min={1}
            max={168}
            marks={[
              { value: 1, label: '1h' },
              { value: 24, label: '24h' },
              { value: 168, label: '1w' },
            ]}
            valueLabelDisplay="auto"
          />

          <Divider sx={{ my: 2 }} />

          {/* 表示オプション */}
          <Typography variant="subtitle1" gutterBottom>
            表示オプション
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    size="small"
                  />
                }
                label="ヒートマップ表示"
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showRegionLabels}
                    onChange={(e) => setShowRegionLabels(e.target.checked)}
                    size="small"
                  />
                }
                label="地域ラベル表示"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setSelectedCategories(new Set(['event', 'food', 'weather', 'transport', 'emergency', 'other']));
              setTimeRange(24);
              setShowHeatmap(true);
              setShowRegionLabels(true);
            }}
          >
            フィルターをリセット
          </Button>
        </Box>
      </Drawer>

      {/* トレンド詳細ダイアログ */}
      <Dialog
        open={!!selectedTrend}
        onClose={() => setSelectedTrend(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedTrend && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: getCategoryColor(selectedTrend.category),
                  }}
                />
                {selectedTrend.word}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    地域
                  </Typography>
                  <Typography variant="body1">
                    {selectedTrend.region}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    言及数
                  </Typography>
                  <Typography variant="body1">
                    {selectedTrend.count}件
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    カテゴリ
                  </Typography>
                  <Chip
                    label={categoryLabels[selectedTrend.category as keyof typeof categoryLabels]}
                    size="small"
                    sx={{ backgroundColor: getCategoryColor(selectedTrend.category) }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    強度
                  </Typography>
                  <Chip
                    label={intensityLabels[selectedTrend.intensity as keyof typeof intensityLabels]}
                    size="small"
                    color={selectedTrend.intensity === 'high' ? 'error' : selectedTrend.intensity === 'medium' ? 'warning' : 'default'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    最終更新
                  </Typography>
                  <Typography variant="body1">
                    {formatTimestamp(selectedTrend.timestamp)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTrend(null)}>
                閉じる
              </Button>
              <Button variant="contained" onClick={() => {
                navigate(`/posts?location=${selectedTrend.region}&keyword=${selectedTrend.word}`);
              }}>
                関連投稿を見る
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Map;
