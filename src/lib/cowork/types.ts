/**
 * Cowork — Types partagés
 */

// ─── CoworkTask ───────────────────────────────────────────────────────────────

export type CoworkTaskType =
  | 'instagram_post'
  | 'instagram_story'
  | 'linkedin_post'
  | 'newsletter_draft';

export type CoworkTaskStatut =
  | 'en_attente'   // Généré, en attente de validation
  | 'approuve'     // Validé par Mathieu, prêt à publier
  | 'rejete'       // Rejeté par Mathieu
  | 'publie'       // Publié sur la plateforme
  | 'echec';       // Erreur lors de la publication

export type CoworkPlatform = 'instagram' | 'linkedin' | 'both';

export type CoworkSourceType = 'projet' | 'produit' | 'article_blog' | 'custom';

export interface CoworkTask {
  id:          string;
  type:        CoworkTaskType;
  statut:      CoworkTaskStatut;
  platform:    CoworkPlatform | null;
  source_type: CoworkSourceType | null;
  source_id:   string | null;
  source_slug: string | null;
  titre:       string | null;
  contenu:     string;
  hashtags:    string[];
  images_urls: string[];
  meta:        Record<string, unknown>;
  note_admin:  string | null;
  publie_le:   string | null;
  publie_url:  string | null;
  erreur:      string | null;
  created_at:  string;
  updated_at:  string;
}

export type CoworkTaskInsert = Omit<CoworkTask, 'id' | 'created_at' | 'updated_at'>;
export type CoworkTaskUpdate = Partial<CoworkTaskInsert>;

// ─── CoworkReport ─────────────────────────────────────────────────────────────

export interface InstagramMetrics {
  followers:    number;
  impressions:  number;
  reach:        number;
  profile_views:number;
  posts_count:  number;
  likes:        number;
  comments:     number;
  saves:        number;
}

export interface LinkedInMetrics {
  followers:    number;
  impressions:  number;
  clicks:       number;
  reactions:    number;
  shares:       number;
  comments:     number;
  posts_count:  number;
}

export interface BoutiqueMetrics {
  commandes:       number;
  revenus_xof:     number;
  nouveaux_clients:number;
  panier_moyen:    number;
  produits_vus:    number;
}

export interface CoworkReportData {
  instagram?: InstagramMetrics;
  linkedin?:  LinkedInMetrics;
  boutique?:  BoutiqueMetrics;
  tasks: {
    generees:  number;
    approuvees:number;
    rejetees:  number;
    publiees:  number;
  };
}

export interface CoworkReport {
  id:           string;
  semaine:      string; // ISO date du lundi
  donnees:      CoworkReportData;
  email_envoye: boolean;
  envoye_le:    string | null;
  created_at:   string;
}

// ─── ContentGenerationRequest ─────────────────────────────────────────────────

export interface ContentGenerationRequest {
  source_type: CoworkSourceType;
  source_slug: string;
  platform:    CoworkPlatform;
  tone?:       'professionnel' | 'inspire' | 'informatif' | 'commercial';
  language?:   'fr' | 'en';
}

// ─── PostResult ───────────────────────────────────────────────────────────────

export interface PostResult {
  ok:       boolean;
  post_id?: string;
  url?:     string;
  error?:   string;
}
