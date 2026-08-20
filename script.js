// ===========================================================
// CONTACT SHEET — gallery data, filtering, and lightbox logic
// ===========================================================

const photos = [
    { id: 1, category: "mountains", seed: "mountain-1", caption: "Ridge line, first light" },
    { id: 2, category: "ocean", seed: "ocean-1", caption: "Low tide, west coast" },
    { id: 3, category: "cities", seed: "city-1", caption: "Rooftops after rain" },
    { id: 4, category: "wildlife", seed: "wildlife-1", caption: "Fox at dusk" },
    { id: 5, category: "mountains", seed: "mountain-2", caption: "Switchback, mile nine" },
    { id: 6, category: "ocean", seed: "ocean-2", caption: "Harbor, before the storm" },
    { id: 7, category: "cities", seed: "city-2", caption: "Neon alley, midnight" },
    { id: 8, category: "wildlife", seed: "wildlife-2", caption: "Heron, still water" },
    { id: 9, category: "mountains", seed: "mountain-3", caption: "Cloud inversion" },
    { id: 10, category: "ocean", seed: "ocean-3", caption: "Break, dawn session" },
    { id: 11, category: "cities", seed: "city-3", caption: "Underpass geometry" },
    { id: 12, category: "wildlife", seed: "wildlife-3", caption: "Herd, dry season" },
    { id: 13, category: "mountains", seed: "mountain-4", caption: "Basecamp, night sky" },
    { id: 14, category: "ocean", seed: "ocean-4", caption: "Tide pools, close" },
    { id: 15, category: "cities", seed: "city-4", caption: "Market street, noon" },
    { id: 16, category: "wildlife", seed: "wildlife-4", caption: "Owl, silent flight" },
];

// build image URLs from a stable seed so each frame is consistent on reload
photos.forEach(p => {
    p.url = `https://picsum.photos/seed/${p.seed}/900/600`;
});

const gallery = document.getElementById("gallery");
const filterBtns = document.querySelectorAll(".filter-btn");

let activeFilter = "all";
let currentIndex = 0; // index within the currently visible set

// ---------- Render frames ----------

function renderGallery() {
    gallery.innerHTML = "";
    photos.forEach((photo, i) => {
        const frame = document.createElement("div");
        frame.className = "frame";
        frame.setAttribute("tabindex", "0");
        frame.setAttribute("role", "button");
        frame.setAttribute("aria-label", `Open frame ${i + 1}: ${photo.caption}`);
        frame.dataset.category = photo.category;
        frame.dataset.index = i;

        frame.innerHTML = `
      <div class="frame__window">
        <img class="frame__img" src="${photo.url}" alt="${photo.caption}" loading="lazy">
        <span class="frame__corner frame__corner--tl"></span>
        <span class="frame__corner frame__corner--tr"></span>
        <span class="frame__corner frame__corner--bl"></span>
        <span class="frame__corner frame__corner--br"></span>
      </div>
      <div class="frame__meta">
        <span class="frame__index">#${String(i + 1).padStart(2, "0")}</span>
        <span class="frame__caption">${photo.caption}</span>
      </div>
    `;

        frame.addEventListener("click", () => openLightbox(i));
        frame.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(i);
            }
        });

        gallery.appendChild(frame);
    });
}

// ---------- Filtering ----------

function applyFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll(".frame").forEach(frame => {
        const matches = filter === "all" || frame.dataset.category === filter;
        frame.classList.toggle("is-hidden", !matches);
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        applyFilter(btn.dataset.filter);
    });
});

// ---------- Visible-set helpers ----------

function getVisiblePhotoIndices() {
    return photos
        .map((p, i) => i)
        .filter(i => activeFilter === "all" || photos[i].category === activeFilter);
}

// ---------- Lightbox ----------

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function openLightbox(photoIndex) {
    currentIndex = photoIndex;
    updateLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function updateLightbox() {
    const photo = photos[currentIndex];
    const visible = getVisiblePhotoIndices();
    const posInSet = visible.indexOf(currentIndex) + 1;
    const total = visible.length;

    lightboxImg.src = photo.url;
    lightboxImg.alt = photo.caption;
    lightboxCaption.textContent = photo.caption;
    lightboxCounter.textContent = `FRAME ${String(posInSet).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
}

function step(direction) {
    const visible = getVisiblePhotoIndices();
    if (visible.length === 0) return;
    const pos = visible.indexOf(currentIndex);
    const nextPos = (pos + direction + visible.length) % visible.length;
    currentIndex = visible[nextPos];
    updateLightbox();
}

lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", () => step(-1));
nextBtn.addEventListener("click", () => step(1));

document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
});

// ---------- Init ----------

renderGallery();
applyFilter("all");