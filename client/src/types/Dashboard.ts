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
