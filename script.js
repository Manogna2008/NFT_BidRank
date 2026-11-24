const DBKEY = "bidrank_reference_demo";

const seedNFTs = [
  {
    id: 1,
    name: "Cosmic Butterfly #1024",
    creator: "Ava Studio",
    owner: "Ava Studio",
    start: 1.2,
    highest: 3.8,
    bids: [{user:"ARMY_Queen",amount:3.8,time:"2m ago"}],
    status: "Live",
    art: "🦋",
    change: "+18%"
  },
  {
    id: 2,
    name: "Pixel Dreamer #777",
    creator: "PixelLab",
    owner: "PixelLab",
    start: 0.8,
    highest: 2.4,
    bids: [{user:"Neo",amount:2.4,time:"3m ago"}],
    status: "Live",
    art: "🦋",
    change: "+12%"
  },
  {
    id: 3,
    name: "Digital Venus #321",
    creator: "ArtNova",
    owner: "ArtNova",
    start: 2,
    highest: 5.1,
    bids: [{user:"Kai",amount:5.1,time:"4m ago"}],
    status: "Live",
    art: "👾",
    change: "+20%"
  }
];

let state = JSON.parse(localStorage.getItem(DBKEY) || "null") || {
  users: [],
  nfts: seedNFTs,
  activity: [
    "You placed a bid on Cosmic Butterfly #1024",
    "New bid: 3.6 ETH on Pixel Dreamer #777",
    "You added Digital Venus #321 to your collection"
  ],
  current: null,
  myBids: []
};

let page = "dashboard";
let sortMethod = "heap";

const $ = id => document.getElementById(id);

const save = () =>
  localStorage.setItem(DBKEY, JSON.stringify(state));

const me = () =>
  state.users.find(u => u.email === state.current);

const fmt = n =>
  Number(n || 0).toFixed(1) + " ETH";

const safe = s =>
  String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.remove("hidden");

  setTimeout(() => {
    $("toast").classList.add("hidden");
  }, 2300);
}

/* LOGIN AND SIGNUP */

$("authForm").addEventListener("submit", e => {
  e.preventDefault();

  let name = $("authName").value.trim() ||
    $("authEmail").value.split("@")[0];

  let email = $("authEmail").value.trim().toLowerCase();
  let password = $("authPassword").value;

  let found = state.users.find(u => u.email === email);

  if (found && found.password !== password) {
    $("authMsg").textContent = "Incorrect password.";
    return;
  }

  if (!found) {
    state.users.push({ name, email, password });
  }

  state.current = email;

  save();
  enter();
});

function enter() {
  $("auth").classList.add("hidden");
  $("app").classList.remove("hidden");

  $("welcome").textContent = me()?.name || "Collector";

  renderDashboard();
}

/* LOGOUT */

$("logout").onclick = () => {
  state.current = null;
  save();

  $("app").classList.add("hidden");
  $("auth").classList.remove("hidden");
};

/* NAVIGATION */

$("nav").addEventListener("click", e => {
  let b = e.target.closest("[data-page]");

  if (b) {
    go(b.dataset.page);
  }
});

document.querySelectorAll("[data-go]").forEach(b => {
  b.addEventListener("click", () => {
    go(b.dataset.go);
  });
});

$("search").addEventListener("input", () => {
  if (page === "dashboard") {
    go("explore");
  } else {
    renderPage();
  }
});

function go(p) {
  page = p;

  document.querySelectorAll(".nav-link").forEach(b => {
    b.classList.toggle("active", b.dataset.page === p);
  });

  $("dashboard").classList.toggle("hidden", p !== "dashboard");
  $("otherPage").classList.toggle("hidden", p === "dashboard");

  if (p === "dashboard") {
    renderDashboard();
  } else {
    renderPage();
  }
}

function log(s) {
  state.activity.unshift(s);
  state.activity = state.activity.slice(0, 10);
  save();
}

/* NFT CARD */

/* NFT CARD */

function card(n, showControls = false) {
  return `
    <article class="nft-card">

      <div class="nft-top">
        <span class="pill ${n.status === "Live" ? "live" : "ended"}">
          ● ${n.status === "Live" ? "Live" : "Ended"}
        </span>

        <button class="heart"
          onclick="toast('Added to favourites')">♡</button>
      </div>

      <div class="nft-art">${n.art || "◆"}</div>

      <h3>${safe(n.name)}</h3>

      <div class="nft-price">
        ◆ ${fmt(n.highest)}
      </div>

      <div class="nft-meta">
        <span>Creator: ${safe(n.creator || "Unknown")}</span>
        <b>${n.bids.length} bids</b>
      </div>

      ${n.status === "Live" ? `
        <button class="primary" onclick="placeBid(${n.id})">
          Place Bid
        </button>
      ` : `
        <button class="secondary" disabled>
          Auction Ended
        </button>
      `}

      ${showControls ? `
        <div class="nft-controls">
          <button class="secondary"
            onclick="toggleAuction(${n.id})">
            ${n.status === "Live" ? "End Auction" : "Reactivate"}
          </button>

          <button class="danger"
            onclick="deleteNFT(${n.id})">
            Delete
          </button>
        </div>
      ` : ""}

    </article>
  `;
}
/* DASHBOARD */

function renderDashboard() {

  let total = state.nfts.reduce(
    (s, n) => s + n.bids.length, 0
  );

  let vol = state.nfts.reduce(
    (s, n) => s + n.bids.reduce(
      (a, b) => a + b.amount, 0
    ), 0
  );

  $("totalBids").textContent = total.toLocaleString();

  $("totalNFTs").textContent =
    state.nfts.length.toLocaleString();

  $("volume").textContent =
    "₹ " + (vol * 100000).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    });

  $("activeUsers").textContent =
    Math.max(1, state.users.length).toLocaleString();

  let ranked = [...state.nfts].sort(
    (a, b) => b.highest - a.highest
  );

  $("topNFTs").innerHTML =
    ranked.slice(0, 3).map(card).join("") ||
    '<div class="empty">No NFTs listed yet.</div>';

  $("liveList").innerHTML =
    state.nfts
      .filter(n => n.status === "Live")
      .slice(0, 4)
      .map(n => `
        <div class="activity-row">
          <div>
            <strong>${safe(n.name)}</strong>
            <small>◆ ${fmt(n.highest)}</small>
          </div>

          <div class="activity-right">
            <b>+0.2 ETH</b>
            <small>2m ago</small>
          </div>
        </div>
      `).join("") ||
    '<div class="empty">No live auctions.</div>';

  $("recentList").innerHTML =
    state.activity.slice(0, 4).map((a, i) => `
      <div class="activity-row">
        <div>
          <strong>♛ &nbsp;${safe(a)}</strong>
        </div>

        <div class="activity-right">
          <small>${i + 2}m ago</small>
        </div>
      </div>
    `).join("");

  drawMainChart();
}

/* ANALYTICS CHART */

function drawMainChart() {

  let vals = [39, 64, 53, 47, 59, 72, 51];

  let labels = [
    "Mon", "Tue", "Wed", "Thu",
    "Fri", "Sat", "Sun"
  ];

  let w = 600;
  let h = 145;
  let p = 18;
  let max = 85;

  let pts = vals.map((v, i) =>
    `${p + i * (w - 2 * p) / 6},${h - 20 - v / max * (h - 42)}`
  ).join(" ");

  let circles = vals.map((v, i) => `
    <circle
      cx="${p + i * (w - 2 * p) / 6}"
      cy="${h - 20 - v / max * (h - 42)}"
      r="3.5"
      fill="#fff8f0"
      stroke="#986b4c"
      stroke-width="2"
    />
  `).join("");

  let grid = [30, 60].map(v => `
    <line
      x1="20"
      y1="${h - 20 - v / max * (h - 42)}"
      x2="585"
      y2="${h - 20 - v / max * (h - 42)}"
      stroke="#eadbce"
      stroke-dasharray="3 4"
    />
  `).join("");

  let texts = labels.map((v, i) => `
    <text
      x="${p + i * (w - 2 * p) / 6}"
      y="${h - 3}"
      text-anchor="middle"
      font-size="10"
      fill="#8c7664"
    >${v}</text>
  `).join("");

  $("mainChart").innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      ${grid}

      <polyline
        points="${pts}"
        fill="none"
        stroke="#9a704f"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      ${circles}
      ${texts}
    </svg>
  `;
}

/* OTHER PAGES */

function renderPage() {

  let titles = {
    explore: "Explore NFTs",
    auctions: "Live Auctions",
    bids: "My Bids",
    collection: "My Collection",
    analytics: "Auction Analytics",
    rankings: "NFT Rankings",
    settings: "Settings"
  };

  $("pageTitle").textContent = titles[page];

  let c = $("pageContent");
  let q = $("search").value.toLowerCase();

  /* EXPLORE, AUCTIONS, COLLECTION */

  /* EXPLORE NFTs */

if (page === "explore") {

  let list = state.nfts.filter(n =>
    n.name.toLowerCase().includes(q)
  );

  c.innerHTML = `
    <div class="page-panel">

      <div class="panel-heading">
        <h2>Explore Marketplace</h2>
        <button class="primary" onclick="addNFT()">
          ＋ Add New NFT
        </button>
      </div>

      <p>Discover NFTs from all creators.</p>

      <div class="nft-grid">
        ${list.map(n => card(n)).join("") ||
          '<div class="empty">No NFTs available.</div>'}
      </div>

    </div>
  `;
}

/* LIVE AUCTIONS */

else if (page === "auctions") {

  let list = state.nfts.filter(n =>
    n.status === "Live" &&
    n.name.toLowerCase().includes(q)
  );

  c.innerHTML = `
    <div class="page-panel">

      <div class="panel-heading">
        <h2>Currently Live Auctions</h2>
      </div>

      <p>View active auctions and place your bids.</p>

      <div class="nft-grid">
        ${list.map(n => card(n)).join("") ||
          '<div class="empty">No live auctions available.</div>'}
      </div>

    </div>
  `;
}

/* MY COLLECTION */

else if (page === "collection") {

  let list = state.nfts.filter(n =>
    (n.owner === me()?.name || n.creator === me()?.name) &&
    n.name.toLowerCase().includes(q)
  );

  c.innerHTML = `
    <div class="page-panel">

      <div class="panel-heading">
        <h2>My NFT Collection</h2>

        <button class="primary" onclick="addNFT()">
          ＋ Add New NFT
        </button>
      </div>

      <p>Manage the NFTs you have created or own.</p>

      <div class="nft-grid">
        ${list.map(n => card(n, true)).join("") ||
          '<div class="empty">Your collection is empty. Click Add New NFT to get started.</div>'}
      </div>

    </div>
  `;
}

  /* NFT RANKINGS */

  else if (page === "rankings") {

    c.innerHTML = `
      <div class="page-panel">

        <div class="toolbar">

          <select class="field" id="sortSelect"
            onchange="changeSort(this.value)">

            <option value="heap">Heap Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>

          </select>

          <button class="primary" onclick="benchmark()">
            Compare Algorithms
          </button>

          <button class="secondary" onclick="exportCSV()">
            Export CSV
          </button>

          <button class="secondary" onclick="window.print()">
            Print
          </button>

        </div>

        <div id="rankTable"></div>
        <div id="benchResult"></div>

      </div>
    `;

    renderRankTable();
  }

  /* MY BIDS */

  else if (page === "bids") {

    let bids = state.myBids.filter(
      b => b.user === me()?.name
    );

    c.innerHTML = `
      <div class="page-panel">

        <h2>Previous bidding activities</h2>

        <div class="table-wrap">

          <table>

            <tr>
              <th>NFT</th>
              <th>Bid</th>
              <th>Date</th>
            </tr>

            ${bids.map(b => `
              <tr>
                <td>${safe(b.nft)}</td>
                <td>${fmt(b.amount)}</td>
                <td>${safe(b.time)}</td>
              </tr>
            `).join("") ||
            '<tr><td colspan="3">No bids yet.</td></tr>'}

          </table>

        </div>
      </div>
    `;
  }

  /* ANALYTICS */

  else if (page === "analytics") {

    let bids = state.nfts.flatMap(n => n.bids);

    let avg = bids.length
      ? bids.reduce((s, b) => s + b.amount, 0) / bids.length
      : 0;

    let pop = [...state.nfts].sort(
      (a, b) => b.bids.length - a.bids.length
    )[0];

    c.innerHTML = `
      <div class="metric-grid">

        <div class="metric">
          <strong>${fmt(avg)}</strong>
          <p>Average Bid</p>
        </div>

        <div class="metric">
          <strong>${safe(pop?.name || "—")}</strong>
          <p>Popular NFT</p>
        </div>

      </div>

      <div class="page-panel">

        <h2>Bid Performance & Bidding Activity</h2>

        <div class="table-wrap">

          <table>

            <tr>
              <th>NFT</th>
              <th>Highest Bid</th>
              <th>Total Bids</th>
            </tr>

            ${state.nfts.map(n => `
              <tr>
                <td>${safe(n.name)}</td>
                <td>${fmt(n.highest)}</td>
                <td>${n.bids.length}</td>
              </tr>
            `).join("")}

          </table>

        </div>
      </div>
    `;
  }

  /* SETTINGS */

  else if (page === "settings") {

    c.innerHTML = `
      <div class="page-panel">

        <h2>Account Settings</h2>

        <p>
          Signed in as:
          ${safe(me()?.email || "")}
        </p>

        <p>
          Demo data is stored in this browser's local storage.
        </p>

      </div>
    `;
  }
}

/* ADD NFT */

function addNFT() {

  let name = prompt("NFT name:");

  if (!name) return;

  let start = Number(
    prompt("Starting bid in ETH:", "1")
  );

  if (!Number.isFinite(start) || start <= 0) {
    return toast("Enter a valid starting bid.");
  }

  state.nfts.push({
    id: Date.now(),
    name,
    creator: me()?.name,
    owner: me()?.name,
    start,
    highest: start,
    bids: [],
    status: "Live",
    art: ["💎", "🦋", "🎨", "🌌", "👾", "🌸"][Math.floor(Math.random() * 6)]
  });

  log("You added " + name + " to your collection");

  save();
  renderPage();

  toast("NFT added");
}

/* PLACE BID */

function placeBid(id) {

  let n = state.nfts.find(x => x.id === id);

  if (!n || n.status !== "Live") {
    return toast("Auction is not live");
  }

  let amount = Number(
    prompt(
      "Current highest bid: " + fmt(n.highest) +
      "\nEnter a higher bid (ETH):",
      (n.highest + 0.1).toFixed(2)
    )
  );

  if (!Number.isFinite(amount) || amount <= n.highest) {
    return toast("Bid must be higher than current highest bid");
  }

  let bid = {
    user: me()?.name || "Guest",
    amount,
    time: new Date().toLocaleString()
  };

  n.highest = amount;
  n.bids.push(bid);

  state.myBids.push({
    ...bid,
    nft: n.name
  });

  log("You placed a bid on " + n.name);

  save();

  if (page === "dashboard") {
    renderDashboard();
  } else {
    renderPage();
  }

  toast("Bid placed successfully");
}

/* END / REACTIVATE AUCTION */

function toggleAuction(id) {

  let n = state.nfts.find(x => x.id === id);

  if (!n) return;

  n.status = n.status === "Live"
    ? "Ended"
    : "Live";

  log(n.name + " auction " + n.status.toLowerCase());

  save();
  renderPage();

  toast("Auction status updated");
}

/* DELETE NFT */

function deleteNFT(id) {

  if (!confirm("Delete this NFT and its bids?")) {
    return;
  }

  state.nfts = state.nfts.filter(
    n => n.id !== id
  );

  save();
  renderPage();

  toast("NFT deleted");
}

/* MERGE SORT */

function mergeSort(a) {

  if (a.length < 2) return a;

  let m = a.length >> 1;

  let l = mergeSort(a.slice(0, m));
  let r = mergeSort(a.slice(m));

  let o = [];

  while (l.length && r.length) {

    o.push(
      l[0].highest >= r[0].highest
        ? l.shift()
        : r.shift()
    );
  }

  return o.concat(l, r);
}

/* QUICK SORT */

function quickSort(a) {

  if (a.length < 2) return a;

  let p = a[a.length - 1].highest;

  let l = [];
  let r = [];

  for (let i = 0; i < a.length - 1; i++) {

    (a[i].highest >= p ? l : r).push(a[i]);

  }

  return quickSort(l).concat(
    [a[a.length - 1]],
    quickSort(r)
  );
}

/* HEAP SORT */

function heapSort(a) {

  a = [...a];

  let n = a.length;

  function down(i, size) {

    let m = i;
    let l = i * 2 + 1;
    let r = l + 1;

    if (l < size && a[l].highest > a[m].highest) {
      m = l;
    }

    if (r < size && a[r].highest > a[m].highest) {
      m = r;
    }

    if (m !== i) {

      [a[i], a[m]] = [a[m], a[i]];

      down(m, size);
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) {
    down(i, n);
  }

  for (let end = n - 1; end > 0; end--) {

    [a[0], a[end]] = [a[end], a[0]];

    down(0, end);
  }

  return a.reverse();
}

/* CHANGE SORTING ALGORITHM */

function changeSort(v) {
  sortMethod = v;
  renderRankTable();
}

/* DISPLAY RANKINGS */

function renderRankTable() {

  let method = $("sortSelect")?.value || sortMethod;

  let ranked =
    method === "merge"
      ? mergeSort([...state.nfts])
      : method === "quick"
      ? quickSort([...state.nfts])
      : heapSort(state.nfts);

  $("rankTable").innerHTML = `
    <div class="table-wrap">

      <table>

        <tr>
          <th>Rank</th>
          <th>NFT Name</th>
          <th>Highest Bid</th>
          <th>Total Bids</th>
          <th>Status</th>
        </tr>

        ${ranked.map((n, i) => `
          <tr>
            <td>${["🥇", "🥈", "🥉"][i] || "#" + (i + 1)}</td>
            <td>${safe(n.name)}</td>
            <td>${fmt(n.highest)}</td>
            <td>${n.bids.length}</td>
            <td>${n.status}</td>
          </tr>
        `).join("")}

      </table>

    </div>
  `;
}

/* EMPIRICAL ALGORITHM COMPARISON */

function benchmark() {

  let data = Array.from(
    { length: 5000 },
    (_, i) => ({
      highest: Math.random() * 1000,
      id: i
    })
  );

  let results = [];

  for (let [name, fn] of [
    ["Merge Sort", mergeSort],
    ["Quick Sort", quickSort],
    ["Heap Sort", heapSort]
  ]) {

    let copy = data.map(x => ({ ...x }));

    let t = performance.now();

    fn(copy);

    results.push(
      `${name}: ${(performance.now() - t).toFixed(3)} ms`
    );
  }

  $("benchResult").innerHTML =
    "<h3>Empirical comparison (5,000 sample bids)</h3>" +

    results.map(x => `<p>${x}</p>`).join("") +

    "<p><b>Live-stream note:</b> A max-heap is efficient for repeatedly retrieving the current highest bid; a full leaderboard can be sorted with Merge Sort.</p>";
}

/* EXPORT RANKINGS TO CSV */

function exportCSV() {

  let ranked = heapSort(state.nfts);

  let rows = [
    ["Rank", "NFT Name", "Highest Bid ETH", "Total Bids", "Status"],

    ...ranked.map((n, i) => [
      i + 1,
      n.name,
      n.highest,
      n.bids.length,
      n.status
    ])
  ];

  let csv = rows.map(r =>
    r.map(v =>
      '"' + String(v).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\n");

  let url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv" })
  );

  let a = document.createElement("a");

  a.href = url;
  a.download = "NFT_BidRankings.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* AUTOMATIC LOGIN SESSION */

if (state.current && me()) {
  enter();
}