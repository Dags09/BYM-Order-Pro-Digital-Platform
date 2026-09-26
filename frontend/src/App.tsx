import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/protectedRoute";

import HomePage from "./pages/customer/homePage";
import ShopPage from "./pages/customer/shopPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import VerifyEmailPage from "./pages/verifyEmailPage";
import CartPage from "./pages/customer/cartPage";
import CheckoutPage from "./components/pageComponents/customer/shopPage/CheckoutPage";
import ProfilePage from "./pages/customer/profilePage";

import AdminLayout from "./components/pageComponents/admin/adminLayout";
import AdminDashboardPage from "./pages/admin/adminDashboardPage";
import AdminUsersPage from "./pages/admin/adminUsersPage";

import StaffLayout from "./components/pageComponents/staff/staffLayout";
import DeliveriesPage from "./pages/staff/deliveriesPage";
import DeliveryDetailPage from "./pages/staff/deliveryDetailPage";
import DeliveryHistoryPage from "./pages/staff/deliveryhistoryPage";

import ManagerLayout from "./components/pageComponents/manager/managerLayout";
import ManagerDashboardPage from "./pages/manager/managerDashboardPage";
import ManagerOrdersPage from "./pages/manager/managerOrdersPage";
import ManagerOrderDetailPage from "./pages/manager/managerOrderDetailPage";
import ManagerProductsPage from "./pages/manager/managerProductsPage";
import ManagerCategoriesPage from "./pages/manager/managerCategoriesPage";
import ManagerDriversPage from "./pages/manager/managerDriversPage";
import ManagerDriverDetailPage from "./pages/manager/managerDriverDetailPage";

import AccountSettings from "./pages/employAccountSettingsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route
                    path="/shop"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <ShopPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <CheckoutPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="settings" element={<AccountSettings />} />
                </Route>

                <Route
                    path="/staff"
                    element={
                        <ProtectedRoute allowedRoles={["staff"]}>
                            <StaffLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DeliveriesPage />} />
                    <Route path="history" element={<DeliveryHistoryPage />} />
                    <Route path=":id" element={<DeliveryDetailPage />} />
                    <Route path="settings" element={<AccountSettings />} />
                </Route>

                <Route
                    path="/manager"
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <ManagerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ManagerDashboardPage />} />
                    <Route path="orders" element={<ManagerOrdersPage />} />
                    <Route
                        path="orders/:id"
                        element={<ManagerOrderDetailPage />}
                    />
                    <Route path="products" element={<ManagerProductsPage />} />
                    <Route
                        path="categories"
                        element={<ManagerCategoriesPage />}
                    />
                    <Route path="drivers" element={<ManagerDriversPage />} />
                    <Route
                        path="drivers/:id"
                        element={<ManagerDriverDetailPage />}
                    />
                    <Route path="settings" element={<AccountSettings />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify" element={<VerifyEmailPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
