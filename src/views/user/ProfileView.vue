<template>
  <div class="profile-view user-page">
    <!-- 个人资料卡片 -->
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
          <el-button type="primary" @click="handleEdit" v-if="!isEditing">
            <el-icon>
              <Edit />
            </el-icon>
            编辑资料
          </el-button>
        </div>
      </template>

      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileFormRules"
        label-width="100px"
        :disabled="!isEditing"
      >
        <div class="profile-content">
          <!-- 头像上传 -->
          <div class="avatar-section">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="uploadAvatarRequest"
              :disabled="!isEditing"
            >
              <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
            <p class="avatar-tip">点击上传头像</p>
          </div>

          <!-- 基本信息 -->
          <div class="info-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="profileForm.username" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-select v-model="profileForm.gender" placeholder="请选择性别" style="width: 100%">
                    <el-option label="男" :value="1" />
                    <el-option label="女" :value="2" />
                    <el-option label="未知" :value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="生日" prop="birthday">
                  <el-date-picker
                    v-model="profileForm.birthday"
                    type="date"
                    placeholder="选择生日"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="会员等级">
                  <el-tag :type="getMemberLevelType(getMemberLevelText(profileForm.memberLevel))">
                    {{ getMemberLevelText(profileForm.memberLevel) }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="地址" prop="address">
              <el-input v-model="profileForm.address" placeholder="请输入地址" />
            </el-form-item>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions" v-if="isEditing">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 账户信息卡片 -->
    <el-card class="account-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>账户信息</span>
        </div>
      </template>

      <div class="account-info">
        <div class="info-item">
          <span class="label">账户余额：</span>
          <span class="value">¥{{ profileForm.balance || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="label">积分：</span>
          <span class="value">{{ profileForm.points || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="label">注册时间：</span>
          <span class="value">{{ formatDateTime(profileForm.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">最后更新：</span>
          <span class="value">{{ formatDateTime(profileForm.updateTime) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card class="password-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordFormRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Plus } from '@element-plus/icons-vue'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { FileControllerService } from '../../../generated/services/FileControllerService'
import { ApiError } from '../../../generated/core/ApiError'
import { OpenAPI } from '../../../generated/core/OpenAPI'
import { request as __request } from '../../../generated/core/request'
import { formatDateTime } from '@/utils/dateUtils'
import { getMemberLevelType, getMemberLevelText } from '@/utils/memberUtils'
import { useUserStore } from '@/stores/user'

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

const userStore = useUserStore()

// 表单引用
const profileFormRef = ref()
const passwordFormRef = ref()

// 编辑状态
const isEditing = ref(false)
const saveLoading = ref(false)
const passwordLoading = ref(false)

// 个人资料表单
const profileForm = reactive({
  id: '',
  username: '',
  phone: '',
  email: '',
  avatar: '',
  gender: 0,
  birthday: '',
  address: '',
  memberLevel: '',
  balance: 0,
  points: 0,
  createTime: '',
  updateTime: ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人资料表单验证规则
const profileFormRules = {
  username: [
    { message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
}

// 密码表单验证规则
const passwordFormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息（完整资料 + 非敏感概要）
const fetchUserInfo = async () => {
  try {
    // 个人资料（敏感字段）
    let profileRes: any
    if (typeof (UserControllerService as any).getMyProfile === 'function') {
      profileRes = await UserControllerService.getMyProfile()
    } else {
      // 运行时降级：直接请求接口
      profileRes = await __request(OpenAPI, { method: 'GET', url: '/user/profile' })
    }
    if (profileRes.data) {
      Object.assign(profileForm, profileRes.data)
    }
    // 非敏感概要（积分、余额、会员等级等）
    const loginRes = await UserControllerService.getLoginUser()
    if (loginRes.data) {
      profileForm.memberLevel = loginRes.data.memberLevel || ''
      profileForm.balance = loginRes.data.balance || 0
      profileForm.points = loginRes.data.points || 0
    }
  } catch (error) {
    handleApiError(error)
  }
}

// 自定义头像上传
const uploadAvatarRequest = async (options: any) => {
  try {
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', options.file as File)
    formData.append('biz', 'user_avatar')

    // 使用原生fetch发送multipart请求
    const response = await fetch('/api/file/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include' // 包含cookie用于身份验证
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('上传响应:', result) // 调试日志
    
    // 检查响应是否成功 - 兼容不同的成功状态码格式
    const isSuccess = result.code === 0 || result.code === 200 || result.success === true
    
    if (isSuccess) {
      // 成功情况
      if (result.data) {
        profileForm.avatar = result.data
        handleApiSuccess('头像上传成功')
        options.onSuccess && options.onSuccess(result)
      } else {
        // 成功但没有data，可能是其他成功情况
        handleApiSuccess(result.message || '头像上传成功')
        options.onSuccess && options.onSuccess(result)
      }
    } else {
      // 业务错误
      throw new Error(result.message || '上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    options.onError && options.onError(error)
    handleApiError(error)
  }
}

// 编辑资料
const handleEdit = () => {
  isEditing.value = true
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  // 重新获取用户信息，恢复原始数据
  fetchUserInfo()
}

// 保存资料
const handleSave = async () => {
  try {
    await profileFormRef.value?.validate()

    saveLoading.value = true

    const updateRequest = {
      phone: profileForm.phone,
      email: profileForm.email,
      avatar: profileForm.avatar,
      gender: profileForm.gender,
      birthday: profileForm.birthday ? `${profileForm.birthday} 00:00:00` : null,
      address: profileForm.address
    }

    await UserControllerService.updateMyUser(updateRequest)

    handleApiSuccess('保存成功')
    isEditing.value = false

    // 更新用户store中的信息
    await userStore.fetchUserInfo()
  } catch (error) {
    handleApiError(error)
  } finally {
    saveLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()

    passwordLoading.value = true

    await UserControllerService.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      checkPassword: passwordForm.confirmPassword
    })

    handleApiSuccess('密码修改成功')

    // 清空密码表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    handleApiError(error)
  } finally {
    passwordLoading.value = false
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt3M = file.size / 1024 / 1024 < 3

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
  }
  if (!isLt3M) {
    ElMessage.error('上传头像图片大小不能超过 3MB!')
  }
  return isImage && isLt3M
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-card {
  margin-bottom: 20px;
}

.account-card {
  margin-bottom: 20px;
}

.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.profile-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 6px;
  object-fit: cover;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.info-section {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.account-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.info-item .value {
  color: #303133;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 20px;
  }

  .avatar-section {
    align-self: center;
  }

  .account-info {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-item .label {
    min-width: auto;
  }
}
</style> 