/* Vitória Martins — interações e animações (sem dependências) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
  const WA = '5511958548695';

  /* ---------- Ano ---------- */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Topo: fundo ao rolar + esconder ao descer ---------- */
  const topo = $('#topo');
  const waFlut = $('.wa-flutuante');
  const contato = $('#contato');
  let ultimoY = window.scrollY;
  let agendado = false;
  let contatoVisivel = false;

  function aoRolar() {
    agendado = false;
    const y = window.scrollY;
    topo.classList.toggle('rolou', y > 24);
    const descendo = y > ultimoY && y > 400;
    if (!document.body.classList.contains('menu-aberto')) topo.classList.toggle('esconder', descendo && Math.abs(y - ultimoY) > 2);
    ultimoY = y;
    if (waFlut) waFlut.classList.toggle('oculto', y < 500 || contatoVisivel);
    parallax(y);
  }
  window.addEventListener('scroll', () => {
    if (!agendado) { agendado = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });

  /* ---------- Parallax suave no hero (apenas desktop) ---------- */
  const heroPic = $('.hero__bg picture');
  const heroEl = $('.hero');
  const desktopFino = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  function parallax(y) {
    if (!heroPic || reduz.matches || !desktopFino.matches) { if (heroPic) heroPic.style.transform = ''; return; }
    if (y > heroEl.offsetHeight) return;
    heroPic.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
  }
  aoRolar();

  /* ---------- Menu mobile ---------- */
  const btnMenu = $('.topo__menu');
  const menu = $('#menu-mobile');
  function abrirMenu(abrir) {
    btnMenu.setAttribute('aria-expanded', String(abrir));
    btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-aberto', abrir);
    if (abrir) {
      menu.hidden = false;
      topo.classList.remove('esconder');
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('aberto')));
      const primeiro = $('a', menu);
      setTimeout(() => primeiro && primeiro.focus({ preventScroll: true }), 120);
    } else {
      menu.classList.remove('aberto');
      setTimeout(() => { if (!menu.classList.contains('aberto')) menu.hidden = true; }, reduz.matches ? 0 : 420);
    }
  }
  if (btnMenu && menu) {
    btnMenu.addEventListener('click', () => abrirMenu(btnMenu.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => abrirMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-aberto')) { abrirMenu(false); btnMenu.focus(); }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) abrirMenu(false); });
  }

  /* ---------- Revelação ao rolar ---------- */
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduz.matches) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
    // Itens dentro de carrosséis horizontais (fora da área visível na horizontal)
    $$('.trilho [data-reveal], .bento [data-reveal]').forEach((el) => {
      const io2 = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { el.classList.add('visivel'); io2.disconnect(); }
      }, { root: null, rootMargin: '0px 100% -8% 100%', threshold: 0 });
      io2.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('visivel'));
  }

  /* ---------- Navegação ativa ---------- */
  const linksNav = $$('.topo__nav a');
  if ('IntersectionObserver' in window && linksNav.length) {
    const mapa = new Map(linksNav.map((a) => [a.getAttribute('href').slice(1), a]));
    const ioNav = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.target.id === 'inicio' && en.isIntersecting) { linksNav.forEach((l) => l.classList.remove('ativo')); return; }
        const link = mapa.get(en.target.id);
        if (link && en.isIntersecting) { linksNav.forEach((l) => l.classList.remove('ativo')); link.classList.add('ativo'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    mapa.forEach((_, id) => { const s = document.getElementById(id); if (s) ioNav.observe(s); });
    const inicio = document.getElementById('inicio'); if (inicio) ioNav.observe(inicio);
  }

  /* ---------- WhatsApp flutuante some na seção de contato ---------- */
  if (contato && waFlut && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { contatoVisivel = en.isIntersecting; aoRolar(); }, { threshold: 0.15 }).observe(contato);
  }

  /* ---------- Contadores ---------- */
  const contadores = $$('[data-contar]');
  if ('IntersectionObserver' in window && !reduz.matches) {
    contadores.forEach((el) => { el.textContent = '0'; });
    const ioC = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        ioC.unobserve(en.target);
        const alvo = +en.target.dataset.contar;
        const dur = 1600;
        const t0 = performance.now();
        const passo = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 4);
          en.target.textContent = Math.round(alvo * e).toLocaleString('pt-BR');
          if (p < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.6 });
    contadores.forEach((el) => ioC.observe(el));
  }

  /* ---------- Pontos dos carrosséis (celular) ---------- */
  $$('[data-pontos]').forEach((wrap) => {
    const trilho = document.getElementById(wrap.dataset.pontos);
    if (!trilho) return;
    const itens = () => $$(':scope > :not([hidden]):not(.vazio)', trilho);
    function montar() {
      wrap.innerHTML = itens().map(() => '<i></i>').join('');
      atualizar();
    }
    function atualizar() {
      const lista = itens();
      if (!lista.length) return;
      const pontos = $$('i', wrap);
      const centro = trilho.scrollLeft + trilho.clientWidth * 0.35;
      let idx = 0;
      lista.forEach((el, i) => { if (el.offsetLeft <= centro) idx = i; });
      if (trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4) idx = lista.length - 1;
      pontos.forEach((p, i) => p.classList.toggle('ativo', i === idx));
    }
    let raf = 0;
    trilho.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(atualizar); }, { passive: true });
    trilho.addEventListener('refazer-pontos', montar);
    montar();
  });

  /* ---------- Favoritos ---------- */
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem('vm-favs') || '[]'); } catch (e) { favs = []; }
  $$('.favorito').forEach((btn) => {
    const nome = btn.closest('.card-imovel').querySelector('.card-imovel__titulo').textContent;
    if (favs.includes(nome)) btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', () => {
      const ativo = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(ativo));
      btn.classList.remove('pulsar'); void btn.offsetWidth; btn.classList.add('pulsar');
      favs = ativo ? [...new Set([...favs, nome])] : favs.filter((f) => f !== nome);
      try { localStorage.setItem('vm-favs', JSON.stringify(favs)); } catch (e) { /* sem armazenamento */ }
    });
  });

  /* ---------- Busca / filtro de imóveis ---------- */
  const busca = $('#busca');
  const trilhoImoveis = $('#trilho-imoveis');
  const status = $('#imoveis-status');
  const vazio = $('#imoveis-vazio');
  if (busca && trilhoImoveis) {
    busca.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(busca);
      const regiao = f.get('regiao');
      const tipo = f.get('tipo');
      const [min, max] = (f.get('preco') || '0-999999999').split('-').map(Number);
      let n = 0;
      $$('.card-imovel', trilhoImoveis).forEach((card) => {
        const ok = (!regiao || card.dataset.regiao === regiao) && (!tipo || card.dataset.tipo === tipo) &&
          (+card.dataset.preco >= min && +card.dataset.preco <= max);
        card.hidden = !ok;
        card.classList.add('visivel');
        if (ok) { n++; card.classList.remove('filtrando'); void card.offsetWidth; card.classList.add('filtrando'); }
      });
      vazio.hidden = n > 0;
      const filtrado = regiao || tipo || f.get('preco');
      status.textContent = filtrado ? (n ? `${n} ${n === 1 ? 'imóvel encontrado' : 'imóveis encontrados'} com esses filtros.` : '') : '';
      trilhoImoveis.scrollLeft = 0;
      trilhoImoveis.dispatchEvent(new Event('refazer-pontos'));
      document.getElementById('imoveis').scrollIntoView({ behavior: reduz.matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ---------- Formulário → WhatsApp ---------- */
  const form = $('#form-contato');
  if (form) {
    const validar = (campo) => {
      const wrap = campo.closest('.campo');
      const ok = campo.value.trim() !== '';
      wrap.classList.toggle('erro', !ok);
      wrap.classList.toggle('ok', ok);
      campo.setAttribute('aria-invalid', String(!ok));
      const erro = wrap.querySelector('.campo__erro');
      if (erro) campo.setAttribute('aria-describedby', erro.id);
      return ok;
    };
    $$('[required]', form).forEach((c) => {
      c.addEventListener('blur', () => { if (c.value || c.closest('.campo').classList.contains('erro')) validar(c); });
      c.addEventListener('input', () => { if (c.closest('.campo').classList.contains('erro')) validar(c); });
      c.addEventListener('change', () => validar(c));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const obrig = $$('[required]', form);
      $$('.campo', form).forEach((c) => c.classList.remove('erro'));
      void form.offsetWidth;
      const invalidos = obrig.filter((c) => !validar(c));
      if (invalidos.length) { invalidos[0].focus(); return; }
      const d = new FormData(form);
      const linhas = [
        `Olá, Vitória! Me chamo ${d.get('nome').trim()} e gostaria de simular um financiamento.`,
        `• Renda familiar: ${d.get('renda')}`,
        `• Possui FGTS: ${d.get('fgts')}`,
        `• Região de interesse: ${d.get('regiao')}`,
      ];
      const msg = (d.get('mensagem') || '').trim();
      if (msg) linhas.push(`• Mensagem: ${msg}`);
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(linhas.join('\n'))}`;
      const link = $('#form-link');
      link.href = url;
      const ok = $('.form__ok', form);
      ok.hidden = false;
      const btn = $('button[type="submit"]', form);
      btn.querySelector('span').textContent = 'Abrir WhatsApp novamente';
      const janela = window.open(url, '_blank');
      if (janela) { try { janela.opener = null; } catch (err) { /* ok */ } } else { window.location.href = url; }
    });
  }
})();
