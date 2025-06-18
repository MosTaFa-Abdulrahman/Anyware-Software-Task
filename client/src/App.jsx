import "./App.scss";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Loader } from "lucide-react";

import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Register from "./pages/auth/register/Register";
import Login from "./pages/auth/login/Login";
import Home from "./pages/home/Home";
import Announcement from "./pages/create/announcement/Announcement";
import Quiz from "./pages/create/quiz/Quiz";

// RTKQ
import { useGetCurrentUserQuery } from "./store/auth/authSlice";

function Layout({ children }) {
  const location = useLocation();
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(location.pathname);

  if (isAuthRoute) {
    return <div>{children}</div>;
  }

  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();

  if (isLoading) {
    return <Loader size={20} />;
  }

  if (error || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthRoute({ children }) {
  const { data: currentUser, isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return <Loader size={20} />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <Layout>
          <Routes>
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-announcement"
              element={
                <ProtectedRoute>
                  <Announcement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
