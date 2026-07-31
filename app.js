const atlas = window.CYBER_TOOL_ATLAS;

const state = {
  search: "",
  category: "All",
  sort: "name",
  visible: 60,
};

const els = {
  toolTotal: document.querySelector("#toolTotal"),
  categoryTotal: document.querySelector("#categoryTotal"),
  activeCount: document.querySelector("#activeCount"),
  searchInput: document.querySelector("#searchInput"),
  categorySelect: document.querySelector("#categorySelect"),
  sortSelect: document.querySelector("#sortSelect"),
  resetButton: document.querySelector("#resetButton"),
  categoryList: document.querySelector("#categoryList"),
  resultsTitle: document.querySelector("#resultsTitle"),
  resultsSummary: document.querySelector("#resultsSummary"),
  toolGrid: document.querySelector("#toolGrid"),
  emptyState: document.querySelector("#emptyState"),
  loadMoreButton: document.querySelector("#loadMoreButton"),
  repoLink: document.querySelector("#repoLink"),
};

const repoUrl = "https://github.com/rice2k/cyber-tool-atlas";
els.repoLink.href = repoUrl;
els.toolTotal.textContent = atlas.totalTools.toLocaleString();
els.categoryTotal.textContent = atlas.categories.length.toLocaleString();

function hostName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesSearch(tool) {
  if (!state.search) return true;
  const haystack = [
    tool.name,
    tool.description,
    tool.category,
    tool.section,
    hostName(tool.url),
    ...(tool.meta || []),
  ].join(" ");
  return normalize(haystack).includes(normalize(state.search));
}

function filteredTools() {
  const filtered = atlas.tools.filter((tool) => {
    const categoryMatch = state.category === "All" || tool.category === state.category;
    return categoryMatch && matchesSearch(tool);
  });

  return filtered.sort((a, b) => {
    if (state.sort === "category") {
      return `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`);
    }
    if (state.sort === "section") {
      return `${a.section} ${a.name}`.localeCompare(`${b.section} ${b.name}`);
    }
    return a.name.localeCompare(b.name);
  });
}

function createCategoryButton(category) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "category-button";
  button.dataset.category = category.name;
  button.setAttribute("aria-pressed", String(state.category === category.name));
  button.innerHTML = `
    <strong><span>${category.name}</span><span>${category.count}</span></strong>
    <span>${category.description}</span>
  `;
  button.addEventListener("click", () => {
    state.category = category.name;
    state.visible = 60;
    els.categorySelect.value = category.name;
    render();
  });
  return button;
}

function renderCategories() {
  els.categoryList.replaceChildren(...atlas.categories.map(createCategoryButton));
  els.categorySelect.replaceChildren(
    new Option("All categories", "All"),
    ...atlas.categories.map((category) => new Option(`${category.name} (${category.count})`, category.name)),
  );
  els.categorySelect.value = state.category;
}

function createToolCard(tool) {
  const card = document.createElement("article");
  card.className = "tool-card";

  const meta = (tool.meta || [])
    .slice(0, 3)
    .map((item) => `<span class="meta-pill">${item}</span>`)
    .join("");

  card.innerHTML = `
    <div class="tool-topline">
      <span class="tag">${tool.category}</span>
    </div>
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    ${meta ? `<div class="tool-meta">${meta}</div>` : ""}
    <div class="tool-actions">
      <span class="host">${hostName(tool.url)}</span>
      <a class="open-link" href="${tool.url}" target="_blank" rel="noreferrer">Open</a>
    </div>
  `;
  return card;
}

function renderResults() {
  const tools = filteredTools();
  const visibleTools = tools.slice(0, state.visible);
  const title = state.category === "All" ? "All Tools" : state.category;

  els.resultsTitle.textContent = title;
  els.resultsSummary.textContent = `${tools.length.toLocaleString()} match${tools.length === 1 ? "" : "es"}`;
  els.activeCount.textContent = `${tools.length.toLocaleString()} shown`;
  els.emptyState.hidden = tools.length !== 0;
  els.toolGrid.replaceChildren(...visibleTools.map(createToolCard));
  els.loadMoreButton.hidden = visibleTools.length >= tools.length;
}

function renderPressedStates() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
  });
}

function render() {
  renderPressedStates();
  renderResults();
}

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  state.visible = 60;
  render();
});

els.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  state.visible = 60;
  render();
});

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  state.visible = 60;
  render();
});

els.resetButton.addEventListener("click", () => {
  state.search = "";
  state.category = "All";
  state.sort = "name";
  state.visible = 60;
  els.searchInput.value = "";
  els.categorySelect.value = "All";
  els.sortSelect.value = "name";
  render();
});

els.loadMoreButton.addEventListener("click", () => {
  state.visible += 60;
  render();
});

renderCategories();
render();
