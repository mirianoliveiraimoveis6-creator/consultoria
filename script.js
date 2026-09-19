const API_URL ='https://script.google.com/macros/s/AKfycbx9YH2UOvXpXPJjt1hpKkH4z0qHi6USErRnqZeW_oMVA64ghYgEQiwsIOUSyYvKd3a3/exec';

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

async function carregarImoveis() {
    try {
        const resposta = await fetch(API_URL);
        const imoveis = await resposta.json();
        console.log('Imóveis recebidos da planilha:' , imoveis);


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
            //REMOVER const fotoCapa = imovel.Fotos?.find(foto => String(foto.Tipo).trim().toLowerCase() === 'capa') || imovel.Fotos?.[0];
            //REMOVER const imagemImovel = fotoCapa?.Url || 'assets/images/imovel-hero.jpg';
            //const imagemImovel = 'https://drive.google.com/thumbnail?id=1zpNTNo6utv0AWpkaMtlVgUnyeuENTUfK&sz=w1200';
            const fotos = imovel.Fotos || [];
            const galeria = fotos.length > 0
                ? fotos
                : [{
                    Url: 'assets/images/imovel-hero.jpg',
                    Legenda: imovel.Titulo
                }];
            const temGaleria = galeria.length > 1;
            console.log('temGaleria', temGaleria); 
            console.log('Alterado 3');
            
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


carregarImoveis();

        const menuButton =
    document.getElementById('menuButton');


const mobileMenu =
    document.getElementById('mobileMenu');


menuButton.addEventListener('click', () => {

    mobileMenu.classList.toggle('open');

});
