<template>
  <div class="user-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>预约系统</h2>
        </div>
        
        <el-menu
          class="top-menu"
          mode="horizontal"
          :default-active="activeMenu"
          router
        >
          <el-menu-item index="/user/schedule">
            <el-icon><Calendar /></el-icon>
            查看课表
          </el-menu-item>
          <el-menu-item index="/user/reservation">
            <el-icon><Clock /></el-icon>
            课程预约
          </el-menu-item>
          <el-menu-item index="/user/reviews">
            <el-icon><ChatDotRound /></el-icon>
            课程评价
          </el-menu-item>
        </el-menu>

        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Calendar, Clock, ChatDotRound, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      userStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  } else if (command === 'profile') {
    // 跳转到个人资料页面
    router.push('/user/profile')
  }
}
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo h2 {
  margin: 0;
  color: #409eff;
  font-weight: 600;
}

.top-menu {
  border-bottom: none;
  background: transparent;
  flex: 1;
  display: flex;
  justify-content: center;
}

.top-menu .el-menu-item {
  height: 64px;
  line-height: 64px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  margin: 0 8px;
  border-radius: 4px 4px 0 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-menu .el-menu-item:hover {
  background-color: #f0f9ff;
  border-bottom-color: #409eff;
  color: #409eff;
}

.top-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  border-bottom-color: #409eff;
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.main-content {
  margin-top: 64px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  min-height: calc(100vh - 64px); /* 确保有足够的高度 */
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .logo h2 {
    font-size: 18px;
  }
  
  .top-menu .el-menu-item {
    padding: 0 16px;
    font-size: 13px;
    margin: 0 4px;
  }
  
  .username {
    display: none;
  }
  
  .main-content {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .top-menu .el-menu-item {
    padding: 0 12px;
    font-size: 12px;
    margin: 0 2px;
  }
  
  .top-menu .el-menu-item .el-icon {
    margin-right: 4px;
  }
}
</style> 