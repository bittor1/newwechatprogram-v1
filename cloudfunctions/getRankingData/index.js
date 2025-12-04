// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const MAX_LIMIT = 100 // 云函数端单次最多可获取100条

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 先获取总数
    const countResult = await db.collection('entries').count()
    const total = countResult.total
    
    console.log('entries 总数:', total)
    
    if (total === 0) {
      return {
        success: true,
        data: [],
        total: 0
      }
    }
    
    // 计算需要分几次请求
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('entries')
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    
    // 并行请求所有分页数据
    const results = await Promise.all(tasks)
    
    // 合并所有数据
    let allData = []
    results.forEach(res => {
      allData = allData.concat(res.data)
    })
    
    // 按票数降序排序，票数相同按创建时间降序
    allData.sort((a, b) => {
      const votesA = a.votes !== undefined ? a.votes : 0
      const votesB = b.votes !== undefined ? b.votes : 0
      
      if (votesB !== votesA) {
        return votesB - votesA
      }
      // 票数相同时，新上榜的排在上面
      const timeA = a._createTime || a.createdAt || 0
      const timeB = b._createTime || b.createdAt || 0
      return timeB - timeA
    })
    
    console.log('获取排行榜数据成功，共', allData.length, '条')
    
    return {
      success: true,
      data: allData,
      total: allData.length
    }
  } catch (err) {
    console.error('获取排行榜数据失败:', err)
    return {
      success: false,
      error: err.message || '获取数据失败'
    }
  }
}

