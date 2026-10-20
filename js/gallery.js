function getSortedYears() {
  return Object.keys(WORKS_BY_YEAR)
    .map(Number)
    .sort((a, b) => b - a);
}

function workCount(year) {
  return (WORKS_BY_YEAR[year] || []).length;
}

function coverWork(year) {
  const list = WORKS_BY_YEAR[year];
  return list && list.length ? list[0] : null;
}

function renderYearIndex(container) {
  const years = getSortedYears();
  container.innerHTML = "";

  years.forEach((year) => {
    const cover = coverWork(year);
    const count = workCount(year);
    const card = document.createElement("a");
    card.className = "year-card";
    card.href = `works.html?year=${year}`;
    card.innerHTML = `
      <span class="year-card-media">
        ${
          cover
            ? `<img src="${cover.src}" alt="${cover.alt || cover.title}" loading="lazy" />`
            : `<span class="year-card-placeholder" aria-hidden="true"></span>`
        }
      </span>
      <span class="year-card-label">
        <strong>${year}</strong>
        <span>${count} work${count === 1 ? "" : "s"}</span>
      </span>
    `;
    container.appendChild(card);
  });
}

function renderYearGallery(year, gridEl, headingEl) {
  const works = WORKS_BY_YEAR[year];
  if (!works || !works.length) {
    gridEl.innerHTML = `<p class="section-intro">No works listed for ${year} yet.</p>`;
    return [];
  }

  if (headingEl) {
    headingEl.textContent = String(year);
  }

  gridEl.innerHTML = "";
  works.forEach((work, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "artwork-thumb";
    item.dataset.index = String(index);
    item.innerHTML = `
      <span class="artwork-thumb-media">
        <img src="${work.src}" alt="${work.alt || work.title}" loading="lazy" />
      </span>
      <span class="artwork-thumb-caption">
        <strong>${work.title}</strong>
        <span>${work.medium}</span>
      </span>
    `;
    gridEl.appendChild(item);
  });

  return works;
}

function createLightbox() {
  let works = [];
  let index = 0;

  const root = document.createElement("div");
  root.className = "lightbox";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Artwork viewer");
  root.innerHTML = `
    <button type="button" class="lightbox-backdrop" aria-label="Close viewer"></button>
    <div class="lightbox-panel">
      <button type="button" class="lightbox-close" aria-label="Close">×</button>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous artwork">‹</button>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Next artwork">›</button>
      <figure class="lightbox-figure">
        <img class="lightbox-image" src="" alt="" />
        <figcaption class="lightbox-caption">
          <strong class="lightbox-title"></strong>
          <span class="lightbox-meta"></span>
        </figcaption>
      </figure>
      <p class="lightbox-counter" aria-live="polite"></p>
    </div>
  `;
  document.body.appendChild(root);

  const img = root.querySelector(".lightbox-image");
  const titleEl = root.querySelector(".lightbox-title");
  const metaEl = root.querySelector(".lightbox-meta");
  const counterEl = root.querySelector(".lightbox-counter");
  const prevBtn = root.querySelector(".lightbox-prev");
  const nextBtn = root.querySelector(".lightbox-next");

  function showAt(i) {
    if (!works.length) return;
    index = (i + works.length) % works.length;
    const work = works[index];
    img.src = work.src;
    img.alt = work.alt || work.title;
    titleEl.textContent = work.title;
    metaEl.textContent = work.medium;
    counterEl.textContent = `${index + 1} / ${works.length}`;
    prevBtn.disabled = works.length <= 1;
    nextBtn.disabled = works.length <= 1;
  }

  function open(startIndex, yearWorks) {
    works = yearWorks;
    showAt(startIndex);
    root.hidden = false;
    document.body.classList.add("lightbox-open");
    root.querySelector(".lightbox-close").focus();
  }

  function close() {
    root.hidden = true;
    document.body.classList.remove("lightbox-open");
    img.removeAttribute("src");
  }

  root.querySelector(".lightbox-close").addEventListener("click", close);
  root.querySelector(".lightbox-backdrop").addEventListener("click", close);
  prevBtn.addEventListener("click", () => showAt(index - 1));
  nextBtn.addEventListener("click", () => showAt(index + 1));

  document.addEventListener("keydown", (event) => {
    if (root.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") showAt(index - 1);
    if (event.key === "ArrowRight") showAt(index + 1);
  });

  return { open, close };
}

function initYearPage() {
  const params = new URLSearchParams(window.location.search);
  const year = params.get("year");
  const grid = document.querySelector("[data-year-works]");
  const heading = document.querySelector("[data-year-heading]");
  const backLink = document.querySelector("[data-year-back]");

  if (!grid || !year) return;

  if (!WORKS_BY_YEAR[year]) {
    if (heading) heading.textContent = "Gallery";
    grid.innerHTML =
      '<p class="section-intro">That year was not found. <a href="index.html#gallery">Back to gallery</a></p>';
    return;
  }

  document.title = `${year} | Jae`;
  if (backLink) {
    backLink.textContent = "All years";
    backLink.href = "index.html#gallery";
  }

  const works = renderYearGallery(year, grid, heading);
  const lightbox = createLightbox();

  grid.addEventListener("click", (event) => {
    const thumb = event.target.closest(".artwork-thumb");
    if (!thumb) return;
    const i = Number(thumb.dataset.index);
    lightbox.open(i, works);
  });

  const openParam = params.get("piece");
  if (openParam !== null) {
    const pieceIndex = Number(openParam);
    if (!Number.isNaN(pieceIndex) && pieceIndex >= 0 && pieceIndex < works.length) {
      lightbox.open(pieceIndex, works);
    }
  }
}

function initHomeYearIndex() {
  const container = document.querySelector("[data-year-index]");
  if (container) renderYearIndex(container);
}

document.addEventListener("DOMContentLoaded", () => {
  initHomeYearIndex();
  initYearPage();
});
