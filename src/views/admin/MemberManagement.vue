<template>
  <div class="member-management admin-page">
    <div class="page-container">
      <!-- 搜索和操作栏 -->
      <el-card class="search-card" shadow="hover">
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="用户名">
              <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="会员等级">
              <el-select v-model="searchForm.memberLevel" placeholder="请选择会员等级" clearable style="width: 200px">
                <el-option
                  v-for="option in memberLevelOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
                <el-option label="正常" :value="1" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            新增会员
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出数据
          </el-button>
        </div>
      </el-card>

      <!-- 会员列表 -->
      <el-card class="list-card" shadow="hover">
        <el-table v-loading="loading" :data="memberList" stripe style="width: 100%" :max-height="600">
          <el-table-column prop="id" label="ID" width="210" />
          <el-table-column prop="username" label="用户名" min-width="140" />
          <el-table-column prop="phone" label="手机号" min-width="140" />
          <el-table-column prop="email" label="邮箱" min-width="210" />
          <el-table-column prop="memberLevel" label="会员等级" width="120">
            <template #default="{ row }">
              <el-tag :type="getMemberLevelType(getMemberLevelText(row.memberLevel))">
                {{ getMemberLevelText(row.memberLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="points" label="积分" width="100" />
          <el-table-column prop="balance" label="余额" width="110">
            <template #default="{ row }">
              ¥{{ row.balance?.toFixed(2) || '0.00' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="注册时间" min-width="200">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
        <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" placeholder="请输入用户名" />
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
              <el-form-item label="会员等级" prop="memberLevel">
                <el-select v-model="form.memberLevel" placeholder="请选择会员等级">
                  <el-option
                    v-for="option in memberLevelOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="头像URL">
            <el-input v-model="form.avatar" placeholder="请输入头像URL" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">正常</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { ApiError } from '../../../generated/core/ApiError'
import { formatDateTime } from '@/utils/dateUtils'
import { getMemberLevelType, getMemberLevelText, getMemberLevelOptions } from '@/utils/memberUtils'
import { Permission } from '@/utils/permission'
import { exportToExcel, exportMemberData } from '@/utils/exportUtils'

// 错误处理函数
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  if (error instanceof ApiError) {
    ElMessage.error(error.message || '操作失败')
  } else {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 会员等级选项
const memberLevelOptions = getMemberLevelOptions()

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  email: '',
  memberLevel: '',
  status: undefined as number | undefined
})

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 会员列表
const memberList = ref<any[]>([])
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
  userType: 'user' as string, // 固定为user类型
  memberLevel: '' as string,
  specialty: '' as string,
  hourlyRate: undefined as number | undefined,
  status: 1 as number
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  memberLevel: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
}


// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchMemberList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    email: '',
    memberLevel: '',
    status: undefined
  })
  pagination.current = 1
  fetchMemberList()
}

// 新增会员
const handleAdd = () => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  dialogTitle.value = '新增会员'
  Object.assign(form, {
    id: undefined,
    username: '',
    phone: '',
    email: '',
    avatar: '',
    gender: 0,
    birthday: '',
    address: '',
    userType: 'user',
    memberLevel: '',
    specialty: '',
    hourlyRate: undefined,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑会员
const handleEdit = (row: any) => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  dialogTitle.value = '编辑会员'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除会员
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await UserControllerService.deleteUser({ id: row.id })
    ElMessage.success('删除成功')
    await fetchMemberList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error)
    }
  }
}

// 分页事件处理函数 - 旧版本
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchMemberList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchMemberList()
}


// 监听分页变化
watch(() => pagination.current, () => {
  fetchMemberList()
})

watch(() => pagination.pageSize, () => {
  pagination.current = 1
  fetchMemberList()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理表单数据，确保日期格式正确
    const formData = { ...form }
    if (formData.birthday && formData.birthday.length === 10) {
      // 如果生日是 YYYY-MM-DD 格式，转换为 YYYY-MM-DD HH:mm:ss
      formData.birthday = formData.birthday + ' 00:00:00'
    }

    if (form.id) {
      // 编辑会员
      await UserControllerService.updateUser(formData)
      ElMessage.success('编辑成功')
    } else {
      // 新增会员
      await UserControllerService.addUser(formData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    await fetchMemberList()
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

// 导出数据
const handleExport = () => {
  if (!Permission.isAdmin()) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }

  ElMessageBox.confirm(
    '确定要导出会员数据到 Excel 文件吗？',
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
      userType: 'user',
      ...searchForm
    }

    const response = await UserControllerService.listUserByPage(params)
    if (response.data && response.data.records) {
      const { headers, data } = exportMemberData(response.data.records)

      const result = exportToExcel({
        data,
        headers,
        filename: `会员数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
        sheetName: '会员列表'
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

// 获取会员列表
const fetchMemberList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      userType: 'user',
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      email: searchForm.email || undefined,
      memberLevel: searchForm.memberLevel || undefined,
      status: searchForm.status
    }

    const response = await UserControllerService.listUserByPage(params)
    if (response.data) {
      memberList.value = response.data.records || []
      pagination.total = Number(response.data.total) || 0
    } else {
      memberList.value = []
      pagination.total = 0
    }
  } catch (error) {
    handleApiError(error)
    memberList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchMemberList()
})
</script>

<style scoped>
.member-management {
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