import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginUserVO } from '../../generated/models/LoginUserVO'
import { UserControllerService } from '../../generated/services/UserControllerService'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<LoginUserVO | null>(null)

  const login = async (username: string, password: string) => {
    try {
      const response = await UserControllerService.userLogin({ username, password })

      if (response.success) {
        userInfo.value = response.data || null
        return { success: true }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: '登录失败，请检查网络连接' }
    }
  }

  const logout = async () => {
    try {
      await UserControllerService.userLogout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      userInfo.value = null
    }
    return { success: true }
  }

  const fetchUserInfo = async () => {
    try {
      const response = await UserControllerService.getLoginUser()
      if (response.success) {
        userInfo.value = response.data || null
        return { success: true }
      } else {
        return { success: false, message: response.message || '获取用户信息失败' }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { success: false, message: '获取用户信息失败' }
    }
  }

  const isLoggedIn = () => {
    return !!userInfo.value
  }

  return {
    userInfo,
    login,
    logout,
    fetchUserInfo,
    isLoggedIn
  }
}, {
  persist: true
}) 