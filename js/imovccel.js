const API_URL = 'https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec';

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}


function obterIdImovel() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get('id');

}


function criarGaleria(imovel) {

    const fotos = imovel.Fotos || [];

    if (fotos.length === 0) {

        return [{
            Url: 'assets/images/imovel-hero.jpg',
            Legenda: imovel.Titulo
        }];

    }

    return fotos;

}


function criarDetalhes(imovel) {

    const negocio = String(imovel.Negocio)
        .trim()
        .toLowerCase();


    if (negocio === 'oportunidade comercial') {

        return `
            <div class="property-feature">
                <strong>${imovel.Area || '—'} m²</strong>
                <span>Área</span>
            </div>

            <div class="property-feature">
                <strong>${imovel.Vagas || '—'}</strong>
                <span>Vagas</span>
            </div>
        `;

    }


    return `
        <div class="property-feature">
            <strong>${imovel.Area || '—'} m²</strong>
            <span>Área</span>
        </div>

        <div class="property-feature">
            <strong>${imovel.Quartos || '—'}</strong>
            <span>Dormitórios</span>
        </div>

        <div class="property-feature">
            <strong>${imovel.Suites || '—'}</strong>
            <span>Suítes</span>
        </div>

        <div class="property-feature">
            <strong>${imovel.Vagas || '—'}</strong>
            <span>Vagas</span>
        </div>
    `;

}


function criarMensagemWhatsApp(imovel) {

    const mensagem =
        `Olá, Mirian! Tenho interesse no imóvel "${imovel.Titulo}" e gostaria de saber mais informações.`;

    return `https://wa.me/5513997359900?text=${encodeURIComponent(mensagem)}`;

}


function renderizarImovel(imovel) {

    const propertyContent =
        document.getElementById('propertyContent');


    const galeria = criarGaleria(imovel);

    const negocio = String(imovel.Negocio)
        .trim()
        .toLowerCase();


    let classeEtiqueta = 'property-detail-tag';

    if (negocio === 'locação') {
        classeEtiqueta += ' property-tag-rent';
    }

    if (negocio === 'oportunidade comercial') {
        classeEtiqueta += ' property-tag-commercial';
    }


    const localizacao = [
        imovel.Bairro,
        imovel.Cidade
    ]
        .filter(Boolean)
        .join(' · ');


    propertyContent.innerHTML = `

        <div class="property-detail-grid">

            <div class="property-detail-gallery">

                <div class="property-main-image">

                    <img
                        id="mainPropertyImage"
                        src="${galeria[0].Url}"
                        alt="${galeria[0].Legenda || imovel.Titulo}"
                    >

                    ${
                        galeria.length > 1
                        ? `
                            <button
                                type="button"
                                class="detail-gallery-button detail-gallery-prev"
                                id="galleryPrev"
                                aria-label="Foto anterior"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                class="detail-gallery-button detail-gallery-next"
                                id="galleryNext"
                                aria-label="Próxima foto"
                            >
                                ›
                            </button>
                        `
                        : ''
                    }

                </div>


                ${
                    galeria.length > 1
                    ? `
                        <div class="property-thumbnails">

                            ${galeria.map((foto, indice) => `

                                <button
                                    type="button"
                                    class="property-thumbnail ${indice === 0 ? 'active' : ''}"
                                    data-thumbnail="${indice}"
                                >

                                    <img
                                        src="${foto.Url}"
                                        alt="${foto.Legenda || imovel.Titulo}"
                                    >

                                </button>

                            `).join('')}

                        </div>
                    `
                    : ''
                }

            </div>


            <div class="property-detail-info">

                <span class="${classeEtiqueta}">
                    ${imovel.Negocio}
                </span>


                <p class="property-detail-type">
                    ${imovel.Tipo}
                </p>


                <h1>
                    ${imovel.Titulo}
                </h1>


                ${
                    localizacao
                    ? `
                        <p class="property-detail-location">
                            ${localizacao}
                        </p>
                    `
                    : ''
                }


                <p class="property-detail-price">
                    ${formatarMoeda(imovel.Valor)}
                </p>


                <div class="property-detail-features">
                    ${criarDetalhes(imovel)}
                </div>


                <a
                    href="${criarMensagemWhatsApp(imovel)}"
                    target="_blank"
                    class="property-whatsapp"
                >
                    Quero conhecer este imóvel →
                </a>

            </div>

        </div>


        ${
            imovel.Descrição
            ? `
                <section class="property-description">

                    <h2>
                        Sobre este imóvel
                    </h2>

                    <p>
                        ${imovel.Descrição}
                    </p>

                </section>
            `
            : ''
        }

    `;


    configurarGaleria(galeria, imovel);

}


function configurarGaleria(galeria, imovel) {

    if (galeria.length <= 1) {
        return;
    }


    let fotoAtual = 0;


    const imagem =
        document.getElementById('mainPropertyImage');

    const anterior =
        document.getElementById('galleryPrev');

    const proxima =
        document.getElementById('galleryNext');

    const thumbnails =
        document.querySelectorAll('[data-thumbnail]');


    function atualizarGaleria() {

        const foto = galeria[fotoAtual];

        imagem.src = foto.Url;

        imagem.alt =
            foto.Legenda || imovel.Titulo;


        thumbnails.forEach((thumbnail, indice) => {

            thumbnail.classList.toggle(
                'active',
                indice === fotoAtual
            );

        });

    }


    proxima.addEventListener('click', () => {

        fotoAtual++;

        if (fotoAtual >= galeria.length) {
            fotoAtual = 0;
        }

        atualizarGaleria();

    });


    anterior.addEventListener('click', () => {

        fotoAtual--;

        if (fotoAtual < 0) {
            fotoAtual = galeria.length - 1;
        }

        atualizarGaleria();

    });


    thumbnails.forEach((thumbnail, indice) => {

        thumbnail.addEventListener('click', () => {

            fotoAtual = indice;

            atualizarGaleria();

        });

    });

}


async function carregarImovel() {

    try {

        const idImovel = obterIdImovel();


        if (!idImovel) {

            document.getElementById('propertyContent').innerHTML = `
                <p>Imóvel não encontrado.</p>
            `;

            return;
        }


        const resposta = await fetch(API_URL);

        const imoveis = await resposta.json();


        const imovel = imoveis.find(
            item => String(item.Id) === String(idImovel)
        );


        if (!imovel) {

            document.getElementById('propertyContent').innerHTML = `
                <p>Imóvel não encontrado.</p>
            `;

            return;
        }


        console.log('Imóvel carregado:', imovel);


        renderizarImovel(imovel);


        document.title =
            `${imovel.Titulo} | Mirian Imóveis & Patrimônio`;

    } catch (erro) {

        console.error(
            'Erro ao carregar imóvel:',
            erro
        );

        document.getElementById('propertyContent').innerHTML = `
            <p>
                Não foi possível carregar este imóvel.
            </p>
        `;

    }

}

carregarImovel();

const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');

if (menuButton && mobileMenu) {

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

}
