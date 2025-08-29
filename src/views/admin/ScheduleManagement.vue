<template>
  <div class="schedule-management admin-page">
    <!-- 搜索和操作栏 -->
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
          <el-form-item label="教练">
            <el-input
              v-model="searchForm.coachName"
              placeholder="请输入教练姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="上课地点">
            <el-input v-model="searchForm.venue" placeholder="请输入上课地点" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="已取消" :value="0" />
              <el-option label="正常" :value="1" />
              <el-option label="已满" :value="2" />
              <el-option label="进行中" :value="3" />
              <el-option label="已结束" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
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
          <el-button type="primary" @click="showAddDialog">
            <el-icon>
              <Plus />
            </el-icon>
            新增课表
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出课表
          </el-button>
        </PermissionGuard>
      </div>
    </el-card>

    <!-- 课表列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="scheduleList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="courseTitle" label="课程名称" min-width="140" />
        <el-table-column prop="coachName" label="教练" width="140" />
        <el-table-column prop="venue" label="上课地点" width="130" />
        <el-table-column prop="currentCount" label="已预约" width="100">
          <template #default="{ row }">
            {{ row.currentCount }}/{{ row.maxCapacity }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }" style="color: red;">
            <span style="color: #f56c6c; font-weight: bold;">
              ¥{{ row.price?.toFixed(2) || '0.00' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <PermissionGuard :roles="['admin']">
                <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
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
          <el-col :span="12">
            <el-form-item label="教练" prop="coachId">
              <el-select v-model="form.coachId" placeholder="请选择教练" style="width: 100%">
                <el-option
                  v-for="coach in filteredCoachList"
                  :key="coach.id"
                  :label="coach.username"
                  :value="coach.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上课地点" prop="venue">
              <el-input v-model="form.venue" placeholder="请输入上课地点" />
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
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大容量" prop="maxCapacity">
              <el-input-number v-model="form.maxCapacity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">取消</el-radio>
              </el-radio-group>
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
import { ScheduleControllerService } from '../../../generated/services/ScheduleControllerService'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { ApiError } from '../../../generated/core/ApiError'
import type { ScheduleVO } from '../../../generated/models/ScheduleVO'

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
import { formatDateTime } from '@/utils/dateUtils'
import { Permission, PermissionGuard } from '@/utils/permission'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { exportToExcel, exportScheduleData } from '@/utils/exportUtils'

// 类型定义
interface Schedule {
  id?: number
  courseId?: number
  courseTitle?: string
  coachId?: number
  venue?: string
  startTime?: string
  endTime?: string
  maxCapacity?: number
  currentCount?: number
  price?: number
  status?: number
  createTime?: string
  updateTime?: string
}

interface Course {
  id?: number
  title?: string
  categoryName?: string
}

interface Coach {
  id?: number
  username?: string
  userType?: string
}

// 响应式数据
const loading = ref(false)
const scheduleList = ref<ScheduleVO[]>([])
const courseList = ref<Course[]>([])
const coachList = ref<Coach[]>([])
const filteredCoachList = ref<Coach[]>([])

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  courseId: undefined as number | undefined,
  courseTitle: '',
  coachId: undefined as number | undefined,
  coachName: '',
  venue: '',
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
  price: undefined as number | undefined,
  status: undefined as number | undefined,
  notes: '',
  dateRange: [] as string[]
})

// 课表表单
const form = reactive<Schedule>({
  id: undefined,
  courseId: undefined,
  coachId: undefined,
  venue: '',
  startTime: '',
  endTime: '',
  maxCapacity: 20,
  currentCount: 0,
  price: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  venue: [{ required: true, message: '请输入场地', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  maxCapacity: [{ required: true, message: '请输入最大容量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)


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

// 获取教练列表
const fetchCoaches = async () => {
  try {
    const response = await UserControllerService.listUserByPage({
      current: 1,
      pageSize: 20,
      userType: 'coach'
    })
    if (response.data) {
      coachList.value = response.data.records || []
      // 初始化时显示所有教练
      filteredCoachList.value = [...coachList.value]
    }
  } catch (error) {
    console.error('获取教练列表失败:', error)
  }
}

// 获取课表列表
const fetchScheduleList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      courseTitle: searchForm.courseTitle || undefined,
      coachName: searchForm.coachName || undefined,
      venue: searchForm.venue,
      status: searchForm.status ? Number(searchForm.status) : undefined,
      startTime: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endTime: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    }

    const response = await ScheduleControllerService.listScheduleVoByPage(params)
    if (response.data) {
      scheduleList.value = response.data.records || []
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
  fetchScheduleList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    courseTitle: '',
    coachName: '',
    venue: '',
    status: '',
    dateRange: []
  })
  pagination.current = 1
  fetchScheduleList()
}

// 分页变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchScheduleList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchScheduleList()
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加课表'
  resetForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: ScheduleVO) => {
  isEdit.value = true
  dialogTitle.value = '编辑课表'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    courseId: undefined,
    coachId: undefined,
    venue: '',
    startTime: '',
    endTime: '',
    maxCapacity: 20,
    currentCount: 0,
    price: 0,
    status: 1
  })
  // 重置时显示所有教练
  filteredCoachList.value = [...coachList.value]
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await ScheduleControllerService.updateSchedule(form)
      handleApiSuccess('更新成功')
    } else {
      await ScheduleControllerService.addSchedule(form)
      handleApiSuccess('添加成功')
    }
    dialogVisible.value = false
    fetchScheduleList()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 删除课表
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个课表吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await ScheduleControllerService.deleteSchedule({ id })
    handleApiSuccess('删除成功')
    fetchScheduleList()
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
    '确定要导出课表数据到 Excel 文件吗？',
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
      courseId: searchForm.courseId ? Number(searchForm.courseId) : undefined,
      coachId: searchForm.coachId ? Number(searchForm.coachId) : undefined,
      venue: searchForm.venue,
      status: searchForm.status ? Number(searchForm.status) : undefined,
      startTime: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endTime: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    }

    const response = await ScheduleControllerService.listScheduleVoByPage({
      ...params,
      current: 1,
      pageSize: 20
    })
    if (response.data && response.data.records) {
      const { headers, data } = exportScheduleData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `课表数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '课表列表'
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

// 查看课表
const handleView = (row: ScheduleVO) => {
  ElMessage.info(`查看课表 ${row.courseTitle} 的详细信息`)
}

// 课程选择变化
const handleCourseChange = (courseId: number) => {
  const course = courseList.value.find(c => c.id === courseId)
  if (course) {
    form.price = (course as any).price ?? ''
    form.maxCapacity = (course as any).maxCapacity ?? ''
    
    // 根据课程的教练ID过滤教练列表
    const courseCoachId = (course as any).coachId
    if (courseCoachId) {
      filteredCoachList.value = coachList.value.filter(coach => coach.id === courseCoachId)
      // 如果当前选中的教练不是该课程的教练，则清空选择
      if (form.coachId && form.coachId !== courseCoachId) {
        form.coachId = undefined
      }
      // 如果只有一个教练，自动选中
      if (filteredCoachList.value.length === 1) {
        form.coachId = filteredCoachList.value[0].id
      }
    } else {
      // 如果课程没有指定教练，显示所有教练
      filteredCoachList.value = [...coachList.value]
    }
  } else {
    // 如果没有选中课程，显示所有教练
    filteredCoachList.value = [...coachList.value]
  }
}


// 获取状态标签类型
const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    0: 'danger',    // 已取消
    1: 'success',   // 正常
    2: 'warning',   // 已满
    3: 'primary',   // 进行中
    4: 'info'       // 已完成
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '已取消',
    1: '正常',
    2: '已满',
    3: '进行中',
    4: '已完成'
  }
  return statusMap[status] || '未知'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCourses()
  fetchCoaches()
  fetchScheduleList()
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