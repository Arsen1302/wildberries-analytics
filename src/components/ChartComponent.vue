<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <button 
          v-if="showFullscreen" 
          @click="toggleFullscreen" 
          class="chart-action-btn"
          :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'"
        >
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="chart-content" :class="{ 'fullscreen': isFullscreen }">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  PieController
} from 'chart.js'

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  PieController
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

interface Props {
  title: string
  data: ChartData
  type?: 'line' | 'bar' | 'pie'
  height?: number
  showFullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  height: 300,
  showFullscreen: true
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const isFullscreen = ref(false)
let chartInstance: ChartJS | null = null

const createChart = async () => {
  if (!chartCanvas.value) return

  // Уничтожаем предыдущий график если он существует
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const config = {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: props.title
        }
      },
      scales: props.type !== 'pie' ? {
        y: {
          beginAtZero: true
        }
      } : undefined
    }
  }

  chartInstance = new ChartJS(ctx, config)
}

onMounted(async () => {
  await nextTick()
  createChart()
})

// Обновляем график при изменении данных
watch(() => props.data, async () => {
  await nextTick()
  createChart()
}, { deep: true })

watch(() => props.type, async () => {
  await nextTick()
  createChart()
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }, 100)
}
</script>

<style scoped>
.chart-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.chart-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.chart-actions {
  display: flex;
  gap: var(--space-2);
}

.chart-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chart-action-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-200);
  color: var(--primary-600);
  transform: translateY(-1px);
}

.chart-action-btn svg {
  width: 16px;
  height: 16px;
}

.chart-content {
  padding: var(--space-6);
  position: relative;
  height: 400px;
}

.chart-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: var(--bg-primary);
  height: 100vh;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
}

.chart-content.fullscreen canvas {
  flex: 1;
  max-height: none !important;
  height: 100% !important;
}

canvas {
  max-height: 100%;
  width: 100% !important;
  height: 100% !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .chart-header {
    padding: var(--space-4) var(--space-4) var(--space-3) var(--space-4);
  }

  .chart-title {
    font-size: var(--font-size-lg);
  }

  .chart-content {
    padding: var(--space-4);
    height: 300px;
  }

  .chart-content.fullscreen {
    padding: var(--space-4);
  }

  .chart-action-btn {
    width: 32px;
    height: 32px;
  }

  .chart-action-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .chart-actions {
    align-self: flex-end;
  }

  .chart-content {
    height: 250px;
  }
}
</style>
