/**
 * Update the roadmap by editing the object below.
 * Each key is the headline for a roadmap item.
 * Values can be either:
 *   - Boolean (true = complete, false = planned)
 *   - Object with the following optional keys:
 *       done: boolean          // marks the item complete
 *       status: string         // overrides the default status label
 *       description: string    // short blurb shown under the title
 *       eta: string            // useful for "ETA Q3" style hints
 *       link: string           // optional URL for more info
 *       progress: number       // 0-100, shows a progress bar
 *       owner: string          // who is leading the work
 *       order: number          // lower number floats higher on the page
 * Example:
 * const roadmap = {
 *   "Ship new docs": true,
 *   "Multiplayer beta": {
 *      done: false,
 *      status: "In Progress",
 *      description: "Closed alpha with Discord community.",
 *      eta: "Q1 2025",
 *      progress: 65
 *   }
 * };
 */
const roadmap = {
  "Refresh landing page": {
    done: true,
    status: "Complete",
    description: "Tightened copy, new hero section, and stable navigation.",
    owner: "Akane",
    order: 1
  },
  "Roadmap hub launch": {
    done: false,
    status: "In Progress",
    description: "Create a transparent roadmap that is easy to maintain.",
    eta: "Q1 2025",
    progress: 45,
    owner: "Akane",
    order: 2
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const roadmapContainer = document.getElementById("roadmap");
  const yearEl = document.getElementById("roadmap-year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (!roadmapContainer) {
    console.warn("Roadmap container not found.");
    return;
  }

  const entries = normaliseRoadmap(roadmap);
  if (!entries.length) {
    roadmapContainer.innerHTML = `<p class="roadmap-empty">No roadmap items yet. Add items in <code>roadmap.js</code>.</p>`;
    return;
  }

  const list = document.createElement("ol");
  list.className = "roadmap-items";

  entries.forEach((item) => {
    const li = document.createElement("li");
    li.className = `roadmap-item ${item.cssStatus}`.trim();

    const title = document.createElement(item.link ? "a" : "div");
    title.className = "roadmap-title";

    if (item.link) {
      title.href = item.link;
      title.target = "_blank";
      title.rel = "noopener noreferrer";
    }

    const titleText = document.createElement("span");
    titleText.textContent = item.title;

    const badge = document.createElement("span");
    badge.className = "roadmap-status";
    badge.textContent = item.statusLabel;

    title.appendChild(titleText);
    title.appendChild(badge);
    li.appendChild(title);

    if (item.description) {
      const desc = document.createElement("p");
      desc.className = "roadmap-description";
      desc.textContent = item.description;
      li.appendChild(desc);
    }

    const metaBits = [];
    if (item.eta) metaBits.push({ icon: "🗓", label: item.eta });
    if (item.owner) metaBits.push({ icon: "👩‍💻", label: item.owner });
    if (item.progressText) metaBits.push({ icon: "⏱", label: item.progressText });

    if (metaBits.length) {
      const meta = document.createElement("div");
      meta.className = "roadmap-meta";
      metaBits.forEach((bit) => {
        const span = document.createElement("span");
        span.textContent = `${bit.icon} ${bit.label}`;
        meta.appendChild(span);
      });
      li.appendChild(meta);
    }

    if (item.progressValue !== null) {
      const bar = document.createElement("div");
      bar.className = "roadmap-progress-bar";

      const barInner = document.createElement("span");
      barInner.style.width = `${item.progressValue}%`;
      bar.appendChild(barInner);
      li.appendChild(bar);
    }

    list.appendChild(li);
  });

  roadmapContainer.appendChild(list);
  const footer = document.createElement("div");
  footer.className = "roadmap-footer";
  footer.textContent = `Last updated ${new Date().toLocaleDateString()}`;
  roadmapContainer.appendChild(footer);
});

function normaliseRoadmap(rawRoadmap) {
  const sourceEntries = Object.entries(rawRoadmap);

  return sourceEntries
    .map((entry, index) => {
      const [title, value] = entry;
      const isBoolean = typeof value === "boolean";
      const isObject = value && typeof value === "object" && !Array.isArray(value);

      const done = isBoolean ? value : Boolean(isObject && value.done);
      const description = isObject ? value.description || value.summary || "" : "";
      const statusLabel =
        (isObject && value.status) ||
        (done ? "Complete" : isObject && value.progress > 0 ? "In Progress" : "Planned");
      const eta = isObject && value.eta ? value.eta : "";
      const link = isObject && value.link ? value.link : "";
      const owner = isObject && value.owner ? value.owner : "";

      const hasProgressValue =
        isObject && typeof value.progress === "number" && value.progress >= 0 && value.progress <= 100;
      const progress = done ? null : hasProgressValue ? value.progress : null;

      const cssStatus = done
        ? "done"
        : progress !== null && progress > 0 && progress < 100
          ? "progress"
          : "";

      const order = isObject && typeof value.order === "number" ? value.order : index + 1;

      return {
        title,
        description,
        statusLabel,
        eta,
        link,
        owner,
        done,
        cssStatus,
        progressValue: progress === null ? null : Math.round(progress),
        progressText: progress === null ? "" : `${Math.round(progress)}%`,
        order
      };
    })
    .sort((a, b) => a.order - b.order);
}
