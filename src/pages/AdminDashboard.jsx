// src/pages/AdminDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const audioRef = useRef(null);

  // 🔔 Initialize socket connection
  useEffect(() => {
    const socket = io("http://localhost:8080");

    socket.on("newOrder", (order) => {
      console.log("📦 New order received:", order);
      setOrders((prev) => [order, ...prev]);

      // 🔊 Play sound safely
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.warn("⚠️ Sound play blocked until user interacts with the page:", err);
        });
      }

      // ✅ Optional: Visual alert
      alert(`📢 New Order from ${order.customer.name} (Table #${order.table.number})`);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, []);

  // 📦 Fetch data initially
  useEffect(() => {
    fetch("http://localhost:8080/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));

    fetch("http://localhost:8080/api/waiters")
      .then(res => res.json())
      .then(data => setWaiters(data));
  }, []);

  // ✅ Assign waiter
  const assignWaiter = async (orderId, waiterId) => {
    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waiterId }),
    });
    if (res.ok) {
      alert("✅ Waiter assigned!");
      const updatedOrders = await (await fetch("http://localhost:8080/api/orders")).json();
      setOrders(updatedOrders);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>📊 Admin Dashboard</h1>

      {/* 🔊 Hidden audio element */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto"></audio>

      {orders.length === 0 ? (
        <p>📭 No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Table</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Assign Waiter</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>#{order.table.number}</td>
                <td>{order.customer?.name}</td>
                <td>{order.customer?.phone}</td>
                <td>
                  {order.items.map((i) => (
                    <div key={i.id}>
                      {i.menuItem.name} × {i.quantity}
                    </div>
                  ))}
                </td>
                <td>₹{order.total}</td>
                <td>{order.status}</td>
                <td>
                  <select
                    onChange={(e) => assignWaiter(order.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">-- Select --</option>
                    {waiters.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
