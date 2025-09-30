import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MenuPage.css";

export default function MenuPage() {
  const { slug, tableNumber } = useParams();

  // 🌐 States
  const [step, setStep] = useState(1); // 1️⃣ Welcome -> 2️⃣ Menu -> 3️⃣ Thank You
  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);

  // 🥗 Fetch menu when component loads
  useEffect(() => {
    fetch(`https://qr-menu-backend-way6.onrender.com/api/menu/${slug}/${tableNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load menu:", err);
        setLoading(false);
      });
  }, [slug, tableNumber]);

  // ➕ Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ➖ Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ✅ Place order
  const placeOrder = async () => {
    if (!customer.name || !customer.phone) {
      alert("⚠️ Please enter your name and phone number.");
      return;
    }
    if (cart.length === 0) {
      alert("🛒 Please add at least one item to your order.");
      return;
    }

    const res = await fetch(`https://qr-menu-backend-way6.onrender.com/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        tableNumber,
        customerName: customer.name,
        phone: customer.phone,
        items: cart,
      }),
    });

    if (res.ok) {
      setCart([]);
      setStep(3);
    } else {
      alert("❌ Failed to place order. Try again.");
    }
  };

  if (loading) return <h2 className="loading-text">Loading menu...</h2>;

  // 1️⃣ WELCOME SCREEN
  if (step === 1) {
    return (
      <div className="full-screen">
        <div className="center-card">
          <h1>🍽️ Welcome to {menu?.name}</h1>
          <p>Please enter your details to start ordering</p>

          <input
            type="text"
            placeholder="👤 Your Name"
            onChange={(e) =>
              setCustomer({ ...customer, name: e.target.value })
            }
          />
          <input
            type="tel"
            placeholder="📞 Phone Number"
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
          />

          <button
            className="primary-btn"
            onClick={() => {
              if (!customer.name || !customer.phone) {
                alert("⚠️ Please fill in both fields.");
                return;
              }
              setStep(2);
            }}
          >
            Start Ordering 🚀
          </button>
        </div>
      </div>
    );
  }

  // 2️⃣ MENU SCREEN
  if (step === 2) {
    return (
      <div className="full-screen">
        <div className="menu-container">
          <div className="menu-header">
            <h1>🍲 {menu?.name} – Menu</h1>
            <h3>📍 Table #{tableNumber}</h3>
          </div>

          <div className="menu-content">
            {menu?.categories?.map((cat) => (
              <div key={cat.id} className="category">
                <h2>{cat.name}</h2>
                <div className="items">
                  {cat.items.map((item) => (
                    <div className="item" key={item.id}>
                      <div className="item-name">
                        {item.name} – ₹{item.price}
                      </div>
                      <div className="qty-controls">
                        <button onClick={() => removeFromCart(item.id)}>-</button>
                        <span>{cart.find((i) => i.id === item.id)?.qty || 0}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="cart">
            <h3>🛒 Your Cart ({cart.length} items)</h3>
            {cart.map((item) => (
              <p key={item.id}>
                {item.name} – ₹{item.price} × {item.qty} = ₹
                {item.price * item.qty}
              </p>
            ))}
          </div>

          <button className="primary-btn" onClick={placeOrder}>
            ✅ Place Order
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ THANK YOU SCREEN
  if (step === 3) {
    return (
      <div className="full-screen">
        <div className="center-card">
          <h1>🎉 Thank You, {customer.name}!</h1>
          <p>Your order has been placed successfully.</p>
          <p>Our team will serve you shortly 🍴</p>
          <p>
            <strong>Table:</strong> #{tableNumber}
          </p>
          <p>
            <strong>Contact:</strong> {customer.phone}
          </p>

          <button className="primary-btn" onClick={() => window.location.reload()}>
            🏠 Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return null;
}
