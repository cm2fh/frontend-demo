import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// Excel 导出接口
export interface ExcelExportOptions {
  data: any[]
  filename: string
  sheetName?: string
  headers?: string[]
}

/**
 * 导出数据到 Excel
 */
export const exportToExcel = (options: ExcelExportOptions) => {
  const { data, filename, sheetName = 'Sheet1', headers } = options
  
  try {
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 处理数据
    let exportData = data
    if (headers && headers.length > 0) {
      // 如果提供了表头，添加到数据开头
      exportData = [headers, ...data]
    }
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(exportData)
    
    // 设置列宽
    const colWidths = exportData[0]?.map(() => ({ wch: 15 })) || []
    ws['!cols'] = colWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // 导出文件
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    saveAs(blob, `${filename}.xlsx`)
    
    return { success: true, message: 'Excel导出成功' }
  } catch (error) {
    console.error('Excel导出失败:', error)
    return { success: false, message: 'Excel导出失败', error }
  }
}

/**
 * 格式化数据用于导出
 */
export const formatDataForExport = (data: any[], fieldMap: Record<string, string>) => {
  return data.map(item => {
    const formattedItem: any = {}
    Object.keys(fieldMap).forEach(key => {
      const value = item[key]
      formattedItem[fieldMap[key]] = formatValue(value)
    })
    return formattedItem
  })
}

/**
 * 格式化单个值
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'number') return value.toString()
  if (value instanceof Date) return value.toLocaleString('zh-CN')
  return String(value)
}

/**
 * 获取表格数据用于导出
 */
export const getTableExportData = (tableData: any[], columns: any[]) => {
  const headers = columns.map(col => col.label || col.prop)
  const data = tableData.map(row => {
    return columns.map(col => {
      let value = row[col.prop]
      
      // 处理特殊格式
      if (col.formatter && typeof col.formatter === 'function') {
        value = col.formatter(row, col, value)
      }
      
      return formatValue(value)
    })
  })
  
  return { headers, data }
}

/**
 * 导出会员数据
 */
export const exportMemberData = (memberList: any[]) => {
  const fieldMap = {
    id: 'ID',
    username: '用户名',
    phone: '手机号',
    email: '邮箱',
    avatar: '头像',
    gender: '性别',
    memberLevel: '会员等级',
    points: '积分',
    balance: '余额',
    status: '状态',
    createTime: '注册时间'
  }

  // 特殊处理会员等级、性别和状态字段
  const formattedData = memberList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'memberLevel') {
        const levelMap: Record<string, string> = {
          'bronze': '铜卡会员',
          'silver': '银卡会员',
          'gold': '黄金会员',
          'diamond': '钻石会员'
        }
        value = levelMap[value] || value
      } else if (key === 'gender') {
        const genderMap: Record<number, string> = {
          0: '未知',
          1: '男',
          2: '女'
        }
        value = genderMap[value] || '未知'
      } else if (key === 'status') {
        value = value === 1 ? '正常' : '禁用'
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出课程数据
 */
export const exportCourseData = (courseList: any[]) => {
  const fieldMap = {
    id: 'ID',
    title: '课程标题',
    categoryName: '分类',
    coachName: '教练',
    description: '描述',
    image: '图片',
    price: '价格',
    duration: '时长(分钟)',
    difficulty: '难度',
    status: '状态',
    createTime: '创建时间'
  }

  // 特殊处理难度和状态字段
  const formattedData = courseList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'difficulty') {
        const difficultyMap: Record<number, string> = {
          1: '初级',
          2: '中级',
          3: '高级'
        }
        value = difficultyMap[value] || value
      } else if (key === 'status') {
        value = value === 1 ? '上架' : '下架'
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出预约数据
 */
export const exportReservationData = (reservationList: any[]) => {
  const fieldMap = {
    id: 'ID',
    courseTitle: '课程名称',
    memberName: '会员姓名',
    coachName: '教练',
    scheduleTime: '上课时间',
    venue: '上课地点',
    status: '预约状态',
    price: '价格',
    payStatus: '支付状态',
    payTime: '支付时间',
    cancelTime: '取消时间',
    cancelReason: '取消原因',
    checkInTime: '签到时间',
    notes: '备注',
    createTime: '预约时间'
  }
  
  const formattedData = formatDataForExport(reservationList, fieldMap)
  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))
  
  return { headers, data }
}

/**
 * 导出销售数据
 */
export const exportSalesData = (salesList: any[]) => {
  const fieldMap = {
    id: '订单ID',
    orderNo: '订单号',
    memberName: '会员姓名',
    productTitle: '产品名称',
    quantity: '数量',
    originalAmount: '原价',
    finalAmount: '实付金额',
    payMethod: '支付方式',
    paymentStatus: '支付状态',
    orderStatus: '订单状态',
    payTime: '支付时间',
    createTime: '下单时间'
  }

  // 特殊处理支付状态和订单状态字段
  const formattedData = salesList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'paymentStatus') {
        const statusMap: Record<number, string> = {
          0: '未支付',
          1: '已支付',
          2: '已退款'
        }
        value = statusMap[value] || value
      } else if (key === 'orderStatus') {
        const statusMap: Record<number, string> = {
          0: '已取消',
          1: '待支付',
          2: '已支付',
          3: '已完成',
          4: '已退款'
        }
        value = statusMap[value] || value
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出教练数据
 */
export const exportCoachData = (coachList: any[]) => {
  const fieldMap = {
    id: 'ID',
    username: '用户名',
    phone: '手机号',
    email: '邮箱',
    avatar: '头像',
    gender: '性别',
    specialty: '专业特长',
    hourlyRate: '时薪',
    rating: '评分',
    status: '状态',
    createTime: '入职时间'
  }

  // 特殊处理性别和状态字段
  const formattedData = coachList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'gender') {
        const genderMap: Record<number, string> = {
          0: '未知',
          1: '男',
          2: '女'
        }
        value = genderMap[value] || '未知'
      } else if (key === 'status') {
        value = value === 1 ? '正常' : '禁用'
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出科目数据
 */
export const exportSubjectData = (subjectList: any[]) => {
  const fieldMap = {
    id: 'ID',
    name: '分类名称',
    description: '分类描述',
    image: '分类图片',
    icon: '分类图标',
    sort: '排序',
    status: '状态',
    courseCount: '课程数量',
    createTime: '创建时间',
    updateTime: '更新时间'
  }

  // 特殊处理状态字段
  const formattedData = subjectList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'status') {
        value = value === 1 ? '启用' : '禁用'
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出产品数据
 */
export const exportProductData = (productList: any[]) => {
  const fieldMap = {
    id: 'ID',
    name: '产品名称',
    type: '产品类型',
    description: '产品描述',
    image: '产品图片',
    originalPrice: '原价',
    currentPrice: '现价',
    validity: '有效期(天)',
    courseCount: '课程次数',
    benefits: '权益说明',
    status: '状态',
    sortOrder: '排序',
    createTime: '创建时间'
  }

  // 特殊处理状态字段
  const formattedData = productList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'status') {
        value = value === 1 ? '上架' : '下架'
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}

/**
 * 导出课表数据
 */
export const exportScheduleData = (scheduleList: any[]) => {
  const fieldMap = {
    id: 'ID',
    courseTitle: '课程名称',
    coachName: '教练',
    venue: '上课地点',
    startTime: '开始时间',
    endTime: '结束时间',
    maxCapacity: '最大容量',
    currentCount: '当前预约人数',
    price: '价格',
    status: '状态',
    createTime: '创建时间'
  }

  // 特殊处理状态字段
  const formattedData = scheduleList.map(item => {
    const formattedItem: Record<string, any> = {}
    Object.keys(fieldMap).forEach(key => {
      let value = item[key]
      if (key === 'status') {
        const statusMap: Record<number, string> = {
          0: '已取消',
          1: '正常',
          2: '已满',
          3: '进行中',
          4: '已结束'
        }
        value = statusMap[value] || value
      } else {
        value = formatValue(value)
      }
      const fieldName = fieldMap[key as keyof typeof fieldMap]
      formattedItem[fieldName] = value
    })
    return formattedItem
  })

  const headers = Object.values(fieldMap)
  const data = formattedData.map(item => Object.values(item))

  return { headers, data }
}
