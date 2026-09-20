const API_URL ='https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec';
let todosOsImoveis = [];

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function criarCardImovel(imovel) {

    const fotos = imovel.Fotos || [];
    const galeria = fotos.length > 0
        ? fotos
        : [{
            Url: 'assets/images/imovel-hero.jpg',
            Legenda: imovel.Titulo
        }];

    const temGaleria = galeria.length > 1;

    let classeEtiqueta = 'property-tag';

    if (String(imovel.Negocio).trim().toLowerCase() === 'locação') {
        classeEtiqueta += ' property-tag-rent';
    }

    if (String(imovel.Negocio).trim().toLowerCase() === 'oportunidade comercial') {
        classeEtiqueta += ' property-tag-commercial';
    }

    let detalhesImovel = '';

    if (
        String(imovel.Negocio).trim().toLowerCase() ===
        'oportunidade comercial'
    ) {

        detalhesImovel = imovel.Descrição || '';

    } else {

        detalhesImovel = `
            ${imovel.Quartos} dorm. ·
            ${imovel.Suites} suíte ·
            ${imovel.Vagas} vagas ·
            ${imovel.Area} m²
        `;
    }

    return `
        <article class="property-card">

            <div class="property-image">

                <img
                    src="${galeria[0].Url}"
                    alt="${galeria[0].Legenda || imovel.Titulo}"
                    data-gallery-image
                >

                <span class="${classeEtiqueta}">
                    ${imovel.Negocio}
                </span>

                ${
                    temGaleria
                    ? `
                        <button
                            class="property-gallery-button property-gallery-prev"
                            type="button"
                            data-gallery-prev
                            aria-label="Foto anterior"
                        >
                            ‹
                        </button>

                        <button
                            class="property-gallery-button property-gallery-next"
                            type="button"
                            data-gallery-next
                            aria-label="Próxima foto"
                        >
                            ›
                        </button>

                        <div class="property-gallery-dots">

                            ${galeria.map((foto, indice) => `
                                <span
                                    class="property-gallery-dot ${indice === 0 ? 'active' : ''}"
                                    data-gallery-dot="${indice}"
                                ></span>
                            `).join('')}

                        </div>
                    `
                    : ''
                }

            </div>

            <div class="property-info">

                <p class="property-type">
                    ${imovel.Tipo}
                    ·
                    ${imovel.Bairro}
                </p>

                <h3>${imovel.Titulo}</h3>

                <p class="property-details">
                    ${detalhesImovel}
                </p>

                <div class="property-footer">

                    <strong>
                        ${formatarMoeda(imovel.Valor)}
                    </strong>

                    <a href="imovel.html?id=${imovel.Id}">
                        Ver imóvel →
                    </a>

                </div>

            </div>

        </article>
    `;
}

function ativarGalerias(container, imoveis) {

    const cards = container.querySelectorAll('.property-card');

    cards.forEach((card, indiceCard) => {

        const imovel = imoveis[indiceCard];
        const fotos = imovel.Fotos || [];

        if (fotos.length <= 1) {
            return;
        }

        let fotoAtual = 0;

        const imagem = card.querySelector('[data-gallery-image]');
        const anterior = card.querySelector('[data-gallery-prev]');
        const proxima = card.querySelector('[data-gallery-next]');
        const dots = card.querySelectorAll('[data-gallery-dot]');

        function atualizarGaleria() {

            const foto = fotos[fotoAtual];

            imagem.src = foto.Url;
            imagem.alt = foto.Legenda || imovel.Titulo;

            dots.forEach((dot, indice) => {

                dot.classList.toggle(
                    'active',
                    indice === fotoAtual
                );

            });
        }

        proxima.addEventListener('click', (event) => {

            event.preventDefault();
            event.stopPropagation();

            fotoAtual++;

            if (fotoAtual >= fotos.length) {
                fotoAtual = 0;
            }

            atualizarGaleria();
        });

        anterior.addEventListener('click', (event) => {

            event.preventDefault();
            event.stopPropagation();

            fotoAtual--;

            if (fotoAtual < 0) {
                fotoAtual = fotos.length - 1;
            }

            atualizarGaleria();
        });

        dots.forEach((dot, indice) => {

            dot.addEventListener('click', (event) => {

                event.preventDefault();
                event.stopPropagation();

                fotoAtual = indice;

                atualizarGaleria();
            });

        });

    });
}

async function carregarImoveis() {
    try {
        const resposta = await fetch(API_URL);
        const imoveis = await resposta.json();
        todosOsImoveis = imoveis;
        console.log('Imóveis recebidos da planilha:' , imoveis);
        atualizarCamposBusca();
        atualizarOpcoesBusca();

        /*
            * Filtra somente os imóveis marcados como destaque
            * Depois organiza pela OrdemDestaque.
            * Não existe limite de quantidade.
        */

        const destaques = imoveis.filter(imovel => String(imovel.Status).trim().toLowerCase() === 'ativo' && String(imovel.Destaque).trim().toLowerCase() === 'sim').sort((a, b) => {
                const ordemA = Number(a.OrdemDestaque) || 999999;
                const ordemB = Number(b.OrdemDestaque) || 999999;
                return ordemA - ordemB;
        });
        console.log('Imóveis em destaque:' , destaques);

        const propertyGrid = document.getElementById('propertyGrid');
        propertyGrid.innerHTML = '';

        // Cria um card para cada imóvel marcado como destaque

        destaques.forEach(imovel => {
            //const imagemImovel = 'https://drive.google.com/thumbnail?id=1zpNTNo6utv0AWpkaMtlVgUnyeuENTUfK&sz=w1200';
            const fotos = imovel.Fotos || [];
            const galeria = fotos.length > 0
                ? fotos
                : [{
                    Url: '../assets/images/imovel-hero.jpg',
                    Legenda: imovel.Titulo
                }];
            const temGaleria = galeria.length > 1;
            
            //Define a etiqueta de acordo com o tipo de negócio

            let classeEtiqueta = 'property-tag';
            if (String(imovel.Negocio).trim().toLowerCase() === 'locação') {
                classeEtiqueta += ' property-tag-rent';
            }
            if (String(imovel.Negocio).trim().toLowerCase() === 'oportunidade comercial') {
                classeEtiqueta += ' property-tag-commercial';
            }

            let detalhesImovel = '';
            if (String(imovel.Negocio).trim().toLowerCase() === 'oportunidade comercial') {
                detalhesImovel = imovel.Descrição || '';
            } else {
                detalhesImovel = `
                    ${imovel.Quartos} dorm. ·
                    ${imovel.Suites} suíte ·
                    ${imovel.Vagas} vagas ·
                    ${imovel.Area} m²
                `;
            }

            const card = `
            <article class="property-card">
            
                <div class="property-image">
            
                    <img
                        src="${galeria[0].Url}"
                        alt="${galeria[0].Legenda || imovel.Titulo}"
                        data-gallery-image
                    >
            
                    <span class="${classeEtiqueta}">
                        ${imovel.Negocio}
                    </span>
            
                    ${
                        temGaleria
                        ? `
                            <button
                                class="property-gallery-button property-gallery-prev"
                                type="button"
                                data-gallery-prev
                                aria-label="Foto anterior"
                            >
                                ‹
                            </button>
            
                            <button
                                class="property-gallery-button property-gallery-next"
                                type="button"
                                data-gallery-next
                                aria-label="Próxima foto"
                            >
                                ›
                            </button>
            
                            <div class="property-gallery-dots">
                                ${galeria.map((foto, indice) => `
                                    <span
                                        class="property-gallery-dot ${indice === 0 ? 'active' : ''}"
                                        data-gallery-dot="${indice}"
                                    ></span>
                                `).join('')}
                            </div>
                        `
                        : ''
                    }
            
                </div>
            
                <div class="property-info">
            
                    <p class="property-type">
                        ${imovel.Tipo}
                        ·
                        ${imovel.Bairro}
                    </p>
            
                    <h3>${imovel.Titulo}</h3>
            
                    <p class="property-details">
                        ${detalhesImovel}
                    </p>
            
                    <div class="property-footer">
                        <strong>${formatarMoeda(imovel.Valor)}</strong>
                         <a href="imovel.html?id=${imovel.Id}">
                            Ver imóvel →
                        </a>
                    </div>
            
                </div>
            
            </article>
            `;
            propertyGrid.innerHTML += card;
            console.log('card novo');
        });

        const cards = propertyGrid.querySelectorAll('.property-card');

        cards.forEach((card, indiceCard) => {

            const imovel = destaques[indiceCard];
            const fotos = imovel.Fotos || [];

            if (fotos.length <= 1) {
                return;
            }

            let fotoAtual = 0;

            const imagem = card.querySelector('[data-gallery-image]');
            const anterior = card.querySelector('[data-gallery-prev]');
            const proxima = card.querySelector('[data-gallery-next]');
            const dots = card.querySelectorAll('[data-gallery-dot]');

            function atualizarGaleria() {

                const foto = fotos[fotoAtual];

                imagem.src = foto.Url;
                imagem.alt = foto.Legenda || imovel.Titulo;

                dots.forEach((dot, indice) => {
                    dot.classList.toggle(
                        'active',
                        indice === fotoAtual
                    );
                });
            }

            proxima.addEventListener('click', (event) => {

                event.preventDefault();
                event.stopPropagation();

                fotoAtual++;

                if (fotoAtual >= fotos.length) {
                    fotoAtual = 0;
                }

                atualizarGaleria();
            });

            anterior.addEventListener('click', (event) => {

                event.preventDefault();
                event.stopPropagation();

                fotoAtual--;

                if (fotoAtual < 0) {
                    fotoAtual = fotos.length - 1;
                }

                atualizarGaleria();
            });

            dots.forEach((dot, indice) => {

                dot.addEventListener('click', (event) => {

                    event.preventDefault();
                    event.stopPropagation();

                    fotoAtual = indice;

                    atualizarGaleria();
                });

            });

        });

            } catch (erro) {
                console.error('Erro ao carregar imóveis:', erro);
            }
        }


        //carregarImoveis();

        const menuButton = document.getElementById('menuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });

/* =========================================================
   BUSCA DE IMÓVEIS
   ========================================================= */

        const botoesNegocio = document.querySelectorAll('.search-business-option');

        const campoQuartos = document.getElementById('campoQuartos');
        const campoArea = document.getElementById('campoArea');

        let negocioSelecionado = 'Venda';

        function atualizarCamposBusca() {

            if (!campoQuartos || !campoArea) {
                return;
            }

            const comercial = negocioSelecionado === 'Oportunidade Comercial';

            campoQuartos.style.display = comercial ? 'none' : '';
            campoArea.style.display = comercial ? '' : 'none';
        }


        botoesNegocio.forEach(botao => {

            botao.addEventListener('click', () => {

                botoesNegocio.forEach(item => {
                    item.classList.remove('active');
                });

                botao.classList.add('active');

                negocioSelecionado = botao.dataset.negocio;

                atualizarCamposBusca();
                atualizarOpcoesBusca();
            });

        });

        atualizarCamposBusca();

/* =========================================================
   FILTROS DA BUSCA
   ========================================================= */

const filtroTipo = document.getElementById('filtroTipo');
const filtroBairro = document.getElementById('filtroBairro');
const filtroQuartos = document.getElementById('filtroQuartos');
const filtroArea = document.getElementById('filtroArea');
const filtroVagas = document.getElementById('filtroVagas');

const buscarImoveis = document.getElementById('buscarImoveis');
const limparBusca = document.getElementById('limparBusca');

const searchResults = document.getElementById('searchResults');
const searchResultsTitle = document.getElementById('searchResultsTitle');
const searchPropertyGrid = document.getElementById('searchPropertyGrid');


function obterImoveisDoNegocio() {

    return todosOsImoveis.filter(imovel => {

        const status = String(imovel.Status || '').trim().toLowerCase();
        const negocio = String(imovel.Negocio || '').trim().toLowerCase();

        return (status === 'ativo' && negocio === negocioSelecionado.toLowerCase());
    });
}


function preencherOpcoes(select, valores, textoTodos = 'Todos') {

    if (!select) {
        return;
    }

    select.innerHTML = `<option value="">${textoTodos}</option>`;

    const valoresUnicos = [...new Set(
        valores
            .map(valor => String(valor || '').trim())
            .filter(valor => valor)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    valoresUnicos.forEach(valor => {

        const option = document.createElement('option');

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);
    });
}


function atualizarOpcoesBusca() {
    console.log('Atualizando filtros...');
    console.log('Todos os imóveis:', todosOsImoveis);
    console.log('Filtro tipo:', filtroTipo);
    console.log('Filtro bairro:', filtroBairro);
    const imoveisDisponiveis = obterImoveisDoNegocio();

    const tipos = imoveisDisponiveis.map(imovel => imovel.Tipo);
    const bairros = imoveisDisponiveis.map(imovel => imovel.Bairro);

    preencherOpcoes(filtroTipo, tipos, 'Todos');
    preencherOpcoes(filtroBairro, bairros, 'Todos');
}

function executarBusca() {

    const tipoSelecionado = filtroTipo.value;
    const bairroSelecionado = filtroBairro.value;
    const quartosSelecionados = filtroQuartos.value;
    const areaSelecionada = filtroArea.value;
    const vagasSelecionadas = filtroVagas.value;

    const resultados = todosOsImoveis.filter(imovel => {

        const status = String(imovel.Status || '')
            .trim()
            .toLowerCase();

        const negocio = String(imovel.Negocio || '')
            .trim()
            .toLowerCase();

        if (status !== 'ativo') {
            return false;
        }

        if (negocio !== negocioSelecionado.toLowerCase()) {
            return false;
        }

        if (
            tipoSelecionado &&
            String(imovel.Tipo || '').trim() !== tipoSelecionado
        ) {
            return false;
        }

        if (
            bairroSelecionado &&
            String(imovel.Bairro || '').trim() !== bairroSelecionado
        ) {
            return false;
        }

        // Compra / locação
        if (negocioSelecionado !== 'Oportunidade Comercial') {

            if (quartosSelecionados) {

                const quartos = Number(imovel.Quartos) || 0;

                if (quartosSelecionados === '5') {

                    if (quartos < 5) {
                        return false;
                    }

                } else {

                    if (quartos < Number(quartosSelecionados)) {
                        return false;
                    }

                }
            }

        }

        // Oportunidade comercial
        if (negocioSelecionado === 'Oportunidade Comercial') {

            if (areaSelecionada) {

                const area = Number(imovel.Area) || 0;

                if (area < Number(areaSelecionada)) {
                    return false;
                }

            }

        }

        // Vagas
        if (vagasSelecionadas) {

            const vagas = Number(imovel.Vagas) || 0;

            if (vagas < Number(vagasSelecionadas)) {
                return false;
            }

        }

        return true;
    });

    console.log('Resultados da busca:', resultados);

    searchPropertyGrid.innerHTML = '';

    if (resultados.length === 0) {

        searchResultsTitle.textContent =
            'Nenhum imóvel encontrado';

        searchPropertyGrid.innerHTML = `
            <div class="search-no-results">
                <p>
                    Não encontramos imóveis com esses filtros.
                </p>

                <button
                    type="button"
                    class="search-clear"
                    id="limparBuscaResultado"
                >
                    Limpar filtros
                </button>
            </div>
        `;

        searchResults.hidden = false;

        document
            .getElementById('limparBuscaResultado')
            .addEventListener('click', limparTodosOsFiltros);

        return;
    }

    searchResultsTitle.textContent =
        resultados.length === 1
            ? 'Encontramos 1 imóvel para você'
            : `Encontramos ${resultados.length} imóveis para você`;

    resultados.forEach(imovel => {

        searchPropertyGrid.innerHTML +=
            criarCardImovel(imovel);

    });

    searchResults.hidden = false;

    ativarGalerias(
        searchPropertyGrid,
        resultados
    );
}

function limparTodosOsFiltros() {

    filtroTipo.value = '';
    filtroBairro.value = '';
    filtroQuartos.value = '';
    filtroArea.value = '';
    filtroVagas.value = '';

    searchResults.hidden = true;
    searchPropertyGrid.innerHTML = '';

    atualizarCamposBusca();
}

buscarImoveis.addEventListener('click', executarBusca);
limparBusca.addEventListener('click', limparTodosOsFiltros);
//atualizarOpcoesBusca();
carregarImoveis();
