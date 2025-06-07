function carregarFilmes() {
  const container = document.getElementById("filmes");
  container.innerHTML = "";
  const loading = document.createElement("div");
  loading.className = "loading-spinner mx-auto";
  container.appendChild(loading);

  const canais = [
    "Telecine Action", "Telecine Premium", "Telecine Pipoca", "Megapix",
    "HBO Family", "HBO", "HBO2", "Cinemax", "Telecine Touch", 
    "Paramount", "Telecine Fun", "Space", "TNT", "TNT Séries", "Warner", 
    "Sony", "Universal TV", "AMC", "FX", "AXN", "Star Channel", 
    "Star Premium", "Canal Brasil", "Sony Movies"
  ];

  const limiteFilmes = 30;
  let total = 0;
  const titulosUnicos = new Set();

  fetch(epgXmlUrl)
    .then(res => res.text())
    .then(xml => {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const agora = new Date();
      const programas = Array.from(doc.getElementsByTagName("programme"));

      const filmes = programas.filter(p => {
        const canal = p.getAttribute("channel");
        const inicio = parseEPGDate(p.getAttribute("start"));
        const fim = parseEPGDate(p.getAttribute("stop"));
        const titulo = p.getElementsByTagName("title")[0]?.textContent || "";
        return (
          canais.some(c => canal?.toLowerCase().includes(c.toLowerCase())) &&
          inicio > agora &&
          !titulosUnicos.has(titulo)
        );
      });

      filmes.sort((a, b) => parseEPGDate(a.getAttribute("start")) - parseEPGDate(b.getAttribute("start")));

      const promises = filmes.map(p => {
        const titulo = p.getElementsByTagName("title")[0]?.textContent;
        const inicio = parseEPGDate(p.getAttribute("start"));
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(titulo)}`)
          .then(r => r.json())
          .then(data => {
            const filme = data.results?.[0];
            if (!filme || !filme.poster_path || !filme.id) return;

            return fetch(`https://api.themoviedb.org/3/movie/${filme.id}/videos?api_key=${tmdbApiKey}`)
              .then(v => v.json())
              .then(videos => {
                const trailer = videos.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
                if (!trailer || total >= limiteFilmes) return;

                const card = document.createElement("div");
                card.className = "movie-card";
                card.innerHTML = \`
                  <img src="https://image.tmdb.org/t/p/w500\${filme.poster_path}" class="rounded mb-2">
                  <h3 class="text-sm font-semibold">\${titulo}</h3>
                  <p class="text-xs text-gray-400">\${inicio.toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'})}</p>
                \`;
                card.onclick = () => abrirTrailer(trailer.key);
                container.appendChild(card);
                titulosUnicos.add(titulo);
                total++;
              });
          });
      });

      Promise.all(promises).then(() => loading.remove());
    });
}

document.addEventListener("DOMContentLoaded", carregarFilmes);
