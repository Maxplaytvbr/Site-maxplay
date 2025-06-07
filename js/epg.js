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
