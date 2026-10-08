# Altior Barbearia

Landing page Angular com GSAP/ScrollTrigger e Lenis.

## Executar

```sh
npm install
npm start
```

Abra http://127.0.0.1:4200. Para compilar: `npm run build`.

## Publicação

Repositório: https://github.com/RicardoOliveira1397/AltiorBarbearia

Site: https://ricardooliveira1397.github.io/AltiorBarbearia/

O workflow `.github/workflows/deploy-pages.yml` compila e publica automaticamente cada push na branch `main`. A configuração do GitHub Pages usa GitHub Actions. O caminho base é obtido da configuração do Pages, para os arquivos carregarem corretamente no subdiretório do repositório.

## Direção visual

Tipografia editorial, carvão, creme e verde sálvia. Entrada do título, parallax fotográfico, revelações no scroll, faixa contínua e galeria horizontal fixada no desktop. No celular, a galeria permite deslizar. O sistema respeita a preferência por movimento reduzido.

Referência analisada: https://www.era-residence.com/. Seu HTML carrega Webflow, GSAP, ScrollTrigger, SplitText, CustomEase, Lenis, Barba e Lottie. Esta implementação usa Angular, GSAP/ScrollTrigger e Lenis; os outros recursos não são necessários para as interações implementadas.

## Antes de publicar

- Substituir as fotos de referência do Unsplash por fotos autorizadas da Altior.
- Confirmar identidade visual, textos, serviços, preços, endereço e horários com a equipe. O Instagram não pôde ser lido automaticamente.
- O formulário prepara uma mensagem para copiar e enviar pelo Instagram. Não salva reservas nem consulta disponibilidade real. Para agenda integrada, conectar um provedor ou backend com validação de horários.
- As fontes usam Google Fonts e as imagens são externas; para produção, considerar hospedar esses arquivos localmente.

O nível visual pretendido é inspirado em sites editoriais premiados; premiação ou certificação Awwwards não é garantida.
