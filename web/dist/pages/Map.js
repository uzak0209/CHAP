import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, AppBar, Toolbar, Drawer, FormControlLabel, Switch, Slider, Divider, Grid, } from '@mui/material';
import { Map as MapIcon, FilterList, Close, Refresh, ZoomIn, ZoomOut, MyLocation, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const Map = () => {
    const navigate = useNavigate();
    const [trends, setTrends] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedTrend, setSelectedTrend] = useState(null);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(new Set(['event', 'food', 'weather', 'transport', 'emergency', 'other']));
    const [intensityFilter, setIntensityFilter] = useState(['low', 'medium', 'high']);
    const [timeRange, setTimeRange] = useState(24); // 時間
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showRegionLabels, setShowRegionLabels] = useState(true);
    // サンプルデータ
    useEffect(() => {
        const sampleTrends = [
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
        const sampleRegions = [
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
    const getCategoryColor = (category) => {
        const colors = {
            event: '#FF6B6B',
            food: '#4ECDC4',
            weather: '#45B7D1',
            transport: '#96CEB4',
            emergency: '#FFEAA7',
            other: '#DDA0DD',
        };
        return colors[category] || colors.other;
    };
    const getIntensitySize = (intensity) => {
        switch (intensity) {
            case 'high': return 40;
            case 'medium': return 30;
            case 'low': return 20;
            default: return 25;
        }
    };
    const filteredTrends = trends.filter(trend => selectedCategories.has(trend.category) &&
        intensityFilter.includes(trend.intensity));
    const handleCategoryToggle = (category) => {
        const newCategories = new Set(selectedCategories);
        if (newCategories.has(category)) {
            newCategories.delete(category);
        }
        else {
            newCategories.add(category);
        }
        setSelectedCategories(newCategories);
    };
    const handleTrendClick = (trend) => {
        setSelectedTrend(trend);
    };
    const formatTimestamp = (timestamp) => {
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
    return (_jsxs(Box, { sx: { height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(MapIcon, { sx: { mr: 2 } }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u30C8\u30EC\u30F3\u30C9\u30DE\u30C3\u30D7" }), _jsx(IconButton, { color: "inherit", onClick: () => setFilterDrawerOpen(true), children: _jsx(FilterList, {}) }), _jsx(IconButton, { color: "inherit", children: _jsx(Refresh, {}) })] }) }), _jsxs(Box, { sx: { flexGrow: 1, position: 'relative', bgcolor: '#f0f0f0' }, children: [_jsxs(Box, { sx: {
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            background: 'linear-gradient(45deg, #e8f5e8 0%, #f0f8ff 100%)',
                            overflow: 'hidden',
                        }, children: [filteredTrends.map((trend, index) => (_jsx(Box, { onClick: () => handleTrendClick(trend), sx: {
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
                                }, children: _jsx(Typography, { variant: "caption", sx: {
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '10px',
                                        textAlign: 'center',
                                    }, children: trend.word }) }, index))), showRegionLabels && regions.map((region, index) => (_jsxs(Box, { sx: {
                                    position: 'absolute',
                                    left: `${25 + (index * 20) % 50}%`,
                                    top: `${80 - (index * 10) % 30}%`,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", children: region.name }), _jsxs(Typography, { variant: "caption", color: "textSecondary", display: "block", children: [region.totalMentions, "\u4EF6"] })] }, region.name)))] }), _jsxs(Box, { sx: {
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }, children: [_jsx(IconButton, { sx: { bgcolor: 'background.paper', boxShadow: 1 }, size: "small", children: _jsx(ZoomIn, {}) }), _jsx(IconButton, { sx: { bgcolor: 'background.paper', boxShadow: 1 }, size: "small", children: _jsx(ZoomOut, {}) }), _jsx(IconButton, { sx: { bgcolor: 'background.paper', boxShadow: 1 }, size: "small", children: _jsx(MyLocation, {}) })] }), _jsx(Card, { sx: {
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            minWidth: 200,
                            maxWidth: 300,
                        }, children: _jsxs(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u30AB\u30C6\u30B4\u30EA\u5225\u8272\u5206\u3051" }), _jsx(Grid, { container: true, spacing: 1, children: Object.entries(categoryLabels).map(([key, label]) => (_jsx(Grid, { item: true, xs: 6, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Box, { sx: {
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: getCategoryColor(key),
                                                    } }), _jsx(Typography, { variant: "caption", children: label })] }) }, key))) })] }) })] }), _jsx(Drawer, { anchor: "right", open: filterDrawerOpen, onClose: () => setFilterDrawerOpen(false), children: _jsxs(Box, { sx: { width: 300, p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", children: "\u30D5\u30A3\u30EB\u30BF\u30FC" }), _jsx(IconButton, { onClick: () => setFilterDrawerOpen(false), children: _jsx(Close, {}) })] }), _jsx(Divider, { sx: { mb: 2 } }), _jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u30AB\u30C6\u30B4\u30EA" }), _jsx(List, { dense: true, children: Object.entries(categoryLabels).map(([key, label]) => (_jsx(ListItem, { sx: { px: 0 }, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: selectedCategories.has(key), onChange: () => handleCategoryToggle(key), size: "small" }), label: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Box, { sx: {
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: getCategoryColor(key),
                                                } }), label] }) }) }, key))) }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: ["\u6642\u9593\u7BC4\u56F2: ", timeRange, "\u6642\u9593"] }), _jsx(Slider, { value: timeRange, onChange: (_, value) => setTimeRange(value), min: 1, max: 168, marks: [
                                { value: 1, label: '1h' },
                                { value: 24, label: '24h' },
                                { value: 168, label: '1w' },
                            ], valueLabelDisplay: "auto" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u8868\u793A\u30AA\u30D7\u30B7\u30E7\u30F3" }), _jsxs(List, { dense: true, children: [_jsx(ListItem, { sx: { px: 0 }, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showHeatmap, onChange: (e) => setShowHeatmap(e.target.checked), size: "small" }), label: "\u30D2\u30FC\u30C8\u30DE\u30C3\u30D7\u8868\u793A" }) }), _jsx(ListItem, { sx: { px: 0 }, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showRegionLabels, onChange: (e) => setShowRegionLabels(e.target.checked), size: "small" }), label: "\u5730\u57DF\u30E9\u30D9\u30EB\u8868\u793A" }) })] }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Button, { fullWidth: true, variant: "outlined", onClick: () => {
                                setSelectedCategories(new Set(['event', 'food', 'weather', 'transport', 'emergency', 'other']));
                                setTimeRange(24);
                                setShowHeatmap(true);
                                setShowRegionLabels(true);
                            }, children: "\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u30EA\u30BB\u30C3\u30C8" })] }) }), _jsx(Dialog, { open: !!selectedTrend, onClose: () => setSelectedTrend(null), maxWidth: "sm", fullWidth: true, children: selectedTrend && (_jsxs(_Fragment, { children: [_jsx(DialogTitle, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Box, { sx: {
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            backgroundColor: getCategoryColor(selectedTrend.category),
                                        } }), selectedTrend.word] }) }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u5730\u57DF" }), _jsx(Typography, { variant: "body1", children: selectedTrend.region })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u8A00\u53CA\u6570" }), _jsxs(Typography, { variant: "body1", children: [selectedTrend.count, "\u4EF6"] })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u30AB\u30C6\u30B4\u30EA" }), _jsx(Chip, { label: categoryLabels[selectedTrend.category], size: "small", sx: { backgroundColor: getCategoryColor(selectedTrend.category) } })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u5F37\u5EA6" }), _jsx(Chip, { label: intensityLabels[selectedTrend.intensity], size: "small", color: selectedTrend.intensity === 'high' ? 'error' : selectedTrend.intensity === 'medium' ? 'warning' : 'default' })] }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u6700\u7D42\u66F4\u65B0" }), _jsx(Typography, { variant: "body1", children: formatTimestamp(selectedTrend.timestamp) })] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setSelectedTrend(null), children: "\u9589\u3058\u308B" }), _jsx(Button, { variant: "contained", onClick: () => {
                                        navigate(`/posts?location=${selectedTrend.region}&keyword=${selectedTrend.word}`);
                                    }, children: "\u95A2\u9023\u6295\u7A3F\u3092\u898B\u308B" })] })] })) })] }));
};
export default Map;
