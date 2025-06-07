// Fechar Modal de Trailer
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("trailer-close") || e.target.id === "trailer-modal") {
    document.getElementById("trailer-modal").style.display = "none";
    document.getElementById("trailer-container").innerHTML = "";
  }
});

// Buscar e exibir trailer
async function buscarTrailer(titulo) {
  const modal = document.getElementById("trailer-modal");
  const container = document.getElementById("trailer-container");
  const notFound = document.getElementById("trailer-not-found");

  modal.style.display = "block";
  container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>';
  notFound.classList.add("hidden");

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURICo
