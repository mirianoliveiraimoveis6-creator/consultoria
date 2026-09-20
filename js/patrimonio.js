const API_URL =
    'https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec?tipo=consorcios';

let todosOsConsorcios = [];

const filtroTipo =
    document.getElementById('filtroTipo');

const filtroCategoria =
    document.getElementById('filtroCategoria');

const buscarConsorcios =
    document.getElementById('buscarConsorcios');

const limparBusca =
    document.getElementById('limparBusca');

const consorcioGrid =
    document.getElementById('consorcioGrid');

const semResultados =
    document.getElementById('semResultados');

const tituloResultados =
    document.getElementById('tituloResultados');


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarMoeda(valor) {

    if (
        valor === '' ||
        valor === null ||
        valor === undefined
    ) {
        return '';
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return '';
    }

    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}


function formatarPrazo(valor) {

    if (
        valor === '' ||
        valor === null ||
        valor === undefined
    ) {
        return '';
    }

    return `${valor} meses`;
}


/* =========================================================
   FILTROS
========================================================= */

function preencherOpcoes(
    select,
    valores,
    textoPadrao
) {

    const valoresUnicos = [
        ...new Set(
            valores
                .map(valor =>
                    String(valor || '').trim()
                )
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
    );

    select.innerHTML =
        `<option value="">${textoPadrao}</option>`;

    valoresUnicos.forEach(valor => {

        const option =
            document.createElement('option');

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);
    });
}


function atualizarOpcoesBusca() {

    const consorciosAtivos =
        todosOsConsorcios.filter(consorcio => {

            const status =
                String(consorcio.Status || '')
                    .trim()
                    .toLowerCase();

            return status === 'ativo';
        });

    preencherOpcoes(
        filtroTipo,
        consorciosAtivos.map(
            consorcio => consorcio.Tipo
        ),
        'Todos'
    );

    preencherOpcoes(
        filtroCategoria,
        consorciosAtivos.map(
            consorcio => consorcio.Categoria
        ),
        'Todas'
    );
}


/* =========================================================
   CARREGAMENTO
========================================================= */

async function carregarConsorcios() {

    try {

        const resposta =
            await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );
        }

        todosOsConsorcios =
            await resposta.json();

        atualizarOpcoesBusca();

        const ativos =
            todosOsConsorcios.filter(
                consorcio =>
                    String(consorcio.Status || '')
                        .trim()
                        .toLowerCase() === 'ativo'
            );

        renderizarConsorcios(ativos);

    } catch (erro) {

        console.error(
            'Erro ao carregar consórcios:',
            erro
        );

        consorcioGrid.innerHTML = `
            <div class="no-results">
                <h3>
                    Não foi possível carregar as opções.
                </h3>

                <p>
                    Tente novamente em alguns instantes
                    ou fale comigo pelo WhatsApp.
                </p>

                <a
                    href="https://wa.me/5513997359900"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="whatsapp-button"
                >
                    Falar pelo WhatsApp
                </a>
            </div>
        `;
    }
}


/* =========================================================
   FILTRO
========================================================= */

function filtrarConsorcios() {

    const tipoSelecionado =
        String(filtroTipo.value || '')
            .trim()
            .toLowerCase();

    const categoriaSelecionada =
        String(filtroCategoria.value || '')
            .trim()
            .toLowerCase();

    const resultados =
        todosOsConsorcios.filter(consorcio => {

            const status =
                String(consorcio.Status || '')
                    .trim()
                    .toLowerCase();

            const tipo =
                String(consorcio.Tipo || '')
                    .trim()
                    .toLowerCase();

            const categoria =
                String(consorcio.Categoria || '')
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


/* =========================================================
   AGRUPAMENTO
========================================================= */

function agruparPorId(consorcios) {

    const grupos = {};

    consorcios.forEach(consorcio => {

        const id =
            String(consorcio.Id || '').trim();

        if (!id) {
            return;
        }

        if (!grupos[id]) {
            grupos[id] = [];
        }

        grupos[id].push(consorcio);
    });

    return Object.values(grupos)
        .sort((grupoA, grupoB) => {

            const primeiroA = grupoA[0];
            const primeiroB = grupoB[0];

            const destaqueA =
                String(primeiroA.Destaque || '')
                    .trim()
                    .toLowerCase() === 'sim';

            const destaqueB =
                String(primeiroB.Destaque || '')
                    .trim()
                    .toLowerCase() === 'sim';

            // Destaques primeiro
            if (destaqueA !== destaqueB) {
                return destaqueA ? -1 : 1;
            }

            // Depois, ordem definida na planilha
            const ordemA =
                Number(primeiroA.OrdemDestaque) || 9999;

            const ordemB =
                Number(primeiroB.OrdemDestaque) || 9999;

            return ordemA - ordemB;
        });
}


/* =========================================================
   RENDERIZAÇÃO
========================================================= */

function renderizarConsorcios(consorcios) {

    consorcioGrid.innerHTML = '';

    if (!consorcios.length) {

        semResultados.hidden = false;

        tituloResultados.textContent =
            'Nenhuma opção encontrada';

        return;
    }

    semResultados.hidden = true;

    const grupos =
        agruparPorId(consorcios);

    tituloResultados.textContent =
        grupos.length === 1
            ? '1 oportunidade disponível'
            : `${grupos.length} oportunidades disponíveis`;


    grupos.forEach(grupo => {

        const primeiro = grupo[0];

        const tipo =
            String(
                primeiro.Tipo || 'Imóveis'
            ).trim();

        const categoria =
            String(
                primeiro.Categoria || 'Consórcio'
            ).trim();

        const categoriaClasse =
            categoria
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-');

        const prazo =
            formatarPrazo(
                primeiro.Prazo
            );

        const condicoes =
            String(
                grupo.find(item =>
                    String(
                        item['Condições'] || ''
                    ).trim()
                )?.['Condições'] || ''
            ).trim();

        const entrada =
            primeiro.Entrada !== '' &&
            primeiro.Entrada !== null &&
            primeiro.Entrada !== undefined
                ? formatarMoeda(
                    primeiro.Entrada
                )
                : '';


        /*
         * Monta as linhas de crédito e parcela
         */
        const linhas =
            grupo.map(item => {

                const credito =
                    formatarMoeda(
                        item.Credito
                    );

                const parcela =
                    formatarMoeda(
                        item.Parcela
                    );

                return `
                    <div class="consorcio-option">

                        <div class="consorcio-option-credit">
                            ${credito}
                        </div>

                        <div class="consorcio-option-installment">
                            <span>Parcela</span>
                            <strong>
                                ${parcela}
                                <small>/mês</small>
                            </strong>
                        </div>

                    </div>
                `;
            }).join('');


        /*
         * Texto do WhatsApp
         */
        const textoWhatsApp =
            `Olá, Mirian! Tenho interesse em um ${categoria.toLowerCase()} de consórcio de ${tipo.toLowerCase()}. Gostaria de saber mais sobre as opções disponíveis.`;


        /*
         * Card completo
         */
        const card =
            document.createElement('article');

        card.className =
            'consorcio-card';

        card.innerHTML = `

            <div class="consorcio-card-header">

                <div>
                    <p class="consorcio-card-category">
                        ${categoria}
                    </p>

                    <h3>
                        Consórcio de ${tipo}
                    </h3>
                </div>

                <span class="consorcio-card-tag">
                    ${grupo.length}
                    ${grupo.length === 1
                        ? 'opção'
                        : 'opções'}
                </span>

            </div>


            <div class="consorcio-table">

                <div class="consorcio-table-header">

                    <span>
                        Carta de crédito
                    </span>

                    <span>
                        Parcela
                    </span>

                </div>

                ${linhas}

            </div>


            <div class="consorcio-card-details">

                ${
                    prazo
                        ? `
                            <div>
                                <span>Prazo</span>
                                <strong>
                                    ${prazo}
                                </strong>
                            </div>
                        `
                        : ''
                }

                ${
                    entrada
                        ? `
                            <div>
                                <span>Entrada</span>
                                <strong>
                                    ${entrada}
                                </strong>
                            </div>
                        `
                        : ''
                }

            </div>


            ${
                condicoes
                    ? `
                        <p class="consorcio-card-conditions">
                            ${condicoes}
                        </p>
                    `
                    : ''
            }


            <div class="consorcio-card-footer">

                <span>
                    Converse sobre esta opção
                </span>

                <a
                    href="https://wa.me/5513997359900?text=${encodeURIComponent(
                        textoWhatsApp
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Tenho interesse
                    <span>→</span>
                </a>

            </div>

        `;

        consorcioGrid.appendChild(card);

    });
}


/* =========================================================
   EVENTOS
========================================================= */

buscarConsorcios.addEventListener(
    'click',
    filtrarConsorcios
);


limparBusca.addEventListener(
    'click',
    () => {

        filtroTipo.value = '';
        filtroCategoria.value = '';

        const ativos =
            todosOsConsorcios.filter(
                consorcio =>
                    String(consorcio.Status || '')
                        .trim()
                        .toLowerCase() === 'ativo'
            );

        renderizarConsorcios(ativos);
    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

carregarConsorcios();
