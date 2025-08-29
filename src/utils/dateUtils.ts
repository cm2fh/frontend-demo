/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间为 yyyy-MM-dd HH:mm:ss 格式
 * @param time 时间字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export const formatDateTime = (time: string | Date | null | undefined): string => {
  if (!time) return ''
  
  const date = new Date(time)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化时间为 yyyy-MM-dd 格式
 * @param time 时间字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (time: string | Date | null | undefined): string => {
  if (!time) return ''
  
  const date = new Date(time)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化时间为 HH:mm:ss 格式
 * @param time 时间字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time: string | Date | null | undefined): string => {
  if (!time) return ''
  
  const date = new Date(time)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${hours}:${minutes}:${seconds}`
}

/**
 * 获取相对时间描述（如：刚刚、5分钟前、1小时前等）
 * @param time 时间字符串或Date对象
 * @returns 相对时间描述
 */
export const getRelativeTime = (time: string | Date | null | undefined): string => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDate(date)
}

/**
 * 格式化课表时间范围
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 格式化后的时间范围字符串
 */
export const formatScheduleTime = (
  startTime: string | Date | null | undefined,
  endTime: string | Date | null | undefined
): string => {
  if (!startTime || !endTime) return ''

  const start = new Date(startTime)
  const end = new Date(endTime)

  // 检查日期是否有效
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''

  // 如果是同一天，显示：2024-01-15 09:00-10:30
  if (start.toDateString() === end.toDateString()) {
    const date = formatDate(start)
    const startTimeStr = formatTime(start).substring(0, 5) // 只显示 HH:mm
    const endTimeStr = formatTime(end).substring(0, 5)     // 只显示 HH:mm
    return `${date} ${startTimeStr}-${endTimeStr}`
  } else {
    // 如果跨天，显示完整的开始和结束时间
    return `${formatDateTime(start)} - ${formatDateTime(end)}`
  }
}