# Altior Barbearia

Aplicação Angular 21 com landing page editorial, agendamento interativo para três barbeiros e painel de gestão demonstrativo. A apresentação usa GSAP, ScrollTrigger, SplitText, CustomEase, Draggable e Lenis; agenda e gestão carregam separadamente.

## Executar

```sh
npm install
npm start
```

Requer Node.js 24. Abra http://127.0.0.1:4200. Para compilar: `npm run build`. Para validar as regras de agenda e relatórios: `npm test`.

## Explorar o mockup

- [Agendamento](https://ricardooliveira1397.github.io/AltiorBarbearia/#/agendar): escolha corte, barba, corte + barba ou corte infantil; selecione Lucas, Rafael ou André, dia e horário; informe dados fictícios e confirme a simulação.
- [Gestão](https://ricardooliveira1397.github.io/AltiorBarbearia/#/gestao): consulte cortes realizados, serviços concluídos, receita e ticket médio demonstrativos. Filtre por período, profissional e serviço; veja a distribuição dos rituais e resultados de cada barbeiro.
- A confirmação do agendamento abre a gestão já filtrada para a data escolhida. Os registros persistem após atualizar a página, no mesmo navegador e origem.
- A tabela permite buscar clientes, filtrar situação e paginar. Cancelar libera o intervalo. Concluir fica disponível após o término do horário e atualiza os indicadores.
- **Restaurar dados demonstrativos**, no fim da gestão, recria o histórico fictício. Um atendimento do dia fica pendente para demonstrar a conclusão, quando seu horário já tiver terminado.

Nomes, preços, duração e expediente são ilustrativos. O mockup atende de segunda a sábado, 09h–19h, com pausa das 12h às 13h e janela de 30 dias. Usa o fuso `America/Sao_Paulo`. Corte, barba e infantil duram 30 minutos; corte + barba, 60. Horários sobrepostos, passados, domingos, pausa e fim do expediente são bloqueados conforme a duração do ritual.

## Organização Angular

```text
src/
  main.ts                         # bootstrap e locale pt-BR
  styles.css                      # fontes, tokens e reset global
  app/
    app.ts                        # shell com RouterOutlet
    app.config.ts                 # providers de locale e roteamento
    app.routes.ts                 # rotas carregadas sob demanda
    domain/
      appointment.ts              # modelos tipados
      catalog.ts                  # catálogo e três profissionais fictícios
      scheduling.ts               # expediente, intervalos e transições de situação
      reporting.ts                # filtros e agregação dos indicadores
      demo-data.ts                # histórico ilustrativo
      appointment-store.ts        # estado em signals e persistência local
      *.spec.ts                   # testes das regras, próximos ao código
    features/
      landing/                    # apresentação, menu e animações existentes
      booking/
        booking.ts/.html/.css      # etapas e formulário reativo tipado
        barber-selector/          # escolha de profissional por input/output
        time-slots/               # seleção acessível de horário
      management/
        management.ts/.html/.css   # período, indicadores e visão da equipe
        activity-chart/           # gráfico leve por data, sem biblioteca adicional
        appointment-table/        # busca, situações, paginação e ações
    shared/
      workspace-header/           # navegação de agenda e gestão
      stat-card/                  # apresentação reutilizável de indicadores
      workspace-theme.css         # cores, tipografia e controles das telas funcionais
```

Componentes standalone com `OnPush`; `inject` para dependências; `signal` e `computed` para estado e derivações; inputs e outputs tipados nos componentes de apresentação; formulário reativo com validação; lógica de negócio fora dos templates. Os estilos ficam junto de seus componentes para impedir que o visual da apresentação afete o painel. O catálogo é compartilhado pela landing page e pela agenda.

As rotas usam `loadComponent` e hash (`#/agendar`, `#/gestao`) para abrir diretamente e atualizar no GitHub Pages sem configuração de servidor. Os links antigos das seções continuam compatíveis. GSAP e Lenis ficam no carregamento da landing page; o painel não inicializa suas animações. As assinaturas de relógio são encerradas com o componente por `toSignal`; horário e ações são reavaliados a cada 30 segundos.

Referências oficiais: [organização por funcionalidades](https://angular.dev/style-guide), [rotas sob demanda](https://angular.dev/best-practices/performance/lazy-loaded-routes), [signals](https://angular.dev/guide/signals), [formulários reativos](https://angular.dev/guide/forms/reactive-forms) e [hash routing](https://angular.dev/api/router/withHashLocation).

## Agenda e gestão no computador e celular

As telas funcionais usam superfícies claras, cartões arredondados e tipografia sem serifa. Campos usam fonte de 16 px e altura mínima de 50 px; controles principais têm áreas de toque confortáveis. Cores, foco e hierarquia de texto são compartilhados por `workspace-theme.css`, dentro das funcionalidades, preservando a direção editorial da landing page.

No celular, a gestão tem navegação inferior, filtros detalhados recolhíveis com resumo das escolhas e atendimentos apresentados em cartões com cliente, serviço, profissional, horário, valor e ações. A agenda mantém as ações de avançar e confirmar acessíveis na parte inferior. No computador, o painel oferece navegação lateral e tabela; a reserva apresenta um resumo junto das etapas. Gráficos de períodos longos permitem rolagem interna, mantendo os rótulos legíveis.

## Regras dos relatórios

- O período inclui a data inicial e a final, pelo dia do atendimento.
- **Cortes realizados** soma corte, infantil e corte + barba com situação concluída. Um combo conta como um corte e um atendimento; barba avulsa é somente um serviço.
- Receita e ticket médio usam somente registros concluídos e o preço salvo no momento do agendamento. Agendados e cancelados não entram na receita nem no total realizado.
- Os filtros de período, profissional e serviço atualizam todos os indicadores. Busca por nome e situação filtram somente a tabela.
- Períodos sem registros apresentam zeros; datas invertidas ou inválidas mostram orientação. O gráfico agrupa períodos longos em até 14 intervalos.

## Limites do mockup e integração futura

`AppointmentStore` guarda os registros em `localStorage`, com validação do formato, versão e fallback em memória quando o navegador bloqueia armazenamento. O evento `storage` atualiza outras abas da mesma origem. A disponibilidade é conferida novamente ao confirmar. Isso permite demonstrar a interação, mas **não constitui uma agenda compartilhada entre clientes ou dispositivos** nem garante concorrência de reservas como um servidor.

A gestão é pública e identificada como demonstração. Não há login, banco de dados, cobrança, envio de mensagens ou agendamento real. Use apenas dados fictícios. Para operação real, conectar o estado a uma API por serviço Angular, validar e reservar intervalos atomicamente no servidor, autenticar dono/gerente, aplicar autorização por perfil e salvar o histórico de alterações. O backend deve controlar o fuso da barbearia e o estado dos atendimentos; um guard de frontend não substitui essa autorização.

## Publicação

Repositório: https://github.com/RicardoOliveira1397/AltiorBarbearia

Site: https://ricardooliveira1397.github.io/AltiorBarbearia/

O workflow `.github/workflows/deploy-pages.yml` executa os testes, compila e publica automaticamente cada push na branch `main`. A configuração do GitHub Pages usa GitHub Actions. O caminho base é obtido da configuração do Pages, para os arquivos carregarem corretamente no subdiretório do repositório.

## Direção visual

Tipografia serifada editorial, verde profundo, creme e oliva. Abertura em tela cheia com letras mascaradas, cena inicial fixada e recorte progressivo da fotografia, manifesto revelado palavra por palavra, três cenas horizontais com parallax independente, seleção de rituais com transição de imagem e galeria infinita arrastável. Menu em tela cheia, links com rolagem de texto e botões magnéticos. No celular, a narrativa vira uma sequência vertical. O sistema respeita a preferência por movimento reduzido; a galeria tem pausa e controles de teclado. O formulário mantém o foco no modal, permite fechar com Escape e restaura o foco ao botão de origem.

Referência analisada: https://www.era-residence.com/. Seu HTML carrega Webflow, GSAP, ScrollTrigger, SplitText, CustomEase, Lenis, Barba e Lottie. O script do site também usa Swiper. Seu Lenis é configurado com `infinite: false`. Esta implementação mantém Angular como base, usa os mesmos motores de texto e scroll e usa Draggable para a galeria contínua. O Angular Router controla a navegação da aplicação. O selo e os elementos decorativos usam SVG/CSS em vez de arquivos Lottie.

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
- A agenda publicada é demonstrativa e salva simulações locais. Para reservas reais, conectar o backend descrito acima e confirmar o catálogo com a equipe.
- As fontes usam Google Fonts. As fotografias de referência estão em `public/images` e são publicadas junto do site, sem depender de requisições de imagem ao Unsplash.

Fotografias de referência: Unsplash, identificadores `photo-1503951914875-452162b0f3f1`, `photo-1621605815971-fbc98d665033`, `photo-1622287162716-f311baa1a2b8` e `photo-1599351431202-1e0f0137899a`. Essas imagens não representam instalações ou clientes da Altior.

O nível visual pretendido é inspirado em sites editoriais premiados; premiação ou certificação Awwwards não é garantida.
