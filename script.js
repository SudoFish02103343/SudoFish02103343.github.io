// 帖子数据存储
let posts = JSON.parse(localStorage.getItem('minecraftPosts')) || [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 初始化表单提交事件
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);
    
    // 初始化文件上传事件
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('videoUpload').addEventListener('change', handleVideoUpload);
    
    // 加载帖子列表
    renderPosts();
    
    // 初始化平滑滚动
    initSmoothScroll();
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 复制服务器地址
function copyServerAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showNotification(`服务器地址 ${address} 已复制到剪贴板！`);
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制地址');
    });
}

// 复制QQ群号
function copyQQNumber() {
    navigator.clipboard.writeText('775974668').then(() => {
        showNotification('QQ群号 775974668 已复制到剪贴板！');
    });
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加表情
function addEmoji(emoji) {
    const contentField = document.getElementById('postContent');
    const startPos = contentField.selectionStart;
    const endPos = contentField.selectionEnd;
    const content = contentField.value;
    
    contentField.value = content.substring(0, startPos) + emoji + content.substring(endPos);
    contentField.focus();
    contentField.selectionStart = contentField.selectionEnd = startPos + emoji.length;
}

// 处理图片上传
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const mediaItem = createMediaItem(e.target.result, 'image');
                preview.appendChild(mediaItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    event.target.value = '';
}

// 处理视频上传
function handleVideoUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const mediaItem = createMediaItem(e.target.result, 'video');
                preview.appendChild(mediaItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    event.target.value = '';
}

// 创建媒体预览项
function createMediaItem(src, type) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    
    const mediaElement = type === 'image' 
        ? document.createElement('img')
        : document.createElement('video');
    
    mediaElement.src = src;
    if (type === 'video') {
        mediaElement.controls = true;
        mediaElement.muted = true;
    }
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-media';
    removeBtn.innerHTML = '×';
    removeBtn.title = '移除';
    removeBtn.onclick = function() {
        mediaItem.remove();
    };
    
    mediaItem.appendChild(mediaElement);
    mediaItem.appendChild(removeBtn);
    
    return mediaItem;
}

// 处理帖子提交
function handlePostSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!title || !content) {
        showNotification('请填写标题和内容！');
        return;
    }
    
    // 收集媒体文件
    const mediaItems = Array.from(document.getElementById('mediaPreview').children);
    const media = mediaItems.map(item => {
        const mediaElement = item.querySelector('img, video');
        return {
            type: mediaElement.tagName.toLowerCase(),
            src: mediaElement.src
        };
    });
    
    // 创建新帖子
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        media: media,
        date: new Date().toLocaleString('zh-CN'),
        author: '玩家',
        replies: []
    };
    
    posts.unshift(newPost);
    savePosts();
    renderPosts();
    
    // 重置表单
    document.getElementById('postForm').reset();
    document.getElementById('mediaPreview').innerHTML = '';
    
    showNotification('帖子发布成功！');
}

// 保存帖子到本地存储
function savePosts() {
    localStorage.setItem('minecraftPosts', JSON.stringify(posts));
}

// 渲染帖子列表
function renderPosts() {
    const postsList = document.getElementById('postsList');
    
    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="text-align: center; color: var(--text-light);">还没有帖子，快来发布第一个吧！</p>
            </div>
        `;
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-date">${post.date} • ${post.author}</div>
            </div>
            <div class="post-content">${formatContent(post.content)}</div>
            
            ${post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media.map(media => `
                        ${media.type === 'image' 
                            ? `<img src="${media.src}" alt="帖子图片" loading="lazy">`
                            : `<video src="${media.src}" controls muted></video>`
                        }
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="reply-section">
                <div class="reply-form">
                    <input type="text" class="reply-input" placeholder="输入回复内容..." data-post-id="${post.id}">
                    <button type="button" class="reply-btn" onclick="addReply(${post.id})">回复</button>
                </div>
                
                ${post.replies.length > 0 ? `
                    <div class="replies-list">
                        ${post.replies.map(reply => `
                            <div class="reply-item">
                                <div class="reply-header">
                                    <span class="reply-author">${escapeHtml(reply.author)}</span>
                                    <span class="reply-date">${reply.date}</span>
                                </div>
                                <div class="reply-content">${formatContent(reply.content)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// 添加回复
function addReply(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const replyInput = document.querySelector(`.reply-input[data-post-id="${postId}"]`);
    const content = replyInput.value.trim();
    
    if (!content) {
        showNotification('请输入回复内容！');
        return;
    }
    
    const newReply = {
        id: Date.now(),
        author: '玩家',
        content: content,
        date: new Date().toLocaleString('zh-CN')
    };
    
    post.replies.unshift(newReply);
    savePosts();
    renderPosts();
    
    replyInput.value = '';
    showNotification('回复发布成功！');
}

// 格式化内容
function formatContent(content) {
    return escapeHtml(content)
        .replace(/\n/g, '<br>')
        .replace(/😊|🎮|❤️|⚡|🏠/g, match => `<span style="font-size: 1.1em;">${match}</span>`);
}

// HTML转义防止XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
