import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard";
import OrdersList from "../pages/orders/List";
import OrderDetails from "../pages/orders/Details";
import CreateOrder from "../pages/orders/Create";
import AssignOrder from "../pages/orders/AssignOrder";
import AssignSuccess from "../pages/orders/AssignSuccess";
import NewOrders from "../pages/orders/NewOrders";
import OngoingOrders from "../pages/orders/OngoingOrders";
import TicketsPage from "../pages/tickets";
import DeliveryPartnerList from "../pages/deliveryPartners/List";
import CreateDeliveryPartner from "../pages/deliveryPartners/Create";
import DeliveryPartnerDetails from "../pages/deliveryPartners/Details";
import CompletedOrders from "../pages/completed";
import Profile from "../pages/profile";
import Promotions from "../pages/promotions";
import Login from "../pages/auth/Login";
import PrivateRoute from "./PrivateRoute";
import Analytics from "../pages/dashboard/Analytics";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "dashboard/analytics", element: <Analytics /> },
      { path: "orders/new", element: <NewOrders /> },
      { path: "orders/ongoing", element: <OngoingOrders /> },
      { path: "tickets", element: <TicketsPage /> },
      { path: "orders", element: <OrdersList /> },
      { path: "orders/:id", element: <OrderDetails /> },
      { path: "orders/create", element: <CreateOrder /> },
      { path: "orders/assign/:id", element: <AssignOrder /> },
      { path: "orders/assign/success", element: <AssignSuccess /> },
      { path: "delivery-partners", element: <DeliveryPartnerList /> },
      { path: "delivery-partners/create", element: <CreateDeliveryPartner /> },
      { path: "delivery-partners/:id", element: <DeliveryPartnerDetails /> },
      { path: "delivery-partners/:id/edit", element: <DeliveryPartnerDetails /> },
      { path: "completed", element: <CompletedOrders /> },
      { path: "profile", element: <Profile /> },
      { path: "promotions", element: <Promotions /> },
      { path: "", element: <Dashboard /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
