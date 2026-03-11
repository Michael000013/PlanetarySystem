// js/planets.js

(function () {
  // Config
  const JSON_PATH = ".//data/planets.json";   // <-- adjust if your JSON is elsewhere
  const INCLUDE_PLUTO = true;             // set true if you want to include Pluto

  // Utility: friendly yes/no
  const yesNo = (b) => (b ? "Yes" : "No");

  // Utility: safe number format
  const fmt = (n, digits = 2) =>
    (typeof n === "number" && isFinite(n)) ? n.toFixed(digits) : "—";

  // Image path builder with fallback name mapping
  function imagePathFor(name) {
    const file = `${name}`.toLowerCase().replace(/\s+/g, "");
    return `img/planets/${file}.png`;
  }

  // Which entries count as planets for this UI
  function isPlanetName(name) {
    const majors = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"];
    if (majors.includes(name)) return true;
    if (INCLUDE_PLUTO && name === "Pluto") return true;
    return false;
  }

  // Build one card column HTML
  function cardColumn(item, idx) {
    const idSafe = item.name.toLowerCase().replace(/\s+/g, "-");
    const collapseId = `details-${idSafe}-${idx}`;

    const imgSrc = imagePathFor(item.name);

    const alt = fmt(item.altitude);
    const az = fmt(item.azimuth);
    const mag = (typeof item.magnitude === "number") ? item.magnitude.toFixed(2) : "—";

    // Bootstrap card with collapse
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card planet-card h-100" data-collapse-id="${collapseId}" role="button" tabindex="0" aria-label="Toggle details for ${item.name}">
          <div class="card-body text-center">
            <img class="planet-thumb" src="${imgSrc}" alt="${item.name}" onerror="this.src='img/planets/_placeholder.png'">
            <h5 class="card-title">${item.name}</h5>
            <button class="btn btn-outline-info btn-sm mt-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#${collapseId}"
                    aria-expanded="false"
                    aria-controls="${collapseId}">
              Details
            </button>

            <div id="${collapseId}" class="collapse planet-details mt-3">
              <ul class="list-unstyled mb-0 small">
                <li><span class="label">Constellation:</span> <span class="value">${item.constellation ?? "—"}</span></li>
                <li><span class="label">Altitude:</span> <span class="value">${alt}°</span></li>
                <li><span class="label">Azimuth:</span> <span class="value">${az}°</span></li>
                <li><span class="label">Magnitude:</span> <span class="value">${mag}</span></li>
                <li><span class="label">Above horizon:</span> <span class="value">${yesNo(!!item.aboveHorizon)}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render all cards
  function renderPlanets(list) {
    const row = document.getElementById("planetsRow");
    if (!row) return;

    // Filter down to planets
    const planetsOnly = list.filter((it) => isPlanetName(it.name));

    if (!planetsOnly.length) {
      showAlert("No planet data found in the file. Check your JSON or filters.", "warning");
      return;
    }

    row.innerHTML = planetsOnly.map(cardColumn).join("");

    // Make the whole card toggle the collapse (not just the button)
    row.querySelectorAll(".planet-card").forEach((card) => {
      const collapseId = card.getAttribute("data-collapse-id");
      const panel = document.getElementById(collapseId);
      if (!panel) return;

      const bsCollapse = new bootstrap.Collapse(panel, { toggle: false });

      const clickHandler = (ev) => {
        // avoid toggling when clicking an interactive element
        if (ev.target.closest("button, a, [data-bs-toggle]")) return;
        bsCollapse.toggle();
      };

      card.addEventListener("click", clickHandler);
      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          bsCollapse.toggle();
        }
      });
    });
  }

  function showAlert(message, type = "danger") {
    const host = document.getElementById("alerts");
    if (!host) return;
    host.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  // Fetch and init
  async function init() {
    try {
      const res = await fetch(JSON_PATH, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const json = await res.json();

      // Supports either { data: [...] } or plain array
      const items = Array.isArray(json) ? json : (json.data || []);
      if (!Array.isArray(items)) {
        throw new Error("Unexpected JSON format. Expected an array or an object with a 'data' array.");
      }
      renderPlanets(items);
    } catch (err) {
      console.error(err);
      showAlert(`Could not load planets.json. ${err.message}`, "danger");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();