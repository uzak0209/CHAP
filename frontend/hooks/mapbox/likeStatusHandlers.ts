import { Post, Thread } from '@/types/types';
import { getPostLikeStatus, getThreadLikeStatus } from '@/lib/api';

// 初期いいね状態の確認と色設定関数（投稿用）
export const checkInitialLikeStatus = async (post: Post) => {
  try {
    console.log(`🔍 投稿${post.id}の初期いいね状態を確認中...`);
    
    // 認証状態をチェック
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log(`⚠️ 認証トークンが見つからないため、いいね状態を確認できません`);
      return;
    }
    
    const status = await getPostLikeStatus(post.id);
    console.log(`📊 投稿${post.id}のAPI取得いいね状態:`, status);
    
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    const likeCountElement = document.getElementById(`like-count-post-${post.id}`);
    
    if (heartIcon && likeCountElement) {
      if (status.liked) {
        // いいね済み：赤色に設定
        heartIcon.style.fill = '#ef4444';
        likeCountElement.style.color = '#ef4444';
        likeCountElement.style.fontWeight = 'bold';
        console.log(`💖 投稿${post.id}は既にいいね済み (${status.like_count})`);
      } else {
        // 未いいね：白色に設定
        heartIcon.style.fill = 'white';
        likeCountElement.style.color = '#ffffff';
        likeCountElement.style.fontWeight = '500';
        console.log(`🤍 投稿${post.id}は未いいね (${status.like_count})`);
      }
      
      // いいね数を確実に更新（APIから取得した値を使用）
      likeCountElement.textContent = status.like_count.toString();
      console.log(`📊 投稿${post.id}のいいね数を更新: ${status.like_count}`);
    } else {
      console.warn(`⚠️ 投稿${post.id}のDOM要素が見つかりません`);
      console.log(`🔍 検索した要素ID: heart-post-${post.id}, like-count-post-${post.id}`);
    }
  } catch (error) {
    console.warn(`⚠️ 投稿${post.id}の初期いいね状態確認に失敗:`, error);
    // エラーの場合はデフォルト状態（未いいね）に設定
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    const likeCountElement = document.getElementById(`like-count-post-${post.id}`);
    
    if (heartIcon && likeCountElement) {
      heartIcon.style.fill = 'white';
      likeCountElement.style.color = '#ffffff';
      likeCountElement.style.fontWeight = '500';
      // エラー時は初期値を使用
      likeCountElement.textContent = (post.like || 0).toString();
    }
  }
};

// 初期いいね状態の確認と色設定関数（スレッド用）
export const checkInitialThreadLikeStatus = async (thread: Thread) => {
  try {
    console.log(`🔍 スレッド${thread.id}の初期いいね状態を確認中...`);
    
    // 認証状態をチェック
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log(`⚠️ 認証トークンが見つからないため、スレッドいいね状態を確認できません`);
      return;
    }
    
    const threadId = typeof thread.id === 'string' ? parseInt(thread.id) : thread.id;
    const status = await getThreadLikeStatus(threadId);
    console.log(`📊 スレッド${thread.id}のAPI取得いいね状態:`, status);
    
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    const likeCountElement = document.getElementById(`like-count-thread-${thread.id}`);
    
    if (heartIcon && likeCountElement) {
      if (status.liked) {
        // いいね済み：赤色に設定
        heartIcon.style.fill = '#ef4444';
        likeCountElement.style.color = '#ef4444';
        likeCountElement.style.fontWeight = 'bold';
        console.log(`💖 スレッド${thread.id}は既にいいね済み (${status.like_count})`);
      } else {
        // 未いいね：白色に設定
        heartIcon.style.fill = 'white';
        likeCountElement.style.color = '#ffffff';
        likeCountElement.style.fontWeight = '500';
        console.log(`🤍 スレッド${thread.id}は未いいね (${status.like_count})`);
      }
      
      // いいね数を確実に更新（APIから取得した値を使用）
      likeCountElement.textContent = status.like_count.toString();
      console.log(`📊 スレッド${thread.id}のいいね数を更新: ${status.like_count}`);
    } else {
      console.warn(`⚠️ スレッド${thread.id}のDOM要素が見つかりません`);
      console.log(`🔍 検索した要素ID: heart-thread-${thread.id}, like-count-thread-${thread.id}`);
    }
  } catch (error) {
    console.warn(`⚠️ スレッド${thread.id}の初期いいね状態確認に失敗:`, error);
    // エラーの場合はデフォルト状態（未いいね）に設定
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    const likeCountElement = document.getElementById(`like-count-thread-${thread.id}`);
    
    if (heartIcon && likeCountElement) {
      heartIcon.style.fill = 'white';
      likeCountElement.style.color = '#ffffff';
      likeCountElement.style.fontWeight = '500';
      // エラー時は初期値を使用
      likeCountElement.textContent = (thread.like || 0).toString();
    }
  }
}; 