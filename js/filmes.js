async function carregarFilmes() {
  const container = document.getElementById("filmes");
  container.innerHTML = '<div class="loading-spinner mx-auto"></div>';

  const canais = [
    "Telecine Action", "Telecine Premium", "Telecine Pipoca", "Megapix",
    "HBO Family", "HBO", "HBO2", "Cinemax", "Telecine Touch", "Paramount",
    "Telecine Fun"
  ];

  try {
    const response = await fetch(epgXmlUrl);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const programas = Array.from(xml.getElementsByTagName("programme"));
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split("T")[0].replace(/-/g, "");
    const titulosUnicos = new Set();

    container.innerHTML = "";

    for (const canal of canais) {
      const programasDoCanal = programas.filter(p => {
        const channel = p.getAttribute("channel") || "";
        const start = p.getAttribute("start") || "";
        const startTime = new Date(
          parseInt(start.slice(0, 4)), parseInt(start.slice(4, 6)) - 1,
          parseInt(start.slice(6, 8)), parseInt(start.slice(8, 10)),
          parseInt(start.slice(10, 12))
        );

        return channel.toLowerCase().includes(canal.toLowerCase()) &&
               start.startsWith(hojeStr) &&
               startTime >= new Date();
      });

      for (const filme of programasDoCanal) {
        const titleRaw = filme.getElementsByTagName("title")[0]?.textContent || "Sem título";
        const titleClean = titleRaw.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

        if (titulosUnicos.has(titleClean)) continue;

        const img = await buscarImagemFilme(titleRaw);
        if (img.includes("via.placeholder.com")) continue;

        titulosUnicos.add(titleClean);

        const channel = filme.getAttribute("channel");
        const start = filme.getAttribute("start");
        const horario = start ? start.slice(8, 10) + ":" + start.slice(10, 12) : "--:--";
        const rating = filme.getElementsByTagName("rating")[0]?.textContent || "L";

        // Obter logo do canal
        let channelLogo = '';
        for (const [key, url] of Object.entries(channelLogos)) {
          if (channel.includes(key)) {
            channelLogo = `<img src="${url}" alt="${key}" class="channel-logo">`;
            break;
          }
        }

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${img}" alt="${titleRaw}" class="w-full h-60 object-cover mb-2 rounded" loading="lazy">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-sm font-bold">${titleRaw}</h3>
            <span class="text-xs text-gray-400">${horario}</span>
          </div>
          <div class="text-xs text-gray-300 mb-2">${channelLogo}</div>
          <button onclick="buscarTrailer('${titleRaw}')" class="bg-vibrant-orange text-white px-3 py-1 rounded text-sm w-full">Assistir Trailer</button>
        `;

        container.appendChild(card);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar filmes:", error);
    container.innerHTML = `<p class="text-red-400 text-center py-4">Erro ao carregar filmes</p>`;
  }
}

async function buscarImagemFilme(titulo) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(titulo)}&language=pt-BR`);
    const data = await res.json();
    const filme = data.results?.[0];
    if (filme?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
    }
  } catch (err) {
    console.error("Erro ao buscar imagem:", titulo, err);
  }
  return `https://via.placeholder.com/300x450?text=${encodeURIComponent(titulo)}`;
}
