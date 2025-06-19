import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Sort,
  LocationOn,
  AccessTime,
  Favorite,
  Comment,
  MoreVert,
  Add,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPosts, setSortBy, setFilter } from '../store/slices/postsSlice';
import { setCurrentLocation } from '../store/slices/locationSlice';
import { RootState } from '../store';

/**
 * ホーム画面（タイムライン）コンポーネント
 * 現在地周辺の投稿を表示し、ソート・フィルター機能を提供
 */
const Home: React.FC = () => {
  // ソートメニューのアンカー要素（メニューの表示位置を制御）
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  // フィルターメニューのアンカー要素
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  
  // Reduxのディスパッチ関数
  const dispatch = useDispatch();
  // ページ遷移用のナビゲート関数
  const navigate = useNavigate();
  
  // Reduxストアから投稿関連の状態を取得
  const { posts, isLoading, error, sortBy, filter } = useSelector((state: RootState) => state.posts);
  // 現在の位置情報を取得
  const { currentLocation } = useSelector((state: RootState) => state.location);

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
        }
      );
    }
  }, [dispatch]); // dispatchが変更された時のみ再実行

  /**
   * 指定された位置情報で投稿をAPIから取得
   * @param lat - 緯度
   * @param lng - 経度
   */
  const fetchPosts = async (lat: number, lng: number) => {
    try {
      // APIから投稿を取得（位置情報と半径を指定）
      const response = await fetch(`/api/posts?lat=${lat}&lng=${lng}&radius=${filter.radius}`);
      const data = await response.json();
      // Reduxストアに投稿データを保存
      dispatch(setPosts(data.posts));
    } catch (error) {
      console.error('投稿の取得に失敗しました:', error);
    }
  };

  /**
   * ソートメニューを開く
   * @param event - クリックイベント
   */
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
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
  const handleSortSelect = (sortType: 'time' | 'distance') => {
    // Reduxストアにソート方法を保存
    dispatch(setSortBy(sortType));
    handleSortClose();
  };

  /**
   * フィルターメニューを開く
   * @param event - クリックイベント
   */
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
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
  const handleFilterSelect = (category: string) => {
    // Reduxストアにフィルター設定を保存
    dispatch(setFilter({ category }));
    handleFilterClose();
  };

  /**
   * 距離を読みやすい形式にフォーマット
   * @param distance - 距離（km）
   * @returns フォーマットされた距離文字列
   */
  const formatDistance = (distance: number) => {
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
  const formatTime = (timestamp: string) => {
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
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else {
      return `${days}日前`;
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* ヘッダー部分：タイトルとソート・フィルターボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">タイムライン</Typography>
        <Box>
          {/* ソートボタン */}
          <IconButton onClick={handleSortClick}>
            <Sort />
          </IconButton>
          {/* フィルターボタン */}
          <IconButton onClick={handleFilterClick}>
            <LocationOn />
          </IconButton>
        </Box>
      </Box>

      {/* ソートメニュー：時系列順・距離順の選択 */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSortSelect('time')}>
          <ListItemIcon>
            <AccessTime />
          </ListItemIcon>
          <ListItemText>時系列順</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect('distance')}>
          <ListItemIcon>
            <LocationOn />
          </ListItemIcon>
          <ListItemText>距離順</ListItemText>
        </MenuItem>
      </Menu>

      {/* フィルターメニュー：カテゴリ別フィルター */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect('')}>
          <ListItemText>すべて</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('event')}>
          <ListItemText>イベント</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('food')}>
          <ListItemText>グルメ</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('shopping')}>
          <ListItemText>ショッピング</ListItemText>
        </MenuItem>
      </Menu>

      {/* エラー表示：APIエラーなどが発生した場合 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 投稿一覧：各投稿をカード形式で表示 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map((post) => (
          <Card key={post.id} sx={{ cursor: 'pointer' }}>
            <CardContent>
              {/* 投稿ヘッダー：ユーザー名とメニューボタン */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {post.userId}
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              {/* 投稿本文 */}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>

              {/* 投稿画像：画像がある場合のみ表示 */}
              {post.images && post.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={post.images[0]}
                    alt="投稿画像"
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              )}

              {/* タグ一覧：投稿に関連付けられたタグを表示 */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>

              {/* 投稿フッター：リアクション数、距離、投稿時間 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* リアクション情報：いいね数とコメント数 */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Favorite fontSize="small" />
                    <Typography variant="body2">{post.reactions.likes}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Comment fontSize="small" />
                    <Typography variant="body2">{post.reactions.comments}</Typography>
                  </Box>
                </Box>
                {/* 位置・時間情報：距離と投稿時間 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {post.distance && (
                    <Typography variant="body2" color="text.secondary">
                      {formatDistance(post.distance)}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(post.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* フローティングアクションボタン：新規投稿画面への遷移 */}
      <Fab
        color="primary"
        aria-label="投稿"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => navigate('/post')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Home; 