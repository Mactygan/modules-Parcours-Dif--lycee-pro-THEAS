import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { AdminRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Index from './pages/Index';
import Calendrier from './pages/Calendrier';
import Reservations from './pages/Reservations';
import Profil from './pages/Profil';
import Utilisateurs from './pages/Utilisateurs';
import Supervision from './pages/Supervision';
import NotFound from './pages/NotFound';
import DebugSupabase from './pages/DebugSupabase';
import DebugReservation from './pages/DebugReservation';
import DebugReservationForm from './pages/DebugReservationForm';
import './App.css';

// Vérifier si on est en mode développement
const isDevelopment = import.meta.env.MODE === 'development';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="calendrier" element={<Calendrier />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="profil" element={<Profil />} />

              {/* Routes protégées - Réservées aux administrateurs */}
              <Route
                path="utilisateurs"
                element={
                  <AdminRoute>
                    <Utilisateurs />
                  </AdminRoute>
                }
              />
              <Route
                path="supervision"
                element={
                  <AdminRoute>
                    <Supervision />
                  </AdminRoute>
                }
              />

              {/* Routes de debug - Uniquement en développement */}
              {isDevelopment && (
                <>
                  <Route path="debug-supabase" element={<DebugSupabase />} />
                  <Route path="debug-reservation" element={<DebugReservation />} />
                  <Route path="debug-reservation-form" element={<DebugReservationForm />} />
                </>
              )}

              <Route path="*" element={<NotFound />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
