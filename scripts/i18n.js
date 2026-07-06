/* SEARULEA — EN/FR internationalisation
   English is the inline default (captured from the DOM on load).
   This file holds the French translations + the toggle logic.
   French copy follows the official SEARULEA brand storytelling guide. */

(function () {
  "use strict";

  // French translations, keyed by data-i18n. Values may contain <strong>/<em>/<br>.
  var FR = {
    /* Navigation */
    "nav.process":     "Notre chaîne",
    "nav.why":         "Pourquoi le Maroc",
    "nav.engineered":  "Conçu pour durer",
    "nav.commitment":  "Nos engagements",
    "nav.cta_full":    "Contacter le desk commercial ",
    "nav.cta_short":   "Desk commercial ",

    /* Hero */
    "hero.eyebrow": "Ras El Ma · Nador · Mer Méditerranée",
    "hero.line1":   "L’aquaculture",
    "hero.line2":   "<em>de demain.</em>",
    "hero.line3":   "Construite aujourd’hui.",
    "hero.deck":    "<strong>SEARULEA</strong> est un opérateur aquacole méditerranéen à intégration verticale. Élevage offshore à Ras El Ma. Conditionnement frais au port et logistique export en chaîne du froid certifiée — une chaîne, un interlocuteur, un lot traçable.",
    "hero.cta1":    "Contacter le desk commercial",
    "hero.cta2":    "Dossier investisseurs",

    /* Marquee */
    "marquee":
      "\n      Concession offshore de 375 ha\n      <i class=\"marquee__dot\"></i>\n      2 790 t en 2031\n      <i class=\"marquee__dot\"></i>\n      Certifié ONSSA\n      <i class=\"marquee__dot\"></i>\n40 % de femmes dans les emplois directs\n      <i class=\"marquee__dot\"></i>\n      Traçabilité IoT, lot par lot\n      <i class=\"marquee__dot\"></i>\n      Port export de Ras Kebdana\n      <i class=\"marquee__dot\"></i>\n    ",

    /* Our Process */
    "proc.index":   "01 — Notre chaîne",
    "proc.tag":     "Un interlocuteur. Un lot traçable.",
    "proc.title":   "\n        De notre <em>mer</em><br>\n        à votre <em>port.</em>\n      ",
    "proc.s1_body": "Dorade, loup et maigre élevés en cages offshore sur une concession gouvernementale de 375 ha à Ras El Ma. Protocoles de biosécurité intégrés dès la conception, pas ajoutés après coup.",
    "proc.s1_title": "Élevage offshore",
    "proc.s2_body": "Calibrage et conditionnement frais aux normes européennes. Site alimenté en énergie solaire, manipulation certifiée ONSSA, chaîne de traçabilité IoT complète, de la récolte à la palette d’expédition.",
    "proc.s2_title": "Conditionnement frais au port",
    "proc.s3_body": "Une chaîne du froid ininterrompue préserve la fraîcheur, de l’eau au camion. Chaque lot étiqueté, documenté et traçable de bout en bout — un interlocuteur, un dossier documentaire, une promesse tenue.",
    "proc.s3_title": "Chaîne du froid &amp; traçabilité",
    "proc.s4_body": "Logistique export certifiée via le port de Ras Kebdana. Roadmap documentée, volumes croissants avec vous — partenariats long terme possibles dès la Phase 1.",
    "proc.s4_title": "Export, de bout en bout",

    /* Why Morocco */
    "sov.index": "02 — Pourquoi le Maroc",
    "sov.title": "Ancrée au Maroc <em>par conviction.</em>",
    "sov.pull":  "SEARULEA ne produit pas seulement du poisson. Elle construit la capacité du Maroc à ne plus dépendre d’ailleurs pour le faire.",
    "sov.p1":    "Le Maroc dispose de deux façades maritimes, de 3 500 kilomètres de côtes et d’un accès direct au marché européen. Pourtant, il importe encore ses alevins et achète son alimentation piscicole à l’étranger — pendant que des opérateurs étrangers structurent une industrie que sa géographie rendait évidente.",
    "sov.p2":    "<strong>SEARULEA change cela, structurellement.</strong> Concession offshore signée. Hatchery et unité d’alimentation sur la roadmap. Ce qui se construit à Nador aujourd’hui, l’Algérie, la Tunisie et la Mauritanie le regarderont demain — la preuve qu’un opérateur africain peut atteindre les standards export internationaux dès le premier jour.",
    "sov.p3":    "<strong>Depuis nos côtes, pour le monde entier.</strong>",

    /* Engineered to Last */
    "proof.index":    "03 — Conçu pour durer",
    "proof.title":    "Les standards <em>dans le CAPEX,</em><br>pas dans la brochure.",
    "proof.c1_label": "Hectares · concession offshore",
    "proof.c1_body":  "Concession signée par l’État à Ras El Ma. Contrôle opérationnel long terme sur une zone d’élevage méditerranéenne pensée pour l’échelle.",
    "proof.c2_label": "Volume annuel en 2031",
    "proof.c2_body":  "Montée en puissance progressive et documentée. Partenariats commerciaux structurés avant le lancement. Des volumes qui grandissent avec votre contrat.",
    "proof.c3_label": "Objectif — femmes dans les emplois directs",
    "proof.c3_body":  "Un engagement durable : au moins 40 % de femmes dans les effectifs et les emplois directs de Searulea. Recrutement et formation ancrés localement à Nador.",
    "proof.c4_label": "Traçabilité IoT par lot",
    "proof.c4_body":  "Chaque lot suivi de la cage au camion. Certifié ONSSA, construit aux normes européennes, biosécurité et énergie solaire intégrées dès le premier jour.",

    /* Our Commitment */
    "doors.index": "04 — Nos engagements",
    "doors.title": "Une chaîne.<br><em>Trois certitudes.</em>",
    "door1.label": "Distributeurs &amp; clients",
    "door1.title": "Un interlocuteur unique, de bout en bout.",
    "door1.body":  "Dorade, loup et maigre — élevés en Méditerranée et exportés via Ras Kebdana. Dossier documentaire complet. Traçabilité IoT par lot. Une roadmap de volumes croissants pour les partenaires long terme.",
    "door1.link":  "Ouvrir le dossier commercial",
    "door2.label": "Investisseurs",
    "door2.title": "Une thèse défendable.<br>Une sortie visible.",
    "door2.body":  "Concession de 375 ha sécurisée. Demande documentée, marché sous-approvisionné. La valeur n’est pas dans les cages seules — elle est dans la chaîne intégrée, avec hatchery et feed sur la roadmap pour ancrer une infrastructure régionale.",
    "door2.link":  "Demander le dossier investisseurs",
    "door3.label": "Presse &amp; institutions",
    "door3.title": "Le blueprint, documenté.",
    "door3.body":  "Bien construit dès le premier jour. Biosécurité, énergie solaire, un objectif d’au moins 40 % de femmes dans les emplois directs, traçabilité IoT — intégrés, pas ajoutés pour un rapport annuel. Le modèle que l’Afrique du Nord regardera ensuite.",
    "door3.link":  "Ressources presse",

    /* Manifesto (official FR manifesto) */
    "mani.eyebrow": "Manifeste",
    "mani.p1": "Le Maroc dispose de deux façades maritimes, de <strong>3 500 kilomètres</strong> de côtes et d’un accès direct au marché européen. SEARULEA s’inscrit dans cette continuité.",
    "mani.p2": "À Ras El Ma, sur une concession offshore de <strong>375 hectares</strong>, nous développons une chaîne aquacole intégrée pensée pour fonctionner dans son ensemble : élevage en mer, conditionnement frais au port, logistique export réfrigérée et traçabilité des opérations. <em>Une étape après l’autre.</em>",
    "mani.p3": "Notre approche repose autant sur l’infrastructure que sur les standards qui l’accompagnent. Biosécurité intégrée dès le départ. Énergie solaire sur site. Formation et emploi local ancrés dans la région. Des choix intégrés au projet dès sa conception.",
    "mani.p4": "À terme, le hatchery et l’unité d’alimentation auront vocation à accompagner le développement plus large du secteur en Afrique du Nord.",
    "mani.p5": "SEARULEA construit une infrastructure aquacole pensée pour répondre aux standards internationaux dès le premier jour, évoluer avec les besoins du secteur et s’inscrire durablement dans le développement de l’industrie aquacole nord-africaine.",
    "mani.signoff": "Ancrée au Maroc. Construite pour le monde.",

    /* Footer */
    "foot.tag":      "L’aquaculture de demain. Construite aujourd’hui.",
    "foot.ops_h":    "Opérations",
    "foot.ops_2":    "Royaume du Maroc",
    "foot.ops_3":    "Certifié ONSSA",
    "foot.trade_h":  "Commercial",
    "foot.follow_h": "Suivre",
    "foot.follow_2": "Espace presse",
    "foot.follow_3": "Note durabilité",
    "foot.copy1":    "© SEARULEA · Tous droits réservés",
    "foot.copy2":    "Conçu et construit au Maroc · Des standards pour le monde"
  };

  var TITLES = {
    en: "SEARULEA — Moroccan Aquaculture, Built to Mediterranean Standards",
    fr: "SEARULEA — Aquaculture marocaine, aux standards méditerranéens"
  };

  var EN = {};          // captured from the DOM (English default)
  var nodes = [];
  var STORAGE_KEY = "searulea_lang";

  function apply(lang) {
    document.documentElement.setAttribute("lang", lang);
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = (lang === "fr") ? FR[key] : EN[key];
      if (val != null) el.innerHTML = val;
    });
    if (TITLES[lang]) document.title = TITLES[lang];
    var btns = document.querySelectorAll(".nav__lang-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-active", btns[i].getAttribute("data-lang") === lang);
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-lang") === lang ? "true" : "false");
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function init() {
    nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
    // Capture the inline English before any switch.
    nodes.forEach(function (el) { EN[el.getAttribute("data-i18n")] = el.innerHTML; });

    var btns = document.querySelectorAll(".nav__lang-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        apply(this.getAttribute("data-lang"));
      });
    }

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === "fr") apply("fr");
    else apply("en"); // ensures lang attr + active button are set for EN too
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
