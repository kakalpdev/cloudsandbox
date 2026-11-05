(function () {
  "use strict";

  // ---------- Base de <head> que o CloudPages injeta (observado em deploy real) ----------
  var CLOUDPAGES_HEAD =
    "" +
    '<meta name="ROBOTS" content="INDEX,FOLLOW">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">' +
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
    '<style class="main_style">' +
    ".layout-canvas-g{background-color:#fff;border:none;box-sizing:border-box;padding:0;width:100%;}" +
    ".layout-canvas-g>.header,.layout-canvas-g>.section,.layout-canvas-g>.footer{position:relative;overflow:hidden;width:100%;word-wrap:break-word;}" +
    ".layout-canvas-g>.section>.columns{box-sizing:border-box;word-wrap:break-word;width:100%;}" +
    "body{color:#000;font-family:Arial;font-size:12px;margin:0 auto;max-width:100%;}" +
    "@media only screen and (max-width:480px){.mobile-hidden{display:none!important;}.responsive-td{width:100%!important;display:block!important;padding:0!important;}}" +
    "</style>";

  // ---------- Exemplo de demonstração ----------
  var EXAMPLE = [
    "<!DOCTYPE html>",
    '<html lang="pt-BR">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>Oficina de Vinhos — Inscrição</title>",
    '  <link rel="stylesheet" href="https://exemplo.com/assets/reset.css">',
    "  <style>",
    "    @font-face {",
    '      font-family: "Marfim Serif";',
    '      src: url("https://exemplo.com/fonts/marfim-serif.woff2") format("woff2");',
    "    }",
    "    :root {",
    "      --vinho: #5b1a24;",
    "      --creme: #f3ead7;",
    "      --dourado: #b78a3d;",
    "    }",
    "    body { margin:0; background: var(--creme); }",
    "    .hero-oficina { background: var(--vinho); color: #fff; padding: 48px 24px; text-align:center; }",
    "  </style>",
    '  <script>console.log("tracking pixel carregado no head");</' + "script>",
    "</head>",
    "<body>",
    "",
    '  <section class="hero-oficina">',
    '    <h1 id="titulo">Oficina de Vinhos</h1>',
    "    <p>Uma tarde de degustação guiada, para até 20 pessoas.</p>",
    "  </section>",
    "",
    "  <style>",
    "    .bloco-inscricao { padding: 32px 24px; font-family: Arial, sans-serif; color: var(--dourado); }",
    "    .bloco-inscricao .btn { background: var(--vinho); color: #fff; padding: 12px 20px; border-radius: 6px; display:inline-block; text-decoration:none; }",
    "  </style>",
    '  <section class="bloco-inscricao">',
    '    <h2 id="titulo">Garanta sua vaga</h2>',
    "    <p>Vagas limitadas — turma de sábado às 16h.</p>",
    "  </section>",
    "",
    "</body>",
    "</html>",
  ].join(String.fromCharCode(10));

  // ---------- Elementos ----------
  var bootError = document.getElementById("bootError");
  var input = document.getElementById("codeInput");
  var analyzeBtn = document.getElementById("analyzeBtn");
  var loadExampleBtn = document.getElementById("loadExample");
  var uploadBtn = document.getElementById("uploadBtn");
  var fileInput = document.getElementById("fileInput");
  var charCount = document.getElementById("charCount");
  var previewFrame = document.getElementById("previewFrame");
  var logList = document.getElementById("logList");
  var logSummary = document.getElementById("logSummary");
  var logBadge = document.getElementById("logBadge");
  var tabs = document.querySelectorAll(".tab");
  var panels = {
    preview: document.getElementById("panel-preview"),
    log: document.getElementById("panel-log"),
  };
  var vbtns = document.querySelectorAll(".vbtn");
  var viewportSwitch = document.getElementById("viewportSwitch");
  var layoutRoot = document.getElementById("layoutRoot");
  var collapseInputBtn = document.getElementById("collapseInputBtn");
  var expandInputBtn = document.getElementById("expandInputBtn");
  var themeLightBtn = document.getElementById("themeLightBtn");
  var themeDarkBtn = document.getElementById("themeDarkBtn");
  var themeSwitch = document.getElementById("themeSwitch");
  var previewBlobUrl = null;

  function showBootError(message) {
    if (!bootError) return;
    bootError.hidden = false;
    bootError.textContent = message;
  }

  function bindClick(el, handler) {
    if (el) el.addEventListener("click", handler);
  }

  function setPreviewHtml(html) {
    if (!previewFrame) return;
    var docHtml = html || "";
    try {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        previewBlobUrl = null;
      }
      previewFrame.removeAttribute("src");
      previewFrame.srcdoc = docHtml;
    } catch (err) {
      try {
        previewBlobUrl = URL.createObjectURL(
          new Blob([docHtml], {type: "text/html;charset=utf-8"}),
        );
        previewFrame.src = previewBlobUrl;
      } catch (err2) {
        showBootError(
          "Não foi possível renderizar o preview neste navegador. Tente abrir no Chrome ou Edge.",
        );
      }
    }
  }

  function currentTheme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("csb-theme", theme);
    } catch (e) {}
    if (themeLightBtn) {
      themeLightBtn.setAttribute(
        "aria-pressed",
        theme === "light" ? "true" : "false",
      );
    }
    if (themeDarkBtn) {
      themeDarkBtn.setAttribute(
        "aria-pressed",
        theme === "dark" ? "true" : "false",
      );
    }
    if (themeSwitch) {
      themeSwitch.classList.toggle("is-dark", theme === "dark");
    }
  }

  applyTheme(currentTheme());
  bindClick(themeLightBtn, function () {
    applyTheme("light");
  });
  bindClick(themeDarkBtn, function () {
    applyTheme("dark");
  });

  bindClick(collapseInputBtn, function () {
    if (layoutRoot) layoutRoot.classList.add("input-collapsed");
  });
  bindClick(expandInputBtn, function () {
    if (layoutRoot) layoutRoot.classList.remove("input-collapsed");
  });

  function updateCharCount() {
    if (!input || !charCount) return;
    var n = input.value.length;
    var lines = input.value.split(String.fromCharCode(10)).length;
    charCount.textContent = n ? n + " caracteres · " + lines + " linhas" : "";
  }
  if (input) input.addEventListener("input", updateCharCount);

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) {
        x.classList.remove("active");
        x.setAttribute("aria-selected", "false");
      });
      t.classList.add("active");
      t.setAttribute("aria-selected", "true");
      var name = t.getAttribute("data-tab");
      Object.keys(panels).forEach(function (k) {
        panels[k].hidden = k !== name;
      });
    });
  });

  vbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      vbtns.forEach(function (x) {
        x.classList.remove("active");
      });
      b.classList.add("active");
      var isMobile = b.getAttribute("data-width") === "mobile";
      if (viewportSwitch) {
        viewportSwitch.classList.toggle("is-mobile", isMobile);
      }
      if (previewFrame) {
        previewFrame.classList.toggle("mobile", isMobile);
      }
    });
  });

  if (loadExampleBtn) {
    loadExampleBtn.addEventListener("click", function () {
      input.value = EXAMPLE;
      updateCharCount();
      runAnalysis();
    });
  }

  bindClick(analyzeBtn, runAnalysis);

  function isTextUpload(file) {
    var name = (file.name || "").toLowerCase();
    var type = (file.type || "").toLowerCase();
    return (
      /\.(html?|txt)$/.test(name) ||
      type === "text/html" ||
      type === "text/plain"
    );
  }

  function loadUploadedFile(file) {
    if (!file || !input) return;
    if (!isTextUpload(file)) {
      if (charCount) {
        charCount.textContent = "Envie um arquivo .html, .htm ou .txt";
      }
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      input.value = typeof reader.result === "string" ? reader.result : "";
      fileInput.value = "";
      updateCharCount();
      runAnalysis();
    };
    reader.onerror = function () {
      if (charCount) charCount.textContent = "Não foi possível ler o arquivo";
    };
    reader.readAsText(file);
  }

  bindClick(uploadBtn, function () {
    if (fileInput) fileInput.click();
  });
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      loadUploadedFile(fileInput.files && fileInput.files[0]);
    });
  }

  if (input) {
    ["dragenter", "dragover"].forEach(function (evtName) {
      input.addEventListener(evtName, function (e) {
        e.preventDefault();
        input.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evtName) {
      input.addEventListener(evtName, function (e) {
        e.preventDefault();
        input.classList.remove("is-dragover");
      });
    });
    input.addEventListener("drop", function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      loadUploadedFile(files && files[0]);
    });
  }

  // ---------- Núcleo da análise ----------
  function extractCustomProps(cssText) {
    var defined = {};
    var used = {};
    var defRe = /--([a-zA-Z0-9-]+)\s*:/g;
    var useRe = /var\(\s*--([a-zA-Z0-9-]+)/g;
    var m;
    while ((m = defRe.exec(cssText))) {
      defined[m[1]] = true;
    }
    while ((m = useRe.exec(cssText))) {
      used[m[1]] = true;
    }
    return {defined: Object.keys(defined), used: Object.keys(used)};
  }

  function countRules(cssText) {
    var m = cssText.match(/\{/g);
    return m ? m.length : 0;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function addIssue(list, level, title, detailHtml) {
    list.push({level: level, title: title, detail: detailHtml});
  }

  function analyze(raw) {
    var issues = [];
    var parser = new DOMParser();
    var doc = parser.parseFromString(raw, "text/html");

    var parserError = doc.querySelector("parsererror");
    if (parserError) {
      addIssue(
        issues,
        "warning",
        "HTML com possíveis erros de sintaxe",
        "O navegador conseguiu interpretar o código, mas encontrou trechos malformados. Revise tags não fechadas ou aninhamento incorreto.",
      );
    }

    var head = doc.head;
    var body = doc.body;

    if (!raw.trim()) {
      addIssue(
        issues,
        "info",
        "Nenhum código informado",
        "Cole o HTML da LP e clique em Analisar.",
      );
      return {
        issues: issues,
        previewHtml:
          '<p style="font-family:sans-serif;padding:24px;color:#777">Nenhum código para exibir.</p>',
        bodyOnly: "",
      };
    }

    // ---- Verificações do <head> ----
    var headStyles = head ? head.querySelectorAll("style") : [];
    var headVarsDefined = [];
    var headHasFontFace = false;

    if (headStyles.length) {
      headStyles.forEach(function (styleEl) {
        var css = styleEl.textContent || "";
        var rules = countRules(css);
        var hasFontFace = /@font-face/i.test(css);
        var props = extractCustomProps(css);
        headVarsDefined = headVarsDefined.concat(props.defined);
        if (hasFontFace) {
          headHasFontFace = true;
          addIssue(
            issues,
            "critical",
            "Fontes (@font-face) definidas no &lt;head&gt;",
            "Este bloco <code>&lt;style&gt;</code> no <code>&lt;head&gt;</code> declara <code>@font-face</code>. Ele será descartado no deploy e as fontes customizadas não vão carregar. Mova este bloco para dentro do <code>&lt;body&gt;</code>.",
          );
        }
        if (props.defined.length) {
          addIssue(
            issues,
            "critical",
            "Variáveis CSS definidas no &lt;head&gt;",
            "As variáveis <code>" +
              props.defined
                .map(function (v) {
                  return "--" + v;
                })
                .join("</code>, <code>") +
              "</code> estão definidas em um <code>&lt;style&gt;</code> do <code>&lt;head&gt;</code> e serão perdidas no deploy.",
          );
        }
        if (!hasFontFace && !props.defined.length && rules > 0) {
          addIssue(
            issues,
            "warning",
            "Bloco de estilos no &lt;head&gt; será descartado",
            "Um <code>&lt;style&gt;</code> no <code>&lt;head&gt;</code> com cerca de " +
              rules +
              " regra(s) CSS será totalmente ignorado pelo CloudPages.",
          );
        }
      });
    }

    var linkStyles = head
      ? head.querySelectorAll('link[rel="stylesheet"]')
      : [];
    linkStyles.forEach(function (l) {
      addIssue(
        issues,
        "warning",
        "CSS externo no &lt;head&gt; será perdido",
        'O <code>&lt;link rel="stylesheet"&gt;</code> apontando para <code>' +
          (l.getAttribute("href") || "") +
          "</code> não sobrevive ao deploy.",
      );
    });

    var headScriptsSrc = head ? head.querySelectorAll("script[src]") : [];
    headScriptsSrc.forEach(function (s) {
      addIssue(
        issues,
        "warning",
        "Script externo no &lt;head&gt; será perdido",
        'O <code>&lt;script src="' +
          (s.getAttribute("src") || "") +
          '"&gt;</code> não será carregado após o deploy.',
      );
    });

    var headScriptsInline = head
      ? head.querySelectorAll("script:not([src])")
      : [];
    headScriptsInline.forEach(function () {
      addIssue(
        issues,
        "warning",
        "Script inline no &lt;head&gt; será perdido",
        "Há um <code>&lt;script&gt;</code> inline no <code>&lt;head&gt;</code>. Toda a lógica dentro dele será descartada — mova para o <code>&lt;body&gt;</code> se for necessária.",
      );
    });

    var viewportMeta = head
      ? head.querySelector('meta[name="viewport"]')
      : null;
    if (viewportMeta) {
      addIssue(
        issues,
        "info",
        "Meta viewport do &lt;head&gt; será substituída",
        "O CloudPages injeta sua própria meta viewport (<code>" +
          CLOUDPAGES_HEAD.match(/<meta name="viewport"[^>]*>/)[0]
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;") +
          "</code>). Normalmente não é um problema, mas confirme se o comportamento muda em telas pequenas.",
      );
    }

    var titleEl = head ? head.querySelector("title") : null;
    if (titleEl && titleEl.textContent.trim()) {
      addIssue(
        issues,
        "info",
        'Título "' + titleEl.textContent.trim() + '" será perdido',
        "A tag <code>&lt;title&gt;</code> do <code>&lt;head&gt;</code> é descartada. Defina o título da página nas configurações do CloudPages.",
      );
    }

    // ---- Verificações do <body> ----
    var bodyStyles = body ? body.querySelectorAll("style") : [];
    var bodyVarsDefined = [];
    var bodyVarsUsed = [];

    if (bodyStyles.length) {
      bodyStyles.forEach(function (styleEl) {
        var css = styleEl.textContent || "";
        var props = extractCustomProps(css);
        bodyVarsDefined = bodyVarsDefined.concat(props.defined);
        bodyVarsUsed = bodyVarsUsed.concat(props.used);
      });
      addIssue(
        issues,
        "ok",
        bodyStyles.length +
          " bloco(s) &lt;style&gt; já está(ão) dentro do &lt;body&gt;",
        "Esses estilos são preservados após o deploy — é o comportamento correto para o CloudPages.",
      );
    } else if (headStyles.length) {
      addIssue(
        issues,
        "warning",
        "Nenhum &lt;style&gt; encontrado dentro do &lt;body&gt;",
        "Todo o CSS da página está no <code>&lt;head&gt;</code>. Sem nenhum <code>&lt;style&gt;</code> no <code>&lt;body&gt;</code>, a LP ficará sem estilo nenhum após o deploy.",
      );
    }

    var missingVars = [];
    bodyVarsUsed.forEach(function (v) {
      var definedInBody = bodyVarsDefined.indexOf(v) !== -1;
      var definedInHead = headVarsDefined.indexOf(v) !== -1;
      if (!definedInBody && definedInHead) missingVars.push(v);
    });
    if (missingVars.length) {
      var uniqueMissing = missingVars.filter(function (v, i) {
        return missingVars.indexOf(v) === i;
      });
      addIssue(
        issues,
        "critical",
        "Variáveis CSS usadas no &lt;body&gt; mas definidas só no &lt;head&gt;",
        "As variáveis <code>" +
          uniqueMissing
            .map(function (v) {
              return "--" + v;
            })
            .join("</code>, <code>") +
          "</code> são usadas em estilos do <code>&lt;body&gt;</code>, porém só existem no <code>&lt;head&gt;</code>. Após o deploy elas ficam indefinidas (<code>var()</code> cai no valor inicial) e os estilos que dependem delas quebram visualmente.",
      );
    }

    // ids duplicados em todo o documento
    var allIds = {};
    var dupes = [];
    doc.querySelectorAll("[id]").forEach(function (elm) {
      var id = elm.id;
      if (!id) return;
      if (allIds[id]) {
        if (dupes.indexOf(id) === -1) dupes.push(id);
      }
      allIds[id] = true;
    });
    if (dupes.length) {
      addIssue(
        issues,
        "warning",
        "IDs duplicados encontrados",
        "O(s) id(s) <code>" +
          dupes.join("</code>, <code>") +
          "</code> aparece(m) mais de uma vez. Isso pode causar comportamento inesperado em formulários, âncoras e scripts que usam <code>getElementById</code>.",
      );
    }

    if (
      !headStyles.length &&
      !linkStyles.length &&
      !headScriptsSrc.length &&
      !headScriptsInline.length
    ) {
      addIssue(
        issues,
        "ok",
        "Nada de essencial foi encontrado apenas no &lt;head&gt;",
        "Não há estilos, scripts ou CSS externo exclusivos do <code>&lt;head&gt;</code> — o risco de perda no deploy é baixo.",
      );
    }

    addIssue(
      issues,
      "info",
      "Estrutura original é descartada",
      "As tags <code>&lt;!DOCTYPE&gt;</code>, <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code> e <code>&lt;body&gt;</code> do seu código não aparecem no HTML final — o CloudPages usa a própria estrutura (tabelas <code>stylingblock-content-wrapper</code>, <code>div.layout.layout-canvas-g</code> etc.) e mantém apenas o conteúdo que está dentro do seu <code>&lt;body&gt;</code>.",
    );

    // ---- Monta o HTML simulado pós-deploy ----
    var bodyInner = body ? body.innerHTML : raw;
    var previewHtml =
      "<!DOCTYPE html><html><head>" +
      CLOUDPAGES_HEAD +
      '<style class="sandbox-isolation">html{color-scheme:light;background:#fff;}</style>' +
      "</head><body>" +
      '<div class="layout layout-canvas-g"><div class="section"><div class="columns col1">' +
      bodyInner +
      "</div></div></div>" +
      "</body></html>";

    return {issues: issues, previewHtml: previewHtml, bodyOnly: bodyInner};
  }

  var LEVEL_LABEL = {
    critical: "Crítico",
    warning: "Atenção",
    ok: "OK",
    info: "Info",
  };
  var LEVEL_ORDER = {critical: 0, warning: 1, ok: 2, info: 3};

  function renderLog(issues) {
    logList.innerHTML = "";
    var counts = {critical: 0, warning: 0, ok: 0, info: 0};
    issues
      .slice()
      .sort(function (a, b) {
        return LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
      })
      .forEach(function (issue) {
        counts[issue.level] = (counts[issue.level] || 0) + 1;
        var item = el("li", "log-item level-" + issue.level);
        var dot = el("span", "log-dot");
        var body = el("div");
        var h3 = el("h3", null, issue.title);
        var p = el("p", null, issue.detail);
        body.appendChild(h3);
        body.appendChild(p);
        item.appendChild(dot);
        item.appendChild(body);
        logList.appendChild(item);
      });

    logSummary.innerHTML = "";
    ["critical", "warning", "ok", "info"].forEach(function (level) {
      if (!counts[level]) return;
      var pill = el(
        "span",
        "pill pill-" + level,
        counts[level] + " " + LEVEL_LABEL[level],
      );
      logSummary.appendChild(pill);
    });

    var blockers = counts.critical + counts.warning;
    if (blockers > 0) {
      logBadge.hidden = false;
      logBadge.textContent = blockers;
    } else {
      logBadge.hidden = true;
    }
  }

  function runAnalysis() {
    if (!input) {
      showBootError("Editor de código não encontrado na página.");
      return;
    }
    var raw = input.value;
    var result = analyze(raw);
    setPreviewHtml(result.previewHtml);
    if (logList && logSummary) renderLog(result.issues);
  }

  // Estado inicial: carrega o exemplo já analisado, para a página nunca abrir vazia.
  if (!input || !previewFrame) {
    showBootError(
      "Interface incompleta. Confirme que index.html e a pasta script/ estão juntos e recarregue com Ctrl+F5.",
    );
    return;
  }
  input.value = EXAMPLE;
  updateCharCount();
  runAnalysis();
})();
