import {
  TeamMember,
  Contact,
  Lead,
  Conversation,
  Message,
  FollowUp,
  KnowledgeArticle,
  AISettingsConfig,
  WhatsAppSettingsConfig,
  CompanySettingsConfig,
  CRMNotification
} from '../types/crm';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Arjun Nair',
    email: 'arjun@TechnovaSolutions.in',
    role: 'ADMIN',
    phone: '+91 98470 10001',
    isActive: true,
    assignedLeadsCount: 2,
    activeChatsCount: 2,
    lastLoginAt: '2026-09-28 09:15'
  },
  {
    id: 'usr-2',
    name: 'Meera Krishnan',
    email: 'meera@TechnovaSolutions.in',
    role: 'MANAGER',
    phone: '+91 98470 10002',
    isActive: true,
    assignedLeadsCount: 3,
    activeChatsCount: 3,
    lastLoginAt: '2026-09-28 09:42'
  },
  {
    id: 'usr-3',
    name: 'Rohan Varghese',
    email: 'rohan@TechnovaSolutions.in',
    role: 'AGENT',
    phone: '+91 98470 10003',
    isActive: true,
    assignedLeadsCount: 2,
    activeChatsCount: 2,
    lastLoginAt: '2026-09-28 10:04'
  },
  {
    id: 'usr-4',
    name: 'Divya Menon',
    email: 'divya@TechnovaSolutions.in',
    role: 'AGENT',
    phone: '+91 98470 10004',
    isActive: true,
    assignedLeadsCount: 1,
    activeChatsCount: 1,
    lastLoginAt: '2026-09-28 08:50'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Rahul Menon',
    phone: '+91 98470 11223',
    email: 'rahul.menon@spiceskerala.com',
    company: 'Malabar Spice Exports',
    location: 'Kochi, Kerala',
    source: 'WhatsApp Inbound',
    tags: ['E-Commerce', 'High Budget', 'Manglish'],
    notes: [
      {
        id: 'n-101',
        content: 'Wants multi-currency checkout (INR & USD) plus Razorpay and Shiprocket integration.',
        authorName: 'Rohan Varghese',
        createdAt: '2026-09-28 10:12'
      }
    ],
    createdAt: '2026-09-25',
    lastInteractionAt: '10 mins ago',
    totalConversations: 2,
    totalMessages: 14
  },
  {
    id: 'cnt-2',
    name: 'Anita Desai',
    phone: '+91 98201 44556',
    email: 'anita.desai@metroretail.in',
    company: 'Metro Retail Chains Pvt Ltd',
    location: 'Bengaluru, Karnataka',
    source: 'Website WhatsApp CTA',
    tags: ['Enterprise ERP', 'Human Escalation', 'Urgent'],
    notes: [
      {
        id: 'n-102',
        content: 'Requested urgent call with Senior Solutions Architect regarding 45-branch SAP integration.',
        authorName: 'Meera Krishnan',
        createdAt: '2026-09-28 09:55'
      }
    ],
    createdAt: '2026-09-26',
    lastInteractionAt: '24 mins ago',
    totalConversations: 1,
    totalMessages: 9
  },
  {
    id: 'cnt-3',
    name: 'Dr. Sreejith Nair',
    phone: '+91 94471 88990',
    email: 'dr.sreejith@pranavaclinic.org',
    company: 'Pranava Wellness Clinic',
    location: 'Trivandrum, Kerala',
    source: 'Instagram Ad Click-to-WhatsApp',
    tags: ['Healthcare', 'Digital Marketing', 'Malayalam'],
    notes: [],
    createdAt: '2026-09-27',
    lastInteractionAt: '1 hour ago',
    totalConversations: 1,
    totalMessages: 6
  },
  {
    id: 'cnt-4',
    name: 'Vikramaditya Rao',
    phone: '+91 99001 77321',
    email: 'vikram@finedgecapital.com',
    company: 'FinEdge Wealth Advisory',
    location: 'Mumbai, Maharashtra',
    source: 'Google Search Ad',
    tags: ['Mobile App', 'FinTech', 'Proposal Stage'],
    notes: [
      {
        id: 'n-104',
        content: 'Shared technical architecture PDF over WhatsApp. Needs iOS + Android Flutter build.',
        authorName: 'Arjun Nair',
        createdAt: '2026-09-27 16:40'
      }
    ],
    createdAt: '2026-09-20',
    lastInteractionAt: '2 hours ago',
    totalConversations: 3,
    totalMessages: 22
  },
  {
    id: 'cnt-5',
    name: 'Fathima Suhara',
    phone: '+91 97452 33109',
    email: 'fathima@zayaboutique.in',
    company: 'Zaya Bridal Boutique',
    location: 'Calicut, Kerala',
    source: 'WhatsApp Inbound',
    tags: ['Shopify', 'WhatsApp Automation', 'Manglish'],
    notes: [],
    createdAt: '2026-09-27',
    lastInteractionAt: '3 hours ago',
    totalConversations: 1,
    totalMessages: 8
  },
  {
    id: 'cnt-6',
    name: 'Karthik Subramanian',
    phone: '+91 98402 65120',
    email: 'karthik@chennailogistics.com',
    company: 'Southern Freight Systems',
    location: 'Chennai, Tamil Nadu',
    source: 'Referral',
    tags: ['Existing Customer', 'Support Request'],
    notes: [],
    createdAt: '2026-08-14',
    lastInteractionAt: '5 hours ago',
    totalConversations: 4,
    totalMessages: 31
  },
  {
    id: 'cnt-7',
    name: 'Nikhil Thomas',
    phone: '+91 96331 09812',
    email: 'nikhil.t@gmail.com',
    company: 'Independent Inquiry',
    location: 'Kottayam, Kerala',
    source: 'WhatsApp Inbound',
    tags: ['Early Stage', 'Brochure Sent'],
    notes: [],
    createdAt: '2026-09-28',
    lastInteractionAt: 'Yesterday',
    totalConversations: 1,
    totalMessages: 4
  },
  {
    id: 'cnt-8',
    name: 'Aishwarya Shenoy',
    phone: '+91 98860 51234',
    email: 'aishwarya@aurorastudio.design',
    company: 'Aurora Interior Studio',
    location: 'Kochi, Kerala',
    source: 'Website WhatsApp CTA',
    tags: ['Web Development', 'Portfolio Site'],
    notes: [],
    createdAt: '2026-09-22',
    lastInteractionAt: 'Yesterday',
    totalConversations: 2,
    totalMessages: 15
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'ld-1',
    contactId: 'cnt-1',
    conversationId: 'conv-1',
    leadStatus: 'QUALIFIED',
    leadType: 'HOT',
    leadScore: 91,
    interestedService: 'Web Development (E-Commerce)',
    budget: '₹1,00,000',
    timeline: 'Next month (October)',
    requirements: [
      'Custom E-commerce website',
      'Razorpay & international payment gateway',
      'Automated inventory & Shiprocket integration',
      'Mobile-responsive product catalog'
    ],
    source: 'WhatsApp Inbound',
    assignedAgentId: 'usr-3',
    aiSummary:
      'Customer wants a full-featured e-commerce website for spice exports with a confirmed budget of ₹1 lakh and wants to start next month. High purchase intent detected in Manglish conversation.',
    purchaseIntent: true,
    lastInteractionAt: '10 mins ago',
    nextFollowUpAt: '2026-09-28 15:00',
    createdAt: '2026-09-25',
    updatedAt: '2026-09-28',
    notes: [
      {
        id: 'ln-1',
        content: 'AI qualified budget and timeline automatically. Ready for formal quotation PDF.',
        authorName: 'Rohan Varghese',
        createdAt: '2026-09-28 10:15'
      }
    ]
  },
  {
    id: 'ld-2',
    contactId: 'cnt-2',
    conversationId: 'conv-2',
    leadStatus: 'NEGOTIATION',
    leadType: 'HOT',
    leadScore: 89,
    interestedService: 'Custom Cloud ERP & SAP Integration',
    budget: '₹8,50,000',
    timeline: 'Immediate (Q4 Rollout)',
    requirements: [
      'Multi-warehouse inventory sync across 45 retail branches',
      'Two-way SAP B1 connector',
      'Automated WhatsApp digital invoice dispatch'
    ],
    source: 'Website WhatsApp CTA',
    assignedAgentId: 'usr-2',
    aiSummary:
      'Enterprise retail director inquiring about 45-branch ERP + SAP integration. Explicitly requested urgent human manager consultation. AI paused auto-reply and triggered Human Handoff.',
    purchaseIntent: true,
    lastInteractionAt: '24 mins ago',
    nextFollowUpAt: '2026-09-28 12:30',
    createdAt: '2026-09-26',
    updatedAt: '2026-09-28',
    notes: [
      {
        id: 'ln-2',
        content: 'Escalated by AI due to explicit manager request + complex enterprise scope.',
        authorName: 'Meera Krishnan',
        createdAt: '2026-09-28 09:50'
      }
    ]
  },
  {
    id: 'ld-3',
    contactId: 'cnt-3',
    conversationId: 'conv-3',
    leadStatus: 'CONTACTED',
    leadType: 'WARM',
    leadScore: 58,
    interestedService: 'Digital Marketing & Google Ads',
    budget: '₹20,000 / month',
    timeline: 'Within 3 weeks',
    requirements: [
      'Malayalam & English social media creatives',
      'Local Google Search Ads for Trivandrum clinic',
      'WhatsApp appointment lead generation'
    ],
    source: 'Instagram Ad Click-to-WhatsApp',
    assignedAgentId: 'usr-4',
    aiSummary:
      'Doctor inquired in Malayalam regarding digital marketing and Google Ads packages for a new wellness clinic in Trivandrum. Interested in the ₹15k–₹25k monthly growth plan.',
    purchaseIntent: false,
    lastInteractionAt: '1 hour ago',
    nextFollowUpAt: '2026-09-28 17:00',
    createdAt: '2026-09-27',
    updatedAt: '2026-09-28',
    notes: []
  },
  {
    id: 'ld-4',
    contactId: 'cnt-4',
    conversationId: 'conv-4',
    leadStatus: 'PROPOSAL',
    leadType: 'HOT',
    leadScore: 94,
    interestedService: 'Mobile App Development (Flutter)',
    budget: '₹3,20,000',
    timeline: '2 Months',
    requirements: [
      'iOS and Android wealth portfolio tracker',
      'Biometric login & KYC document upload',
      'Real-time mutual fund NAV API integration'
    ],
    source: 'Google Search Ad',
    assignedAgentId: 'usr-1',
    aiSummary:
      'High-value FinTech lead with clear technical scope and ₹3.2L budget. Proposal shared; customer asked for milestone payment schedule.',
    purchaseIntent: true,
    lastInteractionAt: '2 hours ago',
    nextFollowUpAt: '2026-09-28 16:30',
    createdAt: '2026-09-20',
    updatedAt: '2026-09-28',
    notes: []
  },
  {
    id: 'ld-5',
    contactId: 'cnt-5',
    conversationId: 'conv-5',
    leadStatus: 'QUALIFIED',
    leadType: 'WARM',
    leadScore: 72,
    interestedService: 'WhatsApp Catalog & Shopify Store',
    budget: '₹65,000',
    timeline: 'Before festive season',
    requirements: [
      'Bridal collection catalog website',
      'WhatsApp automated order confirmation',
      'Instagram shop sync'
    ],
    source: 'WhatsApp Inbound',
    assignedAgentId: 'usr-3',
    aiSummary:
      'Boutique owner in Calicut wants a Shopify/custom store with WhatsApp catalog automation before the upcoming festive season. Budget around ₹65k.',
    purchaseIntent: true,
    lastInteractionAt: '3 hours ago',
    nextFollowUpAt: '2026-09-29 11:00',
    createdAt: '2026-09-27',
    updatedAt: '2026-09-28',
    notes: []
  },
  {
    id: 'ld-6',
    contactId: 'cnt-6',
    conversationId: 'conv-6',
    leadStatus: 'WON',
    leadType: 'EXISTING_CUSTOMER',
    leadScore: 85,
    interestedService: 'Annual Maintenance & Cloud Hosting',
    budget: '₹1,50,000 / year',
    timeline: 'Active Contract',
    requirements: ['AWS server scaling', 'Monthly security patching', 'Priority SLA support'],
    source: 'Referral',
    assignedAgentId: 'usr-2',
    aiSummary:
      'Existing logistics client requesting an additional API webhook module for their live fleet portal.',
    purchaseIntent: true,
    lastInteractionAt: '5 hours ago',
    createdAt: '2026-08-14',
    updatedAt: '2026-09-28',
    notes: []
  },
  {
    id: 'ld-7',
    contactId: 'cnt-7',
    conversationId: 'conv-7',
    leadStatus: 'NEW',
    leadType: 'COLD',
    leadScore: 24,
    interestedService: 'General Inquiry',
    budget: 'Not disclosed',
    timeline: 'Not specified',
    requirements: ['General company service brochure'],
    source: 'WhatsApp Inbound',
    assignedAgentId: 'usr-4',
    aiSummary:
      'Sent a brief greeting asking what services the company provides. AI shared service overview and asked qualification questions; awaiting customer response.',
    purchaseIntent: false,
    lastInteractionAt: 'Yesterday',
    createdAt: '2026-09-28',
    updatedAt: '2026-09-28',
    notes: []
  },
  {
    id: 'ld-8',
    contactId: 'cnt-8',
    conversationId: 'conv-8',
    leadStatus: 'WON',
    leadType: 'HOT',
    leadScore: 96,
    interestedService: 'Corporate Brand Website',
    budget: '₹85,000',
    timeline: 'Completed Kickoff',
    requirements: ['Architectural portfolio gallery', '3D walkthrough embeds', 'Lead capture CRM sync'],
    source: 'Website WhatsApp CTA',
    assignedAgentId: 'usr-1',
    aiSummary:
      'Interior studio confirmed ₹85,000 package and paid 50% advance after AI + Agent consultation.',
    purchaseIntent: true,
    lastInteractionAt: 'Yesterday',
    createdAt: '2026-09-22',
    updatedAt: '2026-09-27',
    notes: []
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    contactId: 'cnt-1',
    leadId: 'ld-1',
    assignedAgentId: 'usr-3',
    status: 'OPEN',
    aiEnabled: true,
    needsHumanAttention: false,
    unreadCount: 1,
    lastMessage: 'Njangalkku oru e-commerce website undakkanam with payment gateway. Budget around ₹100000 aanu. Next month start cheyyan pattuo?',
    lastMessageTime: '10:32 AM',
    language: 'Manglish'
  },
  {
    id: 'conv-2',
    contactId: 'cnt-2',
    leadId: 'ld-2',
    assignedAgentId: 'usr-2',
    status: 'HUMAN_HANDOFF',
    aiEnabled: false,
    needsHumanAttention: true,
    handoffReason: 'Customer explicitly requested Senior Solutions Manager + Complex 45-branch SAP ERP quotation',
    unreadCount: 2,
    lastMessage: 'Can I speak to your senior solutions manager urgently regarding our 45-branch SAP integration?',
    lastMessageTime: '10:18 AM',
    language: 'English'
  },
  {
    id: 'conv-3',
    contactId: 'cnt-3',
    leadId: 'ld-3',
    assignedAgentId: 'usr-4',
    status: 'OPEN',
    aiEnabled: true,
    needsHumanAttention: false,
    unreadCount: 0,
    lastMessage: 'ഞങ്ങളുടെ പുതിയ ക്ലിനിക്കിന് വേണ്ടി സോഷ്യൽ മീഡിയ മാർക്കറ്റിംഗും ഗൂഗിൾ ആഡ്സും ചെയ്യാൻ പാക്കേജുകൾ ഉണ്ടോ?',
    lastMessageTime: '09:45 AM',
    language: 'Malayalam'
  },
  {
    id: 'conv-4',
    contactId: 'cnt-4',
    leadId: 'ld-4',
    assignedAgentId: 'usr-1',
    status: 'OPEN',
    aiEnabled: false,
    needsHumanAttention: false,
    unreadCount: 0,
    lastMessage: 'We reviewed the ₹3.2L Flutter proposal. Can we schedule a quick call at 4:30 PM today to finalize milestones?',
    lastMessageTime: '08:50 AM',
    language: 'English'
  },
  {
    id: 'conv-5',
    contactId: 'cnt-5',
    leadId: 'ld-5',
    assignedAgentId: 'usr-3',
    status: 'OPEN',
    aiEnabled: true,
    needsHumanAttention: false,
    unreadCount: 0,
    lastMessage: 'Bridal boutique-nu vendi WhatsApp order booking ulla website cheyyumo? Budget ₹65k aanu.',
    lastMessageTime: 'Yesterday',
    language: 'Manglish'
  },
  {
    id: 'conv-6',
    contactId: 'cnt-6',
    leadId: 'ld-6',
    assignedAgentId: 'usr-2',
    status: 'HUMAN_HANDOFF',
    aiEnabled: false,
    needsHumanAttention: true,
    handoffReason: 'Existing enterprise customer requesting custom SLA production change',
    unreadCount: 1,
    lastMessage: 'Need our account manager to approve the new GPS webhook rate limit on our production server.',
    lastMessageTime: 'Yesterday',
    language: 'English'
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-101',
      conversationId: 'conv-1',
      whatsappMessageId: 'wamid.HBgMOTE5ODQ3MDExMjIzFQIAEhggMTIzNDU2Nzg5MA==',
      senderType: 'CUSTOMER',
      senderName: 'Rahul Menon',
      content: 'Hi, Website undakkanam. Rate ethra aanu?',
      timestamp: '10:28 AM',
      deliveryStatus: 'READ'
    },
    {
      id: 'msg-102',
      conversationId: 'conv-1',
      whatsappMessageId: 'wamid.HBgMOTE5ODQ3MDExMjIzFQIAEhggMTIzNDU2Nzg5MQ==',
      senderType: 'AI',
      senderName: 'PulseFlow AI Assistant',
      content:
        'Hello Rahul! Sure, website development cheyyan pattum. Pricing ningalude required features anusarich aanu — Basic Business Websites ₹35,000 muthalum, Full E-Commerce Stores ₹75,000 muthalum start cheyyunnu. Ningalkku ethu type website aanu vendathu?',
      timestamp: '10:28 AM',
      deliveryStatus: 'READ',
      aiMetadata: {
        reply:
          'Hello Rahul! Sure, website development cheyyan pattum. Pricing ningalude required features anusarich aanu — Basic Business Websites ₹35,000 muthalum, Full E-Commerce Stores ₹75,000 muthalum start cheyyunnu. Ningalkku ethu type website aanu vendathu?',
        intent: 'pricing_enquiry',
        service: 'web_development',
        leadType: 'WARM',
        leadScore: 54,
        budget: 'Not specified',
        timeline: 'Not specified',
        requirements: ['Website development'],
        summary: 'Customer inquired in Manglish about website development pricing.',
        needsHuman: false,
        confidence: 0.95
      }
    },
    {
      id: 'msg-103',
      conversationId: 'conv-1',
      whatsappMessageId: 'wamid.HBgMOTE5ODQ3MDExMjIzFQIAEhggMTIzNDU2Nzg5Mg==',
      senderType: 'CUSTOMER',
      senderName: 'Rahul Menon',
      content:
        'Njangalkku oru e-commerce website undakkanam with payment gateway. Budget around ₹100000 aanu. Next month start cheyyan pattuo?',
      timestamp: '10:32 AM',
      deliveryStatus: 'READ'
    },
    {
      id: 'msg-104',
      conversationId: 'conv-1',
      whatsappMessageId: 'wamid.HBgMOTE5ODQ3MDExMjIzFQIAEhggMTIzNDU2Nzg5Mw==',
      senderType: 'AI',
      senderName: 'PulseFlow AI Assistant',
      content:
        'Theerchayayum Rahul! ₹1,00,000 budget-il custom E-Commerce website, Razorpay/UPI payment gateway, pinne automated inventory management ellam ulppeduthi cheythu tharan pattum. Next month thanne project start cheyyam. Nammude specialist innu 3:00 PM-nu oru demo call cheyyatte?',
      timestamp: '10:32 AM',
      deliveryStatus: 'DELIVERED',
      aiMetadata: {
        reply:
          'Theerchayayum Rahul! ₹1,00,000 budget-il custom E-Commerce website, Razorpay/UPI payment gateway, pinne automated inventory management ellam ulppeduthi cheythu tharan pattum. Next month thanne project start cheyyam. Nammude specialist innu 3:00 PM-nu oru demo call cheyyatte?',
        intent: 'purchase_intent',
        service: 'web_development',
        leadType: 'HOT',
        leadScore: 91,
        budget: '₹100000',
        timeline: 'Next month',
        requirements: ['E-commerce website', 'Payment gateway integration'],
        summary:
          'Customer wants an e-commerce website with a budget of ₹1 lakh and wants to start next month.',
        needsHuman: false,
        confidence: 0.94
      }
    }
  ],
  'conv-2': [
    {
      id: 'msg-201',
      conversationId: 'conv-2',
      whatsappMessageId: 'wamid.HBgMOTE5ODIwMTQ0NTU2FQIAEhggAA==',
      senderType: 'CUSTOMER',
      senderName: 'Anita Desai',
      content:
        'Hello, we are evaluating vendors for a custom multi-warehouse ERP integrated with SAP Business One across 45 retail branches.',
      timestamp: '10:14 AM',
      deliveryStatus: 'READ',
      attachments: [
        {
          id: 'att-1',
          name: 'MetroRetail_RFP_Requirements_v2.pdf',
          type: 'DOCUMENT',
          size: '1.8 MB',
          url: '#'
        }
      ]
    },
    {
      id: 'msg-202',
      conversationId: 'conv-2',
      whatsappMessageId: 'wamid.HBgMOTE5ODIwMTQ0NTU2FQIAEhggAB==',
      senderType: 'CUSTOMER',
      senderName: 'Anita Desai',
      content:
        'Can I speak to your senior solutions manager urgently regarding our 45-branch SAP integration?',
      timestamp: '10:18 AM',
      deliveryStatus: 'READ'
    },
    {
      id: 'msg-203',
      conversationId: 'conv-2',
      whatsappMessageId: 'wamid.HBgMOTE5ODIwMTQ0NTU2FQIAEhggAC==',
      senderType: 'AI',
      senderName: 'PulseFlow AI Assistant',
      content:
        'Thank you for sharing your RFP requirements, Anita. Since you require a custom 45-branch SAP Business One integration and requested to speak with our Senior Solutions Manager, I have immediately escalated this conversation to Meera Krishnan (Solutions Manager). She will respond to you right here shortly.',
      timestamp: '10:18 AM',
      deliveryStatus: 'READ',
      aiMetadata: {
        reply:
          'Thank you for sharing your RFP requirements, Anita. Since you require a custom 45-branch SAP Business One integration and requested to speak with our Senior Solutions Manager, I have immediately escalated this conversation to Meera Krishnan (Solutions Manager). She will respond to you right here shortly.',
        intent: 'human_request',
        service: 'custom_erp_integration',
        leadType: 'HOT',
        leadScore: 89,
        budget: '₹8,50,000 (Estimated Enterprise)',
        timeline: 'Urgent',
        requirements: ['45-branch ERP', 'SAP Business One integration'],
        summary:
          'Enterprise prospect requested urgent handover to Senior Solutions Manager for a 45-branch SAP ERP integration.',
        needsHuman: true,
        confidence: 0.96
      }
    }
  ],
  'conv-3': [
    {
      id: 'msg-301',
      conversationId: 'conv-3',
      whatsappMessageId: 'wamid.HBgMOTE5NDQ3MTg4OTkwFQIAEhggBA==',
      senderType: 'CUSTOMER',
      senderName: 'Dr. Sreejith Nair',
      content:
        'ഞങ്ങളുടെ പുതിയ ക്ലിനിക്കിന് വേണ്ടി സോഷ്യൽ മീഡിയ മാർക്കറ്റിംഗും ഗൂഗിൾ ആഡ്സും ചെയ്യാൻ പാക്കേജുകൾ ഉണ്ടോ?',
      timestamp: '09:44 AM',
      deliveryStatus: 'READ'
    },
    {
      id: 'msg-302',
      conversationId: 'conv-3',
      whatsappMessageId: 'wamid.HBgMOTE5NDQ3MTg4OTkwFQIAEhggBB==',
      senderType: 'AI',
      senderName: 'PulseFlow AI Assistant',
      content:
        'നമസ്കാരം ഡോ. ശ്രീജിത്ത്! ക്ലിനിക്കുകൾക്കും ഹെൽത്ത്കെയർ സ്ഥാപനങ്ങൾക്കും വേണ്ടി ഞങ്ങളുടെ പക്കൽ പ്രത്യേക സോഷ്യൽ മീഡിയ മാർക്കറ്റിംഗ്, Google Ads പാക്കേജുകൾ ലഭ്യമാണ്. പ്രതിമാസം ₹15,000 മുതൽ പാക്കേജുകൾ ആരംഭിക്കുന്നു. നിങ്ങളുടെ ക്ലിനിക്ക് ഏത് സ്ഥലത്താണ് പ്രവർത്തിക്കുന്നത് എന്ന് വ്യക്തമാക്കാമോ?',
      timestamp: '09:45 AM',
      deliveryStatus: 'READ',
      aiMetadata: {
        reply:
          'നമസ്കാരം ഡോ. ശ്രീജിത്ത്! ക്ലിനിക്കുകൾക്കും ഹെൽത്ത്കെയർ സ്ഥാപനങ്ങൾക്കും വേണ്ടി ഞങ്ങളുടെ പക്കൽ പ്രത്യേക സോഷ്യൽ മീഡിയ മാർക്കറ്റിംഗ്, Google Ads പാക്കേജുകൾ ലഭ്യമാണ്. പ്രതിമാസം ₹15,000 മുതൽ പാക്കേജുകൾ ആരംഭിക്കുന്നു. നിങ്ങളുടെ ക്ലിനിക്ക് ഏത് സ്ഥലത്താണ് പ്രവർത്തിക്കുന്നത് എന്ന് വ്യക്തമാക്കാമോ?',
        intent: 'service_enquiry',
        service: 'digital_marketing',
        leadType: 'WARM',
        leadScore: 58,
        budget: '₹15,000 - ₹25,000 / month',
        timeline: 'New clinic launch',
        requirements: ['Social Media Marketing', 'Google Ads for Healthcare Clinic'],
        summary: 'Doctor inquired in Malayalam about Social Media Marketing and Google Ads packages for a new clinic.',
        needsHuman: false,
        confidence: 0.93
      }
    }
  ],
  'conv-4': [
    {
      id: 'msg-401',
      conversationId: 'conv-4',
      whatsappMessageId: 'wamid.HBgMOTE5OTAwMTc3MzIxFQIAEhggCA==',
      senderType: 'HUMAN_AGENT',
      senderName: 'Arjun Nair',
      content:
        'Hi Vikram, I have uploaded the revised Flutter iOS/Android architecture & milestone plan for FinEdge Wealth Advisory.',
      timestamp: '08:40 AM',
      deliveryStatus: 'READ'
    },
    {
      id: 'msg-402',
      conversationId: 'conv-4',
      whatsappMessageId: 'wamid.HBgMOTE5OTAwMTc3MzIxFQIAEhggCB==',
      senderType: 'CUSTOMER',
      senderName: 'Vikramaditya Rao',
      content:
        'We reviewed the ₹3.2L Flutter proposal. Can we schedule a quick call at 4:30 PM today to finalize milestones?',
      timestamp: '08:50 AM',
      deliveryStatus: 'READ'
    }
  ]
};

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu-1',
    leadId: 'ld-2',
    contactId: 'cnt-2',
    assignedUserId: 'usr-2',
    date: '2026-09-28',
    time: '12:30',
    note: 'Urgent architecture review call with Anita Desai for 45-branch SAP ERP integration.',
    status: 'PENDING'
  },
  {
    id: 'fu-2',
    leadId: 'ld-1',
    contactId: 'cnt-1',
    assignedUserId: 'usr-3',
    date: '2026-09-28',
    time: '15:00',
    note: 'Send E-Commerce quotation PDF (₹1,00,000 package) and demo link to Rahul Menon.',
    status: 'PENDING'
  },
  {
    id: 'fu-3',
    leadId: 'ld-4',
    contactId: 'cnt-4',
    assignedUserId: 'usr-1',
    date: '2026-09-28',
    time: '16:30',
    note: 'Milestone sign-off call with Vikramaditya Rao for ₹3.2L Flutter mobile app.',
    status: 'PENDING'
  },
  {
    id: 'fu-4',
    leadId: 'ld-3',
    contactId: 'cnt-3',
    assignedUserId: 'usr-4',
    date: '2026-09-28',
    time: '17:00',
    note: 'Share Malayalam healthcare case studies with Dr. Sreejith Nair.',
    status: 'PENDING'
  },
  {
    id: 'fu-5',
    leadId: 'ld-5',
    contactId: 'cnt-5',
    assignedUserId: 'usr-3',
    date: '2026-09-27',
    time: '14:00',
    note: 'Follow up on Bridal Boutique catalog theme preferences.',
    status: 'OVERDUE'
  },
  {
    id: 'fu-6',
    leadId: 'ld-8',
    contactId: 'cnt-8',
    assignedUserId: 'usr-1',
    date: '2026-09-26',
    time: '11:00',
    note: 'Confirm advance invoice receipt and onboarding kickoff.',
    status: 'COMPLETED'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    category: 'COMPANY_INFO',
    title: 'About TechNova Digital Solutions',
    content:
      'TechNova Digital Solutions is a full-stack software engineering and digital growth agency headquartered in InfoPark Kochi, with regional offices in Bengaluru and Trivandrum. We specialize in Custom Web Development, E-Commerce Platforms, Flutter Mobile Apps, Cloud ERP Integrations, and Performance Digital Marketing.',
    keywords: ['company', 'about', 'office', 'kochi', 'infopark', 'services'],
    isActive: true,
    updatedAt: '2026-09-20'
  },
  {
    id: 'kb-2',
    category: 'PRICING',
    title: 'Web Development & E-Commerce Pricing Tiers',
    content:
      '1. Corporate & Business Websites: Starts at ₹35,000 (5–10 pages, responsive CMS, SEO setup, 2 weeks delivery).\n2. Custom E-Commerce Website: ₹75,000 to ₹1,25,000 (Includes custom UI, Razorpay/Stripe payment gateway, Shiprocket logistics integration, automated GST invoicing, and inventory dashboard, 4–5 weeks delivery).\n3. Enterprise Custom Portals: Quoted after architecture review.',
    keywords: ['price', 'rate', 'cost', 'website', 'ecommerce', 'budget', 'ethra'],
    isActive: true,
    updatedAt: '2026-09-24'
  },
  {
    id: 'kb-3',
    category: 'SERVICES',
    title: 'Mobile App Development (iOS & Android)',
    content:
      'We build cross-platform Flutter and React Native mobile applications as well as native iOS/Android apps. Standard MVP packages start at ₹1,80,000 and full enterprise apps range from ₹2,50,000 to ₹6,00,000 with 6–10 weeks delivery.',
    keywords: ['mobile app', 'android', 'ios', 'flutter', 'application'],
    isActive: true,
    updatedAt: '2026-09-22'
  },
  {
    id: 'kb-4',
    category: 'PRICING',
    title: 'Digital Marketing, SEO & Google Ads Retainers',
    content:
      'Starter Growth Package: ₹15,000/month (12 social creatives, Meta Ads management, monthly reporting).\nClinic & Local Business Accelerator: ₹22,000/month (Google Search Ads, Instagram Reels, WhatsApp click-to-chat lead generation, Malayalam + English ad copy).',
    keywords: ['marketing', 'seo', 'google ads', 'social media', 'clinic', 'ads'],
    isActive: true,
    updatedAt: '2026-09-25'
  },
  {
    id: 'kb-5',
    category: 'BUSINESS_HOURS',
    title: 'Standard Operating Hours & Support SLA',
    content:
      'Sales & Consultation Hours: Monday to Saturday, 9:00 AM to 7:00 PM IST. WhatsApp AI Assistant is available 24/7. Critical Enterprise SLA support operates 24/7 with a 30-minute response guarantee.',
    keywords: ['hours', 'timing', 'open', 'support', 'sunday', 'time'],
    isActive: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'kb-6',
    category: 'POLICIES',
    title: 'Payment Terms, Milestones & Refund Policy',
    content:
      'Standard projects follow a 40% advance, 40% staging approval, and 20% pre-launch milestone structure. All deliverables include 90 days of complimentary post-launch warranty support. Any refund or billing dispute requires immediate escalation to a Human Account Manager.',
    keywords: ['payment', 'advance', 'refund', 'policy', 'milestone', 'warranty'],
    isActive: true,
    updatedAt: '2026-09-19'
  }
];

export const INITIAL_AI_SETTINGS: AISettingsConfig = {
  aiEnabled: true,
  autoReplyEnabled: true,
  provider: 'OPENAI',
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxResponseLength: 350,
  scoreThresholds: {
    coldMax: 30,
    warmMax: 60,
    qualifiedMax: 80,
    hotMin: 81
  },
  humanHandoffThreshold: 0.70,
  businessTone: 'PROFESSIONAL',
  responseLanguage: 'AUTO',
  systemPrompt: `You are the AI sales assistant for TechNova Digital Solutions.

Your responsibilities:
- Answer customer questions professionally and concisely
- Understand customer intent and identify the requested service
- Ask relevant qualification questions (budget, timeline, core requirements)
- Provide accurate company information strictly from the Knowledge Base
- Never invent information, prices, or unsupported services
- Maintain conversation context across messages
- Support English, Malayalam, and Manglish naturally (if a customer writes Manglish like "Website undakkanam. Rate ethra aanu?", reply naturally in helpful Manglish)
- Detect when human assistance is required and set needsHuman = true for complaints, refund issues, manager requests, or complex custom enterprise quotes.`
};

export const INITIAL_WHATSAPP_SETTINGS: WhatsAppSettingsConfig = {
  phoneNumberId: '109283746512345',
  businessAccountId: '987654321098765',
  displayPhoneNumber: '+91 98470 00999',
  verifyToken: 'pulseflow_webhook_verify_secret_token',
  webhookUrl: 'https://api.pulseflow-crm.in/api/webhooks/whatsapp',
  isConnected: true,
  lastWebhookAt: '2026-09-28 10:32:14 IST',
  n8nEnabled: true,
  n8nWebhookUrl: 'https://n8n.pulseflow-crm.in/webhook/whatsapp-crm-events'
};

export const INITIAL_COMPANY_SETTINGS: CompanySettingsConfig = {
  name: 'TechNova Digital Solutions Pvt Ltd',
  industry: 'IT Services, Web & Mobile Engineering',
  email: 'hello@TechnovaSolutions.in',
  phone: '+91 98470 00999',
  website: 'https://www.TechnovaSolutions.in',
  address: 'Phase 2, InfoPark SEZ, Kakkanad, Kochi, Kerala 682042',
  timezone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  businessHours: [
    { day: 'Monday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Tuesday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Wednesday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Thursday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Friday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '17:00', isOpen: true },
    { day: 'Sunday', open: '00:00', close: '00:00', isOpen: false }
  ]
};

export const INITIAL_NOTIFICATIONS: CRMNotification[] = [
  {
    id: 'notif-1',
    type: 'HUMAN_ATTENTION',
    title: 'Human Handoff Triggered',
    message: 'Anita Desai (Metro Retail Chains) requested urgent Senior Manager consultation.',
    createdAt: '14 mins ago',
    isRead: false,
    linkTo: '/inbox?convId=conv-2'
  },
  {
    id: 'notif-2',
    type: 'HOT_LEAD',
    title: 'New Hot Lead Qualified (Score: 91)',
    message: 'Rahul Menon confirmed ₹1,00,000 budget for E-Commerce Website starting next month.',
    createdAt: '22 mins ago',
    isRead: false,
    linkTo: '/leads/ld-1'
  },
  {
    id: 'notif-3',
    type: 'FOLLOW_UP_DUE',
    title: '4 Follow-ups Due Today',
    message: 'You have 4 scheduled lead callbacks due today between 12:30 PM and 5:00 PM.',
    createdAt: '1 hour ago',
    isRead: false,
    linkTo: '/follow-ups'
  },
  {
    id: 'notif-4',
    type: 'AI_ESCALATION',
    title: 'Production Change Escalation',
    message: 'Karthik Subramanian (Existing Customer) needs manager sign-off on webhook SLA.',
    createdAt: '3 hours ago',
    isRead: true,
    linkTo: '/inbox?convId=conv-6'
  }
];

export const ANALYTICS_LEADS_OVER_TIME = [
  { date: 'Sep 01', totalLeads: 18, hotLeads: 5, aiHandled: 15, humanHandled: 3, conversionRate: 21 },
  { date: 'Sep 05', totalLeads: 24, hotLeads: 8, aiHandled: 20, humanHandled: 4, conversionRate: 24 },
  { date: 'Sep 10', totalLeads: 31, hotLeads: 11, aiHandled: 26, humanHandled: 5, conversionRate: 27 },
  { date: 'Sep 15', totalLeads: 29, hotLeads: 10, aiHandled: 24, humanHandled: 5, conversionRate: 28 },
  { date: 'Sep 20', totalLeads: 38, hotLeads: 14, aiHandled: 31, humanHandled: 7, conversionRate: 31 },
  { date: 'Sep 25', totalLeads: 44, hotLeads: 17, aiHandled: 37, humanHandled: 7, conversionRate: 33 },
  { date: 'Sep 28', totalLeads: 52, hotLeads: 21, aiHandled: 44, humanHandled: 8, conversionRate: 35 }
];

export const ANALYTICS_LEAD_SOURCES = [
  { source: 'WhatsApp Inbound', leads: 84, won: 29, avgScore: 76 },
  { source: 'Website WhatsApp CTA', leads: 62, won: 24, avgScore: 81 },
  { source: 'Instagram Click-to-WhatsApp', leads: 49, won: 14, avgScore: 64 },
  { source: 'Google Search Ads', leads: 38, won: 16, avgScore: 84 },
  { source: 'Client Referrals', leads: 21, won: 11, avgScore: 88 }
];
