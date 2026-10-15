// 300 sample car records generated in the browser (seed 100).
// cost = estimated purchase cost (assumption used for profit).
let seed = 100;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const wpick = (a, w) => { let r = rnd() * w.reduce((x, y) => x + y), i = 0; while (r >= w[i]) { r -= w[i]; i++; } return a[i]; };
const CARS = {
  "Maruti Suzuki": { Swift: 7, Baleno: 8, Dzire: 7.5, Brezza: 10.5, Ertiga: 11 },
  Hyundai: { i10: 6, i20: 8.5, Creta: 13.5, Verna: 12, Venue: 10 },
  Tata: { Tiago: 6.5, Nexon: 10.5, Harrier: 17, Punch: 7.5, Altroz: 8 },
  Honda: { City: 13, Amaze: 8, Jazz: 8.5, "WR-V": 9.5 },
  Toyota: { "Innova Crysta": 21, Fortuner: 38, Glanza: 8, "Urban Cruiser": 11 },
  Mahindra: { XUV300: 10.5, Scorpio: 14.5, Thar: 15.5, XUV700: 20, Bolero: 10 },
  Kia: { Seltos: 14, Sonet: 10, Carens: 12.5 },
  Ford: { EcoSport: 10, Figo: 6, Endeavour: 33 }
};
const CITY = { Mumbai: 1.03, Delhi: 1, Bengaluru: 1.04, Pune: 1.01, Hyderabad: 1, Chennai: .99, Kolkata: .96, Ahmedabad: .98, Jaipur: .96, Lucknow: .95 };
const DATA = [];
for (let i = 1; i <= 300; i++) {
  const brand = pick(Object.keys(CARS)), model = pick(Object.keys(CARS[brand]));
  const year = 2013 + Math.floor(rnd() * 13), age = 2026 - year;
  const km = Math.max(2000, Math.round((age * 11000 + (rnd() + rnd() + rnd() - 1.5) * 8000) / 100) * 100);
  let fuel = wpick(["Petrol", "Diesel", "CNG", "Electric"], [50, 35, 10, 5]);
  if (brand === "Ford" && fuel === "Electric") fuel = "Petrol";
  const trans = wpick(["Manual", "Automatic"], [70, 30]), owner = wpick(["1st", "2nd", "3rd"], [65, 28, 7]), city = pick(Object.keys(CITY));
  let p = CARS[brand][model] * 1e5 * Math.pow(.88, age) * (1 - Math.min(.25, km / 1e6 * 1.2));
  p *= fuel === "Diesel" ? 1.08 : fuel === "Electric" ? 1.15 : fuel === "CNG" ? .97 : 1;
  p *= trans === "Automatic" ? 1.06 : 1;
  p *= owner === "2nd" ? .95 : owner === "3rd" ? .88 : 1;
  p *= CITY[city] * (.93 + rnd() * .14);
  const price = Math.round(p / 1000) * 1000, cost = Math.round(price * (.84 + rnd() * .1) / 1000) * 1000;
  const d = new Date(2025, 9, 1 + Math.floor(rnd() * 365));
  const date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  DATA.push({ id: "CAR" + String(i).padStart(4, "0"), brand, model, year, km, fuel, trans, owner, city, date, price, cost });
}

const inr = n => "\u20b9" + Math.round(n).toLocaleString("en-IN");
const short = n => n >= 1e7 ? "\u20b9" + (n / 1e7).toFixed(2) + " Cr" : n >= 1e5 ? "\u20b9" + (n / 1e5).toFixed(2) + " L" : inr(n);
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
const group = (a, key) => a.reduce((m, x) => ((m[x[key]] = m[x[key]] || []).push(x), m), {});
const COLORS = ["#0e86d4", "#0b4a99", "#16a34a", "#f59e0b", "#7c3aed", "#dc2626", "#0891b2", "#db2777", "#65a30d", "#475569"];
let charts = [];

function make(id, cfg) {
  const c = new Chart(document.getElementById(id), cfg);
  charts.push(c);
}
const baseOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

function kpis() {
  const sales = sum(DATA, d => d.price), profit = sales - sum(DATA, d => d.cost);
  const items = [
    ["Total Profit", short(profit), "Estimated gross profit", "profit"],
    ["Profit Margin", (profit / sales * 100).toFixed(1) + "%", "Profit as a share of sales value", "profit"],
    ["Total Cars", DATA.length, "Records in dataset", ""],
    ["Total Sales Value", short(sales), "Combined car value", ""],
    ["Average Car Price", short(sales / DATA.length), "Mean selling price", ""]
  ];
  document.getElementById("kpis").innerHTML = items.map(i =>
    `<div class="card ${i[3]}"><small>${i[0]}</small><b>${i[1]}</b><em>${i[2]}</em></div>`).join("");
}

function dashboardCharts() {
  const b = group(DATA, "brand"), bk = Object.keys(b).sort((x, y) => b[y].length - b[x].length);
  make("cBrand", { type: "bar", data: { labels: bk, datasets: [{ data: bk.map(k => b[k].length), backgroundColor: "#0e86d4" }] }, options: baseOpts });
  const f = group(DATA, "fuel"), fk = Object.keys(f);
  make("cFuel", { type: "doughnut", data: { labels: fk, datasets: [{ data: fk.map(k => f[k].length), backgroundColor: COLORS }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } } });
  const m = {}; DATA.forEach(d => { const k = d.date.slice(0, 7); m[k] = (m[k] || 0) + d.price; });
  const mk = Object.keys(m).sort();
  make("cMonth", { type: "line", data: { labels: mk, datasets: [{ data: mk.map(k => m[k]), borderColor: "#0b4a99", backgroundColor: "rgba(14,134,212,.15)", fill: true, tension: .3 }] },
    options: { ...baseOpts, scales: { y: { ticks: { callback: v => short(v) } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => inr(c.parsed.y) } } } } });
}

function avgBy(key, sortFn) {
  const g = group(DATA, key), k = Object.keys(g).sort(sortFn);
  return [k, k.map(x => sum(g[x], d => d.price) / g[x].length)];
}
const money = { scales: { y: { ticks: { callback: v => short(v) } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => inr(c.parsed.y) } } } };

function priceCharts() {
  let [yk, yv] = avgBy("year", (a, b) => a - b);
  make("pYear", { type: "line", data: { labels: yk, datasets: [{ data: yv, borderColor: "#0b4a99", tension: .3 }] }, options: { responsive: true, maintainAspectRatio: false, ...money } });
  let [fk, fv] = avgBy("fuel", (a, b) => a.localeCompare(b));
  make("pFuel", { type: "bar", data: { labels: fk, datasets: [{ data: fv, backgroundColor: COLORS }] }, options: { responsive: true, maintainAspectRatio: false, ...money } });
  let [ck, cv] = avgBy("city", (a, b) => a.localeCompare(b));
  make("pCity", { type: "bar", data: { labels: ck, datasets: [{ data: cv, backgroundColor: "#0e86d4" }] }, options: { responsive: true, maintainAspectRatio: false, ...money } });
  make("pKm", { type: "scatter", data: { datasets: [{ data: DATA.map(d => ({ x: d.km, y: d.price })), backgroundColor: "rgba(14,134,212,.6)" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.x.toLocaleString("en-IN") + " km, " + inr(c.parsed.y) } } },
      scales: { x: { title: { display: true, text: "KM driven" } }, y: { ticks: { callback: v => short(v) } } } } });
}

function setupTable() {
  const fill = (id, label, key) => {
    const vals = [...new Set(DATA.map(d => d[key]))].sort();
    document.getElementById(id).innerHTML = `<option value="">${label}</option>` + vals.map(v => `<option>${v}</option>`).join("");
  };
  fill("fBrand", "All brands", "brand"); fill("fCity", "All cities", "city"); fill("fFuel", "All fuel types", "fuel");
  const draw = () => {
    const q = document.getElementById("q").value.toLowerCase(), b = fBrand.value, c = fCity.value, f = fFuel.value;
    const rows = DATA.filter(d => (!b || d.brand === b) && (!c || d.city === c) && (!f || d.fuel === f) && (d.brand + " " + d.model).toLowerCase().includes(q));
    document.getElementById("count").textContent = `Showing ${rows.length} of ${DATA.length} cars`;
    document.getElementById("rows").innerHTML = rows.map(d =>
      `<tr><td>${d.id}</td><td>${d.brand}</td><td>${d.model}</td><td>${d.year}</td><td>${d.km.toLocaleString("en-IN")}</td><td>${d.fuel}</td><td>${d.trans}</td><td>${d.owner}</td><td>${d.city}</td><td>${d.date}</td><td>${inr(d.price)}</td></tr>`).join("") ||
      `<tr><td colspan="11">No cars match these filters. Clear a filter to see more.</td></tr>`;
  };
  ["q", "fBrand", "fCity", "fFuel"].forEach(id => document.getElementById(id).addEventListener("input", draw));
  draw();
}

function show(view) {
  charts.forEach(c => c.destroy()); charts = [];
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === view));
  document.querySelectorAll(".nav").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  if (view === "dashboard") dashboardCharts();
  if (view === "price") priceCharts();
}

document.querySelectorAll(".nav").forEach(n => n.addEventListener("click", () => show(n.dataset.view)));
kpis(); setupTable(); show("dashboard");