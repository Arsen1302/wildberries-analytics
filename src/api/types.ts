export interface IncomeItem {
  incomeId: number
  number: string
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  dateClose: string
  warehouseName: string
  nmId: number
  status: string
}

export interface OrderItem {
  orderId: number
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  warehouseName: string
  oblast: string
  incomeID: number
  nmId: number
  subject: string
  category: string
  brand: string
  isCancel: boolean
  cancel_dt: string
  gNumber: string
  sticker: string
  srid: string
}

export interface SaleItem {
  saleId: number
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  isSupply: boolean
  isRealization: boolean
  orderId: number
  promoCodeDiscount: number
  warehouseName: string
  countryName: string
  oblastOkrugName: string
  regionName: string
  incomeID: number
  saleID: string
  odid: number
  spp: number
  forPay: number
  finishedPrice: number
  priceWithDisc: number
  nmId: number
  subject: string
  category: string
  brand: string
  IsStorno: number
  gNumber: string
  sticker: string
  srid: string
}

export interface StockItem {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantityFull: number
  warehouseName: string
  nmId: number
  subject: string
  category: string
  brand: string
  SC_CODE: string
  Price: number
  Discount: number
}

export interface ApiFilters {
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
  [key: string]: any
}
