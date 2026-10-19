export interface ChapterRoadmapItem {
  number: number;
  sanskritName: string;
  sanskritTeluguName: string;
  englishTitle: string;
  teluguTitle: string;
  genzCheatSheet: string;
  genzTeluguCheatSheet: string;
  takeaway: string;
  teluguTakeaway: string;
  keyVerses: string[];
}

export const chapterRoadmapData: ChapterRoadmapItem[] = [
  {
    number: 1,
    sanskritName: "अर्जुनविषादयोग (Arjuna Vishada Yoga)",
    sanskritTeluguName: "అర్జునవిషాద యోగము",
    englishTitle: "Arjuna's Grief",
    teluguTitle: "అర్జునుని విషాదము",
    genzCheatSheet: "Arjuna has a major panic attack, lags hard, and wants to quit the lobby before the battle even starts. Major vibe check needed.",
    genzTeluguCheatSheet: "అర్జునుడు యుద్ధం మొదలవక ముందే గట్టిగా ల్యాగ్ అయిపోయి, లాబీ నుండి క్విట్ అవ్వాలనుకుంటాడు. బ్రోకి అర్జంటుగా వైబ్ చెక్ కావాలి.",
    takeaway: "Acknowledge your struggles, but don't let anxiety paralyze you.",
    teluguTakeaway: "కష్టాలను గుర్తించు, కానీ ఆందోళన నిన్ను నిర్వీర్యం చేయనివ్వకు.",
    keyVerses: ["1.28", "1.47"]
  },
  {
    number: 2,
    sanskritName: "सांख्ययोग (Sankhya Yoga)",
    sanskritTeluguName: "సాంఖ్య యోగము",
    englishTitle: "The Yoga of Self-Knowledge",
    teluguTitle: "ఆత్మ జ్ఞానము",
    genzCheatSheet: "Krishna explains the ultimate truth: the soul is eternal, body is just a Fortnite skin. Upgrade your mindset, perform your duty, don't worry about clout.",
    genzTeluguCheatSheet: "కృష్ణుడు సీన్ మొత్తం చెప్తాడు: ఆత్మ పర్మనెంట్, ఈ బాడీ జస్ట్ ఒక ఫోర్ట్‌నైట్ స్కిన్ లాంటిది. నీ మైండ్‌సెట్ మార్చుకో, వర్క్ చెయ్, క్లౌట్ గురించి ఊరికే టెన్షన్ పడకు.",
    takeaway: "Focus on the grind, let go of the results. You are not the skin, you are the player.",
    teluguTakeaway: "శ్రమ పడటంపై దృష్టి పెట్టండి, ఫలితాన్ని వదిలేయండి. నువ్వు బాడీవి కాదు, ఆత్మవి.",
    keyVerses: ["2.13", "2.22", "2.47", "2.70"]
  },
  {
    number: 3,
    sanskritName: "कर्मयोग (Karma Yoga)",
    sanskritTeluguName: "కర్మ యోగము",
    englishTitle: "The Yoga of Action",
    teluguTitle: "నిష్కామ కర్మ",
    genzCheatSheet: "No cap, you can't just go AFK in life. You gotta do your work, but do it selflessly as a contribution, not for selfish flexes.",
    genzTeluguCheatSheet: "నో క్యాప్, లైఫ్‌లో అలా సింపుల్‌గా ఏఎఫ్‌కే (AFK) అయిపోలేవు. నీ డ్యూటీ నువ్వు చెయ్యాలి, కాకపోతే అది సెల్ఫిష్ ఫ్లెక్స్ కోసం కాకుండా హెల్పింగ్ నేచర్‌తో చెయ్యాలి.",
    takeaway: "Action is better than inaction. Work as a service, not a transaction.",
    teluguTakeaway: "పని చేయకుండా ఉండడం కంటే చేయడం మంచిది. సేవగా పనిచేయండి, వ్యాపారంగా కాదు.",
    keyVerses: ["3.9", "3.19", "3.35"]
  },
  {
    number: 4,
    sanskritName: "ज्ञानकर्मसंन्यासयोग (Jnana Karma Sanyasa Yoga)",
    sanskritTeluguName: "జ్ఞానకర్మసంన్యాస యోగము",
    englishTitle: "The Yoga of Wisdom",
    teluguTitle: "జ్ఞాన యోగము",
    genzCheatSheet: "Wisdom is the ultimate cheat code. It burns all bad karma and lets you level up. Krishna reveals he's the admin of this server.",
    genzTeluguCheatSheet: "విస్డమ్ (జ్ఞానం) అనేది అల్టిమేట్ చీట్ కోడ్. ఇది నీ బ్యాడ్ కర్మాను మొత్తం కాల్చేస్తుంది. ఈ సర్వర్‌కి కృష్ణుడే మెయిన్ అడ్మిన్ అని రివీల్ చేస్తాడు.",
    takeaway: "Ignorance is toxic. Seek knowledge to purify your actions.",
    teluguTakeaway: "అజ్ఞానం చాలా డేంజర్. పనులను పవిత్రం చేయడానికి జ్ఞానాన్ని కోరుకో.",
    keyVerses: ["4.7", "4.8", "4.38"]
  },
  {
    number: 5,
    sanskritName: "कर्मसंन्यासयोग (Karma Sanyasa Yoga)",
    sanskritTeluguName: "కర్మసంన్యాస యోగము",
    englishTitle: "The Yoga of Renunciation",
    teluguTitle: "కర్మల ఫల త్యాగము",
    genzCheatSheet: "Being physically active but mentally chill is the goal. Don't let success or failure live rent-free in your head.",
    genzTeluguCheatSheet: "ఫిజికల్‌గా యాక్టివ్‌గా ఉంటూ మెంటల్‌గా చిల్ అవ్వడమే గోల్. సక్సెస్ లేదా ఫెయిల్యూర్ నీ మైండ్‌లో రెంట్-ఫ్రీగా తిరగడానికి అస్సలు ఛాన్స్ ఇవ్వకు.",
    takeaway: "Peace comes when you perform actions but surrender the outcome.",
    teluguTakeaway: "కర్మలను చేస్తూ, ఫలితాన్ని వదిలివేసినప్పుడే నిజమైన శాంతి లభిస్తుంది.",
    keyVerses: ["5.10", "5.18", "5.29"]
  },
  {
    number: 6,
    sanskritName: "ध्यानयोग (Dhyana Yoga)",
    sanskritTeluguName: "ధ్యాన యోగము",
    englishTitle: "The Yoga of Meditation",
    teluguTitle: "ఆత్మసంయమ యోగము",
    genzCheatSheet: "Your mind is either your best friend or a toxic hater living rent-free in your head. Unplug from social media, meditate, and find your center.",
    genzTeluguCheatSheet: "నీ మైండ్ నీ బెస్ట్ ఫ్రెండ్ అయినా అవ్వాలి లేదా నీ మైండ్‌లోనే రెంట్-ఫ్రీగా ఉండే ఒక టాక్సిక్ హేటర్ అయినా అవ్వాలి. కాసేపు సోషల్ మీడియా ఆపేసి, మెడిటేట్ చేసి నీ సెంటర్‌ని కనుక్కో.",
    takeaway: "Control your mind before it controls you. Balance is everything.",
    teluguTakeaway: "నీ మనస్సు నిన్ను కంట్రోల్ చేసే ముందే నువ్వు దాన్ని కంట్రోల్ చెయ్. బ్యాలెన్స్ చాలా అవసరం.",
    keyVerses: ["6.5", "6.6", "6.26"]
  },
  {
    number: 7,
    sanskritName: "ज्ञानविज्ञानयोग (Jnana Vijnana Yoga)",
    sanskritTeluguName: "జ్ఞానవిజ్ఞాన యోగము",
    englishTitle: "The Yoga of Wisdom & Realization",
    teluguTitle: "జ్ఞాన విజ్ఞాన యోగము",
    genzCheatSheet: "Krishna is in everything, the water you drink and the light of the sun. Surrendering to the divine is the ultimate shortcut to break free from the matrix.",
    genzTeluguCheatSheet: "నువ్వు తాగే నీటిలో, సూర్యుడి కాంతిలో... ప్రతిదాంట్లో కృష్ణుడు ఉన్నాడు. ఈ మాయ (మ్యాట్రిక్స్) నుండి బయటపడటానికి దేవుడికి సరెండర్ అవ్వడమే అల్టిమేట్ షార్ట్‌కట్.",
    takeaway: "Look beyond the illusion. Recognize the divine in everything.",
    teluguTakeaway: "భ్రమలను దాటి చూడు. ప్రతిదానిలోనూ దైవత్వాన్ని గుర్తించు.",
    keyVerses: ["7.7", "7.14", "7.19"]
  },
  {
    number: 8,
    sanskritName: "अक्षरब्रह्मयोग (Akshara Brahma Yoga)",
    sanskritTeluguName: "అక్షరపరబ్రహ్మ యోగము",
    englishTitle: "The Yoga of the Eternal",
    teluguTitle: "అక్షర పరబ్రహ్మ",
    genzCheatSheet: "The final vibe check of life is what you think about at the moment of death. Keep your mind on the Divine constantly so your last thoughts are pure.",
    genzTeluguCheatSheet: "లైఫ్‌లో ఫైనల్ వైబ్ చెక్ ఏంటంటే, మనం చనిపోయే టైంలో ఏం ఆలోచిస్తున్నాం అనేది. నీ మైండ్‌ని ఎప్పుడూ దేవుడిపైనే ఉంచు, అప్పుడు నీ లాస్ట్ థాట్స్ ప్యూర్ గా ఉంటాయి.",
    takeaway: "What you focus on grows. Train your mind daily to focus on the eternal.",
    teluguTakeaway: "నువ్వు దేనిపై ఫోకస్ పెడితే అదే ఎదుగుతుంది. శాశ్వతమైన దానిపై దృష్టి పెట్టడానికి రోజూ ప్రాక్టీస్ చెయ్.",
    keyVerses: ["8.5", "8.15", "8.20"]
  },
  {
    number: 9,
    sanskritName: "राजविद्याराजगुह्ययोग (Raja Vidya Raja Guhya Yoga)",
    sanskritTeluguName: "రాజవిద్యా రాజగుహ్య యోగము",
    englishTitle: "The King of Secrets",
    teluguTitle: "రాజ విద్య రాజ గుహ్య",
    genzCheatSheet: "Exclusive access: Krishna shares the most confidential cheat sheet. Even if you screw up, simple love and devotion will get you back on track. He's got your back.",
    genzTeluguCheatSheet: "ఎక్స్‌క్లూసివ్ యాక్సెస్: కృష్ణుడు మోస్ట్ సీక్రెట్ చీట్ షీట్ చెప్తాడు. నువ్వు ఎంత తప్పు చేసినా, సింపుల్ లవ్ అండ్ భక్తితో మళ్ళీ ట్రాక్‌లోకి వచ్చేయొచ్చు. బ్రో నీ వెంటే ఉంటాడు.",
    takeaway: "Worship with love. A leaf, a flower, a fruit, or water offered with devotion is accepted.",
    teluguTakeaway: "ప్రేమతో పూజించు. భక్తితో సమర్పించే ఒక ఆకు, పువ్వు, పండు లేదా నీరైనా దేవుడు స్వీకరిస్తాడు.",
    keyVerses: ["9.22", "9.26", "9.30"]
  },
  {
    number: 10,
    sanskritName: "विभूतियोग (Vibhuti Yoga)",
    sanskritTeluguName: "విభూతి యోగము",
    englishTitle: "The Divine Opulences",
    teluguTitle: "భగవద్విభూతులు",
    genzCheatSheet: "Krishna flexing his stats: he's the highest, the brightest, the best in every category. He's the main character of the entire universe.",
    genzTeluguCheatSheet: "కృష్ణుడు తన స్టాట్స్ ఫ్లెక్స్ చేస్తాడు: ప్రతి కేటగిరీలో ఆయనే బెస్ట్, బ్రైటెస్ట్ అండ్ హైయెస్ట్. ఈ యూనివర్స్ మొత్తానికి ఆయనే మెయిన్ క్యారెక్టర్.",
    takeaway: "The beauty and power in the world are just a spark of the divine glory.",
    teluguTakeaway: "ఈ ప్రపంచంలో కనిపించే అందం మరియు शक्ति ఆ దేవుని మహిమలో చిన్న భాగం మాత్రమే.",
    keyVerses: ["10.8", "10.20", "10.41"]
  },
  {
    number: 11,
    sanskritName: "विश्वरूपदर्शनयोग (Vishwarupa Darshana Yoga)",
    sanskritTeluguName: "విశ్వరూపదర్శన యోగము",
    englishTitle: "The Cosmic Form",
    teluguTitle: "విశ్వరూప దర్శనము",
    genzCheatSheet: "Krishna shows his ultimate 8K cosmic form skin. It's mind-blowing, terrifying, and beautiful all at once. Arjuna is completely shook.",
    genzTeluguCheatSheet: "కృష్ణుడు తన అల్టిమేట్ 8K కాస్మిక్ విరాట్రూపాన్ని చూపిస్తాడు. అది మైండ్-బ్లోయింగ్, భయంకరం, మరియు బ్యూటిఫుల్. అర్జునుడు అయితే పూర్తిగా షాక్ అయిపోతాడు.",
    takeaway: "The universe is massive and divine. Humility is the only response to such grandeur.",
    teluguTakeaway: "విశ్వం చాలా పెద్దది మరియు దైవికమైనది. అంత గొప్ప రూపాన్ని చూసి వినయంగా ఉండటమే మనం చేయాల్సింది.",
    keyVerses: ["11.15", "11.33", "11.54"]
  },
  {
    number: 12,
    sanskritName: "भक्तियोग (Bhakti Yoga)",
    sanskritTeluguName: "భక్తి యోగము",
    englishTitle: "The Yoga of Devotion",
    teluguTitle: "భక్తి యోగము",
    genzCheatSheet: "Love is the vibe. Krishna ranks the paths to him, and pure love and devotion get the gold medal. He loves those who are kind and steady.",
    genzTeluguCheatSheet: "ప్రేమే మన వైబ్. తనను చేరుకునే మార్గాల్లో కృష్ణుడు ర్యాంకులు ఇస్తాడు, ప్రేమ మరియు భక్తికి గోల్డ్ మెడల్ వస్తుంది. కరుణతో, నిలకడగా ఉండేవారంటే ఆయనకు చాలా ఇష్టం.",
    takeaway: "Cultivate virtues like compassion, tolerance, and mental balance to grow close to the Divine.",
    teluguTakeaway: "దేవునికి దగ్గర కావడానికి కరుణ, సహనం మరియు సంయమనం వంటి మంచి లక్షణాలను పెంపొందించుకోండి.",
    keyVerses: ["12.8", "12.13", "12.20"]
  },
  {
    number: 13,
    sanskritName: "क्षेत्रक्षेत्रज्ञविभागयोग (Kshetra Kshetrajna Vibhaga Yoga)",
    sanskritTeluguName: "క్షేత్రక్షేత్రజ్ఞవిభాగ యోగము",
    englishTitle: "The Field & Knower",
    teluguTitle: "ప్రకృతి పురుష వివేకం",
    genzCheatSheet: "Know the difference between the hardware (your body) and the software/player (your soul). Don't get lost in the graphics.",
    genzTeluguCheatSheet: "నీ హార్డ్‌వేర్ (బాడీ) కి మరియు లోపల ఉండే సాఫ్ట్‌వేర్/ప్లేయర్ (ఆత్మ) కి మధ్య తేడాను తెలుసుకో. గ్రాఫిక్స్ చూసి మోసపోకు.",
    takeaway: "Identify as the observer, not the material machine you inhabit.",
    teluguTakeaway: "నువ్వు కేవలం ఒక పరిశీలకుడివి (ఆత్మవు) మాత్రమే అని గుర్తించు, ఈ భౌతిక శరీరం నువ్వు కాదు.",
    keyVerses: ["13.2", "13.22", "13.28"]
  },
  {
    number: 14,
    sanskritName: "गुणत्रयविभागयोग (Gunatraya Vibhaga Yoga)",
    sanskritTeluguName: "గుణత్రయవిభాగ యోగము",
    englishTitle: "The Three Modes of Nature",
    teluguTitle: "త్రిగుణ విభాగము",
    genzCheatSheet: "Your energy level runs on three modes: Sattva (high vibe/pure), Rajas (hyper/hustle), and Tamas (laggy/sleepy). Level up to pure Sattva and go beyond.",
    genzTeluguCheatSheet: "నీ ఎనర్జీ లెవెల్స్ మూడు మోడ్స్‌లో నడుస్తాయి: సత్త్వ (హై వైబ్/ప్యూర్), రజస్ (హైపర్/హస్టిల్), మరియు తమస్ (ల్యాగీ/స్లీపీ). సత్త్వ గుణానికి లెవెల్ అప్ అయ్యి, ఆ పైన వెళ్ళు.",
    takeaway: "Understand what influences your mood and actions, and consciously choose clarity.",
    teluguTakeaway: "నీ మూడ్ మరియు పనులను ఏవి ప్రభావితం చేస్తున్నాయో తెలుసుకుని, స్పష్టతను ఎంచుకో.",
    keyVerses: ["14.5", "14.18", "14.20"]
  },
  {
    number: 15,
    sanskritName: "पुरुषोत्तमयोग (Purushottama Yoga)",
    sanskritTeluguName: "పురుషోత్తమ ప్రాప్తి యోగము",
    englishTitle: "The Supreme Person",
    teluguTitle: "పురుషోత్తమ యోగము",
    genzCheatSheet: "The material world is an upside-down Banyan tree. Chop it down with detachment and seek the root, which is Krishna, the ultimate server owner.",
    genzTeluguCheatSheet: "ఈ భౌతిక ప్రపంచం తలక్రిందులుగా ఉన్న ఒక రావి చెట్టు లాంటిది. డిటాచ్‌మెంట్ అనే గొడ్డలితో దాన్ని నరికేసి, మెయిన్ రూట్ అయిన కృష్ణుడిని వెతుక్కో.",
    takeaway: "Cut attachment to the temporary world to find the permanent source of joy.",
    teluguTakeaway: "శాశ్వతమైన సంతోషాన్ని కనుగొనడానికి తాత్కాలిక ప్రపంచంపై అనుబంధాన్ని తెంచుకోండి.",
    keyVerses: ["15.1", "15.7", "15.15"]
  },
  {
    number: 16,
    sanskritName: "दैवासुरसम्पद्विभागयोग (Daivasura Sampad Vibhaga Yoga)",
    sanskritTeluguName: "దైవాసురసంపద్విభాగ యోగము",
    englishTitle: "Divine & Demonic Qualities",
    teluguTitle: "దైవాసుర సంపదలు",
    genzCheatSheet: "Green flags vs Red flags of character. Divine virtues (honesty, courage) get you a green flag. Pride, anger, and greed are toxic red flags.",
    genzTeluguCheatSheet: "క్యారెక్టర్‌లో గ్రీన్ ఫ్లాగ్స్ vs రెడ్ ఫ్లాగ్స్. దైవీ గుణాలు (నిజాయితీ, ధైర్యం) గ్రీన్ ఫ్లాగ్స్. గర్వం, కోపం, మరియు అత్యాశలు చాలా టాక్సిక్ రెడ్ ఫ్లాగ్స్.",
    takeaway: "Avoid anger, greed, and lust — they are the three gates to hell (ruining your life).",
    teluguTakeaway: "కోపం, అత్యాశ మరియు కామాలను నివారించండి — ఇవి జీవితాన్ని నాశనం చేసే మూడు నరక ద్వారాలు.",
    keyVerses: ["16.4", "16.21", "16.23"]
  },
  {
    number: 17,
    sanskritName: "श्रद्धात्रयविभागयोग (Shraddhatraya Vibhaga Yoga)",
    sanskritTeluguName: "శ్రద్ధాత్రయవిభాగ యోగము",
    englishTitle: "The Threefold Faith",
    teluguTitle: "త్రివిధ శ్రద్ధా విభాగము",
    genzCheatSheet: "Even your faith, food, and charity have modes. Avoid junk food and toxic energy; eat clean, do good quietly, and keep your faith pure.",
    genzTeluguCheatSheet: "నువ్వు నమ్మే విశ్వాసం, తినే ఫుడ్, చేసే దానాలలో కూడా రకాలు ఉంటాయి. జంక్ ఫుడ్, టాక్సిక్ ఎనర్జీని పక్కనపెట్టి; క్లీన్ గా తిను, గప్‌చుప్‌గా మంచి పనులు చేయి.",
    takeaway: "What you consume (physically and mentally) determines your faith and nature.",
    teluguTakeaway: "నువ్వు తీసుకునే ఆహారం (భౌతికంగా మరియు మానసికంగా) నీ స్వభావాన్ని నిర్ణయిస్తుంది.",
    keyVerses: ["17.3", "17.8", "17.20"]
  },
  {
    number: 18,
    sanskritName: "मोक्षसंन्यासयोग (Moksha Sanyasa Yoga)",
    sanskritTeluguName: "మోక్షసంన్యాస యోగము",
    englishTitle: "The Path of Liberation",
    teluguTitle: "మోక్ష ప్రాప్తి",
    genzCheatSheet: "The final recap: Surrender all your worries to Krishna. He will clear all your debts, no cap. Don't stress, just chill and do your duty.",
    genzTeluguCheatSheet: "ఫైనల్ రీక్యాప్: నీ టెన్షన్లన్నీ కృష్ణుడికి వదిలేయ్. బ్రో నీ పాపాలన్నీ క్లియర్ చేస్తాడు, నో క్యాప్. టెన్షన్ పడకుండా, చిల్ అవుతూ నీ డ్యూటీ నువ్వు చెయ్.",
    takeaway: "Surrender with devotion. Let go of fear and follow your dharma.",
    teluguTakeaway: "భక్తితో శరణు వేడుము. భయాన్ని వదిలేసి నీ ధర్మాన్ని అనుసరించు.",
    keyVerses: ["18.46", "18.65", "18.66"]
  }
];
