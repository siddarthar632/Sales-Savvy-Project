import React, { useEffect, useState } from "react";
import "./CartPage.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: "",
    phone: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const shippingCost = 50.0; // Standard flat shipping fee in INR

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/items", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const items = data?.cart?.products?.map((item) => ({
          ...item,
          total_price: parseFloat(item.total_price).toFixed(2),
          price_per_unit: parseFloat(item.price_per_unit).toFixed(2),
        })) || [];
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Calculate subtotal
  useEffect(() => {
    const total = cartItems
      .reduce((sum, item) => sum + parseFloat(item.total_price), 0)
      .toFixed(2);
    setSubtotal(total);
  }, [cartItems]);

  // Remove item
  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:9090/api/cart/items/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok || response.status === 204) {
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      } else {
        // Fallback to legacy delete endpoint
        await fetch("http://localhost:9090/api/cart/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    try {
      const response = await fetch("http://localhost:9090/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product_id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total_price: (item.price_per_unit * newQuantity).toFixed(2),
                }
              : item
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || "Cannot update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleStartCheckout = () => {
    setShippingAddress((prev) => ({
      ...prev,
      recipientName: prev.recipientName || user || "",
    }));
    setShowAddressModal(true);
  };

  // Razorpay integration with totalAmount matching display
  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!shippingAddress.recipientName.trim() || !shippingAddress.phone.trim() || !shippingAddress.shippingAddress.trim()) {
      alert("Please fill in recipient name, phone, and delivery address.");
      return;
    }

    setShowAddressModal(false);
    setIsCheckingOut(true);

    const grandTotal = (parseFloat(subtotal) + shippingCost).toFixed(2);

    try {
      const requestBody = {
        totalAmount: grandTotal,
        cartItems: cartItems.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price_per_unit,
        })),
        recipientName: shippingAddress.recipientName,
        phone: shippingAddress.phone,
        shippingAddress: shippingAddress.shippingAddress,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      };

      const response = await fetch("http://localhost:9090/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      const razorpayOrderId = await response.text();

      const options = {
        key: "rzp_test_LqWBBDbgwot5lh",
        amount: Math.round(parseFloat(grandTotal) * 100),
        currency: "INR",
        name: "SalesSavvy",
        description: "Order Checkout",
        order_id: razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            const verifyResponse = await fetch("http://localhost:9090/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              alert("Payment verified successfully! Your order has been placed.");
              navigate("/orders");
            } else {
              const res = await verifyResponse.text();
              alert("Payment verification failed: " + res);
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Payment verification error. Please contact customer support.");
          }
        },
        prefill: {
          name: shippingAddress.recipientName || user,
          email: "customer@salessavvy.com",
          contact: shippingAddress.phone || "9999999999",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        alert("Payment failed: " + failResponse.error.description);
      });
      rzp.open();
    } catch (error) {
      alert("Checkout error: " + error.message);
      console.error("Error during checkout:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalProducts = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = (parseFloat(subtotal) + (cartItems.length > 0 ? shippingCost : 0)).toFixed(2);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header cartCount={0} username={user} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading your shopping cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header cartCount={0} username={user} />
        <div style={{ flex: 1, textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>🛒</div>
          <h2 style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Your Cart is Empty</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/customerhome"
            style={{
              display: "inline-block",
              background: "#6366f1",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Start Shopping Now →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header cartCount={totalProducts} username={user} />
      <div className="cart-container" style={{ flex: 1, maxWidth: "1200px", margin: "20px auto", width: "95%" }}>
        <div className="cart-page">
          <Link to="/customerhome" className="back-button" style={{ textDecoration: "none", color: "#6366f1" }}>
            ← Continue Shopping
          </Link>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>You have {cartItems.length} distinct item(s) in your cart</p>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={item.image_url || "https://via.placeholder.com/80?text=No+Image"}
                  alt={item.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=Product"; }}
                />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>Price: ₹{item.price_per_unit} each</span>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}>
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <span className="price">₹{item.total_price}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.product_id)}
                      title="Remove product"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Standard Shipping</span>
              <span>₹{shippingCost.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Total Items</span>
              <span>{totalProducts}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
            <button
              className="checkout-button"
              onClick={handleStartCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ marginBottom: "16px" }}>Shipping & Delivery Details</h2>
            <form onSubmit={handleProceedToPayment}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.recipientName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Delivery Address *</label>
                <textarea
                  required
                  rows="3"
                  value={shippingAddress.shippingAddress}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, shippingAddress: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Postal Code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: "10px 18px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 22px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                >
                  Pay ₹{grandTotal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CartPage;
