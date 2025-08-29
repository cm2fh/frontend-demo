<template>
  <div class="reservation-view user-page">
    <div class="page-container">
      <!-- 搜索和筛选 -->
      <el-card class="search-card" shadow="hover">
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="课程">
              <el-input
                v-model="searchForm.courseTitle"
                placeholder="请输入课程名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="预约状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 200px"
              >
                <el-option label="已取消" :value="0" />
                <el-option label="已预约" :value="1" />
                <el-option label="已确认" :value="2" />
                <el-option label="已完成" :value="3" />
                <el-option label="未到场" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item label="预约时间">
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
      </el-card>

      <!-- 预约统计 -->
      <div class="stats-grid">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon>
                <Clock />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">已预约</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon confirmed">
              <el-icon>
                <Check />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.confirmed }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon>
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon cancelled">
              <el-icon>
                <Close />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.cancelled }}</div>
              <div class="stat-label">已取消</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 预约列表 -->
      <el-card class="list-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>我的预约</span>
            <el-button type="primary" @click="handleNewReservation">
              <el-icon>
                <Plus />
              </el-icon>
              新建预约
            </el-button>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="reservationList"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="预约编号" width="100" />
          <el-table-column prop="courseTitle" label="课程名称" min-width="150" />
          <el-table-column prop="coachName" label="教练" width="120" />
          <el-table-column prop="scheduleStartTime" label="上课时间" min-width="160">
            <template #default="{ row }">
              {{ formatScheduleTime(row.scheduleStartTime, row.scheduleEndTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="scheduleVenue" label="上课地点" width="120" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <div>
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
                <el-tag
                  v-if="row.status === 1 && row.payStatus === 0 && isPaymentTimeout(row)"
                  type="danger"
                  size="small"
                  style="margin-left: 5px;"
                >
                  支付超时
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <!-- 支付按钮：已预约且未支付时显示 -->
              <el-button
                v-if="row.status === 1 && row.payStatus === 0"
                type="warning"
                size="small"
                @click="handlePayment(row)"
                style="margin-right: 5px;"
              >
                立即支付
              </el-button>
              <!-- 取消预约按钮：已预约时显示 -->
              <el-button
                v-if="row.status === 1"
                type="danger"
                size="small"
                @click="handleCancel(row)"
                style="margin-right: 5px;"
              >
                取消预约
              </el-button>
              <!-- 签到按钮：已确认时显示 -->
              <el-button
                v-if="row.status === 2"
                type="success"
                size="small"
                @click="handleCheckIn(row)"
                style="margin-right: 5px;"
              >
                签到
              </el-button>
              <!-- 评价按钮：已完成时显示 -->
              <el-button
                v-if="row.status === 3"
                type="primary"
                size="small"
                @click="handleReview(row)"
                style="margin-right: 5px;"
              >
                评价
              </el-button>
              <!-- 详情按钮：始终显示 -->
              <el-button
                type="info"
                size="small"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
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

      <!-- 新建预约对话框 -->
      <el-dialog
        v-model="newReservationDialogVisible"
        title="新建预约"
        width="600px"
      >
        <el-form
          ref="reservationFormRef"
          :model="reservationForm"
          :rules="reservationFormRules"
          label-width="100px"
        >
          <el-form-item label="选择课程" prop="courseId">
            <el-select
              v-model="reservationForm.courseId"
              placeholder="请选择课程"
              style="width: 100%"
              @change="handleCourseChange"
            >
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.title"
                :value="course.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="选择时间" prop="scheduleId">
            <el-select
              v-model="reservationForm.scheduleId"
              placeholder="请选择上课时间"
              style="width: 100%"
              :disabled="!reservationForm.courseId"
            >
              <el-option
                v-for="schedule in availableSchedules"
                :key="schedule.id"
                :label="`${formatScheduleTime(schedule.startTime, schedule.endTime)} - ${schedule.coachName || '未知教练'} - ${schedule.venue || '未知地点'}`"
                :value="schedule.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="reservationForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（可选）"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="newReservationDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReservation" :loading="submitLoading">
              确认预约
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 预约详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="预约详情"
        width="500px"
      >
        <div v-if="selectedReservation" class="reservation-detail">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="预约编号">
              {{ selectedReservation.id }}
            </el-descriptions-item>
            <el-descriptions-item label="课程名称">
              {{ selectedReservation.courseTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="教练">
              {{ selectedReservation.coachName }}
            </el-descriptions-item>
            <el-descriptions-item label="上课时间">
              {{ formatScheduleTime(selectedReservation.scheduleStartTime, selectedReservation.scheduleEndTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="上课地点">
              {{ selectedReservation.scheduleVenue }}
            </el-descriptions-item>
            <el-descriptions-item label="课程价格">
              ¥{{ selectedReservation.price }}
            </el-descriptions-item>
            <el-descriptions-item label="预约状态">
              <el-tag :type="getStatusType(selectedReservation.status)">
                {{ getStatusText(selectedReservation.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="预约时间">
              {{ formatDateTime(selectedReservation.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedReservation.remark" label="备注">
              {{ selectedReservation.remark }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>

      <!-- 评价弹窗 -->
      <el-dialog
        v-model="reviewDialogVisible"
        title="课程评价"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="reviewFormRef"
          :model="reviewForm"
          :rules="reviewRules"
          label-width="80px"
        >
          <el-form-item label="课程名称">
            <el-input v-model="reviewForm.courseTitle" disabled />
          </el-form-item>

          <el-form-item label="评分" prop="rating">
            <el-rate
              v-model="reviewForm.rating"
              :max="5"
              show-text
              :texts="['极差', '失望', '一般', '满意', '惊喜']"
            />
          </el-form-item>

          <el-form-item label="评价内容" prop="content">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="4"
              placeholder="请分享您的上课体验..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="匿名评价">
            <el-switch
              v-model="reviewForm.isAnonymous"
              :active-value="1"
              :inactive-value="0"
              active-text="匿名"
              inactive-text="实名"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="reviewDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReview" :loading="reviewSubmitting">
              提交评价
            </el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="paymentDialogVisible"
        title="支付预约"
        width="500px"
        :close-on-click-modal="false"
      >
        <div v-if="currentPaymentReservation" class="payment-info">
          <el-descriptions title="预约信息" :column="1" border>
            <el-descriptions-item label="课程名称">
              {{ currentPaymentReservation.courseTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="教练">
              {{ currentPaymentReservation.coachName }}
            </el-descriptions-item>
            <el-descriptions-item label="支付金额">
              <span class="payment-amount">¥{{ currentPaymentReservation.price }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <div class="payment-methods" style="margin-top: 20px;">
            <h4>选择支付方式</h4>
            <el-radio-group v-model="paymentMethod" style="margin-top: 10px;">
              <el-radio value="alipay" size="large">
                <span style="margin-left: 8px;">支付宝</span>
              </el-radio>
              <el-radio value="wechat" size="large">
                <span style="margin-left: 8px;">微信支付</span>
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="paymentDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="confirmPayment"
              :loading="paymentSubmitting"
              :disabled="!paymentMethod"
            >
              确认支付
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Clock, Check, CircleCheck, Close } from '@element-plus/icons-vue'
import { ReservationControllerService } from '../../../generated/services/ReservationControllerService'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
import { ScheduleControllerService } from '../../../generated/services/ScheduleControllerService'
import { CourseReviewControllerService } from '../../../generated/services/CourseReviewControllerService'
import { ApiError } from '../../../generated/core/ApiError'

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

const handleApiSuccess = (message: string) => {
  ElMessage.success(message)
}
import { formatDateTime, formatScheduleTime } from '@/utils/dateUtils'
import { useUserStore } from '@/stores/user'

// 获取用户store
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  courseTitle: '', // 改为按课程标题搜索
  status: '',
  dateRange: []
})

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 数据列表
const reservationList = ref<any[]>([])
const courseList = ref<any[]>([])
const availableSchedules = ref<any[]>([])
const loading = ref(false)

// 统计数据
const stats = reactive({
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0
})

// 对话框相关
const newReservationDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedReservation = ref<any>(null)
const submitLoading = ref(false)
const reservationFormRef = ref()

// 评价弹窗
const reviewDialogVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewFormRef = ref()

// 评价表单
const reviewForm = reactive({
  reservationId: null as number | null,
  courseId: null as number | null,
  courseTitle: '',
  rating: 5,
  content: '',
  isAnonymous: 0
})

// 评价表单验证规则
const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
  ]
}

// 支付相关
const paymentDialogVisible = ref(false)
const paymentSubmitting = ref(false)
const currentPaymentReservation = ref<any>(null)
const paymentMethod = ref('mock')

// 预约表单
const reservationForm = reactive({
  courseId: '',
  scheduleId: '',
  remark: ''
})

// 表单验证规则
const reservationFormRules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  scheduleId: [
    { required: true, message: '请选择上课时间', trigger: 'change' }
  ]
}

// 获取状态类型
const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    0: 'danger',    // 已取消
    1: 'primary',   // 已预约
    2: 'success',   // 已确认
    3: 'info',      // 已完成
    4: 'warning'    // 未到场
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '已取消',
    1: '已预约',
    2: '已确认',
    3: '已完成',
    4: '未到场'
  }
  return statusMap[status] || '未知'
}

// 检查是否支付超时
const isPaymentTimeout = (reservation: any) => {
  if (!reservation.createTime || reservation.status !== 1 || reservation.payStatus !== 0) {
    return false
  }

  const createTime = new Date(reservation.createTime)
  const now = new Date()
  const diffMinutes = (now.getTime() - createTime.getTime()) / (1000 * 60)

  // 支付超时时间为30分钟
  return diffMinutes > 30
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchReservationList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    courseTitle: '',
    status: '',
    dateRange: []
  })
  pagination.current = 1
  fetchReservationList()
}

// 分页处理
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchReservationList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchReservationList()
}

// 监听分页变化
watch(() => pagination.current, () => {
  fetchReservationList()
})

watch(() => pagination.pageSize, () => {
  pagination.current = 1
  fetchReservationList()
})

// 新建预约
const handleNewReservation = () => {
  newReservationDialogVisible.value = true
  Object.assign(reservationForm, {
    courseId: '',
    scheduleId: '',
    remark: ''
  })
}

// 课程选择改变
const handleCourseChange = async (courseId: string) => {
  reservationForm.scheduleId = ''
  if (courseId) {
    await fetchAvailableSchedules(courseId)
  } else {
    availableSchedules.value = []
  }
}

// 提交预约
const submitReservation = async () => {
  try {
    await reservationFormRef.value?.validate()

    submitLoading.value = true

    const reservationData = {
      scheduleId: Number(reservationForm.scheduleId),
      notes: reservationForm.remark
    }

    await ReservationControllerService.addReservation(reservationData)

    handleApiSuccess('预约成功')
    newReservationDialogVisible.value = false
    fetchReservationList()
    fetchStats()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 处理支付
const handlePayment = (row: any) => {
  currentPaymentReservation.value = row
  paymentMethod.value = ''
  paymentDialogVisible.value = true
}

// 确认支付
const confirmPayment = async () => {
  if (!currentPaymentReservation.value || !paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  try {
    paymentSubmitting.value = true

    // 构造支付请求数据
    const paymentData = {
      payType: 'reservation',
      reservationId: currentPaymentReservation.value.id,
      amount: currentPaymentReservation.value.price,
      payMethod: paymentMethod.value
    }

    console.log('发起支付请求:', paymentData)

    // 直接调用后端支付接口
    const response = await fetch('/api/payment/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 如果需要认证，可以添加token
      },
      credentials: 'include', // 包含cookie用于会话认证
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()
    console.log('支付响应:', result)

    // 检查API调用是否成功 - 后端返回code: 200表示成功
    if (result.code === 200 || result.code === 0) {
      // 检查是否有success字段且为true，或者message为'操作成功'
      if (result.success === true || result.message === '操作成功') {
        handleApiSuccess(`支付成功！使用${getPayMethodName(paymentMethod.value)}支付，预约已自动确认`)
        paymentDialogVisible.value = false

        // 刷新列表和统计
        await fetchReservationList()
        await fetchStats()
      } else if (result.data) {
        // 检查data字段
        if (result.data === true || (typeof result.data === 'object' && result.data.success === true)) {
          handleApiSuccess(`支付成功！使用${getPayMethodName(paymentMethod.value)}支付，预约已自动确认`)
          paymentDialogVisible.value = false

          // 刷新列表和统计
          await fetchReservationList()
          await fetchStats()
        } else {
          // 支付失败，显示错误信息
          const errorMsg = (typeof result.data === 'object' && result.data.errorMessage)
            ? result.data.errorMessage
            : (typeof result.data === 'string' ? result.data : '支付失败')
          throw new Error(errorMsg)
        }
      } else {
        // 没有明确的成功标识，当作失败处理
        throw new Error(result.message || '支付失败')
      }
    } else {
      // API调用失败
      throw new Error(result.message || '支付请求失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    handleApiError(error)
  } finally {
    paymentSubmitting.value = false
  }
}

// 获取支付方式显示名称
const getPayMethodName = (method: string) => {
  const methodMap: { [key: string]: string } = {
    'alipay': '支付宝',
    'wechat': '微信支付'
  }
  return methodMap[method] || method
}

// 取消预约
const handleCancel = async (row: any) => {
  try {
    const { value: cancelReason } = await ElMessageBox.prompt(
      '确定要取消这个预约吗？请输入取消原因：',
      '取消预约',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入取消原因',
        inputPlaceholder: '请输入取消原因（如：临时有事、身体不适等）'
      }
    )

    await ReservationControllerService.cancelReservation({
      id: row.id,
      cancelReason: cancelReason
    })

    handleApiSuccess('取消成功')
    await fetchReservationList()
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 签到
const handleCheckIn = async (row: any) => {
  try {
    // 检查签到时间是否在有效范围内
    const now = new Date()

    await ElMessageBox.confirm('确定要签到吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 格式化签到时间为后端期望的格式
    const checkInTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0')

    // 调用专门的签到接口
    await ReservationControllerService.checkInReservation({
      id: row.id,
      checkInTime: checkInTime
    })

    handleApiSuccess('签到成功')
    await fetchReservationList()
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 评价
const handleReview = async (row: any) => {
  try {
    // 检查是否已经评价过
    const checkResponse = await CourseReviewControllerService.checkReviewExists(row.id)
    if (checkResponse.data) {
      ElMessage.warning('您已经评价过该课程了')
      return
    }

    // 设置评价表单数据
    Object.assign(reviewForm, {
      reservationId: row.id,
      courseId: row.courseId,
      courseTitle: row.courseTitle,
      rating: 5,
      content: '',
      isAnonymous: 0
    })

    reviewDialogVisible.value = true
  } catch (error) {
    handleApiError(error)
  }
}

// 提交评价
const submitReview = async () => {
  try {
    await reviewFormRef.value?.validate()

    reviewSubmitting.value = true

    const reviewData = {
      reservationId: reviewForm.reservationId,
      courseId: reviewForm.courseId,
      rating: reviewForm.rating,
      content: reviewForm.content,
      isAnonymous: reviewForm.isAnonymous
    }

    await CourseReviewControllerService.addCourseReview(reviewData)

    ElMessage.success('评价提交成功')
    reviewDialogVisible.value = false

    // 刷新预约列表
    await fetchReservationList()

  } catch (error) {
    handleApiError(error)
  } finally {
    reviewSubmitting.value = false
  }
}

// 查看详情
const handleDetail = (row: any) => {
  selectedReservation.value = row
  detailDialogVisible.value = true
}

// 获取预约列表
const fetchReservationList = async () => {
  try {
    loading.value = true

    const params: any = {
      current: pagination.current,
      pageSize: pagination.pageSize
    }

    // 只有当用户已登录时才添加memberId参数
    if (userStore.userInfo?.id) {
      params.memberId = userStore.userInfo.id
    }

    if (searchForm.courseTitle && searchForm.courseTitle.trim()) {
      params.courseTitle = searchForm.courseTitle.trim()
    }

    if (searchForm.status !== '') {
      params.status = parseInt(searchForm.status as string)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    console.log('预约查询参数:', params)

    const response = await ReservationControllerService.listReservationVoByPage(params)

    if (response.data?.records) {
      reservationList.value = response.data.records
      pagination.total = Number(response.data.total) || 0
    } else {
      reservationList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    reservationList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const params: any = {
      current: 1,
      pageSize: 20
    }

    // 只有当用户已登录时才添加memberId参数
    if (userStore.userInfo?.id) {
      params.memberId = userStore.userInfo.id
    }

    const response = await ReservationControllerService.listReservationVoByPage(params)

    if (response.data?.records) {
      const reservations = response.data.records

      stats.pending = reservations.filter((r: any) => r.status === 1).length  // 已预约
      stats.confirmed = reservations.filter((r: any) => r.status === 2).length  // 已确认
      stats.completed = reservations.filter((r: any) => r.status === 3).length  // 已完成
      stats.cancelled = reservations.filter((r: any) => r.status === 0).length  // 已取消
    } else {
      stats.pending = 0
      stats.confirmed = 0
      stats.completed = 0
      stats.cancelled = 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    stats.pending = 0
    stats.confirmed = 0
    stats.completed = 0
    stats.cancelled = 0
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  try {
    const params = {
      status: 1 // 只获取启用的课程
    }
    console.log('课程查询参数:', params)

    const response = await CourseControllerService.listCourse(params)
    if (response.data) {
      courseList.value = response.data
    } else {
      courseList.value = []
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    courseList.value = []
  }
}

// 获取可用时间表
const fetchAvailableSchedules = async (courseId: string) => {
  try {
    console.log('获取课程ID为', courseId, '的可用时间表')

    // 使用分页API获取课表VO（包含教练信息）
    const params = {
      current: 1,
      pageSize: 20,
      courseId: Number(courseId),
      status: 1 // 只获取正常状态的课表
    }

    const response = await ScheduleControllerService.listScheduleVoByPage(params)
    if (response.data && response.data.records) {
      const filteredSchedules = response.data.records.filter(schedule => {
        const currentCount = typeof schedule.currentCount === 'number' ? schedule.currentCount : 0
        const maxCapacity = typeof schedule.maxCapacity === 'number' ? schedule.maxCapacity : 0
        return currentCount < maxCapacity
      })
      availableSchedules.value = filteredSchedules
      console.log('找到', filteredSchedules.length, '个可用时间表')
    }
  } catch (error) {
    console.error('获取时间表失败:', error)
    availableSchedules.value = []
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchReservationList()
  fetchStats()
  fetchCourseList()
})
</script>

<style scoped>
.user-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 16px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ff9a56, #ff6b6b);
}

.stat-icon.confirmed {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.stat-icon.cancelled {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 列表卡片 */
.list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 分页样式 */
.pagination-wrapper {
  margin-top: 20px;
  padding: 20px;
  display: flex;
  justify-content: center;
  background: white;
  border-top: 1px solid #ebeef5;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.reservation-detail {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-content {
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 支付相关样式 */
.payment-amount {
  font-weight: 600;
  color: #e6a23c;
}

.payment-methods h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.payment-info {
  margin-bottom: 20px;
}
</style> 