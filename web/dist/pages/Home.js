import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Fab, CircularProgress, Alert, } from '@mui/material';
import { Sort, LocationOn, AccessTime, Favorite, Comment, MoreVert, Add, } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPosts, setSortBy, setFilter } from '../store/slices/postsSlice';
import { setCurrentLocation } from '../store/slices/locationSlice';
/**
 * ホーム画面（タイムライン）コンポーネント
 * 現在地周辺の投稿を表示し、ソート・フィルター機能を提供
 */
const Home = () => {
    // ソートメニューのアンカー要素（メニューの表示位置を制御）
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    // フィルターメニューのアンカー要素
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    // Reduxのディスパッチ関数
    const dispatch = useDispatch();
    // ページ遷移用のナビゲート関数
    const navigate = useNavigate();
    // Reduxストアから投稿関連の状態を取得
    const { posts, isLoading, error, sortBy, filter } = useSelector((state) => state.posts);
    // 現在の位置情報を取得
    const { currentLocation } = useSelector((state) => state.location);
    /**
     * コンポーネントマウント時に位置情報を取得し、投稿をフェッチ
     */
    useEffect(() => {
        // ブラウザが位置情報APIをサポートしているかチェック
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
            // 位置情報取得成功時のコールバック
            (position) => {
                const { latitude, longitude } = position.coords;
                // Reduxストアに現在位置を保存
                dispatch(setCurrentLocation({ latitude, longitude }));
                // 取得した位置情報で投稿をフェッチ
                fetchPosts(latitude, longitude);
            }, 
            // 位置情報取得失敗時のコールバック
            (error) => {
                console.error('位置情報の取得に失敗しました:', error);
                // デフォルト位置（東京）で投稿を取得
                fetchPosts(35.6762, 139.6503);
            });
        }
    }, [dispatch]); // dispatchが変更された時のみ再実行
    /**
     * 指定された位置情報で投稿をAPIから取得
     * @param lat - 緯度
     * @param lng - 経度
     */
    const fetchPosts = async (lat, lng) => {
        try {
            // APIから投稿を取得（位置情報と半径を指定）
            const response = await fetch(`/api/posts?lat=${lat}&lng=${lng}&radius=${filter.radius}`);
            const data = await response.json();
            // Reduxストアに投稿データを保存
            dispatch(setPosts(data.posts));
        }
        catch (error) {
            console.error('投稿の取得に失敗しました:', error);
        }
    };
    /**
     * ソートメニューを開く
     * @param event - クリックイベント
     */
    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };
    /**
     * ソートメニューを閉じる
     */
    const handleSortClose = () => {
        setSortAnchorEl(null);
    };
    /**
     * ソート方法を選択
     * @param sortType - ソートタイプ（'time' | 'distance'）
     */
    const handleSortSelect = (sortType) => {
        // Reduxストアにソート方法を保存
        dispatch(setSortBy(sortType));
        handleSortClose();
    };
    /**
     * フィルターメニューを開く
     * @param event - クリックイベント
     */
    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };
    /**
     * フィルターメニューを閉じる
     */
    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };
    /**
     * フィルターカテゴリを選択
     * @param category - 選択されたカテゴリ
     */
    const handleFilterSelect = (category) => {
        // Reduxストアにフィルター設定を保存
        dispatch(setFilter({ category }));
        handleFilterClose();
    };
    /**
     * 距離を読みやすい形式にフォーマット
     * @param distance - 距離（km）
     * @returns フォーマットされた距離文字列
     */
    const formatDistance = (distance) => {
        if (distance < 1) {
            // 1km未満はメートルで表示
            return `${Math.round(distance * 1000)}m`;
        }
        // 1km以上は小数点1桁で表示
        return `${distance.toFixed(1)}km`;
    };
    /**
     * タイムスタンプを相対時間にフォーマット
     * @param timestamp - ISO形式のタイムスタンプ
     * @returns 相対時間文字列（例：5分前、2時間前）
     */
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        // ミリ秒を分、時間、日に変換
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        // 時間に応じて適切な単位で表示
        if (minutes < 60) {
            return `${minutes}分前`;
        }
        else if (hours < 24) {
            return `${hours}時間前`;
        }
        else {
            return `${days}日前`;
        }
    };
    // ローディング中の表示
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", children: "\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3" }), _jsxs(Box, { children: [_jsx(IconButton, { onClick: handleSortClick, children: _jsx(Sort, {}) }), _jsx(IconButton, { onClick: handleFilterClick, children: _jsx(LocationOn, {}) })] })] }), _jsxs(Menu, { anchorEl: sortAnchorEl, open: Boolean(sortAnchorEl), onClose: handleSortClose, children: [_jsxs(MenuItem, { onClick: () => handleSortSelect('time'), children: [_jsx(ListItemIcon, { children: _jsx(AccessTime, {}) }), _jsx(ListItemText, { children: "\u6642\u7CFB\u5217\u9806" })] }), _jsxs(MenuItem, { onClick: () => handleSortSelect('distance'), children: [_jsx(ListItemIcon, { children: _jsx(LocationOn, {}) }), _jsx(ListItemText, { children: "\u8DDD\u96E2\u9806" })] })] }), _jsxs(Menu, { anchorEl: filterAnchorEl, open: Boolean(filterAnchorEl), onClose: handleFilterClose, children: [_jsx(MenuItem, { onClick: () => handleFilterSelect(''), children: _jsx(ListItemText, { children: "\u3059\u3079\u3066" }) }), _jsx(MenuItem, { onClick: () => handleFilterSelect('event'), children: _jsx(ListItemText, { children: "\u30A4\u30D9\u30F3\u30C8" }) }), _jsx(MenuItem, { onClick: () => handleFilterSelect('food'), children: _jsx(ListItemText, { children: "\u30B0\u30EB\u30E1" }) }), _jsx(MenuItem, { onClick: () => handleFilterSelect('shopping'), children: _jsx(ListItemText, { children: "\u30B7\u30E7\u30C3\u30D4\u30F3\u30B0" }) })] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error })), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: posts.map((post) => (_jsx(Card, { sx: { cursor: 'pointer' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: post.userId }), _jsx(IconButton, { size: "small", children: _jsx(MoreVert, {}) })] }), _jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: post.content }), post.images && post.images.length > 0 && (_jsx(Box, { sx: { mb: 2 }, children: _jsx("img", { src: post.images[0], alt: "\u6295\u7A3F\u753B\u50CF", style: { width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 } }) })), _jsx(Box, { sx: { display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }, children: post.tags.map((tag) => (_jsx(Chip, { label: tag, size: "small" }, tag))) }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [_jsx(Favorite, { fontSize: "small" }), _jsx(Typography, { variant: "body2", children: post.reactions.likes })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [_jsx(Comment, { fontSize: "small" }), _jsx(Typography, { variant: "body2", children: post.reactions.comments })] })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [post.distance && (_jsx(Typography, { variant: "body2", color: "text.secondary", children: formatDistance(post.distance) })), _jsx(Typography, { variant: "body2", color: "text.secondary", children: formatTime(post.createdAt) })] })] })] }) }, post.id))) }), _jsx(Fab, { color: "primary", "aria-label": "\u6295\u7A3F", sx: { position: 'fixed', bottom: 80, right: 16 }, onClick: () => navigate('/post'), children: _jsx(Add, {}) })] }));
};
export default Home;
