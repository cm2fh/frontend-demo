<template>
  <div class="product-management admin-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="产品名称">
            <el-input v-model="searchForm.name" placeholder="请输入产品名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="产品类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 200px">
              <el-option label="课程套餐" value="course_package" />
              <el-option label="会员卡" value="membership" />
              <el-option label="私教课" value="private" />
              <el-option label="其他" value="other" />
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
          <el-button type="primary" @click="showAddDialog">
            <el-icon>
              <Plus />
            </el-icon>
            新增产品
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出产品
          </el-button>
        </PermissionGuard>
      </div>
    </el-card>

    <!-- 产品列表 -->
    <el-card class="list-card" shadow="hover">
      <el-table v-loading="loading" :data="productList" stripe style="width: 100%" :max-height="600">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="产品名称" min-width="25" />
        <el-table-column prop="type" label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="originalPrice" label="原价" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold;">
              ¥{{ row.originalPrice?.toFixed(2) || '0.00' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="currentPrice" label="价格" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">
              ¥{{ row.currentPrice?.toFixed(2) || '0.00' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="validity" label="有效期（天）" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="50">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <PermissionGuard :roles="['admin']">
                <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
                <el-button
                  :type="getToggleButtonType(row.status)"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  {{ getToggleButtonText(row.status) }}
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择产品类型" style="width: 100%" @change="handleProductTypeChange">
                <el-option label="课程套餐" value="course_package" />
                <el-option label="会员卡" value="membership" />
                <el-option label="私教课" value="private" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number v-model="form.originalPrice" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现价" prop="currentPrice">
              <el-input-number v-model="form.currentPrice" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期(天)" prop="validity">
              <el-input-number v-model="form.validity" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="上架" :value="1" />
                <el-option label="下架" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入产品描述"
          />
        </el-form-item>

        <el-form-item label="权益/说明" prop="benefits">
          <el-input
            v-model="form.benefits"
            type="textarea"
            :rows="3"
            placeholder="请输入权益/说明"
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
import { ProductControllerService } from '../../../generated'
import { FileControllerService } from '../../../generated'
import { ApiError } from '../../../generated'
import { formatDateTime } from '@/utils/dateUtils'
import { Permission, PermissionGuard } from '@/utils/permission'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { exportToExcel, exportProductData } from '@/utils/exportUtils'

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

// 类型定义
interface Product {
  id?: number
  name?: string
  description?: string
  type?: string
  image?: string
  originalPrice?: number
  currentPrice?: number
  validity?: number
  courseCount?: number
  benefits?: string
  status?: number
  sortOrder?: number
  createTime?: string
  updateTime?: string
}

// 响应式数据
const loading = ref(false)
const productList = ref<Product[]>([])

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  description: '',
  originalPrice: undefined as number | undefined,
  currentPrice: undefined as number | undefined,
  status: undefined as number | undefined
})

// 产品表单
const form = reactive<Product>({
  id: undefined,
  name: '',
  description: '',
  type: '',
  image: '',
  originalPrice: 0,
  currentPrice: 0,
  validity: 0,
  courseCount: 0,
  benefits: '',
  status: 1,
  sortOrder: 0
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  currentPrice: [{ required: true, message: '请输入现价', trigger: 'blur' }],
  validity: [{ required: true, message: '请输入有效期', trigger: 'blur' }]
}

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)

// 图片上传相关
const imageUrl = ref('')
const uploadLoading = ref(false)

// 获取产品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }

    const response = await ProductControllerService.listProductVoByPage(params)
    if (response.data) {
      productList.value = response.data.records || []
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
  fetchProductList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  pagination.current = 1
  fetchProductList()
}

// 分页变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchProductList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchProductList()
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加产品'
  resetForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: Product) => {
  isEdit.value = true
  dialogTitle.value = '编辑产品'
  Object.assign(form, row)
  imageUrl.value = row.image || ''
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    name: '',
    description: '',
    type: '',
    image: '',
    originalPrice: 0,
    currentPrice: 0,
    validity: 0,
    courseCount: 0,
    benefits: '',
    status: 1,
    sortOrder: 0
  })
  imageUrl.value = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await ProductControllerService.updateProduct(form)
      handleApiSuccess('更新成功')
    } else {
      await ProductControllerService.addProduct(form)
      handleApiSuccess('添加成功')
    }
    dialogVisible.value = false
    fetchProductList()
  } catch (error) {
    handleApiError(error)
  } finally {
    submitLoading.value = false
  }
}

// 删除产品
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个产品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await ProductControllerService.deleteProduct({ id })
    handleApiSuccess('删除成功')
    await fetchProductList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 图片上传
const uploadImageRequest = async (options: any) => {
  uploadLoading.value = true
  try {
    const uploadResponse = await FileControllerService.uploadFile(
      { biz: 'product' }, // UploadFileRequest参数
      { file: options.file as File } // requestBody参数
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
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
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
    0: '下架',
    1: '上架'
  }
  return statusMap[status] || '未知'
}

// 获取切换按钮文本
const getToggleButtonText = (status: number) => {
  return status === 1 ? '下架' : '上架'
}

// 获取切换按钮类型
const getToggleButtonType = (status: number) => {
  return status === 1 ? 'danger' : 'success'
}

// 获取产品类型标签类型
const getTypeType = (type: string) => {
  const typeMap: Record<string, string> = {
    'membership': 'primary',
    'course_package': 'success',
    'equipment': 'warning',
    'other': 'info'
  }
  return typeMap[type] || 'info'
}

// 获取产品类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'membership': '会员卡',
    'course_package': '课程包',
    'equipment': '健身器材',
    'other': '其他'
  }
  return typeMap[type] || '未知'
}

// 导出数据
const handleExport = () => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  ElMessageBox.confirm(
    '确定要导出产品数据到 Excel 文件吗？',
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
    const params = {
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }

    const response = await ProductControllerService.listProductVoByPage({
      ...params,
      current: 1,
      pageSize: 20
    })
    if (response.data && response.data.records) {
      const { headers, data } = exportProductData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `产品数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '产品列表'
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

// 产品类型变化处理
const handleProductTypeChange = (type: string) => {
  // 根据产品类型设置默认值
  switch (type) {
    case 'course_package':
      // 课程套餐默认设置
      form.validity = 90 // 3个月有效期
      form.courseCount = 10 // 默认10次课
      form.originalPrice = 1000
      form.currentPrice = 800
      form.benefits = '包含10次团课，适合初学者'
      break
    case 'membership':
      // 会员卡默认设置
      form.validity = 365 // 1年有效期
      form.courseCount = 0 // 会员卡不限次数
      form.originalPrice = 2000
      form.currentPrice = 1800
      form.benefits = '全年无限次团课，享受会员专属优惠'
      break
    case 'private':
      // 私教课默认设置
      form.validity = 60 // 2个月有效期
      form.courseCount = 1 // 单次私教
      form.originalPrice = 300
      form.currentPrice = 280
      form.benefits = '一对一私人教练指导，定制化训练方案'
      break
    case 'other':
      // 其他产品默认设置
      form.validity = 30 // 1个月有效期
      form.courseCount = 0
      form.originalPrice = 100
      form.currentPrice = 100
      form.benefits = '其他增值服务'
      break
    default:
      break
  }
}

// 查看产品
const handleView = (row: Product) => {
  ElMessage.info(`查看产品 ${row.name} 的详细信息`)
}

// 切换状态
const handleToggleStatus = async (row: Product) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  // 获取要执行的操作文本
  const action = getToggleButtonText(row.status ?? 0)
  // 计算新的状态值
  const newStatus = row.status === 1 ? 0 : 1

  try {
    await ElMessageBox.confirm(`确定要${action}产品"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用API更新状态
    await ProductControllerService.updateProduct({
      ...row,
      status: newStatus
    })

    ElMessage.success(`${action}成功`)
    fetchProductList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProductList()
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