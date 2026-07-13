// App.jsx — CampusConnect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ItemProvider } from './context/ItemContext.jsx';

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

// Redirect authenticated users away from auth pages
function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
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
