# 🧾 BillEase

> **Modern, Elegant & Zero-Friction Billing & Invoice Generator**  
> Create, customize, and export professional bills and tax invoices in seconds with real-time preview, multi-currency support, Indian GST compliance, and one-click PDF generation.

---

## 🌟 Overview

**BillEase** is a production-grade web application tailored for freelancers, agencies, consultants, small businesses, and enterprises. It provides dual creation workflows—a step-by-step wizard for detailed bills and a single-page rapid generator for invoices—backed by 12 curated templates (6 for Bills, 6 for Invoices), central business profile auto-sync, dark mode, unsaved-changes protection, and local draft persistence.

---

## ✨ Key Features

### 1. 🚀 Dual Creation Workflows
- **Create Bill (Guided 6-Step Stepper)**:
  1. **Details**: Bill numbers, PO references, currency, issue date, and payment due dates.
  2. **Customer (BILL TO)**: Client contact details, billing address, and optional shipping address with "same as billing" toggle.
  3. **My Business Info (BILL FROM)**: Company logo upload (auto-scaled to 52×52px slot), business tagline, GSTIN/Tax ID, address, and contact info.
  4. **Line Items**: Add item/service names, descriptions, dynamic quantities, unit rates, item-level taxes, and reordering.
  5. **Payment & Charges**: Bank details, UPI IDs, payment terms, discounts, shipping fees, and amount paid.
  6. **Template Picker**: Real-time layout switcher with custom accent palettes.
- **Create Invoice (Single-Page Rapid Editor)**:
  - Fast-form workflow tailored for service retainers, software licensing, and immediate billing.
  - Live split-view or full document preview with instantaneous reactive calculations.

---

### 2. 🎨 12 Curated Document Templates
Templates are strictly scoped to their document type — the Bill editor only ever offers Bill templates, and the Invoice editor only ever offers Invoice templates.

**Bill Templates**
| Template | Key Characteristics | Best For |
| :--- | :--- | :--- |
| **Apex Corporate Standard Bill** | Dual party cards, item tax column, bank details, balance due highlight | Corporate, consulting, formal B2B |
| **Retail Store & POS Bill** | Emerald accents, dashed memo lines, store/counter transaction metadata | Retail, POS memos, fast commerce |
| **Medical & Healthcare Bill** | Clinical header, doctor/patient fields, fee table | Clinics, healthcare professionals |
| **Academy & Tuition Fee Bill** | Tuition receipt, student roll no, semester schedule | Educational institutions, tutors |
| **Modern Minimalist Bill** | Clean asymmetric whitespace, borderless floating table | Freelancers, minimalist billing |
| **Creative Agency Services Bill** | Left brand & payment sidebar, right-side itemization | Creative agencies, design studios |

**Invoice Templates**
| Template | Key Characteristics | Best For |
| :--- | :--- | :--- |
| **Classic Professional Invoice** | Formal corporate borders, signature stamp | Corporate, consulting, formal B2B |
| **Modern Minimal Invoice** | Clean asymmetric whitespace, pill badges | Tech startups, SaaS, modern agencies |
| **Creative Studio Sidebar Invoice** | Left brand & payment sidebar, right-side charges | Creative agencies, design studios |
| **Executive Legal & Advisory Invoice** | Serif typography, matter reference, retainer ledger | Legal firms, accounting, advisory |
| **EU Business Invoice** | Dense Nordic/European metadata block, Unit Price/Qty/VAT% table, BIC/SWIFT + IBAN bank footer | International billing, EU/Nordic clients |
| **GST Tax Invoice — Detailed** | Full statutory Indian GST invoice: PAN + GSTIN, Challan/E-Way Bill/Transport block, per-line HSN/SAC codes, HSN-grouped IGST summary table, amount in words, UPI QR code, signature stamp | Indian GST-registered businesses shipping goods |

---

### 3. 🏢 Business Profile & Automatic Sync
- **Centralized Profile Defaults**: Save your company name, logo, email, phone, registered address, GSTIN/PAN, and Bank/UPI ID once via the top navigation bar (**Profile & Settings**).
- **Zero-Friction Auto-Connection**:
  - Automatically pre-fills **"My Business Information (BILL FROM)"** in Create Bill and **"Your Information (BILL FROM)"** in Create Invoice.
  - Real-time event broadcasting updates open editors and saved drafts without requiring manual copy-pasting.
  - Status indicator badges show **`✓ Connected to Profile`** with a one-click manual sync option.

---

### 4. 🌙 Native Dark Mode & Liquid Aesthetics
- **Seamless Dark Mode**: Toggle between light and dark mode with persistent `localStorage` preference and system scheme fallback.
- **Crafted Dark Palette**: Deep charcoal canvas (`#0e1012`), frosted glass cards (`#181b21`), and balanced contrast tokens to eliminate eye strain.
- **Liquid Glassmorphism**: Ambient floating background orbs and backdrop blur refractions.
- **Dynamic Hero Typing Effect**: Smooth animated typewriter cycling between *"What will you create bills?"* and *"What will you create invoices?"*.

---

### 5. 📁 Document Repository (My Documents)
- **Status Filtering**: Filter your documents by status (`Paid`, `Sent`, `Pending`, `Draft`) or type (`Bills`, `Invoices`).
- **Instant Search**: Real-time search across client names, bill numbers, and document titles.
- **Delete Confirmation Pop-Up**: Safe deletion dialog featuring a document summary card to prevent accidental removal of important records.
- **Clear All**: Bulk-delete every saved document in one confirmed action, for a full reset.
- **One-Click Preview & PDF Export**: Instant print formatting via standard browser PDF generation.

---

### 6. 🛡️ Draft Safety & Unsaved-Changes Protection
- **Never lose work switching documents**: each editor tracks whether the form has changes that haven't been committed via Save Draft / Create / Download PDF. Switching between Create Bill, Create Invoice, or any other tab while dirty prompts a confirmation — mirroring the "unsaved changes" warning in Word/Office.
- **Browser close/refresh protection**: closing the tab or refreshing with unsaved changes triggers the browser's native "leave site?" prompt.
- **Reset Form**: instantly wipes the current draft back to blank, with a confirmation step.
- **Sample Data (preview-only)**: fills the live preview with example content to show what a finished document looks like — never written to your real form data or saved anywhere, and clearly banner-marked while active. Toggle it off and your actual entries are exactly as you left them.
- **"No due date" toggle**: mark a bill or invoice as not having a due date (e.g. a walk-in receipt) instead of leaving the field ambiguously blank.

---

### 7. 💱 Multi-Currency & Calculation Engine
- Multi-currency support: **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, and **CAD ($)** with locale-aware number formatting.
- Standalone calculation engine handling subtotal, multi-tier tax rates (0%, 5%, 12%, 18%, 28%), itemized discounts, additional fees, and balances due.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables, Glassmorphism, Responsive Media Queries)
- **State & Storage**: React Hooks (`useDocuments`, `useMemo`, `useCallback`) + Web Storage API (`localStorage`)

---

## 📂 Project Structure

```
BillEase/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── BillDocumentRenderer.tsx # A4 live canvas renderer for Bill templates
│   │   ├── BusinessProfileModal.tsx # Profile defaults modal
│   │   ├── ConfirmDeleteModal.tsx   # Delete confirmation popup dialog
│   │   ├── DateInputWithPicker.tsx  # Date input with calendar picker + ISO normalization
│   │   ├── DocumentRenderer.tsx     # A4 live canvas renderer for Invoice templates
│   │   ├── Navbar.tsx               # Top navigation bar
│   │   └── UnsavedChangesModal.tsx  # "Unsaved changes" confirmation dialog
│   ├── data/
│   │   ├── templates.ts        # Default data models, sample docs & currency tokens
│   │   └── templateStyles.ts   # Template style configurations
│   ├── hooks/
│   │   └── useDocuments.ts     # Document list, drafts & CRUD management
│   ├── pages/
│   │   ├── CreateBillPage.tsx       # 6-step guided bill builder
│   │   ├── CreateInvoicePage.tsx    # Single-page rapid invoice builder
│   │   ├── HomePage.tsx             # Hero landing page & recent documents
│   │   ├── MyDocumentsPage.tsx      # Repository view with filters & search
│   │   ├── PreviewPage.tsx          # Standalone full-screen document preview
│   │   └── TemplatesPage.tsx        # Template gallery & showcase
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & types
│   ├── utils/
│   │   ├── billCalculations.ts # Financial calculation engine
│   │   ├── dates.ts            # Canonical date parsing/formatting (ISO source of truth)
│   │   └── profileSync.ts      # Profile event broadcasting & document auto-fill
│   ├── App.tsx                 # Root application container & tab router
│   ├── index.css               # Global styling, themes & utility classes
│   └── main.tsx                # Application entry point
├── package.json                # Source of truth for dependencies
├── requirements.txt            # Plain-text dependency reference (see below)
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MaAngo-Tech-Labs-LLP/BillEase.git
   cd BillEase
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   `package.json` (and its lockfile, `package-lock.json`) is the actual
   source of truth for dependencies — that's what `npm install` reads. A
   plain-text `requirements.txt` is also included at the project root as a
   quick human-readable reference of the same packages; it isn't read by
   any installer.

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.

---

Built with ❤️ by **MaAngo Tech Labs**.