---
description: Implementation workflow for the Daily Log (Daily Report) feature with automated tax calculation.
---

# Daily Log Implementation Workflow

This workflow guides the implementation of the "Daily Logs" feature, focusing on worker attendance, task tracking, and automated tax calculations for construction-specific day labor (Domestic & International).

## 1. Feature Definition & UI structure
- **Daily Dashboard**: Overview of today's active workers, total labor cost, and weather.
- **Attendance Form**:
    - Worker selection (from a reusable directory).
    - Task/Role assignment (e.g., Masonry, Electrical).
    - Hours worked / Daily rate input.
- **Automated Tax Widget**: Real-time calculation of net pay after tax deductions.

## 2. Tax Calculation Engine Logic
Implement a configurable tax hook `useTaxCalculator` to handle:
- **Domestic (KR)**:
    - Independent Contractor: 3.3% withholding.
    - Day Laborer: Base exempt amount (e.g., 150k KRW) and marginal tax rate logic.
- **International (UK - CIS)**:
    - Registered Subcontractor: 20% deduction.
    - Unregistered Subcontractor: 30% deduction.
- **General (US/Other)**: Configurable flat-rate withholding.

## 3. Database Schema (Supabase)
Create the following tables to persist data:

### `workers`
- `id` (uuid, PK)
- `full_name` (text)
- `role` (text)
- `tax_id_type` (text) // TFN (AU), NI (UK), SSN (US)
- `is_registered` (boolean) // For CIS-like systems

### `daily_logs`
- `id` (uuid, PK)
- `date` (date)
- `weather` (text)
- `site_id` (uuid, FK)
- `notes` (text)

### `labor_records`
- `id` (uuid, PK)
- `log_id` (uuid, FK)
- `worker_id` (uuid, FK)
- `daily_rate` (numeric)
- `tax_deduction` (numeric)
- `net_pay` (numeric)
- `tax_type_applied` (text) // 'KR_3.3', 'UK_CIS_20', etc.

## 4. Implementation Steps

### Phase 1: Interactive Table
// turbo
1. Create `DailyLogView.jsx` as a replacement for the current placeholder.
2. Implement an editable table using `lucide-react` for row management (Add/Remove worker).
3. Connect the `useTaxCalculator` hook to the "Daily Rate" input.

### Phase 2: Regional Presets
1. Add a "Region Setting" in the dashboard to toggle between KR/UK/US logic.
2. Update the UI to show small badges next to the Net Pay (e.g., "CIS 20% Applied").

### Phase 3: Supabase Sync
1. Follow the `supabase_integration.md` to connect the real backend.
2. Implement auto-save functionality for reports.

### Phase 4: Export (Feature 5)
1. Add "Export to PDF" using `jspdf` to generate professional daily reports for clients/supervisors.
2. Add "Export to Excel" to send payroll data to accounting.

## 5. Success Criteria
- [ ] Worker daily rate input automatically calculates tax and net pay.
- [ ] Users can switch between KR/UK tax rules easily.
- [ ] Data is persisted per date in Supabase.
- [ ] A professional PDF report can be generated from the logs.
