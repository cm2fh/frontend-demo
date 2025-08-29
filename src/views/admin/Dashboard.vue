<template>
  <div class="dashboard admin-page">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <div class="stat-icon member">
            <el-icon>
              <User />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalMembers }}</div>
            <div class="stat-label">总会员数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <div class="stat-icon coach">
            <el-icon>
              <Avatar />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalCoaches }}</div>
            <div class="stat-label">总教练数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <div class="stat-icon course">
            <el-icon>
              <Reading />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalCourses }}</div>
            <div class="stat-label">总课程数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <div class="stat-icon reservation">
            <el-icon>
              <Clock />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.todayReservations }}</div>
            <div class="stat-label">今日预约</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span class="select-label">预约趋势</span>
            <el-select v-model="reservationPeriod" size="default" @change="handlePeriodChange">
              <el-option label="最近7天" value="7" />
              <el-option label="最近30天" value="30" />
              <el-option label="最近90天" value="90" />
            </el-select>
          </div>
        </template>
        <div class="chart-container">
          <div ref="reservationChartRef" class="chart"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span class="select-label">收入统计</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="incomeChartRef" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>

    <!-- 第二行图表 -->
    <div class="charts-grid">
      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span>课程分类分布</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="categoryChartRef" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>

      <!-- 课程热度排行 -->
      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span>课程热度排行</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="courseRankingChartRef" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>

      <!-- 教练工作量统计 -->
      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span>教练工作量统计</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="coachWorkloadChartRef" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover" v-loading="chartsLoading">
        <template #header>
          <div class="card-header">
            <span>会员增长趋势</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="memberChartRef" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { UserControllerService } from '../../../generated/services/UserControllerService'
import { CourseControllerService } from '../../../generated/services/CourseControllerService'
import { OrderControllerService } from '../../../generated/services/OrderControllerService'
import { Avatar, Clock, Reading, User } from '@element-plus/icons-vue'
import { StatisticsControllerService } from '../../../generated/services/StatisticsControllerService'

// 图表引用
const reservationChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()
const memberChartRef = ref<HTMLElement>()
const courseRankingChartRef = ref<HTMLElement>()
const coachWorkloadChartRef = ref<HTMLElement>()

// 图表实例
let reservationChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null
let memberChart: echarts.ECharts | null = null
let courseRankingChart: echarts.ECharts | null = null
let coachWorkloadChart: echarts.ECharts | null = null

const reservationPeriod = ref('7')

// 统计数据
const stats = ref({
  totalMembers: 0,
  totalCoaches: 0,
  totalCourses: 0,
  totalReservations: 0,
  totalIncome: 0,
  todayReservations: 0
})

// 加载状态
const statsLoading = ref(false)
const chartsLoading = ref(false)

// 获取统计数据
const fetchStats = async () => {
  statsLoading.value = true
  try {
    // 首先尝试使用统计API获取概览数据
    const response = await StatisticsControllerService.getOverviewStatistics()

    if (response.data) {
      const data = response.data
      stats.value = {
        totalMembers: data.totalMembers || 0,
        totalCoaches: data.totalCoaches || 0,
        totalCourses: data.totalCourses || 0,
        totalReservations: data.totalReservations || 0,
        totalIncome: data.totalIncome || 0,
        todayReservations: data.todayReservations || 0
      }
    } else {
      // 如果统计API没有返回数据，使用备用方案
      await fetchStatsBackup()
    }
  } catch (error) {
    console.error('统计API失败:', error)

    // 显示警告信息
    const { ElMessage } = await import('element-plus')
    ElMessage.warning('统计API暂时不可用')

  } finally {
    statsLoading.value = false
  }
}

// 备用统计数据获取方案
const fetchStatsBackup = async () => {
  try {
    // 并行获取各项统计数据
    const [membersRes, coachesRes, coursesRes] = await Promise.all([
      UserControllerService.listUserVoByPage({ current: 1, pageSize: 1, userType: 'user' }),
      UserControllerService.listUserVoByPage({ current: 1, pageSize: 1, userType: 'coach' }),
      CourseControllerService.listCourseVoByPage({ current: 1, pageSize: 1, status: 1 })
    ])

    stats.value = {
      totalMembers: membersRes.data?.total || 0,
      totalCoaches: coachesRes.data?.total || 0,
      totalCourses: coursesRes.data?.total || 0,
      totalReservations: 0, // 暂时无法获取
      totalIncome: 0, // 暂时无法获取
      todayReservations: 0 // 暂时无法获取
    }
  } catch (error) {
    console.error('备用统计数据获取失败:', error)
    // 设置默认值
    stats.value = {
      totalMembers: 0,
      totalCoaches: 0,
      totalCourses: 0,
      totalReservations: 0,
      totalIncome: 0,
      todayReservations: 0
    }
  }
}

// 初始化预约趋势图表
const initReservationChart = () => {
  if (!reservationChartRef.value) return Promise.resolve()

  reservationChart = echarts.init(reservationChartRef.value)

  // 获取预约趋势数据
  const getReservationData = async () => {
    try {
      const days = parseInt(reservationPeriod.value)
      const response = await StatisticsControllerService.getReservationTrend(days)

      if (response.data) {
        const trendData = response.data
        const dates = trendData.map((item: any) => item.date)
        const counts = trendData.map((item: any) => item.value)

        const option = {
          title: {
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: dates
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: counts,
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.3
            },
            itemStyle: {
              color: '#409EFF'
            }
          }]
        }

        reservationChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取预约数据失败:', error)
      // 显示空数据图表
      const option = {
        title: {
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['暂无数据']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [0],
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
      reservationChart?.setOption(option)
    }
  }

  return getReservationData()
}

// 初始化课程分类分布图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return Promise.resolve()

  categoryChart = echarts.init(categoryChartRef.value)

  const getCategoryData = async () => {
    try {
      const response = await CourseControllerService.listCourseVoByPage({
        current: 1,
        pageSize: 100
      })

      if (response.data?.records) {
        const courses = response.data.records
        const categoryMap = new Map()

        courses.forEach((course: any) => {
          const categoryName = course.categoryName || '未分类'
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
        })

        const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value
        }))

        const option = {
          title: {
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [{
            name: '课程数量',
            type: 'pie',
            radius: '60%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        }

        categoryChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取课程分类数据失败:', error)
      // 显示空数据图表
      const option = {
        title: {
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [{
          name: '课程数量',
          type: 'pie',
          radius: '60%',
          data: [{ name: '暂无数据', value: 1 }],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      categoryChart?.setOption(option)
    }
  }

  return getCategoryData()
}

// 初始化收入统计图表
const initIncomeChart = () => {
  if (!incomeChartRef.value) return Promise.resolve()

  incomeChart = echarts.init(incomeChartRef.value)

  const getIncomeData = async () => {
    try {
      const response = await OrderControllerService.listOrderByPage({
        current: 1,
        pageSize: 100
      })

      if (response.data?.records) {
        const orders = response.data.records
        const monthlyIncome = new Array(12).fill(0)

        orders.forEach((order: any) => {
          if (order.createTime) {
            const month = new Date(order.createTime).getMonth()
            monthlyIncome[month] += order.finalAmount || 0
          }
        })

        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

        const option = {
          title: {
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: months
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: monthlyIncome,
            type: 'bar',
            itemStyle: {
              color: '#67C23A'
            }
          }]
        }

        incomeChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取收入数据失败:', error)
      // 显示空数据图表
      const option = {
        title: {
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: new Array(12).fill(0),
          type: 'bar',
          itemStyle: {
            color: '#67C23A'
          }
        }]
      }
      incomeChart?.setOption(option)
    }
  }

  return getIncomeData()
}

// 初始化会员增长图表
const initMemberChart = () => {
  if (!memberChartRef.value) return Promise.resolve()

  memberChart = echarts.init(memberChartRef.value)

  const getMemberData = async () => {
    try {
      const response = await UserControllerService.listUserByPage({
        current: 1,
        pageSize: 100,
        userType: 'user' // 只查询会员用户
      })

      if (response.data?.records) {
        const users = response.data.records.filter((u: any) => u.userType === 'user')
        const monthlyMembers = new Array(12).fill(0)

        users.forEach((user: any) => {
          if (user.createTime) {
            const month = new Date(user.createTime).getMonth()
            monthlyMembers[month]++
          }
        })

        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

        const option = {
          title: {
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: months
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: monthlyMembers,
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.3
            },
            itemStyle: {
              color: '#E6A23C'
            }
          }]
        }

        memberChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取会员数据失败:', error)
      // 显示空数据图表
      const option = {
        title: {
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: new Array(12).fill(0),
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            color: '#E6A23C'
          }
        }]
      }
      memberChart?.setOption(option)
    }
  }

  return getMemberData()
}

// 初始化课程排行图表
const initCourseRankingChart = async () => {
  if (courseRankingChartRef.value) {
    courseRankingChart = echarts.init(courseRankingChartRef.value)

    try {
      const response = await StatisticsControllerService.getCourseRanking(10)

      if (response.data) {
        const courseData = response.data
        const courseNames = courseData.map((item: any) => item.courseTitle)
        const reservationCounts = courseData.map((item: any) => item.reservationCount)

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            data: courseNames
          },
          series: [{
            type: 'bar',
            data: reservationCounts,
            itemStyle: {
              color: '#67C23A'
            }
          }]
        }

        courseRankingChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取课程排行数据失败:', error)
    }
  }
}

// 初始化教练工作量图表
const initCoachWorkloadChart = async () => {
  if (coachWorkloadChartRef.value) {
    coachWorkloadChart = echarts.init(coachWorkloadChartRef.value)

    try {
      const response = await StatisticsControllerService.getCoachWorkload()

      if (response.data) {
        const workloadData = response.data
        const coachNames = workloadData.map((item: any) => item.coachName)
        const reservationCounts = workloadData.map((item: any) => item.reservationCount)
        const incomes = workloadData.map((item: any) => item.income || 0)

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999'
              }
            }
          },
          legend: {
            data: ['预约数', '收入']
          },
          xAxis: {
            type: 'category',
            data: coachNames,
            axisPointer: {
              type: 'shadow'
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '预约数',
              min: 0,
              axisLabel: {
                formatter: '{value}'
              }
            },
            {
              type: 'value',
              name: '收入',
              min: 0,
              axisLabel: {
                formatter: '{value}元'
              }
            }
          ],
          series: [
            {
              name: '预约数',
              type: 'bar',
              data: reservationCounts,
              itemStyle: {
                color: '#409EFF'
              }
            },
            {
              name: '收入',
              type: 'line',
              yAxisIndex: 1,
              data: incomes,
              itemStyle: {
                color: '#F56C6C'
              }
            }
          ]
        }

        coachWorkloadChart?.setOption(option)
      }
    } catch (error) {
      console.error('获取教练工作量数据失败:', error)
    }
  }
}

// 处理时间段变化
const handlePeriodChange = () => {
  // 重新获取预约趋势数据
  initReservationChart()
}

// 组件挂载时初始化
onMounted(() => {
  fetchStats()
  nextTick(() => {
    chartsLoading.value = true
    Promise.all([
      initReservationChart(),
      initCategoryChart(),
      initIncomeChart(),
      initMemberChart(),
      initCourseRankingChart(),
      initCoachWorkloadChart()
    ]).finally(() => {
      chartsLoading.value = false
    })
  })
})

// 组件卸载时销毁图表
onUnmounted(() => {
  reservationChart?.dispose()
  categoryChart?.dispose()
  incomeChart?.dispose()
  memberChart?.dispose()
  courseRankingChart?.dispose()
  coachWorkloadChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.stat-icon.member {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.coach {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.course {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.reservation {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 8px;
  white-space: nowrap;
}

.stat-label {
  font-size: 15px;
  color: #7f8c8d;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px 24px;
}

.chart {
  width: 100%;
  height: 100%;
}

.select-label {
  min-width: 100px;
  white-space: nowrap;
}

.el-select {
  flex: 1;
  max-width: 200px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-content {
    padding: 20px;
    gap: 16px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .stat-number {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .charts-grid {
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-content {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 28px;
  }

  .stat-label {
    font-size: 14px;
  }

  .chart-container {
    height: 280px;
    padding: 0 16px 16px;
  }

  .card-header {
    padding: 16px 16px 0;
  }
}

@media (max-width: 480px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .stat-info {
    text-align: center;
  }

  .chart-container {
    height: 250px;
  }
}
</style> 