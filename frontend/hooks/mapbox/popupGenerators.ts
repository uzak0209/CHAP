import { Post, Thread } from '@/types/types';

// 投稿ポップアップのHTML生成関数
export const createPostPopupHTML = (post: Post) => {
  return `
    <div class="relative max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg rounded-2xl overflow-hidden" 
         data-post-id="${post.id}"
         style="max-width: 20rem; background: linear-gradient(to bottom right, #eff6ff, #e0e7ff); border: 1px solid #c3dafe; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; overflow: hidden; position: relative;">
      
      <!-- 吹き出しの矢印 -->
      <div class="absolute -bottom-2 left-5 w-0 h-0" 
           style="position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #eff6ff;"></div>
      
      <!-- 投稿アイコン -->
      <div class="absolute top-2 left-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center"
           style="position: absolute; top: 8px; left: 8px; height: 24px; width: 24px; border-radius: 50%; background-color: #3b82f6; display: flex; align-items: center; justify-content: center;">
        <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 12px; width: 12px; color: white;">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
      
      <!-- メッセージコンテンツ -->
      <div class="p-4 pt-8" style="padding: 1rem; padding-top: 2rem;">
        <p class="text-sm text-blue-900 leading-relaxed mb-3" 
           style="font-size: 0.875rem; color: #1e3a8a; line-height: 1.6; margin-bottom: 0.75rem;">
          ${post.content}
        </p>
        <div class="flex justify-between items-center text-xs" 
             style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
          <div class="flex items-center gap-1">
            <svg id="heart-post-${post.id}" class="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" fill="white" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span id="like-count-post-${post.id}" class="text-white font-medium" style="color: #efffff; font-weight: 500;">${post.like || 0}</span>
          </div>
          <div class="text-blue-600" style="color: #2563eb;">
            <span class="ml-2" style="margin-left: 0.5rem;">${new Date(post.created_time || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// スレッドポップアップのHTML生成関数
export const createThreadPopupHTML = (thread: Thread) => {
  // 安全な日付処理
  const formatDate = () => {
    let dateStr = thread.created_time || thread.updated_at || (thread as any).timestamp;
    
    // Goのzero value日付をチェック
    if (!dateStr || dateStr === '' || dateStr === '0001-01-01T00:00:00Z') {
      return '日付不明';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '日付不明';
    }
    
    return date.toLocaleDateString('ja-JP');
  };

  return `
    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-lg max-w-xs cursor-pointer hover:shadow-xl transition-shadow" data-thread-id="${thread.id}">
      <div class="p-4">
        <div class="mb-3">
          <p class="text-gray-700 text-xs leading-relaxed">${thread.content ? thread.content.substring(0, 50) + (thread.content.length > 50 ? '...' : '') : ''}</p>
        </div>
        <div class="text-xs text-gray-500 border-t border-yellow-200 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <svg id="heart-thread-${thread.id}" class="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" fill="white" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span id="like-count-thread-${thread.id}" class="text-white font-medium" style="color: #efffff; font-weight: 500;">${thread.like || 0}</span>
            </div>
            <span class="ml-2">${formatDate()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}; 