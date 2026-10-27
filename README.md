# Vizu Oficial

Apresentação independente do ecossistema Vizu e de suas plataformas Barber Hub e Beauty Hub. Extraída em 27/10/2026 da implementação existente no Barber Hub, preservando identidade, conteúdo, responsividade e animações.

## Executar localmente

Projeto estático, sem build, backend, credenciais ou dependência dos repositórios das plataformas.

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8080/`.

## Estrutura

- `index.html`: apresentação, jornadas, plataformas e perguntas frequentes.
- `css/vizu.css`: layout, responsividade e animações.
- `js/vizu.js`: menu, jornadas, progresso e controle de movimento.
- `img/branding/vizu/`: logos, fotografias ilustrativas, fonte local, licença e procedência.
- `docs/VIZU-Manual-de-Identidade-Visual.pdf`: manual fornecido pelo proprietário.
- `tests/browser/`: testes independentes, com requisições interceptadas e sem dependência de produção.

## Validar

```sh
npm ci
npx playwright install chromium
npm run check
npm test
```

Os testes cobrem 320, 360, 390, 768 e 1440 pixels, navegação mobile, teclado, alternância de jornadas, FAQ, pausa de animações, movimento reduzido e conteúdo sem JavaScript.

Por decisão do proprietário em 27/10/2026, as animações iniciam ativas a cada acesso, inclusive com movimento reduzido configurado no dispositivo. Os controles no início e no rodapé permitem pausar e retomar durante a visita. Sem JavaScript, o CSS continua respeitando a preferência do sistema.

## Publicar

Servir a raiz como site estático. Não há comando de build nem pasta de saída separada. A criação do repositório não publica um site automaticamente. Definir o domínio antes de acrescentar URLs canônicas, sitemap ou redirecionamentos entre plataformas.

Barber Hub e Beauty Hub continuam sendo produtos independentes, acessados pelos links externos presentes no HTML e no script de jornadas. A cópia antiga da apresentação no Barber Hub permanece temporariamente disponível para preservar URLs existentes; migrar os links e configurar o redirecionamento quando o novo endereço estiver publicado.

Este repositório passa a ser a fonte de manutenção da apresentação Vizu. Não inclui sistemas de autenticação, dados ou painéis das plataformas.
