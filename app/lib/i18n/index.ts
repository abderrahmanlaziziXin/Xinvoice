/**
 * Platform-wide Internationalization System
 * Supports multiple languages based on user's locale settings
 */

import { Locale } from '../../../packages/core/schemas'

export interface Translations {
  [key: string]: string | Translations
}

/**
 * Translation dictionaries for different languages
 */
export const translations: Record<string, Translations> = {
  'en-US': {
    nav: {
      home: 'Home',
      newInvoice: 'New Invoice',
      batchInvoice: 'Batch Invoice', 
      newNDA: 'New NDA',
      companySettings: 'Company Settings',
      multilingualDemo: 'Multilingual Demo'
    },
    demo: {
      title: 'Multilingual Documents',
      subtitle: 'AI-powered document generation in 11+ languages with cultural context',
      companySettings: 'Company Settings',
      languageSelection: 'Language Selection',
      direction: 'Direction',
      leftToRight: 'Left-to-Right (LTR)',
      rightToLeft: 'Right-to-Left (RTL)',
      culturalContext: 'Cultural Context',
      enabled: 'Enabled',
      disabled: 'Disabled',
      documentType: 'Document Type',
      invoice: 'Invoice',
      invoiceDesc: 'Professional business invoices with AI-powered generation',
      nda: 'NDA',
      ndaDesc: 'Legal non-disclosure agreements with regional compliance',
      generationMode: 'Generation Mode',
      single: 'Single',
      singleDesc: 'Generate one document',
      batch: 'Batch',
      batchDesc: 'Generate multiple documents',
      generationOptions: 'Generation Options',
      includeUITranslations: 'Include UI translations',
      applyCulturalContext: 'Apply cultural context',
      createInvoice: 'Create Invoice in',
      createNDA: 'Create NDA in',
      smartLanguageProcessing: 'Smart Language Processing',
      smartLanguageDesc: 'Write in any language you prefer! The AI will automatically generate the invoice in {locale} with proper cultural context, regardless of your input language.',
      examplesTitle: 'Examples',
      examplesDesc: 'Write in English → Get Arabic output | Write in French → Get German output | Mix languages → Get clean output',
      promptPlaceholder: 'Describe your {documentType} in any language - AI will respond in {locale}...',
      loadSample: 'Load Sample',
      generateButton: 'Generate {documentType} in {locale}',
      createTitle: 'Create {documentType} in {locale}',
      createDescription: 'Describe your {documentType} and our AI will generate it with proper cultural context and language.'
    },
    invoice: {
      title: 'Create Invoice',
      batchTitle: 'Batch Invoice Creation',
      prompt: {
        placeholder: 'Enter some details about your invoice to get started',
        readyToGenerate: 'Ready to generate!',
        generating: 'Generating...',
        generateDraft: 'Generate Draft',
        samplePrompts: 'Sample Prompts'
      },
      form: {
        invoiceNumber: 'Invoice Number',
        date: 'Date',
        dueDate: 'Due Date',
        from: 'From',
        to: 'To',
        items: 'Items',
        description: 'Description',
        quantity: 'Quantity',
        rate: 'Rate',
        amount: 'Amount',
        subtotal: 'Subtotal',
        taxRate: 'Tax Rate (%)',
        taxAmount: 'Tax Amount',
        total: 'Total',
        terms: 'Terms',
        notes: 'Notes',
        name: 'Name',
        address: 'Address',
        email: 'Email',
        phone: 'Phone',
        // Additional form fields
        companyDetails: 'Company Details',
        clientDetails: 'Client Details',
        invoiceDetails: 'Invoice Details',
        itemsAndPricing: 'Items & Pricing',
        paymentInformation: 'Payment Information',
        additionalNotes: 'Additional Notes'
      },
      actions: {
        addItem: 'Add Item',
        removeItem: 'Remove Item',
        generate: 'Generate Invoice',
        downloadPDF: 'Download PDF',
        preview: 'Preview',
        edit: 'Edit',
        delete: 'Delete',
        submit: 'Submit',
        reset: 'Reset',
        back: 'Back',
        next: 'Next'
      },
      totals: {
        invoiceTotals: 'Invoice Totals'
      },
      placeholders: {
        invoiceNumber: 'INV-001',
        selectDate: 'Select date',
        enterDescription: 'Enter item description',
        enterQuantity: 'Qty',
        enterRate: 'Rate',
        enterTerms: 'Payment terms and conditions',
        enterNotes: 'Additional notes or instructions',
        companyName: 'Your Company Name',
        companyAddress: 'Company Address',
        companyEmail: 'company@email.com',
        companyPhone: '+1 (555) 000-0000',
        clientName: 'Client Name',
        clientAddress: 'Client Address',
        clientEmail: 'client@email.com',
        clientPhone: '+1 (555) 000-0000'
      },
      tooltips: {
        invoiceNumber: 'A unique identifier for this invoice. Use a format like INV-001, INV-2024-001, etc.',
        date: 'The date this invoice was created/issued',
        dueDate: 'When payment is expected. Typically 15-30 days from invoice date'
      },
      pdf: {
        from: 'From:',
        to: 'To:',
        invoiceNumber: 'Invoice Number:',
        invoiceDate: 'Invoice Date:',
        issueDate: 'Issue Date:',
        dueDate: 'Due Date:',
        description: 'Description',
        qty: 'Qty',
        rate: 'Rate',
        unitPrice: 'Unit Price',
        amount: 'Amount',
        total: 'Total',
        subtotal: 'Subtotal:',
        tax: 'Tax',
        grandTotal: 'Total:',
        termsConditions: 'Terms & Conditions:',
        notes: 'Notes:',
        page: 'Page',
        poweredBy: 'Powered by'
      }
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      currency: 'Currency',
      locale: 'Language/Locale',
      generate: 'Generate',
      submit: 'Submit',
      clear: 'Clear',
      reset: 'Reset',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      settings: 'Settings',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      update: 'Update'
    }
  },
  'fr-FR': {
    nav: {
      home: 'Accueil',
      newInvoice: 'Nouvelle Facture',
      batchInvoice: 'Factures en Lot',
      newNDA: 'Nouvel NDA',
      companySettings: 'Paramètres Entreprise',
      multilingualDemo: 'Démo Multilingue'
    },
    demo: {
      title: 'Documents Multilingues',
      subtitle: 'Génération de documents IA dans plus de 11 langues avec contexte culturel',
      companySettings: 'Paramètres de l\'Entreprise',
      languageSelection: 'Sélection de Langue',
      direction: 'Direction',
      leftToRight: 'Gauche à Droite (LTR)',
      rightToLeft: 'Droite à Gauche (RTL)',
      culturalContext: 'Contexte Culturel',
      enabled: 'Activé',
      disabled: 'Désactivé',
      documentType: 'Type de Document',
      invoice: 'Facture',
      invoiceDesc: 'Factures professionnelles avec génération IA',
      nda: 'NDA',
      ndaDesc: 'Accords de confidentialité avec conformité régionale',
      generationMode: 'Mode de Génération',
      single: 'Simple',
      singleDesc: 'Générer un document',
      batch: 'Lot',
      batchDesc: 'Générer plusieurs documents',
      generationOptions: 'Options de Génération',
      includeUITranslations: 'Inclure traductions de l\'interface',
      applyCulturalContext: 'Appliquer le contexte culturel',
      createInvoice: 'Créer Facture en',
      createNDA: 'Créer NDA en',
      smartLanguageProcessing: 'Traitement Intelligent des Langues',
      smartLanguageDesc: 'Écrivez dans la langue de votre choix ! L\'IA génèrera automatiquement la facture en {locale} avec le bon contexte culturel, peu importe votre langue d\'entrée.',
      examplesTitle: 'Exemples',
      examplesDesc: 'Écrivez en anglais → Obtenez du contenu arabe | Écrivez en français → Obtenez du contenu allemand | Mélangez les langues → Obtenez un contenu propre',
      promptPlaceholder: 'Décrivez votre {documentType} dans n\'importe quelle langue - l\'IA répondra en {locale}...',
      loadSample: 'Charger Exemple',
      generateButton: 'Générer {documentType} en {locale}',
      createTitle: 'Créer {documentType} en {locale}',
      createDescription: 'Décrivez votre {documentType} et notre IA le générera avec le contexte culturel et la langue appropriés.'
    },
    invoice: {
      title: 'Créer Facture',
      batchTitle: 'Création de Factures en Lot',
      prompt: {
        placeholder: 'Entrez quelques détails sur votre facture pour commencer',
        readyToGenerate: 'Prêt à générer !',
        generating: 'Génération...',
        generateDraft: 'Générer Brouillon',
        samplePrompts: 'Exemples de Prompts'
      },
      form: {
        invoiceNumber: 'Numéro de Facture',
        date: 'Date',
        dueDate: 'Date d\'Échéance',
        from: 'De',
        to: 'À',
        items: 'Articles',
        description: 'Description',
        quantity: 'Quantité',
        rate: 'Taux',
        amount: 'Montant',
        subtotal: 'Sous-total',
        taxRate: 'Taux de Taxe (%)',
        taxAmount: 'Montant Taxe',
        total: 'Total',
        terms: 'Conditions',
        notes: 'Notes',
        name: 'Nom',
        address: 'Adresse',
        email: 'Email',
        phone: 'Téléphone',
        // Additional form fields
        companyDetails: 'Détails de l\'Entreprise',
        clientDetails: 'Détails du Client',
        invoiceDetails: 'Détails de la Facture',
        itemsAndPricing: 'Articles et Prix',
        paymentInformation: 'Informations de Paiement',
        additionalNotes: 'Notes Supplémentaires'
      },
      actions: {
        addItem: 'Ajouter Article',
        removeItem: 'Supprimer Article',
        generate: 'Générer Facture',
        downloadPDF: 'Télécharger PDF',
        preview: 'Aperçu',
        edit: 'Modifier',
        delete: 'Supprimer',
        submit: 'Soumettre',
        reset: 'Réinitialiser',
        back: 'Retour',
        next: 'Suivant'
      },
      totals: {
        invoiceTotals: 'Totaux Facture'
      },
      placeholders: {
        invoiceNumber: 'FAC-001',
        selectDate: 'Sélectionner la date',
        enterDescription: 'Saisir la description',
        enterQuantity: 'Qté',
        enterRate: 'Taux',
        enterTerms: 'Conditions de paiement',
        enterNotes: 'Notes supplémentaires',
        companyName: 'Nom de Votre Entreprise',
        companyAddress: 'Adresse de l\'Entreprise',
        companyEmail: 'entreprise@email.com',
        companyPhone: '+33 1 00 00 00 00',
        clientName: 'Nom du Client',
        clientAddress: 'Adresse du Client',
        clientEmail: 'client@email.com',
        clientPhone: '+33 1 00 00 00 00'
      },
      tooltips: {
        invoiceNumber: 'Un identifiant unique pour cette facture. Utilisez un format comme FAC-001, FAC-2024-001, etc.',
        date: 'La date à laquelle cette facture a été créée/émise',
        dueDate: 'Quand le paiement est attendu. Généralement 15-30 jours après la date de facture'
      },
      pdf: {
        from: 'De :',
        to: 'À :',
        invoiceNumber: 'Numéro de Facture :',
        invoiceDate: 'Date de Facture :',
        issueDate: 'Date d\'Émission :',
        dueDate: 'Date d\'Échéance :',
        description: 'Description',
        qty: 'Qté',
        rate: 'Taux',
        unitPrice: 'Prix Unitaire',
        amount: 'Montant',
        total: 'Total',
        subtotal: 'Sous-total :',
        tax: 'Taxe',
        grandTotal: 'Total :',
        termsConditions: 'Conditions Générales :',
        notes: 'Notes :',
        page: 'Page',
        poweredBy: 'Propulsé par'
      }
    },
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      loading: 'Chargement...',
      success: 'Succès',
      error: 'Erreur',
      currency: 'Devise',
      locale: 'Langue/Région',
      generate: 'Générer',
      submit: 'Soumettre',
      clear: 'Effacer',
      reset: 'Réinitialiser',
      continue: 'Continuer',
      back: 'Retour',
      next: 'Suivant',
      settings: 'Paramètres',
      edit: 'Modifier',
      delete: 'Supprimer',
      create: 'Créer',
      update: 'Mettre à jour'
    }
  },
  'ar-DZ': {
    nav: {
      home: 'الرئيسية',
      newInvoice: 'فاتورة جديدة',
      batchInvoice: 'فواتير متعددة',
      newNDA: 'اتفاقية سرية جديدة',
      companySettings: 'إعدادات الشركة',
      multilingualDemo: 'عرض متعدد اللغات'
    },
    demo: {
      title: 'وثائق متعددة اللغات',
      subtitle: 'إنشاء وثائق بالذكاء الاصطناعي بأكثر من 11 لغة مع السياق الثقافي',
      companySettings: 'إعدادات الشركة',
      languageSelection: 'اختيار اللغة',
      direction: 'الاتجاه',
      leftToRight: 'من اليسار إلى اليمين (LTR)',
      rightToLeft: 'من اليمين إلى اليسار (RTL)',
      culturalContext: 'السياق الثقافي',
      enabled: 'مفعل',
      disabled: 'معطل',
      documentType: 'نوع الوثيقة',
      invoice: 'فاتورة',
      invoiceDesc: 'فواتير مهنية مع إنشاء بالذكاء الاصطناعي',
      nda: 'اتفاقية سرية',
      ndaDesc: 'اتفاقيات عدم الإفشاء مع الامتثال الإقليمي',
      generationMode: 'نمط الإنشاء',
      single: 'فردي',
      singleDesc: 'إنشاء وثيقة واحدة',
      batch: 'دفعة',
      batchDesc: 'إنشاء عدة وثائق',
      generationOptions: 'خيارات الإنشاء',
      includeUITranslations: 'تضمين ترجمات الواجهة',
      applyCulturalContext: 'تطبيق السياق الثقافي',
      createInvoice: 'إنشاء فاتورة بـ',
      createNDA: 'إنشاء اتفاقية سرية بـ',
      smartLanguageProcessing: 'معالجة ذكية للغات',
      smartLanguageDesc: 'اكتب بأي لغة تفضلها! سيقوم الذكاء الاصطناعي بإنشاء الفاتورة تلقائياً بـ {locale} مع السياق الثقافي المناسب، بغض النظر عن لغة الإدخال.',
      examplesTitle: 'أمثلة',
      examplesDesc: 'اكتب بالإنجليزية → احصل على نتائج عربية | اكتب بالفرنسية → احصل على نتائج ألمانية | امزج اللغات → احصل على نتائج نظيفة',
      promptPlaceholder: 'صف {documentType} بأي لغة - سيرد الذكاء الاصطناعي بـ {locale}...',
      loadSample: 'تحميل مثال',
      generateButton: 'إنشاء {documentType} بـ {locale}',
      createTitle: 'إنشاء {documentType} بـ {locale}',
      createDescription: 'صف {documentType} الخاص بك وسيقوم الذكاء الاصطناعي بإنشائه مع السياق الثقافي واللغة المناسبة.'
    },
    invoice: {
      title: 'إنشاء فاتورة',
      batchTitle: 'إنشاء فواتير متعددة',
      prompt: {
        placeholder: 'أدخل بعض التفاصيل حول فاتورتك للبدء',
        readyToGenerate: 'جاهز للإنشاء!',
        generating: 'جاري الإنشاء...',
        generateDraft: 'إنشاء مسودة',
        samplePrompts: 'أمثلة الطلبات'
      },
      form: {
        invoiceNumber: 'رقم الفاتورة',
        date: 'التاريخ',
        dueDate: 'تاريخ الاستحقاق',
        from: 'من',
        to: 'إلى',
        items: 'العناصر',
        description: 'الوصف',
        quantity: 'الكمية',
        rate: 'السعر',
        amount: 'المبلغ',
        subtotal: 'المجموع الفرعي',
        taxRate: 'معدل الضريبة (%)',
        taxAmount: 'مبلغ الضريبة',
        total: 'المجموع الكلي',
        terms: 'الشروط',
        notes: 'ملاحظات',
        name: 'الاسم',
        address: 'العنوان',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        // Additional form fields
        companyDetails: 'تفاصيل الشركة',
        clientDetails: 'تفاصيل العميل',
        invoiceDetails: 'تفاصيل الفاتورة',
        itemsAndPricing: 'العناصر والأسعار',
        paymentInformation: 'معلومات الدفع',
        additionalNotes: 'ملاحظات إضافية'
      },
      actions: {
        addItem: 'إضافة عنصر',
        removeItem: 'حذف عنصر',
        generate: 'إنشاء فاتورة',
        downloadPDF: 'تحميل PDF',
        preview: 'معاينة',
        edit: 'تعديل',
        delete: 'حذف',
        submit: 'إرسال',
        reset: 'إعادة تعيين',
        back: 'رجوع',
        next: 'التالي'
      },
      totals: {
        invoiceTotals: 'مجاميع الفاتورة'
      },
      placeholders: {
        invoiceNumber: 'فات-001',
        selectDate: 'اختر التاريخ',
        enterDescription: 'أدخل وصف العنصر',
        enterQuantity: 'الكمية',
        enterRate: 'السعر',
        enterTerms: 'شروط وأحكام الدفع',
        enterNotes: 'ملاحظات أو تعليمات إضافية',
        companyName: 'اسم شركتك',
        companyAddress: 'عنوان الشركة',
        companyEmail: 'الشركة@بريد.كوم',
        companyPhone: '+213 XX XX XX XX',
        clientName: 'اسم العميل',
        clientAddress: 'عنوان العميل',
        clientEmail: 'العميل@بريد.كوم',
        clientPhone: '+213 XX XX XX XX'
      },
      tooltips: {
        invoiceNumber: 'معرف فريد لهذه الفاتورة. استخدم تنسيقاً مثل فات-001، فات-2024-001، إلخ.',
        date: 'التاريخ الذي تم إنشاء/إصدار هذه الفاتورة فيه',
        dueDate: 'متى يُتوقع الدفع. عادة 15-30 يوماً من تاريخ الفاتورة'
      },
      pdf: {
        from: 'من :',
        to: 'إلى :',
        invoiceNumber: 'رقم الفاتورة :',
        invoiceDate: 'تاريخ الفاتورة :',
        issueDate: 'تاريخ الإصدار :',
        dueDate: 'تاريخ الاستحقاق :',
        description: 'الوصف',
        qty: 'الكمية',
        rate: 'السعر',
        unitPrice: 'سعر الوحدة',
        amount: 'المبلغ',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي :',
        tax: 'الضريبة',
        grandTotal: 'المجموع الإجمالي :',
        termsConditions: 'الشروط والأحكام :',
        notes: 'ملاحظات :',
        page: 'صفحة',
        poweredBy: 'مدعوم بواسطة'
      }
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      success: 'نجح',
      error: 'خطأ',
      currency: 'العملة',
      locale: 'اللغة/المنطقة',
      generate: 'إنشاء',
      submit: 'إرسال',
      clear: 'مسح',
      reset: 'إعادة تعيين',
      continue: 'متابعة',
      back: 'رجوع',
      next: 'التالي',
      settings: 'الإعدادات',
      edit: 'تعديل',
      delete: 'حذف',
      create: 'إنشاء',
      update: 'تحديث'
    }
  },
  'ar-MA': {
    nav: {
      newInvoice: 'فاتورة جديدة',
      batchInvoice: 'فواتير متعددة',
      newNDA: 'اتفاقية سرية جديدة',
      companySettings: 'إعدادات الشركة',
      multilingualDemo: 'عرض متعدد اللغات'
    },
    invoice: {
      title: 'إنشاء فاتورة',
      batchTitle: 'إنشاء فواتير متعددة',
      form: {
        invoiceNumber: 'رقم الفاتورة',
        date: 'التاريخ',
        dueDate: 'تاريخ الاستحقاق',
        from: 'من',
        to: 'إلى',
        items: 'العناصر',
        description: 'الوصف',
        quantity: 'الكمية',
        rate: 'السعر',
        amount: 'المبلغ',
        subtotal: 'المجموع الفرعي',
        taxRate: 'معدل الضريبة (%)',
        taxAmount: 'مبلغ الضريبة',
        total: 'المجموع الكلي',
        terms: 'الشروط',
        notes: 'ملاحظات',
        name: 'الاسم',
        address: 'العنوان',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف'
      },
      actions: {
        addItem: 'إضافة عنصر',
        removeItem: 'حذف عنصر',
        generate: 'إنشاء فاتورة',
        downloadPDF: 'تحميل PDF',
        preview: 'معاينة',
        edit: 'تعديل',
        delete: 'حذف'
      },
      totals: {
        invoiceTotals: 'مجاميع الفاتورة'
      }
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      success: 'نجح',
      error: 'خطأ',
      currency: 'العملة',
      locale: 'اللغة/المنطقة'
    }
  },
  'de-DE': {
    nav: {
      newInvoice: 'Neue Rechnung',
      batchInvoice: 'Stapel-Rechnung',
      newNDA: 'Neue NDA',
      companySettings: 'Firmeneinstellungen',
      multilingualDemo: 'Mehrsprachige Demo'
    },
    invoice: {
      title: 'Rechnung Erstellen',
      batchTitle: 'Stapel-Rechnungserstellung',
      form: {
        invoiceNumber: 'Rechnungsnummer',
        date: 'Datum',
        dueDate: 'Fälligkeitsdatum',
        from: 'Von',
        to: 'An',
        items: 'Artikel',
        description: 'Beschreibung',
        quantity: 'Menge',
        rate: 'Rate',
        amount: 'Betrag',
        subtotal: 'Zwischensumme',
        taxRate: 'Steuersatz (%)',
        taxAmount: 'Steuerbetrag',
        total: 'Gesamt',
        terms: 'Bedingungen',
        notes: 'Notizen',
        name: 'Name',
        address: 'Adresse',
        email: 'E-Mail',
        phone: 'Telefon'
      },
      actions: {
        addItem: 'Artikel Hinzufügen',
        removeItem: 'Artikel Entfernen',
        generate: 'Rechnung Generieren',
        downloadPDF: 'PDF Herunterladen',
        preview: 'Vorschau',
        edit: 'Bearbeiten',
        delete: 'Löschen'
      },
      totals: {
        invoiceTotals: 'Rechnungssummen'
      }
    },
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schließen',
      loading: 'Wird geladen...',
      success: 'Erfolg',
      error: 'Fehler',
      currency: 'Währung',
      locale: 'Sprache/Region'
    }
  }
}

/**
 * Get translation for a key path
 */
export function getTranslation(locale: Locale, keyPath: string): string {
  const keys = keyPath.split('.')
  let current: any = translations[locale] || translations['en-US']
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      // Fallback to English if translation not found
      let fallback: any = translations['en-US']
      for (const fallbackKey of keys) {
        if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
          fallback = fallback[fallbackKey]
        } else {
          return keyPath // Return key path if translation not found
        }
      }
      return fallback
    }
  }
  
  return typeof current === 'string' ? current : keyPath
}

/**
 * Translation hook for React components
 */
export function useTranslation(locale: Locale) {
  const t = (keyPath: string) => getTranslation(locale, keyPath)
  
  return { t }
}

/**
 * Check if locale is RTL (Right-to-Left)
 */
export function isRTL(locale: Locale): boolean {
  return locale.startsWith('ar-') || locale.startsWith('he-') || locale.startsWith('fa-')
}

/**
 * Get direction for CSS based on locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}
