


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

            const destaques = imoveis.filter(imovel =>String(imovel.Destaque).trim().toLowerCase() === 'sim').sort((a, b) => {
                    const ordemA = Number(a.OrdemDestaque) || 999999;
                    const ordemB = Number(b.OrdemDestaque) || 999999;
                    return ordemA - ordemB;
            });
            console.log('Imóveis em destaque:' , destaques);

            const propertyGrid = document.getElementById('propertyGrid');
            propertyGrid.innerHTML = '';

            // Cria um card para cada imóvel marcado como destaque

            destaques.forEach(imovel => {
                //Define a etiqueta de acordo com o tipo de negócio

                let classeEtiqueta = 'property-tag';

                if (String(imovel.Negocio).trim().toLowerCase() === 'locação') {
                    classeEtiqueta += ' property-tag-rent';
                }
                if (String(imovel.Negocio).trim().toLowerCase() === 'oportunidade comercial') {
                    classeEtiqueta += ' property-tag-commercial';
                }

                const card = ` 
                <article class="property-card">
                    <div class="property-image">
                        <img src="assets/images/imovel-hero.jpg" alt="${imovel.Titulo}">
                            <span class="${classeEtiqueta}">
                                ${imovel.Negocio}
                            </span>
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
                            ${imovel.Quartos}
                            dorm. ·
                            ${imovel.Suites}
                            suíte ·
                            ${imovel.Vagas}
                            vagas ·
                            ${imovel.Area}
                            m²
                        </p>
                        <div class="property-footer">
                            <strong>
                                ${formatarMoeda(imovel.Valor)}
                            </strong>
                            <a href="#">
                                Ver imóvel →
                            </a>
                        </div>
                    </div>
                </article>
                `;
                propertyGrid.innerHTML += card;
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


