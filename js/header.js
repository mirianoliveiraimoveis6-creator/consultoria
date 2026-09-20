document.addEventListener('DOMContentLoaded', async () => {

    const headerContainer = document.getElementById('site-header');

    if (!headerContainer) {
        return;
    }

    try {
        // Carrega o HTML do header
        const resposta = await fetch('header.html');

        if (!resposta.ok) {
            throw new Error(`Erro ao carregar o header: ${resposta.status}`);
        }

        const html = await resposta.text();

        headerContainer.innerHTML = html;

        // Identifica a página atual
        const paginaAtual =
            window.location.pathname.split('/').pop() || 'index.html';

        // Marca o item ativo no menu
        const linksMenu = headerContainer.querySelectorAll(
            '.navigation a, .mobile-menu a'
        );

        linksMenu.forEach(link => {

            const href = link.getAttribute('href');

            if (!href || href.startsWith('http')) {
                return;
            }

            const paginaDestino =
                href.split('/').pop().split('?')[0];

            if (paginaDestino === paginaAtual) {
                link.classList.add('active');
            }

        });

        // Menu mobile
        const menuButton =
            headerContainer.querySelector('#menuButton');

        const mobileMenu =
            headerContainer.querySelector('#mobileMenu');

        if (menuButton && mobileMenu) {

            menuButton.addEventListener('click', () => {

                const aberto =
                    mobileMenu.classList.toggle('open');

                menuButton.setAttribute(
                    'aria-expanded',
                    aberto
                );

            });

            // Fecha o menu ao clicar em um link
            const linksMobile =
                mobileMenu.querySelectorAll('a');

            linksMobile.forEach(link => {

                link.addEventListener('click', () => {

                    mobileMenu.classList.remove('open');

                    menuButton.setAttribute(
                        'aria-expanded',
                        'false'
                    );

                });

            });

        }

    } catch (erro) {

        console.error('Erro ao carregar o header:', erro);

        headerContainer.innerHTML = `
            <p style="
                padding: 20px;
                text-align: center;
            ">
                Não foi possível carregar o menu.
            </p>
        `;

    }

});
