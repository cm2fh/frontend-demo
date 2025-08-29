<template>
  <div class="admin-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="会员">
            <el-input
              v-model="searchForm.memberName"
              placeholder="请输入会员姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="课程">
            <el-input
              v-model="searchForm.courseTitle"
              placeholder="请输入课程名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px;">
              <el-option label="已取消" :value="0" />
              <el-option label="已预约" :value="1" />
              <el-option label="已确认" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="未到场" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="支付状态">
            <el-select v-model="searchForm.payStatus" placeholder="请选择状态" clearable style="width: 200px;">
              <el-option label="未支付" :value="0" />
              <el-option label="已支付" :value="1" />
              <el-option label="已退款" :value="2" />
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
            导出预约
          </el-button>
        </PermissionGuard>
      </div>
    </el-card>

    <!-- 预约列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="reservationList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="memberName" label="会员姓名" width="150" />
        <el-table-column prop="courseTitle" label="课程名称" min-width="150" />
        <el-table-column prop="scheduleStartTime" label="上课时间" min-width="200">
          <template #default="{ row }">
            {{ formatScheduleTime(row.scheduleStartTime, row.scheduleEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduleVenue" label="上课地点" width="130" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="预约状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPayStatusType(row.payStatus)">
              {{ getPayStatusText(row.payStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="签到时间" min-width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <PermissionGuard :roles="['admin']">
                <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
                <el-button 
                  v-if="row.status === 1" 
                  type="success" 
                  size="small" 
                  @click="handleConfirm(row)"
                >
                  确认
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员" prop="memberId">
              <el-select v-model="form.memberId" placeholder="请选择会员" style="width: 100%"
                         @change="handleMemberChange">
                <el-option
                  v-for="member in memberList"
                  :key="member.id"
                  :label="member.username"
                  :value="member.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程" prop="courseId">
              <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%"
                         @change="handleCourseChange">
                <el-option
                  v-for="course in courseList"
                  :key="course.id"
                  :label="course.title"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课表" prop="scheduleId">
              <el-select v-model="form.scheduleId" placeholder="请选择课表" style="width: 100%"
                         @change="handleScheduleChange">
                <el-option
                  v-for="schedule in filteredScheduleList"
                  :key="schedule.id"
                  :label="`${formatTime(schedule.startTime ?? '')} - ${schedule.venue ?? ''}`"
                  :value="schedule.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付状态" prop="payStatus">
              <el-select v-model="form.payStatus" placeholder="请选择支付状态" style="width: 100%">
                <el-option label="未支付" :value="0" />
                <el-option label="已支付" :value="1" />
                <el-option label="已退款" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
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
import { ReservationControllerService } from '../../../generated/services/ReservationControllerService'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
import { ScheduleControllerService } from '../../../generated/services/ScheduleControllerService'
import { ApiError } from '../../../generated/core/ApiError'

// 错误处理函数
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  if (error instanceof ApiError) {
    ElMessage.error(error.message || '操作失败')
  } else {
    ElMessage.error('操作失败，请稍后重试')
  }
}

const handleApiSuccess = (message: string) => {
  ElMessage.success(message)
}
import { formatDateTime, formatScheduleTime } from '@/utils/dateUtils'
import { Permission, PermissionGuard } from '@/utils/permission'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { exportToExcel, exportReservationData } from '@/utils/exportUtils'

// 类型定义
interface Reservation {
  id?: number
  memberId?: number
  memberName?: string
  scheduleId?: number
  courseId?: number
  courseTitle?: string
  scheduleTime?: string
  venue?: string
  price?: number
  status?: number
  payStatus?: number
  createTime?: string
  updateTime?: string
}

interface Member {
  id?: number
  username?: string
  userType?: string
}

interface Schedule {
  id?: number
  courseTitle?: string
  startTime?: string
  endTime?: string
  venue?: string
}

interface Course {
  id?: number
  title?: string
  categoryName?: string
}

// 响应式数据
const loading = ref(false)
const reservationList = ref<Reservation[]>([])
const memberList = ref<Member[]>([])
const scheduleList = ref<Schedule[]>([])
const filteredScheduleList = ref<Schedule[]>([])
const courseList = ref<Course[]>([])

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  memberId: undefined as number | undefined,
  memberName: '',
  scheduleId: undefined as number | undefined,
  courseId: undefined as number | undefined,
  courseTitle: '',
  status: undefined as number | undefined,
  payStatus: undefined as number | undefined,
  payTime: undefined as string | undefined,
  cancelTime: undefined as string | undefined,
  checkInTime: undefined as string | undefined,
  dateRange: [] as string[]
})

// 预约表单
const form = reactive({
  id: undefined as number | undefined,
  memberId: undefined as number | undefined,
  scheduleId: undefined as number | undefined,
  courseId: undefined as number | undefined,
  price: 0 as number | undefined,
  status: 1 as number | undefined,
  payStatus: 0 as number | undefined,
  payTime: undefined as string | undefined,
  cancelTime: undefined as string | undefined,
  cancelReason: undefined as string | undefined,
  checkInTime: undefined as string | undefined,
  notes: undefined as string | undefined
})

// 表单验证规则
const formRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  scheduleId: [{ required: true, message: '请选择课表', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)

// 获取会员列表
const fetchMembers = async () => {
  try {
    const response = await UserControllerService.listUserByPage({
      current: 1,
      pageSize: 20,
      userType: 'user'
    })
    if (response.data) {
      memberList.value = response.data.records || []
    }
  } catch (error) {
    console.error('获取会员列表失败:', error)
  }
}

// 获取课表列表
const fetchSchedules = async () => {
  try {
    const response = await ScheduleControllerService.listScheduleByPage({
      current: 1,
      pageSize: 20
    })
    if (response.data) {
      scheduleList.value = response.data.records || []
      // 初始化时显示所有课表
      filteredScheduleList.value = [...scheduleList.value]
    }
  } catch (error) {
    console.error('获取课表列表失败:', error)
  }
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    const response = await CourseControllerService.listCourse({})
    if (response.data) {
      courseList.value = response.data || []
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 获取预约列表
const fetchReservationList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      memberName: searchForm.memberName || undefined,
      courseTitle: searchForm.courseTitle || undefined,
      scheduleId: searchForm.scheduleId !== undefined ? Number(searchForm.scheduleId) : undefined,
      status: searchForm.status !== undefined ? Number(searchForm.status) : undefined,
      payStatus: searchForm.payStatus !== undefined ? Number(searchForm.payStatus) : undefined,
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endDate: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    }

    const response = await ReservationControllerService.listReservationVoByPage(params)
    if (response.data) {
      reservationList.value = response.data.records || []
      pagination.total = Number(response.data.total) || 0
    }
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchReservationList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    memberName: '',
    courseTitle: '',
    scheduleId: undefined,
    status: undefined,
    payStatus: undefined,
    dateRange: []
  })
  pagination.current = 1
  fetchReservationList()
}

// 分页变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchReservationList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchReservationList()
}



// 显示编辑对话框
const showEditDialog = (row: Reservation) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }
  isEdit.value = true
  dialogTitle.value = '编辑预约'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    memberId: undefined,
    scheduleId: undefined,
    courseId: undefined,
    price: 0,
    status: 1,
    payStatus: 0
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await ReservationControllerService.updateReservation(form)
      handleApiSuccess('更新成功')
    } else {
      await ReservationControllerService.addReservation(form)
      handleApiSuccess('添加成功')
    }
    dialogVisible.value = false
    fetchReservationList()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 删除预约
const handleDelete = async (id: number) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除这个预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await ReservationControllerService.deleteReservation({ id })
    handleApiSuccess('删除成功')
    fetchReservationList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 确认预约
const handleConfirm = async (row: Reservation) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要确认预约"${row.memberName}"吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await ReservationControllerService.updateReservation({ ...row, status: 2 })
    handleApiSuccess('确认成功')
    fetchReservationList()
  } catch (error) {
    // 用户取消操作
  }
}

// 取消预约
const handleCancel = async (row: Reservation) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  try {
    const { value: cancelReason } = await ElMessageBox.prompt(
      `确定要取消预约"${row.memberName}"吗？请输入取消原因：`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入取消原因',
        inputPlaceholder: '请输入取消原因'
      }
    )

    await ReservationControllerService.cancelReservation({
      id: row.id,
      cancelReason: cancelReason
    })
    handleApiSuccess('取消成功')
    fetchReservationList()
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
    '确定要导出预约数据到 Excel 文件吗？',
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
      current: 1,
      pageSize: 20, // 限制数据量
      memberId: searchForm.memberId ? Number(searchForm.memberId) : undefined,
      courseId: searchForm.courseId ? Number(searchForm.courseId) : undefined,
      scheduleId: searchForm.scheduleId ? Number(searchForm.scheduleId) : undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined,
      payStatus: searchForm.payStatus ? Number(searchForm.payStatus) : undefined,
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endDate: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    }

    const response = await ReservationControllerService.listReservationVoByPage({
      ...params,
      pageSize: 20
    })
    if (response.data && response.data.records) {
      const { headers, data } = exportReservationData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `预约数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '预约列表'
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

// 查看预约
const handleView = (row: Reservation) => {
  ElMessage.info(`查看预约 ${row.memberName} 的详细信息`)
}

// 会员选择变化
const handleMemberChange = (memberId: number) => {
  // 可以根据会员信息设置默认值
}

// 课程选择变化
const handleCourseChange = (courseId: number) => {
  // 清空课表选择
  form.scheduleId = undefined
  
  if (courseId) {
    // 根据选中的课程过滤课表列表
    filteredScheduleList.value = scheduleList.value.filter(schedule => 
      (schedule as any).courseId === courseId
    )
    
    // 获取课程信息设置默认值
    const course = courseList.value.find(c => c.id === courseId)
    if (course) {
      form.price = (course as any).price || 0
    }
  } else {
    // 如果没有选中课程，显示所有课表
    filteredScheduleList.value = [...scheduleList.value]
  }
}

// 课表选择变化
const handleScheduleChange = (scheduleId: number) => {
  const schedule = scheduleList.value.find(s => s.id === scheduleId)
  if (schedule) {
    // 自动设置课程和价格
    const scheduleData = schedule as any
    if (scheduleData.courseId && scheduleData.courseId !== form.courseId) {
      form.courseId = scheduleData.courseId
    }
    if (scheduleData.price) {
      form.price = scheduleData.price
    }
    // 可以添加更多自动填充逻辑，如教练信息等
  }
}



// 获取状态标签类型
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

// 获取支付状态标签类型
const getPayStatusType = (payStatus: number) => {
  const payStatusMap: Record<number, string> = {
    0: 'warning',   // 未支付
    1: 'success',   // 已支付
    2: 'info'       // 已退款
  }
  return payStatusMap[payStatus] || 'info'
}

// 获取支付状态文本
const getPayStatusText = (payStatus: number) => {
  const payStatusMap: Record<number, string> = {
    0: '未支付',
    1: '已支付',
    2: '已退款'
  }
  return payStatusMap[payStatus] || '未知'
}

// 格式化时间（用于下拉选择显示）
const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMembers()
  fetchSchedules()
  fetchCourses()
  fetchReservationList()
})
</script>

<style scoped>
.admin-page {
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

.action-bar {
  display: flex;
  gap: 12px;
}

.list-card {
  border: none;
  border-radius: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.table-actions {
  display: flex;
  gap: 12px;
}
</style> 