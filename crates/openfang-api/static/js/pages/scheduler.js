// OpenFang Scheduler Page — Cron job management + event triggers unified view
'use strict';

function schedulerPage() {
  return {
    tab: 'jobs',

    // -- Scheduled Jobs state --
    jobs: [],
    loading: true,
    loadError: '',

    // -- Event Triggers state --
    triggers: [],
    trigLoading: false,
    trigLoadError: '',

    // -- Run History state --
    history: [],
    historyLoading: false,

    // -- Create Job form --
    showCreateForm: false,
    newJob: {
      name: '',
      cron: '',
      agent_id: '',
      message: '',
      enabled: true
    },
    creating: false,

    // -- Run Now state --
    runningJobId: '',

    // Cron presets
    cronPresets: [
      { label: '每分钟', cron: '* * * * *' },
      { label: '每5分钟', cron: '*/5 * * * *' },
      { label: '每15分钟', cron: '*/15 * * * *' },
      { label: '每30分钟', cron: '*/30 * * * *' },
      { label: '每小时', cron: '0 * * * *' },
      { label: '每6小时', cron: '0 */6 * * *' },
      { label: '每天午夜', cron: '0 0 * * *' },
      { label: '每天上午9点', cron: '0 9 * * *' },
      { label: '工作日上午9点', cron: '0 9 * * 1-5' },
      { label: '每周一上午9点', cron: '0 9 * * 1' },
      { label: '每月1号', cron: '0 0 1 * *' }
    ],

    // ── Lifecycle ──

    async loadData() {
      this.loading = true;
      this.loadError = '';
      try {
        await this.loadJobs();
      } catch(e) {
        this.loadError = e.message || '无法加载调度器数据。';
      }
      this.loading = false;
    },

    async loadJobs() {
      var data = await OpenFangAPI.get('/api/cron/jobs');
      var raw = data.jobs || [];
      // Normalize cron API response to flat fields the UI expects
      this.jobs = raw.map(function(j) {
        var cron = '';
        if (j.schedule) {
          if (j.schedule.kind === 'cron') cron = j.schedule.expr || '';
          else if (j.schedule.kind === 'every') cron = 'every ' + j.schedule.every_secs + 's';
          else if (j.schedule.kind === 'at') cron = 'at ' + (j.schedule.at || '');
        }
        return {
          id: j.id,
          name: j.name,
          cron: cron,
          agent_id: j.agent_id,
          message: j.action ? j.action.message || '' : '',
          enabled: j.enabled,
          last_run: j.last_run,
          next_run: j.next_run,
          delivery: j.delivery ? j.delivery.kind || '' : '',
          created_at: j.created_at
        };
      });
    },

    async loadTriggers() {
      this.trigLoading = true;
      this.trigLoadError = '';
      try {
        var data = await OpenFangAPI.get('/api/triggers');
        this.triggers = Array.isArray(data) ? data : [];
      } catch(e) {
        this.triggers = [];
        this.trigLoadError = e.message || '无法加载触发器。';
      }
      this.trigLoading = false;
    },

    async loadHistory() {
      this.historyLoading = true;
      try {
        var historyItems = [];
        var jobs = this.jobs || [];
        for (var i = 0; i < jobs.length; i++) {
          var job = jobs[i];
          if (job.last_run) {
            historyItems.push({
              timestamp: job.last_run,
              name: job.name || '(未命名)',
              type: 'schedule',
              status: 'completed',
              run_count: 0
            });
          }
        }
        var triggers = this.triggers || [];
        for (var j = 0; j < triggers.length; j++) {
          var t = triggers[j];
          if (t.fire_count > 0) {
            historyItems.push({
              timestamp: t.created_at,
              name: '触发器: ' + this.triggerType(t.pattern),
              type: 'trigger',
              status: 'fired',
              run_count: t.fire_count
            });
          }
        }
        historyItems.sort(function(a, b) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        this.history = historyItems;
      } catch(e) {
        this.history = [];
      }
      this.historyLoading = false;
    },

    // ── Job CRUD ──

    async createJob() {
      if (!this.newJob.name.trim()) {
        OpenFangToast.warn('请输入任务名称');
        return;
      }
      if (!this.newJob.cron.trim()) {
        OpenFangToast.warn('请输入Cron表达式');
        return;
      }
      this.creating = true;
      try {
        var jobName = this.newJob.name;
        var body = {
          agent_id: this.newJob.agent_id,
          name: this.newJob.name,
          schedule: { kind: 'cron', expr: this.newJob.cron },
          action: { kind: 'agent_turn', message: this.newJob.message || '计划任务: ' + this.newJob.name },
          delivery: { kind: 'last_channel' },
          enabled: this.newJob.enabled
        };
        await OpenFangAPI.post('/api/cron/jobs', body);
        this.showCreateForm = false;
        this.newJob = { name: '', cron: '', agent_id: '', message: '', enabled: true };
        OpenFangToast.success('调度 "' + jobName + '" 已创建');
        await this.loadJobs();
      } catch(e) {
        OpenFangToast.error('创建调度失败: ' + (e.message || e));
      }
      this.creating = false;
    },

    async toggleJob(job) {
      try {
        var newState = !job.enabled;
        await OpenFangAPI.put('/api/cron/jobs/' + job.id + '/enable', { enabled: newState });
        job.enabled = newState;
        OpenFangToast.success('调度 ' + (newState ? '已启用' : '已暂停'));
      } catch(e) {
        OpenFangToast.error('切换调度状态失败: ' + (e.message || e));
      }
    },

    deleteJob(job) {
      var self = this;
      var jobName = job.name || job.id;
      OpenFangToast.confirm('删除调度', '删除 "' + jobName + '"？此操作无法撤销。', async function() {
        try {
          await OpenFangAPI.del('/api/cron/jobs/' + job.id);
          self.jobs = self.jobs.filter(function(j) { return j.id !== job.id; });
          OpenFangToast.success('调度 "' + jobName + '" 已删除');
        } catch(e) {
          OpenFangToast.error('删除调度失败: ' + (e.message || e));
        }
      });
    },

    async runNow(job) {
      this.runningJobId = job.id;
      try {
        var result = await OpenFangAPI.post('/api/schedules/' + job.id + '/run', {});
        if (result.status === 'completed') {
          OpenFangToast.success('调度 "' + (job.name || '任务') + '" 执行成功');
          job.last_run = new Date().toISOString();
        } else {
          OpenFangToast.error('调度运行失败: ' + (result.error || '未知错误'));
        }
      } catch(e) {
        OpenFangToast.error('立即运行功能暂不支持Cron任务');
      }
      this.runningJobId = '';
    },

    // ── Trigger helpers ──

    triggerType(pattern) {
      if (!pattern) return '未知';
      if (typeof pattern === 'string') return pattern;
      var keys = Object.keys(pattern);
      if (keys.length === 0) return '未知';
      var key = keys[0];
      var names = {
        lifecycle: '生命周期',
        agent_spawned: '智能体启动',
        agent_terminated: '智能体终止',
        system: '系统',
        system_keyword: '系统关键词',
        memory_update: '记忆更新',
        memory_key_pattern: '记忆键',
        all: '所有事件',
        content_match: '内容匹配'
      };
      return names[key] || key.replace(/_/g, ' ');
    },

    async toggleTrigger(trigger) {
      try {
        var newState = !trigger.enabled;
        await OpenFangAPI.put('/api/triggers/' + trigger.id, { enabled: newState });
        trigger.enabled = newState;
        OpenFangToast.success('触发器 ' + (newState ? '已启用' : '已禁用'));
      } catch(e) {
        OpenFangToast.error('切换触发器状态失败: ' + (e.message || e));
      }
    },

    deleteTrigger(trigger) {
      var self = this;
      OpenFangToast.confirm('删除触发器', '删除此触发器？此操作无法撤销。', async function() {
        try {
          await OpenFangAPI.del('/api/triggers/' + trigger.id);
          self.triggers = self.triggers.filter(function(t) { return t.id !== trigger.id; });
          OpenFangToast.success('触发器已删除');
        } catch(e) {
          OpenFangToast.error('删除触发器失败: ' + (e.message || e));
        }
      });
    },

    // ── Utility ──

    get availableAgents() {
      return Alpine.store('app').agents || [];
    },

    agentName(agentId) {
      if (!agentId) return '(任意)';
      var agents = this.availableAgents;
      for (var i = 0; i < agents.length; i++) {
        if (agents[i].id === agentId) return agents[i].name;
      }
      if (agentId.length > 12) return agentId.substring(0, 8) + '...';
      return agentId;
    },

    describeCron(expr) {
      if (!expr) return '';
      // Handle non-cron schedule descriptions
      if (expr.indexOf('every ') === 0) return expr;
      if (expr.indexOf('at ') === 0) return '一次性: ' + expr.substring(3);

      var map = {
        '* * * * *': '每分钟',
        '*/2 * * * *': '每2分钟',
        '*/5 * * * *': '每5分钟',
        '*/10 * * * *': '每10分钟',
        '*/15 * * * *': '每15分钟',
        '*/30 * * * *': '每30分钟',
        '0 * * * *': '每小时',
        '0 */2 * * *': '每2小时',
        '0 */4 * * *': '每4小时',
        '0 */6 * * *': '每6小时',
        '0 */12 * * *': '每12小时',
        '0 0 * * *': '每天午夜',
        '0 6 * * *': '每天早上6点',
        '0 9 * * *': '每天上午9点',
        '0 12 * * *': '每天中午',
        '0 18 * * *': '每天下午6点',
        '0 9 * * 1-5': '工作日上午9点',
        '0 9 * * 1': '每周一上午9点',
        '0 0 * * 0': '每周日午夜',
        '0 0 1 * *': '每月1号',
        '0 0 * * 1': '每周一午夜'
      };
      if (map[expr]) return map[expr];

      var parts = expr.split(' ');
      if (parts.length !== 5) return expr;

      var min = parts[0];
      var hour = parts[1];
      var dom = parts[2];
      var mon = parts[3];
      var dow = parts[4];

      if (min.indexOf('*/') === 0 && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
        return '每 ' + min.substring(2) + ' 分钟';
      }
      if (min === '0' && hour.indexOf('*/') === 0 && dom === '*' && mon === '*' && dow === '*') {
        return '每 ' + hour.substring(2) + ' 小时';
      }

      var dowNames = { '0': '周日', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日',
                       '1-5': '工作日', '0,6': '周末', '6,0': '周末' };

      if (dom === '*' && mon === '*' && min.match(/^\d+$/) && hour.match(/^\d+$/)) {
        var h = parseInt(hour, 10);
        var m = parseInt(min, 10);
        var ampm = h >= 12 ? '下午' : '上午';
        var h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        var mStr = m < 10 ? '0' + m : '' + m;
        var timeStr = h12 + ':' + mStr + ' ' + ampm;
        if (dow === '*') return '每天 ' + timeStr;
        var dowLabel = dowNames[dow] || ('周' + dow);
        return dowLabel + ' ' + timeStr;
      }

      return expr;
    },

    applyCronPreset(preset) {
      this.newJob.cron = preset.cron;
    },

    formatTime(ts) {
      if (!ts) return '-';
      try {
        var d = new Date(ts);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString();
      } catch(e) { return '-'; }
    },

    relativeTime(ts) {
      if (!ts) return '从未';
      try {
        var diff = Date.now() - new Date(ts).getTime();
        if (isNaN(diff)) return '从未';
        if (diff < 0) {
          // Future time
          var absDiff = Math.abs(diff);
          if (absDiff < 60000) return '<1分钟内';
          if (absDiff < 3600000) return Math.floor(absDiff / 60000) + '分钟后';
          if (absDiff < 86400000) return Math.floor(absDiff / 3600000) + '小时后';
          return Math.floor(absDiff / 86400000) + '天后';
        }
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        return Math.floor(diff / 86400000) + '天前';
      } catch(e) { return '从未'; }
    },

    jobCount() {
      var enabled = 0;
      for (var i = 0; i < this.jobs.length; i++) {
        if (this.jobs[i].enabled) enabled++;
      }
      return enabled;
    },

    triggerCount() {
      var enabled = 0;
      for (var i = 0; i < this.triggers.length; i++) {
        if (this.triggers[i].enabled) enabled++;
      }
      return enabled;
    }
  };
}
