import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
const Layout = lazy(() => import("./Layout"));
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard/index"));
const Analytics = lazy(() => import("./Pages/Admin/Analytics/index"));
const BranchManagment = lazy(() => import("./Pages/Admin/BranchManagment/index"));
const FloorManagment = lazy(() => import("./Pages/Admin/FloorManagment/index"));
const GuestCRM = lazy(() => import("./Pages/Admin/Guest CRM/index"));
const Payment = lazy(() => import("./Pages/Admin/Payment/index"));
const MenuManagement = lazy(() => import("./Pages/Admin/MenuManagement/index"));
const Reservation = lazy(() => import("./Pages/Admin/Reservation/index"));
const Orders = lazy(() => import("./Pages/Admin/Orders/index"));
const Settings = lazy(() => import("./Pages/Admin/Settings/index"));
const RestaurantSettings = lazy(() => import("./Pages/Admin/RestaurantSettings/index"));
const BusinessHours = lazy(() => import("./Pages/Admin/Settings/BusinessHours"));
const ReservationPolicy = lazy(() => import("./Pages/Admin/Settings/ReservationPolicy"));
const TurnTimes = lazy(() => import("./Pages/Admin/Settings/TurnTimes"));
const Onboarding = lazy(() => import("./Pages/Admin/Onboarding/index"));
const StaffManagment = lazy(() => import("./Pages/Admin/StaffManagment/index"));
const StaffProfile = lazy(() => import("./Pages/Admin/StaffProfile/index"));
const Marketing = lazy(() => import("./Pages/Admin/Marketing/index"));
const Profile = lazy(() => import("./Pages/Admin/Profile/index"));
const Login = lazy(() => import("./Pages/Auth/Login"));
const Signup = lazy(() => import("./Pages/Auth/Signup"));
const RegisterRestaurant = lazy(() => import("./Pages/Auth/RegisterRestaurant"));
const BecomeSeller = lazy(() => import("./Pages/Auth/BecomeSeller"));
const ForgotPassword = lazy(() => import("./Pages/Auth/ForgotPassword"));
const Landing = lazy(() => import("./Pages/Public/Landing"));
const Restaurants = lazy(() => import("./Pages/Public/Restaurants"));
const RestaurantSearch = lazy(() => import("./Pages/Public/RestaurantSearch"));
const RestaurantDetail = lazy(() => import("./Pages/Public/RestaurantDetail"));
// const RestaurantMenu = lazy(() => import("./Pages/Public/RestaurantMenu"));
// const CartPage = lazy(() => import("./Pages/Public/Cart"));
const GuestProfile = lazy(() => import("./Pages/Public/GuestProfile"));
const SuperAdminLayout = lazy(() => import("./Layouts/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./Pages/SuperAdmin/Dashboard"));
const TenantManagement = lazy(() => import("./Pages/SuperAdmin/TenantManagement"));
const UserRoleManagement = lazy(() => import("./Pages/SuperAdmin/UserRoleManagement"));
const RolesPermissions = lazy(() => import("./Pages/SuperAdmin/RolesPermissions"));
const AuditLogs = lazy(() => import("./Pages/SuperAdmin/AuditLogs"));
const FeatureManagement = lazy(() => import("./Pages/SuperAdmin/FeatureManagement"));
const APIIntegrations = lazy(() => import("./Pages/SuperAdmin/APIIntegrations/index"));
const SecurityCompliance = lazy(() => import("./Pages/SuperAdmin/SecurityCompliance/index"));
const BackupRecovery = lazy(() => import("./Pages/SuperAdmin/BackupRecovery/index"));
const ReleaseManagement = lazy(() => import("./Pages/SuperAdmin/ReleaseManagement/index"));
const SystemHealth = lazy(() => import("./Pages/SuperAdmin/SystemHealth/index"));

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute allow={["admin", "owner", "staff", "manager"]} />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          {
            path: "branches",
            element: <BranchManagment />,
          },
          {
            path: "floor",
            element: <FloorManagment />,
          },
          {
            path: "staff",
            element: <StaffManagment />,
          },
          {
            path: "staff/:id",
            element: <StaffProfile />,
          },
          {
            path: "reservation",
            element: <Reservation />,
          },
          {
            path: "orders",
            element: <Orders />,
          },
          {
            path: "payment",
            element: <Payment />,
          },
          {
            path: "menu",
            element: <MenuManagement />,
          },
          {
            path: "guest-crm",
            element: <GuestCRM />,
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "restaurant-settings",
            element: <RestaurantSettings />,
          },
          {
            path: "business-hours",
            element: <BusinessHours />,
          },
          {
            path: "reservation-policy",
            element: <ReservationPolicy />,
          },
          {
            path: "turn-times",
            element: <TurnTimes />,
          },
          {
            path: "onboarding",
            element: <Onboarding />,
          },
          {
            path: "marketing",
            element: <Marketing />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
  {
    path: "/super-admin",
    element: <ProtectedRoute allow={["super-admin"]} />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          {
            path: "",
            element: <SuperAdminDashboard />,
          },
          {
            path: "tenants",
            element: <TenantManagement />,
          },
          {
            path: "users",
            element: <UserRoleManagement />,
          },
          {
            path: "roles",
            element: <RolesPermissions />,
          },
          {
            path: "audit-logs",
            element: <AuditLogs />,
          },
          {
            path: "features",
            element: <FeatureManagement />,
          },
          {
            path: "api",
            element: <APIIntegrations />,
          },
          {
            path: "security",
            element: <SecurityCompliance />,
          },
          {
            path: "backup",
            element: <BackupRecovery />,
          },
          {
            path: "releases",
            element: <ReleaseManagement />,
          },
          {
            path: "health",
            element: <SystemHealth />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/register-restaurant",
    element: <RegisterRestaurant />,
  },
  {
    path: "/become-seller",
    element: <BecomeSeller />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/restaurants",
    element: <Restaurants />,
  },
  {
    path: "/restaurant-search",
    element: <RestaurantSearch />,
  },
  // {
  //   path: "/cart",
  //   element: <CartPage />,
  // },
  {
    path: "/restaurants/:restaurantId/branches/:branchId",
    element: <RestaurantDetail />,
  },
  {
    path: "/restaurants/:id",
    element: <RestaurantDetail />,
  },
  // {
  //   path: "/restaurants/:id/menu",
  //   element: <RestaurantMenu />,
  // },
  {
    path: "/guest-profile",
    element: <ProtectedRoute allow={["user"]} />,
    children: [
      {
        index: true,
        element: <GuestProfile />,
      },
    ],
  },
]);
