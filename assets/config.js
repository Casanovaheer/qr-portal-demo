/* ============================================================
   DEMO CONFIG: edit this file to rebrand the demo in the meeting.
   Everything here is sample data. Replace it with the client's real
   name, colours, doctors and content.
   ============================================================ */
window.APP = {
  defaultLang: 'ar',
  // true only in the copy published to claude.ai (no mic, no embeds, no downloads there)
  hosted: false,
  // false hides voice notes: written feedback only
  voice: false,
  // the shareable link of the hosted copy; the QR code points here when set
  shareUrl: 'https://casanovaheer.github.io/qr-portal-demo/portal.html',

  brand: {
    name:  { ar: 'مجمع الصفا الطبي', en: 'Alsafa Medical Complex' },
    city:  { ar: 'فرع المنتزه الشرقي · فرع النقرة', en: 'Al Muntazah and An Naqrah branches' },
    // logo files copied from alsafaclinic.com
    logo: 'assets/brand/logo.png',
    logoIcon: 'assets/brand/icon.png',
    phone: '0165435556',
    whatsapp: '966538111232',
    website: 'https://alsafaclinic.com/',
    bookingUrl: 'https://wa.me/966538111232',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=%D9%85%D8%AC%D9%85%D8%B9+%D8%A7%D9%84%D8%B5%D9%81%D8%A7+%D8%A7%D9%84%D8%B7%D8%A8%D9%8A',
    // opening hours are not on their website, so the badge shows this line instead
    hours: null,
    statusText: { ar: 'مساعدة الطوارئ متاحة 24/7', en: 'Emergency help available 24/7' },
    stats: [
      { n: 6, label: { ar: 'عيادات', en: 'clinics' } },
      { n: 2, label: { ar: 'فرعان', en: 'branches' } },
      { n: 8, label: { ar: 'خدمات منزلية', en: 'home-care services' } }
    ],
    about: {
      ar: 'مجمع الصفا الطبي مجمع طبي حديث له فرعان: الأول على طريق الملك عبدالعزيز في حي المنتزه الشرقي، والثاني على طريق الأمير سعود بن عبدالمحسن في حي النقرة. فيه 6 عيادات، ويقدّم رعاية منزلية تشمل زيارة الطبيب والممرضة والتحاليل والعلاج الطبيعي.',
      en: 'Alsafa Medical Complex is a modern medical complex with two branches: King Abdulaziz Road in Al Muntazah Al Sharqi, and Prince Saud bin Abdulmohsen Road in An Naqrah. It has 6 clinics and offers home care, including doctor and nurse visits, lab tests and physiotherapy.'
    },
    services: [
      { ar: 'زيارة طبيب للمنزل', en: 'Doctor home visits' },
      { ar: 'التحاليل المخبرية المنزلية', en: 'Home lab tests' },
      { ar: 'العلاج الطبيعي والتأهيل', en: 'Physiotherapy' },
      { ar: 'رعاية كبار السن', en: 'Elderly care' },
      { ar: 'الإسعاف والنقل الطبي', en: 'Ambulance and transport' }
    ],
    colors: {
      primary: '#2A2663',
      primaryDark: '#1A1747',
      accent: '#E5202F',
      tint: '#ECEBF7'
    }
  },

  // The six clinics listed on alsafaclinic.com
  specialties: [
    { id: 'general',  color: '#2E9A5E', icon: 'steth',    name: { ar: 'الطب العام', en: 'General medicine' } },
    { id: 'internal', color: '#D9434B', icon: 'activity', name: { ar: 'الباطنة', en: 'Internal medicine' } },
    { id: 'women',    color: '#C2418E', icon: 'venus',    name: { ar: 'النساء والولادة', en: "Women's health" } },
    { id: 'peds',     color: '#E39B12', icon: 'smile',    name: { ar: 'الأطفال', en: 'Paediatrics' } },
    { id: 'derm',     color: '#8250C4', icon: 'sun',      name: { ar: 'البشرة', en: 'Skin care' } },
    { id: 'dental',   color: '#3E63DD', icon: 'tooth',    name: { ar: 'الأسنان', en: 'Dentistry' } }
  ],

  // Extra places a visitor can leave feedback about
  otherUnits: [
    { id: 'lab',       name: { ar: 'المختبر', en: 'Laboratory' } },
    { id: 'homecare',  name: { ar: 'الرعاية المنزلية', en: 'Home care' } },
    { id: 'reception', name: { ar: 'الاستقبال', en: 'Reception' } }
  ],

  // SAMPLE doctors: alsafaclinic.com does not list its doctors. Replace with real names.
  doctors: [
    { id: 'khalid', spec: 'internal', years: 18,
      name: { ar: 'د. خالد العتيبي', en: 'Dr. Khalid Al-Otaibi' },
      title: { ar: 'استشاري الباطنة', en: 'Consultant, internal medicine' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'الأحد · الثلاثاء · الأربعاء', en: 'Sun · Tue · Wed' } },
    { id: 'noura', spec: 'internal', years: 14,
      name: { ar: 'د. نورة القحطاني', en: 'Dr. Noura Al-Qahtani' },
      title: { ar: 'استشارية الباطنة والسكري', en: 'Consultant, internal medicine and diabetes' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'السبت · الإثنين · الأربعاء', en: 'Sat · Mon · Wed' } },
    { id: 'fahad', spec: 'peds', years: 11,
      name: { ar: 'د. فهد الشهري', en: 'Dr. Fahad Al-Shehri' },
      title: { ar: 'أخصائي طب الأطفال', en: 'Paediatric specialist' },
      langs: { ar: 'العربية', en: 'Arabic' },
      days: { ar: 'يومياً عدا الجمعة', en: 'Daily except Friday' } },
    { id: 'reem', spec: 'women', years: 16,
      name: { ar: 'د. ريم الدوسري', en: 'Dr. Reem Al-Dosari' },
      title: { ar: 'استشارية النساء والولادة', en: 'Consultant obstetrician & gynaecologist' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'الأحد · الإثنين · الخميس', en: 'Sun · Mon · Thu' } },
    { id: 'sara', spec: 'derm', years: 9,
      name: { ar: 'د. سارة الحربي', en: 'Dr. Sara Al-Harbi' },
      title: { ar: 'أخصائية الأمراض الجلدية', en: 'Dermatology specialist' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'السبت · الثلاثاء', en: 'Sat · Tue' } },
    { id: 'abdullah', spec: 'general', years: 12,
      name: { ar: 'د. عبدالله الزهراني', en: 'Dr. Abdullah Al-Zahrani' },
      title: { ar: 'طبيب عام', en: 'General practitioner' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'الإثنين · الأربعاء', en: 'Mon · Wed' } },
    { id: 'majed', spec: 'dental', years: 8,
      name: { ar: 'د. ماجد السبيعي', en: 'Dr. Majed Al-Subaie' },
      title: { ar: 'أخصائي طب الأسنان', en: 'Dental specialist' },
      langs: { ar: 'العربية، الإنجليزية', en: 'Arabic, English' },
      days: { ar: 'يومياً عدا الجمعة', en: 'Daily except Friday' } }
  ],

  // "Do you know your body?" questions. video: duration string, or null.
  faqs: [
    { id: 'f1', spec: 'internal', doctor: 'khalid', video: null,
      q: { ar: 'كم يجب أن يكون ضغط الدم الطبيعي؟', en: 'What is a normal blood pressure reading?' },
      a: { ar: 'القراءة الطبيعية للبالغ أقل من 120/80 ملم زئبق. إذا تكررت قراءتك عند 130/80 أو أعلى في أيام مختلفة فراجع الطبيب. ارتفاع الضغط لا يسبب أعراضاً في أغلب الحالات، ولهذا يكتشفه كثيرون متأخرين.',
           en: 'For adults, normal is below 120/80 mmHg. If your readings stay at 130/80 or higher on different days, see a doctor. High blood pressure usually has no symptoms, which is why so many people find out late.' } },
    { id: 'f2', spec: 'internal', doctor: 'khalid', video: null,
      q: { ar: 'متى يكون ألم الصدر حالة طارئة؟', en: 'When is chest pain an emergency?' },
      a: { ar: 'اتصل على 997 فوراً إذا كان الألم ضاغطاً أو يمتد إلى الذراع أو الفك، أو جاء معه ضيق نفس أو تعرّق أو غثيان. لا تقُد السيارة بنفسك إلى المستشفى.',
           en: "Call 997 straight away if the pain feels like pressure, spreads to your arm or jaw, or comes with shortness of breath, sweating or nausea. Don't drive yourself to hospital." } },
    { id: 'f3', spec: 'internal', doctor: 'noura', video: null,
      q: { ar: 'ما المعدل الطبيعي للسكر وأنت صائم؟', en: 'What is a normal fasting blood sugar?' },
      a: { ar: 'من 70 إلى 99 ملغ/دل. القراءة من 100 إلى 125 تعني مرحلة ما قبل السكري، و126 فأكثر في فحصين منفصلين تعني السكري.',
           en: '70 to 99 mg/dL. A reading of 100 to 125 means prediabetes. 126 or higher on two separate tests means diabetes.' } },
    { id: 'f4', spec: 'internal', doctor: 'noura', video: '1:01', sample: true, videoUrl: 'https://www.youtube.com/watch?v=Iif63e-oZbw',
      q: { ar: 'هل يستطيع مريض السكري صيام رمضان؟', en: 'Can people with diabetes fast in Ramadan?' },
      a: { ar: 'كثيرون يستطيعون، لكن القرار يكون مع طبيبك قبل رمضان بأسابيع. قد تحتاج إلى تغيير مواعيد الدواء أو جرعة الإنسولين. أفطر فوراً إذا نزل السكر عن 70 ملغ/دل.',
           en: 'Many can, but make the decision with your doctor a few weeks before Ramadan. Your medicine times or insulin dose may need to change. Break the fast at once if your sugar drops below 70 mg/dL.' } },
    { id: 'f5', spec: 'peds', doctor: 'fahad', video: null,
      q: { ar: 'متى تكون حرارة الطفل مقلقة؟', en: "When is a child's fever worrying?" },
      a: { ar: 'أي حرارة 38 درجة أو أعلى عند رضيع عمره أقل من 3 أشهر تحتاج إلى طبيب في اليوم نفسه. مع الأطفال الأكبر، راقب نشاط الطفل وشربه للسوائل أكثر من رقم الحرارة، وراجعنا إذا استمرت الحرارة أكثر من 3 أيام.',
           en: 'Any temperature of 38°C or more in a baby under 3 months needs a doctor the same day. With older children, watch how active they are and whether they drink, more than the number itself. See us if the fever lasts more than 3 days.' } },
    { id: 'f6', spec: 'peds', doctor: 'fahad', video: null,
      q: { ar: 'كم ساعة يحتاج طفلي للنوم؟', en: 'How much sleep does my child need?' },
      a: { ar: 'من 3 إلى 5 سنوات: من 10 إلى 13 ساعة مع القيلولة. من 6 إلى 12 سنة: من 9 إلى 12 ساعة. المراهقون: من 8 إلى 10 ساعات.',
           en: 'Ages 3 to 5: 10 to 13 hours including naps. Ages 6 to 12: 9 to 12 hours. Teenagers: 8 to 10 hours.' } },
    { id: 'f7', spec: 'women', doctor: 'reem', video: null,
      q: { ar: 'متى أبدأ بأخذ حمض الفوليك؟', en: 'When should I start taking folic acid?' },
      a: { ar: 'قبل الحمل بشهر على الأقل إذا كنتِ تخططين له، بجرعة 400 ميكروغرام يومياً، واستمري عليه في أول 12 أسبوعاً من الحمل. هذا يقلل خطر تشوهات الأنبوب العصبي عند الجنين.',
           en: 'At least a month before you try to get pregnant, at 400 micrograms a day, and keep taking it for the first 12 weeks of pregnancy. It lowers the risk of neural tube defects in the baby.' } },
    { id: 'f8', spec: 'women', doctor: 'reem', video: null,
      q: { ar: 'متى أبدأ فحص الماموجرام للثدي؟', en: 'When should I start mammogram screening?' },
      a: { ar: 'يُنصح بالماموجرام كل سنة إلى سنتين بدءاً من عمر 40. إذا أصيبت أم أو أخت لكِ بسرطان الثدي فاسألي طبيبتك عن البدء في عمر أصغر.',
           en: 'A mammogram every one to two years from age 40. If your mother or sister had breast cancer, ask your doctor about starting earlier.' } },
    { id: 'f9', spec: 'derm', doctor: 'sara', video: null,
      q: { ar: 'هل أحتاج واقي الشمس في الأيام الغائمة؟', en: 'Do I need sunscreen on cloudy days?' },
      a: { ar: 'نعم. معظم الأشعة فوق البنفسجية تخترق الغيوم. استخدم واقياً بعامل حماية SPF 30 أو أعلى، وأعد وضعه كل ساعتين إذا كنت في الخارج.',
           en: 'Yes. Most UV rays get through cloud. Use SPF 30 or higher and reapply every two hours when you are outside.' } },
    { id: 'f10', spec: 'derm', doctor: 'sara', video: null,
      q: { ar: 'متى أقلق من شامة في جلدي؟', en: 'When should a mole worry me?' },
      a: { ar: 'راجع طبيب الجلدية إذا تغير شكل الشامة أو لونها أو حجمها، أو صار طرفها غير منتظم، أو بدأت تنزف أو تحك.',
           en: 'See a dermatologist if a mole changes shape, colour or size, gets a ragged edge, or starts to bleed or itch.' } },
    { id: 'f11', spec: 'general', doctor: 'abdullah', video: '7:03', sample: true, videoUrl: 'https://www.youtube.com/watch?v=hSz_cBiV6WM',
      q: { ar: 'ألم أسفل الظهر: متى أراجع الطبيب؟', en: 'Lower back pain: when should I see a doctor?' },
      a: { ar: 'أغلب آلام الظهر تتحسن خلال 4 إلى 6 أسابيع مع الحركة الخفيفة. راجعنا فوراً إذا جاء معها خدر أو ضعف في الساقين، أو صعوبة في التحكم بالبول، أو حرارة.',
           en: 'Most back pain gets better within 4 to 6 weeks with gentle movement. See us straight away if it comes with numbness or weakness in your legs, trouble controlling your bladder, or a fever.' } },
    { id: 'f12', spec: 'general', doctor: 'abdullah', video: null,
      q: { ar: 'هل طقطقة الأصابع تسبب خشونة المفاصل؟', en: 'Does cracking your knuckles cause arthritis?' },
      a: { ar: 'لا. الدراسات التي تابعت أشخاصاً يطقطقون أصابعهم لسنوات طويلة لم تجد زيادة في خشونة المفاصل. الصوت يخرج من فقاعات غاز في سائل المفصل.',
           en: 'No. Studies that followed people who cracked their knuckles for decades found no extra arthritis. The sound comes from gas bubbles in the joint fluid.' } },
    { id: 'f13', spec: 'dental', doctor: 'majed', video: null,
      q: { ar: 'كل كم أغيّر فرشاة أسناني؟', en: 'How often should I replace my toothbrush?' },
      a: { ar: 'كل 3 إلى 4 أشهر، أو قبل ذلك إذا تفرقت شعيراتها. واغسل أسنانك مرتين يومياً لمدة دقيقتين بمعجون فيه فلورايد.',
           en: 'Every 3 to 4 months, or sooner if the bristles splay. Brush twice a day for two minutes with a fluoride toothpaste.' } },
    { id: 'f14', spec: 'dental', doctor: 'majed', video: '2:20', sample: true, videoUrl: 'https://www.youtube.com/watch?v=k6pE2Sn3IKo',
      q: { ar: 'هل نزيف اللثة عند التفريش طبيعي؟', en: 'Is it normal for gums to bleed when I brush?' },
      a: { ar: 'لا. النزيف في الغالب علامة التهاب في اللثة بسبب الجير. يزول عادة بعد تنظيف عند طبيب الأسنان مع تفريش يومي جيد، فلا تتوقف عن التفريش بسببه.',
           en: "No. Bleeding is usually a sign of gum inflammation from tartar. It normally clears after a cleaning at the dentist and good daily brushing, so don't stop brushing because of it." } }
  ],

  // Weekly questions already answered on video (sample)
  weekly: [
    { id: 'w43', week: 43, t: '2026-10-22T10:00:00', spec: 'peds', doctor: 'fahad', dur: '4:53', views: 1240, sample: true, videoUrl: 'https://www.youtube.com/watch?v=7GpoylkE-6Q',
      q: { ar: 'حرارة ابني 38.5 درجة. متى لازم أوديه للطبيب؟', en: "My son's temperature is 38.5°C. When should I take him to a doctor?" },
      summary: { ar: 'أي حرارة 38 درجة أو أعلى عند رضيع عمره أقل من 3 أشهر تحتاج إلى طبيب في اليوم نفسه. مع الأطفال الأكبر، راقب نشاط الطفل وشربه للسوائل أكثر من رقم الحرارة، وراجعنا إذا استمرت الحرارة أكثر من 3 أيام.',
                 en: 'Any temperature of 38°C or more in a baby under 3 months needs a doctor the same day. With older children, watch how active they are and whether they drink, more than the number itself. See us if the fever lasts more than 3 days.' } },
    { id: 'w42', week: 42, t: '2026-10-15T10:00:00', spec: 'internal', doctor: 'khalid', dur: '4:03', views: 2310, sample: true, videoUrl: 'https://www.youtube.com/watch?v=hYe1o0aPbkQ',
      q: { ar: 'كيف أقيس ضغطي في البيت بالطريقة الصحيحة؟', en: 'How do I measure my blood pressure at home the right way?' },
      summary: { ar: 'اجلس مرتاحاً 5 دقائق وظهرك مسنود وقدماك على الأرض، وذراعك على طاولة بمستوى القلب. لا قهوة ولا تدخين ولا رياضة قبل القياس بنصف ساعة. خذ قراءتين بينهما دقيقة، واكتبهما لتعرضهما على طبيبك.',
                 en: 'Sit quietly for 5 minutes with your back supported, feet flat and your arm on a table at heart level. No coffee, smoking or exercise for 30 minutes before. Take two readings a minute apart and write them down for your doctor.' } },
    { id: 'w41', week: 41, t: '2026-10-08T10:00:00', spec: 'derm', doctor: 'sara', dur: '4:14', views: 1876, sample: true, videoUrl: 'https://www.youtube.com/watch?v=FGUNHlNwjck',
      q: { ar: 'يتساقط شعري بكثرة بعد الولادة، هل هذا طبيعي؟', en: 'My hair is falling out after giving birth. Is that normal?' },
      summary: { ar: 'نعم، وهو شائع جداً. يبدأ عادة بعد شهرين إلى أربعة أشهر من الولادة ويتحسن خلال 6 إلى 12 شهراً. إذا استمر بعد ذلك نفحص الحديد والغدة الدرقية.',
                 en: 'Yes, and it is very common. It usually starts 2 to 4 months after birth and settles within 6 to 12 months. If it carries on after that, we check iron and thyroid levels.' } }
  ],

  // Sample history for the staff dashboard. "ago" is hours before now.
  seed: {
    stats: { visits: 3428, unique: 2106, qr: 2871, questions: 63, feedback: 118 },
    daily: [182, 205, 196, 231, 248, 163, 140, 214, 238, 262, 251, 279, 190, 96],
    features: { clinics: 980, body: 1240, weekly: 860, feedback: 610, book: 410, call: 240 },
    feedback: [
      { id: 'FB-2374', ago: 2, rating: 2, clinic: 'dental', type: 'text', anon: true, status: 'new',
        text: 'انتظرت أكثر من ساعة بعد موعدي في عيادة الأسنان، وما أحد قال لي سبب التأخير. الدكتور ممتاز بس الانتظار كان طويل.' },
      { id: 'FB-2371', ago: 5, rating: 5, clinic: 'peds', type: 'text', anon: true, status: 'new',
        text: 'الدكتور فهد كان صبور جداً مع ولدي، وشرح لنا كل شيء. شكراً لكم.' },
      { id: 'FB-2366', ago: 26, rating: 3, clinic: 'internal', type: 'text', anon: false, name: 'عبدالرحمن', phone: '0551234412', status: 'new',
        text: 'المواقف قليلة في الفترة المسائية، درت عشر دقائق حتى لقيت مكان. ياليت تخصصون مواقف لكبار السن.' },
      { id: 'FB-2359', ago: 50, rating: 4, clinic: 'derm', type: 'text', anon: true, status: 'reviewed',
        text: 'الحجز من الموقع كان سهل، بس ياليت يكون فيه تذكير بالموعد على الواتساب.' },
      { id: 'FB-2352', ago: 74, rating: 1, clinic: 'lab', type: 'text', anon: true, status: 'reviewed',
        text: 'نتيجة التحليل تأخرت يومين عن الموعد اللي قالوا لي عليه.' }
    ],
    questions: [
      { id: 'Q-1046', ago: 3, spec: 'internal', notify: true, status: 'pending', lang: 'ar',
        text: 'هل الصيام المتقطع آمن لمريض الضغط اللي ياخذ دواء؟' },
      { id: 'Q-1045', ago: 7, spec: 'peds', notify: false, status: 'pending', lang: 'ar',
        text: 'بنتي عمرها سنتين وما تقول إلا كلمات قليلة، متى لازم أقلق؟' },
      { id: 'Q-1043', ago: 27, spec: '', notify: false, status: 'pending', lang: 'ar',
        text: 'هل حبوب فيتامين د كل يوم تضر الكلى؟' },
      { id: 'Q-1040', ago: 51, spec: 'dental', notify: true, status: 'selected', doctor: 'majed', lang: 'ar',
        text: 'كم مرة في السنة أحتاج تنظيف جير عند دكتور الأسنان؟' },
      { id: 'Q-1038', ago: 75, spec: 'general', notify: false, status: 'pending', lang: 'en',
        text: 'Is it normal for my knee to click when I climb stairs? There is no pain.' }
    ]
  }
};
