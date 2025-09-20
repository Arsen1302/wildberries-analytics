<template>
  <div class="data-table-container">
    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>Поиск:</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Введите текст для поиска..."
            class="filter-input"
            @input="onSearchChange"
          />
        </div>
        
        <div class="filter-group">
          <label>Дата с:</label>
          <input 
            v-model="dateFrom" 
            type="date" 
            class="filter-input"
            @change="onFilterChange"
          />
        </div>
        
        <div class="filter-group">
          <label>Дата по:</label>
          <input 
            v-model="dateTo" 
            type="date" 
            class="filter-input"
            @change="onFilterChange"
          />
        </div>
        
        <div class="filter-group">
          <label>Записей на странице:</label>
          <select v-model="itemsPerPage" @change="onItemsPerPageChange" class="filter-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        
        <button @click="resetFilters" class="reset-button">Сбросить</button>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ sortable: column.sortable, active: sortField === column.key }"
            >
              {{ column.title }}
              <span v-if="column.sortable" class="sort-indicator">
                {{ sortField === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedData" :key="getItemKey(item)">
            <td v-for="column in columns" :key="column.key">
              <slot :name="column.key" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatValue(getNestedValue(item, column.key), column.type) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div class="pagination-container">
      <div class="pagination-info">
        Показано {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredData.length) }} 
        из {{ filteredData.length }} записей
      </div>
      
      <div class="pagination-controls">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          Первая
        </button>
        
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          Предыдущая
        </button>
        
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-button', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </span>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          Следующая
        </button>
        
        <button 
          @click="goToPage(totalPages)" 
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          Последняя
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Column {
  key: string
  title: string
  sortable?: boolean
  type?: 'string' | 'number' | 'date' | 'currency'
}

interface Props {
  data: any[]
  columns: Column[]
  getItemKey: (item: any) => string | number
}

const props = defineProps<Props>()

// Реактивные данные для фильтров и пагинации
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const itemsPerPage = ref(25)
const currentPage = ref(1)
const sortField = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Вычисляемые свойства
const filteredData = computed(() => {
  let filtered = [...props.data]

  // Поиск по тексту
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => {
      return props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // Фильтрация по дате
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(item => {
      // Ищем поле с датой (обычно 'date' или 'lastChangeDate')
      const dateField = item.date || item.lastChangeDate || item.lastChangeDate
      if (!dateField) return true

      const itemDate = new Date(dateField)
      if (dateFrom.value && itemDate < new Date(dateFrom.value)) return false
      if (dateTo.value && itemDate > new Date(dateTo.value)) return false
      return true
    })
  }

  // Сортировка
  if (sortField.value) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortField.value)
      const bValue = getNestedValue(b, sortField.value)
      
      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Методы
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((value, key) => value?.[key], obj)
}

const formatValue = (value: any, type?: string) => {
  if (value === null || value === undefined) return '-'
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString('ru-RU')
    case 'currency':
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(value)
    case 'number':
      return new Intl.NumberFormat('ru-RU').format(value)
    default:
      return String(value)
  }
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const onSearchChange = () => {
  currentPage.value = 1
}

const onFilterChange = () => {
  currentPage.value = 1
}

const onItemsPerPageChange = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sortField.value = ''
  sortDirection.value = 'asc'
  currentPage.value = 1
}

// Следим за изменениями данных и сбрасываем страницу
watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.data-table-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.filters-section {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.filter-row {
  display: flex;
  gap: var(--space-4);
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-group label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.filter-input, .filter-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  min-width: 150px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.reset-button {
  padding: var(--space-3) var(--space-4);
  background: var(--error-500);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  height: fit-content;
  transition: all var(--transition-fast);
}

.reset-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.table-container {
  overflow-x: auto;
  margin-bottom: var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
}

.data-table th,
.data-table td {
  padding: var(--space-4) var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.data-table th {
  background: var(--bg-tertiary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast);
}

.data-table th.sortable:hover {
  background: var(--neutral-200);
}

.data-table th.active {
  background: var(--primary-600);
  color: var(--text-inverse);
}

.sort-indicator {
  margin-left: var(--space-1);
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.data-table tbody tr {
  transition: background-color var(--transition-fast);
}

.data-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.data-table tbody tr:nth-child(even) {
  background: var(--bg-secondary);
}

.data-table tbody tr:nth-child(even):hover {
  background: var(--bg-tertiary);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.pagination-controls {
  display: flex;
  gap: var(--space-1);
  align-items: center;
}

.pagination-button, .page-button {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-medium);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  min-width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:hover:not(:disabled),
.page-button:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
  transform: translateY(-1px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-button.active {
  background: var(--primary-600);
  color: var(--text-inverse);
  border-color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}

.page-numbers {
  display: flex;
  gap: var(--space-1);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .data-table-container {
    padding: var(--space-4);
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .filter-group {
    width: 100%;
  }

  .filter-input, .filter-select {
    min-width: auto;
    width: 100%;
  }
  
  .pagination-container {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }
  
  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-button, .page-button {
    min-width: 36px;
    height: 32px;
    font-size: var(--font-size-xs);
  }

  .data-table th,
  .data-table td {
    padding: var(--space-2) var(--space-2);
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .pagination-controls {
    gap: var(--space-1);
  }

  .pagination-button, .page-button {
    min-width: 32px;
    height: 28px;
    padding: var(--space-1) var(--space-2);
  }
}
</style>
