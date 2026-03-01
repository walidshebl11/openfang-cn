// OpenFang 设置向导 — 首次运行引导设置（提供商 + 智能体 + 频道）
'use strict';

function wizardPage() {
  return {
    step: 1,
    totalSteps: 6,
    loading: false,
    error: '',

    // Step 2: Provider setup
    providers: [],
    selectedProvider: '',
    apiKeyInput: '',
    testingProvider: false,
    testResult: null,
    savingKey: false,
    keySaved: false,

    // Step 3: Agent creation
    templates: [
      {
        id: 'assistant',
        name: '通用助手',
        description: '一个多功能的日常助手，可以回答问题、提供建议和帮助完成各种任务。',
        icon: 'GA',
        category: '常规',
        provider: 'deepseek',
        model: 'deepseek-chat',
        profile: 'balanced',
        system_prompt: 'You are a helpful, friendly assistant. Provide clear, accurate, and concise responses. Ask clarifying questions when needed.'
      },
      {
        id: 'coder',
        name: '代码助手',
        description: '专注于编程的智能体，可以编写、审查和调试多种语言的代码。',
        icon: 'CH',
        category: '开发',
        provider: 'deepseek',
        model: 'deepseek-chat',
        profile: 'precise',
        system_prompt: 'You are an expert programmer. Help users write clean, efficient code. Explain your reasoning. Follow best practices and conventions for the language being used.'
      },
      {
        id: 'researcher',
        name: '研究员',
        description: '分析型智能体，可以分解复杂主题、综合信息并提供带引用的摘要。',
        icon: 'RS',
        category: '研究',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        profile: 'balanced',
        system_prompt: 'You are a research analyst. Break down complex topics into clear explanations. Provide structured analysis with key findings. Cite sources when available.'
      },
      {
        id: 'writer',
        name: '写作助手',
        description: '创意写作智能体，帮助起草、编辑和改进各类书面内容。',
        icon: 'WR',
        category: '写作',
        provider: 'deepseek',
        model: 'deepseek-chat',
        profile: 'creative',
        system_prompt: 'You are a skilled writer and editor. Help users create polished content. Adapt your tone and style to match the intended audience. Offer constructive suggestions for improvement.'
      },
      {
        id: 'data-analyst',
        name: '数据分析师',
        description: '数据导向的智能体，帮助分析数据集、创建查询和解释统计结果。',
        icon: 'DA',
        category: '开发',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        profile: 'precise',
        system_prompt: 'You are a data analysis expert. Help users understand their data, write SQL/Python queries, and interpret results. Present findings clearly with actionable insights.'
      },
      {
        id: 'devops',
        name: 'DevOps 工程师',
        description: '系统运维智能体，专注于 CI/CD、基础设施、Docker 和部署故障排除。',
        icon: 'DO',
        category: '开发',
        provider: 'deepseek',
        model: 'deepseek-chat',
        profile: 'precise',
        system_prompt: 'You are a DevOps engineer. Help with CI/CD pipelines, Docker, Kubernetes, infrastructure as code, and deployment. Prioritize reliability and security.'
      },
      {
        id: 'support',
        name: '客户支持',
        description: '专业、有同理心的智能体，用于处理客户咨询和解决问题。',
        icon: 'CS',
        category: '商务',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'balanced',
        system_prompt: 'You are a professional customer support representative. Be empathetic, patient, and solution-oriented. Acknowledge concerns before offering solutions. Escalate complex issues appropriately.'
      },
      {
        id: 'tutor',
        name: '导师',
        description: '耐心的教育智能体，循序渐进地讲解概念，适应学习者的水平。',
        icon: 'TU',
        category: '常规',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'balanced',
        system_prompt: 'You are a patient and encouraging tutor. Explain concepts step by step, starting from fundamentals. Use analogies and examples. Check understanding before moving on. Adapt to the learner\'s pace.'
      },
      {
        id: 'api-designer',
        name: 'API 设计师',
        description: '专注于 RESTful API 设计、OpenAPI 规范和集成架构的智能体。',
        icon: 'AD',
        category: '开发',
        provider: 'deepseek',
        model: 'deepseek-chat',
        profile: 'precise',
        system_prompt: 'You are an API design expert. Help users design clean, consistent RESTful APIs following best practices. Cover endpoint naming, request/response schemas, error handling, and versioning.'
      },
      {
        id: 'meeting-notes',
        name: '会议纪要',
        description: '将会议记录总结为结构化的笔记，包含行动事项和关键决策。',
        icon: 'MN',
        category: '商务',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'precise',
        system_prompt: 'You are a meeting summarizer. When given a meeting transcript or notes, produce a structured summary with: key decisions, action items (with owners), discussion highlights, and follow-up questions.'
      }
    ],
    selectedTemplate: 0,
    agentName: '我的助手',
    creatingAgent: false,
    createdAgent: null,

    // Step 3: Category filtering
    templateCategory: '全部',
    get templateCategories() {
      var cats = { '全部': true };
      this.templates.forEach(function(t) { if (t.category) cats[t.category] = true; });
      return Object.keys(cats);
    },
    get filteredTemplates() {
      var cat = this.templateCategory;
      if (cat === '全部') return this.templates;
      return this.templates.filter(function(t) { return t.category === cat; });
    },

    // Step 3: Profile/tool descriptions
    profileDescriptions: {
      minimal: { label: '精简', desc: '只读文件访问' },
      coding: { label: '编程', desc: '文件 + 命令行 + 网页获取' },
      research: { label: '研究', desc: '网页搜索 + 文件读写' },
      balanced: { label: '均衡', desc: '通用工具集' },
      precise: { label: '精确', desc: '专注准确性的工具集' },
      creative: { label: '创意', desc: '完整工具，侧重创意' },
      full: { label: '完整', desc: '全部 35+ 个工具' }
    },
    profileInfo: function(name) { return this.profileDescriptions[name] || { label: name, desc: '' }; },

    // Step 4: Try It chat
    tryItMessages: [],
    tryItInput: '',
    tryItSending: false,
    suggestedMessages: {
      '常规': ['你能帮我做什么？', '告诉我一个有趣的事实', '总结一下最新的 AI 新闻'],
      '开发': ['写一个 Python 你好世界程序', '解释一下 async/await', '审查这段代码'],
      '研究': ['简单解释量子计算', '比较 React 和 Vue', 'AI 领域的最新趋势是什么？'],
      '写作': ['帮我写一封专业邮件', '改进这段文字', '写一个关于 AI 的博客开头'],
      '商务': ['起草一个会议议程', '如何处理客户投诉？', '创建一个项目状态更新']
    },
    get currentSuggestions() {
      var tpl = this.templates[this.selectedTemplate];
      var cat = tpl ? tpl.category : '常规';
      return this.suggestedMessages[cat] || this.suggestedMessages['常规'];
    },
    async sendTryItMessage(text) {
      if (!text || !text.trim() || !this.createdAgent || this.tryItSending) return;
      text = text.trim();
      this.tryItInput = '';
      this.tryItMessages.push({ role: 'user', text: text });
      this.tryItSending = true;
      try {
        var res = await OpenFangAPI.post('/api/agents/' + this.createdAgent.id + '/message', { message: text });
        this.tryItMessages.push({ role: 'agent', text: res.response || '(无响应)' });
        localStorage.setItem('of-first-msg', 'true');
      } catch(e) {
        this.tryItMessages.push({ role: 'agent', text: '错误: ' + (e.message || '无法连接到智能体') });
      }
      this.tryItSending = false;
    },

    // Step 5: Channel setup (optional)
    channelType: '',
    channelOptions: [
      {
        name: 'telegram',
        display_name: 'Telegram',
        icon: 'TG',
        description: '将您的智能体连接到 Telegram 机器人进行消息交互。',
        token_label: '机器人令牌',
        token_placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        token_env: 'TELEGRAM_BOT_TOKEN',
        help: '通过 Telegram 上的 @BotFather 创建机器人以获取令牌。'
      },
      {
        name: 'discord',
        display_name: 'Discord',
        icon: 'DC',
        description: '通过机器人令牌将您的智能体连接到 Discord 服务器。',
        token_label: '机器人令牌',
        token_placeholder: 'MTIz...abc',
        token_env: 'DISCORD_BOT_TOKEN',
        help: '在 discord.com/developers 创建 Discord 应用并添加机器人。'
      },
      {
        name: 'slack',
        display_name: 'Slack',
        icon: 'SL',
        description: '将您的智能体连接到 Slack 工作空间。',
        token_label: '机器人令牌',
        token_placeholder: 'xoxb-...',
        token_env: 'SLACK_BOT_TOKEN',
        help: '在 api.slack.com/apps 创建 Slack 应用并安装到您的工作空间。'
      }
    ],
    channelToken: '',
    configuringChannel: false,
    channelConfigured: false,

    // Step 5: Summary
    setupSummary: {
      provider: '',
      agent: '',
      channel: ''
    },

    // ── Lifecycle ──

    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        await this.loadProviders();
      } catch(e) {
        this.error = e.message || '无法加载设置数据。';
      }
      this.loading = false;
    },

    // ── Navigation ──

    nextStep() {
      if (this.step === 3 && !this.createdAgent) {
        // Skip "Try It" if no agent was created
        this.step = 5;
      } else if (this.step < this.totalSteps) {
        this.step++;
      }
    },

    prevStep() {
      if (this.step === 5 && !this.createdAgent) {
        // Skip back past "Try It" if no agent was created
        this.step = 3;
      } else if (this.step > 1) {
        this.step--;
      }
    },

    goToStep(n) {
      if (n >= 1 && n <= this.totalSteps) {
        if (n === 4 && !this.createdAgent) return; // Can't go to Try It without agent
        this.step = n;
      }
    },

    stepLabel(n) {
      var labels = ['欢迎', '提供商', '智能体', '试用', '频道', '完成'];
      return labels[n - 1] || '';
    },

    get canGoNext() {
      if (this.step === 2) return this.keySaved || this.hasConfiguredProvider;
      if (this.step === 3) return this.agentName.trim().length > 0;
      return true;
    },

    get hasConfiguredProvider() {
      var self = this;
      return this.providers.some(function(p) {
        return p.auth_status === '已配置';
      });
    },

    // ── Step 2: Providers ──

    async loadProviders() {
      try {
        var data = await OpenFangAPI.get('/api/providers');
        this.providers = data.providers || [];
        // Pre-select first unconfigured provider, or first one
        var unconfigured = this.providers.filter(function(p) {
          return p.auth_status !== '已配置' && p.api_key_env;
        });
        if (unconfigured.length > 0) {
          this.selectedProvider = unconfigured[0].id;
        } else if (this.providers.length > 0) {
          this.selectedProvider = this.providers[0].id;
        }
      } catch(e) { this.providers = []; }
    },

    get selectedProviderObj() {
      var self = this;
      var match = this.providers.filter(function(p) { return p.id === self.selectedProvider; });
      return match.length > 0 ? match[0] : null;
    },

    get popularProviders() {
      var popular = ['anthropic', 'openai', 'gemini', 'groq', 'deepseek', 'openrouter'];
      return this.providers.filter(function(p) {
        return popular.indexOf(p.id) >= 0;
      }).sort(function(a, b) {
        return popular.indexOf(a.id) - popular.indexOf(b.id);
      });
    },

    get otherProviders() {
      var popular = ['anthropic', 'openai', 'gemini', 'groq', 'deepseek', 'openrouter'];
      return this.providers.filter(function(p) {
        return popular.indexOf(p.id) < 0;
      });
    },

    selectProvider(id) {
      this.selectedProvider = id;
      this.apiKeyInput = '';
      this.testResult = null;
      this.keySaved = false;
    },

    providerHelp: function(id) {
      var help = {
        anthropic: { url: 'https://console.anthropic.com/settings/keys', text: '从 Anthropic 控制台获取您的密钥' },
        openai: { url: 'https://platform.openai.com/api-keys', text: '从 OpenAI 平台获取您的密钥' },
        gemini: { url: 'https://aistudio.google.com/apikey', text: '从 Google AI Studio 获取您的密钥' },
        groq: { url: 'https://console.groq.com/keys', text: '从 Groq 控制台获取您的密钥（有免费额度）' },
        deepseek: { url: 'https://platform.deepseek.com/api_keys', text: '从 DeepSeek 平台获取您的密钥（价格实惠）' },
        openrouter: { url: 'https://openrouter.ai/keys', text: '从 OpenRouter 获取您的密钥（一个密钥访问 100+ 模型）' },
        mistral: { url: 'https://console.mistral.ai/api-keys', text: '从 Mistral 控制台获取您的密钥' },
        together: { url: 'https://api.together.xyz/settings/api-keys', text: '从 Together AI 获取您的密钥' },
        fireworks: { url: 'https://fireworks.ai/account/api-keys', text: '从 Fireworks AI 获取您的密钥' },
        perplexity: { url: 'https://www.perplexity.ai/settings/api', text: '从 Perplexity 设置中获取您的密钥' },
        cohere: { url: 'https://dashboard.cohere.com/api-keys', text: '从 Cohere 控制台获取您的密钥' },
        xai: { url: 'https://console.x.ai/', text: '从 xAI 控制台获取您的密钥' }
      };
      return help[id] || null;
    },

    providerIsConfigured(p) {
      return p && p.auth_status === '已配置';
    },

    async saveKey() {
      var provider = this.selectedProviderObj;
      if (!provider) return;
      var key = this.apiKeyInput.trim();
      if (!key) {
        OpenFangToast.error('请输入 API 密钥');
        return;
      }
      this.savingKey = true;
      try {
        await OpenFangAPI.post('/api/providers/' + encodeURIComponent(provider.id) + '/key', { key: key });
        this.apiKeyInput = '';
        this.keySaved = true;
        this.setupSummary.provider = provider.display_name;
        OpenFangToast.success('已保存 ' + provider.display_name + ' 的 API 密钥');
        await this.loadProviders();
        // Auto-test after saving
        await this.testKey();
      } catch(e) {
        OpenFangToast.error('保存密钥失败: ' + e.message);
      }
      this.savingKey = false;
    },

    async testKey() {
      var provider = this.selectedProviderObj;
      if (!provider) return;
      this.testingProvider = true;
      this.testResult = null;
      try {
        var result = await OpenFangAPI.post('/api/providers/' + encodeURIComponent(provider.id) + '/test', {});
        this.testResult = result;
        if (result.status === 'ok') {
          OpenFangToast.success(provider.display_name + ' 连接成功 (' + (result.latency_ms || '?') + 'ms)');
        } else {
          OpenFangToast.error(provider.display_name + ': ' + (result.error || '连接失败'));
        }
      } catch(e) {
        this.testResult = { status: 'error', error: e.message };
        OpenFangToast.error('测试失败: ' + e.message);
      }
      this.testingProvider = false;
    },

    // ── Step 3: Agent creation ──

    selectTemplate(index) {
      this.selectedTemplate = index;
      var tpl = this.templates[index];
      if (tpl) {
        this.agentName = tpl.name.toLowerCase().replace(/\s+/g, '-');
      }
    },

    async createAgent() {
      var tpl = this.templates[this.selectedTemplate];
      if (!tpl) return;
      var name = this.agentName.trim();
      if (!name) {
        OpenFangToast.error('请为您的智能体输入名称');
        return;
      }

      // Use the provider the user just configured, or the template default
      var provider = tpl.provider;
      var model = tpl.model;
      if (this.selectedProviderObj && this.providerIsConfigured(this.selectedProviderObj)) {
        provider = this.selectedProviderObj.id;
        // Use a sensible default model for the provider
        model = this.defaultModelForProvider(provider) || tpl.model;
      }

      var toml = '[agent]\n';
      toml += 'name = "' + name.replace(/"/g, '\\"') + '"\n';
      toml += 'description = "' + tpl.description.replace(/"/g, '\\"') + '"\n';
      toml += 'profile = "' + tpl.profile + '"\n\n';
      toml += '[model]\nprovider = "' + provider + '"\n';
      toml += 'name = "' + model + '"\n\n';
      toml += '[prompt]\nsystem = """\n' + tpl.system_prompt + '\n"""\n';

      this.creatingAgent = true;
      try {
        var res = await OpenFangAPI.post('/api/agents', { manifest_toml: toml });
        if (res.agent_id) {
          this.createdAgent = { id: res.agent_id, name: res.name || name };
          this.setupSummary.agent = res.name || name;
          OpenFangToast.success('智能体 "' + (res.name || name) + '" 已创建');
          await Alpine.store('app').refreshAgents();
        } else {
          OpenFangToast.error('失败: ' + (res.error || '未知错误'));
        }
      } catch(e) {
        OpenFangToast.error('创建智能体失败: ' + e.message);
      }
      this.creatingAgent = false;
    },

    defaultModelForProvider(providerId) {
      var defaults = {
        anthropic: 'claude-sonnet-4-20250514',
        openai: 'gpt-4o',
        gemini: 'gemini-2.5-flash',
        groq: 'llama-3.3-70b-versatile',
        deepseek: 'deepseek-chat',
        openrouter: 'openrouter/auto',
        mistral: 'mistral-large-latest',
        together: 'meta-llama/Llama-3-70b-chat-hf',
        fireworks: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
        perplexity: 'llama-3.1-sonar-large-128k-online',
        cohere: 'command-r-plus',
        xai: 'grok-2'
      };
      return defaults[providerId] || '';
    },

    // ── Step 5: Channel setup ──

    selectChannel(name) {
      if (this.channelType === name) {
        this.channelType = '';
        this.channelToken = '';
      } else {
        this.channelType = name;
        this.channelToken = '';
      }
    },

    get selectedChannelObj() {
      var self = this;
      var match = this.channelOptions.filter(function(ch) { return ch.name === self.channelType; });
      return match.length > 0 ? match[0] : null;
    },

    async configureChannel() {
      var ch = this.selectedChannelObj;
      if (!ch) return;
      var token = this.channelToken.trim();
      if (!token) {
        OpenFangToast.error('请输入 ' + ch.token_label);
        return;
      }
      this.configuringChannel = true;
      try {
        var fields = {};
        fields[ch.token_env.toLowerCase()] = token;
        fields.token = token;
        await OpenFangAPI.post('/api/channels/' + ch.name + '/configure', { fields: fields });
        this.channelConfigured = true;
        this.setupSummary.channel = ch.display_name;
        OpenFangToast.success(ch.display_name + ' 已配置并激活。');
      } catch(e) {
        OpenFangToast.error('失败: ' + (e.message || '未知错误'));
      }
      this.configuringChannel = false;
    },

    // ── Step 6: Finish ──

    finish() {
      localStorage.setItem('openfang-onboarded', 'true');
      Alpine.store('app').showOnboarding = false;
      // Navigate to agents with chat if an agent was created, otherwise overview
      if (this.createdAgent) {
        var agent = this.createdAgent;
        Alpine.store('app').pendingAgent = { id: agent.id, name: agent.name, model_provider: '?', model_name: '?' };
        window.location.hash = 'agents';
      } else {
        window.location.hash = 'overview';
      }
    },

    finishAndDismiss() {
      localStorage.setItem('openfang-onboarded', 'true');
      Alpine.store('app').showOnboarding = false;
      window.location.hash = 'overview';
    }
  };
}
