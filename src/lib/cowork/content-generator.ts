/**
 * cowork/content-generator — Génération de contenu marketing
 *
 * ⚠️  SERVER-ONLY
 *
 * Génère des posts Instagram/LinkedIn à partir des données d'un
 * projet, produit ou article. Utilise l'API Anthropic Claude si
 * ANTHROPIC_API_KEY est configurée, sinon tombe sur des templates.
 */

import { createClient }              from '@/lib/supabase/server';
import type { ContentGenerationRequest, CoworkTaskInsert } from './types';

// ─── Hashtags par catégorie ───────────────────────────────────────────────────

const HASHTAGS: Record<string, string[]> = {
  architecture: [
    '#architectureinterieure', '#interiordesign', '#design', '#architecte',
    '#decoration', '#interieur', '#cotonou', '#benin', '#afriqueoccidentale',
    '#mathieuandco', '#studiodesign', '#homedesign',
  ],
  decoration: [
    '#decoration', '#deco', '#homedesign', '#interiordesign', '#homestyle',
    '#decointerieure', '#designcontemporain', '#africandecor', '#mathieuandco',
    '#instadeco', '#maison', '#interieur',
  ],
  boutique: [
    '#designboutique', '#homedecor', '#shopping', '#mobilier', '#designafricain',
    '#artisanat', '#madeinbenin', '#africandesign', '#mathieuandco', '#decoration',
  ],
  projet: [
    '#projet', '#realization', '#beforeafter', '#transformation', '#renovation',
    '#interieurdesign', '#architectureinterieure', '#benin', '#mathieuandco',
  ],
};

function pickHashtags(categorie: string | null | undefined, count = 8): string[] {
  const pool = HASHTAGS[categorie ?? 'architecture'] ?? HASHTAGS['architecture'];
  return pool.slice(0, count);
}

// ─── Template-based generation ────────────────────────────────────────────────

interface ProjectData {
  titre:       string;
  sous_titre?: string | null;
  description?: string | null;
  categorie?:  string | null;
  lieu?:       string | null;
  ville?:      string | null;
  annee?:      number | null;
  surface_m2?: number | null;
  image_principale?: string | null;
}

interface ProduitData {
  nom:         string;
  description_courte?: string | null;
  prix:        number;
  categorie_id?:string | null;
  images?:     unknown;
}

interface ArticleData {
  titre:       string;
  extrait?:    string | null;
  categorie?:  string | null;
  image_principale?: string | null;
}

function generateFromTemplate(
  data:     ProjectData | ProduitData | ArticleData,
  type:     'projet' | 'produit' | 'article',
  platform: 'instagram' | 'linkedin',
  tone:     string,
): string {
  const isLinkedIn = platform === 'linkedin';

  if (type === 'projet') {
    const p = data as ProjectData;
    const lieu = p.lieu ?? p.ville ?? 'Cotonou';
    const surface = p.surface_m2 ? `${p.surface_m2} m²` : '';

    if (isLinkedIn) {
      return `✨ Nouvelle réalisation Mathieu&Co Studio

${p.titre}${p.sous_titre ? ` — ${p.sous_titre}` : ''}

${p.description ? `${p.description.slice(0, 200)}…` : `Un projet d'${p.categorie ?? 'architecture intérieure'} pensé dans ses moindres détails.`}

📍 ${lieu}${surface ? ` · ${surface}` : ''}${p.annee ? ` · ${p.annee}` : ''}

Notre équipe a travaillé sur chaque élément pour créer un espace qui reflète parfaitement la vision de notre client : des matériaux soigneusement sélectionnés, des volumes repensés, et une atmosphère unique.

Découvrez l'ensemble du projet sur notre site web.

👉 mathieu-co.studio/galerie/${encodeURIComponent(p.titre.toLowerCase().replace(/\s+/g, '-'))}

#MathieuCo #ArchitectureIntérieure #Design #${lieu.replace(/\s+/g, '')} #Bénin`;
    }

    // Instagram
    return `${p.categorie === 'decoration' ? '🪴' : '🏛️'} ${p.titre}

${p.sous_titre ?? `Un espace pensé pour durer.`}

${p.description?.slice(0, 180) ?? `De la conception à la livraison — chaque détail compte.`}

📍 ${lieu}${surface ? ` · ${surface}` : ''}

${pickHashtags(p.categorie).join(' ')}`;
  }

  if (type === 'produit') {
    const p = data as ProduitData;
    const prix = `${p.prix.toLocaleString('fr-FR')} FCFA`;

    if (isLinkedIn) {
      return `🛍️ Boutique Mathieu&Co — Nouvelle pièce disponible

${p.nom}

${p.description_courte ?? 'Une pièce soigneusement sélectionnée pour enrichir votre intérieur.'}

Prix : ${prix}
Livraison disponible au Bénin et en Afrique de l'Ouest.

👉 mathieu-co.studio/boutique

#BoutiqueDesign #Décoration #MathieuCo #Bénin #DesignAfricain`;
    }

    return `✨ Nouveauté boutique

${p.nom}

${p.description_courte ?? 'Une pièce d\'exception pour votre intérieur.'}

💰 ${prix}
📦 Livraison partout en Afrique de l'Ouest

Disponible sur mathieu-co.studio/boutique 🛒

${pickHashtags('boutique').join(' ')}`;
  }

  // Article
  const a = data as ArticleData;
  if (isLinkedIn) {
    return `📖 Journal Design — Mathieu&Co Studio

${a.titre}

${a.extrait ?? 'Un nouvel article sur notre approche du design intérieur en Afrique de l\'Ouest.'}

Lire l'article complet sur notre blog :
👉 mathieu-co.studio/blog

#JournalDesign #Architecture #MathieuCo #Design`;
  }

  return `📖 Nouvel article

"${a.titre}"

${a.extrait?.slice(0, 150) ?? 'Architecture, décoration et tendances design depuis Cotonou.'}…

Lire sur le blog → mathieu-co.studio/blog

${pickHashtags(a.categorie).join(' ')}`;
}

// ─── Claude API generation ────────────────────────────────────────────────────

async function generateWithClaude(
  prompt: string,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ─── generateContent ──────────────────────────────────────────────────────────

export async function generateContent(
  req: ContentGenerationRequest,
): Promise<CoworkTaskInsert[]> {
  const supabase  = await createClient();
  const { source_type, source_slug, platform, tone = 'inspire', language = 'fr' } = req;
  const tasks: CoworkTaskInsert[] = [];

  // Fetch source data
  let sourceData: ProjectData | ProduitData | ArticleData | null = null;
  let titre = '';
  let images: string[] = [];
  let sourceId: string | null = null;

  if (source_type === 'projet') {
    const { data } = await supabase
      .from('projets')
      .select('id, titre, sous_titre, description, categorie, lieu, ville, annee, surface_m2, image_principale')
      .eq('slug', source_slug)
      .maybeSingle();

    if (!data) throw new Error(`Projet introuvable : ${source_slug}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = data as any;
    sourceData = p;
    titre = p.titre;
    sourceId = p.id;
    if (p.image_principale) images.push(p.image_principale as string);

  } else if (source_type === 'produit') {
    const { data } = await supabase
      .from('produits')
      .select('id, nom, description_courte, prix, images')
      .eq('slug', source_slug)
      .maybeSingle();

    if (!data) throw new Error(`Produit introuvable : ${source_slug}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = data as any;
    sourceData = p;
    titre = p.nom;
    sourceId = p.id;

  } else if (source_type === 'article_blog') {
    const { data } = await supabase
      .from('articles_blog')
      .select('id, titre, extrait, categorie, image_principale')
      .eq('slug', source_slug)
      .maybeSingle();

    if (!data) throw new Error(`Article introuvable : ${source_slug}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = data as any;
    sourceData = a;
    titre = a.titre;
    sourceId = a.id;
    if (a.image_principale) images.push(a.image_principale);
  }

  if (!sourceData) throw new Error('Source de contenu introuvable');

  // Plateformes à cibler
  const platforms: ('instagram' | 'linkedin')[] =
    platform === 'both' ? ['instagram', 'linkedin'] : [platform];

  for (const plt of platforms) {
    const taskType = plt === 'instagram' ? 'instagram_post' : 'linkedin_post';

    // Tenter avec Claude, sinon template
    let contenu: string;
    const claudePrompt = `Tu es le community manager de Mathieu&Co Studio, un studio d'architecture intérieure basé à Cotonou, Bénin.
Écris un post ${plt === 'instagram' ? 'Instagram' : 'LinkedIn'} ${language === 'fr' ? 'en français' : 'in English'}, ton "${tone}".
Contenu source : ${JSON.stringify(sourceData)}
Le post doit être engageant, refléter l'excellence du studio, et se terminer par ${plt === 'instagram' ? '8-10 hashtags pertinents' : '3-5 hashtags professionnels'}.
Maximum 300 mots. N'utilise pas d'emojis génériques ou excessifs.`;

    const aiContenu = await generateWithClaude(claudePrompt);
    contenu = aiContenu ?? generateFromTemplate(sourceData, source_type === 'article_blog' ? 'article' : source_type as 'projet' | 'produit', plt, tone);

    const hashtags = pickHashtags(
      source_type === 'projet' ? (sourceData as ProjectData).categorie : source_type,
    );

    tasks.push({
      type:        taskType as 'instagram_post' | 'linkedin_post',
      statut:      'en_attente',
      platform:    plt,
      source_type,
      source_id:   sourceId,
      source_slug,
      titre,
      contenu,
      hashtags,
      images_urls: images,
      meta:        { tone, language, generated_with: aiContenu ? 'claude' : 'template' },
      note_admin:  null,
      publie_le:   null,
      publie_url:  null,
      erreur:      null,
    });
  }

  return tasks;
}
