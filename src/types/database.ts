/**
 * Types TypeScript générés manuellement depuis supabase/schema.sql
 * → Remplacer par `supabase gen types typescript` une fois le projet Supabase connecté.
 *
 * Structure : Database['public']['Tables'][tableName]['Row' | 'Insert' | 'Update']
 */

// ─── Primitif JSON ────────────────────────────────────────────────────────────
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────
export type StatutProduit     = 'actif' | 'inactif' | 'epuise' | 'archive';
export type StatutCommande    = 'en_attente' | 'confirmee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee' | 'remboursee';
export type StatutAvis        = 'en_attente' | 'approuve' | 'rejete';
export type StatutClient      = 'actif' | 'inactif' | 'banni';
export type StatutPublication = 'publie' | 'brouillon' | 'archive';
export type TypePromo         = 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
export type CategorieProjet   = 'architecture' | 'decoration' | 'gestion_projet' | 'boutique';

// =============================================================================
//  DATABASE
// =============================================================================
export interface Database {
  public: {
    Tables: {

      // ── categories ──────────────────────────────────────────────────────────
      categories: {
        Row: {
          id:          string;
          parent_id:   string | null;
          slug:        string;
          nom:         string;
          description: string | null;
          image_url:   string | null;
          ordre:       number;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:         string;
          parent_id?:  string | null;
          slug:        string;
          nom:         string;
          description?: string | null;
          image_url?:  string | null;
          ordre?:      number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };

      // ── clients ─────────────────────────────────────────────────────────────
      clients: {
        Row: {
          id:             string;
          email:          string;
          nom:            string | null;
          prenom:         string | null;
          telephone:      string | null;
          adresse:        Json | null;
          ville:          string | null;
          pays:           string;
          date_naissance: string | null;
          newsletter:     boolean;
          statut:         StatutClient;
          source:         string | null;
          notes_internes: string | null;
          created_at:     string;
          updated_at:     string;
          deleted_at:     string | null;
        };
        Insert: {
          id?:             string;
          email:           string;
          nom?:            string | null;
          prenom?:         string | null;
          telephone?:      string | null;
          adresse?:        Json | null;
          ville?:          string | null;
          pays?:           string;
          date_naissance?: string | null;
          newsletter?:     boolean;
          statut?:         StatutClient;
          source?:         string | null;
          notes_internes?: string | null;
          created_at?:     string;
          updated_at?:     string;
          deleted_at?:     string | null;
        };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };

      // ── codes_promo ──────────────────────────────────────────────────────────
      codes_promo: {
        Row: {
          id:               string;
          code:             string;
          type:             TypePromo;
          valeur:           number;
          minimum_commande: number;
          usage_maximum:    number | null;
          usage_actuel:     number;
          client_id:        string | null;
          date_debut:       string;
          date_fin:         string | null;
          actif:            boolean;
          created_at:       string;
          updated_at:       string;
        };
        Insert: {
          id?:               string;
          code:              string;
          type:              TypePromo;
          valeur:            number;
          minimum_commande?: number;
          usage_maximum?:    number | null;
          usage_actuel?:     number;
          client_id?:        string | null;
          date_debut?:       string;
          date_fin?:         string | null;
          actif?:            boolean;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: Partial<Database['public']['Tables']['codes_promo']['Insert']>;
      };

      // ── produits ─────────────────────────────────────────────────────────────
      produits: {
        Row: {
          id:                 string;
          categorie_id:       string | null;
          slug:               string;
          nom:                string;
          description:        string | null;
          description_courte: string | null;
          prix:               number;
          prix_promo:         number | null;
          stock:              number;
          images:             Json;
          origine:            string | null;
          artisan:            string | null;
          materiaux:          string[] | null;
          dimensions:         Json | null;
          poids_g:            number | null;
          tags:               string[] | null;
          statut:             StatutProduit;
          vedette:            boolean;
          meta_titre:         string | null;
          meta_description:   string | null;
          created_at:         string;
          updated_at:         string;
          deleted_at:         string | null;
        };
        Insert: {
          id?:                 string;
          categorie_id?:       string | null;
          slug:                string;
          nom:                 string;
          description?:        string | null;
          description_courte?: string | null;
          prix:                number;
          prix_promo?:         number | null;
          stock?:              number;
          images?:             Json;
          origine?:            string | null;
          artisan?:            string | null;
          materiaux?:          string[] | null;
          dimensions?:         Json | null;
          poids_g?:            number | null;
          tags?:               string[] | null;
          statut?:             StatutProduit;
          vedette?:            boolean;
          meta_titre?:         string | null;
          meta_description?:   string | null;
          created_at?:         string;
          updated_at?:         string;
          deleted_at?:         string | null;
        };
        Update: Partial<Database['public']['Tables']['produits']['Insert']>;
      };

      // ── commandes ────────────────────────────────────────────────────────────
      commandes: {
        Row: {
          id:                 string;
          client_id:          string;
          code_promo_id:      string | null;
          numero:             string;
          statut:             StatutCommande;
          sous_total:         number;
          frais_livraison:    number;
          remise:             number;
          total:              number;
          adresse_livraison:  Json;
          mode_paiement:      string | null;
          ref_paiement:       string | null;
          notes:              string | null;
          notes_internes:     string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                 string;
          client_id:           string;
          code_promo_id?:      string | null;
          numero:              string;
          statut?:             StatutCommande;
          sous_total:          number;
          frais_livraison?:    number;
          remise?:             number;
          total:               number;
          adresse_livraison:   Json;
          mode_paiement?:      string | null;
          ref_paiement?:       string | null;
          notes?:              string | null;
          notes_internes?:     string | null;
          created_at?:         string;
          updated_at?:         string;
        };
        Update: Partial<Database['public']['Tables']['commandes']['Insert']>;
      };

      // ── commandes_items ──────────────────────────────────────────────────────
      commandes_items: {
        Row: {
          id:             string;
          commande_id:    string;
          produit_id:     string;
          nom_produit:    string;
          image_url:      string | null;
          quantite:       number;
          prix_unitaire:  number;
          total:          number;
          created_at:     string;
        };
        Insert: {
          id?:             string;
          commande_id:     string;
          produit_id:      string;
          nom_produit:     string;
          image_url?:      string | null;
          quantite?:       number;
          prix_unitaire:   number;
          total:           number;
          created_at?:     string;
        };
        Update: Partial<Database['public']['Tables']['commandes_items']['Insert']>;
      };

      // ── avis ─────────────────────────────────────────────────────────────────
      avis: {
        Row: {
          id:            string;
          produit_id:    string;
          client_id:     string | null;
          note:          number;
          titre:         string | null;
          commentaire:   string | null;
          statut:        StatutAvis;
          verifie:       boolean;
          signale:       boolean;
          raison_rejet:  string | null;
          created_at:    string;
          updated_at:    string;
        };
        Insert: {
          id?:            string;
          produit_id:     string;
          client_id?:     string | null;
          note:           number;
          titre?:         string | null;
          commentaire?:   string | null;
          statut?:        StatutAvis;
          verifie?:       boolean;
          signale?:       boolean;
          raison_rejet?:  string | null;
          created_at?:    string;
          updated_at?:    string;
        };
        Update: Partial<Database['public']['Tables']['avis']['Insert']>;
      };

      // ── wishlist ──────────────────────────────────────────────────────────────
      wishlist: {
        Row: {
          id:          string;
          client_id:   string;
          produit_id:  string;
          created_at:  string;
        };
        Insert: {
          id?:         string;
          client_id:   string;
          produit_id:  string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wishlist']['Insert']>;
      };

      // ── projets ───────────────────────────────────────────────────────────────
      projets: {
        Row: {
          id:               string;
          slug:             string;
          titre:            string;
          sous_titre:       string | null;
          description:      string | null;
          categorie:        CategorieProjet;
          lieu:             string | null;
          ville:            string;
          pays:             string;
          annee:            number | null;
          surface_m2:       number | null;
          images:           Json;
          image_principale: string | null;
          tags:             string[] | null;
          vedette:          boolean;
          statut:           StatutPublication;
          meta_titre:       string | null;
          meta_description: string | null;
          created_at:       string;
          updated_at:       string;
        };
        Insert: {
          id?:               string;
          slug:              string;
          titre:             string;
          sous_titre?:       string | null;
          description?:      string | null;
          categorie:         CategorieProjet;
          lieu?:             string | null;
          ville?:            string;
          pays?:             string;
          annee?:            number | null;
          surface_m2?:       number | null;
          images?:           Json;
          image_principale?: string | null;
          tags?:             string[] | null;
          vedette?:          boolean;
          statut?:           StatutPublication;
          meta_titre?:       string | null;
          meta_description?: string | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: Partial<Database['public']['Tables']['projets']['Insert']>;
      };

      // ── articles_blog ─────────────────────────────────────────────────────────
      articles_blog: {
        Row: {
          id:                 string;
          auteur_id:          string | null;
          auteur_nom:         string | null;
          slug:               string;
          titre:              string;
          sous_titre:         string | null;
          contenu:            Json | null;
          extrait:            string | null;
          image_principale:   string | null;
          image_alt:          string | null;
          tags:               string[] | null;
          categorie:          string | null;
          statut:             StatutPublication;
          publie_le:          string | null;
          temps_lecture_min:  number | null;
          vues:               number;
          meta_titre:         string | null;
          meta_description:   string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                 string;
          auteur_id?:          string | null;
          auteur_nom?:         string | null;
          slug:                string;
          titre:               string;
          sous_titre?:         string | null;
          contenu?:            Json | null;
          extrait?:            string | null;
          image_principale?:   string | null;
          image_alt?:          string | null;
          tags?:               string[] | null;
          categorie?:          string | null;
          statut?:             StatutPublication;
          publie_le?:          string | null;
          temps_lecture_min?:  number | null;
          vues?:               number;
          meta_titre?:         string | null;
          meta_description?:   string | null;
          created_at?:         string;
          updated_at?:         string;
        };
        Update: Partial<Database['public']['Tables']['articles_blog']['Insert']>;
      };
    };

    // ── Enums (mirrored for Supabase client generics) ──────────────────────────
    Enums: {
      statut_produit:     StatutProduit;
      statut_commande:    StatutCommande;
      statut_avis:        StatutAvis;
      statut_client:      StatutClient;
      statut_publication: StatutPublication;
      type_promo:         TypePromo;
      categorie_projet:   CategorieProjet;
    };

    Functions: Record<string, never>;
  };
}

// ─── Helpers raccourcis ────────────────────────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
