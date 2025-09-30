import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const waiterId = localStorage.getItem("waiterId");

  useEffect(() => {
    if (!waiterId) window.location.href = "/waiter-login";

    const socket = io("http://localhost:8080");
    socket.emit("joinWaiterRoom", waiterId);

    socket.on("orderAssigned", (order) => {
      alert(`🍽️ New Order Assigned!\nTable #${order.table.number}`);
      const sound = new Audio("/alert.mp3");
      sound.play();
      setOrders((prev) => [order, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="waiter-dashboard">
      <h1>👨‍🍳 My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Table</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.table.number}</td>
                <td>{o.customer.name}</td>
                <td>{o.customer.phone}</td>
                <td>
                  {o.items.map((i) => (
                    <div key={i.id}>{i.menuItem.name} × {i.quantity}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
