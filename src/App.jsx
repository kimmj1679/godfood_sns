import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/common/Layout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import PostCreatePage from './pages/PostCreatePage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import MyPage from './pages/MyPage.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to='/auth' replace />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/' element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path='explore' element={<ExplorePage />} />
          <Route path='create' element={<PostCreatePage />} />
          <Route path='post/:id' element={<PostDetailPage />} />
          <Route path='my' element={<MyPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
