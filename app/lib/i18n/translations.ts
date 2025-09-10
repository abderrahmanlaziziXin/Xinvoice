/**
 * Comprehensive Multilingual Translation System
 * Supports invoices and NDAs in multiple languages
 */

export const translations = {
  'en-US': {
    common: {
      invoice: 'Invoice',
      nda: 'Non-Disclosure Agreement',
      date: 'Date',
      dueDate: 'Due Date',
      amount: 'Amount',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax',
      description: 'Description',
      quantity: 'Quantity',
      rate: 'Rate',
      from: 'From',
      to: 'To',
      billTo: 'Bill To',
      shipTo: 'Ship To',
      notes: 'Notes',
      terms: 'Terms & Conditions',
      paymentInstructions: 'Payment Instructions',
      page: 'Page',
      of: 'of',
      currency: 'Currency',
      locale: 'Locale',
    },
    invoice: {
      title: 'Invoice',
      number: 'Invoice Number',
      header: 'Invoice Details',
      itemsHeader: 'Items',
      paymentDue: 'Payment Due',
      remittanceAdvice: 'Remittance Advice',
      thankYou: 'Thank you for your business!',
      paymentTerms: 'Payment Terms',
      lateFees: 'Late fees may apply to overdue payments',
      pleaseRemit: 'Please remit payment to the address above',
    },
    nda: {
      title: 'Non-Disclosure Agreement',
      effectiveDate: 'Effective Date',
      terminationDate: 'Termination Date',
      disclosingParty: 'Disclosing Party',
      receivingParty: 'Receiving Party',
      purpose: 'Purpose',
      termMonths: 'Term (Months)',
      jurisdiction: 'Jurisdiction',
      mutualAgreement: 'Mutual Agreement',
      confidentialityLevel: 'Confidentiality Level',
      governingLaw: 'Governing Law',
      signatures: 'Signatures',
      witnessSignature: 'Witness Signature',
      agreementPurpose: 'Agreement Purpose',
      confidentialInformation: 'Confidential Information',
      obligations: 'Obligations',
      exclusions: 'Exclusions',
      termAndTermination: 'Term and Termination',
    },
    formats: {
      dateFormat: 'MM/DD/YYYY',
      currencyPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      direction: 'ltr',
    }
  },
  'fr-FR': {
    common: {
      invoice: 'Facture',
      nda: 'Accord de Confidentialité',
      date: 'Date',
      dueDate: 'Date d\'échéance',
      amount: 'Montant',
      total: 'Total',
      subtotal: 'Sous-total',
      tax: 'TVA',
      description: 'Description',
      quantity: 'Quantité',
      rate: 'Tarif',
      from: 'De',
      to: 'À',
      billTo: 'Facturer à',
      shipTo: 'Livrer à',
      notes: 'Notes',
      terms: 'Conditions Générales',
      paymentInstructions: 'Instructions de Paiement',
      page: 'Page',
      of: 'sur',
      currency: 'Devise',
      locale: 'Locale',
    },
    invoice: {
      title: 'Facture',
      number: 'Numéro de Facture',
      header: 'Détails de la Facture',
      itemsHeader: 'Articles',
      paymentDue: 'Paiement Dû',
      remittanceAdvice: 'Avis de Remise',
      thankYou: 'Merci pour votre confiance!',
      paymentTerms: 'Conditions de Paiement',
      lateFees: 'Des frais de retard peuvent s\'appliquer aux paiements en retard',
      pleaseRemit: 'Veuillez effectuer le paiement à l\'adresse ci-dessus',
    },
    nda: {
      title: 'Accord de Confidentialité',
      effectiveDate: 'Date d\'Entrée en Vigueur',
      terminationDate: 'Date de Résiliation',
      disclosingParty: 'Partie Divulgatrice',
      receivingParty: 'Partie Réceptrice',
      purpose: 'Objet',
      termMonths: 'Durée (Mois)',
      jurisdiction: 'Juridiction',
      mutualAgreement: 'Accord Mutuel',
      confidentialityLevel: 'Niveau de Confidentialité',
      governingLaw: 'Droit Applicable',
      signatures: 'Signatures',
      witnessSignature: 'Signature du Témoin',
      agreementPurpose: 'Objet de l\'Accord',
      confidentialInformation: 'Informations Confidentielles',
      obligations: 'Obligations',
      exclusions: 'Exclusions',
      termAndTermination: 'Durée et Résiliation',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'after',
      decimalSeparator: ',',
      thousandsSeparator: ' ',
      direction: 'ltr',
    }
  },
  'de-DE': {
    common: {
      invoice: 'Rechnung',
      nda: 'Geheimhaltungsvereinbarung',
      date: 'Datum',
      dueDate: 'Fälligkeitsdatum',
      amount: 'Betrag',
      total: 'Gesamt',
      subtotal: 'Zwischensumme',
      tax: 'MwSt.',
      description: 'Beschreibung',
      quantity: 'Menge',
      rate: 'Preis',
      from: 'Von',
      to: 'An',
      billTo: 'Rechnung an',
      shipTo: 'Lieferung an',
      notes: 'Notizen',
      terms: 'Geschäftsbedingungen',
      paymentInstructions: 'Zahlungsanweisungen',
      page: 'Seite',
      of: 'von',
      currency: 'Währung',
      locale: 'Sprache',
    },
    invoice: {
      title: 'Rechnung',
      number: 'Rechnungsnummer',
      header: 'Rechnungsdetails',
      itemsHeader: 'Positionen',
      paymentDue: 'Fällige Zahlung',
      remittanceAdvice: 'Zahlungshinweis',
      thankYou: 'Vielen Dank für Ihr Vertrauen!',
      paymentTerms: 'Zahlungsbedingungen',
      lateFees: 'Bei verspäteter Zahlung können Verzugszinsen anfallen',
      pleaseRemit: 'Bitte überweisen Sie den Betrag an die oben angegebene Adresse',
    },
    nda: {
      title: 'Geheimhaltungsvereinbarung',
      effectiveDate: 'Inkrafttreten',
      terminationDate: 'Beendigungsdatum',
      disclosingParty: 'Offenlegende Partei',
      receivingParty: 'Empfangende Partei',
      purpose: 'Zweck',
      termMonths: 'Laufzeit (Monate)',
      jurisdiction: 'Gerichtsstand',
      mutualAgreement: 'Gegenseitige Vereinbarung',
      confidentialityLevel: 'Vertraulichkeitsstufe',
      governingLaw: 'Anwendbares Recht',
      signatures: 'Unterschriften',
      witnessSignature: 'Zeugenunterschrift',
      agreementPurpose: 'Zweck der Vereinbarung',
      confidentialInformation: 'Vertrauliche Informationen',
      obligations: 'Verpflichtungen',
      exclusions: 'Ausnahmen',
      termAndTermination: 'Laufzeit und Beendigung',
    },
    formats: {
      dateFormat: 'DD.MM.YYYY',
      currencyPosition: 'after',
      decimalSeparator: ',',
      thousandsSeparator: '.',
      direction: 'ltr',
    }
  },
  'es-ES': {
    common: {
      invoice: 'Factura',
      nda: 'Acuerdo de Confidencialidad',
      date: 'Fecha',
      dueDate: 'Fecha de Vencimiento',
      amount: 'Importe',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'IVA',
      description: 'Descripción',
      quantity: 'Cantidad',
      rate: 'Tarifa',
      from: 'De',
      to: 'Para',
      billTo: 'Facturar a',
      shipTo: 'Enviar a',
      notes: 'Notas',
      terms: 'Términos y Condiciones',
      paymentInstructions: 'Instrucciones de Pago',
      page: 'Página',
      of: 'de',
      currency: 'Moneda',
      locale: 'Configuración Regional',
    },
    invoice: {
      title: 'Factura',
      number: 'Número de Factura',
      header: 'Detalles de la Factura',
      itemsHeader: 'Artículos',
      paymentDue: 'Pago Vencido',
      remittanceAdvice: 'Aviso de Remesa',
      thankYou: '¡Gracias por su negocio!',
      paymentTerms: 'Términos de Pago',
      lateFees: 'Se pueden aplicar cargos por mora a los pagos vencidos',
      pleaseRemit: 'Por favor, envíe el pago a la dirección anterior',
    },
    nda: {
      title: 'Acuerdo de Confidencialidad',
      effectiveDate: 'Fecha Efectiva',
      terminationDate: 'Fecha de Terminación',
      disclosingParty: 'Parte Reveladora',
      receivingParty: 'Parte Receptora',
      purpose: 'Propósito',
      termMonths: 'Plazo (Meses)',
      jurisdiction: 'Jurisdicción',
      mutualAgreement: 'Acuerdo Mutuo',
      confidentialityLevel: 'Nivel de Confidencialidad',
      governingLaw: 'Ley Aplicable',
      signatures: 'Firmas',
      witnessSignature: 'Firma del Testigo',
      agreementPurpose: 'Propósito del Acuerdo',
      confidentialInformation: 'Información Confidencial',
      obligations: 'Obligaciones',
      exclusions: 'Exclusiones',
      termAndTermination: 'Plazo y Terminación',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'before',
      decimalSeparator: ',',
      thousandsSeparator: '.',
      direction: 'ltr',
    }
  },
  'ar-SA': {
    common: {
      invoice: 'فاتورة',
      nda: 'اتفاقية عدم الإفشاء',
      date: 'التاريخ',
      dueDate: 'تاريخ الاستحقاق',
      amount: 'المبلغ',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      tax: 'الضريبة',
      description: 'الوصف',
      quantity: 'الكمية',
      rate: 'السعر',
      from: 'من',
      to: 'إلى',
      billTo: 'إرسال الفاتورة إلى',
      shipTo: 'إرسال إلى',
      notes: 'ملاحظات',
      terms: 'الشروط والأحكام',
      paymentInstructions: 'تعليمات الدفع',
      page: 'صفحة',
      of: 'من',
      currency: 'العملة',
      locale: 'الإعدادات المحلية',
    },
    invoice: {
      title: 'فاتورة',
      number: 'رقم الفاتورة',
      header: 'تفاصيل الفاتورة',
      itemsHeader: 'البنود',
      paymentDue: 'الدفع المستحق',
      remittanceAdvice: 'إشعار الحوالة',
      thankYou: 'شكراً لك على ثقتك!',
      paymentTerms: 'شروط الدفع',
      lateFees: 'قد تطبق رسوم التأخير على المدفوعات المتأخرة',
      pleaseRemit: 'يرجى إرسال الدفعة إلى العنوان أعلاه',
    },
    nda: {
      title: 'اتفاقية عدم الإفشاء',
      effectiveDate: 'تاريخ السريان',
      terminationDate: 'تاريخ الانتهاء',
      disclosingParty: 'الطرف الكاشف',
      receivingParty: 'الطرف المتلقي',
      purpose: 'الغرض',
      termMonths: 'المدة (بالأشهر)',
      jurisdiction: 'الاختصاص القضائي',
      mutualAgreement: 'اتفاقية متبادلة',
      confidentialityLevel: 'مستوى السرية',
      governingLaw: 'القانون الحاكم',
      signatures: 'التوقيعات',
      witnessSignature: 'توقيع الشاهد',
      agreementPurpose: 'غرض الاتفاقية',
      confidentialInformation: 'المعلومات السرية',
      obligations: 'الالتزامات',
      exclusions: 'الاستثناءات',
      termAndTermination: 'المدة والإنهاء',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'after',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      direction: 'rtl',
    }
  },
  'zh-CN': {
    common: {
      invoice: '发票',
      nda: '保密协议',
      date: '日期',
      dueDate: '到期日',
      amount: '金额',
      total: '总计',
      subtotal: '小计',
      tax: '税费',
      description: '描述',
      quantity: '数量',
      rate: '单价',
      from: '发件人',
      to: '收件人',
      billTo: '账单地址',
      shipTo: '发货地址',
      notes: '备注',
      terms: '条款与条件',
      paymentInstructions: '付款说明',
      page: '页',
      of: '共',
      currency: '货币',
      locale: '地区设置',
    },
    invoice: {
      title: '发票',
      number: '发票号码',
      header: '发票详情',
      itemsHeader: '项目',
      paymentDue: '应付款项',
      remittanceAdvice: '汇款通知',
      thankYou: '感谢您的业务！',
      paymentTerms: '付款条件',
      lateFees: '逾期付款可能产生滞纳金',
      pleaseRemit: '请将款项汇至上述地址',
    },
    nda: {
      title: '保密协议',
      effectiveDate: '生效日期',
      terminationDate: '终止日期',
      disclosingParty: '披露方',
      receivingParty: '接收方',
      purpose: '目的',
      termMonths: '期限（月）',
      jurisdiction: '管辖权',
      mutualAgreement: '相互协议',
      confidentialityLevel: '保密级别',
      governingLaw: '适用法律',
      signatures: '签名',
      witnessSignature: '见证人签名',
      agreementPurpose: '协议目的',
      confidentialInformation: '保密信息',
      obligations: '义务',
      exclusions: '排除条款',
      termAndTermination: '期限与终止',
    },
    formats: {
      dateFormat: 'YYYY/MM/DD',
      currencyPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      direction: 'ltr',
    }
  },
  'ja-JP': {
    common: {
      invoice: '請求書',
      nda: '秘密保持契約',
      date: '日付',
      dueDate: '支払期限',
      amount: '金額',
      total: '合計',
      subtotal: '小計',
      tax: '税金',
      description: '説明',
      quantity: '数量',
      rate: '単価',
      from: '差出人',
      to: '宛先',
      billTo: '請求先',
      shipTo: '配送先',
      notes: '備考',
      terms: '利用規約',
      paymentInstructions: '支払方法',
      page: 'ページ',
      of: '/',
      currency: '通貨',
      locale: 'ロケール',
    },
    invoice: {
      title: '請求書',
      number: '請求書番号',
      header: '請求書詳細',
      itemsHeader: '項目',
      paymentDue: '支払期限',
      remittanceAdvice: '送金通知',
      thankYou: 'ありがとうございます！',
      paymentTerms: '支払条件',
      lateFees: '延滞料金が発生する場合があります',
      pleaseRemit: '上記住所までお支払いください',
    },
    nda: {
      title: '秘密保持契約',
      effectiveDate: '発効日',
      terminationDate: '終了日',
      disclosingParty: '開示者',
      receivingParty: '受領者',
      purpose: '目的',
      termMonths: '期間（月）',
      jurisdiction: '管轄',
      mutualAgreement: '相互契約',
      confidentialityLevel: '機密レベル',
      governingLaw: '準拠法',
      signatures: '署名',
      witnessSignature: '立会人署名',
      agreementPurpose: '契約目的',
      confidentialInformation: '機密情報',
      obligations: '義務',
      exclusions: '除外事項',
      termAndTermination: '期間と終了',
    },
    formats: {
      dateFormat: 'YYYY/MM/DD',
      currencyPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      direction: 'ltr',
    }
  },
  'pt-BR': {
    common: {
      invoice: 'Fatura',
      nda: 'Acordo de Confidencialidade',
      date: 'Data',
      dueDate: 'Data de Vencimento',
      amount: 'Valor',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Imposto',
      description: 'Descrição',
      quantity: 'Quantidade',
      rate: 'Taxa',
      from: 'De',
      to: 'Para',
      billTo: 'Cobrar de',
      shipTo: 'Enviar para',
      notes: 'Observações',
      terms: 'Termos e Condições',
      paymentInstructions: 'Instruções de Pagamento',
      page: 'Página',
      of: 'de',
      currency: 'Moeda',
      locale: 'Localização',
    },
    invoice: {
      title: 'Fatura',
      number: 'Número da Fatura',
      header: 'Detalhes da Fatura',
      itemsHeader: 'Itens',
      paymentDue: 'Pagamento Devido',
      remittanceAdvice: 'Aviso de Remessa',
      thankYou: 'Obrigado pelo seu negócio!',
      paymentTerms: 'Termos de Pagamento',
      lateFees: 'Taxas de atraso podem ser aplicadas a pagamentos em atraso',
      pleaseRemit: 'Por favor, envie o pagamento para o endereço acima',
    },
    nda: {
      title: 'Acordo de Confidencialidade',
      effectiveDate: 'Data Efetiva',
      terminationDate: 'Data de Término',
      disclosingParty: 'Parte Reveladora',
      receivingParty: 'Parte Receptora',
      purpose: 'Propósito',
      termMonths: 'Prazo (Meses)',
      jurisdiction: 'Jurisdição',
      mutualAgreement: 'Acordo Mútuo',
      confidentialityLevel: 'Nível de Confidencialidade',
      governingLaw: 'Lei Aplicável',
      signatures: 'Assinaturas',
      witnessSignature: 'Assinatura da Testemunha',
      agreementPurpose: 'Propósito do Acordo',
      confidentialInformation: 'Informações Confidenciais',
      obligations: 'Obrigações',
      exclusions: 'Exclusões',
      termAndTermination: 'Prazo e Término',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'before',
      decimalSeparator: ',',
      thousandsSeparator: '.',
      direction: 'ltr',
    }
  },
  'it-IT': {
    common: {
      invoice: 'Fattura',
      nda: 'Accordo di Riservatezza',
      date: 'Data',
      dueDate: 'Data di Scadenza',
      amount: 'Importo',
      total: 'Totale',
      subtotal: 'Subtotale',
      tax: 'IVA',
      description: 'Descrizione',
      quantity: 'Quantità',
      rate: 'Tariffa',
      from: 'Da',
      to: 'A',
      billTo: 'Fatturare a',
      shipTo: 'Spedire a',
      notes: 'Note',
      terms: 'Termini e Condizioni',
      paymentInstructions: 'Istruzioni di Pagamento',
      page: 'Pagina',
      of: 'di',
      currency: 'Valuta',
      locale: 'Localizzazione',
    },
    invoice: {
      title: 'Fattura',
      number: 'Numero Fattura',
      header: 'Dettagli Fattura',
      itemsHeader: 'Articoli',
      paymentDue: 'Pagamento Dovuto',
      remittanceAdvice: 'Avviso di Rimessa',
      thankYou: 'Grazie per il vostro business!',
      paymentTerms: 'Termini di Pagamento',
      lateFees: 'Potrebbero essere applicate commissioni per ritardato pagamento',
      pleaseRemit: 'Si prega di inviare il pagamento all\'indirizzo sopra',
    },
    nda: {
      title: 'Accordo di Riservatezza',
      effectiveDate: 'Data Effettiva',
      terminationDate: 'Data di Terminazione',
      disclosingParty: 'Parte Rivelatrice',
      receivingParty: 'Parte Ricevente',
      purpose: 'Scopo',
      termMonths: 'Durata (Mesi)',
      jurisdiction: 'Giurisdizione',
      mutualAgreement: 'Accordo Reciproco',
      confidentialityLevel: 'Livello di Riservatezza',
      governingLaw: 'Legge Applicabile',
      signatures: 'Firme',
      witnessSignature: 'Firma del Testimone',
      agreementPurpose: 'Scopo dell\'Accordo',
      confidentialInformation: 'Informazioni Riservate',
      obligations: 'Obblighi',
      exclusions: 'Esclusioni',
      termAndTermination: 'Durata e Terminazione',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'after',
      decimalSeparator: ',',
      thousandsSeparator: '.',
      direction: 'ltr',
    }
  },
  'ru-RU': {
    common: {
      invoice: 'Счет-фактура',
      nda: 'Соглашение о Неразглашении',
      date: 'Дата',
      dueDate: 'Срок оплаты',
      amount: 'Сумма',
      total: 'Итого',
      subtotal: 'Промежуточный итог',
      tax: 'Налог',
      description: 'Описание',
      quantity: 'Количество',
      rate: 'Ставка',
      from: 'От',
      to: 'Кому',
      billTo: 'Плательщик',
      shipTo: 'Доставка',
      notes: 'Примечания',
      terms: 'Условия',
      paymentInstructions: 'Инструкции по оплате',
      page: 'Страница',
      of: 'из',
      currency: 'Валюта',
      locale: 'Локализация',
    },
    invoice: {
      title: 'Счет-фактура',
      number: 'Номер счета',
      header: 'Детали счета',
      itemsHeader: 'Позиции',
      paymentDue: 'К оплате',
      remittanceAdvice: 'Уведомление о переводе',
      thankYou: 'Спасибо за ваш бизнес!',
      paymentTerms: 'Условия оплаты',
      lateFees: 'За просрочку платежа могут взиматься штрафы',
      pleaseRemit: 'Просьба перевести оплату по указанному адресу',
    },
    nda: {
      title: 'Соглашение о Неразглашении',
      effectiveDate: 'Дата вступления в силу',
      terminationDate: 'Дата окончания',
      disclosingParty: 'Раскрывающая сторона',
      receivingParty: 'Получающая сторона',
      purpose: 'Цель',
      termMonths: 'Срок (месяцы)',
      jurisdiction: 'Юрисдикция',
      mutualAgreement: 'Взаимное соглашение',
      confidentialityLevel: 'Уровень конфиденциальности',
      governingLaw: 'Применимое право',
      signatures: 'Подписи',
      witnessSignature: 'Подпись свидетеля',
      agreementPurpose: 'Цель соглашения',
      confidentialInformation: 'Конфиденциальная информация',
      obligations: 'Обязательства',
      exclusions: 'Исключения',
      termAndTermination: 'Срок и прекращение',
    },
    formats: {
      dateFormat: 'DD.MM.YYYY',
      currencyPosition: 'after',
      decimalSeparator: ',',
      thousandsSeparator: ' ',
      direction: 'ltr',
    }
  },
  'hi-IN': {
    common: {
      invoice: 'चालान',
      nda: 'गोपनीयता समझौता',
      date: 'दिनांक',
      dueDate: 'देय तिथि',
      amount: 'राशि',
      total: 'कुल',
      subtotal: 'उप-योग',
      tax: 'कर',
      description: 'विवरण',
      quantity: 'मात्रा',
      rate: 'दर',
      from: 'से',
      to: 'को',
      billTo: 'बिल भेजना',
      shipTo: 'शिप करना',
      notes: 'टिप्पणियां',
      terms: 'नियम और शर्तें',
      paymentInstructions: 'भुगतान निर्देश',
      page: 'पृष्ठ',
      of: 'का',
      currency: 'मुद्रा',
      locale: 'स्थान',
    },
    invoice: {
      title: 'चालान',
      number: 'चालान संख्या',
      header: 'चालान विवरण',
      itemsHeader: 'वस्तुएं',
      paymentDue: 'देय भुगतान',
      remittanceAdvice: 'प्रेषण सलाह',
      thankYou: 'आपके व्यवसाय के लिए धन्यवाद!',
      paymentTerms: 'भुगतान की शर्तें',
      lateFees: 'विलंबित भुगतान पर विलंब शुल्क लगाया जा सकता है',
      pleaseRemit: 'कृपया उपरोक्त पते पर भुगतान भेजें',
    },
    nda: {
      title: 'गोपनीयता समझौता',
      effectiveDate: 'प्रभावी तिथि',
      terminationDate: 'समाप्ति तिथि',
      disclosingParty: 'प्रकटीकरण पक्ष',
      receivingParty: 'प्राप्त करने वाला पक्ष',
      purpose: 'उद्देश्य',
      termMonths: 'अवधि (महीने)',
      jurisdiction: 'न्यायाधिकार',
      mutualAgreement: 'पारस्परिक समझौता',
      confidentialityLevel: 'गोपनीयता स्तर',
      governingLaw: 'शासी कानून',
      signatures: 'हस्ताक्षर',
      witnessSignature: 'गवाह हस्ताक्षर',
      agreementPurpose: 'समझौते का उद्देश्य',
      confidentialInformation: 'गोपनीय जानकारी',
      obligations: 'दायित्व',
      exclusions: 'अपवाद',
      termAndTermination: 'अवधि और समाप्ति',
    },
    formats: {
      dateFormat: 'DD/MM/YYYY',
      currencyPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      direction: 'ltr',
    }
  },
} as const;

export type SupportedLocale = keyof typeof translations;
export type TranslationKeys = typeof translations['en-US'];

/**
 * Get translation for a specific locale and key path
 */
export function getTranslation(
  locale: SupportedLocale,
  keyPath: string,
  fallback?: string
): string {
  const keys = keyPath.split('.');
  let current: any = translations[locale] || translations['en-US'];
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      // Fallback to English if key not found
      current = translations['en-US'];
      for (const fallbackKey of keys) {
        if (current && typeof current === 'object' && fallbackKey in current) {
          current = current[fallbackKey];
        } else {
          return fallback || keyPath;
        }
      }
      break;
    }
  }
  
  return typeof current === 'string' ? current : fallback || keyPath;
}

/**
 * Get all translations for a specific locale
 */
export function getLocaleTranslations(locale: SupportedLocale) {
  return translations[locale] || translations['en-US'];
}

/**
 * Check if locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in translations;
}

/**
 * Get format information for a locale
 */
export function getLocaleFormat(locale: SupportedLocale) {
  const localeData = translations[locale] || translations['en-US'];
  return localeData.formats;
}

/**
 * Format date according to locale
 */
export function formatDateForLocale(date: Date | string, locale: SupportedLocale): string {
  const format = getLocaleFormat(locale);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();
  
  return format.dateFormat
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
}

/**
 * Format currency according to locale
 */
export function formatCurrencyForLocale(
  amount: number,
  currency: string,
  locale: SupportedLocale
): string {
  const format = getLocaleFormat(locale);
  
  // Format the number with proper separators
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandsSeparator);
  const decimalPart = parts[1];
  
  const formattedAmount = `${integerPart}${format.decimalSeparator}${decimalPart}`;
  
  // Add currency symbol
  if (format.currencyPosition === 'before') {
    return `${currency} ${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currency}`;
  }
}

/**
 * Get direction for locale (LTR or RTL)
 */
export function getTextDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return getLocaleFormat(locale).direction as 'ltr' | 'rtl';
}
