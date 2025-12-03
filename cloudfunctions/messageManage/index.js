// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const messagesCollection = db.collection('messages')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  const { action, data } = event
  
  // 根据不同的操作执行不同的功能
  switch (action) {
    case 'create':
      return await createMessage(data)
    case 'getUserMessages':
      return await getUserMessages(OPENID, event.userId, event.messageType)
    case 'markAsRead':
      return await markAsRead(OPENID, event.messageId)
    case 'markAllAsRead':
      return await markAllAsRead(OPENID)
    case 'deleteMessage':
      return await deleteMessage(OPENID, event.messageId)
    default:
      return {
        success: false,
        message: '未知操作类型'
      }
  }
}

/**
 * 创建消息
 * @param {object} messageData 消息数据
 */
async function createMessage(messageData) {
  console.log('[messageManage] 创建消息请求:', messageData)
  
  if (!messageData || !messageData.receiverId) {
    return {
      success: false,
      message: '缺少必要的消息数据'
    }
  }
  
  try {
    // 构建消息数据
    const message = {
      ...messageData,
      read: false,
      createTime: db.serverDate(),
      _createTime: Date.now()
    }
    
    console.log('[messageManage] 准备保存的消息数据:', message)
    
    // 添加到数据库
    const result = await messagesCollection.add({
      data: message
    })
    
    console.log('[messageManage] 消息创建成功:', result._id)
    
    // 尝试发送订阅消息
    if (messageData.receiverId) {
      try {
        // 获取接收者信息，拿到openid
        const receiverRes = await db.collection('users').doc(messageData.receiverId).get()
        const receiver = receiverRes.data
        
        if (receiver && receiver._openid) {
          const tmplId = 'SBgrWcE3FHh4GzHmBr34TXbUb4nJA32VxOgh_9KcP8E'
          
          // 处理内容长度（thing1限制20个字符）
          let content = messageData.content || '您收到了一条新消息'
          if (content.length > 20) {
            content = content.substring(0, 17) + '...'
          }
          
          // 格式化时间 YYYY年MM月DD日 HH:mm
          const now = new Date()
          // 调整时区到北京时间 (UTC+8)
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
          const date = new Date(utc + (3600000 * 8))
          
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hour = String(date.getHours()).padStart(2, '0')
          const minute = String(date.getMinutes()).padStart(2, '0')
          const timeStr = `${year}年${month}月${day}日 ${hour}:${minute}`
          
          // 构造跳转页面
          let pagePath = '/pages/index/index' // 默认首页
          if (messageData.nominationId) {
            pagePath = `/pages/detail/detail?id=${messageData.nominationId}`
          }
          
          console.log(`[messageManage] 准备发送订阅消息: to=${receiver._openid}, content=${content}`)
          
          // 调用微信发送接口
          await cloud.openapi.subscribeMessage.send({
            touser: receiver._openid,
            templateId: tmplId,
            page: pagePath,
            data: {
              thing1: { value: content },
              time2: { value: timeStr }
            },
            miniprogramState: 'formal' // 发送正式版，开发调试时如果没发布可能需改为 developer
          })
          console.log('[messageManage] 订阅消息发送成功')
        }
      } catch (sendErr) {
        // 发送失败（通常是用户未订阅）是正常现象，不应阻断流程
        console.log('[messageManage] 订阅消息发送跳过或失败:', sendErr.message)
      }
    }
    
    return {
      success: true,
      message: '消息创建成功',
      data: {
        id: result._id
      }
    }
  } catch (err) {
    console.error('创建消息失败:', err)
    return {
      success: false,
      message: '创建消息失败',
      error: err.message
    }
  }
}

/**
 * 获取用户消息列表
 * @param {string} openid 用户的openid
 * @param {string} userId 指定用户ID查询(可选)
 * @param {string} messageType 消息类型过滤(可选)
 */
async function getUserMessages(openid, userId, messageType) {
  try {
    // 查询用户信息，获取用户ID
    let userQuery = {}
    if (userId) {
      userQuery._id = userId
    } else {
      userQuery._openid = openid
    }
    
    const userRes = await db.collection('users').where(userQuery).get()
    
    if (!userRes.data || userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const user = userRes.data[0]
    
    // 构建查询条件
    let queryCondition = {
      receiverId: user._id
    }
    
    // 根据消息类型过滤
    if (messageType && messageType !== 'all') {
      queryCondition.type = messageType
    }
    
    // 获取用户的消息
    const messagesRes = await messagesCollection
      .where(queryCondition)
      .orderBy('createTime', 'desc')
      .get()
    
    // 如果是查询所有消息，则统计各类型的数量
    let counts = { all: 0, comment: 0, vote: 0, system: 0 }
    if (!messageType || messageType === 'all') {
      const allMessagesRes = await messagesCollection
        .where({ receiverId: user._id })
        .get()
      
      const allMessages = allMessagesRes.data || []
      counts.all = allMessages.length
      counts.comment = allMessages.filter(msg => msg.type === 'comment').length
      counts.vote = allMessages.filter(msg => msg.type === 'vote').length
      counts.system = allMessages.filter(msg => msg.type === 'system').length
    }
    
    return {
      success: true,
      data: messagesRes.data || [],
      unreadCount: (messagesRes.data || []).filter(msg => !msg.read).length,
      counts: counts
    }
  } catch (err) {
    console.error('获取用户消息失败:', err)
    return {
      success: false,
      message: '获取用户消息失败',
      error: err.message
    }
  }
}

/**
 * 标记消息为已读
 * @param {string} openid 用户的openid
 * @param {string} messageId 消息ID
 */
async function markAsRead(openid, messageId) {
  if (!messageId) {
    return {
      success: false,
      message: '缺少消息ID'
    }
  }
  
  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (!userRes.data || userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const userId = userRes.data[0]._id
    
    // 验证消息是否属于该用户
    const messageRes = await messagesCollection.doc(messageId).get()
    
    if (!messageRes.data) {
      return {
        success: false,
        message: '消息不存在'
      }
    }
    
    if (messageRes.data.receiverId !== userId) {
      return {
        success: false,
        message: '无权操作此消息'
      }
    }
    
    // 标记为已读
    await messagesCollection.doc(messageId).update({
      data: {
        read: true,
        readTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '消息已标记为已读'
    }
  } catch (err) {
    console.error('标记消息已读失败:', err)
    return {
      success: false,
      message: '操作失败',
      error: err.message
    }
  }
}

/**
 * 标记所有消息为已读
 * @param {string} openid 用户的openid
 */
async function markAllAsRead(openid) {
  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (!userRes.data || userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const userId = userRes.data[0]._id
    
    // 标记该用户的所有未读消息为已读
    await messagesCollection.where({
      receiverId: userId,
      read: false
    }).update({
      data: {
        read: true,
        readTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '所有消息已标记为已读'
    }
  } catch (err) {
    console.error('标记所有消息已读失败:', err)
    return {
      success: false,
      message: '操作失败',
      error: err.message
    }
  }
}

/**
 * 删除消息
 * @param {string} openid 用户的openid
 * @param {string} messageId 消息ID
 */
async function deleteMessage(openid, messageId) {
  if (!messageId) {
    return {
      success: false,
      message: '缺少消息ID'
    }
  }
  
  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (!userRes.data || userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const userId = userRes.data[0]._id
    
    // 验证消息是否属于该用户
    const messageRes = await messagesCollection.doc(messageId).get()
    
    if (!messageRes.data) {
      return {
        success: false,
        message: '消息不存在'
      }
    }
    
    if (messageRes.data.receiverId !== userId) {
      return {
        success: false,
        message: '无权操作此消息'
      }
    }
    
    // 删除消息
    await messagesCollection.doc(messageId).remove()
    
    return {
      success: true,
      message: '消息删除成功'
    }
  } catch (err) {
    console.error('删除消息失败:', err)
    return {
      success: false,
      message: '删除消息失败',
      error: err.message
    }
  }
} 