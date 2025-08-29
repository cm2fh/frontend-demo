<template>
  <div class="sales-management admin-page">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon member">
            <el-icon>
              <ShoppingCart />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalOrders }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon coach">
            <el-icon>
              <Money />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">¥{{ stats.totalAmount?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">总金额</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon course">
            <el-icon>
              <Check />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.paidOrders }}</div>
            <div class="stat-label">已支付订单</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon reservation">
            <el-icon>
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">¥{{ stats.todayAmount?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">今日收入</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="会员">
            <el-input
              v-model="searchForm.memberName"
              placeholder="请输入会员姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="产品">
            <el-input
              v-model="searchForm.productName"
              placeholder="请输入产品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.orderStatus" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="已取消" :value="0" />
              <el-option label="待支付" :value="1" />
              <el-option label="已支付" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="已退款" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="下单时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon>
                <Refresh />
              </el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-bar">
        <PermissionGuard :roles="['admin']">
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出订单
          </el-button>
        </PermissionGuard>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="orderList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="memberName" label="会员姓名" width="140" />
        <el-table-column prop="productTitle" label="产品名称" min-width="140" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="originalAmount" label="原价" width="110">
          <template #default="{ row }">
            <span>¥{{ row.originalAmount?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="finalAmount" label="实付金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">
              ¥{{ row.finalAmount?.toFixed(2) || '0.00' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)">
              {{ getOrderStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" min-width="190">
          <template #default="{ row }">
            {{ formatDateTime(row.payTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="190">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <PermissionGuard :roles="['admin']">
                <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </PermissionGuard>
              <PermissionGuard :roles="['user']">
                <el-button type="info" size="small" @click="handleView(row)">查看</el-button>
              </PermissionGuard>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-show="!loading">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :page-sizes="[20]"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员" prop="memberId">
              <el-select v-model="form.memberId" placeholder="请选择会员" style="width: 100%"
                         @change="handleMemberChange">
                <el-option
                  v-for="member in memberOptions"
                  :key="member.id"
                  :label="member.username"
                  :value="member.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品" prop="productId">
              <el-select v-model="form.productId" placeholder="请选择产品" style="width: 100%"
                         @change="handleProductChange">
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价" prop="originalAmount">
              <el-input-number v-model="form.originalAmount" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠金额" prop="discountAmount">
              <el-input-number v-model="form.discountAmount" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实付金额" prop="finalAmount">
              <el-input-number v-model="form.finalAmount" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式" prop="payMethod">
              <el-select v-model="form.payMethod" placeholder="请选择支付方式" style="width: 100%">
                <el-option label="微信支付" value="wechat" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="现金" value="cash" />
                <el-option label="银行卡" value="card" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付状态" prop="paymentStatus">
              <el-select v-model="form.paymentStatus" placeholder="请选择状态" style="width: 100%">
                <el-option label="未支付" :value="0" />
                <el-option label="已支付" :value="1" />
                <el-option label="已退款" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态" prop="orderStatus">
              <el-select v-model="form.orderStatus" placeholder="请选择状态" style="width: 100%">
                <el-option label="待确认" :value="0" />
                <el-option label="已确认" :value="1" />
                <el-option label="已完成" :value="2" />
                <el-option label="已取消" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OrderControllerService } from '../../../generated'
import { UserControllerService } from '../../../generated'
import { ProductControllerService } from '../../../generated'
import { ApiError } from '../../../generated'

import { formatDateTime } from '@/utils/dateUtils'
import { Permission, PermissionGuard } from '@/utils/permission'
import { Search, Refresh, Plus, Download, ShoppingCart, Money, TrendCharts, Check } from '@element-plus/icons-vue'
import { exportToExcel, exportSalesData } from '@/utils/exportUtils'

// 错误处理函数
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  let errorMessage = '操作失败，请稍后重试'

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

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  memberId: undefined as number | undefined,
  memberName: '',
  productId: undefined as number | undefined,
  productName: '',
  productType: undefined as number | undefined,
  amount: undefined as number | undefined,
  paymentStatus: undefined as number | undefined,
  orderStatus: undefined as number | undefined,
  paymentTime: undefined as string | undefined,
  completionTime: undefined as string | undefined,
  cancellationTime: undefined as string | undefined,
  dateRange: [] as string[]
})

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 销售统计
const stats = reactive({
  totalOrders: 0,
  totalAmount: 0,
  paidOrders: 0,
  todayAmount: 0
})

// 订单列表
const orderList = ref<any[]>([])
const loading = ref(false)

// 选项数据
const memberOptions = ref<any[]>([])
const productOptions = ref<any[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  memberId: undefined as number | undefined,
  productId: undefined as number | undefined,
  productType: undefined as number | undefined,
  productName: '',
  quantity: 1,
  originalAmount: 0,
  discountAmount: 0,
  finalAmount: 0,
  amount: 0, // 保持兼容性
  payMethod: '',
  paymentStatus: 0,
  orderStatus: 0,
  paymentTime: undefined as string | undefined,
  completionTime: undefined as string | undefined,
  cancellationTime: undefined as string | undefined,
  notes: ''
})

// 表单验证规则
const formRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入购买数量', trigger: 'blur' }],
  originalAmount: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  finalAmount: [{ required: true, message: '请输入实付金额', trigger: 'blur' }],
  payMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  paymentStatus: [{ required: true, message: '请选择支付状态', trigger: 'change' }],
  orderStatus: [{ required: true, message: '请选择订单状态', trigger: 'change' }]
}

// 获取支付状态类型
const getPayStatusType = (payStatus: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return typeMap[payStatus] || ''
}

// 获取支付状态文本
const getPayStatusText = (payStatus: number) => {
  const textMap: Record<number, string> = {
    0: '未支付',
    1: '已支付',
    2: '已退款'
  }
  return textMap[payStatus] || '未知'
}

// 获取订单状态类型
const getOrderStatusType = (orderStatus: number) => {
  const typeMap: Record<number, string> = {
    0: 'danger',    // 已取消
    1: 'warning',   // 待支付
    2: 'primary',   // 已支付
    3: 'success',   // 已完成
    4: 'info'       // 已退款
  }
  return typeMap[orderStatus] || ''
}

// 获取订单状态文本
const getOrderStatusText = (orderStatus: number) => {
  const textMap: Record<number, string> = {
    0: '已取消',
    1: '待支付',
    2: '已支付',
    3: '已完成',
    4: '已退款'
  }
  return textMap[orderStatus] || '未知'
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOrderList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    memberName: '',
    productName: '',
    paymentStatus: undefined,
    orderStatus: undefined,
    dateRange: []
  })
  pagination.current = 1
  fetchOrderList()
}



// 编辑订单
const handleEdit = (row: any) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  dialogTitle.value = '编辑订单'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除订单
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 传递正确的DeleteRequest格式
    await OrderControllerService.deleteOrder({ id: row.id })
    ElMessage.success('删除成功')
    fetchOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 导出数据
const handleExport = () => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  ElMessageBox.confirm(
    '确定要导出销售数据到 Excel 文件吗？',
    '导出确认',
    {
      confirmButtonText: '确定导出',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    exportExcel()
  }).catch(() => {
    // 用户取消操作
  })
}

// 导出 Excel
const exportExcel = async () => {
  try {
    // 获取所有数据用于导出
    const params = {
      // 注意：OrderQueryRequest不支持orderNo字段，暂时移除
      memberId: searchForm.memberId ? Number(searchForm.memberId) : undefined,
      productId: searchForm.productId ? Number(searchForm.productId) : undefined,
      paymentStatus: searchForm.paymentStatus ? Number(searchForm.paymentStatus) : undefined,
      orderStatus: searchForm.orderStatus ? Number(searchForm.orderStatus) : undefined
    }

    const response = await OrderControllerService.listOrderVoByPage({
      ...params,
      current: 1,
      pageSize: 20
    })
    if (response.data && response.data.records) {
      const { headers, data } = exportSalesData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `销售数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '销售列表'
      })

      if (result.success) {
        ElMessage.success('Excel导出成功')
      } else {
        ElMessage.error(result.message)
      }
    }
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('导出错误:', error)
  }
}

// 查看订单
const handleView = (row: any) => {
  ElMessage.info(`查看订单 ${row.orderNo} 的详细信息`)
}

// 会员选择变化
const handleMemberChange = (memberId: number) => {
  const member = memberOptions.value.find(m => m.id === memberId)
  if (member) {
    // 显示会员信息（可以在表单中添加显示区域）
    console.log('选择会员:', {
      name: member.username,
      level: (member as any).memberLevel,
      balance: (member as any).balance,
      points: (member as any).points
    })
    
    // 可以根据会员等级提供产品推荐或优惠
    // 例如：黄金会员可以享受折扣
    const memberLevel = (member as any).memberLevel
    if (memberLevel === 'gold' || memberLevel === 'diamond') {
      // 可以设置默认折扣
      form.discountAmount = form.originalAmount * 0.1 // 9折优惠
      form.finalAmount = form.originalAmount - form.discountAmount
    }
  }
}

// 产品选择变化
const handleProductChange = (productId: number) => {
  const product = productOptions.value.find(p => p.id === productId)
  if (product) {
    form.productName = product.name
    form.originalAmount = product.currentPrice
    form.finalAmount = product.currentPrice
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchOrderList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchOrderList()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const formData = {
      id: form.id ? Number(form.id) : undefined,
      memberId: Number(form.memberId),
      productId: Number(form.productId),
      productName: form.productName,
      quantity: form.quantity,
      originalAmount: form.originalAmount,
      discountAmount: form.discountAmount,
      finalAmount: form.finalAmount,
      payMethod: form.payMethod,
      paymentStatus: form.paymentStatus,
      orderStatus: form.orderStatus,
      paymentTime: form.paymentTime,
      notes: form.notes
    }

    if (form.id) {
      // 编辑订单
      await OrderControllerService.updateOrder(formData)
      ElMessage.success('编辑成功')
    } else {
      // 新增订单
      const { id, ...addData } = formData
      await OrderControllerService.addOrder(addData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo,
      memberName: searchForm.memberName || undefined,
      productName: searchForm.productName || undefined,
      paymentStatus: searchForm.paymentStatus !== undefined ? Number(searchForm.paymentStatus) : undefined,
      orderStatus: searchForm.orderStatus !== undefined ? Number(searchForm.orderStatus) : undefined,
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endDate: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    }

    const response = await OrderControllerService.listOrderVoByPage(params)
    if (response.data) {
      orderList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }

    // 更新统计数据
    await fetchStats()
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取总订单数和总金额
    const totalResponse = await OrderControllerService.listOrderVoByPage({ current: 1, pageSize: 1 })
    if (totalResponse.data) {
      stats.totalOrders = totalResponse.data.total || 0
    }

    // 获取已支付订单数
    const paidResponse = await OrderControllerService.listOrderVoByPage({
      current: 1,
      pageSize: 10,
      paymentStatus: 1
    })
    if (paidResponse.data) {
      stats.paidOrders = paidResponse.data.total || 0
    }

    // 获取今日收入（简化处理，实际应该根据日期过滤）
    const todayResponse = await OrderControllerService.listOrderVoByPage({
      current: 1,
      pageSize: 20,
      paymentStatus: 1
    })
    if (todayResponse.data && todayResponse.data.records) {
      const todayOrders = todayResponse.data.records.filter(order => {
        const orderDate = new Date(order.createTime || '').toDateString()
        const today = new Date().toDateString()
        return orderDate === today
      })
      stats.todayAmount = todayOrders.reduce((sum, order) => sum + (order.finalAmount || 0), 0)
    }

    // 计算总金额
    const allOrdersResponse = await OrderControllerService.listOrderVoByPage({
      current: 1,
      pageSize: 20,
      paymentStatus: 1
    })
    if (allOrdersResponse.data && allOrdersResponse.data.records) {
      stats.totalAmount = allOrdersResponse.data.records.reduce((sum, order) => sum + (order.finalAmount || 0), 0)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取会员选项
const fetchMemberOptions = async () => {
  try {
    const response = await UserControllerService.listUserByPage({
      current: 1,
      pageSize: 20,
      userType: 'user'
    })
    if (response.data) {
      memberOptions.value = response.data.records || []
    }
  } catch (error) {
    console.error('获取会员选项失败:', error)
  }
}

// 获取产品选项
const fetchProductOptions = async () => {
  try {
    const response = await ProductControllerService.listProduct({})
    if (response.data) {
      productOptions.value = response.data || []
    }
  } catch (error) {
    console.error('获取产品选项失败:', error)
  }
}

// 初始化
onMounted(() => {
  fetchOrderList()
  fetchMemberOptions()
  fetchProductOptions()
})
</script>

<style scoped>
.admin-page {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  background: #fff;
  color: white;
  text-align: center;
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.stat-icon.member {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.coach {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.course {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.reservation {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 15px;
  color: #7f8c8d;
  font-weight: 500;
}

.search-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
}

.search-form {
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.list-card {
  border: none;
  border-radius: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 