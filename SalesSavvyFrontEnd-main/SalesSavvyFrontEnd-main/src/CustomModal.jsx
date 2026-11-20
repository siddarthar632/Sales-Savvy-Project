import React, { useState } from "react";
import "./assets/modalStyles.css";

const CustomModal = ({ modalType, onClose, onSubmit, onUpdateOrderStatus, response }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "1",
    imageUrl: "",
    month: "",
    year: "",
    date: "",
  });

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneralInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (modalType) {
      case "addProduct": {
        const processedData = {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          categoryId: parseInt(formData.categoryId, 10),
        };
        onSubmit(processedData);
        break;
      }
      case "deleteProduct": {
        const productId = parseInt(inputValue, 10);
        onSubmit({ productId });
        break;
      }
      case "viewUser": {
        const userId = parseInt(inputValue, 10);
        onSubmit({ userId });
        break;
      }
      case "monthlyBusiness": {
        onSubmit({ month: formData.month, year: formData.year });
        break;
      }
      case "dailyBusiness": {
        onSubmit({ date: formData.date });
        break;
      }
      case "yearlyBusiness": {
        onSubmit({ year: formData.year });
        break;
      }
      case "overallBusiness": {
        onSubmit();
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, overflowY: "auto" }}>
      <div className="modal-content" style={{ background: "#fff", borderRadius: "12px", padding: "28px", maxWidth: "800px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Add Product */}
        {modalType === "addProduct" &&
          (!response?.product ? (
            <>
              <h2>Add New Product</h2>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="name">Product Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Classic Oxford Shirt"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-form-item">
                  <label htmlFor="price">Price (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    required
                    placeholder="e.g. 1299.00"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-form-item">
                  <label htmlFor="stock">Initial Stock:</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    placeholder="e.g. 25"
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-form-item">
                  <label htmlFor="categoryId">Category ID:</label>
                  <input
                    type="number"
                    id="categoryId"
                    name="categoryId"
                    required
                    placeholder="Category ID (e.g. 1)"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-form-item">
                  <label htmlFor="imageUrl">Product Image URL:</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    required
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-form-item">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    placeholder="Detailed product specifications..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Submit
                  </button>
                  <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div>
              <h2 style={{ color: "#10b981" }}>Product Added Successfully!</h2>
              <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                <p><strong>Product ID:</strong> {response.product.productId}</p>
                <p><strong>Name:</strong> {response.product.name}</p>
                <p><strong>Price:</strong> ₹{response.product.price}</p>
                <p><strong>Stock:</strong> {response.product.stock}</p>
              </div>
              <button onClick={onClose} style={{ marginTop: "16px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                Close
              </button>
            </div>
          ))}

        {/* All Products */}
        {modalType === "allProducts" && (
          <div>
            <h2>Inventory Catalog</h2>
            {response?.products && response.products.length > 0 ? (
              <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>ID</th>
                      <th style={{ padding: "10px" }}>Image</th>
                      <th style={{ padding: "10px" }}>Name</th>
                      <th style={{ padding: "10px" }}>Category</th>
                      <th style={{ padding: "10px" }}>Price</th>
                      <th style={{ padding: "10px" }}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.products.map((p) => (
                      <tr key={p.productId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px" }}>{p.productId}</td>
                        <td style={{ padding: "10px" }}>
                          <img src={p.imageUrl || "https://via.placeholder.com/40"} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "10px", fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: "10px" }}>{p.category}</td>
                        <td style={{ padding: "10px" }}>₹{p.price}</td>
                        <td style={{ padding: "10px", color: p.stock <= 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                          {p.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: "16px" }}>{response?.message || "Loading inventory..."}</p>
            )}
            <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}

        {/* Delete Product */}
        {modalType === "deleteProduct" &&
          (!response?.message ? (
            <div>
              <h2>Delete Product</h2>
              <p style={{ color: "#6b7280", marginBottom: "16px" }}>Enter the ID of the product you want to permanently remove:</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="number"
                  required
                  placeholder="Enter Product ID"
                  value={inputValue}
                  onChange={handleGeneralInputChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", marginBottom: "16px" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Delete
                  </button>
                  <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2>{response.message}</h2>
              <button onClick={onClose} style={{ marginTop: "16px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                Close
              </button>
            </div>
          ))}

        {/* Customer Orders Management */}
        {modalType === "allOrders" && (
          <div>
            <h2>Customer Orders Management</h2>
            {response?.orders && response.orders.length > 0 ? (
              <div style={{ maxHeight: "65vh", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {response.orders.map((ord) => (
                  <div key={ord.orderId} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", background: "#f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div>
                        <strong>Order #{ord.orderId}</strong>
                        <span style={{ marginLeft: "12px", color: "#6b7280", fontSize: "13px" }}>
                          Customer: {ord.username} ({ord.email})
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.orderId, e.target.value)}
                          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d5db", fontWeight: 600 }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                      Total Amount: <strong style={{ color: "#6366f1" }}>₹{ord.totalAmount}</strong> | Placed: {ord.createdAt}
                    </div>

                    {ord.shippingAddress && (
                      <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "8px", background: "#fff", padding: "6px 10px", borderRadius: "4px" }}>
                        📍 Ship to: {ord.recipientName} - {ord.shippingAddress}, {ord.city} {ord.postalCode} (Phone: {ord.phone})
                      </div>
                    )}

                    <div style={{ fontSize: "13px" }}>
                      <strong>Items ({ord.items?.length || 0}):</strong>
                      <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                        {ord.items?.map((it, idx) => (
                          <li key={idx}>
                            {it.name} - Qty: {it.quantity} x ₹{it.pricePerUnit} = ₹{it.totalPrice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: "16px" }}>{response?.message || "Loading orders..."}</p>
            )}
            <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}

        {/* All Users */}
        {modalType === "allUsers" && (
          <div>
            <h2>Registered Users</h2>
            {response?.users && response.users.length > 0 ? (
              <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>User ID</th>
                      <th style={{ padding: "10px" }}>Username</th>
                      <th style={{ padding: "10px" }}>Email</th>
                      <th style={{ padding: "10px" }}>Role</th>
                      <th style={{ padding: "10px" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.users.map((u) => (
                      <tr key={u.userId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px" }}>{u.userId}</td>
                        <td style={{ padding: "10px", fontWeight: 600 }}>{u.username}</td>
                        <td style={{ padding: "10px" }}>{u.email}</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: "12px", background: u.role === "ADMIN" ? "#ede9fe" : "#d1fae5", color: u.role === "ADMIN" ? "#6366f1" : "#059669", fontWeight: 600 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "10px", color: "#6b7280" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: "16px" }}>{response?.message || "Loading users..."}</p>
            )}
            <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}

        {/* View User Details */}
        {modalType === "viewUser" && (
          <div>
            <h2>Inspect User Details</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                required
                placeholder="Enter User ID"
                value={inputValue}
                onChange={handleGeneralInputChange}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", margin: "16px 0" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Find User
                </button>
                <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Response Display (User Details) */}
        {modalType === "response" && response && (
          <div>
            {response.user ? (
              <div>
                <h2>User Profile Details</h2>
                <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px", lineHeight: 1.8 }}>
                  <p><strong>User ID:</strong> {response.user.userId}</p>
                  <p><strong>Username:</strong> {response.user.username}</p>
                  <p><strong>Email:</strong> {response.user.email}</p>
                  <p><strong>Role:</strong> {response.user.role}</p>
                  <p><strong>Registered:</strong> {new Date(response.user.createdAt).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(response.user.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div>
                <h2>Result</h2>
                <p>{response.message || "Operation completed."}</p>
              </div>
            )}
            <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Monthly Business */}
        {modalType === "monthlyBusiness" && (
          <div>
            <h2>Monthly Business Analytics</h2>
            {!response?.monthlyBusiness ? (
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="month">Month (1-12):</label>
                  <input
                    type="number"
                    id="month"
                    name="month"
                    required
                    min="1"
                    max="12"
                    placeholder="e.g. 11"
                    value={formData.month}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="year">Year:</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    required
                    placeholder="e.g. 2026"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Submit
                  </button>
                  <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981", marginBottom: "16px" }}>
                  Total Business: ₹{response.monthlyBusiness.totalBusiness?.toFixed(2)}
                </div>
                <h3>Category Sales</h3>
                <div style={{ marginTop: "8px" }}>
                  {response.monthlyBusiness.categorySales && Object.keys(response.monthlyBusiness.categorySales).length > 0 ? (
                    Object.entries(response.monthlyBusiness.categorySales).map(([cat, qty]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span>{cat}</span>
                        <strong>{qty} items</strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#6b7280" }}>No category sales recorded for this period.</p>
                  )}
                </div>
                <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* Daily Business */}
        {modalType === "dailyBusiness" && (
          <div>
            <h2>Daily Business Analytics</h2>
            {!response?.dailyBusiness ? (
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="date">Date (YYYY-MM-DD):</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Submit
                  </button>
                  <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981", marginBottom: "16px" }}>
                  Total Business: ₹{response.dailyBusiness.totalBusiness?.toFixed(2)}
                </div>
                <h3>Category Sales</h3>
                <div style={{ marginTop: "8px" }}>
                  {response.dailyBusiness.categorySales && Object.keys(response.dailyBusiness.categorySales).length > 0 ? (
                    Object.entries(response.dailyBusiness.categorySales).map(([cat, qty]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span>{cat}</span>
                        <strong>{qty} items</strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#6b7280" }}>No category sales recorded for this date.</p>
                  )}
                </div>
                <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* Yearly Business */}
        {modalType === "yearlyBusiness" && (
          <div>
            <h2>Yearly Business Analytics</h2>
            {!response?.yearlyBusiness ? (
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="year">Year:</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    required
                    placeholder="e.g. 2026"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Submit
                  </button>
                  <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981", marginBottom: "16px" }}>
                  Total Business: ₹{response.yearlyBusiness.totalBusiness?.toFixed(2)}
                </div>
                <h3>Category Sales</h3>
                <div style={{ marginTop: "8px" }}>
                  {response.yearlyBusiness.categorySales && Object.keys(response.yearlyBusiness.categorySales).length > 0 ? (
                    Object.entries(response.yearlyBusiness.categorySales).map(([cat, qty]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span>{cat}</span>
                        <strong>{qty} items</strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#6b7280" }}>No category sales recorded for this year.</p>
                  )}
                </div>
                <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* Overall Business */}
        {modalType === "overallBusiness" && (
          <div>
            <h2>Overall Lifetime Revenue</h2>
            {response?.overallBusiness ? (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981", marginBottom: "16px" }}>
                  Gross Revenue: ₹{response.overallBusiness.totalBusiness?.toFixed(2)}
                </div>
                <h3>Lifetime Category Breakdown</h3>
                <div style={{ marginTop: "8px" }}>
                  {response.overallBusiness.categorySales && Object.keys(response.overallBusiness.categorySales).length > 0 ? (
                    Object.entries(response.overallBusiness.categorySales).map(([cat, qty]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span>{cat}</span>
                        <strong>{qty} items sold</strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#6b7280" }}>No sales recorded yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p>{response?.message || "Calculating overall business..."}</p>
            )}
            <button onClick={onClose} style={{ marginTop: "20px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}

        {/* Modify User */}
        {modalType === "modifyUser" && (
          <ModifyUserFormComponent onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default CustomModal;

const ModifyUserFormComponent = ({ onClose }) => {
  const [userIdInput, setUserIdInput] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchUser = async (e) => {
    e.preventDefault();
    if (!userIdInput) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:9090/admin/user/${userIdInput}`, {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        setUserDetails(user);
      } else {
        const err = await response.json();
        setError(err.error || "User not found");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const email = form.email.value;
    const role = form.role.value;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:9090/admin/user/modify", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userDetails.userId,
          username,
          email,
          role,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserDetails(updatedUser);
        setUpdated(true);
      } else {
        const err = await response.json();
        setError(err.error || "Failed to update user");
      }
    } catch (err) {
      setError("Error updating user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userDetails) {
    return (
      <div>
        <h2>Modify User Account</h2>
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
        <form onSubmit={handleFetchUser} style={{ marginTop: "16px" }}>
          <div className="modal-form-item">
            <label htmlFor="user-id">Enter User ID:</label>
            <input
              type="number"
              id="user-id"
              required
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              {loading ? "Fetching..." : "Fetch User"}
            </button>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (userDetails && !updated) {
    return (
      <div>
        <h2>Edit User #{userDetails.userId}</h2>
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
        <form onSubmit={handleUpdateUser} className="modal-form" style={{ marginTop: "16px" }}>
          <div className="modal-form-item">
            <label htmlFor="user-id">User ID (Read Only):</label>
            <input
              type="text"
              id="user-id"
              name="user-id"
              value={userDetails.userId}
              readOnly
              style={{ background: "#f3f4f6" }}
            />
          </div>
          <div className="modal-form-item">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              defaultValue={userDetails.username}
            />
          </div>

          <div className="modal-form-item">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={userDetails.email}
            />
          </div>
          <div className="modal-form-item">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              defaultValue={userDetails.role}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (updated) {
    return (
      <div>
        <h2 style={{ color: "#10b981" }}>User Updated Successfully!</h2>
        <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
          <p><strong>User ID:</strong> {userDetails.userId}</p>
          <p><strong>Username:</strong> {userDetails.username}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role}</p>
        </div>
        <button onClick={onClose} style={{ marginTop: "16px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Close
        </button>
      </div>
    );
  }

  return null;
};
