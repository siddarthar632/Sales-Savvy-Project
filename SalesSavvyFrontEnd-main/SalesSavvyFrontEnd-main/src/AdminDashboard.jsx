import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import Logo from "./Logo";
import "./assets/styles.css";
import CustomModal from "./CustomModal";
import { useAuth } from "./AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);

  const cardData = [
    {
      title: "Add Product",
      description: "Create and publish new products with images, price and stock",
      team: "Product Management",
      modalType: "addProduct",
    },
    {
      title: "All Products",
      description: "View entire catalog, check stock counts and edit items",
      team: "Product Management",
      modalType: "allProducts",
    },
    {
      title: "Delete Product",
      description: "Remove products from inventory system by ID",
      team: "Product Management",
      modalType: "deleteProduct",
    },
    {
      title: "Customer Orders",
      description: "Track all orders, customer details, and update shipping status",
      team: "Order Management",
      modalType: "allOrders",
    },
    {
      title: "All Users",
      description: "List all registered accounts, emails, and roles",
      team: "User Management",
      modalType: "allUsers",
    },
    {
      title: "Modify User",
      description: "Update user details and change roles (Admin / Customer)",
      team: "User Management",
      modalType: "modifyUser",
    },
    {
      title: "View User Details",
      description: "Fetch and inspect profile details of a specific user ID",
      team: "User Management",
      modalType: "viewUser",
    },
    {
      title: "Day Business",
      description: "Track daily revenue, orders, and category breakdowns",
      team: "Analytics",
      modalType: "dailyBusiness",
    },
    {
      title: "Monthly Business",
      description: "View revenue metrics for specific months",
      team: "Analytics",
      modalType: "monthlyBusiness",
    },
    {
      title: "Yearly Business",
      description: "Analyze annual revenue performance and category sales",
      team: "Analytics",
      modalType: "yearlyBusiness",
    },
    {
      title: "Overall Business",
      description: "View all-time gross revenue across all successful orders",
      team: "Analytics",
      modalType: "overallBusiness",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  const handleAddProductSubmit = async (productData) => {
    try {
      const res = await fetch("http://localhost:9090/admin/products/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse({ product: data });
      } else {
        setResponse({ message: data.error || "Failed to add product" });
      }
      setModalType("addProduct");
    } catch (error) {
      setResponse({ message: "Error adding product: " + error.message });
    }
  };

  const handleDeleteProductSubmit = async ({ productId }) => {
    try {
      const res = await fetch("http://localhost:9090/admin/products/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse({ message: "Product deleted successfully!" });
      } else {
        setResponse({ message: `Error: ${data.error || "Failed to delete"}` });
      }
    } catch (error) {
      setResponse({ message: "Error deleting product: " + error.message });
    }
  };

  const handleGetAllProducts = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/products/all", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResponse({ products: data });
      } else {
        setResponse({ message: "Failed to fetch products" });
      }
    } catch (error) {
      setResponse({ message: "Error fetching products: " + error.message });
    }
  };

  const handleGetAllOrders = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/orders", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResponse({ orders: data });
      } else {
        setResponse({ message: "Failed to fetch orders" });
      }
    } catch (error) {
      setResponse({ message: "Error fetching orders: " + error.message });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:9090/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        handleGetAllOrders(); // refresh
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update order status");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleGetAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/user/all", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResponse({ users: data });
      } else {
        setResponse({ message: "Failed to fetch users" });
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
    }
  };

  const handleViewUserSubmit = async ({ userId }) => {
    try {
      const res = await fetch(`http://localhost:9090/admin/user/${userId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResponse({ user: data });
        setModalType("response");
      } else {
        const errorData = await res.json();
        setResponse({ message: errorData.error || "User not found" });
        setModalType("response");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("response");
    }
  };

  const handleModifyUserSubmit = async (payload) => {
    try {
      const res = await fetch("http://localhost:9090/admin/user/modify", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setResponse({ user: updatedUser });
        setModalType("response");
      } else {
        const err = await res.json();
        setResponse({ message: err.error || "Failed to modify user" });
        setModalType("response");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("response");
    }
  };

  const handleMonthlyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/monthly?month=${data?.month}&year=${data?.year}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const busData = await res.json();
        setResponse({ monthlyBusiness: busData });
        setModalType("monthlyBusiness");
      } else {
        const err = await res.json();
        setResponse({ message: err.error || "Error calculating monthly business" });
        setModalType("monthlyBusiness");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("monthlyBusiness");
    }
  };

  const handleDailyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/daily?date=${data?.date}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const busData = await res.json();
        setResponse({ dailyBusiness: busData });
        setModalType("dailyBusiness");
      } else {
        const err = await res.json();
        setResponse({ message: err.error || "Error calculating daily business" });
        setModalType("dailyBusiness");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("dailyBusiness");
    }
  };

  const handleYearlyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/yearly?year=${data?.year}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const busData = await res.json();
        setResponse({ yearlyBusiness: busData });
        setModalType("yearlyBusiness");
      } else {
        const err = await res.json();
        setResponse({ message: err.error || "Error calculating yearly business" });
        setModalType("yearlyBusiness");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("yearlyBusiness");
    }
  };

  const handleOverallBusiness = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/business/overall", {
        credentials: "include",
      });
      if (res.ok) {
        const busData = await res.json();
        setResponse({ overallBusiness: busData });
        setModalType("overallBusiness");
      } else {
        const err = await res.json();
        setResponse({ message: err.error || "Error calculating overall business" });
        setModalType("overallBusiness");
      }
    } catch (error) {
      setResponse({ message: "Error: " + error.message });
      setModalType("overallBusiness");
    }
  };

  const handleCardClick = (card) => {
    setModalType(card.modalType);
    setResponse(null);
    if (card.modalType === "allProducts") {
      handleGetAllProducts();
    } else if (card.modalType === "allOrders") {
      handleGetAllOrders();
    } else if (card.modalType === "allUsers") {
      handleGetAllUsers();
    } else if (card.modalType === "overallBusiness") {
      handleOverallBusiness();
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#1e1e2d", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Logo />
          <span style={{ fontSize: "14px", background: "#6366f1", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
            ADMIN CONSOLE
          </span>
        </div>
        <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="username">Logged in as: <strong>{user || "Admin"}</strong></span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content" style={{ padding: "40px 32px", maxWidth: "1300px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "8px", color: "#111827" }}>Administrative Operations</h2>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Manage catalog, customers, order statuses, and monitor real-time business performance.
        </p>

        <div className="cards-grid">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(card)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <span className="card-team">{card.team}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => {
            setModalType(null);
            setResponse(null);
          }}
          onSubmit={(data) => {
            switch (modalType) {
              case "addProduct":
                handleAddProductSubmit(data);
                break;
              case "deleteProduct":
                handleDeleteProductSubmit(data);
                break;
              case "viewUser":
                handleViewUserSubmit(data);
                break;
              case "modifyUser":
                handleModifyUserSubmit(data);
                break;
              case "monthlyBusiness":
                handleMonthlyBusiness(data);
                break;
              case "dailyBusiness":
                handleDailyBusiness(data);
                break;
              case "yearlyBusiness":
                handleYearlyBusiness(data);
                break;
              case "overallBusiness":
                handleOverallBusiness();
                break;
              default:
                break;
            }
          }}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          response={response}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
