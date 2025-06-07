// Variáveis principais
const epgXmlUrl = "https://corsproxy.io/?https://raw.githubusercontent.com/guiamax/tvxml/main/xml_guia.xml";
const tmdbApiKey = "COLE_SUA_CHAVE_DO_TMDB_AQUI";
const youtubeApiKey = "COLE_SUA_CHAVE_DO_YOUTUBE_AQUI";

let currentSportFilter = "Futebol";
let currentDayOffset = 0;

// Exibir horário atual
setInterval(() => {
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("current-time-display").textContent = hora;
}, 1000);

// Botão voltar ao topo
const btnTopo = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  btnTopo.style.display = window.scrollY > 300 ? "block" : "none";
});
btnTopo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Botão recarregar programação
document.addEventListener("click", e => {
  if (e.target.id === "reload-epg" || e.target.closest("#reload-epg")) {
    location.reload();
  }
});
// Aqui você adicionaria a função que carrega o XML EPG, separa os canais por categoria,
// aplica filtros, favoritos, etc.
// Essa parte é muito longa para caber aqui de uma vez.
// Mas posso te mandar por partes finais só ela se desejar!

// Exemplo de chamada para carregar os filmes e eventos ao iniciar
window.addEventListener("DOMContentLoaded", () => {
  carregarFilmes();
  carregarEventosEsportivos();
});
function fetchEPGData() {
  fetch(epgXmlUrl)
    .then(response => {
      if (!response.ok) throw new Error('Não foi possível carregar o XML');
      return response.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      processEPGData(xmlDoc);

      const now = new Date();
      document.getElementById('last-update').textContent = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit'
      });
    })
    .catch(error => {
      console.error('Erro ao carregar o EPG:', error);
      document.getElementById('loading').classList.add('hidden');
      const errorElement = document.getElementById('error-message');
      errorElement.textContent = `Erro ao carregar a programação: ${error.message}`;
      errorElement.classList.remove('hidden');
    });
}

function processEPGData(xml) {
  const canais = xml.getElementsByTagName("channel");
  const programas = xml.getElementsByTagName("programme");

  const canaisPorCategoria = {
    movies: [],
    documentary: [],
    kids: [],
    sports: [],
    other: []
  };

  const categorias = {
    movies: ["Telecine", "HBO", "Megapix", "Cinemax", "Space", "Sony"],
    documentary: ["History", "Nat Geo", "Discovery"],
    kids: ["Gloob", "Disney", "Cartoon", "Nick"],
    sports: ["ESPN", "SporTV", "Premiere", "Combate"],
  };

  const canaisUnicos = {};

  for (const canal of canais) {
    const id = canal.getAttribute("id");
    const nome = canal.getElementsByTagName("display-name")[0]?.textContent || "Sem Nome";
    canaisUnicos[id] = nome;
  }

  for (const [id, nome] of Object.entries(canaisUnicos)) {
    let categoria = "other";
    for (const [cat, nomes] of Object.entries(categorias)) {
      if (nomes.some(n => nome.toLowerCase().includes(n.toLowerCase()))) {
        categoria = cat;
        break;
      }
    }
    canaisPorCategoria[categoria].push({ id, nome });
  }

  for (const [categoria, canais] of Object.entries(canaisPorCategoria)) {
    const container = document.getElementById(`${categoria}-channels`);
    container.innerHTML = "";
    for (const canal of canais) {
      const card = criarCardCanal(canal.id, canal.nome, programas);
      container.appendChild(card);
    }
  }

  document.getElementById("loading").classList.add("hidden");
  document.getElementById("channels-container").classList.remove("hidden");
}

function criarCardCanal(id, nome, programas) {
  const div = document.createElement("div");
  div.className = "channel-card";
  div.dataset.channelId = id;

  const logo = Object.entries(channelLogos).find(([ch]) => nome.includes(ch))?.[1] || "";
  const logoHTML = logo ? `<img src="${logo}" alt="${nome}" class="h-8 mb-2">` : "";

  div.innerHTML = `
    <div class="p-3">
      ${logoHTML}
      <h3 class="channel-name text-sm font-bold truncate">${nome}</h3>
      <div class="programmes-list mt-2 space-y-1"></div>
    </div>
    <div class="flex justify-between items-center px-3 pb-2">
      <button class="text-xs text-blue-400 underline ver-programacao">Programação Completa</button>
      <button class="favorite-toggle text-yellow-400" title="Favoritar">★</button>
    </div>
  `;

  const lista = div.querySelector(".programmes-list");
  const agora = new Date();
  const progCanal = Array.from(programas).filter(p => p.getAttribute("channel") === id);
  const proximos = progCanal
    .filter(p => new Date(p.getAttribute("stop").slice(0, 12)) > agora)
    .slice(0, 2);

  if (proximos.length === 0) {
    lista.innerHTML = `<p class="text-gray-400 italic text-sm">Nenhum programa disponível</p>`;
  } else {
    for (const p of proximos) {
      const item = document.createElement("div");
      const titulo = p.getElementsByTagName("title")[0]?.textContent || "Sem título";
      const hora = p.getAttribute("start")?.slice(8, 10) + ":" + p.getAttribute("start")?.slice(10, 12);
      item.className = "programme-item";
      item.innerHTML = `<span class="programme-time text-xs text-orange-400">${hora}</span> 
                        <div class="programme-title font-medium text-sm mt-1">${titulo}</div>`;
      lista.appendChild(item);
    }
  }

  // Programação completa
  div.querySelector(".ver-programacao").addEventListener("click", () => {
    abrirModalProgramacaoCompleta(nome, logo, progCanal);
  });

  // Favoritos
  const favBtn = div.querySelector(".favorite-toggle");
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || {};
  if (favoritos[id]) favBtn.classList.add("text-yellow-300");

  favBtn.addEventListener("click", () => {
    const favs = JSON.parse(localStorage.getItem("favoritos")) || {};
    if (favs[id]) {
      delete favs[id];
      favBtn.classList.remove("text-yellow-300");
    } else {
      favs[id] = true;
      favBtn.classList.add("text-yellow-300");
    }
    localStorage.setItem("favoritos", JSON.stringify(favs));
  });

  return div;
}
