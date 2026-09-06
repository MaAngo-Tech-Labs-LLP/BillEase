import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MyDocumentsPage from './pages/MyDocumentsPage'
import CreateBillPage from './pages/CreateBillPage'
import CreateInvoicePage from './pages/CreateInvoicePage'
import TemplatesPage from './pages/TemplatesPage'
import PreviewPage from './pages/PreviewPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/documents" element={<MyDocumentsPage />} />
        <Route path="/create-bill" element={<CreateBillPage />} />
        <Route path="/create-invoice" element={<CreateInvoicePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
