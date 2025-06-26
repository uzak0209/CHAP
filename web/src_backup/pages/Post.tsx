import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, LocationOn, Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addPost } from '../store/slices/postsSlice';
import { RootState } from '../store';

const Post: React.FC = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentLocation } = useSelector((state: RootState) => state.location);

  const categories = ['event', 'food', 'shopping', 'other'];
  const suggestedTags = ['#イベント', '#グルメ', '#ショッピング', '#おすすめ'];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages(Array.from(files));
    }
  };

  const handleTagClick = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    if (!currentLocation) {
      alert('位置情報が取得できません。位置情報の許可を確認してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      // 画像のアップロード処理
      const imageUrls: string[] = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        imageUrls.push(data.url);
      }

      // 投稿の作成
      const newPost = {
        id: Date.now().toString(),
        userId: 'current-user', // 実際のユーザーIDに置き換え
        content,
        images: imageUrls,
        location: currentLocation,
        tags,
        category,
        createdAt: new Date().toISOString(),
        reactions: {
          likes: 0,
          comments: 0,
        },
      };

      dispatch(addPost(newPost));
      navigate('/');
    } catch (error) {
      console.error('投稿の作成に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        新規投稿
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="何か投稿してみましょう..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* 画像アップロード */}
      <Box sx={{ mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          multiple
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="image-upload">
          <IconButton component="span">
            <PhotoCamera />
          </IconButton>
        </label>
        {images.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {images.length}枚の画像を選択中
          </Typography>
        )}
      </Box>

      {/* カテゴリ選択 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          カテゴリ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategory(cat)}
              color={category === cat ? 'primary' : 'default'}
              variant={category === cat ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* タグ選択 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          タグ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {suggestedTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagClick(tag)}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagRemove(tag)}
              color="primary"
              size="small"
            />
          ))}
        </Box>
      </Box>

      {/* 位置情報表示 */}
      {currentLocation && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <LocationOn sx={{ mr: 1 }} />
          位置情報が自動で付与されます
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          fullWidth
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          fullWidth
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
        >
          {isSubmitting ? '投稿中...' : '投稿'}
        </Button>
      </Box>
    </Box>
  );
};

export default Post; 