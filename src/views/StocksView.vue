<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Запасы</h1>
          <p class="page-description">Анализ остатков товаров на складах</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="fetchStocks" :disabled="loading">
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
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalItems }}</div>
          <div class="stat-label">Всего позиций</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <path d="M12 11h4"/>
            <path d="M12 16h4"/>
            <path d="M8 11h.01"/>
            <path d="M8 16h.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalQuantity }}</div>
          <div class="stat-label">Общее количество</div>
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
            <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
            <path d="M9 3v6M15 3v6M3 9h6M3 15h6"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ uniqueProducts }}</div>
          <div class="stat-label">Уникальных товаров</div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <ChartComponent
        title="Запасы по складам"
        :data="chartData"
        type="bar"
      />
    </div>

    <div class="table-section">
      <DataTable
        :data="stocks"
        :columns="tableColumns"
        :get-item-key="(item) => `${item.nmId}-${item.barcode}`"
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
import { wbApi, type StockItem } from '@/api/wbApi'
import ChartComponent from '@/components/ChartComponent.vue'
import DataTable from '@/components/DataTable.vue'

const stocks = ref<StockItem[]>([])
const loading = ref(false)
const error = ref('')

const tableColumns = [
  { key: 'lastChangeDate', title: 'Последнее изменение', sortable: true, type: 'date' as const },
  { key: 'supplierArticle', title: 'Артикул поставщика', sortable: true, type: 'string' as const },
  { key: 'techSize', title: 'Размер', sortable: true, type: 'string' as const },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' as const },
  { key: 'quantity', title: 'Количество', sortable: true, type: 'number' as const },
  { key: 'quantityFull', title: 'Полное количество', sortable: true, type: 'number' as const },
  { key: 'isSupply', title: 'Поставка', sortable: true, type: 'string' as const },
  { key: 'isRealization', title: 'Реализация', sortable: true, type: 'string' as const },
  { key: 'warehouseName', title: 'Склад', sortable: true, type: 'string' as const },
  { key: 'nmId', title: 'Номенклатура', sortable: true, type: 'number' as const },
  { key: 'subject', title: 'Предмет', sortable: true, type: 'string' as const },
  { key: 'category', title: 'Категория', sortable: true, type: 'string' as const },
  { key: 'brand', title: 'Бренд', sortable: true, type: 'string' as const },
  { key: 'SC_CODE', title: 'Код склада', sortable: true, type: 'string' as const },
  { key: 'Price', title: 'Цена', sortable: true, type: 'currency' as const },
  { key: 'Discount', title: 'Скидка %', sortable: true, type: 'number' as const }
]

const totalItems = computed(() => stocks.value.length)

const totalQuantity = computed(() => {
  return stocks.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

const totalValue = computed(() => {
  return stocks.value.reduce((sum, item) => {
    const price = item.Price || 0
    const quantity = item.quantity || 0
    return sum + (price * quantity)
  }, 0)
})

const uniqueProducts = computed(() => {
  const uniqueIds = new Set(stocks.value.map(item => item.nmId))
  return uniqueIds.size
})

const chartData = computed(() => {
  const warehouseGroups = stocks.value.reduce((groups, item) => {
    const warehouse = item.warehouseName || 'Не указан'
    if (!groups[warehouse]) {
      groups[warehouse] = { quantity: 0, items: 0, value: 0 }
    }
    groups[warehouse].quantity += item.quantity || 0
    groups[warehouse].items++
    groups[warehouse].value += (item.Price || 0) * (item.quantity || 0)
    return groups
  }, {} as Record<string, { quantity: number, items: number, value: number }>)

  const warehouses = Object.keys(warehouseGroups)
  
  return {
    labels: warehouses,
    datasets: [
      {
        label: 'Количество товаров',
        data: warehouses.map(warehouse => warehouseGroups[warehouse].quantity),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      },
      {
        label: 'Стоимость запасов',
        data: warehouses.map(warehouse => warehouseGroups[warehouse].value),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
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

const fetchStocks = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await wbApi.getStocks({
      limit: 1000
    })
    stocks.value = data
  } catch (err) {
    error.value = 'Ошибка при загрузке данных о запасах'
    console.error('Error fetching stocks:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStocks()
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
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
