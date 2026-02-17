# 📊 Excel Splitter App

A smart Excel file splitting tool built with React. Automatically divide large Excel files with multiple sheets into smaller, manageable files based on custom rules.

## ✨ Features

- **Fixed Header Rows** — Preserves header rows (default: 4 rows) across all split files with original styles and merged cells
- **Smart Row-based Splitting** — Split files by configurable row count (default: 28 rows), optimized for print layout
- **Keyword Detection** — Detects 'Total', 'Subtotal' keywords for intelligent page breaks
- **Live Editable Preview** — Preview and edit data directly in the browser before exporting
- **Style Preservation** — Maintains cell colors, fonts, borders, and merged cell structures
- **ZIP Download** — All split files bundled into a single ZIP for easy download

## 🛠 Tech Stack

- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons
- **Excel Processing:** ExcelJS (style-aware), SheetJS/xlsx (fast reading)
- **Bundler:** Vite 7
- **Archive:** JSZip

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📄 License

MIT
