<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Продажи</h1>
          <p class="page-description">Анализ продаж товаров</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="fetchSales" :disabled="loading">
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
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 1 1-4 0v-6m4 0V9a2 2 0 1 0-4 0v4.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalSales }}</div>
          <div class="stat-label">Всего продаж</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
          <div class="stat-label">Общая выручка</div>
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
          <div class="stat-value">{{ formatCurrency(averageSaleValue) }}</div>
          <div class="stat-label">Средний чек</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalDiscountAmount }}</div>
          <div class="stat-label">Общая скидка</div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <ChartComponent
        title="Динамика продаж по дням"
        :data="chartData"
        type="line"
      />
    </div>

    <div class="table-section">
      <DataTable
        :data="sales"
        :columns="tableColumns"
        :get-item-key="(item) => item.saleId"
      >
        <template #isSupply="{ value }">
          <span :class="['status-badge', value ? 'supply' : 'no-supply']">
            {{ value ? 'Поставка' : 'Без поставки' }}
          </span>
        </template>
        <template #isRealization="{ value }">
          <span :class="['status-badge', value ? 'realization' : 'no-realization']">
            {{ value ? 'Реализация' : 'Не реализовано' }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { wbApi, type SaleItem } from '@/api/wbApi'
import ChartComponent from '@/components/ChartComponent.vue'
import DataTable from '@/components/DataTable.vue'

const sales = ref<SaleItem[]>([])
const loading = ref(false)
const error = ref('')

const tableColumns = [
  { key: 'saleId', title: 'ID продажи', sortable: true, type: 'number' as const },
  { key: 'date', title: 'Дата', sortable: true, type: 'date' as const },
  { key: 'supplierArticle', title: 'Артикул поставщика', sortable: true, type: 'string' as const },
  { key: 'techSize', title: 'Размер', sortable: true, type: 'string' as const },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' as const },
  { key: 'totalPrice', title: 'Сумма', sortable: true, type: 'currency' as const },
  { key: 'discountPercent', title: 'Скидка %', sortable: true, type: 'number' as const },
  { key: 'isSupply', title: 'Поставка', sortable: true, type: 'string' as const },
  { key: 'isRealization', title: 'Реализация', sortable: true, type: 'string' as const },
  { key: 'orderId', title: 'ID заказа', sortable: true, type: 'number' as const },
  { key: 'promoCodeDiscount', title: 'Промокод скидка', sortable: true, type: 'currency' as const },
  { key: 'warehouseName', title: 'Склад', sortable: true, type: 'string' as const },
  { key: 'countryName', title: 'Страна', sortable: true, type: 'string' as const },
  { key: 'regionName', title: 'Регион', sortable: true, type: 'string' as const },
  { key: 'nmId', title: 'Номенклатура', sortable: true, type: 'number' as const },
  { key: 'subject', title: 'Предмет', sortable: true, type: 'string' as const },
  { key: 'category', title: 'Категория', sortable: true, type: 'string' as const },
  { key: 'brand', title: 'Бренд', sortable: true, type: 'string' as const },
  { key: 'forPay', title: 'К доплате', sortable: true, type: 'currency' as const },
  { key: 'finishedPrice', title: 'Финальная цена', sortable: true, type: 'currency' as const }
]

const totalSales = computed(() => sales.value.length)

const totalRevenue = computed(() => {
  return sales.value.reduce((sum, item) => sum + (item.finishedPrice || 0), 0)
})

const averageSaleValue = computed(() => {
  if (totalSales.value === 0) return 0
  return totalRevenue.value / totalSales.value
})

const totalDiscountAmount = computed(() => {
  return sales.value.reduce((sum, item) => sum + (item.promoCodeDiscount || 0), 0)
})

const chartData = computed(() => {
  const dateGroups = sales.value.reduce((groups, item) => {
    const date = new Date(item.date).toLocaleDateString('ru-RU')
    if (!groups[date]) {
      groups[date] = { count: 0, revenue: 0 }
    }
    groups[date].count++
    groups[date].revenue += item.finishedPrice || 0
    return groups
  }, {} as Record<string, { count: number, revenue: number }>)

  const dates = Object.keys(dateGroups).sort((a, b) => {
    return new Date(a.split('.').reverse().join('-')).getTime() - 
           new Date(b.split('.').reverse().join('-')).getTime()
  })
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Количество продаж',
        data: dates.map(date => dateGroups[date].count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Выручка',
        data: dates.map(date => dateGroups[date].revenue),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        yAxisID: 'y1'
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

const fetchSales = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await wbApi.getSales({
      limit: 1000
    })
    sales.value = data
  } catch (err) {
    error.value = 'Ошибка при загрузке данных о продажах'
    console.error('Error fetching sales:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSales()
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
  background: linear-gradient(135deg, var(--warning-500), #d97706);
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

.status-badge.supply {
  background: var(--primary-50);
  color: var(--primary-700);
}

.status-badge.no-supply {
  background: #fef2f2;
  color: var(--error-500);
}

.status-badge.realization {
  background: #f0fdf4;
  color: #166534;
}

.status-badge.no-realization {
  background: #fef2f2;
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
