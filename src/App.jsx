import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import CommunitiesList from './pages/CommunitiesList';
import CommunityDetail from './pages/CommunityDetail';
import ApartmentsList from './pages/ApartmentsList';
import ApartmentDetail from './pages/ApartmentDetail';
import UsersList from './pages/UsersList';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';  // ✅ new
import AdminDashboard from './pages/AdminDashboard';




export default function App() {
  return (
    <>
      <Nav />
      <main className="container container-max py-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/communities"
            element={
              <PrivateRoute>
                <CommunitiesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/communities/:id"
            element={
              <PrivateRoute>
                <CommunityDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/apartments"
            element={
              <PrivateRoute>
                <ApartmentsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/apartments/:id"
            element={
              <PrivateRoute>
                <ApartmentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersList />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
