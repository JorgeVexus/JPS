(function () {
  'use strict';

  var STORAGE_KEY = 'jps-lang';

  var translations = {
    'hero.tag': 'integrado&nbsp;&nbsp;|&nbsp;&nbsp;distintivo&nbsp;&nbsp;|&nbsp;&nbsp;para un mañana más brillante',
    'hero.eyebrowRight': '<li>Licores</li><li>Vino</li><li>Bebidas</li><li>Marcas premium</li><li>Mercados globales</li>',
    'hero.eyebrowLeft': '<li>Ideas</li><li>Ingeniería</li><li>Empaque</li><li>Una marca más fuerte</li>',
    'hero.title': 'Empaque, Diseñado<br>Como <em>Ventaja Estratégica</em>',
    'hero.copy': 'Juan Packaging Solutions es un socio integral en desarrollo de empaque: desde el concepto y la ingeniería hasta el herramental, la manufactura, la decoración, el control de calidad y la logística. Ayudamos a marcas premium a crear empaques distintivos y más valor en el mercado.',
    'hero.cta': 'Iniciar una conversación',
    'hero.footnote': 'Empaque excepcional, valor duradero',

    'cap.item1': 'Concepto y diseño',
    'cap.item2': 'Ingeniería y herramental',
    'cap.item3': 'Manufactura y decoración',
    'cap.item4': 'Soluciones de empaque',
    'cap.item5': 'Calidad y logística',
    'cap.note': 'De ideas a realidad,<br>empaque excepcional<br>para un mañana más brillante.',

    'next.heading': 'El Próximo Capítulo de JPS Está Por Llegar',
    'next.copy': '<p>Estamos construyendo una nueva plataforma digital que refleje la compañía en la que nos hemos convertido, y el ecosistema internacional de empaque que estamos construyendo.</p><p>Mientras tanto, seguimos desarrollando proyectos, alianzas y relaciones en México, Estados Unidos y mercados globales.</p>',
    'next.contactBtn': 'Contactar a JPS',
    'next.linkedinBtn': 'Conectar en LinkedIn',
    'next.footnote': '¿Tienes un proyecto, alianza o idea que valga la pena platicar? Nos encantaría saber de ti.',

    'footer.wordSub': 'Socio Integral en Desarrollo de Empaque',
    'footer.tagline': 'Desarrollo Integral de Empaque Para Marcas Ambiciosas.',
    'footer.essence': 'La misma esencia. Un mañana más brillante.',
    'footer.contactHeading': 'Contáctanos',
    'footer.followHeading': 'Síguenos',
    'footer.location': 'Washington, Estados Unidos &bull; Jalisco, México',
    'footer.bottom': '&copy; 2026 Juan Packaging Solutions. Todos los derechos reservados.'
  };

  var meta = {
    en: {
      title: 'Juan Packaging Solutions | Integrated Packaging Development Partner',
      description: 'Juan Packaging Solutions is an integrated packaging development partner. From concept and engineering to tooling, manufacturing, decoration, quality control and logistics.'
    },
    es: {
      title: 'Juan Packaging Solutions | Socio Integral en Desarrollo de Empaque',
      description: 'Juan Packaging Solutions es un socio integral en desarrollo de empaque. Desde el concepto y la ingeniería hasta el herramental, la manufactura, la decoración, el control de calidad y la logística.'
    }
  };

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var originals = nodes.map(function (el) { return el.innerHTML; });
  var langBtns = Array.prototype.slice.call(document.querySelectorAll('[data-lang-btn]'));

  function applyLang(lang) {
    nodes.forEach(function (el, i) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = (lang === 'es' && translations[key]) ? translations[key] : originals[i];
    });

    document.documentElement.lang = lang;

    var copy = meta[lang] || meta.en;
    document.title = copy.title;
    var descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', copy.description);

    langBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-lang-btn') === lang;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang-btn'));
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === 'es') {
    applyLang('es');
  }
})();
