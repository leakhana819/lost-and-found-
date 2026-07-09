// App.jsx — CampusConnect
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ItemProvider } from './context/ItemContext.jsx';

// Utilities
import { isSeeded } from './utils/localStorage.js';
import { seedDemoData } from './utils/seedData.js';

// Components
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ToastContainer from './components/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BrowseItems from './pages/BrowseItems.jsx';
import ReportItem from './pages/ReportItem.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import MyPosts from './pages/MyPosts.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

// Component to handle redirecting authenticated users away from auth pages
function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  // Seed demo data on very first launch
  useEffect(() => {
    if (!isSeeded()) {
      seedDemoData();
      // small reload trick to ensure state picks it up if it wasn't reactive,
      // but our context initialization will pick it up on next render.
      // Easiest is to force a reload just once.
      window.location.reload();
    }
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowseItems /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
          <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ItemProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ItemProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
