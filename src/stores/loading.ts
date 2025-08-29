import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isRouteLoading = ref(false)

  const setRouteLoading = (loading: boolean, text?: string) => {
    isRouteLoading.value = loading
  }

  const startRouteLoading = (text = '页面加载中...') => {
    setRouteLoading(true, text)
  }

  const stopRouteLoading = () => {
    setRouteLoading(false)
  }

  return {
    isRouteLoading,
    setRouteLoading,
    startRouteLoading,
    stopRouteLoading
  }
})
