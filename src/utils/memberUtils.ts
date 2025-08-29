// 会员等级映射
export const MEMBER_LEVEL_MAP = {
  'bronze': '铜卡会员',
  'silver': '银卡会员', 
  'gold': '黄金会员',
  'diamond': '钻石会员'
} as const

// 会员等级反向映射
export const MEMBER_LEVEL_REVERSE_MAP = {
  '铜卡会员': 'bronze',
  '银卡会员': 'silver',
  '黄金会员': 'gold', 
  '钻石会员': 'diamond'
} as const

// 会员等级标签类型映射
export const MEMBER_LEVEL_TYPE_MAP = {
  '铜卡会员': 'danger',   // 红棕色，符合铜的颜色
  '银卡会员': 'info',     // 蓝灰色，符合银的颜色
  '黄金会员': 'warning',  // 金黄色，符合金的颜色
  '钻石会员': 'success'   // 绿色，符合钻石的珍贵感
} as const

/**
 * 将英文会员等级转换为中文
 */
export const getMemberLevelText = (level: string): string => {
  return MEMBER_LEVEL_MAP[level as keyof typeof MEMBER_LEVEL_MAP] || level
}

/**
 * 将中文会员等级转换为英文
 */
export const getMemberLevelCode = (level: string): string => {
  return MEMBER_LEVEL_REVERSE_MAP[level as keyof typeof MEMBER_LEVEL_REVERSE_MAP] || level
}

/**
 * 获取会员等级对应的标签类型
 */
export const getMemberLevelType = (level: string): string => {
  return MEMBER_LEVEL_TYPE_MAP[level as keyof typeof MEMBER_LEVEL_TYPE_MAP] || ''
}

/**
 * 获取所有会员等级选项
 */
export const getMemberLevelOptions = () => {
  return Object.entries(MEMBER_LEVEL_MAP).map(([value, label]) => ({
    label,
    value
  }))
}

/**
 * 获取所有中文会员等级选项
 */
export const getMemberLevelTextOptions = () => {
  return Object.values(MEMBER_LEVEL_MAP).map(label => ({
    label,
    value: label
  }))
} 