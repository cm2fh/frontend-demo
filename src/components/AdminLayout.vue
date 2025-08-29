<template>
  <el-container class="admin-layout">
    <!-- 顶部导航栏 -->
    <el-header class="top-header">
      <div class="header-left">
        <div class="logo">
          <h2>健身会馆管理系统</h2>
        </div>
      </div>

      <div class="header-center">
        <el-menu
          :default-active="activeMenu"
          class="top-menu"
          mode="horizontal"
          background-color="transparent"
          text-color="#2c3e50"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item
            v-for="menu in visibleMenus"
            :key="menu.path"
            :index="menu.path"
          >
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-right">
        <el-dropdown trigger="click">
          <div class="user-info">
            <el-avatar :size="36" :src="userInfo.avatar" />
            <div class="user-details">
              <span class="username">{{ userInfo.username }}</span>
              <el-tag size="small" :type="getRoleTagType(userInfo.userType)" class="role-tag">
                {{ getRoleDisplayName(userInfo.userType) }}
              </el-tag>
            </div>
            <el-icon class="dropdown-icon">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.ts'
import { Permission } from '@/utils/permission.ts'
import {
  DataBoard,
  User,
  Avatar,
  Collection,
  Reading,
  Goods,
  TrendCharts,
  Calendar,
  Clock,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || { username: '管理员', avatar: '', userType: 'admin' })
const activeMenu = computed(() => route.path)

// 菜单配置
const menuConfig = [
  { path: '/admin/dashboard', title: '数据统计', icon: DataBoard, roles: ['admin', 'user'] },
  { path: '/admin/members', title: '会员管理', icon: User, roles: ['admin'] },
  { path: '/admin/coaches', title: '教练管理', icon: Avatar, roles: ['admin'] },
  { path: '/admin/subjects', title: '科目管理', icon: Collection, roles: ['admin'] },
  { path: '/admin/courses', title: '课程管理', icon: Reading, roles: ['admin', 'user'] },
  { path: '/admin/products', title: '产品管理', icon: Goods, roles: ['admin'] },
  { path: '/admin/sales', title: '销售管理', icon: TrendCharts, roles: ['admin'] },
  { path: '/admin/schedules', title: '课表管理', icon: Calendar, roles: ['admin', 'user'] },
  { path: '/admin/reservations', title: '预约管理', icon: Clock, roles: ['admin', 'user'] }
]

// 根据用户权限过滤可见菜单
const visibleMenus = computed(() => {
  const userRole = userInfo.value.userType || 'user'
  return menuConfig.filter(menu => menu.roles.includes(userRole))
})

const getRoleTagType = (userType: string | undefined) => {
  if (!userType) return 'info'
  return Permission.getRoleTagType(userType)
}

const getRoleDisplayName = (userType: string | undefined) => {
  if (!userType) return '未知'
  return Permission.getRoleDisplayName(userType)
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 64px;
  min-height: 64px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 200px;
  flex-shrink: 0;
}

.logo h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 20px;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.top-menu {
  border-bottom: none;
  background-color: transparent;
  height: 64px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.top-menu .el-menu-item {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  margin: 0 4px;
  border-radius: 8px 8px 0 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-menu .el-menu-item:hover {
  background-color: #f0f9ff;
  border-bottom-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
}

.top-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: 600;
}

.top-menu .el-menu-item .el-icon {
  margin-right: 0;
  font-size: 18px;
  vertical-align: middle;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  max-width: 220px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.user-info:hover {
  background-color: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.role-tag {
  font-size: 11px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
  white-space: nowrap;
  font-weight: 500;
}

.dropdown-icon {
  color: #909399;
  font-size: 12px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.breadcrumb-container {
  background-color: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
  background-color: #f5f7fa;
  overflow-y: auto;
  min-height: calc(100vh - 64px); /* 确保有足够的高度显示内容 */
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .top-menu .el-menu-item {
    padding: 0 16px;
    font-size: 13px;
    margin: 0 2px;
  }

  .top-menu .el-menu-item .el-icon {
    font-size: 16px;
  }

  .header-left {
    min-width: 180px;
  }

  .header-right {
    min-width: 180px;
  }

  .user-info {
    max-width: 200px;
    gap: 10px;
  }

  .username {
    max-width: 80px;
  }
}

@media (max-width: 1200px) {
  .top-header {
    padding: 0 20px;
  }

  .header-center {
    margin: 0 16px;
  }

  .top-menu .el-menu-item {
    padding: 0 14px;
    font-size: 13px;
    margin: 0 1px;
  }

  .top-menu .el-menu-item .el-icon {
    font-size: 15px;
  }

  .header-left {
    min-width: 160px;
  }

  .header-right {
    min-width: 160px;
  }

  .user-info {
    max-width: 180px;
    gap: 8px;
    padding: 6px 10px;
  }

  .username {
    max-width: 70px;
    font-size: 13px;
  }

  .role-tag {
    font-size: 10px;
    height: 18px;
    line-height: 16px;
    padding: 0 4px;
  }
}

@media (max-width: 992px) {
  .top-menu .el-menu-item span {
    display: none;
  }

  .top-menu .el-menu-item {
    padding: 0 12px;
    margin: 0 1px;
    justify-content: center;
  }

  .top-menu .el-menu-item .el-icon {
    margin-right: 0;
    font-size: 18px;
  }

  .header-left {
    min-width: 140px;
  }

  .header-right {
    min-width: 140px;
  }

  .user-details {
    display: none;
  }

  .user-info {
    max-width: auto;
    gap: 0;
    padding: 6px 8px;
  }

  .logo h2 {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .top-header {
    padding: 0 16px;
  }

  .header-center {
    margin: 0 12px;
  }

  .logo h2 {
    font-size: 16px;
  }

  .header-left {
    min-width: 120px;
  }

  .header-right {
    min-width: 120px;
  }

  .main-content {
    padding: 16px;
  }

  .breadcrumb-container {
    padding: 12px 16px;
  }

  .top-menu .el-menu-item {
    padding: 0 8px;
    margin: 0;
  }

  .top-menu .el-menu-item .el-icon {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .top-header {
    padding: 0 12px;
  }

  .header-center {
    margin: 0 8px;
  }

  .logo h2 {
    font-size: 14px;
  }

  .header-left {
    min-width: 100px;
  }

  .header-right {
    min-width: 100px;
  }

  .user-info {
    padding: 4px 6px;
  }

  .top-menu .el-menu-item {
    padding: 0 6px;
  }

  .top-menu .el-menu-item .el-icon {
    font-size: 14px;
  }
}

/* 确保下拉菜单样式正确 */
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
}

:deep(.el-dropdown-menu__item) {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f9ff;
  color: #409eff;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

/* 面包屑样式优化 */
:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  font-weight: 500;
  transition: color 0.3s ease;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #409eff;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #2c3e50;
  font-weight: 600;
}

/* 防止菜单溢出 */
:deep(.el-menu--horizontal) {
  border-bottom: none;
  overflow: hidden;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  border-bottom: none;
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 