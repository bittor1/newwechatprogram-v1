// pages/sound-settings/sound-settings.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    soundEnabled: false,
    currentSoundName: '',
    currentSoundUrl: '',
    
    // 录音相关
    recordingState: 'idle', // idle, recording, recorded
    recordTime: 0,
    formattedRecordTime: '00:00',
    tempFilePath: '',
    
    // 音效库相关
    userSounds: [],
    showSoundsLibrary: true,
    soundsLoading: false,
    
    // 资源检查
    hasMicIcon: true,
    hasPlayIcon: true,
    
    // 音频管理器
    recorderManager: null,
    innerAudioContext: null,
    recordTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadSoundSettings();
    this.checkAssets();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态并加载数据
    if (app.globalData.isLoggedIn) {
      this.loadUserSounds();
    } else {
      wx.showToast({
        title: '请先登录以管理音效',
        icon: 'none'
      });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopRecordTimer();
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.destroy();
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 检查资源是否存在
  checkAssets() {
    // 这里简单假设图片都在，实际可以使用 getFileSystemManager 检查
    // 实际开发中如果图片确定存在可以省略此步
  },

  // 加载音效设置
  loadSoundSettings() {
    const soundEnabled = wx.getStorageSync('soundEnabled') || false;
    const currentSoundUrl = wx.getStorageSync('currentSoundUrl') || '';
    const currentSoundName = wx.getStorageSync('currentSoundName') || '';
    
    this.setData({
      soundEnabled,
      currentSoundUrl,
      currentSoundName
    });
  },

  // 切换音效开关
  onSoundSwitchChange(e) {
    const enabled = e.detail.value;
    this.setData({ soundEnabled: enabled });
    wx.setStorageSync('soundEnabled', enabled);
  },

  // ==================== 录音功能 ====================

  // 初始化录音管理器
  initRecorderManager() {
    if (!this.data.recorderManager) {
      const recorderManager = wx.getRecorderManager();
      
      recorderManager.onStart(() => {
        console.log('录音开始');
        this.startRecordTimer();
      });
      
      recorderManager.onStop((res) => {
        console.log('录音结束', res);
        this.stopRecordTimer();
        this.setData({
          recordingState: 'recorded',
          tempFilePath: res.tempFilePath
        });
      });
      
      recorderManager.onError((err) => {
        console.error('录音出错', err);
        this.stopRecordTimer();
        this.setData({ recordingState: 'idle' });
        wx.showToast({
          title: '录音失败',
          icon: 'none'
        });
      });
      
      this.setData({ recorderManager });
    }
  },
  
  // 初始化音频播放器
  initAudioPlayer() {
    if (!this.data.innerAudioContext) {
      const innerAudioContext = wx.createInnerAudioContext();
      this.setData({ innerAudioContext });
    }
  },

  // 开始录音
  startRecording() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.initRecorderManager();
    
    this.setData({
      recordingState: 'recording',
      recordTime: 0,
      formattedRecordTime: '00:00'
    });
    
    this.data.recorderManager.start({
      format: 'mp3',
      sampleRate: 44100
    });
  },
  
  // 停止录音
  stopRecording() {
    if (this.data.recorderManager) {
      this.data.recorderManager.stop();
    }
  },
  
  // 开始录音计时
  startRecordTimer() {
    this.stopRecordTimer(); // 确保清除旧定时器
    this.data.recordTimer = setInterval(() => {
      const recordTime = this.data.recordTime + 1;
      this.setData({
        recordTime,
        formattedRecordTime: this.formatDuration(recordTime)
      });
    }, 1000);
  },
  
  // 停止录音计时
  stopRecordTimer() {
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer);
      this.setData({ recordTimer: null });
    }
  },
  
  // 播放录音
  playRecording() {
    if (!this.data.tempFilePath) return;
    
    this.initAudioPlayer();
    this.data.innerAudioContext.src = this.data.tempFilePath;
    this.data.innerAudioContext.play();
  },
  
  // 取消录音
  cancelRecording() {
    this.setData({
      recordingState: 'idle',
      tempFilePath: '',
      recordTime: 0,
      formattedRecordTime: '00:00'
    });
  },
  
  // 保存录音
  saveRecording() {
    if (!this.data.tempFilePath) return;
    
    wx.showLoading({ title: '保存中...' });
    
    // 上传音效文件
    wx.cloud.uploadFile({
      cloudPath: `sounds/${Date.now()}.mp3`,
      filePath: this.data.tempFilePath
    })
    .then(uploadRes => {
      // 保存音效记录
      return wx.cloud.callFunction({
        name: 'soundManage',
        data: {
          action: 'saveSoundRecord',
          fileId: uploadRes.fileID,
          duration: this.data.recordTime,
          name: '自定义投票音效'
        }
      });
    })
    .then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        this.setData({ recordingState: 'idle' });
        this.loadUserSounds(); // 重新加载音效库
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      wx.hideLoading();
      console.error('保存音效失败:', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    });
  },

  // ==================== 音效库管理 ====================

  // 切换音效库显示
  toggleSoundsLibrary() {
    this.setData({
      showSoundsLibrary: !this.data.showSoundsLibrary
    });
  },

  // 加载用户音效
  loadUserSounds() {
    if (this.data.soundsLoading) return;
    
    this.setData({ soundsLoading: true });
    
    wx.cloud.callFunction({
      name: 'soundManage',
      data: {
        action: 'getUserSounds'
      }
    })
    .then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        var sounds = res.result.data || [];
        // 格式化时间和时长
        sounds.forEach(item => {
          item.formattedCreateTime = this.formatTime(item._createTime);
          item.formattedDuration = (item.duration || 0).toFixed(1);
        });
        
        this.setData({
          userSounds: sounds,
          soundsLoading: false
        });
      } else {
        this.setData({ soundsLoading: false });
      }
    })
    .catch(err => {
      console.error('获取音效库失败:', err);
      this.setData({ soundsLoading: false });
    });
  },

  // 预览用户音效
  previewUserSound(e) {
    const fileId = e.currentTarget.dataset.fileId;
    if (!fileId) return;
    
    wx.showLoading({ title: '加载中', mask: true });
    
    // 下载并播放
    wx.cloud.downloadFile({
      fileID: fileId
    })
    .then(res => {
      wx.hideLoading();
      this.initAudioPlayer();
      this.data.innerAudioContext.src = res.tempFilePath;
      this.data.innerAudioContext.play();
    })
    .catch(err => {
      wx.hideLoading();
      console.error('预览音效失败:', err);
      wx.showToast({
        title: '预览失败',
        icon: 'none'
      });
    });
  },

  // 应用用户音效
  applyUserSound(e) {
    const fileId = e.currentTarget.dataset.fileId;
    const name = e.currentTarget.dataset.name;
    
    wx.showLoading({ title: '应用中' });
    
    // 下载音效文件到本地
    wx.cloud.downloadFile({
      fileID: fileId
    })
    .then(res => {
      wx.hideLoading();
      this.setData({
        currentSoundUrl: res.tempFilePath,
        currentSoundName: name,
        soundEnabled: true // 应用时自动开启
      });
      
      // 保存到本地存储
      wx.setStorageSync('currentSoundUrl', res.tempFilePath);
      wx.setStorageSync('currentSoundName', name);
      wx.setStorageSync('soundEnabled', true);
      
      wx.showToast({
        title: '已应用',
        icon: 'success'
      });
    })
    .catch(err => {
      wx.hideLoading();
      console.error('应用音效失败:', err);
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      });
    });
  },
  
  // 删除用户音效
  deleteUserSound(e) {
    const soundId = e.currentTarget.dataset.soundId;
    const name = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除音效"${name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performDeleteUserSound(soundId);
        }
      }
    });
  },
  
  // 执行删除音效
  performDeleteUserSound(soundId) {
    wx.showLoading({ title: '删除中' });
    
    wx.cloud.callFunction({
      name: 'soundManage',
      data: {
        action: 'deleteSound',
        soundId: soundId
      }
    })
    .then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.loadUserSounds(); // 重新加载音效库
        
        // 如果删除的是当前选中的音效，重置设置
        // 注意：这里逻辑比较简单，实际可能需要对比ID
        if (this.data.currentSoundName === name) {
           // 可选：是否要重置当前音效？
        }
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      wx.hideLoading();
      console.error('删除音效失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    });
  },

  // ==================== 工具方法 ====================
  
  // 格式化时长 mm:ss
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
  
  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
})