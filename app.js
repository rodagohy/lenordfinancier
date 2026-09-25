// Le Nord Financier — interactions (sélecteurs par classe, rien n'est injecté dans le contenu)

var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu mobile
document.querySelectorAll('.nav__burger').forEach(function (bouton) {
  bouton.addEventListener('click', function () {
    var nav = bouton.closest('.nav');
    var ouvert = nav.classList.toggle('ouvert');
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
});

// Sous-menus : au survol sur ordinateur (CSS), au clic sur mobile et au clavier
document.querySelectorAll('.sous-menu__bascule').forEach(function (bouton) {
  bouton.addEventListener('click', function () {
    var item = bouton.closest('.a-sous-menu');
    var ouvert = item.classList.toggle('ouvert');
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    document.querySelectorAll('.a-sous-menu.ouvert').forEach(function (autre) {
      if (autre !== item) {
        autre.classList.remove('ouvert');
        autre.querySelector('.sous-menu__bascule').setAttribute('aria-expanded', 'false');
      }
    });
  });
});

// Recherche : le champ s'ouvre sous le pré-menu
document.querySelectorAll('.pre-menu__recherche').forEach(function (bouton) {
  var entete = bouton.closest('.entete');
  bouton.addEventListener('click', function () {
    var ouvert = entete.classList.toggle('recherche-ouverte');
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    if (ouvert) { var champ = entete.querySelector('.recherche input'); if (champ) champ.focus(); }
  });
});
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.entete.recherche-ouverte').forEach(function (entete) {
    entete.classList.remove('recherche-ouverte');
    var b = entete.querySelector('.pre-menu__recherche'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); }
  });
  document.querySelectorAll('.a-sous-menu.ouvert').forEach(function (item) {
    item.classList.remove('ouvert');
    item.querySelector('.sous-menu__bascule').setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('click', function (e) {
  if (e.target.closest('.entete')) return;
  document.querySelectorAll('.entete.recherche-ouverte').forEach(function (entete) { entete.classList.remove('recherche-ouverte'); });
  document.querySelectorAll('.nav:not(.ouvert) .a-sous-menu.ouvert').forEach(function (item) { item.classList.remove('ouvert'); });
});

// En-tête : toujours fixe ; il devient bleu nuit opaque dès qu'on quitte le haut de page
document.querySelectorAll('.entete').forEach(function (entete) {
  var defile = null;
  function verifier() {
    var etat = window.scrollY > 40;
    if (etat === defile) return;
    defile = etat;
    entete.classList.toggle('entete--defile', etat);
  }
  window.addEventListener('scroll', verifier, { passive: true });
  verifier();
});

// FAQ : une seule question ouverte à la fois
document.querySelectorAll('.faq__liste').forEach(function (liste) {
  liste.querySelectorAll('.question').forEach(function (q) {
    q.addEventListener('toggle', function () {
      if (!q.open) return;
      liste.querySelectorAll('.question').forEach(function (autre) {
        if (autre !== q) autre.open = false;
      });
    });
  });
});

// Titre du héros : chaque mot apparaît à son tour (le texte reste lisible sans script).
// Construit avec textContent et createElement : un titre saisi dans l'éditeur ne peut pas injecter de code.
document.querySelectorAll('.hero__titre').forEach(function (titre) {
  if (mouvementReduit || titre.children.length) return;   // titre enrichi : on le laisse tel quel
  var texte = titre.textContent.trim();
  titre.setAttribute('aria-label', texte);
  titre.textContent = '';
  texte.split(/\s+/).forEach(function (mot, i) {
    if (i) titre.appendChild(document.createTextNode(' '));
    var span = document.createElement('span');
    span.className = 'mot';
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--m', i);
    span.textContent = mot;
    titre.appendChild(span);
  });
});

// Formulaires (maquette uniquement) : validation du navigateur, piège à robots, message honnête.
// En production, l'envoi est pris en charge par WPForms côté serveur.
document.querySelectorAll('.formulaire form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var statut = form.querySelector('.formulaire__statut');
    var piege = form.querySelector('[name="site_web"]');
    if (piege && piege.value) return;                      // robot : on ignore sans rien dire
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (statut) statut.textContent = 'Merci ! (Maquette : l’envoi sera activé à la mise en ligne.)';
    form.reset();
  });
});

// Apparition progressive au défilement
(function () {
  // [sélecteur, variante, décalage de départ en ms]
  var cibles = [
    ['.hero__texte', '', 520],
    ['.hero__actions', '', 640],
    ['.hero__photo', '', 300],
    ['.hero__carte', 'surgir', 1100],
    ['.hero__badge', 'surgir', 1300],
    ['.hero__signature', '', 900],
    ['.etiquette', '', 0],
    ['.titre-section, .apropos__nom, .publics h2, .appel h2, .presentation__lead', '', 80],
    ['.chapo, .apropos__texte > p, .appel p, .mission__colonnes, .recommandation__accroche, .lien-fleche', '', 160],
    ['.apropos__texte > .bouton, .pourquoi .bouton, .appel .bouton, .presentation__texte > .bouton', '', 240],
    ['.apropos__photo, .pourquoi__photo, .parcours__photo, .mission__image, .presentation__photo', 'image', 0],
    ['.presentation__services, .evenement, .recommandation__texte', 'surgir', 120],
    ['.voyage__bloc, .citation, .captures__bloc, .decision__bloc, .bientot__carte, .avertissement, .avis-google, .raisons', 'surgir', 60],
    ['.vision__photo, .parcours__cote .parcours__photo', 'image', 0],
    ['.carrousel', 'surgir', 80],
    ['.vision__enonce, .adhesion__long, .parcours__texte > p, .presentation__corps', '', 120],
    ['.mission__enonce', '', 80],
    ['.mission__encart, .formulaire, .faq__aide', 'surgir', 0],
    ['.faq__groupe > h2', '', 0],
    ['.defile', '', 150],
    ['.appel__bloc', 'surgir', 0],
    ['.pied__haut > div:first-child, .pied__bas', '', 0]
  ];
  // Grilles : les enfants arrivent l'un après l'autre
  var grilles = ['.chiffres__grille', '.catalogue__grille', '.grille-3', '.grille-4', '.pastilles', '.distinctions', '.voyage__choix', '.outils__cartes', '.espaces__grille', '.avis-google__liste', '.agenda__liste', '.apropos__infos', '.services__grille', '.pourquoi__cartes', '.temoignages__grille', '.faq__liste', '.pied__colonnes',
                 '.offres__grille', '.etapes__liste', '.jalons', '.valeurs__grille', '.faq__themes', '.coordonnees'];

  var elements = [];
  function marquer(el, variante, delai, rang) {
    el.classList.add('apparait');
    if (variante) el.classList.add('apparait--' + variante);
    if (delai) el.style.setProperty('--d', delai + 'ms');
    if (rang) el.style.setProperty('--i', rang);
    elements.push(el);
  }
  cibles.forEach(function (c) {
    document.querySelectorAll(c[0]).forEach(function (el) { marquer(el, c[1], c[2], 0); });
  });
  grilles.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (grille) {
      Array.prototype.forEach.call(grille.children, function (enfant, i) { marquer(enfant, '', 0, i % 4); });
    });
  });

  if (mouvementReduit || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  // Ce qui est déjà à l'écran au chargement s'anime tout de suite
  var hauteur = window.innerHeight;
  var restants = elements.filter(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < hauteur && r.bottom > 0) { el.classList.add('visible'); return false; }
    return true;
  });
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  restants.forEach(function (el) { obs.observe(el); });
})();

// Chiffres qui s'animent quand ils deviennent visibles
(function () {
  var compteurs = document.querySelectorAll('.compteur');
  if (mouvementReduit || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      var el = e.target, cible = parseInt(el.textContent, 10), debut = null, duree = 1400;
      if (isNaN(cible)) return;
      function pas(t) {
        if (debut === null) debut = t;
        var p = Math.min((t - debut) / duree, 1);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(pas);
      }
      el.textContent = '0';
      requestAnimationFrame(pas);
    });
  }, { threshold: 0.6 });
  compteurs.forEach(function (c) { obs.observe(c); });
})();

// Galerie : carrousel horizontal (flèches, compteur, progression) et agrandissement au clic
document.querySelectorAll('.carrousel').forEach(function (carrousel) {
  var piste = carrousel.querySelector('.carrousel__piste');
  var photos = Array.prototype.slice.call(piste.querySelectorAll('.carrousel__photo'));
  var prec = carrousel.querySelector('[data-sens="-1"]');
  var suiv = carrousel.querySelector('[data-sens="1"]');
  var compteur = carrousel.querySelector('.carrousel__compteur strong');
  var barre = carrousel.querySelector('.carrousel__progression span');

  function plageVisible() {
    var cadre = piste.getBoundingClientRect(), premiere = -1, derniere = -1;
    photos.forEach(function (p, i) {
      var r = p.getBoundingClientRect();
      var visible = Math.min(r.right, cadre.right) - Math.max(r.left, cadre.left);
      if (visible > r.width * 0.6) { if (premiere < 0) premiere = i; derniere = i; }
    });
    if (premiere < 0) return '1';
    return premiere === derniere ? String(premiere + 1) : (premiere + 1) + '–' + (derniere + 1);
  }
  function majour() {
    var max = piste.scrollWidth - piste.clientWidth;
    var part = piste.clientWidth / piste.scrollWidth;
    var avance = max > 0 ? piste.scrollLeft / max : 0;
    if (barre) { barre.style.width = (part * 100) + '%'; barre.style.marginLeft = (avance * (1 - part) * 100) + '%'; }
    if (compteur) compteur.textContent = plageVisible();
    if (prec) prec.disabled = piste.scrollLeft <= 2;
    if (suiv) suiv.disabled = piste.scrollLeft >= max - 2;
  }
  [prec, suiv].forEach(function (b) {
    if (!b) return;
    b.addEventListener('click', function () {
      piste.scrollBy({ left: Number(b.dataset.sens) * piste.clientWidth * 0.8, behavior: mouvementReduit ? 'auto' : 'smooth' });
    });
  });
  piste.addEventListener('scroll', function () { window.requestAnimationFrame(majour); }, { passive: true });
  piste.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' && suiv) { e.preventDefault(); suiv.click(); }
    if (e.key === 'ArrowLeft' && prec) { e.preventDefault(); prec.click(); }
  });
  window.addEventListener('resize', majour);
  photos.forEach(function (p) { var img = p.querySelector('img'); if (img && !img.complete) img.addEventListener('load', majour); });
  majour();

  // Visionneuse (maquette) : construite avec createElement, aucun HTML injecté
  var boite = document.createElement('div');
  boite.className = 'visionneuse';
  boite.setAttribute('role', 'dialog');
  boite.setAttribute('aria-modal', 'true');
  boite.setAttribute('aria-label', 'Photo agrandie');
  var grande = document.createElement('img');
  var info = document.createElement('p');
  info.className = 'visionneuse__compteur';
  function bouton(classe, libelle, contenu) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = classe; b.setAttribute('aria-label', libelle);
    if (contenu) { b.appendChild(contenu); } else { b.textContent = '×'; }
    return b;
  }
  function fleche() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ico'); svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-fleche'); svg.appendChild(use);
    return svg;
  }
  var fermer = bouton('visionneuse__fermer', 'Fermer');
  var bPrec = bouton('visionneuse__prec', 'Photo précédente', fleche());
  var bSuiv = bouton('visionneuse__suiv', 'Photo suivante', fleche());
  boite.append(grande, fermer, bPrec, bSuiv, info);
  document.body.appendChild(boite);
  var courant = 0, dernierFocus = null;
  function montrer(i) {
    courant = (i + photos.length) % photos.length;
    var src = photos[courant].querySelector('img');
    grande.src = src.currentSrc || src.src;
    grande.alt = src.alt;
    info.textContent = (courant + 1) + ' / ' + photos.length;
  }
  function ouvrir(i) { dernierFocus = document.activeElement; montrer(i); boite.classList.add('ouverte'); fermer.focus(); document.documentElement.style.overflow = 'hidden'; }
  function clore() { boite.classList.remove('ouverte'); document.documentElement.style.overflow = ''; if (dernierFocus) dernierFocus.focus(); }
  photos.forEach(function (p, i) {
    p.setAttribute('tabindex', '0');
    p.addEventListener('click', function () { ouvrir(i); });
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(i); } });
  });
  fermer.addEventListener('click', clore);
  bPrec.addEventListener('click', function () { montrer(courant - 1); });
  bSuiv.addEventListener('click', function () { montrer(courant + 1); });
  boite.addEventListener('click', function (e) { if (e.target === boite) clore(); });
  document.addEventListener('keydown', function (e) {
    if (!boite.classList.contains('ouverte')) return;
    if (e.key === 'Escape') clore();
    if (e.key === 'ArrowRight') montrer(courant + 1);
    if (e.key === 'ArrowLeft') montrer(courant - 1);
  });
});
