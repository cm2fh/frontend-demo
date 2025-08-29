import { useUserStore } from '@/stores/user'

// 权限检查工具类
export class Permission {
  /**
   * 检查是否为管理员
   */
  static isAdmin(): boolean {
    const userStore = useUserStore()
    return userStore.userInfo?.userType === 'admin'
  }

  /**
   * 检查是否为教练
   */
  static isCoach(): boolean {
    const userStore = useUserStore()
    return userStore.userInfo?.userType === 'coach'
  }

  /**
   * 检查是否为会员
   */
  static isMember(): boolean {
    const userStore = useUserStore()
    return userStore.userInfo?.userType === 'user'
  }

  /**
   * 检查是否有指定角色
   */
  static hasRole(role: string): boolean {
    const userStore = useUserStore()
    return userStore.userInfo?.userType === role
  }

  /**
   * 检查是否有指定角色中的任意一个
   */
  static hasAnyRole(roles: string[]): boolean {
    const userStore = useUserStore()
    const userRole = userStore.userInfo?.userType
    return roles.includes(userRole || '')
  }

  /**
   * 检查是否有所有指定角色
   */
  static hasAllRoles(roles: string[]): boolean {
    const userStore = useUserStore()
    const userRole = userStore.userInfo?.userType
    return roles.every(role => userRole === role)
  }

  /**
   * 获取角色显示名称
   */
  static getRoleDisplayName(role: string): string {
    const nameMap: Record<string, string> = {
      'admin': '管理员',
      'coach': '教练',
      'user': '会员'
    }
    return nameMap[role] || '未知'
  }

  /**
   * 获取角色标签类型
   */
  static getRoleTagType(role: string): string {
    const typeMap: Record<string, string> = {
      'admin': 'danger',
      'coach': 'warning',
      'user': 'success'
    }
    return typeMap[role] || 'info'
  }
}

// 权限守卫组件
import { defineComponent, h } from 'vue'

export const PermissionGuard = defineComponent({
  name: 'PermissionGuard',
  props: {
    roles: {
      type: Array as () => string[],
      required: true
    }
  },
  setup(props, { slots }) {
    const hasPermission = Permission.hasAnyRole(props.roles)
    
    return () => {
      if (hasPermission) {
        return slots.default?.()
      }
      return null
    }
  }
}) 