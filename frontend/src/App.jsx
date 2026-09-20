import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import BrowseRFQs from "./pages/BrowseRFQs";
import BuyerRFQList from "./pages/BuyerRFQList";
import CreateRFQ from "./pages/CreateRFQ";
import EditRFQ from "./pages/EditRFQ";
import Login from "./pages/Login";
import MyQuotations from "./pages/MyQuotations";
import Register from "./pages/Register";
import RFQDetailBuyer from "./pages/RFQDetailBuyer";
import RFQDetailSupplier from "./pages/RFQDetailSupplier";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "BUYER") return <Navigate to="/buyer/rfqs" replace />;
  return <Navigate to="/supplier/browse" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/buyer/rfqs"
            element={
              <PrivateRoute allowedRole="BUYER">
                <BuyerRFQList />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/rfqs/new"
            element={
              <PrivateRoute allowedRole="BUYER">
                <CreateRFQ />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:id/edit"
            element={
              <PrivateRoute allowedRole="BUYER">
                <EditRFQ />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:id"
            element={
              <PrivateRoute allowedRole="BUYER">
                <RFQDetailBuyer />
              </PrivateRoute>
            }
          />

          <Route
            path="/supplier/browse"
            element={
              <PrivateRoute allowedRole="SUPPLIER">
                <BrowseRFQs />
              </PrivateRoute>
            }
          />
          <Route
            path="/supplier/rfqs/:id"
            element={
              <PrivateRoute allowedRole="SUPPLIER">
                <RFQDetailSupplier />
              </PrivateRoute>
            }
          />
          <Route
            path="/supplier/quotations"
            element={
              <PrivateRoute allowedRole="SUPPLIER">
                <MyQuotations />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
