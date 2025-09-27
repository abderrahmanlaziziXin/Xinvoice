# 🤖 Assistant IA Juridique - Guide d'utilisation

## 🎯 Vue d'ensemble

L'Assistant IA Juridique est un système conversationnel avancé qui utilise l'intelligence artificielle pour créer des documents juridiques français de manière interactive. Le système s'adapte en temps réel aux besoins de l'utilisateur et génère des documents professionnels exportables.

## ✨ Fonctionnalités

### 🗣️ Conversation IA Intelligente
- **IA Réelle** : Intégration OpenAI GPT-4o et Google Gemini
- **Mode Demo** : Système de simulation intelligent pour les tests
- **Progression Adaptative** : 4 phases dynamiques (Sélection → Questions → Génération → Finalisation)
- **Historique** : Sauvegarde complète des conversations

### 📄 Types de documents supportés
- **Contrats de travail** (CDI, CDD, stages)
- **Baux d'habitation** (vides, meublés)
- **Contrats de vente** (biens mobiliers, immobiliers)
- **Procurations** (générales, spécifiques)
- **Documents personnalisés** (système extensible)

### 💾 Export Professionnel
- **Format DOCX** : Documents Word avec formatage professionnel
- **Format PDF** : Génération jsPDF avec mise en page juridique
- **Format TXT** : Texte brut structuré
- **Téléchargement instantané** avec noms de fichiers intelligents

## 🚀 Utilisation

### 1. Accès à l'interface
```
http://localhost:3001/legal-documents/chat
```

### 2. Démarrage d'une conversation
L'utilisateur peut :
- Décrire son besoin : "Je veux créer un contrat de travail"
- Poser une question : "Quelles sont les clauses obligatoires dans un bail ?"
- Demander des conseils : "Comment rédiger une procuration ?"

### 3. Interaction IA
L'IA guide l'utilisateur à travers :
- **Phase Sélection** : Identification du type de document
- **Phase Questions** : Collecte des informations nécessaires
- **Phase Génération** : Création du contenu avec suggestions
- **Phase Finalisation** : Révision et export

### 4. Export du document
- Boutons d'export en temps réel (DOCX, PDF, TXT)
- Téléchargement automatique
- Noms de fichiers avec timestamp

## 🛠️ Architecture Technique

### Frontend (`ai-legal-document-chat.tsx`)
```typescript
// Interface conversationnelle avec :
- Gestion d'état React (messages, phases, données)
- UI responsive avec Tailwind CSS
- Intégration temps réel avec l'IA
- Boutons d'export dynamiques
```

### API Chat (`/api/legal-documents/ai-chat/route.ts`)
```typescript
// Backend IA avec :
- Intégration OpenAI/Gemini via le système LLM core
- Gestion contextuelle des conversations
- Progression intelligente entre phases
- Système de fallback pour les démos
```

### API Export (`/api/legal-documents/export/route.ts`)
```typescript
// Génération de documents avec :
- Packages DOCX pour Word
- jsPDF pour PDF
- Templates adaptatifs par type de document
- Formatage professionnel automatique
```

## 📋 Exemples d'utilisation

### Contrat de Travail
```
Utilisateur: "Je veux embaucher un développeur"
IA: "Parfait ! Créons ensemble un contrat de travail..."
→ Questions sur : employeur, salarié, poste, salaire, durée
→ Génération avec clauses obligatoires
→ Export DOCX professionnel
```

### Bail d'Habitation
```
Utilisateur: "Contrat de location meublée"
IA: "Créons votre bail meublé conforme à la loi..."
→ Questions sur : logement, durée, loyer, charges
→ Génération avec spécificités meublé
→ Export PDF juridique
```

## 🔧 Configuration Technique

### Variables d'environnement
```env
# Pour l'IA réelle
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Pour les tests (optionnel)
NODE_ENV=development
```

### Installation et Démarrage
```bash
npm install
npm run dev
# → http://localhost:3001/legal-documents/chat
```

### Tests automatisés
```bash
node test-legal-ai.js
```

## 🎨 Interface Utilisateur

### Design Moderne
- **Glass Morphism** : Effets de transparence élégants
- **Animations 3D** : Éléments flottants et transitions fluides
- **Gradient Backgrounds** : Dégradés professionnels
- **Responsive Design** : Adaptation mobile et desktop

### UX Optimisée
- **Indicateurs de saisie** : Animation pendant la génération IA
- **Historique visuel** : Messages utilisateur/IA distincts
- **Feedback instantané** : Toasts et notifications
- **Navigation intuitive** : Progression claire entre phases

## ⚖️ Conformité Juridique

### Avertissements Légaux
- Disclaimer visible sur l'interface
- Recommandation de validation professionnelle
- Mentions dans tous les documents générés
- Traçabilité de génération (timestamps)

### Droit Français
- Templates basés sur le Code civil
- Code du travail pour les contrats
- Loi de 1989 pour les baux
- Clauses obligatoires automatiques

## 🔄 Extensibilité

### Ajout de nouveaux types de documents
1. Étendre `generateDocumentWithAI()` dans l'API export
2. Ajouter des templates spécifiques
3. Configurer les prompts IA appropriés
4. Tester les nouveaux workflows

### Intégrations futures
- Base de données pour l'historique
- Système d'authentification
- Templates d'entreprise personnalisés
- API externe pour validation juridique

## 📊 Métriques et Suivi

### Logs disponibles
- Conversations IA complètes
- Types de documents générés
- Taux de succès des exports
- Temps de réponse des APIs

### Monitoring
- Performance Next.js
- Utilisation des APIs IA
- Erreurs et exceptions
- Satisfaction utilisateur

---

## 🎉 Système Opérationnel

Le système est **100% fonctionnel** avec :
- ✅ Interface conversationnelle complète
- ✅ IA réelle (OpenAI/Gemini) + mode démo
- ✅ Export professionnel (DOCX, PDF, TXT)
- ✅ Templates juridiques adaptatifs
- ✅ UX moderne et responsive
- ✅ Conformité juridique française

**Prêt pour la production !** 🚀