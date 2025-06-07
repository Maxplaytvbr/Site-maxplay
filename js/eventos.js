async function carregarEventosEsportivos() {
  const container = document.getElementById("jogos-container");
  container.innerHTML = '<div class="loading-spinner mx-auto"></div>';

  const canaisEsportivos = [
    "SporTV", "ESPN", "Premiere", "Combate", "Fox Sports", "Band Sports"
  ];

  const sportEventsUrls = [epgXmlUrl]; // Pode adicionar mais XMLs se quiser

  try {
    const eventosMap = new Map();
    const now = new Date();

    for (const url of sportEventsUrls) {
      const res = await fetch(url);
      const xmlText = await res.text();
      const xml = new DOMParser().parseFromString(xmlText, "text/xml");

      Array.from(xml.getElementsByTagName("programme")).forEach(prog => {
        const titulo = prog.getElementsByTagName("title")[0]?.textContent || "";
        const desc = prog.getElementsByTagName("desc")[0]?.textContent || "";
        const canal = prog.getAttribute("channel") || "";
        const isCanalEsportivo = canaisEsportivos.some(c => canal.includes(c));
        const isEventoEsportivo = /(vs|x|×|jogo|partida|campeonato|liga|luta|ufc|mma)/i.test(titulo + desc);

        if (!isCanalEsportivo || !isEventoEsportivo) return;

        const inicio = prog.getAttribute("start");
        const data = new Date(
          parseInt(inicio.slice(0, 4)),
          parseInt(inicio.slice(4, 6)) - 1,
          parseInt(inicio.slice(6, 8)),
          parseInt(inicio.slice(8, 10)),
          parseInt(inicio.slice(10, 12))
        );

        const hoje = new Date();
        hoje.setDate(hoje.getDate() + currentDayOffset);
        hoje.setHours(0, 0, 0, 0);

        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        if (data < hoje || data >= amanha) return;

        const esporte = normalizarEsporte(titulo, desc);
        if (currentSportFilter !== "Futebol" && esporte !== currentSportFilter) return;

        let [time1, time2] = extrairTimes(titulo);

        if (!time1 || !time2) return;

        const status = getStatusEvento(data, now);

        const evento = {
          titulo, data, time1, time2, esporte, canal, status
        };

        eventosMap.set(`${time1}-${time2}-${data.getTime()}`, evento);
      });
    }

    container.innerHTML = "";

    const eventos = Array.from(eventosMap.values()).sort((a, b) => a.data - b.data);

    if (eventos.length === 0) {
      container.innerHTML = `<p class="text-gray-400 text-center py-4">Nenhum evento encontrado para ${currentSportFilter}</p>`;
      return;
    }

    const eventosPorData = {};
    eventos.forEach(evento => {
      const dataKey = evento.data.toLocaleDateString('pt-BR');
      if (!eventosPorData[dataKey]) eventosPorData[dataKey] = [];
      eventosPorData[dataKey].push(evento);
    });

    for (const [dataStr, eventosDaData] of Object.entries(eventosPorData)) {
      const dataHeader = document.createElement("div");
      dataHeader.className = "text-vibrant-orange font-bold text-sm mb-2 mt-4 w-full";
      dataHeader.textContent = `📅 ${dataStr}`;
      container.appendChild(dataHeader);

      eventosDaData.forEach(evento => {
        const card = evento.esporte === "UFC"
          ? criarCardEventoMMA(evento)
          : criarCardEvento(evento);
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar eventos esportivos:", error);
    container.innerHTML = `<p class="text-red-400 text-center py-4">Erro ao carregar eventos</p>`;
  }
}
