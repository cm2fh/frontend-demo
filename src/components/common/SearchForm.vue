<template>
  <div class="search-form">
    <el-form :model="formData" inline>
      <el-form-item label="课程名称">
        <el-input
          v-model="formData.courseTitle"
          placeholder="请输入课程名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="教练">
        <el-input
          v-model="formData.coachName"
          placeholder="请输入教练姓名"
          clearable
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="formData.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="已取消" :value="0" />
          <el-option label="正常" :value="1" />
          <el-option label="已满" :value="2" />
          <el-option label="进行中" :value="3" />
          <el-option label="已结束" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

interface SearchFormData {
  courseTitle: string
  coachName: string
  date: string
  status: number | string
}

interface Props {
  modelValue: SearchFormData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchFormData]
  search: [formData: SearchFormData]
  reset: []
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleSearch = () => {
  emit('search', formData.value)
}

const handleReset = () => {
  const resetData: SearchFormData = {
    courseTitle: '',
    coachName: '',
    date: '',
    status: ''
  }
  emit('update:modelValue', resetData)
  emit('reset')
}
</script>

<style scoped>
.search-form {
  padding: 16px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .search-form .el-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }
  
  .search-form .el-input,
  .search-form .el-select,
  .search-form .el-date-picker {
    width: 100% !important;
  }
}
</style>
