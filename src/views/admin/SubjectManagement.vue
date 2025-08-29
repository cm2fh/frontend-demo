<template>
  <div class="subject-management admin-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="科目名称">
            <el-input v-model="searchForm.name" placeholder="请输入科目名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
        <PermissionGuard :roles="['admin']">
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            新增科目
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出科目
          </el-button>
        </PermissionGuard>
      </div>
    </el-card>

    <!-- 科目列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="categoryList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="科目名称" min-width="100" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseCount" label="课程数量" width="120" />
        <el-table-column prop="createTime" label="创建时间" min-width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <PermissionGuard :roles="['admin']">
                <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button
                  :type="row.status === 1 ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="科目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入科目名称" />
        </el-form-item>

        <el-form-item label="科目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入科目描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
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
import { CourseCategoryControllerService } from '../../../generated/services/CourseCategoryControllerService'
import { FileControllerService } from '../../../generated/services/FileControllerService'
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

import { formatDateTime } from '@/utils/dateUtils'
import { Permission, PermissionGuard } from '@/utils/permission'
import { Search, Refresh, Plus, Download, Edit, Delete, View } from '@element-plus/icons-vue'
import { exportToExcel, exportSubjectData } from '@/utils/exportUtils'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined as number | undefined
})

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 科目列表
const categoryList = ref<any[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: '',
  image: '',
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入科目名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchCategoryList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, { name: '', status: undefined })
  pagination.current = 1
  fetchCategoryList()
}

// 新增科目
const handleAdd = () => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  dialogTitle.value = '新增科目'
  Object.assign(form, {
    id: '',
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑科目
const handleEdit = (row: any) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  dialogTitle.value = '编辑科目'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row: any) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  const action = row.status === 1 ? '禁用' : '启用'
  const newStatus = row.status === 1 ? 0 : 1

  try {
    await ElMessageBox.confirm(`确定要${action}科目"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用API更新状态
    await CourseCategoryControllerService.updateCourseCategory({
      ...row,
      status: newStatus
    })

    ElMessage.success(`${action}成功`)
    fetchCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 删除科目
const handleDelete = async (row: any) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  if (row.courseCount > 0) {
    ElMessage.warning('该科目下还有课程，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除科目"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用删除API
    await CourseCategoryControllerService.deleteCourseCategory({ id: row.id })
    ElMessage.success('删除成功')
    fetchCategoryList()
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
    '确定要导出科目数据到 Excel 文件吗？',
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
      name: searchForm.name,
      status: searchForm.status
    }

    const response = await CourseCategoryControllerService.listCourseCategory(params)
    if (response.data) {
      const { headers, data } = exportSubjectData(response.data)

      const result = exportToExcel({
        data,
        headers,
        filename: `科目数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '科目列表'
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

// 查看科目
const handleView = (row: any) => {
  ElMessage.info(`查看科目 ${row.name} 的详细信息`)
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchCategoryList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchCategoryList()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (form.id) {
      // 编辑科目
      const updateData = {
        ...form,
        id: Number(form.id),
        sortOrder: Number(form.sortOrder),
        status: Number(form.status)
      }
      await CourseCategoryControllerService.updateCourseCategory(updateData)
      ElMessage.success('编辑成功')
    } else {
      // 新增科目
      const addData = {
        ...form,
        sortOrder: Number(form.sortOrder),
        status: Number(form.status)
      }
      await CourseCategoryControllerService.addCourseCategory(addData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchCategoryList()
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

// 自定义图片上传
const handleImageUpload = async (options: any) => {
  const { file } = options
  try {
    const response = await FileControllerService.uploadFile(
      { biz: 'course_category' },
      { file }
    )
    if (response.data) {
      form.image = response.data
      ElMessage.success('图片上传成功')
    }
  } catch (error) {
    handleApiError(error)
  }
}

// 图片上传前验证
const beforeImageUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 获取科目列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      status: searchForm.status
    }

    const response = await CourseCategoryControllerService.listCourseCategoryVoByPage(params)
    if (response.data) {
      categoryList.value = response.data.records || []
      pagination.total = Number(response.data.total) || 0
    } else {
      categoryList.value = []
      pagination.total = 0
    }
  } catch (error) {
    handleApiError(error)
    categoryList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchCategoryList()
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
</style> 