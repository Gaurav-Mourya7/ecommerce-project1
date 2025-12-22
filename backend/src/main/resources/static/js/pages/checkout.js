import { createOrder } from "../api/order.js";
import { getCart } from "../api/cart.js";

const form = document.getElementById("checkoutForm");
const summary = document.getElementById("summary");

init();

async function init() {
  try {
    const cart = await getCart();
    const items = cart?.cartItems || [];
    const subtotal = items.reduce((s, it) => s + (it.price || it.product?.sellingPrice || 0) * (it.quantity || 1), 0);
    summary.textContent = `Items: ${items.length}, Total: ₹${subtotal.toFixed(2)}`;
  } catch (e) {
    summary.textContent = `Login required to view cart summary.`;
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const address = {
    firstName: document.getElementById('fullName').value,
    address: document.getElementById('streetAddress').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zipCode: document.getElementById('postalCode').value,
    mobile: document.getElementById('mobile').value,
  };
  const paymentMethod = (new FormData(form).get('pmethod')) || 'RAZORPAY';
  try {
    const res = await createOrder(address, paymentMethod);
    const url = res?.payment_link_url;
    if (url) {
      location.href = url; // redirect to payment link
    } else {
      alert('Order created, but no payment link returned');
    }
  } catch (e) {
    alert('Failed to create order');
    console.error(e);
  }
});


