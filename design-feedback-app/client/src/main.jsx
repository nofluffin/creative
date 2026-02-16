import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminProjectDetail from './pages/AdminProjectDetail';
import ClientReview from './pages/ClientReview';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />
        <Route path="/review/:share_token" element={<ClientReview />} />
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
