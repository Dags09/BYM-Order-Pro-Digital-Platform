import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminSideNavBar from "./layout/AdminSideNavBar";
import CustomerSideNavBar from "./layout/CustomerSideNavBar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminFeedbacks from "./pages/admin/Feedbacks";
import AdminQRCodes from "./pages/admin/Adminqrcodes";

import Orders from "./pages/staff/Orders";

import Home from "./pages/customer/Home";
import Shop from "./pages/customer/Shop";
import MyOrder from "./pages/customer/MyOrders";
import Profile from "./pages/customer/Profile";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminSideNavBar />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="products" element={<Products />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="feedbacks" element={<AdminFeedbacks />} />
                    <Route path="adminqrcodes" element={<AdminQRCodes />} />
                </Route>

                {/* Staff Routes */}
                <Route
                    path="/staff/orders"
                    element={
                        <ProtectedRoute allowedRoles={["staff"]}>
                            <Orders />
                        </ProtectedRoute>
                    }
                />

                {/* Customer Routes */}
                <Route
                    path="/customer"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <CustomerSideNavBar />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/customer/home" replace />} />
                    <Route path="home" element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="myOrders" element={<MyOrder />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Default */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;