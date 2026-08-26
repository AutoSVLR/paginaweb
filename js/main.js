// ===== MENÚ HAMBURGUESA =====
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Cierra el menú al hacer clic en un link (útil en mobile)
  const navLinks = mainNav.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== AÑO AUTOMÁTICO EN EL FOOTER =====
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ===== VEHÍCULOS DESTACADOS (Inicio) =====
// ===== DISPONIBILIDAD: color y texto del cartel según el valor del JSON =====
function obtenerBadgeInfo(disponibilidad) {
  const opciones = {
    pedido: { clase: "badge-pedido", texto: "A Pedido" },
    consignacion: { clase: "badge-consignacion", texto: "Consignación" },
    stock: { clase: "badge-stock", texto: "En Stock" },
  };
  return opciones[disponibilidad] || opciones.stock;
}
function crearCardVehiculo(v) {
  const badge = obtenerBadgeInfo(v.disponibilidad);

  const condicionTexto = v.condicion === "0KM" ? "0 KM" : v.condicion;
  const meta =
    v.categoria === "auto"
      ? `${v.anio} – ${v.puertas}P`
      : `${condicionTexto} – ${v.anio}`;

  return `
    <article class="vehiculo-card">
      <img src="${v.imagen}" alt="${v.marca} ${v.modelo}" class="vehiculo-img" loading="lazy" />
      <div class="vehiculo-body">
        <h3 class="vehiculo-title">${v.marca} – ${v.modelo}</h3>
        <div class="vehiculo-meta-row">
          <span class="vehiculo-meta">${meta}</span>
          <span class="vehiculo-badge ${badge.clase}">${badge.texto}</span>
        </div>
      </div>
    </article>
  `;
}

const destacadosGrid = document.getElementById("destacados-grid");

if (destacadosGrid) {
  Promise.all([
    fetch("data/autos.json").then((res) => res.json()),
    fetch("data/motos.json").then((res) => res.json()),
  ])
    .then(([autos, motos]) => {
      const autosConCategoria = autos.map((v) => ({ ...v, categoria: "auto" }));
      const motosConCategoria = motos.map((v) => ({ ...v, categoria: "moto" }));
      const destacados = [...autosConCategoria, ...motosConCategoria].filter(
        (v) => v.destacado,
      );

      destacadosGrid.innerHTML = destacados.length
        ? destacados.map(crearCardVehiculo).join("")
        : "<p>Próximamente nuevos ingresos.</p>";
    })
    .catch(() => {
      destacadosGrid.innerHTML =
        "<p>No se pudieron cargar los destacados. Verificá que estés viendo la página con Live Server.</p>";
    });
}
// ===== CATÁLOGO DE MOTOS (motos.html) =====
const motosGrid = document.getElementById("motos-grid");

if (motosGrid) {
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroMarca = document.getElementById("filtro-marca");

  const motoModal = document.getElementById("moto-modal");
  const motoModalOverlay = document.getElementById("moto-modal-overlay");
  const modalClose = document.getElementById("moto-modal-close");
  const modalPrev = document.getElementById("moto-modal-prev");
  const modalNext = document.getElementById("moto-modal-next");
  const modalImg = document.getElementById("moto-modal-img");
  const modalBadge = document.getElementById("moto-modal-badge");
  const modalTitle = document.getElementById("moto-modal-title");
  const modalSubtitle = document.getElementById("moto-modal-subtitle");
  const modalSpecs = document.getElementById("moto-modal-specs");

  let motosData = [];
  let motoActual = null;
  let colorIndexActual = 0;

  function crearCardMoto(v) {
    const esPedido = v.disponibilidad === "pedido";
    const badgeClass = esPedido ? "badge-pedido" : "badge-stock";
    const badgeTexto = esPedido ? "A Pedido" : "En Stock";
    const condicionTexto = v.condicion === "0KM" ? "0 KM" : v.condicion;

    return `
      <article class="vehiculo-card" data-id="${v.id}">
        <img src="${v.imagen}" alt="${v.marca} ${v.modelo}" class="vehiculo-img" loading="lazy" />
        <div class="vehiculo-body">
          <h3 class="vehiculo-title">${v.marca} – ${v.modelo}</h3>
          <div class="vehiculo-meta-row">
            <span class="vehiculo-meta">${condicionTexto} – ${v.anio}</span>
            <span class="vehiculo-badge ${badgeClass}">${badgeTexto}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderMotos(lista) {
    motosGrid.innerHTML = lista.length
      ? lista.map(crearCardMoto).join("")
      : "<p>No se encontraron motos con esos filtros.</p>";
  }

  function aplicarFiltros() {
    const tipo = filtroTipo.value;
    const marca = filtroMarca.value;

    const filtradas = motosData.filter((m) => {
      const coincideTipo = tipo === "todos" || m.tipo === tipo;
      const coincideMarca = marca === "todas" || m.marca === marca;
      return coincideTipo && coincideMarca;
    });

    renderMotos(filtradas);
  }

  function renderSpecsHTML(v) {
    const specsList = [
      { icon: "icono-motor.png", value: v.motor },
      { icon: "icono-transmision.png", value: v.transmision },
      { icon: "icono-combustible.png", value: v.combustible },
      { icon: "icono-frenos.png", value: v.frenos },
    ];

    const filasSpecs = specsList
      .map(
        (s) => `
        <li>
          <img src="img/iconos/${s.icon}" alt="" class="moto-spec-icon" />
          <span>${s.value}</span>
        </li>`,
      )
      .join("");

    const swatches = v.colores
      .map(
        (c, i) => `
          <button
            type="button"
            class="moto-color-swatch${i === 0 ? " is-active" : ""}"
            style="background-color: ${c.hex};"
            data-index="${i}"
            title="${c.nombre}"
            aria-label="Ver en color ${c.nombre}"
          ></button>`,
      )
      .join("");

    const filaColores = `
        <li>
          <img src="img/iconos/icono-colores.png" alt="" class="moto-spec-icon" />
          <span class="moto-modal-colores">${swatches}</span>
        </li>`;

    return filasSpecs + filaColores;
  }

  function actualizarImagenModal() {
    if (!motoActual) return;
    const color = motoActual.colores[colorIndexActual];
    modalImg.src = color.imagen;
    modalImg.alt = `${motoActual.marca} ${motoActual.modelo} - ${color.nombre}`;

    modalSpecs.querySelectorAll(".moto-color-swatch").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === colorIndexActual);
    });
  }

  function abrirMotoModal(moto) {
    motoActual = moto;
    colorIndexActual = 0;

    const esPedido = moto.disponibilidad === "pedido";
    modalBadge.textContent = esPedido ? "A Pedido" : "En Stock";
    modalBadge.classList.remove("badge-stock", "badge-pedido");
    modalBadge.classList.add(esPedido ? "badge-pedido" : "badge-stock");

    modalTitle.textContent = `${moto.marca} – ${moto.modelo}`;
    modalSubtitle.textContent =
      moto.condicion === "0KM" ? "0 Km" : moto.condicion;
    modalSpecs.innerHTML = renderSpecsHTML(moto);

    actualizarImagenModal();

    motoModal.classList.add("is-open");
    motoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function cerrarMotoModal() {
    motoModal.classList.remove("is-open");
    motoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    motoActual = null;
  }

  fetch("data/motos.json")
    .then((res) => res.json())
    .then((data) => {
      motosData = data;
      renderMotos(motosData);
    })
    .catch(() => {
      motosGrid.innerHTML =
        "<p>No se pudieron cargar las motos. Verificá que estés viendo la página con Live Server.</p>";
    });

  filtroTipo.addEventListener("change", aplicarFiltros);
  filtroMarca.addEventListener("change", aplicarFiltros);

  motosGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".vehiculo-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const moto = motosData.find((m) => m.id === id);
    if (moto) abrirMotoModal(moto);
  });

  modalClose.addEventListener("click", cerrarMotoModal);
  motoModalOverlay.addEventListener("click", cerrarMotoModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && motoModal.classList.contains("is-open")) {
      cerrarMotoModal();
    }
  });

  modalPrev.addEventListener("click", () => {
    if (!motoActual) return;
    const total = motoActual.colores.length;
    colorIndexActual = (colorIndexActual - 1 + total) % total;
    actualizarImagenModal();
  });

  modalNext.addEventListener("click", () => {
    if (!motoActual) return;
    const total = motoActual.colores.length;
    colorIndexActual = (colorIndexActual + 1) % total;
    actualizarImagenModal();
  });

  modalSpecs.addEventListener("click", (e) => {
    const swatch = e.target.closest(".moto-color-swatch");
    if (!swatch) return;
    colorIndexActual = Number(swatch.dataset.index);
    actualizarImagenModal();
  });
}
// ===== CATÁLOGO DE AUTOS (autos.html) =====
const autosGrid = document.getElementById("autos-grid");

if (autosGrid) {
  const filtroMarcaAuto = document.getElementById("filtro-marca");
  const filtroAnio = document.getElementById("filtro-anio");

  const autoModal = document.getElementById("auto-modal");
  const autoModalOverlay = document.getElementById("auto-modal-overlay");
  const autoModalClose = document.getElementById("auto-modal-close");
  const autoModalPrev = document.getElementById("auto-modal-prev");
  const autoModalNext = document.getElementById("auto-modal-next");
  const autoModalImg = document.getElementById("auto-modal-img");
  const autoModalBadge = document.getElementById("auto-modal-badge");
  const autoModalTitle = document.getElementById("auto-modal-title");
  const autoModalSubtitle = document.getElementById("auto-modal-subtitle");
  const autoModalSpecs = document.getElementById("auto-modal-specs");

  let autosData = [];
  let autoActual = null;
  let vistaIndexActual = 0;

  function crearCardAuto(v) {
    const badge = obtenerBadgeInfo(v.disponibilidad);

    return `
      <article class="vehiculo-card" data-id="${v.id}">
        <img src="${v.imagen}" alt="${v.marca} ${v.modelo}" class="vehiculo-img" loading="lazy" />
        <div class="vehiculo-body">
          <h3 class="vehiculo-title">${v.marca} – ${v.modelo}</h3>
          <div class="vehiculo-meta-row">
            <span class="vehiculo-meta">${v.anio} – ${v.puertas}P</span>
            <span class="vehiculo-badge ${badge.clase}">${badge.texto}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderAutos(lista) {
    autosGrid.innerHTML = lista.length
      ? lista.map(crearCardAuto).join("")
      : "<p>No se encontraron autos con esos filtros.</p>";
  }

  function aplicarFiltrosAutos() {
    const marca = filtroMarcaAuto.value;
    const anio = filtroAnio.value;

    const filtrados = autosData.filter((a) => {
      const coincideMarca = marca === "todas" || a.marca === marca;
      const coincideAnio = anio === "todos" || String(a.anio) === anio;
      return coincideMarca && coincideAnio;
    });

    renderAutos(filtrados);
  }

  function renderSpecsAutoHTML(v) {
    const specsList = [
      { icon: "icono-motor.png", value: v.motor },
      { icon: "icono-potencia.png", value: v.potencia },
      { icon: "icono-transmision.png", value: v.transmision },
      { icon: "icono-combustible.png", value: v.combustible },
      { icon: "icono-puertas.png", value: `${v.puertas} P` },
    ];

    return specsList
      .map(
        (s) => `
        <li>
          <img src="img/iconos/${s.icon}" alt="" class="auto-spec-icon" />
          <span>${s.value}</span>
        </li>`,
      )
      .join("");
  }

  function actualizarImagenModalAuto() {
    if (!autoActual) return;
    const vista = autoActual.vistas[vistaIndexActual];
    autoModalImg.src = vista.imagen;
    autoModalImg.alt = `${autoActual.marca} ${autoActual.modelo} - ${vista.nombre}`;
  }

  function abrirAutoModal(auto) {
    autoActual = auto;
    vistaIndexActual = 0;

    const badge = obtenerBadgeInfo(auto.disponibilidad);
    autoModalBadge.textContent = badge.texto;
    autoModalBadge.classList.remove(
      "badge-stock",
      "badge-pedido",
      "badge-consignacion",
    );
    autoModalBadge.classList.add(badge.clase);

    autoModalTitle.textContent = `${auto.marca} – ${auto.modelo}`;
    autoModalSubtitle.textContent = `${auto.anio} – ${auto.puertas}P`;
    autoModalSpecs.innerHTML = renderSpecsAutoHTML(auto);

    actualizarImagenModalAuto();

    autoModal.classList.add("is-open");
    autoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function cerrarAutoModal() {
    autoModal.classList.remove("is-open");
    autoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    autoActual = null;
  }

  fetch("data/autos.json")
    .then((res) => res.json())
    .then((data) => {
      autosData = data;
      renderAutos(autosData);
    })
    .catch(() => {
      autosGrid.innerHTML =
        "<p>No se pudieron cargar los autos. Verificá que estés viendo la página con Live Server.</p>";
    });

  filtroMarcaAuto.addEventListener("change", aplicarFiltrosAutos);
  filtroAnio.addEventListener("change", aplicarFiltrosAutos);

  autosGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".vehiculo-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const auto = autosData.find((a) => a.id === id);
    if (auto) abrirAutoModal(auto);
  });

  autoModalClose.addEventListener("click", cerrarAutoModal);
  autoModalOverlay.addEventListener("click", cerrarAutoModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && autoModal.classList.contains("is-open")) {
      cerrarAutoModal();
    }
  });

  autoModalPrev.addEventListener("click", () => {
    if (!autoActual) return;
    const total = autoActual.vistas.length;
    vistaIndexActual = (vistaIndexActual - 1 + total) % total;
    actualizarImagenModalAuto();
  });

  autoModalNext.addEventListener("click", () => {
    if (!autoActual) return;
    const total = autoActual.vistas.length;
    vistaIndexActual = (vistaIndexActual + 1) % total;
    actualizarImagenModalAuto();
  });
}
// ===== CARRUSEL DE FOTOS (Sucursales) =====
const carruseles = document.querySelectorAll(".sucursal-carousel");

carruseles.forEach((carousel) => {
  const imgs = carousel.querySelectorAll(".sucursal-carousel-img");
  const prevBtn = carousel.querySelector(".sucursal-carousel-arrow--prev");
  const nextBtn = carousel.querySelector(".sucursal-carousel-arrow--next");

  // Si la sucursal tiene una sola foto, ocultamos las flechas
  if (imgs.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  let actual = 0;

  function mostrarImagen(indice) {
    imgs[actual].classList.remove("is-active");
    actual = (indice + imgs.length) % imgs.length;
    imgs[actual].classList.add("is-active");
  }

  prevBtn.addEventListener("click", () => mostrarImagen(actual - 1));
  nextBtn.addEventListener("click", () => mostrarImagen(actual + 1));
});
// ===== ENTREGAS (entregas.html) =====
const entregaDestacadaEl = document.getElementById("entrega-destacada");
const entregasGridEl = document.getElementById("entregas-grid");
const entregasVerMasBtn = document.getElementById("entregas-ver-mas");
const entregaModal = document.getElementById("entrega-modal");

if (entregaDestacadaEl && entregasGridEl) {
  const ENTREGAS_POR_TANDA = 10;
  let entregasData = [];
  let entregasMostradas = 0;
  let entregaModalIndex = 0;

  const entregaModalOverlay = document.getElementById("entrega-modal-overlay");
  const entregaModalClose = document.getElementById("entrega-modal-close");
  const entregaModalPrev = document.getElementById("entrega-modal-prev");
  const entregaModalNext = document.getElementById("entrega-modal-next");
  const entregaModalImg = document.getElementById("entrega-modal-img");

  function ordenarEntregas(a, b) {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return (b.orden || 1) - (a.orden || 1);
  }

  function altEntrega(e) {
    return e.marca && e.modelo
      ? `${e.marca} ${e.modelo} - Entrega Auto SV`
      : "Entrega Auto SV";
  }

  function crearCardEntrega(e, index) {
    return `
      <button type="button" class="entrega-card" data-index="${index}">
        <img src="${e.imagen}" alt="${altEntrega(e)}" loading="lazy" />
      </button>
    `;
  }

  function mostrarSiguienteTanda() {
    const inicio = entregasMostradas + 1; // +1: el índice 0 ya se muestra como "última entrega"
    const fin = inicio + ENTREGAS_POR_TANDA;
    const siguientes = entregasData.slice(inicio, fin);

    entregasGridEl.insertAdjacentHTML(
      "beforeend",
      siguientes.map((e, i) => crearCardEntrega(e, inicio + i)).join(""),
    );

    entregasMostradas += siguientes.length;

    if (entregasMostradas >= entregasData.length - 1 && entregasVerMasBtn) {
      entregasVerMasBtn.style.display = "none";
    }
  }

  function actualizarImagenEntregaModal() {
    const e = entregasData[entregaModalIndex];
    entregaModalImg.src = e.imagen;
    entregaModalImg.alt = altEntrega(e);
  }

  function abrirEntregaModal(index) {
    entregaModalIndex = index;
    actualizarImagenEntregaModal();
    entregaModal.classList.add("is-open");
    entregaModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function cerrarEntregaModal() {
    entregaModal.classList.remove("is-open");
    entregaModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  fetch("data/entregas.json")
    .then((res) => res.json())
    .then((data) => {
      entregasData = data.slice().sort(ordenarEntregas);

      if (entregasData.length === 0) {
        entregaDestacadaEl.innerHTML =
          "<p>Todavía no hay entregas cargadas.</p>";
        if (entregasVerMasBtn) entregasVerMasBtn.style.display = "none";
        return;
      }

      const ultima = entregasData[0];
      entregaDestacadaEl.innerHTML = `<img src="${ultima.imagen}" alt="${altEntrega(ultima)}" />`;

      mostrarSiguienteTanda();

      if (entregasData.length === 1 && entregasVerMasBtn) {
        entregasVerMasBtn.style.display = "none";
      }

      if (entregasVerMasBtn) {
        entregasVerMasBtn.addEventListener("click", mostrarSiguienteTanda);
      }

      // Click en la "última entrega" grande → abre modal en el índice 0
      entregaDestacadaEl.addEventListener("click", () => abrirEntregaModal(0));

      // Click en cualquier tarjeta de la grilla → abre modal en su índice
      entregasGridEl.addEventListener("click", (e) => {
        const card = e.target.closest(".entrega-card");
        if (!card) return;
        abrirEntregaModal(Number(card.dataset.index));
      });
    })
    .catch(() => {
      entregaDestacadaEl.innerHTML =
        "<p>No se pudieron cargar las entregas. Verificá que estés viendo la página con Live Server.</p>";
    });

  if (entregaModal) {
    entregaModalClose.addEventListener("click", cerrarEntregaModal);
    entregaModalOverlay.addEventListener("click", cerrarEntregaModal);

    entregaModalPrev.addEventListener("click", () => {
      entregaModalIndex =
        (entregaModalIndex - 1 + entregasData.length) % entregasData.length;
      actualizarImagenEntregaModal();
    });

    entregaModalNext.addEventListener("click", () => {
      entregaModalIndex = (entregaModalIndex + 1) % entregasData.length;
      actualizarImagenEntregaModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!entregaModal.classList.contains("is-open")) return;
      if (e.key === "Escape") cerrarEntregaModal();
      if (e.key === "ArrowLeft") entregaModalPrev.click();
      if (e.key === "ArrowRight") entregaModalNext.click();
    });
  }
}
