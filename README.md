# BillEase 🧾✨

> **Modern, Privacy-First Invoice & Bill Generation Platform with 8 Real-World Document Layout Architectures.**

BillEase is a web application designed for freelancers, small business owners, retail stores, healthcare clinics, educational institutions, and enterprises to effortlessly create, customize, preview, and download professional invoices and bills.

Built with **React 18**, **TypeScript**, **Vite**, and **Tailored Glassmorphism CSS**, BillEase requires **no backend or database**—all document records, templates, and calculations remain 100% private and persistent in browser `localStorage`.

---

## 🌟 Key Features

### 1. 🏛️ 8 Truly Distinct Real-World Document Layout Architectures
Unlike typical invoice generators that merely swap brand colors on a generic table, BillEase features **8 genuinely different architectural layouts**, each tailored to real-world industry requirements:

| Template Architecture | Category | Key Structural & Visual Features |
| :--- | :--- | :--- |
| **GST Tax Invoice (Official)** | Professional Services | Official Indian 7-column layout with **HSN/SAC codes**, dual **CGST (9%) & SGST (9%) breakdown**, auto **Rupees in Words** (`numToWords`), statutory declaration, and authorized signatory seal box. |
| **Creative Studio (Sidebar)** | Technology & SaaS | Distinctive 2-column split with a **30% colored left brand & payment sidebar** (including simulated UPI QR code pill) and 70% right itemized deliverables. |
| **Retail Store & POS Bill** | E-Commerce & Retail | Authentic **thermal cash register memo** format with store header, cashier/counter line, dashed rule dividers, total item counter, **simulated vector barcode graphic**, and return policy. |
| **Clinical Medical Bill** | Healthcare & Wellness | Healthcare invoice with clinic registration #, Rx medical cross `✚`, dedicated **Patient Demographics box** (Age, Gender, UHID, Ref. Doctor), consultation & diagnostic table, and attending physician signature box. |
| **Corporate Legal & Advisory** | Professional Services | Executive editorial layout featuring **Playfair Display serif typography**, dedicated **Matter / Docket Reference box**, counsel retainer rate reconciliation, and trust account details. |
| **Academic Tuition Receipt** | Education & Training | Institutional fee receipt with **Academy Crest graphic**, **Student Details card** (Student Name, Roll No., Semester, Academic Session), fee category schedule, and Registrar Accounts seal. |
| **Modern Minimal** | Technology & SaaS | Scandinavian high-whitespace layout with **borderless floating table**, subtle typography, **dark total pill badge**, and streamlined payment UPI pill. |
| **Classic Professional** | Professional Services | Formal corporate architecture featuring **dual bordered party cards**, zebra-striped item table, and formal signatory line. |

---

### 2. 🔄 Seamless Interactive Workflow
BillEase provides an intuitive loop between browsing, building, previewing, and downloading:

```
[ Templates Gallery ] ────► [ Live Builder ] ────► [ PDF Preview & Downloader ]
   • Real mini previews       • Sticky A4 preview        • Instant auto-save
   • 1-Click "Use & Edit"      • Live layout switcher     • Layout architecture toolbar
                              • "Load Sample Data"       • 1-Click "Save as PDF" / Print
```

1. **Browse Templates (`/templates`)**:
   - Filter by document type (`All`, `Bills`, `Invoices`) or industry category (`Professional`, `Tech & SaaS`, `Retail`, `Healthcare`, `Education`).
   - Click **"Preview"** to open a high-resolution modal showcasing the layout with sample data.
   - Click **"Use & Edit"** to jump into the builder pre-configured with that architecture.

2. **Build with Live Visual Feedback (`/create-invoice` & `/create-bill`)**:
   - **Sticky Real-Time Preview**: The document preview dynamically renders your chosen architecture and recalculates subtotals, taxes, and totals as you type.
   - **Live Architecture Switcher**: Switch layout architectures directly from the preview header dropdown without losing your form inputs.
   - **"Load Sample Data"**: One-click action to populate realistic industry items (e.g., consultation and blood tests for Medical, retainer hours for Legal, retail groceries for POS).

3. **Instant Preview & Download (`/preview`)**:
   - Saving from either builder redirects straight to `/preview?id=...&saved=1` with a success confirmation banner.
   - **Layout Architecture Toolbar**: Test different layouts on your saved document before printing.
   - **Clean A4 Export**: Print-optimized stylesheet (`@media print`) that hides UI controls and renders a clean, pixel-perfect A4 document for 1-click **"Save as PDF"** or physical printing.

---

### 3. 🔒 Privacy-First Local Storage (`/documents`)
- **Zero Cloud Dependence**: All bills, drafts, and invoices are saved exclusively in your browser's `localStorage`.
- **My Documents Hub**:
  - Filter documents by status (`Draft`, `Paid`, `Unpaid`, `Pending`) or document type (`Invoice` vs. `Bill`).
  - Search by client name, document number, or reference.
  - Quick actions: **View Preview**, **Edit Document**, **Print**, and **Delete**.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 5](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS with CSS Variables, Glassmorphism backdrop-filters, and Print Media Stylesheets
- **Fonts**: Inter & Google Web Fonts

---

## 📁 Project Structure

```text
BillEase/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── DocumentRenderer.tsx # Master multi-architecture layout engine
│   │   └── Navbar.tsx           # Global responsive navigation bar
│   ├── data/
│   │   └── templates.ts         # Template specifications, schemas & presets
│   ├── hooks/
│   │   └── useDocuments.ts      # LocalStorage CRUD and document helpers
│   ├── pages/
│   │   ├── HomePage.tsx         # Hero landing page & quick actions
│   │   ├── TemplatesPage.tsx    # Templates gallery with live mini-previews
│   │   ├── CreateInvoicePage.tsx# Professional invoice builder
│   │   ├── CreateBillPage.tsx   # Step-by-step bill builder
│   │   ├── PreviewPage.tsx      # Stitch PDF downloader & ready preview
│   │   └── MyDocumentsPage.tsx  # Document management table
│   ├── types/
│   │   └── document.ts          # TypeScript models (BillEaseDocument, LineItem, etc.)
│   ├── App.tsx                  # Application routing config
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global theme tokens, typography & reset styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) and `npm` installed on your machine.

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   git clone <repository-url>
   cd BillEase/BillEase
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```text
   http://localhost:5173
   ```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Type-checks with TypeScript compiler (`tsc`) and builds production bundle to `/dist`. |
| `npm run preview` | Locally previews the production build. |
| `npm run lint` | Runs ESLint to check for code quality and style issues. |

---

## 💡 How to Save as PDF

1. After creating an invoice or bill, click **"Save & Download PDF"** or **"Save Draft & Preview"**.
2. On the Preview screen, click **"Download PDF"** (or **"Print"**).
3. In the browser print dialog:
   - **Destination**: Choose **"Save as PDF"**.
   - **Paper Size**: **A4**.
   - **Options**: Enable **"Background graphics"** for optimal colors and styling.
4. Click **Save** to save the clean PDF document to your device.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).