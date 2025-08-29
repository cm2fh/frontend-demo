<template>
  <div class="review-view user-page">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.courseId"
              placeholder="请选择课程"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.title"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="评分">
            <el-select
              v-model="searchForm.rating"
              placeholder="请选择评分"
              clearable
              style="width: 150px"
            >
              <el-option label="5星" :value="5" />
              <el-option label="4星" :value="4" />
              <el-option label="3星" :value="3" />
              <el-option label="2星" :value="2" />
              <el-option label="1星" :value="1" />
            </el-select>
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

    <!-- 评价统计 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总评价数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon average">
            <el-icon>
              <Star />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.average.toFixed(1) }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon positive">
            <el-icon>
              <Star />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.positive }}</div>
            <div class="stat-label">好评数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon negative">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.negative }}</div>
            <div class="stat-label">差评数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 待评价课程 -->
    <el-card class="pending-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>待评价课程</span>
        </div>
      </template>

      <div v-if="pendingCourses.length === 0" class="empty-state">
        <el-empty description="暂无待评价的课程" />
      </div>

      <div v-else class="pending-list">
        <div
          v-for="course in pendingCourses"
          :key="course.id"
          class="pending-item"
        >
          <div class="course-info">
            <div class="course-title">{{ course.courseTitle }}</div>
            <div class="course-details">
              <span>教练：{{ course.coachName || '未知教练' }}</span>
              <span>时间：{{ formatScheduleTime(course.scheduleStartTime, course.scheduleEndTime) }}</span>
              <span>地点：{{ course.scheduleVenue || '未知地点' }}</span>
            </div>
          </div>
          <div class="course-actions">
            <el-button type="primary" @click="handleReview(course)">
              立即评价
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 评价列表 -->
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>我的评价</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="reviewList"
        stripe
        style="width: 100%"
        :max-height="600"
      >
        <el-table-column prop="id" label="评价编号" width="100" />
        <el-table-column prop="courseTitle" label="课程名称" min-width="100" />
        <el-table-column prop="coachName" label="教练" width="140" />
        <el-table-column prop="rating" label="评分" width="180">
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="评价时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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

    <!-- 评价对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="isEdit ? '编辑评价' : '课程评价'"
      width="600px"
    >
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewFormRules"
        label-width="100px"
      >
        <el-form-item label="课程名称">
          <el-input
            v-model="reviewForm.courseTitle"
            disabled
          />
        </el-form-item>

        <el-form-item label="教练">
          <el-input
            v-model="reviewForm.coachName"
            disabled
          />
        </el-form-item>

        <el-form-item label="上课时间">
          <el-input
            :value="formatScheduleTime(reviewForm.scheduleStartTime, reviewForm.scheduleEndTime)"
            disabled
          />
        </el-form-item>

        <el-form-item label="评分" prop="rating">
          <el-rate
            v-model="reviewForm.rating"
            show-score
            text-color="#ff9900"
            score-template="{value}"
          />
        </el-form-item>

        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="请分享您的学习体验和感受..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitLoading">
            {{ isEdit ? '更新评价' : '提交评价' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ChatDotRound, Star } from '@element-plus/icons-vue'
import { CourseReviewControllerService } from '../../../generated/services/CourseReviewControllerService'
import { ReservationControllerService } from '../../../generated/services/ReservationControllerService'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
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
  courseId: '',
  rating: '',
  dateRange: []
})

// 课程列表（用于搜索下拉框）
const courseList = ref<any[]>([])

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 数据列表
const reviewList = ref<any[]>([])
const pendingCourses = ref<any[]>([])
const loading = ref(false)

// 统计数据
const stats = reactive({
  total: 0,
  average: 0,
  positive: 0,
  negative: 0
})

// 对话框相关
const reviewDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const reviewFormRef = ref()

// 评价表单
const reviewForm = reactive({
  id: '',
  courseId: '',
  courseTitle: '',
  coachName: '',
  scheduleStartTime: null as Date | null,
  scheduleEndTime: null as Date | null,
  rating: 5,
  content: ''
})

// 表单验证规则
const reviewFormRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
  ]
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchReviewList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    courseId: '',
    rating: '',
    dateRange: []
  })
  pagination.current = 1
  fetchReviewList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchReviewList()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchReviewList()
}

// 评价课程
const handleReview = (course: any) => {
  isEdit.value = false
  Object.assign(reviewForm, {
    id: '',
    courseId: course.courseId,
    courseTitle: course.courseTitle,
    coachName: course.coachName || '未知教练',
    scheduleStartTime: course.scheduleStartTime ? new Date(course.scheduleStartTime) : null,
    scheduleEndTime: course.scheduleEndTime ? new Date(course.scheduleEndTime) : null,
    rating: 5,
    content: ''
  })
  reviewDialogVisible.value = true
}

// 编辑评价
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(reviewForm, {
    id: row.id,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    coachName: row.coachName || '未知教练',
    scheduleStartTime: row.scheduleStartTime ? new Date(row.scheduleStartTime) : null,
    scheduleEndTime: row.scheduleEndTime ? new Date(row.scheduleEndTime) : null,
    rating: row.rating,
    content: row.content
  })
  reviewDialogVisible.value = true
}

// 删除评价
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await CourseReviewControllerService.deleteCourseReview(row.id)

    handleApiSuccess('删除成功')
    fetchReviewList()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 提交评价
const submitReview = async () => {
  try {
    await reviewFormRef.value?.validate()

    submitLoading.value = true

    if (isEdit.value) {
      const updateData = {
        id: Number(reviewForm.id),
        rating: Number(reviewForm.rating),
        content: reviewForm.content
      }
      await CourseReviewControllerService.updateCourseReview(updateData)
      handleApiSuccess('评价更新成功')
    } else {
      const addData = {
        courseId: Number(reviewForm.courseId),
        rating: Number(reviewForm.rating),
        content: reviewForm.content
      }
      await CourseReviewControllerService.addCourseReview(addData)
      handleApiSuccess('评价提交成功')
    }

    reviewDialogVisible.value = false
    await fetchReviewList()
    await fetchPendingCourses()
    await fetchStats()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 获取评价列表
const fetchReviewList = async () => {
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

    if (searchForm.courseId && searchForm.courseId !== '') {
      params.courseId = Number(searchForm.courseId)
    }

    if (searchForm.rating !== '') {
      params.rating = parseInt(searchForm.rating as string)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    console.log('评价查询参数:', params)

    const response = await CourseReviewControllerService.listCourseReviewVoByPage(params)
    if (response.data?.records) {
      reviewList.value = response.data.records
      pagination.total = Number(response.data.total) || 0
    } else {
      reviewList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    reviewList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 获取待评价课程
const fetchPendingCourses = async () => {
  try {
    const params: any = {
      current: 1,
      pageSize: 20,
      status: 3 // 已完成状态
    }

    // 只有当用户已登录时才添加userId参数
    if (userStore.userInfo?.id) {
      params.userId = userStore.userInfo.id
    }

    const response = await ReservationControllerService.listReservationVoByPage(params)

    if (response.data?.records) {
      const completedReservations = response.data.records

      // 过滤出未评价的预约（基于预约ID而不是课程ID）
      const reviewedReservationIds = reviewList.value.map(review => review.reservationId)
      pendingCourses.value = completedReservations.filter((reservation: any) =>
        !reviewedReservationIds.includes(reservation.id)
      )
    } else {
      pendingCourses.value = []
    }
  } catch (error) {
    console.error('获取待评价课程失败:', error)
    pendingCourses.value = []
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const params: any = {
      current: 1,
      pageSize: 20
    }

    if (userStore.userInfo?.id) {
      params.memberId = userStore.userInfo.id
    }

    const response = await CourseReviewControllerService.listCourseReviewVoByPage(params)

    if (response.data?.records) {
      const reviews = response.data.records

      // 使用总数而不是当前页数据的长度
      stats.total = response.data.total || 0
      stats.average = reviews.length > 0
        ? Math.round((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length) * 10) / 10
        : 0
      stats.positive = reviews.filter((r: any) => r.rating >= 4).length
      stats.negative = reviews.filter((r: any) => r.rating <= 2).length
    } else {
      stats.total = 0
      stats.average = 0
      stats.positive = 0
      stats.negative = 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    stats.total = 0
    stats.average = 0
    stats.positive = 0
    stats.negative = 0
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  try {
    const response = await CourseControllerService.listCourse({
      status: 1 // 只获取上架的课程
    })
    if (response.data) {
      courseList.value = response.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  fetchCourseList()
  await fetchReviewList()  // 先获取评价列表
  fetchPendingCourses()    // 再获取待评价课程
  fetchStats()
})
</script>

<style scoped>
.user-page {
  padding: 0;
}

.search-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
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

.stat-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.average {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.positive {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.negative {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
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

/* 待评价卡片 */
.pending-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
}

.empty-state {
  padding: 40px 0;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.course-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.course-actions {
  flex-shrink: 0;
}

/* 列表卡片 */
.list-card {
  border: none;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

  .pending-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .course-details {
    flex-direction: column;
    gap: 4px;
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
</style> 