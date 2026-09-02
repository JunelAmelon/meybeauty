'use server';

import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@meybeauty/firebase/admin';

const ENABLE_SEED = process.env.NEXT_PUBLIC_ENABLE_SEED === 'true';
const SUPPORTED_LOCALES = ['fr', 'en', 'es-PE'] as const;

type Locale = (typeof SUPPORTED_LOCALES)[number];

type Product = {
  slug: string;
  category: string;
  price: number;
  image: string;
  volume?: string;
  stock?: number;
  translations: Record<Locale, {
    name: string;
    desc: string;
    long_desc: string;
    category: string;
    usage?: string;
    ingredient_base?: string;
  }>;
  deliveryDays?: { min: number; max: number };
};

type BlogPost = {
  slug: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  related: string[];
  author: { name: string; role: string; avatar: string };
  translations: Record<Locale, { title: string; excerpt: string; content: string[] }>;
};

// type Ritual = {
//   slug: string;
//   image: string;
//   products: string[];
//   translations: Record<
//     Locale,
//     {
//       title: string;
//       subtitle: string;
//       description: string;
//       duration: string;
//       difficulty: string;
//       full_desc: string;
//       steps: { name: string; desc: string }[];
//       tips: string[];
//     }
//   >;
// };

type DownloadAssetB2B = {
  slug: string;
  type: 'image' | 'pdf' | 'video';
  category: string;
  format: string;
  size: string;
  url: string;
  translations: Record<
    Locale,
    {
      title: string;
    }
  >;
  defaultLocale?: Locale;
};

// type Podcast = {
//   slug: string;
//   image: string;
//   date: string;
//   duration: string;
//   guest: string;
//   translations: Record<
//     Locale,
//     {
//       title: string;
//       description: string;
//       guest_title: string;
//     }
//   >;
// };

// --- B2B Protocoles ---
// type ProtocoleB2B = {
//   slug: string;
//   type: 'fiche' | 'rituel';
//   category: string;
//   duration: string;
//   image: string;
//   translations: Record<
//     Locale,
//     {
//       title: string;
//       description: string;
//     }
//   >;
// };

type RituelB2B = {
  slug: string;
  reference: string;
  category: string;
  image: string;
  theme: string;
  ambiance: string;
  duration: string;
  preparation: {
    cabine: string[];
    materiel: string[];
    produits: string[];
  };
  deroulement: {
    phase: string;
    duree: string;
    description: string;
    actions: string[];
  }[];
  retail: string[];
  notes: string[];
  translations: Record<
    Locale,
    {
      title: string;
      introduction: string;
      theme: string;
      ambiance: string;
      category: string;
      duration: string;
      preparation: RituelB2B['preparation'];
      deroulement: RituelB2B['deroulement'];
      retail: string[];
      notes: string[];
    }
  >;
};

type FicheB2B = {
  slug: string;
  reference: string;
  category: string;
  extraction: string;
  volume: string;
  image: string;
  description: string;
  proprietes: string[];
  actifs: { nom: string; role: string }[];
  utilisation: {
    frequence: string;
    methode: string;
    temps: string;
    retrait: string;
  };
  caracteristiques: {
    texture: string;
    odeur: string;
    ph: string;
    conservation: string;
  };
  avis_experts: string;
  translations: Record<
    Locale,
    {
      title: string;
      description: string;
      category: string;
      reference: string;
      extraction: string;
      volume: string;
      proprietes: string[];
      actifs: { nom: string; role: string }[];
      utilisation: FicheB2B['utilisation'];
      caracteristiques: FicheB2B['caracteristiques'];
      avis_experts: string;
    }
  >;
};

function duplicateLocales<T>(frData: T): Record<Locale, T> {
  return SUPPORTED_LOCALES.reduce((acc, locale) => {
    acc[locale] = frData;
    return acc;
  }, {} as Record<Locale, T>);
}

function buildProducts(): Product[] {
  const productsData = [
    // --- Corps ---
    {
      id: "lpg-creme-micro-peeling",
      name: "Crème micro-peeling",
      category: "Corps",
      volume: "200ml",
      desc: "Révélez l'éclat originel de votre peau. Crème fluide aux AHAs pour un renouvellement cellulaire immédiat.",
      long_desc: "Cette crème fluide, à la texture aérienne et à pénétration instantanée, fusionne avec l'épiderme pour un renouvellement cellulaire immédiat. Enrichie en AHAs (acides de fruits) sélectionnés avec soin, elle lisse visiblement les imperfections, resserre les pores et métamorphose le grain de peau dès les premières applications.",
      usage: "Appliquer sur peau propre et masser doucement jusqu'à pénétration complète.",
      ingredient_base: "AHAs (acides de fruits), actifs exfoliants doux.",
      price: 57,
      stock: 30
    },
    {
      id: "lpg-creme-anti-cellulite",
      name: "Crème anti-cellulite",
      category: "Corps",
      volume: "200ml",
      desc: "Gel-crème fondant ciblant tous les types de cellulite pour des jambes plus légères.",
      long_desc: "Affranchissez votre silhouette des capitons disgracieux. Ce gel-crème fondant s'applique comme un rituel de modelage pour cibler tous les types de cellulite. Adipeuse, aqueuse ou fibreuse, il affine, lisse et tonifie la peau tout en réveillant la microcirculation.",
      usage: "Masser quotidiennement sur les zones concernées (cuisses, hanches, ventre).",
      ingredient_base: "Actifs drainants et lipolytiques.",
      price: 57,
      stock: 25
    },
    {
      id: "lpg-creme-fermete-galbante",
      name: "Crème fermeté galbante",
      category: "Corps",
      volume: "200ml",
      desc: "Crème fondante liftante qui restructure, raffermit et galbe les zones relâchées.",
      long_desc: "Cette crème fondante, au toucher soyeux, enveloppe la peau d'un film liftant invisible qui restructure, raffermit et galbe les zones relâchées. Bras, ventre, cuisses : chaque zone retrouve tension et tonicité.",
      usage: "Appliquer sur les zones relâchées et masser jusqu'à absorption.",
      ingredient_base: "Actifs raffermissants et liftants.",
      price: 57,
      stock: 25
    },
    {
      id: "lpg-creme-lipo-reductrice",
      name: "Crème lipo-réductrice",
      category: "Corps",
      volume: "200ml",
      desc: "Crème onctueuse pour déstocker les graisses localisées et redessiner la silhouette.",
      long_desc: "Cette crème onctueuse, parfaitement adaptée au massage, pénètre en profondeur pour déstocker les graisses localisées et redessiner hanches, ventre et bras. Sa texture veloutée glisse sous les doigts.",
      usage: "Masser en mouvements circulaires sur les zones à traiter.",
      ingredient_base: "Actifs lipolytiques et déstockants.",
      price: 57,
      stock: 20
    },
    {
      id: "lpg-serum-intensif-anti-cellulite",
      name: "Sérum intensif anti-cellulite",
      category: "Corps",
      volume: "100ml",
      desc: "Sérum ultra-ciblé qui affine, tonifie et redonne élasticité à la peau.",
      long_desc: "Ce sérum ultra-ciblé, d'une fluidité précieuse, agit en synergie avec les soins corps pour amplifier leur action. Il affine, tonifie et redonne élasticité à la peau tout en combattant la rétention d'eau.",
      usage: "Appliquer quelques gouttes avant le soin corps pour amplifier l'efficacité.",
      ingredient_base: "Actifs haute performance anti-cellulite.",
      price: 69,
      stock: 20
    },
    {
      id: "lpg-huile-experte-vergetures",
      name: "Huile experte vergetures",
      category: "Corps",
      volume: "100ml",
      desc: "Huile 100% d'origine naturelle, riche en oméga 3-6-9, pour prévenir et corriger les vergetures.",
      long_desc: "Prenez soin de votre peau avec la douceur d'une huile précieuse. 100% d'origine naturelle et riche en oméga 3-6-9, elle prévient, corrige et assouplit les vergetures. Sa texture satinée pénètre instantanément.",
      usage: "Masser délicatement sur les zones concernées. Idéale pendant la grossesse dès le premier mois.",
      ingredient_base: "Oméga 3-6-9, huiles végétales naturelles.",
      price: 59,
      stock: 20
    },
    {
      id: "lpg-gel-lipo-reducteur",
      name: "Gel lipo réducteur",
      category: "Corps",
      volume: "200ml",
      desc: "Gel frais et léger qui cible les zones de graisse localisée avec précision.",
      long_desc: "Un gel frais et léger qui cible les zones de graisse localisée avec précision. Sa texture aqueuse pénètre en un instant pour déstocker, affiner et redessiner la silhouette.",
      usage: "Appliquer sur les zones à traiter, matin et/ou soir.",
      ingredient_base: "Actifs lipolytiques et rafraîchissants.",
      price: 57,
      stock: 25
    },
    // --- Visage ---
    {
      id: "lpg-eau-micellaire",
      name: "Eau micellaire",
      category: "Visage",
      volume: "200ml",
      desc: "Eau micellaire tout-en-un qui capture les impuretés et le maquillage en un seul geste.",
      long_desc: "Cette eau micellaire tout-en-un capture les impuretés et le maquillage en un seul geste, sans jamais agresser. Enrichie en glycérine et sucres naturels, elle laisse la peau fraîche, apaisée et parfaitement hydratée.",
      usage: "Imbiber un coton et passer sur le visage et les yeux. Sans rinçage.",
      ingredient_base: "Glycérine, sucres naturels, micelles.",
      price: 27,
      stock: 40
    },
    {
      id: "lpg-baume-expert-demaquillant",
      name: "Baume expert démaquillant",
      category: "Visage",
      volume: "100ml",
      desc: "Baume fondant qui évolue en huile puis en émulsion laiteuse pour dissoudre tout maquillage.",
      long_desc: "Ce baume fondant évolue en huile puis en émulsion laiteuse pour dissoudre le maquillage le plus tenace, waterproof inclus. En massant, il active la microcirculation et préserve l'hydratation.",
      usage: "Masser sur peau sèche, puis émulsionner avec de l'eau et rincer.",
      ingredient_base: "Huiles végétales, émulsifiants doux.",
      price: 32,
      stock: 30
    },
    {
      id: "lpg-poudre-soyeuse-microexfoliante",
      name: "Poudre soyeuse micro exfoliante",
      category: "Visage",
      volume: "50g",
      desc: "Poudre fine qui se transforme en mousse aux AHAs pour exfolier en douceur et unifier le teint.",
      long_desc: "Cette poudre fine, au contact de l'eau, se transforme en une mousse aérienne aux AHAs, acide succinique et extraits de papaye et d'ananas. Elle exfolie en douceur, unifie le teint et booste l'éclat naturel.",
      usage: "Verser une noisette de poudre dans la main humide, faire mousser et masser sur visage humide. Rincer.",
      ingredient_base: "AHAs, acide succinique, extraits de papaye et d'ananas.",
      price: 37,
      stock: 25
    },
    {
      id: "lpg-creme-exfoliante",
      name: "Crème exfoliante",
      category: "Visage",
      volume: "75ml",
      desc: "Crème exfoliante douce qui élimine les cellules mortes sans agresser.",
      long_desc: "Cette crème exfoliante douce élimine les cellules mortes sans agresser, révélant un teint frais, net et éclatant. Sa texture crémeuse enveloppe l'épiderme d'un confort immédiat.",
      usage: "Appliquer sur peau humide, masser doucement puis rincer.",
      ingredient_base: "Exfoliants doux, agents hydratants.",
      price: 35,
      stock: 25
    },
    {
      id: "lpg-essence-active-rehydratante",
      name: "Essence active réhydratante",
      category: "Visage",
      volume: "200ml",
      desc: "Essence lactée ultra-légère qui prépare l'épiderme et booste l'hydratation.",
      long_desc: "Cette essence lactée ultra-légère, d'absorption instantanée, prépare l'épiderme après le nettoyage, élimine les dernières peaux mortes et unifie le teint. Un geste précieux qui maximise l'efficacité des soins suivants.",
      usage: "Appliquer après le nettoyage, avant le sérum ou la crème.",
      ingredient_base: "Actifs hydratants et préparateurs.",
      price: 46,
      stock: 20
    },
    {
      id: "lpg-baume-yeux",
      name: "Baume yeux",
      category: "Visage",
      volume: "15ml",
      desc: "Baume nacré fondant qui embellit et défatigue le contour de l'œil. Sans parfum.",
      long_desc: "Ce baume légèrement nacré, d'une texture fondante, embellit et défatigue le contour de l'œil. Les signes de fatigue s'estompent, le regard est reposé, frais et plein de santé. Sans parfum.",
      usage: "Tapoter délicatement autour des yeux matin et soir.",
      ingredient_base: "Actifs défatigants et nacrés. Sans parfum.",
      price: 48,
      stock: 25
    },
    {
      id: "lpg-serum-huile-en-eau",
      name: "Sérum huile-en-eau réhydratant",
      category: "Visage",
      volume: "30ml",
      desc: "Sérum unique fusionnant huile, lotion et sérum pour stimuler l'acide hyaluronique naturel.",
      long_desc: "Ce sérum unique fusionne huile, lotion et sérum pour stimuler la production naturelle d'acide hyaluronique et renforcer la barrière cutanée. La peau désaltérée retrouve souplesse, éclat et confort durable.",
      usage: "Appliquer quelques gouttes sur peau propre, matin et soir.",
      ingredient_base: "Acide hyaluronique, huiles nourrissantes.",
      price: 70,
      stock: 15
    },
    {
      id: "lpg-gel-creme-dynamisante",
      name: "Gel-crème dynamisante réhydratante",
      category: "Visage",
      volume: "50ml",
      desc: "Gel-crème rosé nacré qui renforce la barrière cutanée et atténue tiraillements et rougeurs.",
      long_desc: "Ce gel-crème rosé nacré, d'une fraîcheur délicate, renforce la barrière cutanée et atténue tiraillements et rougeurs. La peau est repulpée, apaisée et lumineuse.",
      usage: "Appliquer matin et soir sur visage et cou.",
      ingredient_base: "Actifs hydratants et apaisants.",
      price: 65,
      stock: 20
    },
    {
      id: "lpg-creme-riche-dynamisante",
      name: "Crème riche dynamisante réhydratante",
      category: "Visage",
      volume: "50ml",
      desc: "Crème riche cocooning concentrée en beurres végétaux pour les peaux sèches et sensibles.",
      long_desc: "Concentrée en beurres végétaux, cire et squalane naturels, elle régénère les lipides, renforce la barrière cutanée et offre une hydratation longue durée. Un soin réconfortant pour les peaux sensibles.",
      usage: "Appliquer matin et soir sur visage et cou.",
      ingredient_base: "Beurres végétaux, cire naturelle, squalane.",
      price: 65,
      stock: 20
    },
    {
      id: "lpg-soin-anti-age-regeneration",
      name: "Soin anti-âge régénération cellulaire",
      category: "Visage",
      volume: "50ml",
      desc: "Crème nouvelle génération au complexe premium LPG pour une correction anti-âge instantanée.",
      long_desc: "Cette crème nouvelle génération, au complexe premium LPG, offre une correction anti-âge instantanée et durable. La peau devient incroyablement souple, douce et rebondie, comme revitalisée de l'intérieur.",
      usage: "Appliquer matin et/ou soir sur visage et cou.",
      ingredient_base: "Complexe premium LPG, actifs régénérants.",
      price: 110,
      stock: 10
    },
    {
      id: "lpg-serum-anti-age-regeneration",
      name: "Sérum anti-âge régénération cellulaire",
      category: "Visage",
      volume: "30ml",
      desc: "Sérum concentré anti-âge qui redonne fermeté, éclat et densité à la peau.",
      long_desc: "Ce sérum concentré, d'une fluidité précieuse, lutte de manière ciblée contre les signes de l'âge avec un cocktail d'actifs puissants. Hautement dosé, il redonne fermeté, éclat et densité à la peau.",
      usage: "Appliquer quelques gouttes avant la crème, matin et/ou soir.",
      ingredient_base: "Actifs anti-âge haute technicité.",
      price: 130,
      stock: 10
    },
    {
      id: "lpg-soin-contour-yeux-levres",
      name: "Soin contour des yeux et lèvres",
      category: "Visage",
      volume: "9ml",
      desc: "Soin concentré qui lisse, repulpe et redensifie le contour des yeux et des lèvres.",
      long_desc: "Ce soin concentré pour contour des yeux et lèvres lisse, repulpe et redensifie les traits fins. Sa texture fondante pénètre en douceur pour offrir un regard plus jeune et des lèvres sublimées.",
      usage: "Tapoter délicatement autour des yeux et des lèvres.",
      ingredient_base: "Actifs repulpants et lissants.",
      price: 52,
      stock: 20
    },
    {
      id: "lpg-masque-contour-yeux",
      name: "Masque contour des yeux post-traitement",
      category: "Visage",
      volume: "1 pièce",
      desc: "Masque contour des yeux spécial post-traitement qui apaise, hydrate et défatigue.",
      long_desc: "Ce masque contour des yeux, spécial post-traitement, apaise, hydrate et défatigue le regard en quelques minutes. La peau est fraîche, reposée et éclatante, comme après un soin professionnel.",
      usage: "Poser sous les yeux pendant 10-15 minutes après un soin.",
      ingredient_base: "Actifs apaisants et hydratants.",
      price: 12,
      stock: 50
    },
    {
      id: "lpg-masque-collagene",
      name: "Masque collagène post-traitement",
      category: "Visage",
      volume: "1 pièce",
      desc: "Masque post-traitement au collagène qui répare, hydrate et redensifie l'épiderme.",
      long_desc: "Ce masque post-traitement, d'une douceur enveloppante, répare, hydrate et redensifie l'épiderme. Idéal après un soin professionnel, il apaise et sublime le teint.",
      usage: "Appliquer sur visage propre pendant 15-20 minutes après un soin.",
      ingredient_base: "Collagène, actifs réparateurs.",
      price: 14,
      stock: 50
    },
    {
      id: "lpg-masque-levres",
      name: "Masque lèvres post-traitement",
      category: "Visage",
      volume: "1 pièce",
      desc: "Masque lèvres post-traitement qui hydrate, repulpe et adoucit les lèvres.",
      long_desc: "Ce masque lèvres post-traitement hydrate, repulpe et adoucit les lèvres pour un confort immédiat et une bouche plus douce, plus lisse et plus définie.",
      usage: "Poser sur les lèvres pendant 10-15 minutes.",
      ingredient_base: "Actifs hydratants et repulpants.",
      price: 10,
      stock: 50
    },
    {
      id: "lpg-creme-yeux",
      name: "Crème yeux",
      category: "Visage",
      volume: "15ml",
      desc: "Crème contour des yeux qui défroisse, estompe les cernes et décongestionne les poches.",
      long_desc: "Cette crème contour des yeux, d'une texture fine et fondante, défroisse, estompe les cernes et décongestionne les poches. L'effet anti-rides est visible, le confort immédiat. Sans parfum.",
      usage: "Tapoter délicatement autour des yeux matin et soir.",
      ingredient_base: "Actifs anti-cernes et anti-poches. Sans parfum.",
      price: 62,
      stock: 20
    },
    {
      id: "lpg-serum-lacte-lissant",
      name: "Sérum lacté lissant repulpant",
      category: "Visage",
      volume: "30ml",
      desc: "Sérum fluide lacté qui stimule, booste et détoxifie les cellules jeunesse.",
      long_desc: "Ce sérum fluide, d'une texture laiteuse ultra-douce, stimule, booste et détoxifie les cellules jeunesse. La peau est repulpée de l'intérieur, les rides sont lissées, le teint retrouve éclat et fermeté.",
      usage: "Appliquer quelques gouttes avant la crème, matin et/ou soir.",
      ingredient_base: "Actifs repulpants et lissants.",
      price: 85,
      stock: 15
    },
    {
      id: "lpg-creme-lissante-repulpante",
      name: "Crème lissante repulpante",
      category: "Visage",
      volume: "50ml",
      desc: "Crème lissante qui comble les rides et restaure les volumes du visage.",
      long_desc: "Cette crème lissante repulpante, au toucher onctueux, comble les rides et restaure les volumes du visage. La peau est visiblement plus lisse, plus ferme et plus rebondie.",
      usage: "Appliquer matin et/ou soir sur visage et cou.",
      ingredient_base: "Actifs repulpants et volumisants.",
      price: 92,
      stock: 15
    },
    {
      id: "lpg-gel-creme-lissante-repulpante",
      name: "Gel-crème lissante repulpante",
      category: "Visage",
      volume: "50ml",
      desc: "Gel-crème fondant qui lisse les rides et repulpe la peau avec légèreté.",
      long_desc: "Ce gel-crème fondant lisse les rides et repulpe la peau avec légèreté. Sa texture fraîche et hydratante pénètre rapidement pour offrir confort, souplesse et un teint visiblement plus jeune.",
      usage: "Appliquer matin et/ou soir sur visage et cou.",
      ingredient_base: "Actifs lissants et hydratants.",
      price: 92,
      stock: 15
    },
    {
      id: "lpg-soin-regard",
      name: "Soin regard",
      category: "Visage",
      volume: "15ml",
      desc: "Soin complet qui cible rides, cernes et poches pour un contour de l'œil plus jeune.",
      long_desc: "Ce soin regard complet cible rides, cernes et poches pour un contour de l'œil visiblement plus jeune. Sa texture délicate pénètre en douceur, offrant confort, fermeté et fraîcheur.",
      usage: "Tapoter délicatement autour des yeux matin et soir.",
      ingredient_base: "Actifs anti-âge du regard.",
      price: 62,
      stock: 20
    },
    {
      id: "lpg-serum-lift-raffermissant",
      name: "Sérum lift raffermissant",
      category: "Visage",
      volume: "30ml",
      desc: "Sérum raffermissant qui neutralise la glycation, stimule le collagène et redonne élasticité.",
      long_desc: "Ce sérum raffermissant neutralise la glycation, stimule le collagène et redonne élasticité à la peau. L'effet liftant est visible, le teint est éclatant, la fermeté renforcée.",
      usage: "Appliquer quelques gouttes avant la crème lift, matin et/ou soir.",
      ingredient_base: "Actifs anti-glycation et pro-collagène.",
      price: 94,
      stock: 15
    },
    {
      id: "lpg-creme-lift-raffermissante",
      name: "Crème lift raffermissante",
      category: "Visage",
      volume: "50ml",
      desc: "Crème liftante haute performance au maillage biomimétique qui lifte, repulpe et redessine l'ovale.",
      long_desc: "Sa formule avancée anti-relâchement, au maillage biomimétique, lifte, repulpe et diffuse ses actifs tout au long de la journée. La peau retrouve fermeté, densité et un contour redessiné.",
      usage: "Appliquer matin et/ou soir sur visage et cou.",
      ingredient_base: "Maillage biomimétique, actifs liftants.",
      price: 89,
      stock: 15
    },
    {
      id: "lpg-masque-v-lift",
      name: "Masque V-lift raffermissant",
      category: "Visage",
      volume: "1 pièce",
      desc: "Masque V-lift qui sculpte l'ovale, tonifie et redonne fermeté en quelques minutes.",
      long_desc: "Ce masque V-lift raffermissant sculpte l'ovale, tonifie et redonne fermeté à la peau. En quelques minutes, le visage paraît plus net, plus lifté et visiblement plus jeune.",
      usage: "Poser sur le visage pendant 15-20 minutes.",
      ingredient_base: "Actifs raffermissants et sculptants.",
      price: 15,
      stock: 40
    },
    {
      id: "lpg-fluide-uv-defense",
      name: "Fluide UV défense cellulaire",
      category: "Visage",
      volume: "30ml",
      desc: "Fluide SPF 50+ offrant une défense complète contre UVA, UVB et lumière bleue, tout en prévenant rides et taches.",
      long_desc: "Ce fluide SPF 50+ offre une défense complète contre UVA, UVB et lumière bleue, tout en prévenant et corrigeant rides et taches. Sa texture fluide et invisible pénètre en un instant pour un confort quotidien et une protection anti-âge avancée.",
      usage: "Appliquer le matin avant l'exposition au soleil. Renouveler en cours de journée.",
      ingredient_base: "Filtres solaires SPF 50+, actifs anti-âge.",
      price: 49,
      stock: 30
    },
    // --- Compléments alimentaires ---
    {
      id: "lpg-acide-hyaluronique",
      name: "Acide hyaluronique",
      category: "Compléments alimentaires",
      volume: "30 gélules",
      desc: "Formule à spectre complet de poids moléculaires pour hydrater la peau de l'intérieur.",
      long_desc: "Cette formule à spectre complet de poids moléculaires (50–3 000 kDa) nourrit la structure cutanée, stimule le renouvellement cellulaire et préserve la souplesse de l'épiderme. Produite par biotechnologie, pour une beauté durable et naturelle.",
      usage: "Prendre 1 gélule par jour avec un verre d'eau.",
      ingredient_base: "Acide hyaluronique biotechnologique.",
      price: 41.50,
      stock: 30
    },
    {
      id: "lpg-omega-3-6-9",
      name: "Oméga 3-6-9",
      category: "Compléments alimentaires",
      volume: "30 gélules",
      desc: "Huile de Sacha Inchi concentrée à 93% en oméga bénéfiques pour renforcer la tonicité de la peau.",
      long_desc: "Issu de l'huile de Sacha Inchi, concentré à 93 % en oméga bénéfiques, ce complément renforce la tonicité, nourrit la peau et participe à la formation des membranes cellulaires. Un soin beauté intérieur.",
      usage: "Prendre 1 gélule par jour avec un repas.",
      ingredient_base: "Huile de Sacha Inchi, oméga 3-6-9.",
      price: 41.50,
      stock: 30
    },
    {
      id: "lpg-booster-vitalite",
      name: "Booster de vitalité",
      category: "Compléments alimentaires",
      volume: "30 gélules",
      desc: "Soutient le métabolisme énergétique, réduit la fatigue et renforce les capacités physiques et mentales.",
      long_desc: "Ce booster soutient le métabolisme énergétique, réduit la fatigue, renforce les capacités physiques et mentales et participe au bon fonctionnement du système immunitaire. Un allié bien-être pour une peau rayonnante de vitalité.",
      usage: "Prendre 1 gélule par jour le matin.",
      ingredient_base: "Actifs énergétiques et immunitaires.",
      price: 41.50,
      stock: 25
    },
    {
      id: "lpg-capteur-sos",
      name: "Capteur SOS petits écarts",
      category: "Compléments alimentaires",
      volume: "30 gélules",
      desc: "Capteur de graisses et de sucres qui limite leur stockage et favorise leur élimination naturelle.",
      long_desc: "Ce capteur de graisses et de sucres, formulé à partir de superaliments neutralisants, limite leur stockage et favorise leur élimination naturelle. Un allié malin pour garder la ligne tout en se faisant plaisir.",
      usage: "Prendre 1 à 2 gélules après un repas riche.",
      ingredient_base: "Superaliments neutralisants.",
      price: 23,
      stock: 30
    },
    {
      id: "lpg-the-bio-minceur",
      name: "Thé bio minceur",
      category: "Compléments alimentaires",
      volume: "14 sachets",
      desc: "Assemblage de plantes bio brûle-graisses, accompagne la perte de poids et draine le corps.",
      long_desc: "Cet assemblage de plantes bio brûle les graisses, accompagne la perte de poids et draine le corps. Idéal en complément des soins endermologie, pour une silhouette plus légère et une sensation de bien-être quotidien.",
      usage: "Infuser 1 sachet par jour, de préférence le matin.",
      ingredient_base: "Plantes bio minceur.",
      price: 26,
      stock: 25
    },
    {
      id: "lpg-concentre-drainant",
      name: "Concentré drainant",
      category: "Compléments alimentaires",
      volume: "500ml",
      desc: "Goût cassis. Lutte contre la rétention d'eau et active les fonctions d'élimination.",
      long_desc: "Au goût cassis délicieux, ce concentré drainant lutte contre la rétention d'eau et les tissus engorgés, active les fonctions d'élimination et améliore la circulation. Une cure légèreté pour un corps plus délogé et une peau plus tonique.",
      usage: "Diluer 1 dose par jour dans un grand verre d'eau.",
      ingredient_base: "Extraits de plantes drainantes, goût cassis.",
      price: 41,
      stock: 20
    },
    {
      id: "lpg-stop-peau-orange",
      name: "Stop peau d'orange",
      category: "Compléments alimentaires",
      volume: "14 sachets",
      desc: "Poudre goût pêche-melon qui lutte contre les capitons et soutient le drainage.",
      long_desc: "Cette poudre goût pêche-melon, en dose quotidienne, lutte contre les capitons, soutient le drainage, brûle les graisses et aide au métabolisme lipidique. Un complément gourmand pour une silhouette plus lisse.",
      usage: "Diluer 1 sachet par jour dans un verre d'eau.",
      ingredient_base: "Actifs lipolytiques, arômes pêche-melon.",
      price: 55,
      stock: 20
    },
    {
      id: "lpg-collagene",
      name: "Collagène",
      category: "Compléments alimentaires",
      volume: "14 sachets",
      desc: "Poudre chocolat-noisette aux peptides de collagène marin français et élastine pour un anti-âge global.",
      long_desc: "Cette poudre chocolat-noisette, sans sucres ni matières grasses, associe peptides de collagène marin français et élastine. Prouvée cliniquement, elle soutient la fermeté et la jeunesse de la peau pour un anti-âge global.",
      usage: "Diluer 1 sachet par jour dans un boisson froide ou tiède.",
      ingredient_base: "Peptides de collagène marin français, élastine.",
      price: 46,
      stock: 20
    },
    {
      id: "lpg-reducteur-appetit",
      name: "Réducteur d'appétit",
      category: "Compléments alimentaires",
      volume: "30 gélules",
      desc: "Augmente les sensations de satiété et soutient l'équilibre émotionnel pour la gestion du poids.",
      long_desc: "Ce complément augmente les sensations de satiété, aide à la gestion du poids et soutient l'équilibre émotionnel. Idéal en complément d'une cure endermologie pour des résultats minceur optimisés.",
      usage: "Prendre 1 à 2 gélules avant les repas.",
      ingredient_base: "Actifs satiétants naturels.",
      price: 55,
      stock: 20
    },
    {
      id: "lpg-concentre-brule-graisses",
      name: "Concentré brûle-graisses",
      category: "Compléments alimentaires",
      volume: "500ml",
      desc: "Enrichi en Coléus forskohlii pour favoriser le déstockage des graisses et le métabolisme des acides gras.",
      long_desc: "Enrichi en Coléus forskohlii, ce concentré associe plantes lipolytiques et oligo-éléments pour favoriser le déstockage des graisses et le métabolisme normal des acides gras. Un allié minceur pour une silhouette affinée.",
      usage: "Diluer 1 dose par jour dans un grand verre d'eau.",
      ingredient_base: "Coléus forskohlii, plantes lipolytiques, oligo-éléments.",
      price: 44,
      stock: 20
    },
    // --- Textile ---
    {
      id: "lpg-corsaire-sculptant",
      name: "Corsaire sculptant anticellulite",
      category: "Textile",
      volume: "1 unité",
      desc: "Corsaire micromassant à porter 20 nuits, diffuse des actifs minceur et anticellulite pendant le sommeil.",
      long_desc: "Ce corsaire micromassant, à porter 20 nuits, diffuse des actifs cosmétiques minceur et anticellulite pour lisser la peau et affiner durablement la silhouette. Un textile de beauté qui travaille pendant votre sommeil.",
      usage: "Porter la nuit pendant 20 nuits consécutives.",
      ingredient_base: "Textile cosmétique microencapsulé.",
      price: 49.99,
      stock: 15
    },
    {
      id: "lpg-panty-minceur",
      name: "Panty minceur ventre plat",
      category: "Textile",
      volume: "1 unité",
      desc: "Panty gainant qui diffuse des actifs minceur pour un ventre plus plat. Résultats visibles dès 10 jours.",
      long_desc: "Ce panty gainant diffuse des actifs minceur pour un ventre plus plat et une silhouette redessinée. Résultats visibles dès 10 jours, confort optimal et discrétion assurée au quotidien.",
      usage: "Porter quotidiennement pendant 10 jours minimum.",
      ingredient_base: "Textile cosmétique microencapsulé.",
      price: 49.99,
      stock: 15
    },
  ];

  return productsData.map((item) => ({
    slug: item.id,
    category: item.category,
    price: item.price,
    image: `/produits/${item.id}.webp`,
    volume: item.volume,
    stock: item.stock,
    translations: duplicateLocales({
      name: item.name,
      desc: item.desc,
      long_desc: item.long_desc,
      category: item.category,
      usage: item.usage,
      ingredient_base: item.ingredient_base,
    }),
    deliveryDays: { min: 3, max: 7 },
  }));
}

function buildProtocolesB2B(): { rituels: RituelB2B[]; fiches: FicheB2B[] } {
  const rituels: RituelB2B[] = [
    {
      slug: 'rituel-hydratation',
      reference: 'RC-HYD-002',
      category: 'Visage',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=400&fit=crop',
      theme: 'Hydratation & Éclat',
      ambiance: 'Zen & Cocooning',
      duration: '45 min',
      preparation: {
        cabine: ['Température : 22-24°C', 'Lumière tamisée ou bougies LED', "Diffusion d'huiles essentielles d'agrumes", 'Musique douce type spa'],
        materiel: ['Serviettes chaudes', 'Compresses tièdes', 'Bols pour préparations', 'Spatule et pinceau'],
        produits: [
          'Lait démaquillant',
          'Lotion tonique',
          'Gommage doux enzymatique',
          'Sérum hydratant',
          'Masque hydratation intense',
          'Crème confort',
        ],
      },
      deroulement: [
        {
          phase: 'Accueil & Installation',
          duree: '5 min',
          description: "Création de l'ambiance et mise en confiance",
          actions: [
            'Accueillir la cliente avec une tisane relaxante',
            'Expliquer le déroulement du rituel',
            'Installer confortablement sur la table de soin',
            'Placer des protections et bande à cheveux',
          ],
        },
        {
          phase: "Rituel d'Ouverture",
          duree: '3 min',
          description: 'Connexion et respiration',
          actions: [
            'Placer les mains sur les épaules',
            'Inviter à 3 respirations profondes',
            'Effectuer des pressions douces sur les épaules',
            'Créer une intention de détente',
          ],
        },
        {
          phase: 'Nettoyage Sensoriel',
          duree: '7 min',
          description: 'Démaquillage et purification',
          actions: [
            'Appliquer le lait démaquillant en mouvements enveloppants',
            'Retirer avec des compresses tièdes parfumées',
            'Vaporiser la lotion tonique en fine brume',
            'Sécher en tamponnant délicatement',
          ],
        },
        {
          phase: 'Exfoliation Lumière',
          duree: '8 min',
          description: "Gommage pour révéler l'éclat",
          actions: [
            'Appliquer le gommage enzymatique au pinceau',
            'Masser en mouvements circulaires doux',
            'Laisser poser 3-4 minutes',
            'Retirer avec des compresses humides',
          ],
        },
        {
          phase: 'Massage Hydratant',
          duree: '12 min',
          description: 'Massage profond du visage et décolleté',
          actions: [
            'Appliquer le sérum hydratant généreux',
            'Effectuer le massage drainant du décolleté',
            'Réaliser les manœuvres lissantes du visage',
            'Terminer par des pressions calmantes',
          ],
        },
        {
          phase: 'Pause Cocooning',
          duree: '10 min',
          description: 'Application du masque et relaxation',
          actions: [
            'Appliquer le masque hydratation en couche généreuse',
            'Placer des compresses fraîches sur les yeux',
            'Effectuer un massage des mains et bras',
            'Laisser la cliente se reposer',
          ],
        },
        {
          phase: 'Rituel de Fermeture',
          duree: '5 min',
          description: 'Retour en douceur et finalisation',
          actions: [
            'Retirer le masque délicatement',
            "Vaporiser une brume d'eau florale",
            'Appliquer la crème confort en effleurages',
            'Effectuer des pressions sur les points énergétiques',
          ],
        },
      ],
      retail: ['Crème hydratante format maison', 'Sérum hydratant voyage', 'Masque hydratation à faire chez soi'],
      notes: [
        'Adapter les textures selon le type de peau',
        'Maintenir un contact permanent avec la cliente',
        'Créer une ambiance olfactive personnalisée',
        'Proposer une tisane détox en fin de soin',
      ],
      translations: duplicateLocales({
        title: 'Rituel Hydratation Divine',
        introduction: "Un rituel dédié à l'hydratation profonde de la peau pour retrouver éclat et souplesse. Une expérience sensorielle complète.",
        theme: 'Hydratation & Éclat',
        ambiance: 'Zen & Cocooning',
        category: 'Visage',
        duration: '45 min',
        preparation: {
          cabine: ['Température : 22-24°C', 'Lumière tamisée ou bougies LED', "Diffusion d'huiles essentielles d'agrumes", 'Musique douce type spa'],
          materiel: ['Serviettes chaudes', 'Compresses tièdes', 'Bols pour préparations', 'Spatule et pinceau'],
          produits: [
            'Lait démaquillant',
            'Lotion tonique',
            'Gommage doux enzymatique',
            'Sérum hydratant',
            'Masque hydratation intense',
            'Crème confort',
          ],
        },
        deroulement: [
          {
            phase: 'Accueil & Installation',
            duree: '5 min',
            description: "Création de l'ambiance et mise en confiance",
            actions: [
              'Accueillir la cliente avec une tisane relaxante',
              'Expliquer le déroulement du rituel',
              'Installer confortablement sur la table de soin',
              'Placer des protections et bande à cheveux',
            ],
          },
          {
            phase: "Rituel d'Ouverture",
            duree: '3 min',
            description: 'Connexion et respiration',
            actions: [
              'Placer les mains sur les épaules',
              'Inviter à 3 respirations profondes',
              'Effectuer des pressions douces sur les épaules',
              'Créer une intention de détente',
            ],
          },
          {
            phase: 'Nettoyage Sensoriel',
            duree: '7 min',
            description: 'Démaquillage et purification',
            actions: [
              'Appliquer le lait démaquillant en mouvements enveloppants',
              'Retirer avec des compresses tièdes parfumées',
              'Vaporiser la lotion tonique en fine brume',
              'Sécher en tamponnant délicatement',
            ],
          },
          {
            phase: 'Exfoliation Lumière',
            duree: '8 min',
            description: "Gommage pour révéler l'éclat",
            actions: [
              'Appliquer le gommage enzymatique au pinceau',
              'Masser en mouvements circulaires doux',
              'Laisser poser 3-4 minutes',
              'Retirer avec des compresses humides',
            ],
          },
          {
            phase: 'Massage Hydratant',
            duree: '12 min',
            description: 'Massage profond du visage et décolleté',
            actions: [
              'Appliquer le sérum hydratant généreux',
              'Effectuer le massage drainant du décolleté',
              'Réaliser les manœuvres lissantes du visage',
              'Terminer par des pressions calmantes',
            ],
          },
          {
            phase: 'Pause Cocooning',
            duree: '10 min',
            description: 'Application du masque et relaxation',
            actions: [
              'Appliquer le masque hydratation en couche généreuse',
              'Placer des compresses fraîches sur les yeux',
              'Effectuer un massage des mains et bras',
              'Laisser la cliente se reposer',
            ],
          },
          {
            phase: 'Rituel de Fermeture',
            duree: '5 min',
            description: 'Retour en douceur et finalisation',
            actions: [
              'Retirer le masque délicatement',
              "Vaporiser une brume d'eau florale",
              'Appliquer la crème confort en effleurages',
              'Effectuer des pressions sur les points énergétiques',
            ],
          },
        ],
        retail: ['Crème hydratante format maison', 'Sérum hydratant voyage', 'Masque hydratation à faire chez soi'],
        notes: [
          'Adapter les textures selon le type de peau',
          'Maintenir un contact permanent avec la cliente',
          'Créer une ambiance olfactive personnalisée',
          'Proposer une tisane détox en fin de soin',
        ],
      }),
    },
  ];

  const fiches: FicheB2B[] = [
    {
      slug: 'masque-hydratation-intense',
      reference: 'FT-HYD-001',
      category: 'Soins Visage',
      extraction: 'Extrait de Rose des Sables',
      volume: '250ml (Format Pro)',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=400&fit=crop',
      description:
        'Un masque professionnel hautement concentré en actifs hydratants et régénérants. Conçu pour restaurer la barrière cutanée et apporter un confort immédiat aux peaux déshydratées.',
      proprietes: ['Hydratation longue durée (8h)', 'Restauration du film hydrolipidique', 'Apaisement immédiat', "Éclat du teint instantané"],
      actifs: [
        { nom: 'Acide Hyaluronique HPM', role: 'Hydratation de surface et lissage' },
        { nom: 'Extrait de Rose des Sables', role: "Auto-protection cellulaire et rétention d'eau" },
        { nom: 'Beurre de Karité Bio', role: 'Nutrition et protection de la barrière cutanée' },
        { nom: 'Vitamine E', role: 'Antioxydant et protection contre les radicaux libres' },
      ],
      utilisation: {
        frequence: '1 à 2 fois par semaine selon le diagnostic',
        methode: 'Appliquer en couche moyenne sur le visage et le cou parfaitement nettoyés. Éviter le contour des yeux.',
        temps: '10 à 15 minutes',
        retrait: "Retirer l'excédent avec un coton humide ou rincer à l'eau tiède.",
      },
      caracteristiques: {
        texture: 'Crème onctueuse et fraîche',
        odeur: 'Notes florales délicates',
        ph: '5.5 - 6.0',
        conservation: '12 mois après ouverture',
      },
      avis_experts:
        'Indispensable pour les rituels post-exposition solaire ou en cure d’attaque hivernale. Sa texture permet une pénétration optimale des actifs.',
      translations: duplicateLocales({
        title: 'Masque Hydratation Intense',
        description:
          'Un masque professionnel hautement concentré en actifs hydratants et régénérants. Conçu pour restaurer la barrière cutanée et apporter un confort immédiat aux peaux déshydratées.',
        category: 'Soins Visage',
        reference: 'FT-HYD-001',
        extraction: 'Extrait de Rose des Sables',
        volume: '250ml (Format Pro)',
        proprietes: ['Hydratation longue durée (8h)', 'Restauration du film hydrolipidique', 'Apaisement immédiat', "Éclat du teint instantané"],
        actifs: [
          { nom: 'Acide Hyaluronique HPM', role: 'Hydratation de surface et lissage' },
          { nom: 'Extrait de Rose des Sables', role: "Auto-protection cellulaire et rétention d'eau" },
          { nom: 'Beurre de Karité Bio', role: 'Nutrition et protection de la barrière cutanée' },
          { nom: 'Vitamine E', role: 'Antioxydant et protection contre les radicaux libres' },
        ],
        utilisation: {
          frequence: '1 à 2 fois par semaine selon le diagnostic',
          methode: 'Appliquer en couche moyenne sur le visage et le cou parfaitement nettoyés. Éviter le contour des yeux.',
          temps: '10 à 15 minutes',
          retrait: "Retirer l'excédent avec un coton humide ou rincer à l'eau tiède.",
        },
        caracteristiques: {
          texture: 'Crème onctueuse et fraîche',
          odeur: 'Notes florales délicates',
          ph: '5.5 - 6.0',
          conservation: '12 mois après ouverture',
        },
        avis_experts:
          'Indispensable pour les rituels post-exposition solaire ou en cure d’attaque hivernale. Sa texture permet une pénétration optimale des actifs.',
      }),
    },
  ];

  return { rituels, fiches };
}

function buildDownloadsB2B(): DownloadAssetB2B[] {
  const assets = [
    {
      slug: 'affiche-printemps-2025',
      type: 'image',
      category: 'PLV',
      format: 'JPG',
      size: '2.4 MB',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200',
      title: 'Affiche Promotionnelle Printemps 2025',
    },
    {
      slug: 'catalogue-2025',
      type: 'pdf',
      category: 'Catalogues',
      format: 'PDF',
      size: '15.2 MB',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200',
      title: 'Catalogue Produits 2025',
    },
    {
      slug: 'video-tutoriel-massage-visage',
      type: 'video',
      category: 'Formations',
      format: 'MP4',
      size: '45.8 MB',
      url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200',
      title: 'Vidéo Tutoriel Massage Visage',
    },
    {
      slug: 'banniere-web-anti-age',
      type: 'image',
      category: 'Digital',
      format: 'PNG',
      size: '1.2 MB',
      url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
      title: 'Bannière Web Anti-âge',
    },
    {
      slug: 'presentoir-comptoir',
      type: 'image',
      category: 'PLV',
      format: 'JPG',
      size: '3.1 MB',
      url: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200',
      title: 'Présentoir Comptoir',
    },
    {
      slug: 'guide-utilisation-produits',
      type: 'pdf',
      category: 'Documentation',
      format: 'PDF',
      size: '8.5 MB',
      url: 'https://images.unsplash.com/photo-1554224311-beee4ece8db7?w=1200',
      title: "Guide d'utilisation Produits",
    },
    {
      slug: 'post-instagram-nouveaute',
      type: 'image',
      category: 'Social Media',
      format: 'JPG',
      size: '0.8 MB',
      url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200',
      title: 'Post Instagram - Nouveauté',
    },
    {
      slug: 'flyer-promo-ete',
      type: 'pdf',
      category: 'PLV',
      format: 'PDF',
      size: '4.2 MB',
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
      title: 'Flyer Promotion Été',
    },
  ];

  return assets.map((a) => ({
    slug: a.slug,
    type: a.type as DownloadAssetB2B['type'],
    category: a.category,
    format: a.format,
    size: a.size,
    url: a.url,
    defaultLocale: 'fr',
    translations: duplicateLocales({
      title: a.title,
    }),
  }));
}

function buildBlogPosts(): BlogPost[] {
  const posts = [
    {
      slug: 'p1',
      image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '10 Dec 2024',
      readTime: '5 min',
      category: 'Soins naturels',
      author: { name: 'Sophie Martin', role: 'Experte en cosmetique naturelle', avatar: 'SM' },
      related: ['p2', 'p3'],
      title: "Les bienfaits de l'huile de jojoba pour votre peau",
      excerpt: "Decouvrez comment l'huile de jojoba peut transformer votre routine de soins et apporter eclat et hydratation a votre peau.",
      content: [
        "L'huile de jojoba est l'un des ingredients les plus precieux dans le monde de la cosmetique naturelle. Extraite des graines du jojoba, un arbuste originaire des deserts d'Amerique du Nord, cette huile possede des proprietes exceptionnelles qui en font un allie incontournable pour la beaute de la peau.",
        "Contrairement a la plupart des huiles vegetales, l'huile de jojoba est en realite une cire liquide dont la composition se rapproche etonnamment du sebum humain. Cette caracteristique unique lui permet d'etre parfaitement assimilee par la peau, sans laisser de film gras ni obstruer les pores.",
        "Les bienfaits de l'huile de jojoba sont nombreux. Elle hydrate en profondeur tout en regulant la production de sebum, ce qui la rend adaptee a tous les types de peau, y compris les peaux grasses et a tendance acneique. Ses proprietes anti-inflammatoires apaisent les irritations et les rougeurs.",
        "Riche en vitamines E et B, ainsi qu'en mineraux essentiels, l'huile de jojoba nourrit la peau et l'aide a lutter contre les signes du vieillissement. Elle forme egalement une barriere protectrice qui preserve l'hydratation naturelle de la peau.",
        "Pour integrer l'huile de jojoba dans votre routine, vous pouvez l'appliquer pure sur le visage et le corps, ou l'utiliser comme ingredient dans vos preparations maison. Quelques gouttes suffisent pour profiter de tous ses bienfaits.",
        "Chez Mey Beauty, nous avons fait de l'huile de jojoba l'un des piliers de nos formulations. Associee a notre expertise en soins professionnels, elle participe a l'efficacite de nos soins tout en respectant votre peau et l'environnement.",
      ],
    },
    {
      slug: 'p2',
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '5 Dec 2024',
      readTime: '7 min',
      category: 'Heritage',
      author: { name: 'Maria Santos', role: 'Ethnobotaniste', avatar: 'MS' },
      related: ['p1', 'p5'],
      title: "Rituels de beaute en institut: l'art du geste professionnel",
      excerpt: "Plongez dans l'univers des rituels de beaute professionnels et decouvrez les secrets d'une expertise transmise de generation en generation.",
      content: [
        "Le rituel de beaute en institut est un art a part entiere, fruit d'une expertise professionnelle transmise de generation en generation. Chaque geste, chaque pression, chaque technique est pensee pour repondre aux besoins specifiques de la peau et offrir une experience sensorielle unique.",
        "Parmi les techniques emblematiques des instituts de beaute, on trouve le modelage facial, le drainage lymphatique et les soins specifiques aux appareils haute technologie. Chacune de ces approaches possede des proprietes specifiques qui contribuent a la beaute et a la sante de la peau.",
        "Le modelage facial, par exemple, est utilise depuis des decennies pour ses vertus relaxantes et repulpantes. Realise avec des gestes precises et des pressions douces, il stimule la microcirculation, raffermit les tissus et redonne eclat et vitalite au visage.",
        "Le drainage lymphatique, technique douce et precise, est surnomme le \"geste anti-fatigue\" par les professionnels. Son action sur la circulation lymphatique en fait un puissant allie pour decongestionner les tissus et eliminer les toxines.",
        "Ces rituels professionnels ne se limitent pas aux techniques utilisees. Ils incluent egalement des moments particuliers dedies au bien-etre. Les professionnels de la beaute accordent une grande importance a l'ambiance, aux fragrances et a la relaxation, considerant que la beaute vient aussi de l'interieur.",
        "Chez Mey Beauty, nous nous inspirons de cette expertise professionnelle pour creer des soins qui respectent a la fois les traditions de l'institut et les besoins des peaux modernes. Chaque produit est une invitation a decouvrir les secrets de la beaute professionnelle.",
      ],
    },
    {
      slug: 'p3',
      image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '28 Nov 2024',
      readTime: '6 min',
      category: 'Conseils',
      author: { name: 'Claire Dubois', role: 'Dermatologue', avatar: 'CD' },
      related: ['p1', 'p4'],
      title: 'Comment choisir le bon soin pour votre type de peau',
      excerpt: 'Guide complet pour identifier votre type de peau et selectionner les produits les plus adaptes a vos besoins.',
      content: [
        "Choisir les bons soins pour sa peau peut sembler complique face a la multitude de produits disponibles. Pourtant, tout commence par une etape essentielle: identifier votre type de peau. Cette connaissance vous permettra de selectionner les produits les plus adaptes a vos besoins specifiques.",
        'Il existe quatre types de peau principaux: normale, seche, grasse et mixte. La peau normale est equilibree, ni trop grasse ni trop seche. La peau seche manque de sebum et a tendance a tiraillement. La peau grasse produit un exces de sebum et presente souvent des brillances. La peau mixte combine zones grasses et zones seches.',
        "Pour identifier votre type de peau, nettoyez votre visage et attendez une heure sans appliquer de soin. Observez ensuite votre peau: si elle brille sur l'ensemble du visage, elle est grasse. Si elle tire et presente des zones de secheresse, elle est seche. Si seule la zone T brille, elle est mixte.",
        'Une fois votre type de peau identifie, vous pouvez selectionner vos soins. Les peaux seches privilegieront les textures riches et nourrissantes. Les peaux grasses opteront pour des formules legeres et matifiantes. Les peaux mixtes pourront adapter leurs soins selon les zones du visage.',
        "N'oubliez pas que votre peau evolue au fil du temps et des saisons. Il est important de rester a l'ecoute de ses besoins et d'adapter votre routine en consequence. Un bilan regulier vous aidera a maintenir une peau en pleine sante.",
        "Chez Mey Beauty, nos experts sont a votre disposition pour vous guider dans le choix de vos soins. N'hesitez pas a nous contacter pour beneficier de conseils personnalises adaptes a votre type de peau.",
      ],
    },
    {
      slug: 'p4',
      image: 'https://images.pexels.com/photos/3756165/pexels-photo-3756165.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '20 Nov 2024',
      readTime: '4 min',
      category: 'Bien-etre',
      author: { name: 'Sophie Martin', role: 'Experte en cosmetique naturelle', avatar: 'SM' },
      related: ['p3', 'p6'],
      title: "L'importance de l'hydratation quotidienne",
      excerpt: 'Pourquoi hydrater sa peau chaque jour est essentiel et comment integrer cette habitude dans votre routine.',
      content: [
        "L'hydratation est la cle d'une peau saine et eclatante. Que votre peau soit seche, grasse ou mixte, elle a besoin d'eau pour fonctionner correctement et conserver sa beaute. Pourtant, l'hydratation reste souvent negligee dans les routines de soins.",
        'La peau est composee a 70% deau. Cette eau est essentielle pour maintenir lelasticite de la peau, assurer le renouvellement cellulaire et proteger contre les agressions exterieures. Une peau deshydratee perd de sa souplesse, parait terne et vieillit prematurement.',
        "L'hydratation de la peau se fait de deux manieres complementaires: de l'interieur, en buvant suffisamment d'eau, et de l'exterieur, en appliquant des soins hydratants. Les deux approches sont indispensables pour une hydratation optimale.",
        'Pour hydrater efficacement votre peau, commencez par boire au moins 1,5 litre deau par jour. Completez cette hydratation interne par lapplication quotidienne dun soin adapte a votre type de peau. Le matin, optez pour une creme legere. Le soir, privilegiez une formule plus riche.',
        "Les ingredients hydratants les plus efficaces sont l'acide hyaluronique, qui peut retenir jusqu'a 1000 fois son poids en eau, la glycerine, le beurre de karite et les huiles vegetales comme l'huile de jojoba ou d'argan.",
        'Chez Mey Beauty, nous formulons des soins hydratants a base dingredients naturels qui apportent a la peau leau dont elle a besoin tout au long de la journee. Nos formules combinent expertise professionnelle et efficacite moderne pour une hydratation optimale.',
      ],
    },
    {
      slug: 'p5',
      image: 'https://images.pexels.com/photos/3737579/pexels-photo-3737579.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '15 Nov 2024',
      readTime: '8 min',
      category: 'Ingredients',
      author: { name: 'Maria Santos', role: 'Ethnobotaniste', avatar: 'MS' },
      related: ['p1', 'p2'],
      title: 'Les ingredients stars de la cosmetique naturelle',
      excerpt: 'Focus sur les ingredients naturels les plus efficaces et leurs proprietes exceptionnelles pour votre peau.',
      content: [
        'La cosmetique naturelle connait un essor sans precedent, et pour cause: les ingredients issus de la nature offrent des bienfaits exceptionnels pour la peau, sans les effets indesirables des molecules de synthese. Decouvrez les stars de la beaute naturelle.',
        "L'aloe vera est sans doute l'ingredient naturel le plus connu. Cette plante grasse contient plus de 200 composants actifs qui hydratent, apaisent et reparent la peau. Elle est particulierement recommandee pour les peaux sensibles et irritees.",
        'Le beurre de karite, issu du karite dAfrique, est un tresor de nutrition pour la peau. Riche en vitamines A, E et F, il nourrit intensement, protege et regenere les peaux les plus seches. Il est egalement excellent pour les cheveux.',
        "L'huile d'argan, appelee \"or liquide du Maroc\", est reconnue pour ses proprietes anti-age exceptionnelles. Sa richesse en antioxydants et en acides gras essentiels en fait un soin precieux pour lutter contre le vieillissement cutane.",
        'Le the vert est un puissant antioxydant qui protege la peau des radicaux libres responsables du vieillissement premature. Il possede egalement des proprietes anti-inflammatoires et antibacteriennes.',
        'Chez Mey Beauty, nous associons ces ingredients universels a notre expertise en cosmetique professionnelle pour creer des formules uniques et efficaces. Chaque produit est le fruit dune selection rigoureuse des meilleurs ingredients naturels.',
      ],
    },
    {
      slug: 'p6',
      image: 'https://images.pexels.com/photos/3762874/pexels-photo-3762874.jpeg?auto=compress&cs=tinysrgb&w=1600',
      date: '10 Nov 2024',
      readTime: '5 min',
      category: 'Routines',
      author: { name: 'Claire Dubois', role: 'Dermatologue', avatar: 'CD' },
      related: ['p4', 'p3'],
      title: 'Routine du soir: les etapes essentielles',
      excerpt: 'Decouvrez la routine du soir ideale pour preparer votre peau au renouvellement cellulaire nocturne.',
      content: [
        "La routine du soir est un moment crucial pour la beaute de votre peau. Pendant la nuit, votre peau se regenere et se repare. En adoptant les bons gestes avant le coucher, vous optimisez ce processus naturel et vous vous reveillez avec une peau reposee et eclatante.",
        "La premiere etape, et la plus importante, est le demaquillage. Meme si vous ne vous etes pas maquillee, cette etape permet d'eliminer les impuretes et les polluants accumules tout au long de la journee. Utilisez une huile ou un lait demaquillant doux.",
        'Apres le demaquillage, procedez au nettoyage. Cette double cleansing, comme lappellent les experts, assure une peau parfaitement propre. Choisissez un nettoyant adapte a votre type de peau: gel moussant pour les peaux grasses, lait ou creme pour les peaux seches.',
        "L'etape suivante est l'application d'un tonique ou d'une lotion. Ce soin permet de retablir le pH de la peau et de la preparer a recevoir les soins suivants. Appliquez-le avec un coton ou directement avec les mains.",
        'Terminez votre routine par lapplication dun serum et dune creme de nuit. Le serum, concentre en actifs, cible des problematiques specifiques. La creme de nuit, plus riche que celle du jour, nourrit et repare la peau pendant votre sommeil.',
        "Chez Mey Beauty, nous avons concu une gamme complete pour votre rituel du soir. Nos soins travaillent en synergie pour offrir a votre peau tout ce dont elle a besoin pour se regenerer pendant la nuit.",
      ],
    },
  ];

  return posts.map((p) => ({
    slug: p.slug,
    image: p.image,
    date: p.date,
    readTime: p.readTime,
    category: p.category,
    related: p.related,
    author: p.author,
    translations: duplicateLocales({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
    }),
  }));
}

// function buildRituals(): Ritual[] {
//   const r = frLocale.b2c.rituals.items;
//   type RitualKey = keyof typeof r;
//   const list: { slug: string; key: RitualKey; image: string; products: string[] }[] = [
//     { slug: 'morning', key: 'morning', image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800', products: ['SC-SE-150', 'SC-AN-000'] },
//     { slug: 'evening', key: 'evening', image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800', products: ['SC-CH-150', 'SC-AN-000'] },
//     { slug: 'weekly', key: 'weekly', image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=800', products: ['SC-SE-150', 'SC-CH-150', 'SC-EN-000'] },
//     { slug: 'detox', key: 'detox', image: 'https://images.pexels.com/photos/3756165/pexels-photo-3756165.jpeg?auto=compress&cs=tinysrgb&w=800', products: ['SC-SE-150', 'SC-EN-000'] },
//   ];

//   return list.map((item) => {
//     const data = r[item.key];
//     return {
//       slug: item.slug,
//       image: item.image,
//       products: item.products,
//       translations: duplicateLocales({
//         title: data.title,
//         subtitle: data.subtitle,
//         description: data.desc,
//         duration: data.duration,
//         difficulty: data.difficulty,
//         full_desc: data.full_desc ?? data.desc,
//         steps: (data.steps || []).map((s) => ({ name: s.name, desc: s.desc })),
//         tips: data.tips || [],
//       }),
//     };
//   });
// }

// function buildPodcasts(): Podcast[] {
//   const p = frLocale.b2c.podcast;
//   type PodcastKey = keyof typeof p.episodes;
//   const episodes: { slug: string; key: PodcastKey; duration: string; date: string; image: string; guest: string }[] = [
//     {
//       slug: 'e1',
//       key: 'e1',
//       duration: '45 min',
//       date: '10 Dec 2024',
//       image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Dr. Maria Santos',
//     },
//     {
//       slug: 'e2',
//       key: 'e2',
//       duration: '38 min',
//       date: '3 Dec 2024',
//       image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Sophie Durand',
//     },
//     {
//       slug: 'e3',
//       key: 'e3',
//       duration: '52 min',
//       date: '26 Nov 2024',
//       image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Jean-Pierre Martin',
//     },
//     {
//       slug: 'e4',
//       key: 'e4',
//       duration: '48 min',
//       date: '19 Nov 2024',
//       image: 'https://images.pexels.com/photos/3756165/pexels-photo-3756165.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Amelia Chen',
//     },
//     {
//       slug: 'e5',
//       key: 'e5',
//       duration: '42 min',
//       date: '12 Nov 2024',
//       image: 'https://images.pexels.com/photos/3737579/pexels-photo-3737579.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Dr. Claire Dubois',
//     },
//     {
//       slug: 'e6',
//       key: 'e6',
//       duration: '35 min',
//       date: '5 Nov 2024',
//       image: 'https://images.pexels.com/photos/3762874/pexels-photo-3762874.jpeg?auto=compress&cs=tinysrgb&w=800',
//       guest: 'Yuki Tanaka',
//     },
//   ];

//   return episodes.map((ep) => {
//     const data = p.episodes[ep.key];
//     return {
//       slug: ep.slug,
//       image: ep.image,
//       date: ep.date,
//       duration: ep.duration,
//       guest: ep.guest,
//       translations: duplicateLocales({
//         title: data.title,
//         description: data.description,
//         guest_title: data.guest_title,
//       }),
//     };
//   });
// }

// async function createTestUsers() {
//   if (!adminAuth) {
//     throw new Error('Admin Auth not configured');
//   }

//   const users = [
//     {
//       email: 'client@meybeauty.com',
//       password: 'ClientMey Beauty2025!',
//       role: 'b2c',
//       displayName: 'Client Test B2C',
//     },
//     {
//       email: 'pro@meybeauty.com',
//       password: 'ProMey Beauty2025!',
//       role: 'b2b',
//       displayName: 'Professionnel Test B2B',
//     },
//   ];

//   const createdUsers = [];

//   for (const userData of users) {
//     try {
//       // Vérifier si l'utilisateur existe déjà
//       let userRecord;
//       try {
//         userRecord = await adminAuth.getUserByEmail(userData.email);
//         console.log(`User ${userData.email} already exists, skipping creation`);
//       } catch (error: any) {
//         if (error.code === 'auth/user-not-found') {
//           // Créer l'utilisateur dans Firebase Auth
//           userRecord = await adminAuth.createUser({
//             email: userData.email,
//             password: userData.password,
//             displayName: userData.displayName,
//             emailVerified: true,
//           });
//           console.log(`Created user: ${userData.email} with UID: ${userRecord.uid}`);
//         } else {
//           throw error;
//         }
//       }

//       // Créer/mettre à jour le document dans Firestore
//       if (userRecord) {
//         const userDoc: any = {
//           email: userData.email,
//           role: userData.role,
//           displayName: userData.displayName,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//         };

//         // Ajouter des champs spécifiques pour le B2B
//         if (userData.role === 'b2b') {
//           userDoc.validated = true; // Compte validé automatiquement pour les tests
//           userDoc.remise = 15; // Remise pro de 15%
//           userDoc.societe = 'Société Test B2B';
//           userDoc.siret = '12345678901234';
//           userDoc.nom = 'Test';
//           userDoc.prenom = 'Pro';
//         }

//         await adminDb?.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
//         console.log(`Created/updated Firestore document for ${userData.email}`);

//         createdUsers.push({
//           uid: userRecord.uid,
//           email: userData.email,
//           role: userData.role,
//         });
//       }
//     } catch (error: any) {
//       console.error(`Error creating user ${userData.email}:`, error.message);
//       // Continue avec les autres utilisateurs même en cas d'erreur
//     }
//   }

//   return createdUsers;
// }

async function createAdminUser() {
  const adminEmail = 'admin@meybeauty.fr';
  const adminPassword = 'Mey Beauty@1234';

  if (!adminAuth || !adminDb) {
    throw new Error('Admin Auth or Admin DB not configured');
  }

  try {
    // Check if user already exists in Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(adminEmail);
      console.log('Admin user already exists in Auth');
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'auth/user-not-found') {
        // Create user in Auth
        userRecord = await adminAuth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'Admin Mey Beauty',
        });
        console.log('Admin user created in Auth');
      } else {
        throw e;
      }
    }

    // Ensure profile exists in Firestore with admin role
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      await userRef.set({
        email: adminEmail,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Mey Beauty',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      console.log('Admin profile created/updated in Firestore');
    }

    return userRecord;
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    throw error;
  }
}

export async function POST() {
  if (!ENABLE_SEED) {
    return NextResponse.json({ ok: false, error: 'Seed disabled' }, { status: 403 });
  }

  try {
    const db = adminDb;
    if (!db) {
      return NextResponse.json({ ok: false, error: 'Admin not configured' }, { status: 500 });
    }

    // Créer les utilisateurs de test
    // console.log('Creating test users...');
    // const testUsers = await createTestUsers();
    // console.log(`Created ${testUsers.length} test users`);

    // Créer l'administrateur par défaut
    console.log('Creating default admin...');
    await createAdminUser();

    const batch = db.batch();
    const b2bData = buildProtocolesB2B();
    const downloads = buildDownloadsB2B();

    // Products (B2C & B2B shared collection)
    const products = buildProducts();
    for (const prod of products) {
      const ref = db.collection('products').doc(prod.slug);
      batch.set(ref, {
        slug: prod.slug,
        category: prod.category,
        price: prod.price,
        image: prod.image,
        volume: prod.volume,
        stock: prod.stock,
        translations: prod.translations,
        usage: prod.translations.fr.usage || "",
        ingredient_base: prod.translations.fr.ingredient_base || "",
        deliveryDays: { min: 4, max: 10 }
      });
    }

    // Blog posts
    for (const post of buildBlogPosts()) {
      const ref = db.collection('blogPosts').doc(post.slug);
      batch.set(ref, {
        slug: post.slug,
        image: post.image,
        date: post.date,
        readTime: post.readTime,
        category: post.category,
        related: post.related,
        author: post.author,
        defaultLocale: 'fr',
        translations: post.translations,
      });
    }

    // Rituals
    // for (const ritual of buildRituals()) {
    //   const ref = db.collection('rituals').doc(ritual.slug);
    //   batch.set(ref, {
    //     slug: ritual.slug,
    //     image: ritual.image,
    //     products: ritual.products,
    //     defaultLocale: 'fr',
    //     translations: ritual.translations,
    //   });
    // }

    // // Podcasts
    // for (const pod of buildPodcasts()) {
    //   const ref = db.collection('podcasts').doc(pod.slug);
    //   batch.set(ref, {
    //     slug: pod.slug,
    //     image: pod.image,
    //     date: pod.date,
    //     duration: pod.duration,
    //     guest: pod.guest,
    //     defaultLocale: 'fr',
    //     translations: pod.translations,
    //   });
    // }

    // B2B Rituels détaillés
    for (const rituel of b2bData.rituels) {
      const ref = db.collection('rituelsB2B').doc(rituel.slug);
      batch.set(ref, {
        slug: rituel.slug,
        reference: rituel.reference,
        category: rituel.category,
        image: rituel.image,
        theme: rituel.theme,
        ambiance: rituel.ambiance,
        duration: rituel.duration,
        preparation: rituel.preparation,
        deroulement: rituel.deroulement,
        retail: rituel.retail,
        notes: rituel.notes,
        defaultLocale: 'fr',
        translations: rituel.translations,
      });
    }

    // B2B Fiches techniques
    for (const fiche of b2bData.fiches) {
      const ref = db.collection('fichesTechniquesB2B').doc(fiche.slug);
      batch.set(ref, {
        slug: fiche.slug,
        reference: fiche.reference,
        category: fiche.category,
        extraction: fiche.extraction,
        volume: fiche.volume,
        image: fiche.image,
        description: fiche.description,
        proprietes: fiche.proprietes,
        actifs: fiche.actifs,
        utilisation: fiche.utilisation,
        caracteristiques: fiche.caracteristiques,
        avis_experts: fiche.avis_experts,
        defaultLocale: 'fr',
        translations: fiche.translations,
      });
    }

    // B2B Téléchargements (assets)
    for (const asset of downloads) {
      const ref = db.collection('downloadsB2B').doc(asset.slug);
      batch.set(ref, {
        slug: asset.slug,
        type: asset.type,
        category: asset.category,
        format: asset.format,
        size: asset.size,
        url: asset.url,
        defaultLocale: asset.defaultLocale || 'fr',
        translations: asset.translations,
      });
    }

    await batch.commit();
    return NextResponse.json({
      ok: true,
      message: 'Seed completed successfully',
      // users: testUsers,
    });
  } catch (error: unknown) {
    console.error('Seed error', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
