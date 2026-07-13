// App.jsx — CampusConnect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/supabase.js';

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

function EnvErrorScreen() {
  return (
    <div style={{ padding: '3rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#e53e3e', fontSize: '2rem', marginBottom: '1rem' }}>Missing Database Configuration</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        The app is running, but it cannot connect to the database because the environment variables are missing in Vercel.
      </p>
      <div style={{ textAlign: 'left', background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0 }}>How to fix this in Vercel:</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Go to your <strong>Vercel Dashboard</strong> &gt; Your Project.</li>
          <li>Click the <strong>Settings</strong> tab.</li>
          <li>Select <strong>Environment Variables</strong>.</li>
          <li>Add Variable 1:<br/>Key: <code>VITE_SUPABASE_URL</code><br/>Value: <code>https://eposndkvwefutassaroz.supabase.co</code></li>
          <li>Add Variable 2:<br/>Key: <code>VITE_SUPABASE_ANON_KEY</code><br/>Value: <code>sb_publishable_gVeHwc2mZHjgAEWYs0eHug_UmM53rDB</code></li>
          <li>Go to the <strong>Deployments</strong> tab and hit <strong>Redeploy</strong>.</li>
        </ol>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <EnvErrorScreen />;
  }

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
