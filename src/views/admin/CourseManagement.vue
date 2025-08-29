<template>
  <div class="course-management admin-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程名称">
            <el-input v-model="searchForm.title" placeholder="请输入课程名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="课程分类">
            <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable style="width: 200px">
              <el-option
                v-for="category in categoryList"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
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

      <div class="action-bar">
        <el-button type="primary" @click="showAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新增课程
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 课程列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="courseList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="课程名称" min-width="100" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="coachName" label="教练" width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长/分" width="100">
          <template #default="{ row }">
            {{ row.duration }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="80">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)">
              {{ getDifficultyText(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isRecommend" label="推荐" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isRecommend === 1 ? 'warning' : ''">
              {{ row.isRecommend === 1 ? '推荐' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
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
            <el-form-item label="课程名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="category in categoryList"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="授课教练" prop="coachId">
              <el-select v-model="form.coachId" placeholder="请选择教练" style="width: 100%">
                <el-option
                  v-for="coach in coachList"
                  :key="coach.id"
                  :label="coach.username"
                  :value="coach.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程价格" prop="price">
              <el-input-number v-model="form.price" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程时长" prop="duration">
              <el-input-number v-model="form.duration" :min="1" style="width: 100%" />
              <span style="margin-left: 8px; color: #999;">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度等级" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="请选择难度" style="width: 100%">
                <el-option label="初级" :value="1" />
                <el-option label="中级" :value="2" />
                <el-option label="高级" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否推荐" prop="isRecommend">
              <el-radio-group v-model="form.isRecommend">
                <el-radio :label="1">推荐</el-radio>
                <el-radio :label="0">普通</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="uploadLoading || submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
import { CourseCategoryControllerService } from '../../../generated/services/CourseCategoryControllerService'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { FileControllerService } from '../../../generated/services/FileControllerService'
import { ApiError } from '../../../generated/core/ApiError'
import type { CourseVO } from '../../../generated/models/CourseVO'
import type { CourseCategory } from '../../../generated/models/CourseCategory'
import type { User } from '../../../generated/models/User'
import { formatDateTime } from '@/utils/dateUtils'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { exportToExcel, exportCourseData } from '@/utils/exportUtils'
import { Permission } from '@/utils/permission'

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

// 响应式数据
const loading = ref(false)
const courseList = ref<CourseVO[]>([])
const categoryList = ref<CourseCategory[]>([])
const coachList = ref<any[]>([])
const formRef = ref()

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  title: '',
  categoryId: undefined as number | undefined,
  coachId: undefined as number | undefined,
  difficulty: undefined as number | undefined,
  status: undefined as number | undefined,
  isRecommend: undefined as number | undefined
})

// 课程表单
const form = reactive<CourseVO>({
  id: undefined,
  title: '',
  description: '',
  categoryId: undefined,
  coachId: undefined,
  price: 0,
  duration: 60,
  difficulty: 1,
  status: 1,
  isRecommend: 0,
  image: ''
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择课程分类', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择授课教练', trigger: 'change' }],
  price: [{ required: true, message: '请输入课程价格', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入课程时长', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }]
}

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)

// 图片上传相关
const imageUrl = ref('')
const uploadLoading = ref(false)

// 获取课程分类列表
const fetchCategories = async () => {
  try {
    const response = await CourseCategoryControllerService.listEnableCourseCategory()
    if (response.code === 200) {
      categoryList.value = response.data || []
    } else {
      handleApiError(new Error(response.message))
    }
  } catch (error) {
    handleApiError(error)
  }
}

// 获取教练列表
const fetchCoaches = async () => {
  try {
    const response = await UserControllerService.listUserVoByPage({
      current: 1,
      pageSize: 20,
      userType: 'coach'
    })
    if (response.code === 200 && response.data?.records) {
      coachList.value = response.data.records
    } else {
      handleApiError(new Error(response.message))
    }
  } catch (error) {
    handleApiError(error)
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      title: searchForm.title || undefined,
      categoryId: searchForm.categoryId ? Number(searchForm.categoryId) : undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }

    const response = await CourseControllerService.listCourseVoByPage(params)
    if (response.data) {
      courseList.value = response.data.records || []
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
  fetchCourseList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    categoryId: '',
    status: ''
  })
  pagination.current = 1
  fetchCourseList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchCourseList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchCourseList()
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加课程'
  resetForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: CourseVO) => {
  isEdit.value = true
  dialogTitle.value = '编辑课程'
  Object.assign(form, row)
  imageUrl.value = row.image || ''
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    title: '',
    description: '',
    categoryId: undefined,
    coachId: undefined,
    price: 0,
    duration: 60,
    difficulty: 1,
    status: 1,
    isRecommend: 0,
    image: ''
  })
  imageUrl.value = ''

  // 清除表单验证
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const handleSubmit = async () => {
  // 先进行表单验证
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await CourseControllerService.updateCourse(form)
      handleApiSuccess('更新成功')
    } else {
      // 创建新课程时，移除id字段并处理undefined值
      const { id, ...addRequest } = form
      Object.keys(addRequest).forEach(key => {
        if (addRequest[key] === undefined) {
          addRequest[key] = null
        }
      })
      await CourseControllerService.addCourse(addRequest)
      handleApiSuccess('添加成功')
    }
    dialogVisible.value = false
    fetchCourseList()
  } catch (error: any) {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('validation')) {
      return
    }
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 删除课程
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await CourseControllerService.deleteCourse({ id })
    handleApiSuccess('删除成功')
    fetchCourseList()
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
    '确定要导出课程数据到 Excel 文件吗？',
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
      title: searchForm.title || undefined,
      categoryId: searchForm.categoryId ? Number(searchForm.categoryId) : undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }

    const response = await CourseControllerService.listCourseVoByPage({
      ...params,
      current: 1,
      pageSize: 20
    })
    if (response.data && response.data.records) {
      const { headers, data } = exportCourseData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `课程数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '课程列表'
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

// 图片上传
const handleImageUpload = async (file: File) => {
  uploadLoading.value = true
  try {
    const uploadResponse = await FileControllerService.uploadFile(
      { biz: 'course' }, // UploadFileRequest参数
      { file: file } // requestBody参数
    )
    if (uploadResponse.data) {
      imageUrl.value = uploadResponse.data
      form.image = uploadResponse.data
      handleApiSuccess('上传成功')
    }
  } catch (error) {
    handleApiError(error)
  } finally {
    uploadLoading.value = false
  }
}

// 图片上传前验证
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 3

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 3MB!')
    return false
  }
  return true
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    0: 'danger',
    1: 'success'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '禁用',
    1: '启用'
  }
  return statusMap[status] || '未知'
}

// 获取难度标签类型
const getDifficultyType = (difficulty: number) => {
  const difficultyMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return difficultyMap[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty: number) => {
  const difficultyMap: Record<number, string> = {
    1: '初级',
    2: '中级',
    3: '高级'
  }
  return difficultyMap[difficulty] || '未知'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
  fetchCoaches()
  fetchCourseList()
})
</script>

<style scoped>
.course-management {
  padding: 0;
  min-height: 100%;
}

.search-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-form {
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 16px;
  margin-right: 16px;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.search-form :deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

.action-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-bar .el-button {
  border-radius: 6px;
  font-weight: 500;
}

.list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.list-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.list-card :deep(.el-table th) {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
}

.list-card :deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

.list-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafbfc;
}

.list-card :deep(.el-table__body tr:hover > td) {
  background-color: #f0f9ff;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.pagination :deep(.el-pagination) {
  justify-content: center;
}

.pagination :deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  margin: 0 2px;
}

.pagination :deep(.el-pagination .el-pager li.is-active) {
  background-color: #409eff;
  color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 16px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e4e7ed;
}

.avatar-uploader .el-upload {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

/* 表格内容样式优化 */
.list-card :deep(.el-table .cell) {
  padding: 12px 8px;
}

.list-card :deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

.list-card :deep(.el-rate) {
  display: inline-flex;
  align-items: center;
}

/* 搜索表单响应式 */
@media (max-width: 768px) {
  .search-form :deep(.el-form-item) {
    margin-right: 0;
    width: 100%;
  }

  .search-form :deep(.el-form-item .el-input),
  .search-form :deep(.el-form-item .el-select) {
    width: 100%;
  }

  .action-bar {
    flex-direction: column;
  }

  .action-bar .el-button {
    width: 100%;
  }
}

/* 表格响应式 */
@media (max-width: 1200px) {
  .list-card :deep(.el-table) {
    font-size: 13px;
  }

  .list-card :deep(.el-table .cell) {
    padding: 8px 4px;
  }
}

/* 对话框响应式 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 16px;
  }
}
</style> 