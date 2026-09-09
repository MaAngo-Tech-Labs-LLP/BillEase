# 🧾 BillEase

> **Modern, Elegant & Zero-Friction Billing & Invoice Generator**  
> Create, customize, and export professional bills and tax invoices in seconds with real-time preview, multi-currency support, Indian GST compliance, and one-click PDF generation.

---

## 🌟 Overview

**BillEase** is a production-grade web application tailored for freelancers, agencies, consultants, small businesses, and enterprises. It provides dual creation workflows—a step-by-step wizard for detailed bills and a single-page rapid generator for invoices—backed by 8+ curated templates, central business profile auto-sync, dark mode, and local draft persistence.

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

### 2. 🎨 8+ Curated Document Templates
Each template is built with authentic typography and design rules:
| Template | Key Characteristics | Best For |
| :--- | :--- | :--- |
| **Classic Professional** | Dual party cards, formal corporate borders, signature stamp | Corporate, consulting, formal B2B |
| **Modern Minimal** | Clean asymmetric whitespace, borderless floating table, pill badges | Tech startups, SaaS, modern agencies |
| **Bold Emerald (Retail/POS)** | Emerald accents, dashed memo lines, centered store logo | Retail, POS memos, fast commerce |
| **Warm Saffron (Sidebar)** | Left brand & payment sidebar, main right itemization charges | Creative agencies, design studios |
| **Medical & Clinical** | Rx symbol, Doctor registration, Patient age/gender, fee table | Clinics, healthcare professionals |
| **Corporate Navy (Editorial)**| Serif typography, Law & Advisory matter ref, retainer ledger | Legal firms, accounting, advisory |
| **Academia Blue** | Tuition receipt, student roll no, semester schedule | Educational institutions, tutors |
| **GST Tax Invoice** | Indian GST layout, HSN/SAC codes, CGST/SGST split, amount in words | Indian GST registered businesses |

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
- **One-Click Preview & PDF Export**: Instant print formatting via standard browser PDF generation.

---

### 6. 💱 Multi-Currency & Calculation Engine
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
│   │   ├── BusinessProfileModal.tsx # Profile defaults modal
│   │   ├── ConfirmDeleteModal.tsx   # Delete confirmation popup dialog
│   │   ├── DateInputWithPicker.tsx  # Custom calendar picker input
│   │   ├── DocumentRenderer.tsx     # A4 live document canvas renderer
│   │   └── Navbar.tsx               # Top navigation bar
│   ├── data/
│   │   ├── templates.ts        # Default data models & currency tokens
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
│   │   └── profileSync.ts      # Profile event broadcasting & document auto-fill
│   ├── App.tsx                 # Root application container & tab router
│   ├── index.css               # Global styling, themes & utility classes
│   └── main.tsx                # Application entry point
├── package.json
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