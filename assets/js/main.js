// GANTI: gunakan nomor WhatsApp toko dalam format internasional tanpa tanda plus.
const WHATSAPP_NUMBER = "6281234567890";
// GANTI: sesuaikan nama toko dengan nama brand yang digunakan.
const STORE_NAME = "Tenun Nusa";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const CART_STORAGE_KEY = "tenun-nusa-cart-v1";
const grid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const catalogStatus = document.querySelector("#catalog-status");
const dialog = document.querySelector("#product-dialog");
const dialogContent = document.querySelector("#dialog-content");
const cartDrawer = document.querySelector("#cart-drawer");
const cartBackdrop = document.querySelector("#drawer-backdrop");
const cartContent = document.querySelector("#cart-content");
const cartFooter = document.querySelector("#drawer-footer");
const toast = document.querySelector("#toast");
const cartButton = document.querySelector(".cart-trigger");
const cartCount = document.querySelector(".cart-count");
const drawerCount = document.querySelector(".drawer-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const categoryButtons = [...document.querySelectorAll(".category-button")];
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const checkoutForm = document.querySelector("#checkout-form");
const whatsappFallback = document.querySelector("#whatsapp-fallback");
const whatsappFallbackLink = document.querySelector("#whatsapp-fallback-link");

let lastFocusedElement = null;
let toastTimer;
let activeCategory = "Semua";
let cart = loadCart();
let menuLastFocusedElement = null;

function setMenuOpen(isOpen, restoreFocus = false) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
  mainNav.classList.toggle("is-open", isOpen);
  if (!isOpen && restoreFocus) menuLastFocusedElement?.focus();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function loadCart() {
  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];
    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) throw new TypeError("Format keranjang tidak valid.");
    return parsedCart.filter((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return product && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= product.stok;
    });
  } catch (error) {
    console.error("Keranjang tidak dapat dimuat dari penyimpanan lokal.", error);
    showToast("Keranjang tersimpan tidak dapat dibaca. Silakan tambahkan produk kembali.");
    return [];
  }
}

function saveCart() {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error("Keranjang tidak dapat disimpan ke penyimpanan lokal.", error);
    showToast("Keranjang tidak dapat disimpan di perangkat ini.");
    return false;
  }
}

function filteredProducts() {
  const term = searchInput.value.trim().toLocaleLowerCase("id-ID");
  const matching = products.filter((product) => {
    const matchesCategory = activeCategory === "Semua" || product.kategori === activeCategory;
    return matchesCategory && product.nama.toLocaleLowerCase("id-ID").includes(term);
  });
  if (sortSelect.value === "harga-rendah") matching.sort((a, b) => a.harga - b.harga);
  if (sortSelect.value === "harga-tinggi") matching.sort((a, b) => b.harga - a.harga);
  return matching;
}

function renderProducts() {
  const visibleProducts = filteredProducts();
  grid.innerHTML = visibleProducts.map((product) => {
    const badge = product.label ? `<span class="product-badge ${product.label === "Terlaris" ? "badge-best" : ""}">${escapeHtml(product.label)}</span>` : "";
    const oldPrice = product.hargaCoret ? `<span class="price-old">${rupiah.format(product.hargaCoret)}</span>` : "";
    return `<article class="product-card">
      <button class="product-visual" type="button" data-product-id="${escapeHtml(product.id)}" aria-label="Lihat detail ${escapeHtml(product.nama)}">
        <img src="${escapeHtml(product.gambar)}" width="640" height="720" alt="${escapeHtml(product.nama)}" loading="lazy">
        ${badge}
        <span class="quick-view">Lihat detail <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></span>
      </button>
      <div class="product-info"><p class="product-category">${escapeHtml(product.kategori)}</p><h3><button type="button" class="product-name" data-product-id="${escapeHtml(product.id)}">${escapeHtml(product.nama)}</button></h3>
      <div class="product-price"><strong>${rupiah.format(product.harga)}</strong>${oldPrice}</div></div>
    </article>`;
  }).join("");
  emptyState.hidden = visibleProducts.length > 0;
  grid.hidden = visibleProducts.length === 0;
  catalogStatus.textContent = visibleProducts.length
    ? `${visibleProducts.length} produk ditampilkan.`
    : "Produk tidak ditemukan. Coba kata kunci atau kategori yang berbeda.";
}

function openProductDialog(productId, trigger) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;
  lastFocusedElement = trigger;
  const badge = product.label ? `<span class="product-badge ${product.label === "Terlaris" ? "badge-best" : ""}">${escapeHtml(product.label)}</span>` : "";
  dialogContent.innerHTML = `<div class="dialog-image"><img src="${escapeHtml(product.gambar)}" width="640" height="720" alt="${escapeHtml(product.nama)}" loading="lazy"></div>
    <div class="dialog-details"><p class="product-category">${escapeHtml(product.kategori)}</p>${badge}<h2 id="dialog-title">${escapeHtml(product.nama)}</h2>
    <div class="dialog-price"><strong>${rupiah.format(product.harga)}</strong>${product.hargaCoret ? `<span class="price-old">${rupiah.format(product.hargaCoret)}</span>` : ""}</div>
    <p class="dialog-description">${escapeHtml(product.deskripsi)}</p><p class="stock-note">${product.stok > 0 ? `Tersedia ${product.stok} buah` : "Stok habis"}</p>
    <form class="add-to-cart-form" data-product-id="${escapeHtml(product.id)}"><label for="product-quantity">Jumlah</label><div class="quantity-stepper"><button type="button" class="quantity-adjust" data-delta="-1" aria-label="Kurangi jumlah"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12"/></svg></button><input id="product-quantity" name="quantity" type="number" min="1" max="${product.stok}" value="1" inputmode="numeric" required><button type="button" class="quantity-adjust" data-delta="1" aria-label="Tambah jumlah"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12"/></svg></button></div><button class="button button-primary add-button" type="submit" ${product.stok ? "" : "disabled"}>Tambah ke Keranjang <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></button></form></div>`;
  dialog.showModal();
  dialog.querySelector(".dialog-close").focus();
}

function closeProductDialog() {
  if (!dialog.open) return;
  dialog.close();
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function openCart() {
  if (!cartDrawer.inert) return;
  lastFocusedElement = document.activeElement;
  cartDrawer.inert = false;
  cartDrawer.setAttribute("aria-hidden", "false");
  cartBackdrop.hidden = false;
  cartButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
  window.setTimeout(() => {
    if (!cartDrawer.inert && document.activeElement === cartButton) {
      cartDrawer.querySelector(".drawer-close").focus();
    }
  }, 40);
}

function closeCart() {
  if (cartDrawer.inert) return;
  cartDrawer.inert = true;
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.hidden = true;
  cartButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("drawer-open");
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.harga * item.quantity : 0);
  }, 0);
  cartCount.textContent = String(itemCount);
  cartButton.setAttribute("aria-label", `Buka keranjang, ${itemCount} item`);
  drawerCount.textContent = `(${itemCount})`;
  cartSubtotal.textContent = rupiah.format(subtotal);
  cartFooter.hidden = cart.length === 0;
  if (cart.length === 0) {
    cartContent.innerHTML = `<div class="cart-empty"><span class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></span><h3>Keranjangmu masih kosong</h3><p>Temukan karya yang ingin kamu bawa pulang.</p><button class="button button-outline continue-shopping" type="button">Jelajahi koleksi</button></div>`;
    return;
  }
  cartContent.innerHTML = `<ul class="cart-items">${cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `<li class="cart-item" data-cart-id="${escapeHtml(product.id)}"><img src="${escapeHtml(product.gambar)}" width="120" height="140" alt="" loading="lazy"><div class="cart-item-info"><h3>${escapeHtml(product.nama)}</h3><strong>${rupiah.format(product.harga)}</strong><div class="cart-item-actions"><div class="quantity-stepper compact"><button type="button" data-cart-action="decrease" aria-label="Kurangi ${escapeHtml(product.nama)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12"/></svg></button><span>${item.quantity}</span><button type="button" data-cart-action="increase" aria-label="Tambah ${escapeHtml(product.nama)}" ${item.quantity >= product.stok ? "disabled" : ""}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12"/></svg></button></div><button class="remove-item" type="button" data-cart-action="remove">Hapus</button></div></div></li>`;
  }).join("")}</ul>`;
}

function updateCart(productId, change) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === productId);
  const quantity = (existing?.quantity || 0) + change;
  if (quantity > product.stok) {
    showToast(`Stok ${product.nama} tersedia ${product.stok} buah.`);
    return;
  }
  if (quantity <= 0) cart = cart.filter((item) => item.id !== productId);
  else if (existing) existing.quantity = quantity;
  else cart.push({ id: productId, quantity });
  saveCart();
  renderCart();
}

function focusCartAction(productId, action) {
  const item = [...cartContent.querySelectorAll("[data-cart-id]")].find((element) => element.dataset.cartId === productId);
  const target = item?.querySelector(`[data-cart-action="${action}"]`)
    || cartContent.querySelector(".remove-item")
    || cartDrawer.querySelector(".drawer-close");
  target.focus();
}

function focusableElements(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.getClientRects().length > 0);
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const elements = focusableElements(container);
  if (!elements.length) return;
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (!container.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

categoryButtons.forEach((button) => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  categoryButtons.forEach((categoryButton) => {
    const selected = categoryButton === button;
    categoryButton.classList.toggle("is-active", selected);
    categoryButton.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
}));
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    setMenuOpen(false);
    return;
  }
  menuLastFocusedElement = menuToggle;
  setMenuOpen(true);
  mainNav.querySelector("a")?.focus();
});
mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("click", (event) => {
  if (menuToggle.getAttribute("aria-expanded") === "true"
    && !mainNav.contains(event.target)
    && !menuToggle.contains(event.target)) {
    setMenuOpen(false);
  }
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) setMenuOpen(false);
});
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
grid.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-product-id]");
  if (trigger) openProductDialog(trigger.dataset.productId, trigger);
});
dialog.querySelector(".dialog-close").addEventListener("click", closeProductDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeProductDialog();
});
dialog.addEventListener("submit", (event) => {
  if (!event.target.matches(".add-to-cart-form")) return;
  event.preventDefault();
  const productId = event.target.dataset.productId;
  const quantityInput = event.target.elements.quantity;
  const quantity = Number(quantityInput.value);
  const product = products.find((entry) => entry.id === productId);
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stok) {
    quantityInput.setCustomValidity(`Masukkan jumlah antara 1 dan ${product?.stok || 0}.`);
    quantityInput.reportValidity();
    quantityInput.setCustomValidity("");
    return;
  }
  const existingQuantity = cart.find((item) => item.id === productId)?.quantity || 0;
  if (existingQuantity + quantity > product.stok) {
    showToast(`Stok ${product.nama} tersedia ${product.stok} buah.`);
    return;
  }
  updateCart(productId, quantity);
  showToast(`${product.nama} ditambahkan ke keranjang.`);
  closeProductDialog();
});
dialog.addEventListener("click", (event) => {
  const adjust = event.target.closest(".quantity-adjust");
  if (!adjust) return;
  const quantityInput = dialog.querySelector("#product-quantity");
  const next = Number(quantityInput.value) + Number(adjust.dataset.delta);
  const minimum = Number(quantityInput.min);
  const maximum = Number(quantityInput.max);
  quantityInput.value = String(Math.min(maximum, Math.max(minimum, next)));
});

cartButton.addEventListener("click", openCart);
cartDrawer.querySelector(".drawer-close").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
cartContent.addEventListener("click", (event) => {
  if (event.target.closest(".continue-shopping")) {
    closeCart();
    document.querySelector("#koleksi").scrollIntoView({ behavior: "smooth" });
    return;
  }
  const action = event.target.closest("[data-cart-action]");
  if (!action) return;
  const item = action.closest("[data-cart-id]");
  const cartEntry = cart.find((entry) => entry.id === item.dataset.cartId);
  if (!cartEntry) return;
  const productId = cartEntry.id;
  const actionName = action.dataset.cartAction;
  if (actionName === "remove") cart = cart.filter((entry) => entry.id !== productId);
  else updateCart(productId, actionName === "increase" ? 1 : -1);
  if (action.dataset.cartAction === "remove") {
    saveCart();
    renderCart();
  }
  focusCartAction(productId, actionName);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    showToast("Tambahkan produk ke keranjang sebelum memesan.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const buyerName = String(formData.get("name")).trim();
  const buyerAddress = String(formData.get("address")).trim();
  const buyerNote = String(formData.get("note")).trim();
  const promoCode = String(formData.get("promo")).trim();
  const orderLines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `- ${product.nama} x${item.quantity}: ${rupiah.format(product.harga * item.quantity)}`;
  });
  const subtotal = cart.reduce((sum, item) => sum + products.find((entry) => entry.id === item.id).harga * item.quantity, 0);
  const message = [
    `Halo ${STORE_NAME}, saya ingin memesan:`,
    "",
    ...orderLines,
    "",
    `Subtotal: ${rupiah.format(subtotal)}`,
    "Ongkos kirim: mohon konfirmasi",
    "",
    `Nama: ${buyerName}`,
    `Alamat: ${buyerAddress}`,
    `Catatan: ${buyerNote || "-"}`,
    `Kode promo: ${promoCode || "-"}`,
    "",
    "Mohon konfirmasi ketersediaan dan total pembayaran. Terima kasih."
  ].join("\n");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  whatsappFallbackLink.href = whatsappUrl;
  whatsappFallback.hidden = false;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

document.querySelector(".reset-filters").addEventListener("click", () => {
  searchInput.value = "";
  activeCategory = "Semua";
  categoryButtons.forEach((button) => {
    const selected = button.dataset.category === "Semua";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
  searchInput.focus();
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const feedback = document.querySelector(".newsletter-feedback");
  feedback.textContent = "Terima kasih! Fitur surat pilihan dapat dihubungkan setelah layanan email tersedia.";
  event.currentTarget.reset();
});

document.addEventListener("keydown", (event) => {
  if (menuToggle.getAttribute("aria-expanded") === "true" && event.key === "Escape") {
    event.preventDefault();
    setMenuOpen(false, true);
    return;
  }
  if (dialog.open) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeProductDialog();
    } else {
      trapFocus(event, dialog);
    }
    return;
  }
  if (!cartDrawer.inert) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCart();
    } else {
      trapFocus(event, cartDrawer);
    }
  }
});

renderProducts();
renderCart();
