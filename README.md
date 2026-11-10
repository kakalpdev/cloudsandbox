# CloudSandbox

Simulador local do ambiente de landing pages do **Salesforce Marketing Cloud CloudPages**. Você cola o HTML da LP, vê um preview estimado de como ela fica depois do deploy e, na mesma tela, um log do que sobrevive, do que some e do que merece atenção.

Não é a ferramenta oficial da Salesforce. O comportamento foi observado em deploys reais: o CloudPages descarta a casca do documento e quase tudo que está no `<head>`, mantém apenas o conteúdo abaixo do `<body>` e publica a página dentro da própria estrutura.

## O que ele faz

1. Lê o HTML completo da LP (`<!DOCTYPE>` até `</html>`).
2. Interpreta o documento e separa `<head>` de `<body>`.
3. Monta o preview só com o conteúdo interno do `<body>`, envolvido na estrutura que o CloudPages aplica no deploy.
4. Lista achados por criticidade: o que está ok, o que foi descartado e o que vai quebrar o visual ou o comportamento.

O preview abre em um iframe com `sandbox` (`allow-scripts` e `allow-forms`), nas larguras **1440 px** (desktop) e **390 px** (mobile).

## Como usar

Abra `index.html` no navegador. Não há build, servidor nem dependências.

1. Cole o HTML da LP no painel **Código da LP**, ou use **Carregar exemplo**.
2. Clique em **Analisar**.
3. Veja o resultado em **Preview simulado**.
4. Abra **Log de validação** para o detalhe de cada achado.

A página já abre com o exemplo analisado, para não começar vazia. O painel de código pode ser ocultado para o preview ocupar a tela inteira. O contador ao lado de **Analisar** mostra caracteres e linhas.

O badge na aba de log soma itens **Crítico** e **Atenção**. Itens **OK** e **Info** aparecem no log, mas não entram nessa contagem.

## O que o preview simula

O HTML final estimado tem esta forma:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- metas e CSS base que o CloudPages injeta -->
  </head>
  <body>
    <div class="layout layout-canvas-g">
      <div class="section">
        <div class="columns col1">
          <!-- apenas o conteúdo interno do <body> original -->
        </div>
      </div>
    </div>
  </body>
</html>
```

No `<head>` simulado entram, como em um deploy observado:

- `<meta name="ROBOTS" content="INDEX,FOLLOW">`
- viewport própria: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0`
- `Content-Type` UTF-8
- o bloco `.main_style` com regras de `.layout-canvas-g`, colunas, `body` em Arial 12px e o media query de mobile (`.mobile-hidden`, `.responsive-td`)

Fora do preview ficam `<!DOCTYPE>`, `<html>`, `<head>` e `<body>` originais. O título da página também some: no CloudPages ele é definido nas configurações da página, não na tag `<title>`.

## O que o log verifica

| Nível       | Significado                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| **Crítico** | Algo que o deploy descarta e que quebra fonte, cor ou layout dependente de CSS customizado. |
| **Atenção** | Recurso que será ignorado, HTML malformado ou marcação que pode se comportar mal.           |
| **OK**      | Trecho já no lugar certo, ou ausência de risco relevante no `<head>`.                       |
| **Info**    | Substituição esperada da plataforma, sem ação obrigatória.                                  |

### Crítico

- `@font-face` dentro de um `<style>` no `<head>`. O bloco inteiro é descartado e a fonte customizada não carrega. O bloco precisa ir para o `<body>`.
- Variáveis CSS (`--nome`) definidas só no `<head>`. Elas não existem na página publicada.
- `var(--nome)` usada em estilos do `<body>`, mas definida apenas no `<head>`. Depois do deploy a variável fica indefinida e o estilo que depende dela quebra.

### Atenção

- Qualquer `<style>` no `<head>` que não seja fonte nem variável: as regras são ignoradas.
- `<link rel="stylesheet">` no `<head>`.
- `<script src="...">` e `<script>` inline no `<head>`.
- CSS existente só no `<head>`, sem nenhum `<style>` no `<body>`: a LP publicada fica sem esses estilos.
- IDs repetidos no documento (formulários, âncoras e `getElementById`).
- HTML que o parser marca como malformado.

### OK

- Um ou mais `<style>` já dentro do `<body>`: esse é o lugar que o CloudPages preserva.
- Nenhum estilo, script ou CSS externo exclusivo do `<head>`.

### Info

- A meta viewport do autor é trocada pela viewport injetada pela plataforma.
- O `<title>` é descartado.
- A casca original do documento não aparece no HTML final; só o miolo do `<body>` permanece.
- Campo de código vazio.

## Exemplo incluído

O exemplo é uma LP de inscrição (“Oficina de Vinhos”) feita para disparar os casos mais comuns de uma vez:

- `@font-face` e variáveis (`--vinho`, `--creme`, `--dourado`) no `<head>`
- CSS externo e script inline no `<head>`
- um `<style>` válido dentro do `<body>` que ainda usa variáveis definidas só no `<head>`
- o mesmo `id="titulo"` em dois elementos

**Carregar exemplo** preenche o editor e roda a análise na hora.

## Limites desta simulação

- Aproxima o HTML publicado. Não executa AMPscript, SSJS nem personalization strings do Marketing Cloud.
- Não replica cada variação de wrapper, bloco ou código que o editor visual do CloudPages possa inserir além da estrutura observada (`layout-canvas-g` / `section` / `columns col1`).
- Estilos e scripts que já estão no `<body>` são mantidos como estão. A ferramenta não reescreve CSS nem remove atributos.
- O iframe sandboxed não é a página publicada: cookies, domínio, formulários reais e recursos que dependem do CloudPages não existem aqui.

## Acesse o projeto em deploy diretamente no link abaixo:
https://kakalpdev.github.io/cloudsandbox/

| Arquivo                          | Função                                                   |
| -------------------------------- | -------------------------------------------------------- |
| `index.html`                     | Interface: editor, abas, preview e log.                  |
| `script/simulador-cloudpages.js` | Análise, regras de descarte e montagem do HTML simulado. |
