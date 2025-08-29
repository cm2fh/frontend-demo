<template>
  <div class="schedule-calendar">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      @eventClick="handleEventClick"
      @dateSelect="handleDateSelect"
      @datesSet="handleDatesSet"
    />

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="eventDialogVisible" title="课程详情" width="500px">
      <div v-if="selectedEvent">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程名称">
            {{ selectedEvent.title }}
          </el-descriptions-item>
          <el-descriptions-item label="教练">
            {{ selectedEvent.extendedProps.coach }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">
            {{ selectedEvent.extendedProps.venue }}
          </el-descriptions-item>
          <el-descriptions-item label="容量">
            {{ selectedEvent.extendedProps.capacity }}
          </el-descriptions-item>
          <el-descriptions-item label="价格">
            ¥{{ selectedEvent.extendedProps.price || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedEvent.extendedProps.status)">
              {{ getStatusText(selectedEvent.extendedProps.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="eventDialogVisible = false">关闭</el-button>
        <el-button
          v-if="selectedEvent?.extendedProps.canReserve"
          type="primary"
          @click="handleReserve"
          :loading="reserveLoading"
        >
          立即预约
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'

interface ScheduleEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  extendedProps: {
    coach: string
    venue: string
    capacity: string
    status: number
    canReserve: boolean
    price?: number
  }
}

interface Props {
  events: ScheduleEvent[]
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  selectable?: boolean
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  initialView: 'timeGridWeek',
  selectable: true,
  height: 'auto'
})

const emit = defineEmits<{
  eventClick: [event: any]
  dateSelect: [selectInfo: any]
  reserve: [event: any]
  datesChange: [dateInfo: any]
}>()

const calendarRef = ref()
const eventDialogVisible = ref(false)
const selectedEvent = ref<any>(null)
const reserveLoading = ref(false)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  initialView: props.initialView,
  locale: zhCnLocale,
  events: props.events,
  selectable: props.selectable,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  slotMinTime: '08:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00', // 改为30分钟间隔，更精细
  slotLabelInterval: '01:00:00', // 标签仍然每小时显示
  height: props.height,
  allDaySlot: false,
  nowIndicator: true,
  scrollTime: '08:00:00', // 默认滚动到早上8点
  eventMinHeight: 20, // 最小事件高度
  eventShortHeight: 30, // 短事件高度
  expandRows: true, // 自动扩展行高
  slotEventOverlap: false, // 防止事件重叠
  eventContent: (arg: any) => {
    const event = arg.event
    const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60) // 分钟
    const isShort = duration <= 60 // 小于等于1小时为短事件

    return {
      html: `
        <div class="custom-schedule-event ${isShort ? 'short-event' : 'long-event'}">
          <div class="event-time">${formatEventTime(event.start, event.end)}</div>
          <div class="event-title">${event.title}</div>
          ${!isShort ? `<div class="event-coach"><i class="el-icon-user"></i> ${event.extendedProps.coach}</div>` : ''}
          <div class="event-info">
            <span class="event-capacity"><i class="el-icon-group"></i> ${event.extendedProps.capacity}</span>
            ${!isShort ? `<span class="event-price">¥${event.extendedProps.price || 0}</span>` : ''}
          </div>
        </div>
      `
    }
  },
  eventClassNames: (arg: any) => {
    const status = arg.event.extendedProps.status
    const canReserve = arg.event.extendedProps.canReserve
    return [
      `event-status-${status}`,
      canReserve ? 'event-reservable' : 'event-not-reservable'
    ]
  },
  eventMouseEnter: (info: any) => {
    // 鼠标悬停效果
    info.el.style.transform = 'scale(1.02)'
    info.el.style.zIndex = '999'
    info.el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
  },
  eventMouseLeave: (info: any) => {
    // 鼠标离开效果
    info.el.style.transform = 'scale(1)'
    info.el.style.zIndex = 'auto'
    info.el.style.boxShadow = 'none'
  }
}))

// 格式化事件时间显示
const formatEventTime = (start: string, end: string) => {
  const startTime = new Date(start).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const endTime = new Date(end).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  return `${startTime}-${endTime}`
}

const handleEventClick = (clickInfo: any) => {
  selectedEvent.value = clickInfo.event
  eventDialogVisible.value = true
  emit('eventClick', clickInfo)
}

const handleDateSelect = (selectInfo: any) => {
  emit('dateSelect', selectInfo)
}

const handleDatesSet = (dateInfo: any) => {
  emit('datesChange', dateInfo)
}

const handleReserve = async () => {
  reserveLoading.value = true
  try {
    emit('reserve', selectedEvent.value)
    eventDialogVisible.value = false
  } finally {
    reserveLoading.value = false
  }
}

const getStatusType = (status: number) => {
  const types: { [key: number]: string } = {
    1: 'success',  // 可预约
    2: 'warning',  // 已满员
    3: 'danger',   // 已结束
    0: 'info'      // 已取消
  }
  return types[status] || 'info'
}

const getStatusText = (status: number) => {
  const texts: { [key: number]: string } = {
    1: '可预约',
    2: '已满员',
    3: '已结束',
    0: '已取消'
  }
  return texts[status] || '未知'
}

// 暴露方法给父组件
defineExpose({
  getApi: () => calendarRef.value?.getApi(),
  changeView: (viewName: string) => calendarRef.value?.getApi().changeView(viewName),
  gotoDate: (date: string) => calendarRef.value?.getApi().gotoDate(date),
  prev: () => calendarRef.value?.getApi().prev(),
  next: () => calendarRef.value?.getApi().next(),
  today: () => calendarRef.value?.getApi().today()
})
</script>

<style scoped>
.schedule-calendar {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.fc) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  border: none;
}

/* 头部工具栏优化 */
:deep(.fc-header-toolbar) {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0;
}

:deep(.fc-toolbar-title) {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

:deep(.fc-button-group .fc-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.fc-button-group .fc-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

:deep(.fc-button-group .fc-button-active) {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-color: rgba(255, 255, 255, 0.9);
}

/* 时间网格优化 */
:deep(.fc-timegrid) {
  border: none;
}

/* 时间槽高度和对齐 */
:deep(.fc-timegrid-slot) {
  height: 50px !important;
  min-height: 50px !important;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.fc-timegrid-slot-minor) {
  border-bottom: 1px dashed #f5f5f5;
}

:deep(.fc-timegrid-slot-lane) {
  height: 50px !important;
}

/* 时间轴标签样式优化 */
:deep(.fc-timegrid-axis) {
  width: 60px;
  background: #fafafa;
  border-right: 2px solid #e8e8e8;
}

:deep(.fc-timegrid-slot-label) {
  vertical-align: middle;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  padding: 0 8px;
}

/* 列头样式 */
:deep(.fc-col-header) {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

:deep(.fc-col-header-cell) {
  padding: 12px 8px;
  font-weight: 600;
  color: #495057;
}

/* 今日列高亮 */
:deep(.fc-day-today) {
  background-color: rgba(102, 194, 58, 0.05) !important;
}

:deep(.fc-timegrid-col.fc-day-today) {
  background-color: rgba(102, 194, 58, 0.03) !important;
}

/* 事件样式优化 */
:deep(.fc-event) {
  border: none !important;
  border-radius: 6px !important;
  margin: 1px 2px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
}

:deep(.fc-event:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px) !important;
}

:deep(.custom-schedule-event) {
  padding: 6px 8px;
  font-size: 12px;
  line-height: 1.3;
  border-radius: 6px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

:deep(.custom-schedule-event.short-event) {
  padding: 4px 6px;
  justify-content: center;
}

:deep(.event-time) {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
  opacity: 0.8;
}

:deep(.event-title) {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

:deep(.event-coach) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.event-info) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

:deep(.event-capacity) {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

:deep(.event-price) {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
}

/* 不同状态的事件样式 - 现代渐变设计 */
:deep(.event-status-1) {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%) !important;
  border-color: #67C23A !important;
}

:deep(.event-status-1.event-reservable) {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%) !important;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3) !important;
}

:deep(.event-status-1.event-reservable:hover) {
  background: linear-gradient(135deg, #85ce61 0%, #67C23A 100%) !important;
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.4) !important;
}

:deep(.event-status-2) {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%) !important;
  border-color: #E6A23C !important;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3) !important;
}

:deep(.event-status-3) {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%) !important;
  border-color: #F56C6C !important;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3) !important;
}

:deep(.event-status-0) {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%) !important;
  border-color: #909399 !important;
  opacity: 0.6;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3) !important;
}

/* 现在时间指示器 */
:deep(.fc-timegrid-now-indicator-line) {
  border-color: #ff4757;
  border-width: 2px;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.5);
}

:deep(.fc-timegrid-now-indicator-arrow) {
  border-color: #ff4757;
}

/* 滚动条样式 */
:deep(.fc-scroller) {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

:deep(.fc-scroller::-webkit-scrollbar) {
  width: 6px;
}

:deep(.fc-scroller::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.fc-scroller::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.fc-scroller::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  :deep(.fc-timegrid-axis) {
    width: 50px;
  }

  :deep(.custom-schedule-event) {
    padding: 4px 6px;
    font-size: 11px;
  }

  :deep(.event-title) {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .schedule-calendar {
    border-radius: 6px;
  }

  :deep(.fc-header-toolbar) {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.fc-button-group .fc-button) {
    padding: 6px 10px;
    font-size: 12px;
  }

  :deep(.fc-toolbar-title) {
    font-size: 18px;
  }

  :deep(.fc-timegrid-axis) {
    width: 40px;
  }

  :deep(.fc-timegrid-slot) {
    height: 40px !important;
    min-height: 40px !important;
  }

  :deep(.fc-timegrid-slot-lane) {
    height: 40px !important;
  }

  :deep(.custom-schedule-event) {
    padding: 3px 4px;
    font-size: 10px;
  }

  :deep(.event-title) {
    font-size: 11px;
    margin-bottom: 1px;
  }

  :deep(.event-time) {
    font-size: 9px;
  }

  :deep(.event-coach) {
    display: none;
  }

  :deep(.event-info) {
    font-size: 9px;
  }

  :deep(.event-price) {
    display: none;
  }
}

@media (max-width: 480px) {
  :deep(.fc-header-toolbar) {
    padding: 10px 12px;
  }

  :deep(.fc-toolbar-title) {
    font-size: 16px;
  }

  :deep(.fc-button-group .fc-button) {
    padding: 4px 8px;
    font-size: 11px;
  }

  :deep(.fc-timegrid-axis) {
    width: 35px;
  }

  :deep(.fc-timegrid-slot-label) {
    font-size: 10px;
    padding: 0 4px;
  }

  :deep(.custom-schedule-event) {
    padding: 2px 3px;
    font-size: 9px;
  }

  :deep(.event-title) {
    font-size: 10px;
  }

  :deep(.event-time) {
    font-size: 8px;
  }

  :deep(.event-capacity) {
    font-size: 8px;
  }
}
</style>
