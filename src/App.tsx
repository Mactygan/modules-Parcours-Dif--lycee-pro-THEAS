import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { AdminRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import './App.css';

// Vérifier si on est en mode développement
const isDevelopment = import.meta.env.MODE === 'development';

// Code splitting : Charger les pages de manière paresseuse (lazy loading)
// Les pages ne seront chargées que lorsqu'elles sont nécessaires, réduisant ainsi le bundle initial
const Login = lazy(() => import('./pages/Login'));
const Index = lazy(() => import('./pages/Index'));
const Calendrier = lazy(() => import('./pages/Calendrier'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Profil = lazy(() => import('./pages/Profil'));
const Utilisateurs = lazy(() => import('./pages/Utilisateurs'));
const Supervision = lazy(() => import('./pages/Supervision'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Pages de debug (uniquement chargées en développement)
const DebugSupabase = isDevelopment ? lazy(() => import('./pages/DebugSupabase')) : null;
const DebugReservation = isDevelopment ? lazy(() => import('./pages/DebugReservation')) : null;
const DebugReservationForm = isDevelopment ? lazy(() => import('./pages/DebugReservationForm')) : null;

// Composant de fallback pour le chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Suspense fallback={<LoadingFallback />}>
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
                {isDevelopment && DebugSupabase && DebugReservation && DebugReservationForm && (
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
          </Suspense>

          <Toaster />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
