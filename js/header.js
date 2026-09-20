document.addEventListener('DOMContentLoaded', async () => {

    const headerContainer =
        document.getElementById('site-header');

    if (!headerContainer) {
        return;
    }

    try {

        // =====================================================
        // CARREGA O HEADER
        // =====================================================

        const resposta =
            await fetch('header.html');

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar o header: ${resposta.status}`
            );
        }

        const html =
            await resposta.text();

        headerContainer.innerHTML = html;


        // =====================================================
        // IDENTIFICA A PÁGINA ATUAL
        // =====================================================

        const paginaAtual =
            window.location.pathname
                .split('/')
                .pop() || 'index.html';


        // =====================================================
        // MENU ATIVO
        // =====================================================

        const linksMenu =
            headerContainer.querySelectorAll(
                '.navigation a'
            );

        linksMenu.forEach(link => {

            const href =
                link.getAttribute('href');

            if (!href || href.startsWith('http')) {
                return;
            }

            const paginaDestino =
                href
                    .split('/')
                    .pop()
                    .split('?')[0];

            if (paginaDestino === paginaAtual) {
                link.classList.add('active');
            }

        });


        // =====================================================
        // MENU MOBILE
        // =====================================================

        const menuButton =
            headerContainer.querySelector(
                '#menuButton'
            );

        const mobileMenu =
            headerContainer.querySelector(
                '#mobileMenu'
            );


        if (!menuButton || !mobileMenu) {

            console.warn(
                'Menu mobile não encontrado no header.'
            );

            return;
        }


        // Abre / fecha o menu
        menuButton.addEventListener(
            'click',
            () => {

                const menuAberto =
                    mobileMenu.classList.contains('open');

                if (menuAberto) {

                    mobileMenu.classList.remove('open');

                    menuButton.setAttribute(
                        'aria-expanded',
                        'false'
                    );

                } else {

                    mobileMenu.classList.add('open');

                    menuButton.setAttribute(
                        'aria-expanded',
                        'true'
                    );

                }

            }
        );


        // Fecha o menu ao clicar em qualquer link
        const linksMobile =
            mobileMenu.querySelectorAll('a');

        linksMobile.forEach(link => {

            link.addEventListener(
                'click',
                () => {

                    mobileMenu.classList.remove(
                        'open'
                    );

                    menuButton.setAttribute(
                        'aria-expanded',
                        'false'
                    );

                }
            );

        });


    } catch (erro) {

        console.error(
            'Erro ao carregar o header:',
            erro
        );

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
