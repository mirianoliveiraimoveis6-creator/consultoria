const API_URL = 'https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec';

let todosOsImoveis = [];


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

}


/* =========================================================
   MENU MOBILE
   ========================================================= */

const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');

if (menuButton && mobileMenu) {

    menuButton.addEventListener('click', () => {

        mobileMenu.classList.toggle('open');

    });

}


/* =========================================================
   ELEMENTOS DA BUSCA
   ========================================================= */

const filtroTipo = document.getElementById('filtroTipo');
const filtroBairro = document.getElementById('filtroBairro');
const filtroQuartos = document.getElementById('filtroQuartos');
const filtroVagas = document.getElementById('filtroVagas');

const buscarImoveis = document.getElementById('buscarImoveis');
const limparBusca = document.getElementById('limparBusca');

const propertyGrid = document.getElementById('propertyGrid');
const tituloResultados = document.getElementById('tituloResultados');


/* =========================================================
   PREENCHER FILTROS
   ========================================================= */

function preencherOpcoes(select, valores, textoTodos = 'Todos') {

    if (!select) {
        return;
    }

    select.innerHTML = `<option value="">${textoTodos}</option>`;

    const valoresUnicos = [...new Set(
        valores
            .map(valor => String(valor || '').trim())
            .filter(valor => valor)
    )]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    valoresUnicos.forEach(valor => {

        const option = document.createElement('option');

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);

    });

}


function atualizarOpcoesBusca() {

    const imoveisLocacao = todosOsImoveis.filter(imovel => {

        const status = String(imovel.Status || '')
            .trim()
            .toLowerCase();

        const negocio = String(imovel.Negocio || '')
            .trim()
            .toLowerCase();

        return (
            status === 'ativo' &&
            negocio === 'locação'
        );

    });


    const tipos = imoveisLocacao.map(imovel => imovel.Tipo);

    const bairros = imoveisLocacao.map(imovel => imovel.Bairro);


    preencherOpcoes(
        filtroTipo,
        tipos,
        'Todos'
    );

    preencherOpcoes(
        filtroBairro,
        bairros,
        'Todos'
    );

}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardImovel(imovel) {

    const fotos = imovel.Fotos || [];

    const galeria = fotos.length > 0
        ? fotos
        : [
            {
                Url: '../assets/images/imovel-hero.jpg',
                Legenda: imovel.Titulo
            }
        ];

    const temGaleria = galeria.length > 1;


    let detalhesImovel = `
        ${imovel.Quartos || 0} dorm. ·
        ${imovel.Suites || 0} suíte ·
        ${imovel.Vagas || 0} vagas ·
        ${imovel.Area || 0} m²
    `;


    return `
        <article class="property-card">

            <div class="property-image">

                <img
                    src="${galeria[0].Url}"
                    alt="${galeria[0].Legenda || imovel.Titulo}"
                    data-gallery-image
                >

                <span class="property-tag">
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

                <h3>
                    ${imovel.Titulo}
                </h3>

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


/* =========================================================
   GALERIA DOS CARDS
   ========================================================= */

function ativarGalerias(imoveis) {

    const cards = propertyGrid.querySelectorAll('.property-card');


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

            imagem.alt =
                foto.Legenda ||
                imovel.Titulo;


            dots.forEach((dot, indice) => {

                dot.classList.toggle(
                    'active',
                    indice === fotoAtual
                );

            });

        }


        proxima.addEventListener('click', event => {

            event.preventDefault();
            event.stopPropagation();

            fotoAtual++;

            if (fotoAtual >= fotos.length) {
                fotoAtual = 0;
            }

            atualizarGaleria();

        });


        anterior.addEventListener('click', event => {

            event.preventDefault();
            event.stopPropagation();

            fotoAtual--;

            if (fotoAtual < 0) {
                fotoAtual = fotos.length - 1;
            }

            atualizarGaleria();

        });


        dots.forEach((dot, indice) => {

            dot.addEventListener('click', event => {

                event.preventDefault();
                event.stopPropagation();

                fotoAtual = indice;

                atualizarGaleria();

            });

        });

    });

}


/* =========================================================
   MOSTRAR IMÓVEIS
   ========================================================= */

function mostrarImoveis(imoveis) {

    propertyGrid.innerHTML = '';


    if (imoveis.length === 0) {

        tituloResultados.textContent =
            'Nenhum imóvel encontrado';


        propertyGrid.innerHTML = `
            <div class="search-no-results">

                <p>
                    Não encontramos imóveis com esses filtros.
                </p>

            </div>
        `;

        return;
    }


    tituloResultados.textContent =
        imoveis.length === 1
            ? '1 imóvel para locação'
            : `${imoveis.length} imóveis para locação`;


    imoveis.forEach(imovel => {

        propertyGrid.innerHTML +=
            criarCardImovel(imovel);

    });


    ativarGalerias(imoveis);

}


/* =========================================================
   BUSCAR IMÓVEIS
   ========================================================= */

function executarBusca() {

    const tipoSelecionado =
        filtroTipo.value;

    const bairroSelecionado =
        filtroBairro.value;

    const quartosSelecionados =
        filtroQuartos.value;

    const vagasSelecionadas =
        filtroVagas.value;


    const resultados = todosOsImoveis.filter(imovel => {

        const status = String(imovel.Status || '')
            .trim()
            .toLowerCase();

        const negocio = String(imovel.Negocio || '')
            .trim()
            .toLowerCase();


        // Somente imóveis ativos à venda

        if (status !== 'ativo') {
            return false;
        }

        if (negocio !== 'locação') {
            return false;
        }


        // Tipo

        if (
            tipoSelecionado &&
            String(imovel.Tipo || '').trim() !== tipoSelecionado
        ) {
            return false;
        }


        // Bairro

        if (
            bairroSelecionado &&
            String(imovel.Bairro || '').trim() !== bairroSelecionado
        ) {
            return false;
        }


        // Quartos

        if (quartosSelecionados) {

            const quartos =
                Number(imovel.Quartos) || 0;


            if (quartosSelecionados === '5') {

                if (quartos < 5) {
                    return false;
                }

            } else {

                if (
                    quartos <
                    Number(quartosSelecionados)
                ) {
                    return false;
                }

            }

        }


        // Vagas

        if (vagasSelecionadas) {

            const vagas =
                Number(imovel.Vagas) || 0;


            if (
                vagas <
                Number(vagasSelecionadas)
            ) {
                return false;
            }

        }


        return true;

    });


    console.log(
        'Resultados da busca:',
        resultados
    );


    mostrarImoveis(resultados);

}


/* =========================================================
   LIMPAR FILTROS
   ========================================================= */

function limparTodosOsFiltros() {

    filtroTipo.value = '';
    filtroBairro.value = '';
    filtroQuartos.value = '';
    filtroVagas.value = '';


    const imoveisLocacao =
        todosOsImoveis.filter(imovel => {

            const status =
                String(imovel.Status || '')
                    .trim()
                    .toLowerCase();

            const negocio =
                String(imovel.Negocio || '')
                    .trim()
                    .toLowerCase();

            return (
                status === 'ativo' &&
                negocio === 'locação'
            );

        });


    mostrarImoveis(imoveisLocacao);

}


/* =========================================================
   EVENTOS
   ========================================================= */

if (buscarImoveis) {

    buscarImoveis.addEventListener(
        'click',
        executarBusca
    );

}


if (limparBusca) {

    limparBusca.addEventListener(
        'click',
        limparTodosOsFiltros
    );

}


/* =========================================================
   CARREGAR API
   ========================================================= */

async function carregarImoveis() {

    try {

        const resposta =
            await fetch(API_URL);

        const imoveis =
            await resposta.json();


        todosOsImoveis = imoveis;


        console.log(
            'Imóveis recebidos:',
            todosOsImoveis
        );


        atualizarOpcoesBusca();


        // Inicialmente mostra todos os imóveis à venda

        const imoveisLocacao =
            todosOsImoveis.filter(imovel => {

                const status =
                    String(imovel.Status || '')
                        .trim()
                        .toLowerCase();

                const negocio =
                    String(imovel.Negocio || '')
                        .trim()
                        .toLowerCase();

                return (
                    status === 'ativo' &&
                    negocio === 'locação'
                );

            });


        mostrarImoveis(imoveisLocacao);


    } catch (erro) {

        console.error(
            'Erro ao carregar imóveis:',
            erro
        );


        tituloResultados.textContent =
            'Não foi possível carregar os imóveis';


        propertyGrid.innerHTML = `
            <div class="search-no-results">

                <p>
                    Ocorreu um erro ao carregar os imóveis.
                    Tente novamente em alguns instantes.
                </p>

            </div>
        `;

    }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

carregarImoveis();
