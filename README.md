# Altior Barbearia

Landing page Angular com GSAP, ScrollTrigger, SplitText, CustomEase, Draggable e Lenis.

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

Tipografia serifada editorial, verde profundo, creme e oliva. Abertura em tela cheia com letras mascaradas, cena inicial fixada e recorte progressivo da fotografia, manifesto revelado palavra por palavra, três cenas horizontais com parallax independente, seleção de rituais com transição de imagem e galeria infinita arrastável. Menu em tela cheia, links com rolagem de texto e botões magnéticos. No celular, a narrativa vira uma sequência vertical. O sistema respeita a preferência por movimento reduzido; a galeria tem pausa e controles de teclado. O formulário mantém o foco no modal, permite fechar com Escape e restaura o foco ao botão de origem.

Referência analisada: https://www.era-residence.com/. Seu HTML carrega Webflow, GSAP, ScrollTrigger, SplitText, CustomEase, Lenis, Barba e Lottie. O script do site também usa Swiper. Seu Lenis é configurado com `infinite: false`. Esta implementação mantém Angular como base, usa os mesmos motores de texto e scroll e usa Draggable para a galeria contínua. Barba não é necessário em uma página Angular sem navegação entre documentos; o Angular controla os overlays. O selo e os elementos decorativos usam SVG/CSS em vez de arquivos Lottie.

## Desempenho das animações

- O ticker da galeria só é registrado quando ela está próxima da área visível. Pausa, hover/foco, overlays, aba oculta e saída da seção suspendem atualizações automáticas.
- As referências do DOM e os setters do GSAP são reutilizados. A galeria usa `quickSetter`; os botões magnéticos usam `quickTo` e medem sua posição ao entrar com o ponteiro.
- O recorte no scroll e as revelações de imagem usam camadas sólidas com `transform`, sem recalcular `clip-path` em uma fotografia grande a cada frame.
- O tratamento de cor é aplicado nas imagens WebP durante a preparação dos arquivos. O navegador não precisa aplicar filtros de saturação nas imagens em movimento. `srcset` seleciona imagens menores quando apropriado.
- A textura é um pequeno PNG pré-calculado, em vez de um filtro SVG em tela cheia. No celular ela é omitida. Os overlays dispensam desfoque em tempo real.
- Os nomes do JavaScript e CSS incluem hash para evitar mistura de versões em cache depois da publicação.

Ao substituir as fotos JPG de referência, execute `npm run images` para gerar as variantes WebP e a textura estática. Os quatro arquivos WebP padrão de 1280 px somam 417.440 bytes, contra 1.336.929 bytes dos JPGs originais (69% menos). Esse número compara os arquivos de imagem, não representa uma medição de FPS.

## Antes de publicar

- Substituir as fotos de referência do Unsplash por fotos autorizadas da Altior.
- Confirmar identidade visual, textos, serviços, preços, endereço e horários com a equipe. O Instagram não pôde ser lido automaticamente.
- O formulário prepara uma mensagem para copiar e enviar pelo Instagram. Não salva reservas nem consulta disponibilidade real. Para agenda integrada, conectar um provedor ou backend com validação de horários.
- As fontes usam Google Fonts. As fotografias de referência estão em `public/images` e são publicadas junto do site, sem depender de requisições de imagem ao Unsplash.

Fotografias de referência: Unsplash, identificadores `photo-1503951914875-452162b0f3f1`, `photo-1621605815971-fbc98d665033`, `photo-1622287162716-f311baa1a2b8` e `photo-1599351431202-1e0f0137899a`. Essas imagens não representam instalações ou clientes da Altior.

O nível visual pretendido é inspirado em sites editoriais premiados; premiação ou certificação Awwwards não é garantida.
