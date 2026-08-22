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

export type PurchasingSummary = {
  BranchId: number | null;
  TotalPurchases: number;
  PurchaseAmount: number;
  PendingCount: number;
  PendingAmount: number;
  ReceivedCount: number;
  ReceivedAmount: number;
  CancelledCount: number;
  CancelledAmount: number;
};

export type PurchaseStatus = "pending" | "received" | "cancelled";

export type PendingPurchase = {
  PurchaseId: number;
  SupplierName: string;
  BranchId: number;
  BranchName: string;
  PurchaseDate: string;
  TotalAmount: number;
  Status: PurchaseStatus;
};

export type SupplierSummary = {
  SupplierId: number;
  SupplierName: string;
  PurchaseCount: number;
  TotalAmount: number;
};

export type CashierPerformance = {
  CashierId: number;
  CashierName: string;
  BranchId: number;
  BranchName: string;
  Transactions: number;
  Sales: number;
  ItemsSold: number;
  AverageTransactionValue: number;
};

export type VoidedSale = {
  SaleId: number;
  ORNo: string | null;
  CashierName: string | null;
  BranchId: number;
  BranchName: string;
  TerminalName: string;
  Total: number;
  CancelReason: string | null;
  DateCancelled: string | null;
};

export type StockAdjustmentSummary = {
  BranchId: number | null;
  AdjustmentCount: number;
  StockAdded: number;
  StockRemoved: number;
};

export type TerminalStatus = {
  TerminalId: number;
  TerminalName: string;
  BranchId: number;
  BranchName: string;
  Status: "Open" | "Closed";
  CurrentCashierId: number | null;
  CurrentCashierName: string | null;
  ShiftOpenedAt: string | null;
};

export type ActiveShift = {
  CashierShiftId: number;
  CashierId: number;
  CashierName: string;
  BranchId: number;
  BranchName: string;
  TerminalId: number;
  TerminalName: string;
  OpeningCash: number;
  OpenedAt: string;
  CurrentSales: number;
  CurrentCashPayments: number;
};

export type ShiftClosingSummary = {
  CashierShiftId: number;
  CashierName: string;
  TerminalId: number;
  TerminalName: string;
  BranchId: number;
  BranchName: string;
  OpeningCash: number;
  ExpectedCash: number;
  ActualCash: number;
  Variance: number;
  OpenedAt: string;
  ClosedAt: string;
};

export type RecentActivity = {
  AuditLogId: number;
  CreatedAt: string;
  ActionType: string;
  Action: string;
  TableName: string;
  RecordId: number | null;
  UserName: string | null;
};

export type OfficialReceiptSummary = {
  BranchId: number | null;
  IssuedCount: number;
  VoidedCount: number;
};

export type OrAssignmentStatus = {
  ORAssignmentId: number;
  UserId: number;
  CashierName: string;
  ORFrom: string;
  ORTo: string;
  LastORUsed: string | null;
  RemainingCount: number;
};

export type ReturnReason = {
  Reason: string;
  ReturnCount: number;
  RefundAmount: number;
};

export type TopReturnedProduct = {
  ProductId: number;
  ProductName: string;
  SKU: string;
  QuantityReturned: number;
  ReturnValue: number;
};

export type RecentSale = {
  SaleId: number;
  ORNo: string | null;
  CreatedAt: string;
  BranchId: number;
  BranchName: string;
  TerminalName: string;
  CashierName: string | null;
  Total: number;
  PaymentMethodName: string | null;
  Status: "Completed" | "Voided";
};

export type RecentPurchase = {
  PurchaseId: number;
  SupplierName: string;
  BranchId: number;
  BranchName: string;
  TotalAmount: number;
  Status: PurchaseStatus;
  PurchaseDate: string;
};

export type RecentStockAdjustment = {
  InventoryLogId: number;
  CreatedAt: string;
  ProductName: string;
  BranchId: number;
  BranchName: string;
  Quantity: number;
  Reason: string | null;
  UserName: string | null;
};
