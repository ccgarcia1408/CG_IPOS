export type KpiComparison = {
  Current: number;
  Previous: number;
  PercentChange: number | null;
};

export type SalesSummary = {
  BranchId: number | null;
  StartDate: string;
  EndDate: string;
  GrossSales: KpiComparison;
  NetSales: KpiComparison;
  CompletedTransactions: KpiComparison;
  ItemsSold: KpiComparison;
  AverageTransactionValue: KpiComparison;
  TotalDiscounts: KpiComparison;
  TotalReturns: KpiComparison;
  ReturnsCount: KpiComparison;
  VoidedSales: KpiComparison;
  VoidedCount: KpiComparison;
};

export type SalesTrendPoint = {
  PeriodLabel: string;
  PeriodStart: string;
  GrossSales: number;
  NetSales: number;
  Transactions: number;
  ItemsSold: number;
};

export type SalesTrendGranularity = "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";

export type SalesByPaymentMethod = {
  PaymentMethodId: number;
  PaymentMethodName: string;
  TotalAmount: number;
  TransactionCount: number;
  PercentageOfTotal: number;
};

export type SalesByBranch = {
  BranchId: number;
  BranchName: string;
  Sales: number;
  Transactions: number;
  ItemsSold: number;
  AverageTransactionValue: number;
};

export type SalesByTerminal = {
  TerminalId: number;
  TerminalName: string;
  BranchId: number;
  BranchName: string;
  Sales: number;
  Transactions: number;
  ItemsSold: number;
  AverageTransactionValue: number;
};

export type TopProduct = {
  Rank: number;
  ProductId: number;
  ProductName: string;
  SKU: string;
  CategoryName: string;
  QuantitySold: number;
  SalesAmount: number;
  PercentageOfSales: number;
};

export type TopCategory = {
  CategoryId: number | null;
  CategoryName: string;
  QuantitySold: number;
  Sales: number;
  PercentageOfSales: number;
};

export type TopProductsSortBy = "QUANTITY" | "REVENUE";

export type InventorySummary = {
  BranchId: number | null;
  TotalActiveProducts: number;
  TotalInventoryUnits: number;
  TotalInventoryValue: number;
  LowStockCount: number;
  OutOfStockCount: number;
  ExpiringSoonCount: number;
};

export type LowStockAlert = {
  ProductId: number;
  ProductName: string;
  SKU: string;
  BranchId: number;
  BranchName: string;
  CurrentStock: number;
  MinimumStock: number;
  StockDifference: number;
};

export type OutOfStockAlert = {
  ProductId: number;
  ProductName: string;
  SKU: string;
  BranchId: number;
  BranchName: string;
};

export type ExpiringProduct = {
  ProductId: number;
  ProductName: string;
  SKU: string;
  BranchId: number;
  BranchName: string;
  Quantity: number;
  ExpiryDate: string;
  DaysRemaining: number;
};

export type ExpiringThreshold = 7 | 15 | 30;
