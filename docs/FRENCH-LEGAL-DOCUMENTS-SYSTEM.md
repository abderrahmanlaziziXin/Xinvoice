# 🏛️ Système de Documents Juridiques Français

## 📋 Vue d'ensemble

Le **Système de Documents Juridiques Français** est une solution conversationnelle avancée pour générer automatiquement des documents juridiques conformes au droit français. Il utilise une approche flexible et guidée qui s'adapte aux besoins spécifiques de chaque utilisateur.

## ✨ Fonctionnalités principales

### 🔄 1. Système de sélection souple

- **Choix de document intuitive** : L'utilisateur sélectionne parmi plusieurs types de documents juridiques
- **Interface conversationnelle** : Questions adaptées en temps réel selon le type de document choisi
- **Suggestions contextuelles** : Le système propose des informations utiles sans validation stricte

### 📝 2. Documents supportés

| Document                   | Description                                              | Temps estimé | Base légale                                    |
| -------------------------- | -------------------------------------------------------- | ------------ | ---------------------------------------------- |
| **Contrat de travail CDI** | Contrat à durée indéterminée conforme au Code du travail | 10-15 min    | Code du travail - Articles L1221-1 et suivants |
| **Bail d'habitation**      | Contrat de location pour logement vide ou meublé         | 15-20 min    | Loi du 6 juillet 1989 - Article 3 et suivants  |
| **Contrat de vente**       | Contrat de vente de biens ou services                    | 10-15 min    | Code civil - Articles 1582 et suivants         |
| **Procuration**            | Mandat de représentation pour démarches administratives  | 5-10 min     | Code civil - Articles 1984 et suivants         |

### 💬 3. Experience conversationnelle

#### Interface adaptative

- **Questions contextuelles** : Chaque question s'adapte aux réponses précédentes
- **Champs optionnels** : Liberté de laisser vide les informations non pertinentes
- **Validation intelligente** : Vérification en temps réel avec messages d'aide
- **Progression visuelle** : Barre de progression pour suivre l'avancement

#### Exemple de flux conversationnel

```
🤖 "Quel type de document souhaitez-vous générer ?"
👤 [Sélection : Contrat de travail]

🤖 "Quel est le nom de l'employeur ou de l'entreprise ?"
👤 "SARL Solutions Numériques"

🤖 "Numéro SIRET de l'entreprise (optionnel)"
👤 [Peut ignorer si non disponible]

🤖 "Quel est l'intitulé du poste ?"
👤 "Développeur Full-Stack"
...
```

## 🏗️ Architecture technique

### 📁 Structure du projet

```
packages/core/
├── french-legal-documents.ts      # Templates et logique métier
└──

app/
├── legal-documents/
│   └── page.tsx                   # Page principale
├── components/
│   └── french-legal-document-wizard.tsx  # Interface utilisateur
└── api/legal-documents/
    ├── templates/route.ts         # API des templates disponibles
    ├── next-question/route.ts     # API pour la question suivante
    ├── validate/route.ts          # API de validation des réponses
    └── generate/route.ts          # API de génération de documents
```

### 🔧 Composants clés

#### 1. **FrenchLegalDocuments** (Core)

```typescript
export interface LegalDocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "contrat" | "bail" | "vente" | "procuration";
  legalBasis: string;
  estimatedTime: string;
  questions: LegalDocumentQuestion[];
  documentTemplate: string;
  requiredFields: string[];
  optionalFields: string[];
  legalNotices: string[];
}
```

#### 2. **Question System**

```typescript
export interface LegalDocumentQuestion {
  id: string;
  text: string;
  type: "text" | "select" | "date" | "number" | "textarea" | "boolean";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
  dependsOn?: string; // Question conditionnelle
  validation?: ValidationRule;
}
```

#### 3. **Document Generator**

- **Validation dynamique** : Vérification en temps réel des réponses
- **Génération de templates** : Remplacement intelligent des variables
- **Gestion conditionnelle** : Sections qui apparaissent selon les réponses
- **Calcul de progression** : Suivi automatique du taux de complétion

## 🎯 Exemples d'utilisation

### Contrat de travail CDI

**Questions principales :**

- Informations employeur (nom, SIRET, adresse)
- Informations salarié (identité, adresse)
- Détails du poste (titre, missions, lieu de travail)
- Conditions (salaire, horaires, date d'embauche)
- Options (période d'essai, formation, clauses spéciales)

**Document généré :**

```
CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre les soussignés :

L'EMPLOYEUR :
SARL Solutions Numériques
SIRET : 123 456 789 01234
Adresse : 25 rue de Rivoli, 75001 Paris

ET

LE SALARIÉ :
Dupont Jean
Adresse : 10 avenue des Champs, 75008 Paris

IL EST CONVENU CE QUI SUIT :

ARTICLE 1 - ENGAGEMENT
L'Employeur engage le Salarié en qualité de Développeur Full-Stack.
...
```

### Bail d'habitation

**Questions adaptatives :**

- Type de location (vide/meublé) → Questions spécifiques
- Durée automatique selon le type (3 ans vide, 1 an meublé)
- Calcul automatique du dépôt de garantie selon les règles légales

### Procuration

**Questions contextuelles :**

- Type de procuration → Questions spécifiques au domaine
- Informations complètes des parties (mandant/mandataire)
- Durée et conditions adaptées au type de mandat

## 🛡️ Conformité juridique

### Bases légales respectées

#### Contrat de travail

- **Code du travail** Articles L1221-1 et suivants
- Mentions obligatoires automatiquement incluses
- Respect des durées de période d'essai légales
- Conformité aux obligations d'information

#### Bail d'habitation

- **Loi du 6 juillet 1989** sur les rapports locatifs
- Durées légales respectées (3 ans vide, 1 an meublé)
- Mentions obligatoires automatiques
- Calcul correct des dépôts de garantie

#### Contrat de vente

- **Code civil** Articles 1582 et suivants
- Éléments essentiels : consentement, objet, prix
- Garanties légales automatiquement incluses
- Clauses de protection du consommateur

#### Procuration

- **Code civil** Articles 1984 et suivants
- **Code de procédure civile** pour les procurations judiciaires
- Identité complète des parties requise
- Mention des pouvoirs accordés précisément définis

### Avertissements légaux

Le système inclut automatiquement :

- **Base légale** de référence pour chaque document
- **Mentions obligatoires** selon la réglementation
- **Avertissements** sur les spécificités juridiques
- **Recommandations** pour la validation par un professionnel

## 🚀 Utilisation

### 1. Accès au système

```
http://localhost:3000/legal-documents
```

### 2. Processus de génération

1. **Sélection** du type de document
2. **Questions conversationnelles** adaptées
3. **Aperçu** du document généré
4. **Téléchargement** au format TXT

### 3. API Endpoints

#### Obtenir les templates disponibles

```http
GET /api/legal-documents/templates
```

#### Valider une réponse

```http
POST /api/legal-documents/validate
{
  "documentId": "contrat-travail-cdi",
  "questionId": "employeur_nom",
  "answer": "SARL Solutions Numériques"
}
```

#### Générer un document

```http
POST /api/legal-documents/generate
{
  "documentId": "contrat-travail-cdi",
  "answers": {
    "employeur_nom": "SARL Solutions Numériques",
    "salarie_nom": "Dupont Jean",
    ...
  }
}
```

## ✅ Avantages du système

### Pour l'utilisateur

- **Interface intuitive** : Conversation naturelle vs formulaire rigide
- **Flexibilité** : Champs optionnels selon les besoins
- **Gain de temps** : Génération automatique en quelques minutes
- **Conformité assurée** : Respect automatique des obligations légales

### Pour les développeurs

- **Extensibilité** : Ajout facile de nouveaux types de documents
- **Maintenance** : Structure modulaire et template-based
- **Validation** : Système de validation robuste et configurable
- **API complète** : Endpoints pour toutes les opérations

### Conformité juridique

- **Bases légales** : Tous les documents respectent la législation française
- **Mise à jour** : Facilité d'adaptation aux évolutions légales
- **Avertissements** : Mentions légales automatiques
- **Professionnalisme** : Documents prêts à l'usage professionnel

## 🔮 Extensions futures

- **Génération PDF** : Export direct en format PDF professionnel
- **Signatures électroniques** : Intégration de solutions de signature
- **Templates supplémentaires** : Autres documents juridiques (statuts, etc.)
- **Validation notariale** : Intégration avec services notariaux
- **Multi-langue** : Support d'autres juridictions européennes

---

**🏛️ Le système respecte scrupuleusement le droit français tout en offrant une expérience utilisateur moderne et intuitive.**
