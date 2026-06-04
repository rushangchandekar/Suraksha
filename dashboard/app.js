/* ===============================
   SURAKSHA — Interactive Dashboard JS
   =============================== */

// ──── Particle Background ────
(function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.3 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ──── Dark Map Tile Layer ────
const map = L.map("map", { zoomControl: true }).setView([22.5, 79.5], 5);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
}).addTo(map);

const eventLayer = L.layerGroup().addTo(map);
const weatherLayer = L.layerGroup().addTo(map);
const correlatedLayer = L.layerGroup().addTo(map);

const layers = {
  events: eventLayer,
  weather: weatherLayer,
  correlated: correlatedLayer,
};

let lastFinishedAt = null;
let allIncidents = [];
let allTimeline = [];

// ──── Layer Toggles ────
document.querySelectorAll("[data-layer-toggle]").forEach((input) => {
  input.addEventListener("change", (event) => {
    const name = event.target.dataset.layerToggle;
    if (event.target.checked) {
      layers[name].addTo(map);
    } else {
      map.removeLayer(layers[name]);
    }
  });
});

// ──── Tab Navigation ────
document.querySelectorAll(".tab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.dataset.tab;
    document.getElementById(`content-${tabId}`).classList.add("active");
    if (tabId === "dashboard") {
      setTimeout(() => map.invalidateSize(), 100);
    }
  });
});

// ──── Modal ────
const modal = document.getElementById("incident-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

modalClose.addEventListener("click", () => modal.classList.remove("active"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("active"); });

function showIncidentModal(incident) {
  modalBody.innerHTML = `
    <div class="modal-body">
      <h2>${incident.title || "Incident"}</h2>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Severity</span>
          <span class="detail-value severity-${(incident.severity || '').toLowerCase()}">${incident.severity || "Unknown"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Type</span>
          <span class="detail-value">${incident.disaster_type || "Unknown"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Verification</span>
          <span class="detail-value">${incident.verification_status || "Unknown"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Priority</span>
          <span class="detail-value">${incident.priority_bucket || "Unknown"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">AI Relevance</span>
          <span class="detail-value">${incident.ai_relevance_index || "N/A"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Impact Radius</span>
          <span class="detail-value">${incident.impact_radius_km || "N/A"} km</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Sources</span>
          <span class="detail-value">${incident.source_count || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Signals</span>
          <span class="detail-value">${incident.event_count || 0}</span>
        </div>
      </div>
      <p style="color: var(--text-secondary); margin-bottom: 12px;">${incident.incident_summary || ""}</p>
      ${incident.recommended_actions && incident.recommended_actions.length ? `
        <div style="margin-top: 16px;">
          <span class="detail-label" style="display:block; margin-bottom:8px;">Recommended Actions</span>
          <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.88rem; line-height: 1.8;">
            ${incident.recommended_actions.map(a => `<li>${a}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button class="verify-button" onclick="verifyFromModal('${incident.incident_id}')">Verify Coverage</button>
      </div>
      <div id="modal-evidence" class="evidence-block"></div>
    </div>
  `;
  modal.classList.add("active");
}

async function verifyFromModal(incidentId) {
  const container = document.getElementById("modal-evidence");
  container.innerHTML = `<div class="evidence-item">Checking linked coverage...</div>`;
  const response = await fetch(`/api/incidents/${incidentId}/verify`);
  const payload = await response.json();

  if (payload.error) {
    container.innerHTML = `<div class="evidence-item">Verification failed: ${payload.error}</div>`;
    return;
  }

  const verdict = payload.verdict || {};
  const evidence = payload.evidence || [];
  container.innerHTML = `
    <div class="evidence-item">
      <strong>Verdict:</strong> ${verdict.label || "unknown"}<br>
      Supporting: ${verdict.supporting_count || 0},
      Refuting: ${verdict.refuting_count || 0},
      Related: ${verdict.related_count || 0}
    </div>
    ${evidence.map((item) => `
      <div class="evidence-item">
        <strong>${item.title || "Untitled source"}</strong><br>
        <a class="evidence-link" href="${item.url || "#"}" target="_blank" rel="noreferrer">${item.url || "No URL"}</a><br>
        Stance: ${item.stance} | Sentiment: ${item.sentiment.label}<br>
        ${item.snippet || ""}
      </div>
    `).join("")}
  `;
}

// ──── Color Helpers ────
function severityColor(severity) {
  switch ((severity || "").toLowerCase()) {
    case "critical": return "#ef4444";
    case "high": return "#f59e0b";
    case "moderate": return "#10b981";
    default: return "#64748b";
  }
}

function severityGlow(severity) {
  switch ((severity || "").toLowerCase()) {
    case "critical": return "rgba(239, 68, 68, 0.5)";
    case "high": return "rgba(245, 158, 11, 0.5)";
    case "moderate": return "rgba(16, 185, 129, 0.5)";
    default: return "rgba(100, 116, 139, 0.3)";
  }
}

// ──── Data Loading ────
async function loadDashboard() {
  try {
    const [intelligenceRes, mapRes, timelineRes, priorityRes] = await Promise.all([
      fetch("/api/intelligence/latest"),
      fetch("/api/map/layers"),
      fetch("/api/timeline"),
      fetch("/api/incidents/priority"),
    ]);

    const intelligence = await intelligenceRes.json();
    const mapData = await mapRes.json();
    const timeline = await timelineRes.json();
    const priority = await priorityRes.json();

    allIncidents = priority.items || [];
    allTimeline = timeline.items || [];

    renderSummary(intelligence.summary || {});
    renderUspMetrics(intelligence.summary || {}, priority.items || []);
    renderMap(mapData);
    renderTimeline(timeline.items || []);
    renderPriority(priority.items || []);
    renderAllIncidents(priority.items || []);
    populateTypeFilter(priority.items || []);
  } catch (error) {
    document.getElementById("timeline").innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>Failed to load: ${error.message}</p>
      </div>
    `;
  }
}

// ──── Render: Summary Cards ────
function renderSummary(summary) {
  const cards = [
    { label: "Incidents", value: summary.total_incidents || 0, icon: "alert-triangle", color: "var(--danger)" },
    { label: "Raw Events", value: summary.total_events || 0, icon: "activity", color: "var(--info)" },
    { label: "Critical", value: summary.critical_events || 0, icon: "zap", color: "var(--warning)" },
    { label: "Correlated", value: summary.correlated_alerts || 0, icon: "git-merge", color: "var(--ok)" },
  ];

  const iconSvgs = {
    "alert-triangle": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    "activity": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    "zap": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    "git-merge": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>`,
  };

  document.getElementById("summary-cards").innerHTML = cards.map((c) => `
    <article class="metric-card">
      <div class="metric-icon" style="background: ${c.color}15; color: ${c.color};">${iconSvgs[c.icon]}</div>
      <span class="metric-label">${c.label}</span>
      <strong class="metric-value">${c.value}</strong>
    </article>
  `).join("");
}

// ──── Render: USP Metrics ────
function renderUspMetrics(summary, priorityItems) {
  const top = priorityItems[0] || {};
  const cards = [
    { label: "Cross-source verified", value: summary.verified_incidents || 0, body: "Incidents corroborated across multiple sources." },
    { label: "Temporal anomalies", value: summary.correlated_alerts || 0, body: "Multi-signal spikes in correlation window." },
    { label: "AI relevance index", value: summary.avg_ai_relevance_index || 0, body: "Average urgency across fused incidents." },
    { label: "Top impact radius", value: top.impact_radius_km ? `${top.impact_radius_km} km` : "n/a", body: "Largest estimated response footprint." },
  ];

  document.getElementById("usp-metrics").innerHTML = cards.map((card) => `
    <article class="usp-card">
      <span class="metric-label">${card.label}</span>
      <strong>${card.value}</strong>
      <p>${card.body}</p>
    </article>
  `).join("");
}

// ──── Render: Map ────
function renderMap(data) {
  eventLayer.clearLayers();
  weatherLayer.clearLayers();
  correlatedLayer.clearLayers();

  const bounds = [];

  (data.event_markers || []).forEach((marker) => {
    const loc = marker.location || {};
    if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) return;

    const leafletMarker = L.circleMarker([loc.latitude, loc.longitude], {
      radius: 9,
      weight: 2,
      color: severityColor(marker.severity),
      fillColor: severityColor(marker.severity),
      fillOpacity: 0.7,
    }).bindPopup(`
      <strong>${marker.title || "Event"}</strong><br>
      ${marker.disaster_type || "unknown"}<br>
      Severity: ${marker.severity || "unknown"}<br>
      Confidence: ${marker.confidence_score || 0}<br>
      Signals: ${marker.event_count || 0} / Sources: ${marker.source_count || 0}
    `);

    // Pulsing effect for critical events
    if ((marker.severity || "").toLowerCase() === "critical") {
      leafletMarker.setStyle({ className: "pulse-marker" });
    }

    leafletMarker.addTo(eventLayer);
    bounds.push([loc.latitude, loc.longitude]);
  });

  (data.weather_overlay || []).forEach((item) => {
    const loc = item.location || {};
    if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) return;

    const circle = L.circle([loc.latitude, loc.longitude], {
      radius: 45000,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.12,
      weight: 1.5,
    }).bindPopup(`
      <strong>${item.title}</strong><br>
      Severity: ${item.severity || "unknown"}<br>
      Rain: ${item.precipitation_mm ?? "n/a"} mm<br>
      Wind: ${item.wind_speed_kmh ?? "n/a"} km/h
    `);

    circle.addTo(weatherLayer);
    bounds.push([loc.latitude, loc.longitude]);
  });

  (data.correlated_overlay || []).forEach((item, index) => {
    const coords = item.location_coords || {};
    const lat = Number.isFinite(coords.latitude) ? coords.latitude : 20 + index;
    const lon = Number.isFinite(coords.longitude) ? coords.longitude : 78 + index;
    const marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "correlated-icon",
        html: `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color:#fff; border-radius:999px; padding:6px 12px; font-size:11px; font-weight:600; white-space:nowrap; box-shadow: 0 4px 15px rgba(99,102,241,0.4);">${item.disaster_type || "alert"}</div>`,
      }),
    }).bindPopup(`
      <strong>${item.location || "Correlated alert"}</strong><br>
      Type: ${item.disaster_type || "unknown"}<br>
      Severity: ${item.severity || "unknown"}<br>
      Sources: ${(item.sources || []).join(", ")}
    `);
    marker.addTo(correlatedLayer);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

// ──── Render: Timeline ────
function renderTimeline(items) {
  const container = document.getElementById("timeline");
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p>No events available yet.<br>Run the ingestion pipeline or connect live sources.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="timeline-item">
      <div class="timeline-meta severity-${item.severity}">
        ${new Date(item.timestamp).toLocaleString()} — ${item.source}
      </div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-summary">${item.incident_summary || ""}</div>
      <div class="timeline-tags">
        <span class="tag">${item.disaster_type}</span>
        <span class="tag">${item.severity}</span>
        <span class="tag">${item.verification_status || "unknown"}</span>
        <span class="tag">${item.priority_bucket || "medium"}</span>
        <span class="tag">AI ${item.ai_relevance_index || "n/a"}</span>
        <span class="tag">${item.impact_radius_km || "n/a"} km</span>
        <span class="tag">conf. ${item.confidence}</span>
      </div>
    </article>
  `).join("");
}

// ──── Render: Priority Incidents ────
async function verifyIncident(incidentId, container) {
  container.innerHTML = `<div class="evidence-item">Checking linked coverage...</div>`;
  const response = await fetch(`/api/incidents/${incidentId}/verify`);
  const payload = await response.json();

  if (payload.error) {
    container.innerHTML = `<div class="evidence-item">Verification failed: ${payload.error}</div>`;
    return;
  }

  const verdict = payload.verdict || {};
  const evidence = payload.evidence || [];
  container.innerHTML = `
    <div class="evidence-item">
      <strong>Verdict:</strong> ${verdict.label || "unknown"}<br>
      Supporting: ${verdict.supporting_count || 0},
      Refuting: ${verdict.refuting_count || 0},
      Related: ${verdict.related_count || 0}
    </div>
    ${evidence.map((item) => `
      <div class="evidence-item">
        <strong>${item.title || "Untitled source"}</strong><br>
        <a class="evidence-link" href="${item.url || "#"}" target="_blank" rel="noreferrer">${item.url || "No URL"}</a><br>
        Stance: ${item.stance} | Sentiment: ${item.sentiment.label}<br>
        ${item.snippet || ""}
      </div>
    `).join("")}
  `;
}

function renderPriority(items) {
  const container = document.getElementById("priority-incidents");
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
        <p>No priority incidents available yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.slice(0, 5).map((item) => `
    <article class="priority-card" data-incident-id="${item.incident_id}">
      <div class="priority-topline">
        <h3>${item.title}</h3>
        <span class="badge badge-${item.verification_status}">${item.verification_status}</span>
      </div>
      <div class="timeline-tags">
        <span class="tag">${item.priority_bucket}</span>
        <span class="tag">${item.severity}</span>
        <span class="tag">${item.source_count} sources</span>
        <span class="tag">${item.event_count} signals</span>
        <span class="tag">AI ${item.ai_relevance_index || "n/a"}</span>
        <span class="tag">${item.impact_radius_km || "n/a"} km</span>
        <span class="tag">${item.verification_strength || "weak"}</span>
      </div>
      <p>${item.incident_summary || ""}</p>
      <div class="priority-actions">${(item.recommended_actions || []).slice(0, 2).join(" ")}</div>
      <div class="timeline-tags" style="margin-top:12px;">
        <button type="button" class="verify-button">Verify Coverage</button>
      </div>
      <div class="evidence-block"></div>
    </article>
  `).join("");

  // Attach event listeners
  container.querySelectorAll(".priority-card").forEach((card) => {
    const button = card.querySelector(".verify-button");
    const evidenceBlock = card.querySelector(".evidence-block");
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      verifyIncident(card.dataset.incidentId, evidenceBlock);
    });

    // Open modal on card click
    card.addEventListener("click", () => {
      const incident = items.find(i => i.incident_id === card.dataset.incidentId);
      if (incident) showIncidentModal(incident);
    });
  });
}

// ──── Render: All Incidents (Incidents Tab) ────
function renderAllIncidents(items) {
  const container = document.getElementById("all-incidents");
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>No incidents to display.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, idx) => `
    <article class="incident-card severity-border-${(item.severity || 'low').toLowerCase()}" data-index="${idx}" style="animation-delay: ${idx * 0.05}s">
      <div class="priority-topline">
        <h3>${item.title}</h3>
        <span class="badge badge-${item.verification_status}">${item.verification_status}</span>
      </div>
      <div class="timeline-tags">
        <span class="tag">${item.disaster_type || "unknown"}</span>
        <span class="tag">${item.severity || "unknown"}</span>
        <span class="tag">${item.priority_bucket || "medium"}</span>
        <span class="tag">${item.source_count || 0} sources</span>
      </div>
      <p>${item.incident_summary || ""}</p>
    </article>
  `).join("");

  // Open modal on click
  container.querySelectorAll(".incident-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.index);
      showIncidentModal(items[idx]);
    });
  });
}

// ──── Populate Type Filter ────
function populateTypeFilter(items) {
  const select = document.getElementById("type-filter");
  const types = [...new Set(items.map(i => i.disaster_type).filter(Boolean))];
  select.innerHTML = `<option value="all">All Types</option>` +
    types.map(t => `<option value="${t}">${t}</option>`).join("");
}

// ──── Filtering ────
document.getElementById("severity-filter").addEventListener("change", applyFilters);
document.getElementById("type-filter").addEventListener("change", applyFilters);

function applyFilters() {
  const severity = document.getElementById("severity-filter").value;
  const type = document.getElementById("type-filter").value;
  let filtered = allIncidents;
  if (severity !== "all") filtered = filtered.filter(i => (i.severity || "").toLowerCase() === severity);
  if (type !== "all") filtered = filtered.filter(i => i.disaster_type === type);
  renderAllIncidents(filtered);
}

// ──── Ingestion Status ────
async function updateIngestionStatus() {
  try {
    const response = await fetch("/api/ingestion/status");
    const payload = await response.json();
    const pill = document.getElementById("ingestion-status");
    const statusText = pill.querySelector(".status-text");

    if (payload.running) {
      pill.classList.add("running");
      statusText.textContent = `Running since ${new Date(payload.last_started).toLocaleTimeString()}`;
      return;
    }

    pill.classList.remove("running");
    if (payload.last_finished) {
      statusText.textContent = `Done at ${new Date(payload.last_finished).toLocaleTimeString()}`;
      if (payload.last_finished !== lastFinishedAt) {
        lastFinishedAt = payload.last_finished;
        loadDashboard();
      }
      return;
    }
    statusText.textContent = "Idle";
  } catch {
    // Silently ignore status check failures
  }
}

// ──── Button Handlers ────
document.getElementById("refresh-button").addEventListener("click", () => {
  const btn = document.getElementById("refresh-button");
  btn.style.transform = "rotate(360deg)";
  btn.style.transition = "transform 0.6s ease";
  setTimeout(() => { btn.style.transform = ""; btn.style.transition = ""; }, 700);
  loadDashboard();
});

document.getElementById("rerun-button").addEventListener("click", async () => {
  const pill = document.getElementById("ingestion-status");
  const statusText = pill.querySelector(".status-text");
  pill.classList.add("running");
  statusText.textContent = "Triggering...";
  await fetch("/api/ingestion/run", { method: "POST" });
  updateIngestionStatus();
});

// ──── Bootstrap ────
setInterval(updateIngestionStatus, 10000);
loadDashboard();
