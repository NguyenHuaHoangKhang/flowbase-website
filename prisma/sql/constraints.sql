-- ============================================================================
-- FLOWBASE — ràng buộc mức database
--
-- Ràng buộc CHECK, partial index và trigger trong PostgreSQL.
-- Cột dùng camelCase khớp chính xác với Prisma Schema.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Giá trị số không được âm
-- ---------------------------------------------------------------------------

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_budget_non_negative;
ALTER TABLE projects ADD CONSTRAINT chk_project_budget_non_negative
  CHECK ("budgetAmount" >= 0 AND ("hourlyRate" IS NULL OR "hourlyRate" >= 0));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_progress_range;
ALTER TABLE projects ADD CONSTRAINT chk_project_progress_range
  CHECK (progress BETWEEN 0 AND 100);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS chk_lead_score_range;
ALTER TABLE leads ADD CONSTRAINT chk_lead_score_range
  CHECK (score BETWEEN 0 AND 100);

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS chk_milestone_amount_non_negative;
ALTER TABLE milestones ADD CONSTRAINT chk_milestone_amount_non_negative
  CHECK (amount >= 0);

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS chk_expense_amount_positive;
ALTER TABLE expenses ADD CONSTRAINT chk_expense_amount_positive
  CHECK (amount > 0);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_amount_positive;
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount_positive
  CHECK (amount > 0);

ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS chk_time_entry_minutes;
ALTER TABLE time_entries ADD CONSTRAINT chk_time_entry_minutes
  CHECK (minutes > 0 AND minutes <= 1440);

-- ---------------------------------------------------------------------------
-- 2. Hoá đơn: số học phải khớp, không thu quá số phải thu
-- ---------------------------------------------------------------------------

ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS chk_invoice_item_amount;
ALTER TABLE invoice_items ADD CONSTRAINT chk_invoice_item_amount
  CHECK (quantity > 0 AND "unitPrice" >= 0 AND amount = ROUND(quantity * "unitPrice", 2));

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoice_amounts;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_amounts
  CHECK (
    subtotal   >= 0 AND
    discount   >= 0 AND
    discount   <= subtotal AND
    "taxRate"   BETWEEN 0 AND 100 AND
    "taxAmount" >= 0 AND
    total      >= 0 AND
    "amountPaid" >= 0 AND
    "amountPaid" <= total
  );

-- total = subtotal - discount + tax_amount (sai số 0.01 cho phép do làm tròn)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoice_total_consistent;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_total_consistent
  CHECK (ABS(total - (subtotal - discount + "taxAmount")) < 0.01);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoice_dates;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_dates
  CHECK ("dueDate" >= "issueDate");

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoice_exchange_rate;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_exchange_rate
  CHECK ("exchangeRate" > 0 AND (currency <> 'VND' OR "exchangeRate" = 1));

-- Hoá đơn đã PAID thì phải thu đủ; VOID thì không được có tiền đã thu.
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoice_status_consistent;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_status_consistent
  CHECK (
    (status <> 'PAID' OR "amountPaid" >= total) AND
    (status <> 'VOID' OR "amountPaid" = 0)
  );

-- ---------------------------------------------------------------------------
-- 3. Ngày tháng hợp lệ
-- ---------------------------------------------------------------------------

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_date_order;
ALTER TABLE projects ADD CONSTRAINT chk_project_date_order
  CHECK ("startDate" IS NULL OR "dueDate" IS NULL OR "dueDate" >= "startDate");

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS chk_contract_date_order;
ALTER TABLE contracts ADD CONSTRAINT chk_contract_date_order
  CHECK ("startDate" IS NULL OR "endDate" IS NULL OR "endDate" >= "startDate");

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS chk_contract_signed_requires_date;
ALTER TABLE contracts ADD CONSTRAINT chk_contract_signed_requires_date
  CHECK (status <> 'SIGNED' OR "signedAt" IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 4. Demo: mật khẩu và ngày xuất bản phải đi cùng trạng thái
-- ---------------------------------------------------------------------------

ALTER TABLE demos DROP CONSTRAINT IF EXISTS chk_demo_password_required;
ALTER TABLE demos ADD CONSTRAINT chk_demo_password_required
  CHECK (visibility <> 'PASSWORD' OR "accessPasswordHash" IS NOT NULL);

ALTER TABLE demos DROP CONSTRAINT IF EXISTS chk_demo_published_requires_date;
ALTER TABLE demos ADD CONSTRAINT chk_demo_published_requires_date
  CHECK (status <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE demo_access_grants DROP CONSTRAINT IF EXISTS chk_grant_view_limit;
ALTER TABLE demo_access_grants ADD CONSTRAINT chk_grant_view_limit
  CHECK ("viewCount" >= 0 AND ("maxViews" IS NULL OR "maxViews" > 0));

-- ---------------------------------------------------------------------------
-- 5. Activity phải gắn vào ít nhất một đối tượng
-- ---------------------------------------------------------------------------

ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activity_target_required;
ALTER TABLE activities ADD CONSTRAINT chk_activity_target_required
  CHECK ("leadId" IS NOT NULL OR "projectId" IS NOT NULL);

-- Lead LOST phải có lý do, WON phải có mốc chuyển đổi.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS chk_lead_outcome_fields;
ALTER TABLE leads ADD CONSTRAINT chk_lead_outcome_fields
  CHECK (
    (status <> 'LOST' OR "lostReason" IS NOT NULL) AND
    (status <> 'WON'  OR "convertedAt" IS NOT NULL)
  );

-- ---------------------------------------------------------------------------
-- 6. Email hợp lệ ở mức tối thiểu
-- ---------------------------------------------------------------------------

ALTER TABLE leads DROP CONSTRAINT IF EXISTS chk_lead_email_shape;
ALTER TABLE leads ADD CONSTRAINT chk_lead_email_shape
  CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_email_shape;
ALTER TABLE users ADD CONSTRAINT chk_user_email_shape
  CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ---------------------------------------------------------------------------
-- 7. Partial unique index — soft delete vẫn giữ được unique trên bản sống
-- ---------------------------------------------------------------------------

-- Thay thế unique toàn phần bằng partial unique trên bản sống
ALTER TABLE clients DROP CONSTRAINT IF EXISTS "clients_taxCode_key";
DROP INDEX IF EXISTS "clients_taxCode_key";
DROP INDEX IF EXISTS uniq_client_tax_code_alive;
CREATE UNIQUE INDEX uniq_client_tax_code_alive
  ON clients ("taxCode") WHERE "deletedAt" IS NULL AND "taxCode" IS NOT NULL;

ALTER TABLE demos DROP CONSTRAINT IF EXISTS "demos_slug_key";
DROP INDEX IF EXISTS "demos_slug_key";
DROP INDEX IF EXISTS uniq_demo_slug_alive;
CREATE UNIQUE INDEX uniq_demo_slug_alive
  ON demos (slug) WHERE "deletedAt" IS NULL;

-- Mỗi client chỉ có một contact chính
DROP INDEX IF EXISTS uniq_client_primary_contact;
CREATE UNIQUE INDEX uniq_client_primary_contact
  ON client_contacts ("clientId") WHERE "isPrimary" = true;

-- Chặn lead trùng: cùng email + cùng ngày, chưa xoá
DROP INDEX IF EXISTS uniq_lead_email_per_day;
CREATE UNIQUE INDEX uniq_lead_email_per_day
  ON leads (email, ("createdAt"::date)) WHERE "deletedAt" IS NULL;

-- ---------------------------------------------------------------------------
-- 8. Index hỗ trợ báo cáo tài chính
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_invoice_issue_date
  ON invoices ("issueDate") WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_expense_spent_at
  ON expenses ("spentAt") WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_outstanding
  ON invoices ("dueDate") WHERE status IN ('SENT', 'PARTIAL', 'OVERDUE') AND "deletedAt" IS NULL;

-- ---------------------------------------------------------------------------
-- 9. Trigger: đồng bộ amount_paid và status của hoá đơn theo payments
--    Giữ cache đúng mà không phụ thuộc application code nhớ cập nhật.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_invoice_payment_state() RETURNS TRIGGER AS $$
DECLARE
  target_id TEXT;
  paid      NUMERIC(18,2);
  inv       RECORD;
BEGIN
  target_id := COALESCE(NEW."invoiceId", OLD."invoiceId");

  SELECT COALESCE(SUM(amount), 0) INTO paid
  FROM payments WHERE "invoiceId" = target_id;

  SELECT * INTO inv FROM invoices WHERE id = target_id;

  UPDATE invoices SET
    "amountPaid" = paid,
    "paidAt" = CASE WHEN paid >= inv.total THEN COALESCE(inv."paidAt", NOW()) ELSE NULL END,
    status = CASE
      WHEN inv.status = 'VOID'  THEN 'VOID'
      WHEN inv.status = 'DRAFT' THEN 'DRAFT'::"InvoiceStatus"
      WHEN paid >= inv.total AND inv.total > 0 THEN 'PAID'::"InvoiceStatus"
      WHEN paid > 0  THEN 'PARTIAL'::"InvoiceStatus"
      WHEN inv."dueDate" < CURRENT_DATE THEN 'OVERDUE'::"InvoiceStatus"
      ELSE 'SENT'::"InvoiceStatus"
    END
  WHERE id = target_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_payment_state ON payments;
CREATE TRIGGER trg_sync_invoice_payment_state
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION sync_invoice_payment_state();

-- ---------------------------------------------------------------------------
-- 10. Trigger: đánh dấu hoá đơn quá hạn (chạy kèm cron hằng ngày)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION mark_overdue_invoices() RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE invoices
  SET status = 'OVERDUE'::"InvoiceStatus"
  WHERE status IN ('SENT'::"InvoiceStatus", 'PARTIAL'::"InvoiceStatus")
    AND "dueDate" < CURRENT_DATE
    AND "deletedAt" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;
