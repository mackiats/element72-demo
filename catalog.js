/* ===================================================================
   Element 72 — Phase 1 prototype catalog
   -------------------------------------------------------------------
   The eight real best-sellers from element72.co.th (homepage
   "Product Recommended — Most Selling", captured 2026-06-24). Prices,
   SKUs and product images are taken from the live product pages.

   GALLERY CONTRACT (product card carousel):
     • `image`    — the primary studio shot (single source of truth; used by
                    the storefront grid, compare and kit tiles).
     • `images[]` — ordered gallery for the product-card carousel. Frame 0 is
                    the primary shot; later frames are additional angles. The
                    card shows carousel controls (arrows + dots) only when
                    images.length > 1, and falls back to [image] otherwise.
       The "-detail" frames below are honest centre-crop detail views of each
       product's OWN studio photo — a stand-in until the real PDP alternate
       angles (the source pages expose _1_/_2_/_3_ frames) are pulled in.

   COPY + TAGS are produced by the project's two producer agents and
   mirror assets/best-sellers/BEST_SELLERS.md:
     • @copywriter  → bilingual blurb {en,th}, description {en,th},
                      reason {en,th} (the one-line reason-to-buy reused
                      by the recommendation / complete-the-look flows).
     • @seo-optimizer → tags[] (structured taxonomy) + synonyms[]
                      (TH/EN search terms that feed free-text recall).

   Stock levels are intentionally uneven — some sizes sold out, some
   low — to demonstrate HONEST availability display. The skeptic
   persona (Tee, P2) said a confident-wrong "yes, in stock" is worse
   than an honest "no". This prototype never fabricates stock.

   In the real Phase 1, this array is replaced by a live query against
   the existing commerce catalog. The card contract stays the same.
   =================================================================== */

const CATALOG = [
  /* 1 ----------------------------- YETI — drinkware ----------------------------- */
  {
    id: "yeti-silo-40-jug", brand: "yeti", name: "Silo 40 oz Jug",
    category: "drinkware", price: 1950, sku: "0888830531853",
    bestseller: true, isNew: false,
    image: "assets/products/yeti-silo-40-jug.jpg",
    images: ["assets/products/yeti-silo-40-jug.jpg", "assets/products/yeti-silo-40-jug-detail.jpg"],
    blurb: {
      en: "YETI's 40 oz sport jug. PermaFrost™ insulation, fence-hook handle.",
      th: "จั๊กเยติ 40 ออนซ์ ฉนวน PermaFrost™ หูจับแขวนรั้วได้"
    },
    description: {
      en: "The Silo uses the same PermaFrost™ insulation as YETI's Roadie hard coolers — ice-cold through a full training day. The leakproof straw cap means one-handed sipping, and the ergonomic handle has built-in fence hooks so it hangs wherever the bag drops. Sized and rated for ages 6+; the indestructible build is the point.",
      th: "ฉนวน PermaFrost™ รุ่นเดียวกับคูลเลอร์ Roadie ของเยติ — เก็บความเย็นได้ตลอดวันซ้อม ฝาหลอดดูดกันรั่วดื่มได้มือเดียว หูจับมีตะขอแขวนรั้วสนามได้ ออกแบบมาสำหรับเด็กอายุ 6 ปีขึ้นไป แต่ความทนทานแบบเยติคือเหตุผลที่ผู้ใหญ่ก็หยิบ"
    },
    reason: {
      en: "The water bottle that survives a kid's sports bag — and the YETI name on the side.",
      th: "ขวดน้ำที่รอดจากกระเป๋าเด็ก — ทนแบบเยติ ไม่ต้องเป็นห่วง"
    },
    colors: [{ key: "navy", hex: "#2b3a52" }],
    sizes: [{ label: "One Size", stock: 12 }],
    tags: ["bottle", "jug", "insulated", "leakproof", "sport", "kids", "outdoor", "camping", "travel", "lightweight"],
    synonyms: ["เยติ", "เยตี้", "กระติกน้ำ", "ขวดน้ำ", "กระบอกน้ำ", "เหยือกน้ำ", "เหยือก", "กระติกกีฬา", "ขวดเด็ก", "เก็บความเย็น",
      "water jug", "sport jug", "insulated jug", "straw jug", "kids water bottle", "leakproof jug", "fence hook bottle"]
  },

  /* 2 ----------------------------- NANGA — apparel ----------------------------- */
  {
    id: "nanga-mt-logo-tee", brand: "nanga", name: "Eco Hybrid MT Logo Tee",
    category: "apparel", price: 1900, sku: "NW2211-1G208",
    bestseller: true, isNew: false,
    image: "assets/products/nanga-mt-logo-tee.jpg",
    images: ["assets/products/nanga-mt-logo-tee.jpg", "assets/products/nanga-mt-logo-tee-detail.jpg"],
    blurb: {
      en: "NANGA mountain-logo tee. Ferre Yarn blend, cut to last seasons.",
      th: "เสื้อยืดโลโก้ภูเขา NANGA ผ้า Ferre Yarn ใส่ได้นานไม่ตกเทรนด์"
    },
    description: {
      en: "NANGA's most-bought tee: a regular-fit mountain-logo shirt in Ferre Yarn — a 50/47/3 poly-cotton-rayon blend that holds shape and breathes better than pure cotton. Six colourways from white to navy, sizes S–XL. The design is quiet enough to wear anywhere; the brand is the signal for those who know.",
      th: "เสื้อยืดขายดีที่สุดของ NANGA ทรง Regular Fit พิมพ์โลโก้ภูเขา ผ้า Ferre Yarn ผสม poly-cotton-rayon ทรงดี ระบายได้ดีกว่าคอตตอนล้วน มี 6 สีตั้งแต่ขาวถึงกรม ไซส์ S–XL ดีไซน์เรียบพอใส่ได้ทุกที่ แต่คนที่รู้จัก NANGA เข้าใจว่าเสื้อตัวนี้หมายถึงอะไร"
    },
    reason: {
      en: "The Japanese outdoor-brand tee that reads streetwear, not campsite.",
      th: "เสื้อยืด outdoor ญี่ปุ่นที่ใส่ในเมืองได้โดยไม่รู้สึกผิดที่"
    },
    colors: [
      { key: "white", hex: "#efe9dd" }, { key: "black", hex: "#23211e" },
      { key: "grey", hex: "#8c8a82" }, { key: "navy", hex: "#2b3a52" },
      { key: "tan", hex: "#b79b73" }, { key: "yellow", hex: "#d9b13b" }
    ],
    sizes: [
      { label: "S", stock: 7 }, { label: "M", stock: 9 },
      { label: "L", stock: 6 }, { label: "XL", stock: 0 }
    ],
    tags: ["tee", "urban", "lifestyle", "outdoor", "streetwear", "lightweight", "summer"],
    synonyms: ["แนงกะ", "นังกะ", "เสื้อยืด outdoor", "เสื้อแบรนด์ญี่ปุ่น", "เสื้อโลโก้ภูเขา", "เสื้อยืดแบรนด์เนม", "เสื้อ eco hybrid",
      "NANGA tee", "mountain logo shirt", "Japanese outdoor tee", "outdoor streetwear tee", "Ferre Yarn shirt", "eco hybrid tee"]
  },

  /* 3 ----------------------------- Topo Designs — bag ----------------------------- */
  {
    id: "topo-klettersack-duck-camo", brand: "topo", name: "Klettersack 25L (Duck Camo)",
    category: "bag", price: 4995, sku: "0840336857363",
    bestseller: true, isNew: true,
    image: "assets/products/topo-klettersack-duck-camo.jpg",
    images: ["assets/products/topo-klettersack-duck-camo.jpg", "assets/products/topo-klettersack-duck-camo-detail.jpg"],
    blurb: {
      en: "Klettersack in limited Duck Camo. 1000D recycled nylon, leather tabs, 25 L.",
      th: "Klettersack ลาย Duck Camo รุ่น Limited นีลอน 1000D รีไซเคิล 25 ลิตร"
    },
    description: {
      en: "The Klettersack is the bag that put Topo Designs on the map — this run brings it back in a limited Duck Camo print on 1000D recycled nylon with full-grain leather lash tabs and heavy-duty YKK zippers. The 25 L flap-top fits a 15\" laptop and has a water-bottle pocket on each side. When this colourway is gone, it's gone. Was ฿5,550.",
      th: "Klettersack คือกระเป๋าที่ทำให้ Topo Designs เป็นที่รู้จัก — รันนี้กลับมาในลาย Duck Camo limited บนผ้าไนลอน 1000D รีไซเคิล หูหนังแท้ และซิป YKK หนัก 25 ลิตรฝาสะพาย ใส่แล็ปท็อป 15 นิ้วได้ มีช่องขวดน้ำทั้งสองข้าง ลายนี้หมดแล้วหมดเลย"
    },
    reason: {
      en: "The collector's colourway of the daypack Topo fans already know by name.",
      th: "ลาย Limited ของกระเป๋าที่คนรู้จัก Topo อยากได้ทุกรุ่น"
    },
    colors: [{ key: "camo", hex: "#5d6248" }],
    sizes: [{ label: "One Size", stock: 6 }],
    tags: ["backpack", "urban", "lifestyle", "travel", "laptop", "limited", "camo", "recycled", "outdoor", "hiking"],
    synonyms: ["โทโป", "โทโปดีไซน์", "กระเป๋าเป้", "กระเป๋าสะพาย", "เป้ 25 ลิตร", "กระเป๋า camo", "กระเป๋า limited edition", "กระเป๋าไนลอนรีไซเคิล", "กระเป๋าใส่โน้ตบุ๊ก",
      "Topo Designs backpack", "Klettersack", "duck camo pack", "25L daypack", "limited edition backpack", "recycled nylon backpack", "flap top pack", "laptop backpack"]
  },

  /* 4 ----------------------------- KEEN — footwear ----------------------------- */
  {
    id: "keen-hyperport-h2", brand: "keen", name: "Hyperport H2 Sandal",
    category: "footwear", price: 4250, sku: "1031741",
    bestseller: true, isNew: false,
    image: "assets/products/keen-hyperport-h2.jpg",
    images: ["assets/products/keen-hyperport-h2.jpg", "assets/products/keen-hyperport-h2-detail.jpg"],
    blurb: {
      en: "KEEN's water-sport sneaker. Aquagrip sole, Kalibrate midsole, 315 g.",
      th: "สนีกเกอร์ลุยน้ำจากคีน พื้น Aquagrip มิดโซล Kalibrate หนัก 315 ก."
    },
    description: {
      en: "The Hyperport H2 is built for water but won't look out of place on the street: washable webbing upper, quick-dry lining, and PFAS-free water repellent keep it going wet-to-dry without a costume change. The Kalibrate midsole is noticeably soft underfoot, and Aquagrip rubber holds on wet rock and slick tile alike. KEEN Original Fit means the forefoot is wide — size down if you run narrow.",
      th: "Hyperport H2 ออกแบบมาลุยน้ำแต่ใส่ในเมืองได้สบาย สายถักซักได้ ซับในแห้งเร็ว และสาร DWR ที่ไม่มี PFAS ทำให้ไม่ต้องเปลี่ยนรองเท้ากลางวัน มิดโซล Kalibrate นุ่มสัมผัสได้ชัดเจน พื้น Aquagrip กันลื่นได้ทั้งบนหินเปียกและพื้นกระเบื้อง ทรง Original Fit หน้าเท้ากว้าง — ถ้าหน้าเท้าแคบแนะนำให้ลงไซส์"
    },
    reason: {
      en: "One shoe from the river to the café — no change needed.",
      th: "รองเท้าคู่เดียวจากแม่น้ำถึงคาเฟ่ ไม่ต้องเปลี่ยน"
    },
    colors: [{ key: "stone", hex: "#b6a98c" }],
    sizes: [
      { label: "40", stock: 5 }, { label: "41", stock: 3 }, { label: "42", stock: 8 },
      { label: "43", stock: 0 }, { label: "44", stock: 4 }, { label: "45", stock: 2 }, { label: "46", stock: 0 }
    ],
    tags: ["sandal", "water", "water-shoe", "summer", "urban", "lightweight", "waterproof", "hiking", "outdoor", "sport"],
    synonyms: ["คีน", "กีน", "รองเท้าลุยน้ำ", "รองเท้าน้ำ", "สนีกเกอร์กันน้ำ", "รองเท้าแห้งเร็ว", "รองเท้ากันน้ำ", "รองเท้าซักได้", "รองเท้าแม่น้ำ",
      "KEEN water shoe", "water sneaker", "aqua shoe", "quick-dry shoe", "washable shoe", "amphibious sneaker", "river shoe", "beach sneaker", "wet-dry shoe"]
  },

  /* 5 ----------------------------- KEEN — footwear ----------------------------- */
  {
    id: "keen-shanti-arts", brand: "keen", name: "Shanti Arts Slide",
    category: "footwear", price: 3250, sku: "1031821",
    bestseller: true, isNew: false,
    image: "assets/products/keen-shanti-arts.jpg",
    images: ["assets/products/keen-shanti-arts.jpg", "assets/products/keen-shanti-arts-detail.jpg"],
    blurb: {
      en: "KEEN x ESOW x GINZA GL collab sandal. 170 g, all-gender, art on foot.",
      th: "รองเท้าแตะคอลแลบ คีน x ESOW x GINZA GL ยูนิเซ็กซ์ 170 ก."
    },
    description: {
      en: "The Shanti Arts is KEEN's collab with Tokyo artist ESOW and Ginza GL — a wearable limited-edition print on a 170 g injection-molded sandal built for all-day city wear. Roomy toe box, arch-support insole, Eco Anti-Odor treatment, non-marking sole. This is a lifestyle piece first; the collab artwork is the reason to own it.",
      th: "Shanti Arts คือผลงานร่วมระหว่างคีนกับศิลปิน ESOW จากโตเกียวและ Ginza GL รองเท้าแตะ injection-molded หนัก 170 ก. ใส่ได้ทั้งวัน หน้าเท้ากว้าง พื้นรองรับอุ้งเท้า ระงับกลิ่น Eco Anti-Odor พื้นไม่ทิ้งรอย นี่คือของสะสมที่สวมใส่ได้ด้วย"
    },
    reason: {
      en: "The sandal that's actually a collab art piece — and happens to feel good all day.",
      th: "รองเท้าแตะที่จริง ๆ แล้วคืองานศิลปะ — ใส่สบายด้วย"
    },
    colors: [{ key: "print", hex: "#3c5a3a" }],
    sizes: [
      { label: "40", stock: 6 }, { label: "41", stock: 0 }, { label: "42", stock: 7 },
      { label: "43", stock: 5 }, { label: "44", stock: 2 }, { label: "45", stock: 0 }
    ],
    tags: ["sandal", "slide", "collab", "limited", "lightweight", "summer", "urban", "lifestyle", "unisex", "outdoor"],
    synonyms: ["คีน", "กีน", "รองเท้าแตะ", "รองเท้าสวม", "แตะ collab", "รองเท้า limited edition", "รองเท้าศิลปะ", "ยูนิเซ็กซ์", "รองเท้าคอลแลบ", "แตะญี่ปุ่น",
      "KEEN slide", "collab sandal", "limited edition sandal", "artist sandal", "ESOW KEEN", "all-gender sandal", "unisex sandal", "slip-on sandal", "Tokyo collab"]
  },

  /* 6 ----------------------------- Snow Peak — apparel ----------------------------- */
  {
    id: "snowpeak-graphic-cap", brand: "snowpeak", name: "Peak Snow Graphic Cap",
    category: "apparel", price: 1850, sku: "4550648093927",
    bestseller: true, isNew: false,
    image: "assets/products/snowpeak-graphic-cap.jpg",
    images: ["assets/products/snowpeak-graphic-cap.jpg", "assets/products/snowpeak-graphic-cap-detail.jpg"],
    blurb: {
      en: "Snow Peak graphic cap. Japanese outdoor brand, poly-cotton blend, one size.",
      th: "แก๊ป Snow Peak ผ้าผสม poly-cotton วันไซส์ แบรนด์ outdoor ญี่ปุ่น"
    },
    description: {
      en: "Snow Peak is the Japanese brand that turned camping into an aesthetic — this graphic cap carries the logo in embroidery on a poly-cotton-rayon shell structured at 17 cm crown height and sized for a 59 cm head circumference. One size. The fit is clean; it wears as a brand signal as much as a hat.",
      th: "Snow Peak คือแบรนด์ญี่ปุ่นที่เปลี่ยน camping ให้เป็น aesthetic — แก๊ปใบนี้ปักโลโก้บนผ้า poly-cotton-rayon สูง 17 ซม. รอบหัว 59 ซม. วันไซส์ ทรงสะอาด ใส่แล้วบอกว่ารู้จักแบรนด์อะไร"
    },
    reason: {
      en: "The Japanese camping brand's logo cap — the kind of thing you can't find at MBK.",
      th: "แก๊ปโลโก้แบรนด์ outdoor ญี่ปุ่นที่หาไม่ได้ทั่วไป"
    },
    colors: [{ key: "black", hex: "#23211e" }],
    sizes: [{ label: "One Size", stock: 10 }],
    tags: ["cap", "hat", "urban", "lifestyle", "outdoor", "camping", "summer", "lightweight"],
    synonyms: ["สโนว์พีค", "สโนว์พิก", "หมวกแก๊ป", "หมวก outdoor", "แก๊ปแบรนด์ญี่ปุ่น", "หมวกแบรนด์เนม", "แก๊ป camping", "หมวก Snow Peak",
      "Snow Peak hat", "Snow Peak cap", "Japanese outdoor cap", "camping brand cap", "graphic outdoor hat", "logo cap outdoor", "outdoor baseball cap"]
  },

  /* 7 ----------------------------- NEMO Equipment — camping ----------------------------- */
  {
    id: "nemo-moonlite-chair", brand: "nemo", name: "Moonlite Reclining Camp Chair",
    category: "camping", price: 5950, sku: "0811666036735",
    bestseller: true, isNew: false,
    image: "assets/products/nemo-moonlite-chair.jpg",
    images: ["assets/products/nemo-moonlite-chair.jpg", "assets/products/nemo-moonlite-chair-detail.jpg"],
    blurb: {
      en: "NEMO camp chair with adjustable recline. 956 g packed, 300 lb rated.",
      th: "เก้าอี้แค้มป์ NEMO ปรับเอนได้ พับเก็บ 956 ก. รับน้ำหนักได้ 136 กก."
    },
    description: {
      en: "The Moonlite is a reclining camp chair that packs to 35 × 10 × 35 cm — carry-on sized — and sets up to a full seat (52 × 51 × 65 cm) in seconds. The recline angle adjusts without tools: upright for meals, kicked back for reading. Forged 6061 aluminum hubs and 7001 aluminum tubes hold a 300 lb load. At ฿5,950 it's a considered buy; the adjustable seat is what separates it from fixed camp chairs at half the price.",
      th: "Moonlite คือเก้าอี้แค้มป์แบบปรับเอนได้ พับเก็บขนาด 35 x 10 x 35 ซม. — พอดีกระเป๋าเดินทาง — กางออกเต็มที่ 52 x 51 x 65 ซม. ปรับมุมเอนได้โดยไม่ต้องใช้เครื่องมือ นั่งตรงสำหรับกินข้าว เอนหลังสำหรับอ่านหนังสือ โครงอลูมิเนียม 6061 และ 7001 รับน้ำหนักได้ 136 กก. ราคา ฿5,950 ไม่ใช่ถูกที่สุด แต่การปรับเอนได้คือสิ่งที่เก้าอี้แค้มป์ทั่วไปทำไม่ได้"
    },
    reason: {
      en: "The camp chair that goes from dinner-upright to reading-flat — without buying two chairs.",
      th: "เก้าอี้แค้มป์ที่นั่งกินข้าวได้และเอนอ่านหนังสือได้ — ตัวเดียว"
    },
    colors: [{ key: "black", hex: "#23211e" }],
    sizes: [{ label: "One Size", stock: 4 }],
    tags: ["chair", "camping", "packable", "reclining", "aluminum", "lightweight", "outdoor", "travel"],
    synonyms: ["นีโม่", "นีโม", "เก้าอี้แค้มป์", "เก้าอี้พกพา", "เก้าอี้ camping", "เก้าอี้ปรับเอน", "เก้าอี้พับได้", "เก้าอี้อลูมิเนียม", "เก้าอี้เดินป่า",
      "NEMO chair", "camp chair", "reclining camp chair", "packable chair", "adjustable camp chair", "aluminum camp chair", "folding camp chair", "lightweight camp chair"]
  },

  /* 8 ----------------------------- Gramicci — apparel ----------------------------- */
  {
    id: "gramicci-nylon-block-short", brand: "gramicci", name: "Nylon Block Short",
    category: "apparel", price: 3250, sku: "G6SM-P033",
    bestseller: true, isNew: false,
    image: "assets/products/gramicci-nylon-block-short.jpg",
    images: ["assets/products/gramicci-nylon-block-short.jpg", "assets/products/gramicci-nylon-block-short-detail.jpg"],
    blurb: {
      en: "Gramicci nylon short. Recycled fabric, chlorine-resistant, gusseted, slim fit.",
      th: "กางเกงขาสั้น Gramicci ไนลอนรีไซเคิล ทนคลอรีน มีชายผ้า ทรง Slim"
    },
    description: {
      en: "The Nylon Block Short is made from 100% recycled nylon that resists water and chlorine — pool to street without a change. The diamond gusset gives full-range movement, the integrated belt and elastic waist mean no sizing fuss, and the two-tone block design makes it look less like a swim short than the specs suggest. Slim fit; size up if you prefer room.",
      th: "Nylon Block Short ทำจากไนลอนรีไซเคิล 100% กันน้ำและทนคลอรีน ลงสระแล้วต่อได้เลย ชายผ้าเพชรให้ขยับขาได้เต็มที่ เข็มขัดในตัวและเอวยางยืดไม่ต้องปรับไซส์วุ่น ดีไซน์สองสีทำให้ไม่ได้ดูเหมือนกางเกงว่ายน้ำ ทรง Slim — ถ้าชอบหลวมแนะนำขึ้นไซส์"
    },
    reason: {
      en: "The short that handles the pool, the market, and the café — chlorine-resistant recycled nylon.",
      th: "กางเกงขาสั้นที่ลงสระได้ แวะตลาดได้ และนั่งคาเฟ่ได้ในตัวเดียว"
    },
    colors: [{ key: "green", hex: "#2f6b53" }],
    sizes: [
      { label: "S", stock: 6 }, { label: "M", stock: 8 },
      { label: "L", stock: 5 }, { label: "XL", stock: 2 }
    ],
    tags: ["shorts", "urban", "summer", "lightweight", "waterproof", "outdoor", "climbing", "recycled", "active", "lifestyle"],
    synonyms: ["กรามิชชี่", "กรามิชี่", "กรามิชชี", "กางเกงขาสั้น outdoor", "กางเกงไนลอน", "กางเกงทนคลอรีน", "กางเกง nylon รีไซเคิล", "กางเกงปีนเขา", "กางเกงกันน้ำ",
      "Gramicci shorts", "nylon shorts", "climbing shorts", "recycled nylon shorts", "chlorine resistant shorts", "swim to street shorts", "gusseted shorts", "water resistant shorts", "outdoor shorts"]
  }
];

// Display names for brands (matching the `brand` keys above).
const BRAND_NAMES = {
  keen: "KEEN", yeti: "YETI", gramicci: "Gramicci", topo: "Topo Designs",
  nanga: "NANGA", snowpeak: "Snow Peak", nemo: "NEMO Equipment"
};
