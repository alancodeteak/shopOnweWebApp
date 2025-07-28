import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Function to map route path to a user-friendly title
const getTitleFromPathname = (pathname) => {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/orders":
      return "Orders";
    case "/orders/create":
      return "Create Order";
    case "/delivery-partners":
      return "Delivery Partners";
    case "/tickets":
      return "Tickets";
    case "/profile":
      return "Profile";
    default:
      // Handle dynamic routes like order details
      if (pathname.startsWith("/orders/")) {
        return "Order Details";
      }
      if (pathname.startsWith("/delivery-partners/")) {
        return "Partner Details";
      }
      return "Shopowner"; // Fallback title
  }
};

export default function MainLayout() {
  const location = useLocation();
  const title = getTitleFromPathname(location.pathname);

  return (
    <div className="font-sans bg-gray-50">
      <Header title={title} />
      <main className="pt-16 pb-16">
        <Outlet />
      </main>
      <Sidebar />
    </div>
  );
}
