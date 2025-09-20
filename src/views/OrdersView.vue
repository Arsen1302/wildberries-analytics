<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Заказы</h1>
          <p class="page-description">Анализ заказов покупателей</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="fetchOrders" :disabled="loading">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {{ loading ? 'Обновление...' : 'Обновить' }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">Всего заказов</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
          <div class="stat-label">Общая стоимость</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 0-7-2-7-5s2-5 7-5 7 2 7 5-2 5-7 5z"/>
            <path d="M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M21 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ averageOrderValue }}</div>
          <div class="stat-label">Средний чек</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ canceledOrders }}</div>
          <div class="stat-label">Отмененных заказов</div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <ChartComponent
        title="Заказы по регионам"
        :data="chartData"
        type="pie"
      />
    </div>

    <div class="table-section">
      <DataTable
        :data="orders"
        :columns="tableColumns"
        :get-item-key="(item) => item.orderId"
      >
        <template #isCancel="{ value }">
          <span :class="['status-badge', value ? 'canceled' : 'active']">
            {{ value ? 'Отменен' : 'Активен' }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { wbApi, type OrderItem } from '@/api/wbApi'
import ChartComponent from '@/components/ChartComponent.vue'
import DataTable from '@/components/DataTable.vue'

const orders = ref<OrderItem[]>([])
const loading = ref(false)
const error = ref('')

const tableColumns = [
  { key: 'orderId', title: 'ID заказа', sortable: true, type: 'number' as const },
  { key: 'date', title: 'Дата', sortable: true, type: 'date' as const },
  { key: 'supplierArticle', title: 'Артикул поставщика', sortable: true, type: 'string' as const },
  { key: 'techSize', title: 'Размер', sortable: true, type: 'string' as const },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' as const },
  { key: 'totalPrice', title: 'Сумма', sortable: true, type: 'currency' as const },
  { key: 'discountPercent', title: 'Скидка %', sortable: true, type: 'number' as const },
  { key: 'warehouseName', title: 'Склад', sortable: true, type: 'string' as const },
  { key: 'oblast', title: 'Область', sortable: true, type: 'string' as const },
  { key: 'nmId', title: 'Номенклатура', sortable: true, type: 'number' as const },
  { key: 'subject', title: 'Предмет', sortable: true, type: 'string' as const },
  { key: 'category', title: 'Категория', sortable: true, type: 'string' as const },
  { key: 'brand', title: 'Бренд', sortable: true, type: 'string' as const },
  { key: 'isCancel', title: 'Статус', sortable: true, type: 'string' as const }
]

const totalOrders = computed(() => orders.value.length)

const totalValue = computed(() => {
  return orders.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
})

const averageOrderValue = computed(() => {
  if (totalOrders.value === 0) return '0 ₽'
  return formatCurrency(totalValue.value / totalOrders.value)
})

const canceledOrders = computed(() => {
  return orders.value.filter(item => item.isCancel).length
})

const chartData = computed(() => {
  const regionGroups = orders.value.reduce((groups, item) => {
    const region = item.oblast || 'Не указан'
    if (!groups[region]) {
      groups[region] = 0
    }
    groups[region]++
    return groups
  }, {} as Record<string, number>)

  const regions = Object.keys(regionGroups)
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ]

  return {
    labels: regions,
    datasets: [
      {
        label: 'Количество заказов',
        data: regions.map(region => regionGroups[region]),
        backgroundColor: colors.slice(0, regions.length),
        borderColor: colors.slice(0, regions.length),
        borderWidth: 1
      }
    ]
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(value)
}

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await wbApi.getOrders({
      limit: 1000
    })
    orders.value = data
  } catch (err) {
    error.value = 'Ошибка при загрузке данных о заказах'
    console.error('Error fetching orders:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.page-header {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  padding: var(--space-6);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--line-height-tight);
}

.page-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.header-actions {
  flex-shrink: 0;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--space-2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: all var(--transition-normal);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--success-500);
  background: linear-gradient(135deg, var(--success-500), #059669);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.chart-section,
.table-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background: var(--primary-50);
  color: var(--primary-700);
}

.status-badge.canceled {
  background: var(--error-500);
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  color: var(--error-500);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .header-actions {
    align-self: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .stat-card {
    padding: var(--space-4);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-value {
    font-size: var(--font-size-xl);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }
}

@media (max-width: 480px) {
  .page-container {
    gap: var(--space-6);
  }

  .page-header {
    padding: var(--space-4);
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }

  .stat-content {
    text-align: center;
  }
}
</style>
