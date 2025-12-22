import { getSellerProfile, getSellerReport, listSellerOrders, listSellerProducts } from "../api/seller.js";

const root = document.getElementById('sellerDashboardRoot');

init();

async function init() {
  try {
    const [profile, report, orders, products] = await Promise.all([
      getSellerProfile(),
      getSellerReport(),
      listSellerOrders(),
      listSellerProducts(),
    ]);
    render(profile, report, orders, products);
  } catch (e) {
    root.innerHTML = `<p class="text-gray-500">Failed to load dashboard</p>`;
  }
}

function render(profile, report, orders, products) {
  const recentOrders = (orders || []).slice(0,5);
  const recentProducts = (products || []).slice(0,5);

  root.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${card("Total Orders", orders.length)}
      ${card("Active Products", products.length)}
      ${card("Canceled Orders", report?.canceledOrders || 0)}
      ${currencyCard("Total Refunds", report?.totalRefunds || 0)}
    </div>
    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <section class="bg-white border rounded p-4">
        <h2 class="font-semibold mb-3">Recent Orders</h2>
        <div class="divide-y">
          ${recentOrders.map(o => `
            <div class="py-2 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">#${o.id}</div>
                <div class="text-xs text-gray-500">Items: ${o.orderItems?.length || 0}</div>
              </div>
              <span class="text-xs px-2 py-1 rounded border">${o.orderStatus}</span>
            </div>
          `).join('') || `<div class="text-sm text-gray-500">No recent orders</div>`}
        </div>
      </section>
      <section class="bg-white border rounded p-4">
        <h2 class="font-semibold mb-3">Recent Products</h2>
        <div class="divide-y">
          ${recentProducts.map(p => `
            <div class="py-2 flex items-center justify-between">
              <div class="min-w-0">
                <div class="text-sm font-medium truncate max-w-[280px]">${p.title}</div>
                <div class="text-xs text-gray-500">Rs ${p.sellingPrice} <span class="line-through text-gray-400">${p.mrpPrice}</span></div>
              </div>
              <a href="seller-products.html" class="text-xs underline">Edit</a>
            </div>
          `).join('') || `<div class="text-sm text-gray-500">No products</div>`}
        </div>
      </section>
    </div>
  `;
}

function card(label, value) {
  return `
    <div class="bg-white border rounded p-4">
      <div class="text-xs text-gray-500">${label}</div>
      <div class="text-2xl font-semibold">${value}</div>
    </div>
  `;
}

function currencyCard(label, value) {
  return `
    <div class="bg-white border rounded p-4">
      <div class="text-xs text-gray-500">${label}</div>
      <div class="text-2xl font-semibold">₹${value}</div>
    </div>
  `;
}


