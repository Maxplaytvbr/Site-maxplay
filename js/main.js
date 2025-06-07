// Configurações globais
const tmdbApiKey = "54b9cff0f48a3f127fa5cd5906bbe251";
const epgXmlUrl = "https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/vivoplay.xml";
const sportEventsUrls = [
    "https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/claro.xml",
    "https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/epg.xml"
];

// Canais esportivos permitidos
const canaisEsportivos = [
    "SporTV", "SporTV 2", "SporTV 3", "ESPN", "ESPN 2", "ESPN 3", "ESPN 4",
    "Fox Sports", "Fox Sports 2", "Band Sports", "Premiere", "Combate", "OFF", "Woohoo"
];

// Mapeamento de logos de canais
const channelLogos = {
    'Warner': 'https://i.postimg.cc/SxBRcBBk/IMG-6821.png',
    'Sony': 'https://i.postimg.cc/bwDdDyFm/IMG-6878.jpg',
    'TNT': 'https://i.postimg.cc/kXhBg6wV/IMG-6879.png',
    // ... (cole todos os outros mapeamentos de logos originais)
};

// Classificação indicativa
const ratingImages = {
    'L': 'https://i.postimg.cc/7PnzwZp7/IMG-6891.png',
    '10': 'https://i.postimg.cc/FzpkZTjG/IMG-6892.png',
    // ... (cole todas as outras classificações originais)
};

// Dias da semana abreviados
const weekdaysShort = {
    0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
};

// Categorias de canais
const channelCategories = {
    'movies': ['HBO', 'HBO2', 'HBO Plus', 'HBO Family', 'HBO Signature', 'HBO Mundi', 'HBO Pop', 'HBO Xtreme', 
              'Telecine Premium', 'Telecine Action', 'Telecine Touch', 'Telecine Fun', 'Telecine Pipoca', 'Telecine Cult',
              'Megapix', 'Universal TV', 'Studio Universal', 'Warner', 'AXN', 'Sony', 'FX', 'Paramount Network',
              'Cinemax', 'Prime Box Brazil', 'TNT', 'TNT Series', 'TNT Novelas', 'Space', 'AMC', 'Film&Arts', 'Syfy', 'Comedy Central',
              'TBS', 'A&E', 'Star Channel', 'Lifetime', 'Canal Brasil', 'TCM', 'Cine Brasil TV', 'CineBrasilTV', 'Sony Movies', 'Fox'],
    // ... (cole todas as outras categorias originais)
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Elementos da interface
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const channelsContainer = document.getElementById('channels-container');
    const channelSearch = document.getElementById('channel-search');
    const reloadButton = document.getElementById('reload-epg');
    const modal = document.getElementById('schedule-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalChannelName = document.getElementById('modal-channel-name');
    const modalChannelLogo = document.getElementById('modal-channel-logo');
    const modalScheduleList = document.getElementById('modal-schedule-list');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const lastUpdateDisplay = document.getElementById('last-update');
    const verProximoDiaBtn = document.getElementById('ver-proximo-dia');
    const verHojeBtn = document.getElementById('ver-hoje');
    const verDiaAnteriorBtn = document.getElementById('ver-dia-anterior');
    const backToTopButton = document.getElementById('back-to-top');
    const trailerModal = document.getElementById('trailer-modal');
    const trailerClose = document.querySelector('.trailer-close');
    const trailerContainer = document.getElementById('trailer-container');
    const trailerNotFound = document.getElementById('trailer-not-found');
    
    // Containers de canais por categoria
    const moviesChannels = document.getElementById('movies-channels');
    const documentaryChannels = document.getElementById('documentary-channels');
    const kidsChannels = document.getElementById('kids-channels');
    const sportsChannels = document.getElementById('sports-channels');
    const otherChannels = document.getElementById('other-channels');
    
    // Filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterEsporteButtons = document.querySelectorAll('.filter-esporte');
    
    // Variáveis de estado
    let allProgrammesByChannel = {};
    let autoUpdateTimer = null;
    const AUTO_UPDATE_INTERVAL = 60000; // 1 minuto
    let currentSportFilter = 'Futebol';
    let currentDayOffset = 0;
    let favoriteChannels = JSON.parse(localStorage.getItem('favoriteChannels')) || {};
    const trailerCache = JSON.parse(localStorage.getItem('trailerCache')) || {};
    
    // Inicialização
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Configurar botão voltar ao topo
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('hidden');
        } else {
            backToTopButton.classList.add('hidden');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Configurar modal de trailer
    trailerClose.addEventListener('click', () => {
        trailerModal.style.display = 'none';
        // Remove o iframe quando o modal é fechado
        const iframe = trailerContainer.querySelector('iframe');
        if (iframe) {
            iframe.remove();
        }
        trailerNotFound.classList.add('hidden');
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            trailerModal.style.display = 'none';
            // Remove o iframe quando o modal é fechado
            const iframe = trailerContainer.querySelector('iframe');
            if (iframe) {
                iframe.remove();
            }
            trailerNotFound.classList.add('hidden');
        }
    });
    
    fetchEPGData();
    carregarFilmes();
    carregarEventosEsportivos();
    
    // Event Listeners
    channelSearch.addEventListener('input', handleSearch);
    reloadButton.addEventListener('click', handleReload);
    modalClose.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.dataset.time) {
                handleTimeFilterClick.call(this);
            } else {
                handleFilterClick.call(this);
            }
        });
    });
    
    filterEsporteButtons.forEach(button => {
        button.addEventListener('click', handleSportFilterClick);
    });
    
    verProximoDiaBtn.addEventListener('click', () => {
        currentDayOffset++;
        updateDayNavigationButtons();
        carregarEventosEsportivos();
    });
    
    verHojeBtn.addEventListener('click', () => {
        currentDayOffset = 0;
        updateDayNavigationButtons();
        carregarEventosEsportivos();
    });
    
    verDiaAnteriorBtn.addEventListener('click', () => {
        currentDayOffset--;
        updateDayNavigationButtons();
        carregarEventosEsportivos();
    });
    
    // Funções principais
    function updateCurrentTime() {
        const now = new Date();
        currentTimeDisplay.textContent = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // ... (continue com todas as outras funções do seu arquivo original)
    
    // Última função do arquivo original
    async function carregarEventosEsportivos() {
        try {
            // ... (cole todo o conteúdo da função original)
        } catch (error) {
            console.error("Erro ao carregar eventos esportivos:", error);
            container.innerHTML = `<p class="text-red-400 text-center py-4">Erro ao carregar eventos</p>`;
        }
    }
});
