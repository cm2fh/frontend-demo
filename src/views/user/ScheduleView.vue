<template>
  <div class="schedule-view user-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title-section">
        <div class="title-wrapper">
          <el-icon class="title-icon"><Calendar /></el-icon>
          <h1 class="page-title">我的课表</h1>
        </div>
        <p class="page-subtitle">查看您的预约课程安排</p>
      </div>

      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-number">{{ weeklyStats.total }}</div>
          <div class="stat-label">总预约</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number completed">{{ weeklyStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number upcoming">{{ weeklyStats.upcoming }}</div>
          <div class="stat-label">待上课</div>
        </div>
      </div>
    </div>

    <!-- 课表日历 -->
    <el-card class="schedule-card" shadow="hover">
      <ScheduleCalendar
        ref="calendarRef"
        :events="formattedEvents"
        :initial-view="'timeGridWeek'"
        :height="600"
        @event-click="handleEventClick"
        @reserve="handleReserve"
        @dates-change="handleDatesChange"
      />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import ScheduleCalendar from '@/components/common/ScheduleCalendar.vue'
import { ReservationControllerService } from '../../../generated'
import { ApiError } from '../../../generated'
import { useUserStore } from '@/stores/user'

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

// 用户存储
const userStore = useUserStore()

// 数据列表
const reservationList = ref<any[]>([])
const loading = ref(false)

// 日历引用
const calendarRef = ref()



// 获取预约状态颜色
const getReservationStatusColor = (status: number) => {
  const colors = {
    1: '#E6A23C', // 已预约 - 橙色
    2: '#409EFF', // 已确认 - 蓝色
    3: '#67C23A', // 已完成 - 绿色
    4: '#F56C6C', // 已取消 - 红色
    5: '#909399'  // 未到场 - 灰色
  }
  return colors[status as keyof typeof colors] || '#909399'
}

// 获取预约状态文本
const getReservationStatusText = (status: number) => {
  const statusTexts = {
    1: '已预约',
    2: '已确认',
    3: '已完成',
    4: '已取消',
    5: '未到场'
  }
  return statusTexts[status as keyof typeof statusTexts] || '未知状态'
}


// 格式化事件数据供FullCalendar使用
const formattedEvents = computed(() => {
  // 过滤掉已取消的预约记录（status = 0）
  return reservationList.value
    .filter(reservation => reservation.status !== 0)
    .map(reservation => ({
    id: reservation.id.toString(),
    title: reservation.courseTitle || '未知课程',
    start: reservation.scheduleStartTime,
    end: reservation.scheduleEndTime,
    backgroundColor: getReservationStatusColor(reservation.status),
    borderColor: getReservationStatusColor(reservation.status),
    extendedProps: {
      coach: reservation.coachName || '未知教练',
      venue: reservation.scheduleVenue || '未知地点',
      capacity: `预约状态: ${getReservationStatusText(reservation.status)}`, // 用预约状态替代容量
      status: reservation.status,
      canReserve: false, // 预约记录不能再次预约
      price: reservation.price || 0,
      reservationStatus: getReservationStatusText(reservation.status),
      payStatus: reservation.payStatus,
      checkInTime: reservation.checkInTime
    }
  }))
})

// 本周统计
const weeklyStats = computed(() => {
  const total = formattedEvents.value.length
  const completed = formattedEvents.value.filter(event => event.extendedProps.status === 3).length
  const upcoming = formattedEvents.value.filter(event => event.extendedProps.status === 1 || event.extendedProps.status === 2).length
  return { total, completed, upcoming }
})

// 事件处理方法
const handleEventClick = (clickInfo: any) => {
  console.log('Event clicked:', clickInfo.event)
}

const handleReserve = async () => {
  // 在用户课表页面，不允许预约操作
  ElMessage.info('这是您的预约记录，无法重复预约')
}

const handleDatesChange = (dateInfo: any) => {
  // 当日期范围改变时，可以根据需要重新获取数据
  console.log('Date range changed:', dateInfo)
}

// 获取用户预约列表
const fetchScheduleList = async () => {
  try {
    loading.value = true

    // 检查用户是否已登录
    if (!userStore.userInfo?.id) {
      ElMessage.warning('请先登录')
      return
    }

    // 获取用户的预约记录
    const params: any = {
      current: 1,
      pageSize: 20
    }

    const response = await ReservationControllerService.listReservationVoByPage(params)
    if (response.data && response.data.records) {
      reservationList.value = response.data.records
      console.log('获取到预约数据:', response.data.records.length, '条')
    } else {
      reservationList.value = []
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    handleApiError(error)
    reservationList.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchScheduleList()
})
</script>

<style scoped>
.schedule-view {
  padding: 24px;
}

/* 页面头部 */
.page-header {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title-section {
  flex: 1;
}

.title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.title-icon {
  font-size: 32px;
  margin-right: 12px;
  color: #409eff;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
  font-weight: 400;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  text-align: center;
  min-width: 60px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-number.completed {
  color: #67c23a;
}

.stat-number.upcoming {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e4e7ed;
}



/* 课表卡片 */
.schedule-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .schedule-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }

  .stats-section {
    justify-content: center;
  }

  .stat-divider {
    display: none;
  }

  .page-title {
    font-size: 24px;
  }

  .title-icon {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .schedule-view {
    padding: 12px;
  }

  .page-header {
    padding: 20px;
  }

  .page-title {
    font-size: 20px;
  }

  .title-icon {
    font-size: 24px;
  }

  .stat-number {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }
}
</style>