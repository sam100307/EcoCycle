/* ---------- Fake "AI" item bank ---------- */
const AI_BANK = [
  { name: "Old Laptop", category: "Electronics", weight: "1 unit", price: 120, suggest: "sell" },
  { name: "Plastic Water Bottles", category: "Plastic", weight: "~75 bottles", price: 0, suggest: "recycle" },
  { name: "Cardboard Boxes", category: "Cardboard", weight: "~20 boxes", price: 0, suggest: "donate" },
  { name: "Scrap Metal Pieces", category: "Metal", weight: "~15 kg", price: 25, suggest: "sell" },
  { name: "Used Clothing Bundle", category: "Clothes", weight: "~10 items", price: 0, suggest: "donate" },
  { name: "Old Wooden Chair", category: "Furniture", weight: "1 unit", price: 15, suggest: "donate" },
  { name: "Household Batteries", category: "Batteries", weight: "~12 units", price: 0, suggest: "recycle" }
];

/* ---------- Default sample data (used only the very first time) ---------- */
const DEFAULT_LISTINGS = [
  { id: 1, title: "Old Laptop", category: "Electronics", action: "sell", price: 120, quantity: "1 unit", condition: "Working", pickup: "Tomorrow", rating: 4.8 },
  { id: 2, title: "Plastic Bottles", category: "Plastic", action: "recycle", price: 0, quantity: "75 bottles", condition: "Clean", pickup: "Weekend", rating: 4.5 },
  { id: 3, title: "Cardboard Boxes", category: "Cardboard", action: "donate", price: 0, quantity: "20 boxes", condition: "Good", pickup: "Today", rating: 4.9 },
  { id: 4, title: "Scrap Metal", category: "Metal", action: "sell", price: 25, quantity: "15 kg", condition: "Mixed", pickup: "Tomorrow", rating: 4.2 }
];

const DEFAULT_REQUESTS = [
  { text: "Looking for old wooden pallets.", time: formatDate(Date.now() - 2 * 60 * 60 * 1000) },
  { text: "Need cardboard boxes for moving.", time: formatDate(Date.now() - 24 * 60 * 60 * 1000) }
];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/* ---------- Load from localStorage, or fall back to defaults ---------- */
function loadListings() {
  const saved = localStorage.getItem("lbt_listings");
  return saved ? JSON.parse(saved) : DEFAULT_LISTINGS;
}

function loadRequests() {
  const saved = localStorage.getItem("lbt_requests");
  return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
}

function saveListings() {
  localStorage.setItem("lbt_listings", JSON.stringify(listings));
}

function saveRequests() {
  localStorage.setItem("lbt_requests", JSON.stringify(requests));
}

let listings = loadListings();
let requests = loadRequests();

let selectedAction = null;
let selectedPickup = null;
let uploadedPhotoSrc = null;

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "feed") renderListings();
    if (btn.dataset.tab === "requests") renderRequests();
  });
});

/* ---------- Photo upload ---------- */
const photoInput = document.getElementById("photoInput");
const previewImg = document.getElementById("previewImg");
const uploadPrompt = document.getElementById("uploadPrompt");
const scanBtn = document.getElementById("scanBtn");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    uploadedPhotoSrc = e.target.result;
    previewImg.src = uploadedPhotoSrc;
    previewImg.hidden = false;
    uploadPrompt.hidden = true;
    scanBtn.hidden = false;
  };
  reader.readAsDataURL(file);
});

/* ---------- Fake AI scan ---------- */
scanBtn.addEventListener("click", () => {
  scanBtn.textContent = "Scanning...";
  setTimeout(() => {
    const item = AI_BANK[Math.floor(Math.random() * AI_BANK.length)];
    document.getElementById("aiResult").hidden = false;
    document.getElementById("aiItemName").textContent = item.name;
    document.getElementById("aiDetails").textContent =
      `Estimated: ${item.weight} · Category: ${item.category} · Suggested: ${item.suggest} ${item.price ? "(~$" + item.price + ")" : ""}`;

    document.getElementById("categorySelect").value = item.category;
    document.getElementById("titleInput").value = item.name;
    document.getElementById("quantityInput").value = item.weight;
    if (item.price) document.getElementById("priceInput").value = item.price;
    selectAction(item.suggest);

    scanBtn.textContent = "Scan item";
  }, 700);
});

/* ---------- Action buttons ---------- */
document.querySelectorAll(".action-btn").forEach(btn => {
  btn.addEventListener("click", () => selectAction(btn.dataset.action));
});

function selectAction(action) {
  selectedAction = action;
  document.querySelectorAll(".action-btn").forEach(b => {
    b.classList.toggle("selected", b.dataset.action === action);
  });
  document.getElementById("priceRow").hidden = action !== "sell";
}

/* ---------- Pickup buttons ---------- */
document.querySelectorAll(".pickup-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPickup = btn.dataset.pickup;
    document.querySelectorAll(".pickup-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

/* ---------- Post listing ---------- */
document.getElementById("postBtn").addEventListener("click", () => {
  const title = document.getElementById("titleInput").value.trim();
  const category = document.getElementById("categorySelect").value;
  const quantity = document.getElementById("quantityInput").value.trim();
  const condition = document.getElementById("conditionInput").value.trim() || "Not specified";
  const price = selectedAction === "sell" ? Number(document.getElementById("priceInput").value) || 0 : 0;

  const msg = document.getElementById("postMsg");

  if (!title || !selectedAction || !quantity || !selectedPickup) {
    msg.hidden = false;
    msg.style.color = "#c1543a";
    msg.textContent = "Please add a photo/title, choose an action, quantity, and pickup time.";
    return;
  }

  listings.unshift({
    id: Date.now(),
    title,
    category,
    action: selectedAction,
    price,
    quantity,
    condition,
    pickup: selectedPickup,
    rating: (4 + Math.random()).toFixed(1),
    photo: uploadedPhotoSrc
  });

  saveListings();

  msg.hidden = false;
  msg.style.color = "#4c8c5c";
  msg.textContent = "Listing posted! Check the Nearby Listings tab.";

  resetForm();
});

function resetForm() {
  document.getElementById("titleInput").value = "";
  document.getElementById("quantityInput").value = "";
  document.getElementById("conditionInput").value = "";
  document.getElementById("priceInput").value = "";
  document.getElementById("priceRow").hidden = true;
  document.getElementById("aiResult").hidden = true;
  previewImg.hidden = true;
  uploadPrompt.hidden = false;
  scanBtn.hidden = true;
  selectedAction = null;
  selectedPickup = null;
  uploadedPhotoSrc = null;
  document.querySelectorAll(".action-btn, .pickup-btn").forEach(b => b.classList.remove("selected"));
}

/* ---------- Render listings feed ---------- */
const grid = document.getElementById("listingsGrid");
const filterSelect = document.getElementById("filterSelect");

function populateFilter() {
  const cats = [...new Set(listings.map(l => l.category))];
  const current = filterSelect.value || "all";
  filterSelect.innerHTML = `<option value="all">All categories</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
  filterSelect.value = current;
}

filterSelect.addEventListener("change", renderListings);

function renderListings() {
  populateFilter();
  const filter = filterSelect.value;
  const filtered = filter === "all" ? listings : listings.filter(l => l.category === filter);

  grid.innerHTML = filtered.map(l => `
    <div class="listing-item">
      <div class="thumb">${l.photo ? `<img src="${l.photo}">` : "📦"}</div>
      <div class="listing-body">
        <div class="listing-top">
          <p class="listing-title">${l.title}</p>
          <span class="tag ${l.action}">${l.action}</span>
        </div>
        <p class="listing-meta">${l.category} · ${l.quantity} · ${l.condition}</p>
        <p class="listing-meta">Pickup: ${l.pickup} · <span class="stars">★ ${l.rating}</span></p>
        <p class="listing-price">${l.action === "sell" ? "$" + l.price : "Free"}</p>
        <button class="claim-btn" onclick="claimListing(${l.id}, this)">Claim / Request pickup</button>
      </div>
    </div>
  `).join("");
}

function claimListing(id, btn) {
  btn.textContent = "Claimed ✓";
  btn.classList.add("claimed");
  btn.disabled = true;
}

/* ---------- Requests ---------- */
document.getElementById("requestBtn").addEventListener("click", () => {
  const input = document.getElementById("requestInput");
  if (!input.value.trim()) return;
  requests.unshift({ text: input.value.trim(), time: formatDate(Date.now()) });
  saveRequests();
  input.value = "";
  renderRequests();
});

function renderRequests() {
  const list = document.getElementById("requestsList");
  list.innerHTML = requests.map(r => `
    <div class="request-item">
      ${r.text}
      <span class="req-time">${r.time}</span>
    </div>
  `).join("");
}

/* ---------- Init ---------- */
renderListings();
renderRequests();