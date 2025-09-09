/**
 * 逗留邮箱管理平台 - 通用JavaScript功能
 */

// 主题管理
const ThemeManager = {
    // 设置主题
    setTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // 更新主题切换按钮文本
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.innerText = isDark ? '☀️ 明亮模式' : '🌙 暗黑模式';
        }
        
        // 触发主题变更事件
        window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
    },
    
    // 切换主题
    toggleTheme() {
        const isDark = !document.body.classList.contains('dark-mode');
        this.setTheme(isDark);
    },
    
    // 初始化主题
    init() {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark';
        this.setTheme(isDark);
        
        // 绑定主题切换按钮
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.onclick = () => this.toggleTheme();
        }
    }
};

// API 通信管理
const ApiManager = {
    // 基础请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, finalOptions);
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            return { success: false, msg: '网络请求失败' };
        }
    },
    
    // GET 请求
    async get(action, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `api.php?action=${action}${queryString ? '&' + queryString : ''}`;
        return this.request(url);
    },
    
    // POST 请求
    async post(action, data = {}) {
        const body = new URLSearchParams(data).toString();
        return this.request(`api.php?action=${action}`, {
            method: 'POST',
            body: body
        });
    },
    
    // 登录
    async login(username, password) {
        return this.post('login', { username, password });
    },
    
    // 检查登录状态
    async checkLogin() {
        return this.get('check_login');
    },
    
    // 退出登录
    async logout() {
        return this.get('logout');
    },
    
    // 邮箱管理相关
    async addMailbox(data) {
        return this.post('add_mailbox', data);
    },
    
    async deleteMailbox(id) {
        return this.post('delete_mailbox', { id });
    },
    
    async listMailboxes() {
        return this.get('list_mailboxes');
    },
    
    async listMails(mailboxId) {
        return this.get('list_mails', { mailbox_id: mailboxId });
    },
    
    async getLatestMail(email) {
        return this.get('get_latest_mail', { email });
    }
};

// 消息提示管理
const MessageManager = {
    // 显示消息
    show(message, type = 'info', container = null) {
        const msgElement = document.createElement('div');
        msgElement.className = `msg msg-${type}`;
        msgElement.textContent = message;
        
        // 确定消息容器
        let targetContainer = container;
        if (!targetContainer) {
            targetContainer = document.getElementById('msg') || document.querySelector('.container');
        }
        
        if (targetContainer) {
            // 清除之前的消息
            const existingMsgs = targetContainer.querySelectorAll('.msg');
            existingMsgs.forEach(msg => msg.remove());
            
            targetContainer.appendChild(msgElement);
            
            // 3秒后自动消失
            setTimeout(() => {
                if (msgElement.parentNode) {
                    msgElement.remove();
                }
            }, 3000);
        }
    },
    
    // 成功消息
    success(message, container = null) {
        this.show(message, 'success', container);
    },
    
    // 错误消息
    error(message, container = null) {
        this.show(message, 'error', container);
    },
    
    // 信息消息
    info(message, container = null) {
        this.show(message, 'info', container);
    },
    
    // 清除消息
    clear(container = null) {
        const targetContainer = container || document;
        const msgs = targetContainer.querySelectorAll('.msg');
        msgs.forEach(msg => msg.remove());
    }
};

// 模态框管理
const ModalManager = {
    // 显示模态框
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            // 阻止背景滚动
            document.body.style.overflow = 'hidden';
        }
    },
    
    // 隐藏模态框
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            // 恢复背景滚动
            document.body.style.overflow = '';
        }
    },
    
    // 点击背景关闭模态框
    initCloseOnBackdrop(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide(modalId);
                }
            });
        }
    }
};

// 表单验证工具
const FormValidator = {
    // 验证邮箱格式
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // 验证必填字段
    isRequired(value) {
        return value && value.trim().length > 0;
    },
    
    // 验证端口号
    isValidPort(port) {
        const portNum = parseInt(port);
        return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
    },
    
    // 通用表单验证
    validateForm(formData, rules) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !this.isRequired(value)) {
                errors.push(`${rule.label}不能为空`);
                continue;
            }
            
            if (rule.type === 'email' && value && !this.isValidEmail(value)) {
                errors.push(`${rule.label}格式不正确`);
            }
            
            if (rule.type === 'port' && value && !this.isValidPort(value)) {
                errors.push(`${rule.label}必须是1-65535之间的数字`);
            }
        }
        
        return errors;
    }
};

// 工具函数
const Utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    },
    
    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            MessageManager.success('已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
            MessageManager.error('复制失败');
        }
    }
};

// 在页面加载完成后初始化主题
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});

// 导出到全局作用域
window.ThemeManager = ThemeManager;
window.ApiManager = ApiManager;
window.MessageManager = MessageManager;
window.ModalManager = ModalManager;
window.FormValidator = FormValidator;
window.Utils = Utils;