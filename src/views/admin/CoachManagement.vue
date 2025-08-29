<template>
  <div class="coach-management admin-page">
    <div class="page-container">
      <!-- 搜索和操作栏 -->
      <el-card class="search-card" shadow="hover">
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="教练姓名">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入教练姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="专业特长">
              <el-input
                v-model="searchForm.specialty"
                placeholder="请输入专业特长"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 200px"
              >
                <el-option label="在职" :value="1" />
                <el-option label="离职" :value="0" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            新增教练
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出数据
          </el-button>
        </div>
      </el-card>

      <!-- 教练列表 -->
      <el-card class="list-card" shadow="hover">
        <el-table
          v-loading="loading"
          :data="coachList"
          stripe
          style="width: 100%"
          :max-height="600"
        >
          <el-table-column prop="id" label="ID" width="200" />
          <el-table-column prop="username" label="教练姓名" min-width="120" />
          <el-table-column prop="phone" label="手机号" min-width="130" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="specialty" label="专业领域" min-width="150" />
          <el-table-column prop="hourlyRate" label="时薪" width="80">
            <template #default="{ row }">
              ¥{{ row.hourlyRate || 0 }}
            </template>
          </el-table-column>
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
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '在职' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="入职时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
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
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>

      <!-- 新增/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        @close="handleDialogClose"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="formRules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="教练姓名" prop="username">
                <el-input v-model="form.username" placeholder="请输入教练姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-select v-model="form.gender" placeholder="请选择性别">
                  <el-option label="未知" :value="0" />
                  <el-option label="男" :value="1" />
                  <el-option label="女" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="生日">
                <el-date-picker
                  v-model="form.birthday"
                  type="date"
                  placeholder="请选择生日"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="时薪" prop="hourlyRate">
                <el-input-number
                  v-model="form.hourlyRate"
                  :min="0"
                  :precision="2"
                  placeholder="请输入时薪"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="专业领域" prop="specialty">
            <el-input v-model="form.specialty" placeholder="请输入专业领域" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">在职</el-radio>
              <el-radio :label="0">离职</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { ApiError } from '../../../generated/core/ApiError'
import { formatDateTime } from '@/utils/dateUtils'
import { Permission } from '@/utils/permission'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { exportToExcel, exportCoachData } from '@/utils/exportUtils'

// 错误处理函数
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  if (error instanceof ApiError) {
    ElMessage.error(error.message || '操作失败')
  } else {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  email: '',
  userType: 'coach', // 固定为coach类型，查询教练
  specialty: '',
  status: undefined as number | undefined
})

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 教练列表
const coachList = ref<any[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  username: '' as string,
  phone: '' as string,
  email: '' as string,
  avatar: '' as string,
  gender: 0 as number,
  birthday: '' as string,
  address: '' as string,
  userType: 'coach' as string, // 固定为coach类型
  memberLevel: '' as string,
  specialty: '' as string,
  hourlyRate: undefined as number | undefined,
  status: 1 as number
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入教练姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  specialty: [
    { required: true, message: '请输入专业领域', trigger: 'blur' }
  ],
  hourlyRate: [
    { required: true, message: '请输入时薪', trigger: 'blur' }
  ]
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchCoachList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    email: '',
    userType: 'coach',
    specialty: '',
    status: undefined
  })
  pagination.current = 1
  fetchCoachList()
}

// 新增教练
const handleAdd = () => {
  dialogTitle.value = '新增教练'
  Object.assign(form, {
    id: undefined,
    username: '',
    phone: '',
    email: '',
    avatar: '',
    gender: 0,
    birthday: '',
    address: '',
    userType: 'coach',
    memberLevel: '',
    specialty: '',
    hourlyRate: undefined,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑教练
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑教练'
  Object.assign(form, {
    ...row,
    id: Number(row.id),
    hourlyRate: Number(row.hourlyRate || 0),
    status: Number(row.status)
  })
  dialogVisible.value = true
}

// 删除教练
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个教练吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 传递正确的对象格式
    await UserControllerService.deleteUser({ id: Number(row.id) })
    ElMessage.success('删除成功')
    fetchCoachList()
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
    '确定要导出教练数据到 Excel 文件吗？',
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
      pageSize: 20,
      userType: 'coach',
      username: searchForm.username,
      specialty: searchForm.specialty,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }

    const response = await UserControllerService.listUserByPage(params)
    if (response.data && response.data.records) {
      const { headers, data } = exportCoachData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `教练数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '教练列表'
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

// 分页事件处理函数
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchCoachList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchCoachList()
}

// 监听分页变化
watch(() => pagination.current, () => {
  fetchCoachList()
})

watch(() => pagination.pageSize, () => {
  pagination.current = 1
  fetchCoachList()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理生日日期格式
    let processedBirthday = form.birthday
    if (processedBirthday && !processedBirthday.includes(' ')) {
      processedBirthday = processedBirthday + ' 00:00:00'
    }

    if (form.id) {
      // 编辑教练
      const updateData = {
        ...form,
        id: Number(form.id),
        birthday: processedBirthday,
        hourlyRate: Number(form.hourlyRate),
        status: Number(form.status),
        userType: 'coach' // 确保用户类型为教练
      }
      await UserControllerService.updateUser(updateData)
      ElMessage.success('编辑成功')
    } else {
      // 新增教练
      const addData = {
        ...form,
        birthday: processedBirthday,
        hourlyRate: Number(form.hourlyRate),
        status: Number(form.status),
        userType: 'coach' // 确保用户类型为教练
      }
      await UserControllerService.addUser(addData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchCoachList()
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

// 获取教练列表
const fetchCoachList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      userType: 'coach', // 固定查询教练类型
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      email: searchForm.email || undefined,
      specialty: searchForm.specialty || undefined,
      status: searchForm.status
    }

    const response = await UserControllerService.listUserByPage(params)
    if (response.data) {
      coachList.value = response.data.records || []
      pagination.total = Number(response.data.total) || 0
    } else {
      coachList.value = []
      pagination.total = 0
    }
  } catch (error) {
    handleApiError(error)
    coachList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCoachList()
})
</script>

<style scoped>
.coach-management {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
</style> 