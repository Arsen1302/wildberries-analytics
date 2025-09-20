import axios from 'axios'
import { mockIncomes, mockOrders, mockSales, mockStocks } from './mockData'
import type { IncomeItem, OrderItem, SaleItem, StockItem, ApiFilters } from './types'

export type { IncomeItem, OrderItem, SaleItem, StockItem, ApiFilters } from './types'

const API_BASE_URL = '/api'
const API_KEY = import.meta.env.VITE_API_KEY || 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

const handleApiError = (error: any, endpoint: string, mockData: any[]) => {
  if (error.response?.status === 403) {
    console.warn(`Ошибка аутентификации для ${endpoint}. Используем тестовые данные.`)
    console.warn(`Для получения реальных данных обновите VITE_API_KEY в файле .env`)
    return mockData
  } else if (error.response?.status === 404) {
    console.warn(`Эндпоинт ${endpoint} не найден. Используем тестовые данные.`)
    return mockData
  } else {
    console.warn(`Ошибка при получении данных для ${endpoint}. Используем тестовые данные.`)
    return mockData
  }
}

export const wbApi = {
  async getIncomes(filters: ApiFilters = {}): Promise<IncomeItem[]> {
    if (USE_MOCK_DATA) {
      console.log('Используем тестовые данные для incomes')
      return mockIncomes
    }
    
    try {
      const response = await apiClient.get('/api/incomes', { params: filters })
      return response.data
    } catch (error) {
      return handleApiError(error, 'incomes', mockIncomes)
    }
  },

  async getOrders(filters: ApiFilters = {}): Promise<OrderItem[]> {
    if (USE_MOCK_DATA) {
      console.log('Используем тестовые данные для orders')
      return mockOrders
    }
    
    try {
      const response = await apiClient.get('/api/orders', { params: filters })
      return response.data
    } catch (error) {
      return handleApiError(error, 'orders', mockOrders)
    }
  },

  async getSales(filters: ApiFilters = {}): Promise<SaleItem[]> {
    if (USE_MOCK_DATA) {
      console.log('Используем тестовые данные для sales')
      return mockSales
    }
    
    try {
      const response = await apiClient.get('/api/sales', { params: filters })
      return response.data
    } catch (error) {
      return handleApiError(error, 'sales', mockSales)
    }
  },

  async getStocks(filters: ApiFilters = {}): Promise<StockItem[]> {
    if (USE_MOCK_DATA) {
      console.log('Используем тестовые данные для stocks')
      return mockStocks
    }
    
    try {
      const response = await apiClient.get('/api/stocks', { params: filters })
      return response.data
    } catch (error) {
      return handleApiError(error, 'stocks', mockStocks)
    }
  }
}

export default wbApi