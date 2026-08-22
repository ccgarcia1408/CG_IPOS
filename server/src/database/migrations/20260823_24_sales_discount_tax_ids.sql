-- POS Discount/Tax integration: sp_sales_completeSale will look up the discount/tax amount from
-- these master tables server-side (never trust a client-computed amount), and records which one
-- was applied for traceability. Nullable — a sale can have no discount and/or no tax selected.

ALTER TABLE sales
    ADD COLUMN DiscountId INT NULL AFTER Discount,
    ADD COLUMN TaxId INT NULL AFTER Tax;

ALTER TABLE sales
    ADD CONSTRAINT fk_sales_DiscountId FOREIGN KEY (DiscountId) REFERENCES discounts(DiscountId),
    ADD CONSTRAINT fk_sales_TaxId FOREIGN KEY (TaxId) REFERENCES taxes(TaxId);
