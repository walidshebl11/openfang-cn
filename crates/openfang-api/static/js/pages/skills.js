// OpenFang Skills Page — OpenClaw/ClawHub ecosystem + local skills + MCP servers
'use strict';

function skillsPage() {
  return {
    tab: 'installed',
    skills: [],
    loading: true,
    loadError: '',

    // ClawHub state
    clawhubSearch: '',
    clawhubResults: [],
    clawhubBrowseResults: [],
    clawhubLoading: false,
    clawhubError: '',
    clawhubSort: 'trending',
    clawhubNextCursor: null,
    installingSlug: null,
    installResult: null,
    _searchTimer: null,

    // Skill detail modal
    skillDetail: null,
    detailLoading: false,

    // MCP servers
    mcpServers: [],
    mcpLoading: false,

    // Category definitions from the OpenClaw ecosystem
    categories: [
      { id: 'coding', name: '编程与IDE' },
      { id: 'git', name: 'Git与GitHub' },
      { id: 'web', name: 'Web与前端' },
      { id: 'devops', name: 'DevOps与云计算' },
      { id: 'browser', name: '浏览器与自动化' },
      { id: 'search', name: '搜索与研究' },
      { id: 'ai', name: 'AI与大模型' },
      { id: 'data', name: '数据分析' },
      { id: 'productivity', name: '效率工具' },
      { id: 'communication', name: '通讯协作' },
      { id: 'media', name: '媒体与流媒体' },
      { id: 'notes', name: '笔记与知识管理' },
      { id: 'security', name: '安全' },
      { id: 'cli', name: '命令行工具' },
      { id: 'marketing', name: '营销与销售' },
      { id: 'finance', name: '金融财务' },
      { id: 'smart-home', name: '智能家居与物联网' },
      { id: 'docs', name: 'PDF与文档' },
    ],

    runtimeBadge: function(rt) {
      var r = (rt || '').toLowerCase();
      if (r === 'python' || r === 'py') return { text: 'PY', cls: 'runtime-badge-py' };
      if (r === 'node' || r === 'nodejs' || r === 'js' || r === 'javascript') return { text: 'JS', cls: 'runtime-badge-js' };
      if (r === 'wasm' || r === 'webassembly') return { text: 'WASM', cls: 'runtime-badge-wasm' };
      if (r === 'prompt_only' || r === 'prompt' || r === 'promptonly') return { text: 'PROMPT', cls: 'runtime-badge-prompt' };
      return { text: r.toUpperCase().substring(0, 4), cls: 'runtime-badge-prompt' };
    },

    sourceBadge: function(source) {
      if (!source) return { text: '本地', cls: 'badge-dim' };
      switch (source.type) {
        case 'clawhub': return { text: 'ClawHub', cls: 'badge-info' };
        case 'openclaw': return { text: 'OpenClaw', cls: 'badge-info' };
        case 'bundled': return { text: '内置', cls: 'badge-success' };
        default: return { text: '本地', cls: 'badge-dim' };
      }
    },

    formatDownloads: function(n) {
      if (!n) return '0';
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return n.toString();
    },

    async loadSkills() {
      this.loading = true;
      this.loadError = '';
      try {
        var data = await OpenFangAPI.get('/api/skills');
        this.skills = (data.skills || []).map(function(s) {
          return {
            name: s.name,
            description: s.description || '',
            version: s.version || '',
            author: s.author || '',
            runtime: s.runtime || '未知',
            tools_count: s.tools_count || 0,
            tags: s.tags || [],
            enabled: s.enabled !== false,
            source: s.source || { type: 'local' },
            has_prompt_context: !!s.has_prompt_context
          };
        });
      } catch(e) {
        this.skills = [];
        this.loadError = e.message || '无法加载技能。';
      }
      this.loading = false;
    },

    async loadData() {
      await this.loadSkills();
    },

    // Debounced search — fires 350ms after user stops typing
    onSearchInput() {
      if (this._searchTimer) clearTimeout(this._searchTimer);
      var q = this.clawhubSearch.trim();
      if (!q) {
        this.clawhubResults = [];
        this.clawhubError = '';
        return;
      }
      var self = this;
      this._searchTimer = setTimeout(function() { self.searchClawHub(); }, 350);
    },

    // ClawHub search
    async searchClawHub() {
      if (!this.clawhubSearch.trim()) {
        this.clawhubResults = [];
        return;
      }
      this.clawhubLoading = true;
      this.clawhubError = '';
      try {
        var data = await OpenFangAPI.get('/api/clawhub/search?q=' + encodeURIComponent(this.clawhubSearch.trim()) + '&limit=20');
        this.clawhubResults = data.items || [];
        if (data.error) this.clawhubError = data.error;
      } catch(e) {
        this.clawhubResults = [];
        this.clawhubError = e.message || '搜索失败';
      }
      this.clawhubLoading = false;
    },

    // Clear search and go back to browse
    clearSearch() {
      this.clawhubSearch = '';
      this.clawhubResults = [];
      this.clawhubError = '';
      if (this._searchTimer) clearTimeout(this._searchTimer);
    },

    // ClawHub browse by sort
    async browseClawHub(sort) {
      this.clawhubSort = sort || 'trending';
      this.clawhubLoading = true;
      this.clawhubError = '';
      this.clawhubNextCursor = null;
      try {
        var data = await OpenFangAPI.get('/api/clawhub/browse?sort=' + this.clawhubSort + '&limit=20');
        this.clawhubBrowseResults = data.items || [];
        this.clawhubNextCursor = data.next_cursor || null;
        if (data.error) this.clawhubError = data.error;
      } catch(e) {
        this.clawhubBrowseResults = [];
        this.clawhubError = e.message || '浏览失败';
      }
      this.clawhubLoading = false;
    },

    // ClawHub load more results
    async loadMoreClawHub() {
      if (!this.clawhubNextCursor || this.clawhubLoading) return;
      this.clawhubLoading = true;
      try {
        var data = await OpenFangAPI.get('/api/clawhub/browse?sort=' + this.clawhubSort + '&limit=20&cursor=' + encodeURIComponent(this.clawhubNextCursor));
        this.clawhubBrowseResults = this.clawhubBrowseResults.concat(data.items || []);
        this.clawhubNextCursor = data.next_cursor || null;
      } catch(e) {
        // silently fail on load more
      }
      this.clawhubLoading = false;
    },

    // Show skill detail
    async showSkillDetail(slug) {
      this.detailLoading = true;
      this.skillDetail = null;
      this.installResult = null;
      try {
        var data = await OpenFangAPI.get('/api/clawhub/skill/' + encodeURIComponent(slug));
        this.skillDetail = data;
      } catch(e) {
        OpenFangToast.error('加载技能详情失败');
      }
      this.detailLoading = false;
    },

    closeDetail() {
      this.skillDetail = null;
      this.installResult = null;
    },

    // Install from ClawHub
    async installFromClawHub(slug) {
      this.installingSlug = slug;
      this.installResult = null;
      try {
        var data = await OpenFangAPI.post('/api/clawhub/install', { slug: slug });
        this.installResult = data;
        if (data.warnings && data.warnings.length > 0) {
          OpenFangToast.success('技能 "' + data.name + '" 已安装，但有 ' + data.warnings.length + ' 个警告');
        } else {
          OpenFangToast.success('技能 "' + data.name + '" 安装成功');
        }
        // Update installed state in detail modal if open
        if (this.skillDetail && this.skillDetail.slug === slug) {
          this.skillDetail.installed = true;
        }
        await this.loadSkills();
      } catch(e) {
        var msg = e.message || '安装失败';
        if (msg.includes('already_installed')) {
          OpenFangToast.error('技能已安装');
        } else if (msg.includes('SecurityBlocked')) {
          OpenFangToast.error('技能被安全扫描阻止');
        } else {
          OpenFangToast.error('安装失败：' + msg);
        }
      }
      this.installingSlug = null;
    },

    // Uninstall
    uninstallSkill: function(name) {
      var self = this;
      OpenFangToast.confirm('卸载技能', '确定要卸载技能 "' + name + '" 吗？此操作无法撤销。', async function() {
        try {
          await OpenFangAPI.post('/api/skills/uninstall', { name: name });
          OpenFangToast.success('技能 "' + name + '" 已卸载');
          await self.loadSkills();
        } catch(e) {
          OpenFangToast.error('卸载技能失败：' + e.message);
        }
      });
    },

    // Create prompt-only skill
    async createDemoSkill(skill) {
      try {
        await OpenFangAPI.post('/api/skills/create', {
          name: skill.name,
          description: skill.description,
          runtime: 'prompt_only',
          prompt_context: skill.prompt_context || skill.description
        });
        OpenFangToast.success('技能 "' + skill.name + '" 已创建');
        this.tab = 'installed';
        await this.loadSkills();
      } catch(e) {
        OpenFangToast.error('创建技能失败：' + e.message);
      }
    },

    // Load MCP servers
    async loadMcpServers() {
      this.mcpLoading = true;
      try {
        var data = await OpenFangAPI.get('/api/mcp/servers');
        this.mcpServers = data;
      } catch(e) {
        this.mcpServers = { configured: [], connected: [], total_configured: 0, total_connected: 0 };
      }
      this.mcpLoading = false;
    },

    // Category search on ClawHub
    searchCategory: function(cat) {
      this.clawhubSearch = cat.name;
      this.searchClawHub();
    },

    // Quick start skills (prompt-only, zero deps)
    quickStartSkills: [
      { name: 'code-review-guide', description: '添加代码审查最佳实践和检查清单到代理上下文。', prompt_context: 'You are an expert code reviewer. When reviewing code:\n1. Check for bugs and logic errors\n2. Evaluate code style and readability\n3. Look for security vulnerabilities\n4. Suggest performance improvements\n5. Verify error handling\n6. Check test coverage' },
      { name: 'writing-style', description: '可配置的内容生成写作风格指南。', prompt_context: 'Follow these writing guidelines:\n- Use clear, concise language\n- Prefer active voice over passive voice\n- Keep paragraphs short (3-4 sentences)\n- Use bullet points for lists\n- Maintain consistent tone throughout' },
      { name: 'api-design', description: 'REST API 设计模式和约定。', prompt_context: 'When designing REST APIs:\n- Use nouns for resources, not verbs\n- Use HTTP methods correctly (GET, POST, PUT, DELETE)\n- Return appropriate status codes\n- Use pagination for list endpoints\n- Version your API\n- Document all endpoints' },
      { name: 'security-checklist', description: 'OWASP 对齐的安全审查检查清单。', prompt_context: 'Security review checklist (OWASP aligned):\n- Input validation on all user inputs\n- Output encoding to prevent XSS\n- Parameterized queries to prevent SQL injection\n- Authentication and session management\n- Access control checks\n- CSRF protection\n- Security headers\n- Error handling without information leakage' },
    ],

    // Check if skill is installed by slug
    isSkillInstalled: function(slug) {
      return this.skills.some(function(s) {
        return s.source && s.source.type === 'clawhub' && s.source.slug === slug;
      });
    },

    // Check if skill is installed by name
    isSkillInstalledByName: function(name) {
      return this.skills.some(function(s) { return s.name === name; });
    },
  };
}
