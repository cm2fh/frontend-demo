import { ElMessage } from 'element-plus'
import { ApiError } from '../../generated/core/ApiError'

/**
 * 统一的API错误处理函数
 * @param error 错误对象
 * @param defaultMessage 默认错误信息
 */
export const handleApiError = (error: any, defaultMessage: string = '操作失败，请稍后重试') => {
  console.error('API Error:', error)
  let errorMessage = defaultMessage
  
  if (error instanceof ApiError) {
    // 尝试从不同位置获取错误信息
    errorMessage = error.body?.message || error.message || errorMessage
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error?.message) {
    errorMessage = error.message
  }
  
  ElMessage.error(errorMessage)
}

/**
 * 统一的API成功处理函数
 * @param message 成功信息
 */
export const handleApiSuccess = (message: string) => {
  ElMessage.success(message)
}
