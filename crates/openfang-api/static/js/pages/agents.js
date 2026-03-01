// OpenFang Agents Page — Multi-step spawn wizard, detail view with tabs, file editor, personality presets
'use strict';

function agentsPage() {
  return {
    tab: 'agents',
    activeChatAgent: null,
    // -- Agents state --
    showSpawnModal: false,
    showDetailModal: false,
    detailAgent: null,
    spawnMode: 'wizard',
    spawning: false,
    spawnToml: '',
    filterState: 'all',
    loading: true,
    loadError: '',
    spawnForm: {
      name: '',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      systemPrompt: '你是一个有用的助手。',
      profile: 'full',
      caps: { memory_read: true, memory_write: true, network: false, shell: false, agent_spawn: false }
    },

    // -- Multi-step wizard state --
    spawnStep: 1,
    spawnIdentity: { emoji: '', color: '#FF5C00', archetype: '' },
    selectedPreset: '',
    soulContent: '',
    emojiOptions: [
      '\u{1F916}', '\u{1F4BB}', '\u{1F50D}', '\u{270D}\uFE0F', '\u{1F4CA}', '\u{1F6E0}\uFE0F',
      '\u{1F4AC}', '\u{1F393}', '\u{1F310}', '\u{1F512}', '\u{26A1}', '\u{1F680}',
      '\u{1F9EA}', '\u{1F3AF}', '\u{1F4D6}', '\u{1F9D1}\u200D\u{1F4BB}', '\u{1F4E7}', '\u{1F3E2}',
      '\u{2764}\uFE0F', '\u{1F31F}', '\u{1F527}', '\u{1F4DD}', '\u{1F4A1}', '\u{1F3A8}'
    ],
    archetypeOptions: ['助手', '研究员', '程序员', '作家', '运维', '客服', '分析师', '自定义'],
    personalityPresets: [
      { id: 'professional', label: '专业', soul: '以清晰、专业的语气进行交流。直接且有条理。使用正式语言和数据驱动的推理。优先考虑准确性而非个性。' },
      { id: 'friendly', label: '友好', soul: '热情、亲切、善于交流。使用轻松的语言，对用户表现出真诚的兴趣。在保持帮助性的同时为回复增添个性。' },
      { id: 'technical', label: '技术', soul: '专注于技术准确性和深度。使用精确的术语。展示你的工作和推理过程。偏好代码示例和结构化的解释。' },
      { id: 'creative', label: '创意', soul: '富有想象力和表现力。使用生动的语言、类比和意想不到的联系。鼓励创造性思维，探索多种视角。' },
      { id: 'concise', label: '简洁', soul: '极其简短、直奔主题。没有废话，没有客套话。用最少的词语回答问题，同时保持准确和完整。' },
      { id: 'mentor', label: '导师', soul: '像一位伟大的老师一样耐心和鼓励。循序渐进地分解复杂主题。提出引导性问题。庆祝进步，建立信心。' }
    ],

    // -- Detail modal tabs --
    detailTab: 'info',
    agentFiles: [],
    editingFile: null,
    fileContent: '',
    fileSaving: false,
    filesLoading: false,
    configForm: {},
    configSaving: false,

    // -- Templates state --
    tplTemplates: [],
    tplProviders: [],
    tplLoading: false,
    tplLoadError: '',
    selectedCategory: 'All',
    searchQuery: '',

    builtinTemplates: [
      {
        name: '通用助手',
        description: '一个多功能的对话智能体，可以帮助处理日常任务、回答问题并提供推荐。',
        category: '常规',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'full',
        system_prompt: '你是一个有用、友好的助手。提供清晰、准确、简洁的回答。必要时提出澄清性问题。'
      },
      {
        name: '编程助手',
        description: '一个专注于编程的智能体，可以编写、审查和调试多种语言的代码。',
        category: '开发',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'coding',
        system_prompt: '你是一位专家级程序员。帮助用户编写干净、高效的代码。解释你的推理过程。遵循所使用语言的最佳实践和约定。'
      },
      {
        name: '研究员',
        description: '一个分析型智能体，可以分解复杂主题、综合信息并提供带引用的摘要。',
        category: '研究',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'research',
        system_prompt: '你是一位研究分析师。将复杂主题分解为清晰的解释。提供结构化的分析和关键发现。在可用时引用来源。'
      },
      {
        name: '作家',
        description: '一个创意写作智能体，帮助起草、编辑和改进各类书面内容。',
        category: '写作',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'full',
        system_prompt: '你是一位熟练的作家和编辑。帮助用户创作精炼的内容。调整你的语气和风格以适应目标受众。提供建设性的改进建议。'
      },
      {
        name: '数据分析师',
        description: '一个专注于数据的智能体，帮助分析数据集、创建查询和解释统计结果。',
        category: '开发',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'coding',
        system_prompt: '你是一位数据分析专家。帮助用户理解他们的数据，编写 SQL/Python 查询，并解释结果。清晰地呈现发现和可行的见解。'
      },
      {
        name: '运维工程师',
        description: '一个专注于系统的智能体，处理 CI/CD、基础设施、Docker 和部署故障排除。',
        category: '开发',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'automation',
        system_prompt: '你是一位运维工程师。帮助处理 CI/CD 流水线、Docker、Kubernetes、基础设施即代码和部署。优先考虑可靠性和安全性。'
      },
      {
        name: '客户支持',
        description: '一个专业、有同理心的智能体，处理客户咨询和解决问题。',
        category: '商务',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'messaging',
        system_prompt: '你是一位专业的客户支持代表。要有同理心、耐心和以解决方案为导向。在提供解决方案之前先确认问题。适当升级复杂问题。'
      },
      {
        name: '导师',
        description: '一个耐心的教育智能体，循序渐进地解释概念并适应学习者的水平。',
        category: '常规',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'full',
        system_prompt: '你是一位耐心和鼓励的导师。从基础开始循序渐进地解释概念。使用类比和例子。在继续之前检查理解程度。适应学习者的节奏。'
      },
      {
        name: 'API 设计师',
        description: '一个专注于 RESTful API 设计、OpenAPI 规范和集成架构的智能体。',
        category: '开发',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'coding',
        system_prompt: '你是一位 API 设计专家。帮助用户按照最佳实践设计干净、一致的 RESTful API。涵盖端点命名、请求/响应模式、错误处理和版本控制。'
      },
      {
        name: '会议记录',
        description: '将会议记录摘要为结构化笔记，包含行动项目和关键决策。',
        category: '商务',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        profile: 'minimal',
        system_prompt: '你是一位会议摘要员。当收到会议记录或笔记时，生成结构化摘要，包含：关键决策、行动项目（含负责人）、讨论要点和后续问题。'
      }
    ],

    // ── Profile Descriptions ──
    profileDescriptions: {
      minimal: { label: '最小', desc: '只读文件访问' },
      coding: { label: '编程', desc: '文件 + Shell + 网络获取' },
      research: { label: '研究', desc: '网络搜索 + 文件读写' },
      messaging: { label: '消息', desc: '智能体 + 内存访问' },
      automation: { label: '自动化', desc: '除自定义外的所有工具' },
      balanced: { label: '均衡', desc: '通用工具集' },
      precise: { label: '精确', desc: '专注准确性的工具集' },
      creative: { label: '创意', desc: '完整工具，侧重创意' },
      full: { label: '完整', desc: '全部 35+ 工具' }
    },
    profileInfo: function(name) {
      return this.profileDescriptions[name] || { label: name, desc: '' };
    },

    // ── Tool Preview in Spawn Modal ──
    spawnProfiles: [],
    spawnProfilesLoaded: false,
    async loadSpawnProfiles() {
      if (this.spawnProfilesLoaded) return;
      try {
        var data = await OpenFangAPI.get('/api/profiles');
        this.spawnProfiles = data.profiles || [];
        this.spawnProfilesLoaded = true;
      } catch(e) { this.spawnProfiles = []; }
    },
    get selectedProfileTools() {
      var pname = this.spawnForm.profile;
      var match = this.spawnProfiles.find(function(p) { return p.name === pname; });
      if (match && match.tools) return match.tools.slice(0, 15);
      return [];
    },

    get agents() { return Alpine.store('app').agents; },

    get filteredAgents() {
      var f = this.filterState;
      if (f === 'all') return this.agents;
      return this.agents.filter(function(a) { return a.state.toLowerCase() === f; });
    },

    get runningCount() {
      return this.agents.filter(function(a) { return a.state === '运行中'; }).length;
    },

    get stoppedCount() {
      return this.agents.filter(function(a) { return a.state !== '运行中'; }).length;
    },

    // -- Templates computed --
    get categories() {
      var cats = { 'All': true };
      this.builtinTemplates.forEach(function(t) { cats[t.category] = true; });
      this.tplTemplates.forEach(function(t) { if (t.category) cats[t.category] = true; });
      return Object.keys(cats);
    },

    get filteredBuiltins() {
      var self = this;
      return this.builtinTemplates.filter(function(t) {
        if (self.selectedCategory !== 'All' && t.category !== self.selectedCategory) return false;
        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase();
          if (t.name.toLowerCase().indexOf(q) === -1 &&
              t.description.toLowerCase().indexOf(q) === -1) return false;
        }
        return true;
      });
    },

    get filteredCustom() {
      var self = this;
      return this.tplTemplates.filter(function(t) {
        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase();
          if ((t.name || '').toLowerCase().indexOf(q) === -1 &&
              (t.description || '').toLowerCase().indexOf(q) === -1) return false;
        }
        return true;
      });
    },

    isProviderConfigured(providerName) {
      if (!providerName) return false;
      var p = this.tplProviders.find(function(pr) { return pr.id === providerName; });
      return p ? p.auth_status === '已配置' : false;
    },

    async init() {
      var self = this;
      this.loading = true;
      this.loadError = '';
      try {
        await Alpine.store('app').refreshAgents();
      } catch(e) {
        this.loadError = e.message || '无法加载智能体。守护进程是否正在运行？';
      }
      this.loading = false;

      // If a pending agent was set (e.g. from wizard or redirect), open chat inline
      var store = Alpine.store('app');
      if (store.pendingAgent) {
        this.activeChatAgent = store.pendingAgent;
      }
      // Watch for future pendingAgent changes
      this.$watch('$store.app.pendingAgent', function(agent) {
        if (agent) {
          self.activeChatAgent = agent;
        }
      });
    },

    async loadData() {
      this.loading = true;
      this.loadError = '';
      try {
        await Alpine.store('app').refreshAgents();
      } catch(e) {
        this.loadError = e.message || '无法加载智能体。';
      }
      this.loading = false;
    },

    async loadTemplates() {
      this.tplLoading = true;
      this.tplLoadError = '';
      try {
        var results = await Promise.all([
          OpenFangAPI.get('/api/templates'),
          OpenFangAPI.get('/api/providers').catch(function() { return { providers: [] }; })
        ]);
        this.tplTemplates = results[0].templates || [];
        this.tplProviders = results[1].providers || [];
      } catch(e) {
        this.tplTemplates = [];
        this.tplLoadError = e.message || '无法加载模板。';
      }
      this.tplLoading = false;
    },

    chatWithAgent(agent) {
      Alpine.store('app').pendingAgent = agent;
      this.activeChatAgent = agent;
    },

    closeChat() {
      this.activeChatAgent = null;
      OpenFangAPI.wsDisconnect();
    },

    showDetail(agent) {
      this.detailAgent = agent;
      this.detailTab = 'info';
      this.agentFiles = [];
      this.editingFile = null;
      this.fileContent = '';
      this.configForm = {
        name: agent.name || '',
        system_prompt: agent.system_prompt || '',
        emoji: (agent.identity && agent.identity.emoji) || '',
        color: (agent.identity && agent.identity.color) || '#FF5C00',
        archetype: (agent.identity && agent.identity.archetype) || '',
        vibe: (agent.identity && agent.identity.vibe) || ''
      };
      this.showDetailModal = true;
    },

    killAgent(agent) {
      var self = this;
      OpenFangToast.confirm('停止智能体', '确定要停止智能体 "' + agent.name + '" 吗？该智能体将被关闭。', async function() {
        try {
          await OpenFangAPI.del('/api/agents/' + agent.id);
          OpenFangToast.success('智能体 "' + agent.name + '" 已停止');
          self.showDetailModal = false;
          await Alpine.store('app').refreshAgents();
        } catch(e) {
          OpenFangToast.error('停止智能体失败：' + e.message);
        }
      });
    },

    killAllAgents() {
      var list = this.filteredAgents;
      if (!list.length) return;
      OpenFangToast.confirm('停止所有智能体', '确定要停止 ' + list.length + ' 个智能体吗？所有智能体将被关闭。', async function() {
        var errors = [];
        for (var i = 0; i < list.length; i++) {
          try {
            await OpenFangAPI.del('/api/agents/' + list[i].id);
          } catch(e) { errors.push(list[i].name + '：' + e.message); }
        }
        await Alpine.store('app').refreshAgents();
        if (errors.length) {
          OpenFangToast.error('部分智能体停止失败：' + errors.join('，'));
        } else {
          OpenFangToast.success(list.length + ' 个智能体已停止');
        }
      });
    },

    // ── Multi-step wizard navigation ──
    openSpawnWizard() {
      this.showSpawnModal = true;
      this.spawnStep = 1;
      this.spawnMode = 'wizard';
      this.spawnIdentity = { emoji: '', color: '#FF5C00', archetype: '' };
      this.selectedPreset = '';
      this.soulContent = '';
      this.spawnForm.name = '';
      this.spawnForm.systemPrompt = '你是一个有用的助手。';
      this.spawnForm.profile = 'full';
    },

    nextStep() {
      if (this.spawnStep === 1 && !this.spawnForm.name.trim()) {
        OpenFangToast.warn('请输入智能体名称');
        return;
      }
      if (this.spawnStep < 5) this.spawnStep++;
    },

    prevStep() {
      if (this.spawnStep > 1) this.spawnStep--;
    },

    selectPreset(preset) {
      this.selectedPreset = preset.id;
      this.soulContent = preset.soul;
    },

    generateToml() {
      var f = this.spawnForm;
      var si = this.spawnIdentity;
      var lines = [
        'name = "' + f.name + '"',
        'module = "builtin:chat"'
      ];
      if (f.profile && f.profile !== 'custom') {
        lines.push('profile = "' + f.profile + '"');
      }
      lines.push('', '[model]');
      lines.push('provider = "' + f.provider + '"');
      lines.push('model = "' + f.model + '"');
      lines.push('system_prompt = "' + f.systemPrompt.replace(/"/g, '\\"') + '"');
      if (f.profile === 'custom') {
        lines.push('', '[capabilities]');
        if (f.caps.memory_read) lines.push('memory_read = ["*"]');
        if (f.caps.memory_write) lines.push('memory_write = ["self.*"]');
        if (f.caps.network) lines.push('network = ["*"]');
        if (f.caps.shell) lines.push('shell = ["*"]');
        if (f.caps.agent_spawn) lines.push('agent_spawn = true');
      }
      return lines.join('\n');
    },

    async setMode(agent, mode) {
      try {
        await OpenFangAPI.put('/api/agents/' + agent.id + '/mode', { mode: mode });
        agent.mode = mode;
        OpenFangToast.success('模式已设置为 ' + mode);
        await Alpine.store('app').refreshAgents();
      } catch(e) {
        OpenFangToast.error('设置模式失败：' + e.message);
      }
    },

    async spawnAgent() {
      this.spawning = true;
      var toml = this.spawnMode === 'wizard' ? this.generateToml() : this.spawnToml;
      if (!toml.trim()) {
        this.spawning = false;
        OpenFangToast.warn('配置清单为空 — 请先输入智能体配置');
        return;
      }

      try {
        var res = await OpenFangAPI.post('/api/agents', { manifest_toml: toml });
        if (res.agent_id) {
          // Post-spawn: update identity + write SOUL.md if personality preset selected
          var patchBody = {};
          if (this.spawnIdentity.emoji) patchBody.emoji = this.spawnIdentity.emoji;
          if (this.spawnIdentity.color) patchBody.color = this.spawnIdentity.color;
          if (this.spawnIdentity.archetype) patchBody.archetype = this.spawnIdentity.archetype;
          if (this.selectedPreset) patchBody.vibe = this.selectedPreset;

          if (Object.keys(patchBody).length) {
            OpenFangAPI.patch('/api/agents/' + res.agent_id + '/config', patchBody).catch(function(e) { console.warn('Post-spawn config patch failed:', e.message); });
          }
          if (this.soulContent.trim()) {
            OpenFangAPI.put('/api/agents/' + res.agent_id + '/files/SOUL.md', { content: '# Soul\n' + this.soulContent }).catch(function(e) { console.warn('SOUL.md write failed:', e.message); });
          }

          this.showSpawnModal = false;
          this.spawnForm.name = '';
          this.spawnToml = '';
          this.spawnStep = 1;
          OpenFangToast.success('智能体 "' + (res.name || '新建') + '" 已创建');
          await Alpine.store('app').refreshAgents();
          this.chatWithAgent({ id: res.agent_id, name: res.name, model_provider: '?', model_name: '?' });
        } else {
          OpenFangToast.error('创建失败：' + (res.error || '未知错误'));
        }
      } catch(e) {
        OpenFangToast.error('创建智能体失败：' + e.message);
      }
      this.spawning = false;
    },

    // ── Detail modal: Files tab ──
    async loadAgentFiles() {
      if (!this.detailAgent) return;
      this.filesLoading = true;
      try {
        var data = await OpenFangAPI.get('/api/agents/' + this.detailAgent.id + '/files');
        this.agentFiles = data.files || [];
      } catch(e) {
        this.agentFiles = [];
        OpenFangToast.error('加载文件失败：' + e.message);
      }
      this.filesLoading = false;
    },

    async openFile(file) {
      if (!file.exists) {
        // Create with empty content
        this.editingFile = file.name;
        this.fileContent = '';
        return;
      }
      try {
        var data = await OpenFangAPI.get('/api/agents/' + this.detailAgent.id + '/files/' + encodeURIComponent(file.name));
        this.editingFile = file.name;
        this.fileContent = data.content || '';
      } catch(e) {
        OpenFangToast.error('读取文件失败：' + e.message);
      }
    },

    async saveFile() {
      if (!this.editingFile || !this.detailAgent) return;
      this.fileSaving = true;
      try {
        await OpenFangAPI.put('/api/agents/' + this.detailAgent.id + '/files/' + encodeURIComponent(this.editingFile), { content: this.fileContent });
        OpenFangToast.success(this.editingFile + ' 已保存');
        await this.loadAgentFiles();
      } catch(e) {
        OpenFangToast.error('保存文件失败：' + e.message);
      }
      this.fileSaving = false;
    },

    closeFileEditor() {
      this.editingFile = null;
      this.fileContent = '';
    },

    // ── Detail modal: Config tab ──
    async saveConfig() {
      if (!this.detailAgent) return;
      this.configSaving = true;
      try {
        await OpenFangAPI.patch('/api/agents/' + this.detailAgent.id + '/config', this.configForm);
        OpenFangToast.success('配置已更新');
        await Alpine.store('app').refreshAgents();
      } catch(e) {
        OpenFangToast.error('保存配置失败：' + e.message);
      }
      this.configSaving = false;
    },

    // ── Clone agent ──
    async cloneAgent(agent) {
      var newName = (agent.name || 'agent') + '-copy';
      try {
        var res = await OpenFangAPI.post('/api/agents/' + agent.id + '/clone', { new_name: newName });
        if (res.agent_id) {
          OpenFangToast.success('已克隆为 "' + res.name + '"');
          await Alpine.store('app').refreshAgents();
          this.showDetailModal = false;
        }
      } catch(e) {
        OpenFangToast.error('克隆失败：' + e.message);
      }
    },

    // -- Template methods --
    async spawnFromTemplate(name) {
      try {
        var data = await OpenFangAPI.get('/api/templates/' + encodeURIComponent(name));
        if (data.manifest_toml) {
          var res = await OpenFangAPI.post('/api/agents', { manifest_toml: data.manifest_toml });
          if (res.agent_id) {
            OpenFangToast.success('智能体 "' + (res.name || name) + '" 已从模板创建');
            await Alpine.store('app').refreshAgents();
            this.chatWithAgent({ id: res.agent_id, name: res.name || name, model_provider: '?', model_name: '?' });
          }
        }
      } catch(e) {
        OpenFangToast.error('从模板创建失败：' + e.message);
      }
    },

    async spawnBuiltin(t) {
      var toml = 'name = "' + t.name + '"\n';
      toml += 'description = "' + t.description.replace(/"/g, '\\"') + '"\n';
      toml += 'module = "builtin:chat"\n';
      toml += 'profile = "' + t.profile + '"\n\n';
      toml += '[model]\nprovider = "' + t.provider + '"\nmodel = "' + t.model + '"\n';
      toml += 'system_prompt = """\n' + t.system_prompt + '\n"""\n';

      try {
        var res = await OpenFangAPI.post('/api/agents', { manifest_toml: toml });
        if (res.agent_id) {
          OpenFangToast.success('智能体 "' + t.name + '" 已创建');
          await Alpine.store('app').refreshAgents();
          this.chatWithAgent({ id: res.agent_id, name: t.name, model_provider: t.provider, model_name: t.model });
        }
      } catch(e) {
        OpenFangToast.error('创建智能体失败：' + e.message);
      }
    }
  };
}
