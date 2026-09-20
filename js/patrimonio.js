const API_URL = 'https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec?tipo=consorcios';

let todosOsConsorcios = [];


// =========================================================
// ELEMENTOS
// =========================================================

const filtroTipo = document.getElementById('filtroTipo');
const filtroCategoria = document.getElementById('filtroCategoria');
const buscarConsorcios = document.getElementById('buscarConsorcios');
const limparBusca = document.getElementById('limparBusca');
const consorcioGrid = document.getElementById('consorcioGrid');
const semResultados = document.getElementById('semResultados');
const tituloResultados = document.getElementById('tituloResultados');

const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');


// =========================================================
// MENU MOBILE
// =========================================================

if (menuButton && mobileMenu) {

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

}


// =========================================================
// FORMATAÇÃO
// =========================================================

function formatarMoeda(valor) {

    if (valor === '' || valor === null || valor === undefined) {
        return '';
    }

    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

}


function formatarPrazo(valor) {

    if (!valor) {
        return '';
    }

    return `${valor} meses`;

}


// =========================================================
// PREENCHER FILTROS
// =========================================================

function preencherOpcoes(select, valores, textoPadrao) {

    const valoresUnicos = [...new Set(
        valores
            .map(valor => String(valor || '').trim())
            .filter(Boolean)
    )].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
    );

    select.innerHTML = `<option value="">${textoPadrao}</option>`;

    valoresUnicos.forEach(valor => {

        const option = document.createElement('option');

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);

    });

}


function atualizarOpcoesBusca() {

    const consorciosAtivos = todosOsConsorcios.filter(consorcio => {

        const status = String(consorcio.Status || '')
            .trim()
            .toLowerCase();

        return status === 'ativo';

    });

    preencherOpcoes(
        filtroTipo,
        consorciosAtivos.map(consorcio => consorcio.Tipo),
        'Todos'
    );

    preencherOpcoes(
        filtroCategoria,
        consorciosAtivos.map(consorcio => consorcio.Categoria),
        'Todas'
    );

}


// =========================================================
// CARREGAR CONSÓRCIOS
// =========================================================

async function carregarConsorcios() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        todosOsConsorcios = await resposta.json();

        atualizarOpcoesBusca();

        renderizarConsorcios(todosOsConsorcios);

    } catch (erro) {

        console.error('Erro ao carregar consórcios:', erro);

        consorcioGrid.innerHTML = `
            <div class="no-results">
                <h3>Não foi possível carregar as opções.</h3>
                <p>
                    Tente novamente em alguns instantes ou fale comigo
                    pelo WhatsApp.
                </p>

                <a
                    href="https://wa.me/5513997359900"
                    target="_blank"
                    class="whatsapp-button"
                >
                    Falar pelo WhatsApp
                </a>
            </div>
        `;

    }

}


// =========================================================
// FILTRAR
// =========================================================

function filtrarConsorcios() {

    const tipoSelecionado = String(filtroTipo.value || '')
        .trim()
        .toLowerCase();

    const categoriaSelecionada = String(filtroCategoria.value || '')
        .trim()
        .toLowerCase();

    const resultados = todosOsConsorcios.filter(consorcio => {

        const status = String(consorcio.Status || '')
            .trim()
            .toLowerCase();

        const tipo = String(consorcio.Tipo || '')
            .trim()
            .toLowerCase();

        const categoria = String(consorcio.Categoria || '')
            .trim()
            .toLowerCase();

        if (status !== 'ativo') {
            return false;
        }

        if (
            tipoSelecionado &&
            tipo !== tipoSelecionado
        ) {
            return false;
        }

        if (
            categoriaSelecionada &&
            categoria !== categoriaSelecionada
        ) {
            return false;
        }

        return true;

    });

    renderizarConsorcios(resultados);

}


// =========================================================
// RENDERIZAR CARDS
// =========================================================

function renderizarConsorcios(consorcios) {

    consorcioGrid.innerHTML = '';

    if (!consorcios.length) {

        semResultados.hidden = false;

        tituloResultados.textContent =
            'Nenhuma opção encontrada';

        return;

    }

    semResultados.hidden = true;

    tituloResultados.textContent =
        consorcios.length === 1
            ? '1 opção disponível'
            : `${consorcios.length} opções disponíveis`;


    consorcios.forEach(consorcio => {

        const card = document.createElement('article');

        card.className = 'consorcio-card';

        const tipo = String(
            consorcio.Tipo || 'Consórcio'
        ).trim();

        const categoria = String(
            consorcio.Categoria || ''
        ).trim();

        const credito = formatarMoeda(
            consorcio.Credito
        );

        const parcela = formatarMoeda(
            consorcio.Parcela
        );

        const prazo = formatarPrazo(
            consorcio.Prazo
        );

        const entrada = consorcio.Entrada !== '' &&
                        consorcio.Entrada !== null &&
                        consorcio.Entrada !== undefined
            ? formatarMoeda(consorcio.Entrada)
            : '';

        const condicoes = String(
            consorcio['Condições'] || ''
        ).trim();


        card.innerHTML = `

            <div class="consorcio-card-top">

                <p class="consorcio-card-type">
                    Consórcio de ${tipo}
                </p>

                <span class="consorcio-card-category">
                    ${categoria}
                </span>

            </div>


            <div class="consorcio-card-main">

                <p class="consorcio-card-credit-label">
                    Carta de crédito
                </p>

                <h3 class="consorcio-card-credit">
                    ${credito}
                </h3>

            </div>


            <div class="consorcio-card-info">

                <div class="consorcio-card-info-item">

                    <span>
                        Parcela
                    </span>

                    <strong>
                        ${parcela}/mês
                    </strong>

                </div>


                ${
                    entrada
                    ? `
                        <div class="consorcio-card-info-item">

                            <span>
                                Entrada
                            </span>

                            <strong>
                                ${entrada}
                            </strong>

                        </div>
                    `
                    : `
                        <div class="consorcio-card-info-item">

                            <span>
                                Prazo
                            </span>

                            <strong>
                                ${prazo}
                            </strong>

                        </div>
                    `
                }

            </div>


            <div class="consorcio-card-conditions">

                <p>
                    ${condicoes}
                </p>

            </div>


            <div class="consorcio-card-action">

                <a
                    href="https://wa.me/5513997359900?text=${encodeURIComponent(
                        `Olá, Mirian! Tenho interesse no ${categoria.toLowerCase()} de consórcio de ${tipo.toLowerCase()}, com carta de crédito de ${credito}. Gostaria de saber mais sobre as condições.`
                    )}"
                    target="_blank"
                >
                    Tenho interesse
                </a>

                <span>
                    →
                </span>

            </div>

        `;

        consorcioGrid.appendChild(card);

    });

}


// =========================================================
// BOTÕES
// =========================================================

buscarConsorcios.addEventListener(
    'click',
    filtrarConsorcios
);


limparBusca.addEventListener(
    'click',
    () => {

        filtroTipo.value = '';
        filtroCategoria.value = '';

        renderizarConsorcios(todosOsConsorcios);

    }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

carregarConsorcios();
