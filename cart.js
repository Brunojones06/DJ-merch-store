/* Diana merch — shared cart (localStorage) + slide-out drawer.
   Included on every page; shop.html also reads DIANA_CATALOG for its grid. */

window.DIANA_CATALOG = [
  { id: 1, name: "Static Vinyl 7\"",        category: "music",     price: 25,  image: "products/vinyl.jpg",  alt: "Midnight Static 7-inch vinyl record in lime green splatter, numbered limited edition, leaning against its album sleeve", badge: "LIMITED TIME", added: "2026-07-01", priceId: "price_1TosCJKIvvX72lLeCOyvRV6T" },
  { id: 2, name: "Static Bomber",           category: "outerwear", price: 120, image: "products/bomber.jpg", alt: "Black nylon bomber jacket with white tour dates printed down the left sleeve", badge: "NEW", added: "2026-06-20", priceId: "price_1Tos8uKIvvX72lLecqUViMng" },
  { id: 3, name: "Midnight Static Tee",     category: "tees",      price: 45,  image: "products/tee.jpg",    alt: "Oversized washed-black t-shirt with a cracked texture graphic print on the chest", badge: null, added: "2026-06-10", priceId: "price_1Tos7wKIvvX72lLe6xszc9Gx" },
  { id: 4, name: "Night Shift Cargo Pants", category: "bottoms",   price: 95,  image: "products/cargo.jpg",  alt: "Relaxed-fit black cargo pants with zip utility pockets", badge: null, added: "2026-05-15", priceId: "price_1TosAJKIvvX72lLeBsdMeRk5" },
  { id: 5, name: "Diana Trucker Cap",       category: "headwear",  price: 35,  image: "products/cap.jpg",    alt: "Black five-panel trucker cap with tonal embossed logo and lime green underbrim", badge: "LOW STOCK", added: "2026-04-20", priceId: "price_1Tos9WKIvvX72lLefbuMHdvM" }
];

(function () {
  const STORAGE_KEY = "diana-cart";
  const LIME = "#abd600";
  const byId = (id) => window.DIANA_CATALOG.find((p) => p.id === Number(id));

  // ---------- state ----------
  // Each line: { id, name, priceId, qty }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      return raw
        .filter((l) => byId(l.id) && l.qty > 0)
        .map((l) => {
          const p = byId(l.id);
          return { id: p.id, name: p.name, priceId: p.priceId, qty: l.qty };
        });
    } catch (_e) { return []; }
  }

  function save(lines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }

  let cart = load();
  const count = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + l.qty * byId(l.id).price, 0);

  // ---------- styles ----------
  const style = document.createElement("style");
  style.textContent = `
    #dc-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 90;
    }
    #dc-overlay.open { opacity: 1; pointer-events: auto; }

    #dc-drawer {
      position: fixed; top: 0; right: 0; height: 100dvh;
      width: min(430px, 100vw);
      background: #1c1b1b; border-left: 3px solid ${LIME};
      box-shadow: -12px 0 40px rgba(0,0,0,0.6);
      transform: translateX(105%);
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 95; display: flex; flex-direction: column;
    }
    #dc-drawer.open { transform: translateX(0); }

    .dc-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 2px solid rgba(171,214,0,0.35);
    }
    .dc-title {
      font-family: 'Anton', sans-serif; font-size: 28px; text-transform: uppercase;
      color: #fff; letter-spacing: 0.01em; transform: rotate(-1deg);
    }
    .dc-close {
      cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      background: none; border: 2px solid rgba(255,255,255,0.3); color: #fff;
      transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }
    .dc-close:hover { border-color: ${LIME}; color: ${LIME}; transform: rotate(90deg); }
    .dc-close:focus-visible { outline: 2px solid ${LIME}; outline-offset: 2px; }

    .dc-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }

    .dc-line {
      display: grid; grid-template-columns: 72px 1fr; gap: 14px;
      background: #20201f; border: 2px solid rgba(255,255,255,0.12);
      padding: 12px; position: relative;
    }
    .dc-line img { width: 72px; height: 72px; object-fit: cover; border: 2px solid rgba(255,255,255,0.15); }
    .dc-name { font-family: 'Anton', sans-serif; font-size: 17px; text-transform: uppercase; color: #e5e2e1; padding-right: 34px; }
    .dc-price { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${LIME}; margin-top: 3px; }

    .dc-controls { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .dc-qty { display: flex; align-items: center; border: 2px solid rgba(255,255,255,0.25); }
    .dc-qty button {
      cursor: pointer; width: 34px; height: 34px; background: none; border: none; color: #fff;
      font-family: 'JetBrains Mono', monospace; font-size: 16px; line-height: 1;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .dc-qty button:hover { background: ${LIME}; color: #161e00; }
    .dc-qty button:focus-visible { outline: 2px solid ${LIME}; outline-offset: -2px; }
    .dc-qty span {
      font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #fff;
      min-width: 30px; text-align: center;
    }
    .dc-checkout-main {
      cursor: pointer; width: 100%; font-family: 'Anton', sans-serif; font-size: 24px;
      text-transform: uppercase; letter-spacing: 0.02em;
      color: #161e00; background: ${LIME}; border: 3px solid #000;
      padding: 14px 20px; box-shadow: 5px 5px 0 0 #000;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }
    .dc-checkout-main:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 0 #000; }
    .dc-checkout-main:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
    .dc-checkout-main:disabled { opacity: 0.55; cursor: wait; }
    .dc-error {
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ffb4ab;
      border-left: 4px solid #ffb4ab; padding: 6px 10px; display: none;
    }
    .dc-error.show { display: block; }

    .dc-remove {
      cursor: pointer; position: absolute; top: 8px; right: 8px; width: 30px; height: 30px;
      background: none; border: none; color: rgba(255,255,255,0.45);
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s ease, transform 0.15s ease;
    }
    .dc-remove:hover { color: #ffb4ab; transform: scale(1.15); }
    .dc-remove:focus-visible { outline: 2px solid ${LIME}; outline-offset: 2px; }

    .dc-empty { text-align: center; padding: 60px 10px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
    .dc-empty .dc-title { transform: rotate(-2deg); }
    .dc-empty p { font-family: 'Hanken Grotesk', sans-serif; color: #c4c9ac; font-size: 15px; }
    .dc-shop-link {
      cursor: pointer; font-family: 'Anton', sans-serif; font-size: 20px; text-transform: uppercase;
      color: #161e00; background: ${LIME}; text-decoration: none;
      padding: 12px 28px; border: 3px solid #000; box-shadow: 5px 5px 0 0 #000;
      transform: rotate(-2deg); transition: transform 0.2s ease;
    }
    .dc-shop-link:hover { transform: rotate(0deg) scale(1.04); }
    .dc-shop-link:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

    .dc-foot {
      border-top: 2px solid rgba(171,214,0,0.35); padding: 18px 24px 22px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .dc-subtotal {
      display: flex; justify-content: space-between; align-items: baseline;
      font-family: 'Anton', sans-serif; font-size: 22px; text-transform: uppercase; color: #fff;
    }
    .dc-subtotal strong { font-family: 'JetBrains Mono', monospace; font-size: 22px; color: ${LIME}; }
    .dc-note { font-family: 'Hanken Grotesk', sans-serif; font-size: 13px; color: rgba(196,201,172,0.75); }

    #dc-toast {
      position: fixed; bottom: 32px; left: 32px; z-index: 99;
      background: ${LIME}; color: #161e00;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-transform: uppercase;
      padding: 14px 22px; border: 3px solid #000; box-shadow: 5px 5px 0 0 #000;
      transform: translateY(150%) rotate(-2deg);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: min(340px, calc(100vw - 64px));
    }
    #dc-toast.show { transform: translateY(0) rotate(-2deg); }

    .dc-badge {
      position: absolute; top: -2px; right: -2px; width: 20px; height: 20px;
      border-radius: 9999px; background: ${LIME}; color: #161e00;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    @keyframes dcBump { 0% { transform: scale(1); } 50% { transform: scale(1.5); } 100% { transform: scale(1); } }
    .dc-badge.bump { animation: dcBump 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `;
  document.head.appendChild(style);

  // ---------- drawer DOM ----------
  const overlay = document.createElement("div");
  overlay.id = "dc-overlay";

  const drawer = document.createElement("aside");
  drawer.id = "dc-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "Shopping cart");
  drawer.setAttribute("aria-label", "Shopping bag");
  drawer.innerHTML = `
    <div class="dc-head">
      <span class="dc-title" id="dc-heading">Your Bag</span>
      <button class="dc-close" aria-label="Close bag" type="button">
        <span aria-hidden="true" class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="dc-body" aria-live="polite"></div>
    <div class="dc-foot"></div>
  `;

  const toast = document.createElement("div");
  toast.id = "dc-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  document.body.append(overlay, drawer, toast);

  const body = drawer.querySelector(".dc-body");
  const foot = drawer.querySelector(".dc-foot");
  const closeBtn = drawer.querySelector(".dc-close");

  // ---------- cart button + badge ----------
  const cartBtn = document.querySelector('button[aria-label="View shopping bag"], button[aria-label="View shopping cart"]');
  let badge = null;
  if (cartBtn) {
    cartBtn.style.position = "relative";
    badge = document.createElement("span");
    badge.className = "dc-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.style.display = "none";
    cartBtn.appendChild(badge);
    cartBtn.addEventListener("click", openDrawer);
  }

  function updateBadge(bump) {
    if (!badge) return;
    const n = count();
    badge.textContent = n;
    badge.style.display = n > 0 ? "flex" : "none";
    if (cartBtn) cartBtn.setAttribute("aria-label", n > 0 ? `View shopping bag, ${n} item${n === 1 ? "" : "s"}` : "View shopping bag");
    if (bump && n > 0) {
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }
  }

  // ---------- rendering ----------
  function renderDrawer() {
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="dc-empty">
          <span class="dc-title">Bag's Empty</span>
          <p>Nothing in here yet — the good stuff sells out fast.</p>
          <a class="dc-shop-link" href="shop.html">Hit the Shop</a>
        </div>`;
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = cart.map((l) => {
      const p = byId(l.id);
      return `
        <div class="dc-line" data-id="${p.id}">
          <img alt="" src="${p.image}"/>
          <div>
            <div class="dc-name">${p.name}</div>
            <div class="dc-price">$${p.price.toFixed(2)} × ${l.qty} = $${(p.price * l.qty).toFixed(2)}</div>
            <div class="dc-controls">
              <div class="dc-qty">
                <button aria-label="Decrease quantity of ${p.name}" data-act="dec" type="button">−</button>
                <span aria-label="Quantity: ${l.qty}">${l.qty}</span>
                <button aria-label="Increase quantity of ${p.name}" data-act="inc" type="button">+</button>
              </div>
            </div>
          </div>
          <button aria-label="Remove ${p.name} from bag" class="dc-remove" data-act="remove" type="button">
            <span aria-hidden="true" class="material-symbols-outlined" style="font-size:20px">delete</span>
          </button>
        </div>`;
    }).join("");

    foot.innerHTML = `
      <div class="dc-subtotal"><span>Subtotal</span><strong>$${subtotal().toFixed(2)}</strong></div>
      <p class="dc-error" role="alert"></p>
      <button class="dc-checkout-main" type="button">Checkout</button>
      <p class="dc-note">Secure payment via Stripe. Shipping calculated at checkout.</p>`;

    foot.querySelector(".dc-checkout-main").addEventListener("click", startCheckout);
  }

  // ---------- Stripe Checkout ----------
  async function startCheckout() {
    const btn = foot.querySelector(".dc-checkout-main");
    const errEl = foot.querySelector(".dc-error");
    if (!btn || cart.length === 0) return;

    btn.disabled = true;
    btn.textContent = "Redirecting…";
    errEl.classList.remove("show");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ price: l.priceId, quantity: l.qty }))
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      // A TypeError from fetch means the request never reached a server
      // (file://, static-only host, offline). Message text varies by browser:
      // Chrome "Failed to fetch", Safari "Load failed", Firefox "NetworkError…".
      const isNetworkError = err instanceof TypeError;
      errEl.textContent = isNetworkError
        ? "Checkout needs the live site — this only works on the Vercel deployment, not a local copy."
        : err.message;
      errEl.classList.add("show");
      btn.disabled = false;
      btn.textContent = "Checkout";
    }
  }

  body.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = Number(btn.closest(".dc-line").dataset.id);
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    const act = btn.dataset.act;
    if (act === "inc") line.qty += 1;
    if (act === "dec") line.qty -= 1;
    if (act === "remove") line.qty = 0;
    cart = cart.filter((l) => l.qty > 0);
    save(cart);
    renderDrawer();
    updateBadge(false);
  });

  // ---------- open / close ----------
  let lastFocus = null;

  function openDrawer() {
    cart = load();
    renderDrawer();
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    drawer.classList.add("open");
    closeBtn.focus();
  }

  function closeDrawer() {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    if (lastFocus) lastFocus.focus();
  }

  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  // ---------- toast ----------
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  // ---------- public API ----------
  window.DianaCart = {
    add(id) {
      const p = byId(id);
      if (!p) return;
      cart = load();
      const line = cart.find((l) => l.id === p.id);
      if (line) line.qty += 1;
      else cart.push({ id: p.id, name: p.name, priceId: p.priceId, qty: 1 });
      save(cart);
      updateBadge(true);
      showToast(`Added to bag — ${p.name}`);
    },
    open: openDrawer
  };

  updateBadge(false);
})();
