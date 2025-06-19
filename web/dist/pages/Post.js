import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, TextField, Button, Typography, Chip, IconButton, Alert, CircularProgress, } from '@mui/material';
import { PhotoCamera, LocationOn, Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addPost } from '../store/slices/postsSlice';
const Post = () => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [tags, setTags] = useState([]);
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentLocation } = useSelector((state) => state.location);
    const categories = ['event', 'food', 'shopping', 'other'];
    const suggestedTags = ['#イベント', '#グルメ', '#ショッピング', '#おすすめ'];
    const handleImageUpload = (event) => {
        const files = event.target.files;
        if (files) {
            setImages(Array.from(files));
        }
    };
    const handleTagClick = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
    };
    const handleTagRemove = (tagToRemove) => {
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
            const imageUrls = [];
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
        }
        catch (error) {
            console.error('投稿の作成に失敗しました:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u65B0\u898F\u6295\u7A3F" }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 4, placeholder: "\u4F55\u304B\u6295\u7A3F\u3057\u3066\u307F\u307E\u3057\u3087\u3046...", value: content, onChange: (e) => setContent(e.target.value), sx: { mb: 2 } }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("input", { accept: "image/*", style: { display: 'none' }, id: "image-upload", multiple: true, type: "file", onChange: handleImageUpload }), _jsx("label", { htmlFor: "image-upload", children: _jsx(IconButton, { component: "span", children: _jsx(PhotoCamera, {}) }) }), images.length > 0 && (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: [images.length, "\u679A\u306E\u753B\u50CF\u3092\u9078\u629E\u4E2D"] }))] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u30AB\u30C6\u30B4\u30EA" }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' }, children: categories.map((cat) => (_jsx(Chip, { label: cat, onClick: () => setCategory(cat), color: category === cat ? 'primary' : 'default', variant: category === cat ? 'filled' : 'outlined' }, cat))) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u30BF\u30B0" }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }, children: suggestedTags.map((tag) => (_jsx(Chip, { label: tag, onClick: () => handleTagClick(tag), variant: "outlined", size: "small" }, tag))) }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' }, children: tags.map((tag) => (_jsx(Chip, { label: tag, onDelete: () => handleTagRemove(tag), color: "primary", size: "small" }, tag))) })] }), currentLocation && (_jsxs(Alert, { severity: "info", sx: { mb: 2 }, children: [_jsx(LocationOn, { sx: { mr: 1 } }), "\u4F4D\u7F6E\u60C5\u5831\u304C\u81EA\u52D5\u3067\u4ED8\u4E0E\u3055\u308C\u307E\u3059"] })), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "outlined", onClick: () => navigate('/'), fullWidth: true, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { variant: "contained", onClick: handleSubmit, disabled: !content.trim() || isSubmitting, fullWidth: true, startIcon: isSubmitting ? _jsx(CircularProgress, { size: 20 }) : _jsx(Send, {}), children: isSubmitting ? '投稿中...' : '投稿' })] })] }));
};
export default Post;
