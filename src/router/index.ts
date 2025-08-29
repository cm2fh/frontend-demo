import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoadingStore } from '@/stores/loading'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/admin' },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/components/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '数据统计', roles: ['admin', 'user'] }
        },
        {
          path: 'members',
          name: 'members',
          component: () => import('@/views/admin/MemberManagement.vue'),
          meta: { title: '会员管理', roles: ['admin'] }
        },
        {
          path: 'coaches',
          name: 'coaches',
          component: () => import('@/views/admin/CoachManagement.vue'),
          meta: { title: '教练管理', roles: ['admin'] }
        },
        {
          path: 'subjects',
          name: 'subjects',
          component: () => import('@/views/admin/SubjectManagement.vue'),
          meta: { title: '科目管理', roles: ['admin'] }
        },
        {
          path: 'courses',
          name: 'courses',
          component: () => import('@/views/admin/CourseManagement.vue'),
          meta: { title: '课程管理', roles: ['admin', 'user'] }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/admin/ProductManagement.vue'),
          meta: { title: '产品管理', roles: ['admin'] }
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/admin/SalesManagement.vue'),
          meta: { title: '销售管理', roles: ['admin'] }
        },
        {
          path: 'schedules',
          name: 'schedules',
          component: () => import('@/views/admin/ScheduleManagement.vue'),
          meta: { title: '课表管理', roles: ['admin', 'user'] }
        },
        {
          path: 'reservations',
          name: 'reservations',
          component: () => import('@/views/admin/ReservationManagement.vue'),
          meta: { title: '预约管理', roles: ['admin', 'user'] }
        }
      ]
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/components/UserLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/user/schedule' },
        {
          path: 'schedule',
          name: 'userSchedule',
          component: () => import('@/views/user/ScheduleView.vue'),
          meta: { title: '查看课表', roles: ['user'] }
        },
        {
          path: 'reservation',
          name: 'userReservation',
          component: () => import('@/views/user/ReservationView.vue'),
          meta: { title: '课程预约', roles: ['user'] }
        },
        {
          path: 'reviews',
          name: 'userReviews',
          component: () => import('@/views/user/ReviewView.vue'),
          meta: { title: '课程评价', roles: ['user'] }
        },
        {
          path: 'profile',
          name: 'userProfile',
          component: () => import('@/views/user/ProfileView.vue'),
          meta: { title: '个人资料', roles: ['user'] }
        }
      ]
    },
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/Register.vue') }
  ]
})

router.beforeEach(async (to, from, next) => {
  const loadingStore = useLoadingStore()
  
  // 开始路由加载
  if (from.path !== to.path) {
    loadingStore.startRouteLoading('页面切换中...')
  }

  // 登录和注册页面直接通过
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  const userStore = useUserStore()
  let isLoggedIn = userStore.isLoggedIn()

  // 如果没有用户信息，尝试从服务器获取
  if (!isLoggedIn && to.meta.requiresAuth) {
    try {
      const result = await userStore.fetchUserInfo()
      isLoggedIn = result.success
    } catch (error) {
      console.warn('获取用户信息失败:', error)
    }
  }

  // 需要认证但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  // 权限检查
  if (to.meta.roles && isLoggedIn) {
    const userRole = userStore.userInfo?.userType || 'user'
    const allowedRoles = to.meta.roles as string[]

    if (!allowedRoles.includes(userRole)) {
      // 根据用户角色重定向到相应的首页
      if (userRole === 'admin') {
        next('/admin/dashboard')
      } else {
        next('/user/schedule')
      }
      return
    }
  }

  next()
})

// 路由完成后停止加载状态
router.afterEach(() => {
  const loadingStore = useLoadingStore()
  // 延迟一点停止加载，确保页面已经开始渲染
  setTimeout(() => {
    loadingStore.stopRouteLoading()
  }, 100)
})

export default router
