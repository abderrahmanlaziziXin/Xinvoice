/**
 * French Legal Documents Templates and Question System
 * Système de génération de documents juridiques français avec questions conversationnelles
 */

export interface LegalDocumentQuestion {
  id: string
  text: string
  type: 'text' | 'select' | 'date' | 'number' | 'textarea' | 'boolean'
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  helpText?: string
  dependsOn?: string // Question conditionnelle
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    message?: string
  }
}

export interface LegalDocumentTemplate {
  id: string
  name: string
  description: string
  category: 'contrat' | 'bail' | 'vente' | 'procuration' | 'autre'
  legalBasis: string
  estimatedTime: string // "10-15 minutes"
  questions: LegalDocumentQuestion[]
  documentTemplate: string // Template with placeholders
  requiredFields: string[]
  optionalFields: string[]
  legalNotices: string[]
}

// Templates des documents juridiques français
export const FrenchLegalDocuments: LegalDocumentTemplate[] = [
  {
    id: 'contrat-travail-cdi',
    name: 'Contrat de Travail CDI',
    description: 'Contrat à durée indéterminée conforme au Code du travail français',
    category: 'contrat',
    legalBasis: 'Code du travail français - Articles L1221-1 et suivants',
    estimatedTime: '10-15 minutes',
    requiredFields: ['employeur_nom', 'salarie_nom', 'poste', 'salaire', 'date_embauche'],
    optionalFields: ['periode_essai', 'formation', 'clauses_particulieres'],
    legalNotices: [
      'Ce contrat doit respecter les dispositions du Code du travail',
      'Les mentions obligatoires sont définies par l\'article L1221-1',
      'Le contrat peut être complété par une convention collective applicable'
    ],
    questions: [
      // Informations employeur
      {
        id: 'employeur_nom',
        text: 'Quel est le nom de l\'employeur ou de l\'entreprise ?',
        type: 'text',
        required: true,
        placeholder: 'Ex: SARL Solutions Numériques',
        helpText: 'Nom complet de l\'entreprise ou raison sociale'
      },
      {
        id: 'employeur_siret',
        text: 'Numéro SIRET de l\'entreprise (optionnel)',
        type: 'text',
        required: false,
        placeholder: 'Ex: 123 456 789 01234',
        validation: {
          pattern: '^[0-9]{3}\\s?[0-9]{3}\\s?[0-9]{3}\\s?[0-9]{5}$',
          message: 'Format SIRET invalide (14 chiffres)'
        }
      },
      {
        id: 'employeur_adresse',
        text: 'Adresse complète de l\'employeur',
        type: 'textarea',
        required: true,
        placeholder: 'Adresse, code postal, ville',
        helpText: 'Adresse du siège social ou de l\'établissement'
      },
      
      // Informations salarié
      {
        id: 'salarie_nom',
        text: 'Nom et prénom du salarié',
        type: 'text',
        required: true,
        placeholder: 'Ex: Dupont Jean',
        helpText: 'Nom et prénom complets du futur employé'
      },
      {
        id: 'salarie_adresse',
        text: 'Adresse du salarié',
        type: 'textarea',
        required: true,
        placeholder: 'Adresse, code postal, ville'
      },
      
      // Poste et mission
      {
        id: 'poste',
        text: 'Intitulé du poste ou de la fonction',
        type: 'text',
        required: true,
        placeholder: 'Ex: Développeur Full-Stack',
        helpText: 'Titre précis du poste à occuper'
      },
      {
        id: 'mission_description',
        text: 'Description des tâches principales (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Décrivez les principales missions et responsabilités...'
      },
      {
        id: 'lieu_travail',
        text: 'Lieu de travail',
        type: 'text',
        required: true,
        placeholder: 'Ex: Paris 15ème, télétravail partiel...'
      },
      
      // Conditions de travail
      {
        id: 'date_embauche',
        text: 'Date d\'embauche prévue',
        type: 'date',
        required: true,
        helpText: 'Date de prise de poste effective'
      },
      {
        id: 'salaire',
        text: 'Salaire brut mensuel (en euros)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 3500',
        helpText: 'Montant du salaire brut mensuel'
      },
      {
        id: 'horaires',
        text: 'Horaires de travail',
        type: 'select',
        required: true,
        options: [
          { value: '35h', label: '35 heures par semaine' },
          { value: '39h', label: '39 heures par semaine' },
          { value: 'cadre', label: 'Statut cadre (forfait jours)' },
          { value: 'autre', label: 'Autre (à préciser)' }
        ]
      },
      {
        id: 'horaires_details',
        text: 'Précisez les horaires si "Autre" sélectionné',
        type: 'text',
        required: false,
        dependsOn: 'horaires',
        placeholder: 'Ex: 9h-17h, télétravail 2 jours...'
      },
      
      // Période d'essai
      {
        id: 'periode_essai',
        text: 'Souhaitez-vous inclure une période d\'essai ?',
        type: 'boolean',
        required: false,
        helpText: 'La période d\'essai est optionnelle mais recommandée'
      },
      {
        id: 'duree_essai',
        text: 'Durée de la période d\'essai',
        type: 'select',
        required: false,
        dependsOn: 'periode_essai',
        options: [
          { value: '2_mois', label: '2 mois (employés)' },
          { value: '3_mois', label: '3 mois (agents de maîtrise)' },
          { value: '4_mois', label: '4 mois (cadres)' }
        ]
      },
      
      // Clauses spéciales
      {
        id: 'formation',
        text: 'Obligations de formation particulières (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Formations obligatoires, certifications...'
      },
      {
        id: 'clauses_particulieres',
        text: 'Clauses particulières à ajouter (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Clause de mobilité, de confidentialité, avantages...'
      }
    ],
    documentTemplate: `
CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre les soussignés :

L'EMPLOYEUR :
{{employeur_nom}}
{{#employeur_siret}}SIRET : {{employeur_siret}}{{/employeur_siret}}
Adresse : {{employeur_adresse}}

ci-après dénommé "l'Employeur", d'une part,

ET

LE SALARIÉ :
{{salarie_nom}}
Adresse : {{salarie_adresse}}

ci-après dénommé "le Salarié", d'autre part,

IL EST CONVENU CE QUI SUIT :

ARTICLE 1 - ENGAGEMENT
L'Employeur engage le Salarié en qualité de {{poste}}.
{{#mission_description}}
Missions principales : {{mission_description}}
{{/mission_description}}

ARTICLE 2 - LIEU DE TRAVAIL
Le Salarié exercera ses fonctions à : {{lieu_travail}}.

ARTICLE 3 - PRISE D'EFFET ET DURÉE
Le présent contrat prendra effet le {{date_embauche}} pour une durée indéterminée.

{{#periode_essai}}
ARTICLE 4 - PÉRIODE D'ESSAI
Le présent contrat est assorti d'une période d'essai de {{duree_essai}}, au cours de laquelle chacune des parties peut rompre le contrat sans préavis ni indemnité.
{{/periode_essai}}

ARTICLE {{#periode_essai}}5{{/periode_essai}}{{^periode_essai}}4{{/periode_essai}} - RÉMUNÉRATION
Le Salarié percevra une rémunération brute mensuelle de {{salaire}} euros, payable le dernier jour ouvrable de chaque mois.

ARTICLE {{#periode_essai}}6{{/periode_essai}}{{^periode_essai}}5{{/periode_essai}} - DURÉE DU TRAVAIL
La durée du travail est fixée à {{horaires}}.
{{#horaires_details}}
Modalités : {{horaires_details}}
{{/horaires_details}}

{{#formation}}
ARTICLE {{#periode_essai}}7{{/periode_essai}}{{^periode_essai}}6{{/periode_essai}} - FORMATION
{{formation}}
{{/formation}}

{{#clauses_particulieres}}
ARTICLE {{#periode_essai}}8{{/periode_essai}}{{^periode_essai}}7{{/periode_essai}} - CLAUSES PARTICULIÈRES
{{clauses_particulieres}}
{{/clauses_particulieres}}

ARTICLE FINAL - DISPOSITIONS GÉNÉRALES
Le présent contrat est régi par le Code du travail et les conventions collectives applicables. Toute modification devra faire l'objet d'un avenant écrit.

Fait en deux exemplaires à __________________, le __________________

L'Employeur                           Le Salarié
(signature et cachet)                 (signature précédée de "Lu et approuvé")
    `
  },
  
  {
    id: 'bail-habitation',
    name: 'Bail d\'Habitation',
    description: 'Contrat de location pour logement vide ou meublé',
    category: 'bail',
    legalBasis: 'Loi du 6 juillet 1989 - Article 3 et suivants',
    estimatedTime: '15-20 minutes',
    requiredFields: ['proprietaire_nom', 'locataire_nom', 'logement_adresse', 'loyer', 'date_effet'],
    optionalFields: ['charges', 'depot_garantie', 'travaux', 'clauses_particulieres'],
    legalNotices: [
      'Ce bail respecte la loi du 6 juillet 1989',
      'Le contrat doit être écrit et signé par les deux parties',
      'L\'état des lieux d\'entrée est obligatoire'
    ],
    questions: [
      // Type de location
      {
        id: 'type_location',
        text: 'Type de location',
        type: 'select',
        required: true,
        options: [
          { value: 'vide', label: 'Location vide' },
          { value: 'meuble', label: 'Location meublée' }
        ],
        helpText: 'Une location meublée a des règles différentes'
      },
      
      // Propriétaire
      {
        id: 'proprietaire_nom',
        text: 'Nom complet du propriétaire',
        type: 'text',
        required: true,
        placeholder: 'Ex: Martin Sophie'
      },
      {
        id: 'proprietaire_adresse',
        text: 'Adresse du propriétaire',
        type: 'textarea',
        required: true,
        placeholder: 'Adresse complète du propriétaire'
      },
      
      // Locataire
      {
        id: 'locataire_nom',
        text: 'Nom complet du locataire',
        type: 'text',
        required: true,
        placeholder: 'Ex: Dupont Pierre'
      },
      
      // Logement
      {
        id: 'logement_adresse',
        text: 'Adresse complète du logement loué',
        type: 'textarea',
        required: true,
        placeholder: 'Adresse, étage, code d\'accès...'
      },
      {
        id: 'logement_description',
        text: 'Description du logement',
        type: 'textarea',
        required: true,
        placeholder: 'Nombre de pièces, superficie, équipements...',
        helpText: 'Décrivez précisément le logement et ses équipements'
      },
      {
        id: 'superficie',
        text: 'Surface habitable (en m²)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 45.5'
      },
      {
        id: 'classe_energetique',
        text: 'Classe énergétique (DPE)',
        type: 'select',
        required: false,
        options: [
          { value: 'A', label: 'A (très économe)' },
          { value: 'B', label: 'B (économe)' },
          { value: 'C', label: 'C (assez économe)' },
          { value: 'D', label: 'D (assez peu économe)' },
          { value: 'E', label: 'E (peu économe)' },
          { value: 'F', label: 'F (très peu économe)' },
          { value: 'G', label: 'G (extrêmement peu économe)' }
        ]
      },
      
      // Conditions financières
      {
        id: 'date_effet',
        text: 'Date de prise d\'effet du bail',
        type: 'date',
        required: true
      },
      {
        id: 'duree_bail',
        text: 'Durée du bail',
        type: 'select',
        required: true,
        options: [
          { value: '3_ans', label: '3 ans (location vide)' },
          { value: '1_an', label: '1 an (location meublée)' },
          { value: '9_mois', label: '9 mois (étudiant meublé)' }
        ]
      },
      {
        id: 'loyer',
        text: 'Montant du loyer mensuel (en euros)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 850'
      },
      {
        id: 'charges',
        text: 'Charges mensuelles (en euros)',
        type: 'number',
        required: false,
        placeholder: 'Ex: 120',
        helpText: 'Charges forfaitaires ou provisionnelles'
      },
      {
        id: 'depot_garantie',
        text: 'Dépôt de garantie (en euros)',
        type: 'number',
        required: false,
        placeholder: 'Ex: 850',
        helpText: 'Maximum 1 mois de loyer (vide) ou 2 mois (meublé)'
      },
      {
        id: 'modalite_paiement',
        text: 'Modalités de paiement du loyer',
        type: 'text',
        required: true,
        placeholder: 'Ex: Virement le 5 de chaque mois'
      },
      
      // Travaux et état
      {
        id: 'travaux',
        text: 'Travaux récents effectués (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Nature et date des travaux...'
      },
      {
        id: 'clauses_particulieres',
        text: 'Clauses particulières (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Animaux, sous-location, révision du loyer...'
      }
    ],
    documentTemplate: `
CONTRAT DE BAIL D'HABITATION {{#type_location}}{{#eq type_location "meuble"}}MEUBLÉE{{/eq}}{{#eq type_location "vide"}}VIDE{{/eq}}{{/type_location}}

Entre les soussignés :

LE BAILLEUR :
{{proprietaire_nom}}
Adresse : {{proprietaire_adresse}}

ci-après dénommé "le Bailleur", d'une part,

ET

LE PRENEUR :
{{locataire_nom}}

ci-après dénommé "le Preneur", d'autre part,

IL EST CONVENU CE QUI SUIT :

ARTICLE 1 - OBJET DE LA LOCATION
Le Bailleur loue au Preneur le logement situé :
{{logement_adresse}}

Description : {{logement_description}}
Surface habitable : {{superficie}} m²
{{#classe_energetique}}Classe énergétique : {{classe_energetique}}{{/classe_energetique}}

ARTICLE 2 - DURÉE DU BAIL
Le présent bail est consenti pour une durée de {{duree_bail}}, prenant effet le {{date_effet}}.

ARTICLE 3 - LOYER ET CHARGES
Le montant du loyer mensuel est fixé à {{loyer}} euros.
{{#charges}}
Les charges mensuelles s'élèvent à {{charges}} euros.
{{/charges}}

Le loyer {{#charges}}et les charges{{/charges}} sont payables {{modalite_paiement}}.

{{#depot_garantie}}
ARTICLE 4 - DÉPÔT DE GARANTIE
Le Preneur verse à titre de dépôt de garantie la somme de {{depot_garantie}} euros.
{{/depot_garantie}}

{{#travaux}}
ARTICLE {{#depot_garantie}}5{{/depot_garantie}}{{^depot_garantie}}4{{/depot_garantie}} - TRAVAUX
Travaux récents : {{travaux}}
{{/travaux}}

{{#clauses_particulieres}}
ARTICLE {{#depot_garantie}}{{#travaux}}6{{/travaux}}{{^travaux}}5{{/travaux}}{{/depot_garantie}}{{^depot_garantie}}{{#travaux}}5{{/travaux}}{{^travaux}}4{{/travaux}}{{/depot_garantie}} - CLAUSES PARTICULIÈRES
{{clauses_particulieres}}
{{/clauses_particulieres}}

ARTICLE FINAL - DISPOSITIONS GÉNÉRALES
Le présent bail est soumis à la loi du 6 juillet 1989. Un état des lieux contradictoire sera établi lors de la remise des clés.

Fait en deux exemplaires à __________________, le __________________

Le Bailleur                           Le Preneur
(signature)                           (signature précédée de "Lu et approuvé")
    `
  },
  
  {
    id: 'contrat-vente',
    name: 'Contrat de Vente',
    description: 'Contrat de vente de biens ou services',
    category: 'vente',
    legalBasis: 'Code civil - Articles 1582 et suivants',
    estimatedTime: '10-15 minutes',
    requiredFields: ['vendeur_nom', 'acheteur_nom', 'objet_vente', 'prix'],
    optionalFields: ['modalite_paiement', 'livraison', 'garanties'],
    legalNotices: [
      'Le contrat doit préciser l\'objet, le prix et le consentement',
      'Les garanties légales s\'appliquent automatiquement',
      'Droit de rétractation selon le contexte'
    ],
    questions: [
      // Vendeur
      {
        id: 'vendeur_nom',
        text: 'Nom complet du vendeur',
        type: 'text',
        required: true,
        placeholder: 'Nom du vendeur ou de l\'entreprise'
      },
      {
        id: 'vendeur_adresse',
        text: 'Adresse du vendeur',
        type: 'textarea',
        required: true
      },
      {
        id: 'vendeur_siret',
        text: 'SIRET du vendeur (si professionnel)',
        type: 'text',
        required: false,
        placeholder: 'Numéro SIRET'
      },
      
      // Acheteur
      {
        id: 'acheteur_nom',
        text: 'Nom complet de l\'acheteur',
        type: 'text',
        required: true
      },
      {
        id: 'acheteur_adresse',
        text: 'Adresse de l\'acheteur',
        type: 'textarea',
        required: true
      },
      
      // Objet de la vente
      {
        id: 'objet_vente',
        text: 'Description détaillée de l\'objet de la vente',
        type: 'textarea',
        required: true,
        placeholder: 'Décrivez précisément les biens ou services vendus...',
        helpText: 'Soyez le plus précis possible sur les caractéristiques'
      },
      
      // Prix et paiement
      {
        id: 'prix',
        text: 'Prix de vente total (en euros)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 15000'
      },
      {
        id: 'modalite_paiement',
        text: 'Modalités de paiement',
        type: 'select',
        required: true,
        options: [
          { value: 'comptant', label: 'Paiement comptant' },
          { value: 'echeance', label: 'Paiement échelonné' },
          { value: 'livraison', label: 'Paiement à la livraison' }
        ]
      },
      {
        id: 'echeancier',
        text: 'Détails de l\'échéancier (si paiement échelonné)',
        type: 'textarea',
        required: false,
        dependsOn: 'modalite_paiement',
        placeholder: 'Dates et montants des échéances...'
      },
      
      // Livraison
      {
        id: 'livraison_lieu',
        text: 'Lieu de livraison',
        type: 'text',
        required: true,
        placeholder: 'Adresse de livraison ou retrait'
      },
      {
        id: 'livraison_delai',
        text: 'Délai de livraison',
        type: 'text',
        required: true,
        placeholder: 'Ex: 15 jours ouvrables'
      },
      {
        id: 'frais_livraison',
        text: 'Frais de livraison (optionnel)',
        type: 'text',
        required: false,
        placeholder: 'À la charge de qui, montant...'
      },
      
      // Garanties
      {
        id: 'garantie_conformite',
        text: 'Précisions sur la garantie de conformité',
        type: 'textarea',
        required: false,
        placeholder: 'Garanties particulières offertes...'
      },
      {
        id: 'clauses_particulieres',
        text: 'Clauses particulières',
        type: 'textarea',
        required: false,
        placeholder: 'Conditions particulières, pénalités...'
      }
    ],
    documentTemplate: `
CONTRAT DE VENTE

Entre les soussignés :

LE VENDEUR :
{{vendeur_nom}}
{{#vendeur_siret}}SIRET : {{vendeur_siret}}{{/vendeur_siret}}
Adresse : {{vendeur_adresse}}

ci-après dénommé "le Vendeur", d'une part,

ET

L'ACHETEUR :
{{acheteur_nom}}
Adresse : {{acheteur_adresse}}

ci-après dénommé "l'Acheteur", d'autre part,

IL EST CONVENU CE QUI SUIT :

ARTICLE 1 - OBJET DE LA VENTE
Le Vendeur vend à l'Acheteur :
{{objet_vente}}

ARTICLE 2 - PRIX
Le prix de vente est fixé à {{prix}} euros.

ARTICLE 3 - MODALITÉS DE PAIEMENT
{{#eq modalite_paiement "comptant"}}Le paiement s'effectuera comptant à la signature du présent contrat.{{/eq}}
{{#eq modalite_paiement "livraison"}}Le paiement s'effectuera à la livraison.{{/eq}}
{{#eq modalite_paiement "echeance"}}Le paiement s'effectuera selon l'échéancier suivant :
{{echeancier}}{{/eq}}

ARTICLE 4 - LIVRAISON
La livraison aura lieu à : {{livraison_lieu}}
Délai de livraison : {{livraison_delai}}
{{#frais_livraison}}Frais de livraison : {{frais_livraison}}{{/frais_livraison}}

{{#garantie_conformite}}
ARTICLE 5 - GARANTIES
{{garantie_conformite}}
{{/garantie_conformite}}

{{#clauses_particulieres}}
ARTICLE {{#garantie_conformite}}6{{/garantie_conformite}}{{^garantie_conformite}}5{{/garantie_conformite}} - CLAUSES PARTICULIÈRES
{{clauses_particulieres}}
{{/clauses_particulieres}}

ARTICLE FINAL - DISPOSITIONS GÉNÉRALES
Le présent contrat est régi par le Code civil français. Les garanties légales s'appliquent de plein droit.

Fait en deux exemplaires à __________________, le __________________

Le Vendeur                            L'Acheteur
(signature)                           (signature précédée de "Lu et approuvé")
    `
  },

  {
    id: 'procuration',
    name: 'Procuration (Mandat)',
    description: 'Mandat de représentation pour démarches administratives ou judiciaires',
    category: 'procuration',
    legalBasis: 'Code civil - Articles 1984 et suivants / Code de procédure civile',
    estimatedTime: '5-10 minutes',
    requiredFields: ['mandant_nom', 'mandataire_nom', 'objet_mandat'],
    optionalFields: ['duree_mandat', 'conditions_fin'],
    legalNotices: [
      'La procuration doit être écrite et datée',
      'Joindre une copie des pièces d\'identité',
      'Certaines démarches nécessitent une procuration notariée'
    ],
    questions: [
      // Type de procuration
      {
        id: 'type_procuration',
        text: 'Type de procuration',
        type: 'select',
        required: true,
        options: [
          { value: 'administrative', label: 'Démarches administratives' },
          { value: 'judiciaire', label: 'Représentation judiciaire' },
          { value: 'bancaire', label: 'Opérations bancaires' },
          { value: 'autre', label: 'Autre (à préciser)' }
        ]
      },
      
      // Mandant (qui donne la procuration)
      {
        id: 'mandant_nom',
        text: 'Nom et prénom du mandant',
        type: 'text',
        required: true,
        placeholder: 'Personne qui donne la procuration',
        helpText: 'Personne qui donne le pouvoir d\'agir en son nom'
      },
      {
        id: 'mandant_naissance',
        text: 'Date et lieu de naissance du mandant',
        type: 'text',
        required: true,
        placeholder: 'Ex: 15/03/1980 à Paris'
      },
      {
        id: 'mandant_nationalite',
        text: 'Nationalité du mandant',
        type: 'text',
        required: true,
        placeholder: 'Ex: Française'
      },
      {
        id: 'mandant_profession',
        text: 'Profession du mandant',
        type: 'text',
        required: false,
        placeholder: 'Ex: Ingénieur'
      },
      {
        id: 'mandant_adresse',
        text: 'Adresse complète du mandant',
        type: 'textarea',
        required: true
      },
      
      // Mandataire (qui reçoit la procuration)
      {
        id: 'mandataire_nom',
        text: 'Nom et prénom du mandataire',
        type: 'text',
        required: true,
        placeholder: 'Personne qui recevra la procuration',
        helpText: 'Personne habilitée à agir au nom du mandant'
      },
      {
        id: 'mandataire_naissance',
        text: 'Date et lieu de naissance du mandataire',
        type: 'text',
        required: true,
        placeholder: 'Ex: 22/07/1975 à Lyon'
      },
      {
        id: 'mandataire_nationalite',
        text: 'Nationalité du mandataire',
        type: 'text',
        required: true,
        placeholder: 'Ex: Française'
      },
      {
        id: 'mandataire_profession',
        text: 'Profession du mandataire',
        type: 'text',
        required: false,
        placeholder: 'Ex: Avocat'
      },
      {
        id: 'mandataire_adresse',
        text: 'Adresse complète du mandataire',
        type: 'textarea',
        required: true
      },
      
      // Objet du mandat
      {
        id: 'objet_mandat',
        text: 'Objet précis de la procuration',
        type: 'textarea',
        required: true,
        placeholder: 'Décrivez précisément les actes que le mandataire est autorisé à accomplir...',
        helpText: 'Soyez très précis sur les pouvoirs accordés'
      },
      {
        id: 'tribunal_concerne',
        text: 'Tribunal concerné (si procuration judiciaire)',
        type: 'text',
        required: false,
        dependsOn: 'type_procuration',
        placeholder: 'Ex: Tribunal de Grande Instance de Paris'
      },
      {
        id: 'numero_procedure',
        text: 'Numéro de procédure (si connu)',
        type: 'text',
        required: false,
        dependsOn: 'type_procuration',
        placeholder: 'Référence de l\'affaire'
      },
      
      // Durée et conditions
      {
        id: 'duree_mandat',
        text: 'Durée du mandat',
        type: 'select',
        required: false,
        options: [
          { value: 'ponctuel', label: 'Ponctuel (pour un acte précis)' },
          { value: '6_mois', label: '6 mois' },
          { value: '1_an', label: '1 an' },
          { value: 'duree_libre', label: 'Autre durée (à préciser)' }
        ]
      },
      {
        id: 'duree_precise',
        text: 'Précisez la durée',
        type: 'text',
        required: false,
        dependsOn: 'duree_mandat',
        placeholder: 'Ex: Jusqu\'au 31/12/2025'
      },
      {
        id: 'conditions_fin',
        text: 'Conditions de fin du mandat (optionnel)',
        type: 'textarea',
        required: false,
        placeholder: 'Conditions particulières mettant fin au mandat...'
      }
    ],
    documentTemplate: `
PROCURATION

Je soussigné(e) :

MANDANT :
{{mandant_nom}}
Né(e) le {{mandant_naissance}}
Nationalité : {{mandant_nationalite}}
{{#mandant_profession}}Profession : {{mandant_profession}}{{/mandant_profession}}
Demeurant : {{mandant_adresse}}

DONNE PROCURATION À :

MANDATAIRE :
{{mandataire_nom}}
Né(e) le {{mandataire_naissance}}
Nationalité : {{mandataire_nationalite}}
{{#mandataire_profession}}Profession : {{mandataire_profession}}{{/mandataire_profession}}
Demeurant : {{mandataire_adresse}}

OBJET DE LA PROCURATION :
{{objet_mandat}}

{{#tribunal_concerne}}
Tribunal concerné : {{tribunal_concerne}}
{{#numero_procedure}}Numéro de procédure : {{numero_procedure}}{{/numero_procedure}}
{{/tribunal_concerne}}

{{#duree_mandat}}
DURÉE :
{{#eq duree_mandat "ponctuel"}}Cette procuration est valable pour l'accomplissement de l'acte décrit ci-dessus.{{/eq}}
{{#eq duree_mandat "duree_libre"}}Cette procuration est valable {{duree_precise}}.{{/eq}}
{{#ne duree_mandat "ponctuel"}}{{#ne duree_mandat "duree_libre"}}Cette procuration est valable pour une durée de {{duree_mandat}}.{{/ne}}{{/ne}}
{{/duree_mandat}}

{{#conditions_fin}}
CONDITIONS DE FIN :
{{conditions_fin}}
{{/conditions_fin}}

Je déclare que cette procuration est donnée en toute connaissance de cause et que le mandataire est habilité à agir en mon nom et pour mon compte dans les limites des pouvoirs qui lui sont conférés.

PIÈCES JOINTES :
- Copie de la pièce d'identité du mandant
- Copie de la pièce d'identité du mandataire

Fait à __________________, le __________________

Signature du mandant                  Signature du mandataire
(précédée de "Bon pour procuration") (précédée de "J'accepte cette procuration")


________________________             ________________________
    `
  }
]

// Système de questions conversationnelles
export interface ConversationState {
  documentType?: string
  currentQuestionIndex: number
  answers: Record<string, any>
  completed: boolean
}

export class FrenchLegalDocumentGenerator {
  private templates: Map<string, LegalDocumentTemplate>

  constructor() {
    this.templates = new Map()
    FrenchLegalDocuments.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  getAvailableDocuments(): { id: string; name: string; description: string; category: string; estimatedTime: string }[] {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      estimatedTime: template.estimatedTime
    }))
  }

  getDocumentTemplate(documentId: string): LegalDocumentTemplate | null {
    return this.templates.get(documentId) || null
  }

  getNextQuestion(documentId: string, currentAnswers: Record<string, any>): LegalDocumentQuestion | null {
    const template = this.templates.get(documentId)
    if (!template) return null

    for (const question of template.questions) {
      // Skip if already answered
      if (currentAnswers[question.id] !== undefined) continue

      // Check dependencies
      if (question.dependsOn) {
        const dependentValue = currentAnswers[question.dependsOn]
        if (!dependentValue || (typeof dependentValue === 'boolean' && !dependentValue)) {
          continue
        }
      }

      return question
    }

    return null // All questions answered
  }

  validateAnswer(question: LegalDocumentQuestion, answer: any): { isValid: boolean; error?: string } {
    if (question.required && (!answer || answer.toString().trim() === '')) {
      return { isValid: false, error: 'Cette information est obligatoire' }
    }

    if (answer && question.validation) {
      if (question.validation.pattern) {
        const regex = new RegExp(question.validation.pattern)
        if (!regex.test(answer.toString())) {
          return { isValid: false, error: question.validation.message || 'Format invalide' }
        }
      }

      if (question.validation.minLength && answer.toString().length < question.validation.minLength) {
        return { isValid: false, error: `Minimum ${question.validation.minLength} caractères requis` }
      }

      if (question.validation.maxLength && answer.toString().length > question.validation.maxLength) {
        return { isValid: false, error: `Maximum ${question.validation.maxLength} caractères autorisés` }
      }
    }

    return { isValid: true }
  }

  generateDocument(documentId: string, answers: Record<string, any>): { success: boolean; document?: string; errors?: string[] } {
    const template = this.templates.get(documentId)
    if (!template) {
      return { success: false, errors: ['Template de document non trouvé'] }
    }

    // Validate required fields
    const errors: string[] = []
    for (const fieldId of template.requiredFields) {
      if (!answers[fieldId] || answers[fieldId].toString().trim() === '') {
        const question = template.questions.find(q => q.id === fieldId)
        errors.push(`Information manquante : ${question?.text || fieldId}`)
      }
    }

    if (errors.length > 0) {
      return { success: false, errors }
    }

    // Generate document using simple template replacement
    let document = template.documentTemplate
    
    // Replace simple variables
    Object.keys(answers).forEach(key => {
      const value = answers[key]
      if (value !== null && value !== undefined) {
        // Simple replacement for {{variable}}
        document = document.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value.toString())
        
        // Handle conditional sections {{#variable}}...{{/variable}}
        if (value) {
          const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`, 'g')
          document = document.replace(conditionalRegex, '$1')
        }
      }
    })

    // Clean up unused conditionals {{#variable}}...{{/variable}}
    document = document.replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '')
    
    // Clean up unused variables {{variable}}
    document = document.replace(/\{\{[^}]+\}\}/g, '')
    
    // Clean up multiple empty lines
    document = document.replace(/\n\s*\n\s*\n/g, '\n\n')

    return { success: true, document: document.trim() }
  }

  getCompletionRate(documentId: string, answers: Record<string, any>): number {
    const template = this.templates.get(documentId)
    if (!template) return 0

    const totalQuestions = template.questions.filter(q => !q.dependsOn || answers[q.dependsOn]).length
    const answeredQuestions = template.questions.filter(q => 
      answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
    ).length

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }
}

// Export instance
export const frenchLegalDocumentGenerator = new FrenchLegalDocumentGenerator()