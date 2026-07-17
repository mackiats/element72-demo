/* ===================================================================
   Element 72 — Phase 1 chat prototype • application logic
   -------------------------------------------------------------------
   Deterministic, rule-based intent parsing (NO LLM/inference dependency,
   per Phase 1 of the project scope). Bilingual Thai + English with
   brand transliteration. Honest stock + honest no-match.
   =================================================================== */

(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const money = (n) => "฿" + n.toLocaleString("en-US");
  const hasWord = (s, kw) => {
    if (/^[\x00-\x7F]+$/.test(kw)) {
      return new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(s);
    }
    return s.indexOf(kw) !== -1; // Thai: substring
  };

  /* ---------- state ---------- */
  let lang = "en";
  let busy = false;
  const cart = [];
  const compareTray = [];
  let comparePromptShown = false; // one guide nudge per staging session

  /* ---------- copy ---------- */
  const STRINGS = {
    en: {
      placeholder: "Search the catalogue — “KEEN sandals size 42”",
      nudgeHint: "Want something else? Search again…",
      barText: "Ask a guide — gear, brand, activity…",
      browse: "Browse everything",
      human: "Talk to a human (LINE)",
      welcome:
        "Hi — I’m EL, Element 72’s shop assistant. Tell me a brand, a size, or what you’re after and I’ll pull it up. No idea yet? Tap a starter below or browse everything.",
      prompts: [
        { label: "KEEN sandals • size 42", q: "KEEN sandals in size 42" },
        { label: "YETI tumblers under ฿1,500", q: "YETI tumblers under 1500" },
        { label: "Lightweight rain shell", q: "lightweight rain shell" },
        { label: "Style me for the city", q: "style me for the city" },
        { label: "What’s new", q: "what's new" }
      ],
      bag: "Your bag", subtotal: "Subtotal", checkout: "Checkout",
      itemsCount: (n) => n + (n === 1 ? " item" : " items"),
      cartNote: "Quick-add is a Phase 1 stub. Real checkout hands off to the existing commerce backend.",
      cartEmpty: "Your bag is empty.\nAsk me for something to get started.",
      everything: "Everything",
      addToBag: "Add to bag", size: "Size", selectSize: "Select a size",
      addToChat: "Add to chat", addToChatHint: "Ask the guide — size, fit, or alternatives",
      buyNow: "Buy now",
      pickSize: "Pick a size first.",
      inStock: "In stock", lowStock: (n) => n + " left", soldOut: "Sold out",
      viewMore: (n) => "View " + n + " more",
      seeAll: "See all", whatsNew: "What’s new",
      added: (n, s) => "Added <b>" + n + "</b>" + (s ? " • size " + s : "") + " to your bag",
      humanToast: "This would open LINE @element72 — a real person picks up from here.",
      checkoutToast: "Checkout would hand off to the existing commerce backend (Phase 1 stub).",
      hereIs: (n) => "Here’s the " + n + ".",
      compare: "Compare", completeLook: "Complete the look",
      viewAdd: "View & add", clearWord: "Clear",
      rowPrice: "Price", rowType: "Type", rowBest: "Best for", rowWater: "Waterproof", rowStock: "Availability", rowColors: "Colours",
      kitTotal: "Kit total", addAll: "Add all to bag",
      addedKit: (n, total) => "Added <b>" + n + " pieces</b> • " + total + " to your bag",
      compareHint: "Pick two to compare — search for each product, then tap “Compare” on its card and I’ll line them up side by side.",
      compareLead: (n) => "Side-by-side — " + n + " products, the honest differences.",
      compareAddMore: "Find one more to compare",
      comparePrompt: "Good pick. Now use the search bar to find the product you’d like to compare it with — then tap <strong>Compare</strong> on its card too.",
      compareRemove: (n) => "Remove " + n + " from compare",
      compareCaption: (n) => "Comparison of " + n + " products",
      bestPrice: "Lowest price", almostGone: "Almost gone",
      waterYes: "Waterproof", waterNo: "Not waterproof",
      compareStep: (n) => n < 2 ? n + " of 2 • one more to go" : "ready",
      compareStaged: (n) => n < 2 ? "Added to compare • find one more" : "Added to compare • " + n + " staged",
      compareCta: "Compare",
      compareReadyNote: (n) => n + " staged — here’s the side-by-side.",
      lookLead: (name) => "Here’s how I’d build a look around the " + name + ".",
      styleLead: (occ) => "A kit for " + occ + " — a starting point, not a uniform.",
      occ_city: "a city weekend", occ_camping: "a camping trip", occ_travel: "travel", occ_rain: "a rainy day", occ_hike: "a hike",
      kit_city: "Urban weekend", kit_camping: "Camp kit", kit_travel: "Travel kit", kit_rain: "Rainy-day kit", kit_hike: "Trail kit",
      lookTitle: (b, n) => b + " " + n + " — the look", yourPick: "Your pick",
      partnersEyebrow: "Official Importer & Distributor",
      partnersNote: "Element 72 is the official Thailand importer for the brands we carry — authentic stock, full local warranty."
    },
    th: {
      placeholder: "ค้นหาสินค้า — เช่น “รองเท้าแตะ KEEN ไซส์ 42”",
      nudgeHint: "อยากดูอย่างอื่น? ค้นหาเพิ่มได้เลย…",
      barText: "ถามไกด์ได้เลย — แบรนด์ กิจกรรม หรือสินค้า…",
      browse: "ดูสินค้าทั้งหมด",
      human: "คุยกับเจ้าหน้าที่ (LINE)",
      welcome:
        "สวัสดีค่ะ ฉันชื่อ EL ผู้ช่วยร้าน Element 72 — บอกแบรนด์ ไซส์ หรือสิ่งที่กำลังมองหาได้เลย เดี๋ยวจัดให้ ยังไม่แน่ใจ? แตะตัวอย่างด้านล่าง หรือดูสินค้าทั้งหมดได้ค่ะ",
      prompts: [
        { label: "รองเท้าแตะ KEEN • ไซส์ 42", q: "รองเท้าแตะ KEEN ไซส์ 42" },
        { label: "กระบอกน้ำ YETI ไม่เกิน ฿1,500", q: "กระบอกน้ำ YETI ไม่เกิน 1500" },
        { label: "เสื้อกันฝนน้ำหนักเบา", q: "เสื้อกันฝนน้ำหนักเบา" },
        { label: "จัดลุคเที่ยวในเมือง", q: "จัดลุคสำหรับเที่ยวในเมือง" },
        { label: "มาใหม่", q: "มีอะไรใหม่" }
      ],
      bag: "ตะกร้าของคุณ", subtotal: "ยอดรวม", checkout: "ชำระเงิน",
      itemsCount: (n) => n + " ชิ้น",
      cartNote: "การเพิ่มลงตะกร้าเป็นตัวอย่าง Phase 1 — การชำระเงินจริงจะเชื่อมกับระบบหลังบ้านเดิม",
      cartEmpty: "ตะกร้ายังว่างอยู่\nลองถามหาสินค้าเพื่อเริ่มต้นได้เลยค่ะ",
      everything: "สินค้าทั้งหมด",
      addToBag: "เพิ่มลงตะกร้า", size: "ไซส์", selectSize: "เลือกไซส์",
      addToChat: "คุยกับไกด์", addToChatHint: "ถามไกด์เรื่องไซส์ การใส่ หรือรุ่นใกล้เคียง",
      buyNow: "ซื้อเลย",
      pickSize: "เลือกไซส์ก่อนนะคะ",
      inStock: "มีสินค้า", lowStock: (n) => "เหลือ " + n, soldOut: "หมด",
      viewMore: (n) => "ดูเพิ่มอีก " + n + " รายการ",
      seeAll: "ดูทั้งหมด", whatsNew: "มาใหม่",
      added: (n, s) => "เพิ่ม <b>" + n + "</b>" + (s ? " • ไซส์ " + s : "") + " ลงตะกร้าแล้ว",
      humanToast: "จะเปิด LINE @element72 — เจ้าหน้าที่จริงรับช่วงต่อจากตรงนี้ค่ะ",
      checkoutToast: "การชำระเงินจะเชื่อมกับระบบหลังบ้านเดิม (ตัวอย่าง Phase 1)",
      hereIs: (n) => "นี่คือ " + n + " ค่ะ",
      compare: "เทียบ", completeLook: "จัดลุคให้",
      viewAdd: "ดู & เพิ่ม", clearWord: "ล้าง",
      rowPrice: "ราคา", rowType: "ประเภท", rowBest: "เหมาะกับ", rowWater: "กันน้ำ", rowStock: "ความพร้อม", rowColors: "สี",
      kitTotal: "รวมทั้งเซ็ต", addAll: "เพิ่มทั้งเซ็ตลงตะกร้า",
      addedKit: (n, total) => "เพิ่ม <b>" + n + " ชิ้น</b> • " + total + " ลงตะกร้าแล้ว",
      compareHint: "เลือกสองสินค้ามาเทียบได้เลย — ค้นหาแต่ละชิ้นแล้วกด “เทียบ” บนการ์ด เดี๋ยวจัดวางเทียบให้ค่ะ",
      compareLead: (n) => "เทียบกัน — " + n + " รายการ ดูความต่างแบบตรงไปตรงมาค่ะ",
      compareAddMore: "ค้นหาอีกหนึ่งชิ้นมาเทียบ",
      comparePrompt: "เลือกได้ดีค่ะ ทีนี้ใช้ช่องค้นหาเพื่อหาสินค้าที่อยากเทียบ แล้วกด <strong>เทียบ</strong> บนการ์ดนั้นด้วยนะคะ",
      compareRemove: (n) => "นำ " + n + " ออกจากการเทียบ",
      compareCaption: (n) => "ตารางเทียบสินค้า " + n + " รายการ",
      bestPrice: "ราคาดีที่สุด", almostGone: "ใกล้หมด",
      waterYes: "กันน้ำ", waterNo: "ไม่กันน้ำ",
      compareStep: (n) => n < 2 ? n + " จาก 2 • อีกหนึ่งชิ้นค่ะ" : "พร้อมแล้ว",
      compareStaged: (n) => n < 2 ? "เพิ่มเข้าการเทียบแล้ว • หาอีกหนึ่งชิ้น" : "เพิ่มเข้าการเทียบแล้ว • " + n + " ชิ้น",
      compareCta: "เทียบ",
      compareReadyNote: (n) => "เลือกแล้ว " + n + " ชิ้น — มาดูแบบเทียบกันค่ะ",
      lookLead: (name) => "ลองจัดลุครอบ ๆ " + name + " แบบนี้ค่ะ",
      styleLead: (occ) => "เซ็ตสำหรับ" + occ + " — เป็นจุดเริ่มต้น ปรับได้ตามชอบค่ะ",
      occ_city: "เที่ยวในเมือง", occ_camping: "ไปแคมป์", occ_travel: "เดินทาง", occ_rain: "วันฝนตก", occ_hike: "เดินป่า",
      kit_city: "ลุคในเมือง", kit_camping: "เซ็ตแคมป์", kit_travel: "เซ็ตเดินทาง", kit_rain: "เซ็ตวันฝนตก", kit_hike: "เซ็ตเดินป่า",
      lookTitle: (b, n) => b + " " + n + " — จัดลุค", yourPick: "ที่คุณเลือก",
      partnersEyebrow: "ผู้นำเข้าและจัดจำหน่ายอย่างเป็นทางการ",
      partnersNote: "Element 72 เป็นผู้นำเข้าอย่างเป็นทางการในไทยของแบรนด์ที่เราจำหน่าย — สินค้าแท้ พร้อมรับประกันในประเทศ"
    }
  };
  const T = () => STRINGS[lang];

  /* ---------- matching dictionaries ---------- */
  const BRAND_ALIASES = {
    keen: ["keen", "คีน", "กีน"],
    yeti: ["yeti", "เยติ", "เยตี้"],
    gramicci: ["gramicci", "gramici", "กรามิชชี่", "กรามิชี่", "กรามิชชี", "กรามิชี"],
    topo: ["topo designs", "topo", "โทโป", "โทโปดีไซน์"],
    nanga: ["nanga", "นางะ", "นันกะ", "แนงกะ", "นังกะ"],
    snowpeak: ["snow peak", "snowpeak", "สโนพีค", "สโนว์พีค", "สโนว์พิก"],
    nemo: ["nemo equipment", "nemo", "นีโม่", "นีโม"]
  };
  const NOT_CARRIED = {
    salomon: "Salomon", nike: "Nike", adidas: "adidas", patagonia: "Patagonia",
    "the north face": "The North Face", "north face": "The North Face",
    columbia: "Columbia", merrell: "Merrell", hoka: "HOKA",
    "arc'teryx": "Arc’teryx", arcteryx: "Arc’teryx", decathlon: "Decathlon",
    birkenstock: "Birkenstock", "new balance": "New Balance", crocs: "Crocs",
    timberland: "Timberland", vans: "Vans", converse: "Converse"
  };
  const NOT_CARRIED_REDIRECT = {
    salomon: "keen", nike: "keen", adidas: "keen", merrell: "keen", hoka: "keen",
    birkenstock: "keen", "new balance": "keen", crocs: "keen", timberland: "keen",
    vans: "keen", converse: "keen",
    patagonia: "nanga", "the north face": "nanga", "north face": "nanga",
    columbia: "nanga", "arc'teryx": "nanga", arcteryx: "nanga",
    decathlon: "topo"
  };
  const CATEGORY_KW = {
    camping: ["camp chair", "camping chair", "reclining chair", "chair", "เก้าอี้แคมป์", "เก้าอี้สนาม", "เก้าอี้พับ", "เก้าอี้"],
    filter: ["water purifier", "water filter", "purifier", "filter", "เครื่องกรองน้ำ", "กรองน้ำ"],
    cooler: ["cooler", "cool box", "coolbox", "ice box", "กระติกน้ำแข็ง", "กระติก"],
    lighting: ["headlamp", "head lamp", "lantern", "flashlight", "torch", "light", "ไฟคาดหัว", "ไฟฉาย", "โคมไฟ", "ไฟ"],
    bag: ["backpack", "daypack", "rucksack", "messenger", "tote", "bag", "pack", "กระเป๋าเป้", "กระเป๋าสะพาย", "กระเป๋า", "เป้"],
    apparel: ["jacket", "shell", "fleece", "shirt", "pant", "pants", "trouser", "trousers", "เสื้อกันฝน", "เสื้อกันหนาว", "แจ็คเก็ต", "กางเกง", "เสื้อ", "ฟลีซ"],
    drinkware: ["tumbler", "bottle", "flask", "mug", "water bottle", "drinkware", "กระบอกน้ำ", "ขวดน้ำ", "แก้ว"],
    footwear: ["sandal", "sandals", "sneaker", "sneakers", "shoe", "shoes", "boot", "boots", "footwear", "รองเท้าแตะ", "รองเท้าผ้าใบ", "รองเท้า", "บูท"]
  };
  const SUBTYPE_KW = {
    sandal: "sandal", sandals: "sandal", รองเท้าแตะ: "sandal",
    sneaker: "sneaker", sneakers: "sneaker", รองเท้าผ้าใบ: "sneaker",
    boot: "boot", boots: "boot", บูท: "boot",
    tumbler: "tumbler",
    bottle: "bottle",
    jacket: "jacket", แจ็คเก็ต: "jacket",
    fleece: "fleece", ฟลีซ: "fleece",
    pant: "pants", pants: "pants", trousers: "pants", กางเกง: "pants",
    backpack: "backpack", daypack: "backpack", กระเป๋าเป้: "backpack",
    messenger: "messenger",
    headlamp: "headlamp", ไฟคาดหัว: "headlamp",
    lantern: "lantern", puffer: "down",
    tee: "tee", "t-shirt": "tee", tshirt: "tee", เสื้อยืด: "tee",
    cap: "cap", hat: "cap", หมวก: "cap",
    short: "shorts", shorts: "shorts", กางเกงขาสั้น: "shorts", ขาสั้น: "shorts",
    chair: "chair", "camp chair": "chair", เก้าอี้: "chair",
    jug: "jug"
  };
  const ATTR_KW = {
    waterproof: "waterproof", "water resistant": "waterproof", "water-resistant": "waterproof", กันน้ำ: "waterproof",
    lightweight: "lightweight", "light weight": "lightweight", น้ำหนักเบา: "lightweight", เบา: "lightweight",
    "rain shell": "rain", "rain jacket": "rain", rain: "rain", เสื้อกันฝน: "rain", กันฝน: "rain",
    insulated: "insulated", เก็บความเย็น: "insulated", เก็บอุณหภูมิ: "insulated",
    hiking: "hiking", trail: "hiking", เดินป่า: "hiking",
    climbing: "climbing", ปีนเขา: "climbing", ปีนผา: "climbing",
    warm: "warm", กันหนาว: "warm",
    camping: "camping", camp: "camping", ตั้งแคมป์: "camping", แคมป์: "camping",
    urban: "urban", city: "urban", ในเมือง: "urban"
  };
  const COLOR_KW = {
    black: ["black", "ดำ", "สีดำ"], white: ["white", "ขาว", "สีขาว"],
    grey: ["grey", "gray", "เทา", "สีเทา"],
    navy: ["navy", "น้ำเงิน", "กรมท่า", "blue", "ฟ้า", "สีฟ้า"],
    green: ["green", "เขียว", "สีเขียว"], olive: ["olive", "มะกอก"],
    orange: ["orange", "ส้ม", "สีส้ม"], brown: ["brown", "น้ำตาล", "สีน้ำตาล"],
    tan: ["tan", "ครีม"], red: ["red", "แดง", "สีแดง"]
  };

  /* ---------- display nouns ---------- */
  const SUBTYPE_ORDER = ["sandal", "sneaker", "boot", "tumbler", "bottle", "jug", "tee", "fleece", "rain", "jacket", "down", "pants", "shorts", "cap", "backpack", "messenger", "headlamp", "lantern", "chair"];
  const NOUN_EN = {
    sandal: "sandals", sneaker: "sneakers", boot: "boots", tumbler: "tumblers",
    bottle: "bottles", jug: "jugs", tee: "tees", fleece: "fleeces", rain: "rain shells", jacket: "jackets",
    down: "jackets", pants: "pants", shorts: "shorts", cap: "caps", backpack: "packs", messenger: "messenger bags",
    headlamp: "headlamps", lantern: "lanterns", chair: "camp chairs"
  };
  const NOUN_TH = {
    sandal: "รองเท้าแตะ", sneaker: "รองเท้าผ้าใบ", boot: "รองเท้าบูท", tumbler: "แก้วเก็บอุณหภูมิ",
    bottle: "กระบอกน้ำ", jug: "กระติกน้ำ", tee: "เสื้อยืด", fleece: "เสื้อฟลีซ", rain: "เสื้อกันฝน", jacket: "แจ็คเก็ต",
    down: "แจ็คเก็ต", pants: "กางเกง", shorts: "กางเกงขาสั้น", cap: "หมวก", backpack: "กระเป๋าเป้", messenger: "กระเป๋าสะพาย",
    headlamp: "ไฟคาดหัว", lantern: "โคมไฟ", chair: "เก้าอี้แคมป์"
  };
  const CAT_EN = { footwear: "shoes", drinkware: "drinkware", cooler: "coolers", apparel: "pieces", bag: "bags", lighting: "lights", filter: "water purifiers", camping: "camp gear" };
  const CAT_TH = { footwear: "รองเท้า", drinkware: "เครื่องดื่ม", cooler: "กระติก", apparel: "เสื้อผ้า", bag: "กระเป๋า", lighting: "ไฟ", filter: "เครื่องกรองน้ำ", camping: "อุปกรณ์แคมป์" };

  /* ---------- Phase 2: recommendation data ---------- */
  // Occasion sets are hand-curated so a recommendation is never a tasteless
  // pairing (the brand-risk concern). In real Phase 2 this is LLM-assembled.
  const OCCASION_KW = {
    camping: ["camping", "campsite", "camp", "ตั้งแคมป์", "แคมป์", "เข้าป่า"],
    hike: ["hike", "hiking", "trek", "trekking", "trail", "เดินป่า", "ปีนเขา"],
    travel: ["travel", "traveling", "travelling", "trip", "abroad", "flight", "เที่ยว", "เดินทาง", "ทริป", "ต่างประเทศ"],
    rain: ["rainy", "rain", "monsoon", "wet weather", "หน้าฝน", "ฝนตก", "ฝน"],
    city: ["city", "urban", "weekend", "everyday", "casual", "ในเมือง", "สุดสัปดาห์", "ลำลอง", "ทุกวัน"]
  };
  const OCCASION_SETS = {
    city: ["nanga-mt-logo-tee", "gramicci-nylon-block-short", "snowpeak-graphic-cap", "topo-klettersack-duck-camo"],
    camping: ["nemo-moonlite-chair", "yeti-silo-40-jug", "keen-hyperport-h2", "topo-klettersack-duck-camo"],
    travel: ["topo-klettersack-duck-camo", "keen-hyperport-h2", "yeti-silo-40-jug", "snowpeak-graphic-cap"],
    rain: ["keen-hyperport-h2", "gramicci-nylon-block-short", "topo-klettersack-duck-camo", "snowpeak-graphic-cap"],
    hike: ["keen-hyperport-h2", "topo-klettersack-duck-camo", "yeti-silo-40-jug", "nemo-moonlite-chair"]
  };
  const COMPLEMENT_ORDER = ["footwear", "apparel", "bag", "drinkware"];
  const VIBE_TAGS = ["urban", "camping", "hiking", "travel", "climbing", "summer"];
  const USECASE = {
    en: { hiking: "Trail & hiking", climbing: "Climbing & active", camping: "Camping", travel: "Travel", urban: "City / everyday", summer: "Warm weather", insulated: "Keeps temperature", waterproof: "Wet conditions", down: "Cold weather" },
    th: { hiking: "เดินป่า", climbing: "ปีนเขา/แอคทีฟ", camping: "แคมป์", travel: "เดินทาง", urban: "ในเมือง/ทุกวัน", summer: "อากาศร้อน", insulated: "เก็บอุณหภูมิ", waterproof: "วันฝนตก", down: "อากาศหนาว" }
  };
  const byId = (id) => CATALOG.find((p) => p.id === id);
  const hasStock = (p) => p.sizes.some((s) => s.stock > 0);

  /* =================================================================
     FREE-TEXT SEARCH INDEX  (search by tags + descriptions + categories)
     -----------------------------------------------------------------
     The structured parser below handles high-intent queries (brand /
     category / size / price). This layer adds RECALL: any query word the
     dictionaries don't recognise is matched against a product's tags, its
     blurb/description copy, and its category — so "washable", "commute",
     "solar lantern" or a description phrase still finds the right card.
     Owned by the @seo-optimizer agent (.claude/agents/seo-optimizer.md).
     ================================================================= */
  // Tokens the structured parser already understands — excluded so the
  // free-text layer only acts on the RESIDUAL of a query. Built from every
  // matching dictionary (brand / not-carried / category / subtype / attr /
  // colour / occasion), so a dictionary word never double-counts as keyword.
  const STOPWORDS = new Set(
    ("a an the and or of for with to in on at by is are be do does i im you we my " +
     "want need looking show find get got give please just something anything some any " +
     "thing things good best better nice cool what whats which that this these those there here " +
     "under over below less than max within budget cheaper around about same like " +
     "size sizes color colour colours new latest popular trending top picks pick " +
     "compare versus vs style outfit kit gear wear look").split(/\s+/)
  );
  const DICT_WORDS = (() => {
    const set = new Set();
    const eat = (str) => String(str).toLowerCase().split(/[\s/]+/).forEach((w) => { if (w) set.add(w); });
    [BRAND_ALIASES, COLOR_KW].forEach((d) => Object.values(d).forEach((arr) => arr.forEach(eat)));
    Object.keys(NOT_CARRIED).forEach(eat);
    [CATEGORY_KW, OCCASION_KW].forEach((d) => Object.values(d).forEach((arr) => arr.forEach(eat)));
    [SUBTYPE_KW, ATTR_KW].forEach((d) => Object.keys(d).forEach(eat));
    return set;
  })();

  // Card blurb is bilingual ({en,th}); blurbText picks the active language
  // (legacy string blurbs still render), blurbAll returns both for the index.
  function blurbText(p) {
    if (!p.blurb) return "";
    return typeof p.blurb === "string" ? p.blurb : (p.blurb[lang] || p.blurb.en || "");
  }
  function blurbAll(p) {
    if (!p.blurb) return "";
    return typeof p.blurb === "string" ? p.blurb : [p.blurb.en, p.blurb.th].filter(Boolean).join(" ");
  }
  // The copywriter's one-line reason-to-buy, localized — reused by the
  // recommendation / complete-the-look flows (kit header + item tooltip).
  function reasonText(p) {
    if (!p.reason) return "";
    return typeof p.reason === "string" ? p.reason : (p.reason[lang] || p.reason.en || "");
  }

  // The text a product is findable by: brand + name + category (key + EN/TH noun)
  // + tags + the seo-optimizer's synonyms + the copywriter's blurb/description (both
  // languages). This is what lets the bar match by TAGS, DESCRIPTIONS, CATEGORIES and
  // bilingual SYNONYMS rather than only an exact dictionary hit.
  function searchText(p) {
    const cat = [p.category, CAT_EN[p.category], CAT_TH[p.category]].join(" ");
    const desc = p.description ? [p.description.en, p.description.th].filter(Boolean).join(" ") : "";
    const colors = (p.colors || []).map((c) => c.key).join(" ");
    const syn = (p.synonyms || []).join(" ");
    return [BRAND_NAMES[p.brand], p.brand, p.name, cat, (p.tags || []).join(" "), syn, blurbAll(p), desc, colors]
      .join(" ").toLowerCase();
  }

  // Residual query words: meaningful tokens the structured parser didn't consume.
  function extractKeywords(raw) {
    const s = raw.toLowerCase();
    const out = new Set();
    (s.match(/[a-z][a-z'’-]{2,}/g) || []).forEach((w) => {
      if (!STOPWORDS.has(w) && !DICT_WORDS.has(w)) out.add(w);
    });
    (raw.match(/[฀-๿]{2,}/g) || []).forEach((seg) => { if (!DICT_WORDS.has(seg)) out.add(seg); });
    return [...out];
  }
  const deSuffix = (w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w);
  function keywordScore(p, kws) {
    const hay = searchText(p);
    let sc = 0;
    kws.forEach((k) => { if (hay.indexOf(k) !== -1 || hay.indexOf(deSuffix(k)) !== -1) sc++; });
    return sc;
  }

  /* ---------- artwork ---------- */
  // Product photography isn't shot yet — flat neutral placeholder tiles (no
  // gradients, per the Color Book). The category icon carries identification.
  const TILE = "var(--media)";
  const GRAD = {
    footwear: TILE, drinkware: TILE, cooler: TILE, apparel: TILE,
    bag: TILE, lighting: TILE, filter: TILE, camping: TILE
  };
  const S = (p) => '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    footwear: S('<path d="M5 30c2-1 5-1 8 0l6 2c3 1 6 1 9 0l9-2c3 0 5 1 5 4v2H5z"/><path d="M5 30l1-8c.3-2 2-3 4-2l3 1 2 4 4 1"/>'),
    drinkware: S('<path d="M18 7h12v6l-2 4v21a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V17l-2-4z"/><path d="M18 22h12"/>'),
    cooler: S('<rect x="8" y="16" width="32" height="22" rx="2"/><path d="M8 24h32M16 16v-4h16v4"/>'),
    apparel: S('<path d="M18 8l6 4 6-4 8 6-4 6-4-2v18H18V18l-4 2-4-6z"/>'),
    bag: S('<rect x="12" y="14" width="24" height="28" rx="6"/><path d="M18 14v-2a6 6 0 0 1 12 0v2M18 27h12v8H18z"/>'),
    lighting: S('<path d="M18 10h12M20 10v-3h8v3"/><rect x="16" y="14" width="16" height="22" rx="3"/><path d="M22 41h4"/>'),
    filter: S('<path d="M24 7c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19z"/>'),
    camping: S('<path d="M16 9v15h16M16 24l-3 15M32 24l3 15M13 24h22"/>')
  };

  // Product media: the real product photo when we have one, with the category
  // icon as a graceful fallback. The icon is laid down first (behind); the
  // photo covers it and is hidden again if it fails to load, revealing the
  // icon. `overlay` is extra HTML (badges, flags) painted on top of the art.
  function mediaArt(p, overlay) {
    const icon = ICONS[p.category] || ICONS.footwear;
    const over = overlay || "";
    if (!p.image) return icon + over;
    const alt = (p.name || "").replace(/"/g, "&quot;");
    return icon +
      '<img class="media-img" src="' + p.image + '" alt="' + alt +
      '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'" />' +
      over;
  }

  // Gallery frames for the product-card carousel. Frame 0 is the primary studio
  // shot; later frames are additional angles. Falls back to the single `image`,
  // then to none (icon-only). See the GALLERY CONTRACT note in catalog.js.
  function productImages(p) {
    if (Array.isArray(p.images) && p.images.length) return p.images;
    return p.image ? [p.image] : [];
  }

  function carArrow(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  // The rich product card's media: an inset, rounded photo viewport holding a
  // swipeable multi-photo carousel. Controls (arrows + dots) appear ONLY when
  // there is more than one frame; a single frame renders as a static photo.
  // `overlays` are nodes (badges, brand wordmark) painted on top of the photo,
  // inside the 16px frame. The category icon stays behind each photo as the
  // load-failure fallback (same contract as mediaArt).
  function buildCardMedia(p, overlays) {
    const media = document.createElement("div");
    media.className = "card-media";

    const frames = productImages(p);
    const icon = ICONS[p.category] || ICONS.footwear;
    const alt = (p.name || "").replace(/"/g, "&quot;");
    const multi = frames.length > 1;

    const view = document.createElement("div");
    view.className = "pcar" + (multi ? " has-multi" : "");

    const track = document.createElement("div");
    track.className = "pcar-track";
    if (!frames.length) {
      const slide = document.createElement("div");
      slide.className = "pcar-slide";
      slide.innerHTML = icon;
      track.appendChild(slide);
    } else {
      frames.forEach((src, i) => {
        const slide = document.createElement("div");
        slide.className = "pcar-slide";
        const label = multi ? alt + " — " + (i + 1) + "/" + frames.length : alt;
        slide.innerHTML = icon +
          '<img class="pcar-img" src="' + src + '" alt="' + label + '" ' +
          (i === 0 ? 'loading="eager"' : 'loading="lazy"') +
          ' decoding="async" draggable="false" onerror="this.style.display=\'none\'" />';
        track.appendChild(slide);
      });
    }
    view.appendChild(track);
    (overlays || []).forEach((n) => n && view.appendChild(n));
    media.appendChild(view);

    if (!multi) return media; // static photo — no controls or interaction

    /* ---- multi-photo controls: arrows, dots, swipe, keyboard ---- */
    let index = 0;
    const dots = document.createElement("div");
    dots.className = "pcar-dots";
    const dotEls = frames.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "pcar-dot";
      d.setAttribute("aria-label", (lang === "en" ? "View photo " : "ดูรูปที่ ") + (i + 1));
      d.addEventListener("click", (e) => { e.stopPropagation(); go(i); });
      dots.appendChild(d);
      return d;
    });

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "pcar-arrow prev";
    prev.setAttribute("aria-label", lang === "en" ? "Previous photo" : "รูปก่อนหน้า");
    prev.innerHTML = carArrow("M15 5l-7 7 7 7");
    const next = document.createElement("button");
    next.type = "button";
    next.className = "pcar-arrow next";
    next.setAttribute("aria-label", lang === "en" ? "Next photo" : "รูปถัดไป");
    next.innerHTML = carArrow("M9 5l7 7-7 7");
    prev.addEventListener("click", (e) => { e.stopPropagation(); go(index - 1); });
    next.addEventListener("click", (e) => { e.stopPropagation(); go(index + 1); });

    function go(i) {
      index = Math.max(0, Math.min(frames.length - 1, i));
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dotEls.forEach((d, k) => d.classList.toggle("on", k === index));
      prev.disabled = index === 0;
      next.disabled = index === frames.length - 1;
    }

    view.setAttribute("role", "group");
    view.setAttribute("aria-roledescription", lang === "en" ? "carousel" : "แกลเลอรีรูป");
    view.tabIndex = 0;
    view.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    // Touch / pointer swipe — drag the track, then snap on release.
    let startX = 0, dragging = false, moved = 0;
    view.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pcar-arrow, .pcar-dot")) return; // let controls handle it
      dragging = true; startX = e.clientX; moved = 0;
      track.style.transition = "none";
      if (view.setPointerCapture) view.setPointerCapture(e.pointerId);
    });
    view.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = e.clientX - startX;
      const pct = view.clientWidth ? (moved / view.clientWidth) * 100 : 0;
      track.style.transform = "translateX(" + (-index * 100 + pct) + "%)";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      const threshold = view.clientWidth * 0.18;
      if (moved <= -threshold) go(index + 1);
      else if (moved >= threshold) go(index - 1);
      else go(index);
    }
    view.addEventListener("pointerup", endDrag);
    view.addEventListener("pointercancel", endDrag);
    view.addEventListener("pointerleave", endDrag);

    view.appendChild(prev);
    view.appendChild(next);
    view.appendChild(dots);
    go(0);
    return media;
  }

  /* ---------- DOM refs (resolved at init) ---------- */
  // `promptMenu` now points at #chatSuggest (the in-panel suggestion row).
  let chat, chatWrap, promptMenu, composer, queryInput, cartItems, cartCount;

  /* =================================================================
     STOREFRONT (SS26) — editorial grid + floating-chat controller
     -----------------------------------------------------------------
     The page is always browsable; chat is a layer on top. The default
     grid is the lifestyle/urban edit only (no camping gear / filters /
     drinkware) — the v2-directive escape-hatch fix. The full catalogue
     stays reachable via "Shop all" → "See everything".
     ================================================================= */
  // The storefront grid shows the full best-seller set — all eight — in the
  // site's "Most Selling" order (the order they appear in the catalog).
  function gridProducts() {
    return CATALOG.slice();
  }

  // Condensed editorial card for the storefront grid: photo (~70% of the card)
  // + name + two real CTAs. The card is a NON-interactive <article> so the
  // buttons inside are valid (no nested <button>). Three labeled controls:
  //   • name/photo  → openItem(p)      (size/stock truth lives there)
  //   • "Buy Now"   → buyNow(p)        (see rule below)
  //   • "Add to chat" → openChatWith(p)
  function renderGridCard(p, i) {
    const card = document.createElement("article");
    card.className = "grid-card";
    // Family badge: same .badge system as the rich card, scaled down. Every grid
    // item is a bestseller, so a "Bestseller" badge on all 8 would be noise —
    // only the scarce "New" flag shows here (badge-new = ink pill).
    const badge = p.isNew
      ? '<span class="badges"><span class="badge badge-new">' + (lang === "en" ? "New" : "ใหม่") + "</span></span>"
      : "";
    const label = BRAND_NAMES[p.brand] + " " + p.name; // for accessible names
    const esc = (s) => s.replace(/"/g, "&quot;");
    card.innerHTML =
      // Name button doubles as the "view details" control; the framed photo sits
      // inside it so a pointer click on the image opens the item view too. One
      // control, one accessible name, fully keyboard-reachable.
      '<button class="grid-open" type="button" aria-label="' +
        esc(lang === "en" ? label + " — view details" : "ดูรายละเอียด " + label) + '">' +
        // Inset, rounded photo viewport — the rich card's .pcar framing, condensed.
        '<span class="grid-media"><span class="grid-pcar">' + mediaArt(p, badge) + "</span></span>" +
        '<span class="grid-text">' +
          '<span class="grid-brand">' + BRAND_NAMES[p.brand] + "</span>" +
          '<span class="grid-name">' + p.name + "</span>" +
          // Price is the decision-driving token on a commerce card — present in
          // the rich card and browse grid, so the storefront card must show it too.
          '<span class="grid-price">' + money(p.price) + "</span>" +
        "</span>" +
      "</button>" +
      // Compare pin — a quiet toggle over the photo so a shopper can stage two
      // products to compare straight from the storefront, no chat required. It
      // sits outside the .grid-open button (no nested buttons) and reflects
      // staged state via .active / aria-pressed (see updateCmpButtons).
      '<button class="grid-cmp cmp-btn" type="button" data-id="' + p.id + '" aria-pressed="false" aria-label="' +
        esc(lang === "en" ? "Add " + label + " to compare" : "เพิ่ม " + label + " เข้าการเทียบ") + '">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M18 8H6m0 0 3.5-3.5M6 8l3.5 3.5"/><path d="M6 16h12m0 0-3.5-3.5M18 16l-3.5 3.5"/>' +
        "</svg>" +
      "</button>" +
      '<div class="grid-actions">' +
        '<button class="btn btn-add grid-buy" type="button" aria-label="' +
          esc(lang === "en" ? "Buy " + label + " now" : "ซื้อ " + label + " เลย") + '">' +
          T().buyNow + "</button>" +
        '<button class="btn btn-ghost grid-chat" type="button" aria-label="' +
          esc(lang === "en" ? "Ask the guide about " + label : "ถามไกด์เรื่อง " + label) + '">' +
          T().addToChat + "</button>" +
      "</div>";
    card.querySelector(".grid-open").addEventListener("click", () => openItem(p));
    card.querySelector(".grid-buy").addEventListener("click", () => buyNow(p));
    card.querySelector(".grid-chat").addEventListener("click", () => openChatWith(p));
    const pin = card.querySelector(".grid-cmp");
    pin.addEventListener("click", () => toggleCompare(p));
    if (compareTray.some((x) => x.id === p.id)) { pin.classList.add("active"); pin.setAttribute("aria-pressed", "true"); }
    return card;
  }

  // "Buy Now" honours Element 72's "confirm your size before you commit" promise:
  // one-size items (drinkware, bags) add straight to bag; multi-size items
  // (footwear, apparel) route to the item view's size/stock gate — never a
  // silent add of an unchosen or out-of-stock size.
  function isOneSize(p) {
    return p.sizes && p.sizes.length === 1 && p.sizes[0].label === "One Size";
  }
  function buyNow(p) {
    if (isOneSize(p)) addToCart(p, "One Size");
    else openItem(p);
  }
  function renderGrid() {
    const host = $("#storefrontGrid");
    if (!host) return;
    const items = gridProducts();
    host.innerHTML = "";
    items.forEach((p, i) => host.appendChild(renderGridCard(p, i)));
    const count = $("#gridCount");
    if (count) count.textContent = items.length + (lang === "en" ? " styles" : " รายการ");
  }

  // One-time "wake" of the storefront "Add to chat" buttons. When the product
  // grid first scrolls into view, each .grid-chat lights its conic ring, spins it
  // once with a glow pulse (CSS .wake), then fades back to the resting olive
  // outline — staggered down the grid so the eye is drawn along the chat path.
  // Pure flourish: skipped under prefers-reduced-motion; .wake self-removes on
  // animationend so the buttons return to their hover-driven olive state.
  function wakeChatButtons() {
    const grid = $("#storefrontGrid");
    if (!grid) return;
    grid.querySelectorAll(".grid-chat").forEach((b, i) => {
      b.style.setProperty("--i", i);
      b.classList.add("wake");
      b.addEventListener("animationend", () => {
        b.classList.remove("wake");
        b.style.removeProperty("--i");
      }, { once: true });
    });
  }

  function initChatButtonWake() {
    const grid = $("#storefrontGrid");
    if (!grid || !("IntersectionObserver" in window)) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { wakeChatButtons(); obs.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(grid);
  }

  // Two lifestyle-relevant starters surfaced on the collapsed bar (Phase 1:
  // both route to static, rule-based queries — never a generative path).
  const TOPIC_DEFS = [
    { en: "New in", th: "มาใหม่", q_en: "what's new", q_th: "มีอะไรใหม่" },
    { en: "Style me", th: "จัดลุค", q_en: "style me for the city", q_th: "จัดลุคสำหรับเที่ยวในเมือง" }
  ];
  function renderTopics() {
    const host = $("#chatBarTopics");
    if (!host) return;
    host.innerHTML = "";
    TOPIC_DEFS.forEach((t) => {
      const b = document.createElement("button");
      b.className = "topic-tag";
      b.type = "button";
      b.textContent = lang === "en" ? t.en : t.th;
      b.addEventListener("click", (e) => { e.stopPropagation(); handleQuery(lang === "en" ? t.q_en : t.q_th); });
      host.appendChild(b);
    });
  }

  /* ---------- floating bar ↔ expanded overlay ---------- */
  function isChatOpen() { return $("#chatOverlay").classList.contains("open"); }
  function openChat() {
    const ov = $("#chatOverlay");
    if (!ov.classList.contains("open")) {
      ov.classList.add("open");
      ov.setAttribute("aria-hidden", "false");
      $("#chatBar").classList.add("hidden");
      $("#chatBarOpen").setAttribute("aria-expanded", "true");
      renderCheckoutFab();   // hand off the FAB → the in-chat checkout bar
      renderCompareBar();    // tray hides behind the open panel
    }
    scrollBottom();
    setTimeout(() => queryInput && queryInput.focus(), 60);
  }
  function closeChat() {
    const ov = $("#chatOverlay");
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    $("#chatBar").classList.remove("hidden");
    $("#chatBarOpen").setAttribute("aria-expanded", "false");
    renderCheckoutFab();   // hand off the in-chat bar → the floating FAB
    renderCompareBar();    // tray reappears once the panel is gone
    if (queryInput) queryInput.blur();
  }
  // Grid / browse card → open chat and stream that product's functional card.
  function openChatWith(p) { openChat(); presentProduct(p); }

  /* =================================================================
     ITEM CARD VIEW — expanded product detail (chat stays dormant)
     -----------------------------------------------------------------
     A storefront / browse click expands the item HERE, as a full
     functional card, WITHOUT activating the chat. The "Add to chat"
     CTA (an animated gradient-ring button) is the single bridge into
     the conversational guide.
     ================================================================= */
  let itemProduct = null;
  function openItem(p) {
    itemProduct = p;
    renderItem(p);
    const ov = $("#itemOverlay");
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onItemKey);
  }
  function closeItem() {
    const ov = $("#itemOverlay");
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    itemProduct = null;
    document.removeEventListener("keydown", onItemKey);
    renderCompareBar();   // reveal the tray if items were pinned in this view
  }
  function onItemKey(e) { if (e.key === "Escape") closeItem(); }

  function renderItem(p) {
    const host = $("#itemBody");
    host.innerHTML = "";
    // Reuse the rich functional card (media, swatches, sizes, stock, add-to-bag).
    const card = renderCard(p);
    card.classList.add("in", "item-card");
    // Compare is now a webpage-level feature (pin here → page-level tray →
    // comparison overlay), so keep it in the item view. Complete-the-look still
    // streams into the conversation, so drop only that secondary action here.
    const sub = card.querySelector(".card-actions.sub");
    if (sub) {
      sub.querySelectorAll("button:not(.cmp-btn)").forEach((b) => b.remove());
      if (!sub.children.length) sub.remove();
    }

    // The bridge into chat: an animated gradient-ring CTA. Tapping it is the
    // first moment the conversation is activated (with this product in hand).
    const bridge = document.createElement("button");
    bridge.className = "add-to-chat";
    bridge.type = "button";
    bridge.innerHTML =
      '<span class="atc-ring" aria-hidden="true"></span>' +
      '<span class="atc-face">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-3.9-.9L3 21l1.9-5.1A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"/>' +
          '<path d="M16.5 7.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" fill="currentColor" stroke="none"/>' +
        "</svg>" +
        "<span>" + T().addToChat + "</span>" +
      "</span>";
    bridge.addEventListener("click", () => { closeItem(); openChatWith(p); });
    // One-time gradient-ring wake as the dialog opens — invites the chat path,
    // then settles to the olive outline. Skipped under prefers-reduced-motion.
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      bridge.classList.add("wake");
      bridge.addEventListener("animationend", () => bridge.classList.remove("wake"), { once: true });
    }

    const hint = document.createElement("p");
    hint.className = "atc-hint";
    hint.textContent = T().addToChatHint;

    const body = card.querySelector(".card-body");
    body.appendChild(bridge);
    body.appendChild(hint);
    host.appendChild(card);
  }
  // Point the shopper at the search bar (used by the compare "find one more" nudge).
  function focusSearch() {
    openChat();
    setTimeout(() => { if (queryInput) { queryInput.focus(); queryInput.select(); } }, 70);
  }

  /* =================================================================
     PARSER
     ================================================================= */
  function parseIntent(raw) {
    const s = raw.toLowerCase();
    const intent = { raw, lang, notCarried: null, brand: null, category: null, tags: [], maxPrice: null, color: null, size: null, wantNew: false, wantPopular: false };
    const tagSet = new Set();

    // not-carried brand → honest decline (takes precedence)
    for (const k in NOT_CARRIED) { if (hasWord(s, k)) { intent.notCarried = { key: k, name: NOT_CARRIED[k] }; break; } }

    // carried brand
    for (const b in BRAND_ALIASES) {
      if (BRAND_ALIASES[b].some((a) => hasWord(s, a))) { intent.brand = b; break; }
    }
    // category (first matching keyword wins; objects ordered most-specific first)
    outer: for (const cat in CATEGORY_KW) {
      for (const kw of CATEGORY_KW[cat]) { if (hasWord(s, kw)) { intent.category = cat; break outer; } }
    }
    // subtype tags
    for (const kw in SUBTYPE_KW) { if (hasWord(s, kw)) tagSet.add(SUBTYPE_KW[kw]); }
    // attribute tags
    for (const kw in ATTR_KW) { if (hasWord(s, kw)) tagSet.add(ATTR_KW[kw]); }
    intent.tags = [...tagSet];
    // colour
    for (const c in COLOR_KW) { if (COLOR_KW[c].some((a) => hasWord(s, a))) { intent.color = c; break; } }
    // price cap
    intent.maxPrice = parseMaxPrice(s);
    // size
    intent.size = parseSize(raw);
    // new / popular
    intent.wantNew = /\b(new|new arrivals?|latest|just in)\b/.test(s) || /(ใหม่|ล่าสุด)/.test(raw);
    intent.wantPopular = /\b(popular|best ?sellers?|trending|top picks?)\b/.test(s) || /(ขายดี|ยอดนิยม|นิยม)/.test(raw);
    // residual free-text keywords → search by tags / descriptions / categories
    intent.keywords = extractKeywords(raw);

    // Phase 2: compare / kit modes
    intent.mode = null;
    intent.occasion = null;
    intent.seed = null;
    const compareTrigger = /\b(compare|versus|vs\.?)\b/.test(s) || /(เทียบ|เปรียบเทียบ)/.test(raw);
    const styleTrigger = /\b(style me|outfit|complete the look|what goes with|goes with|pairs with|to pair|dress me|build a kit|kit for|gear for|what to wear)\b/.test(s) || /(จัดลุค|จัดเซ็ต|จัดชุด|แมตช์|ใส่กับ|เข้ากับ|จัดให้)/.test(raw);
    if (compareTrigger) {
      intent.mode = "compare";
      intent.compareRefs = resolveProducts(s);
    } else if (styleTrigger) {
      intent.mode = "kit";
      intent.seed = resolveProducts(s)[0] || null;
      for (const occ in OCCASION_KW) { if (OCCASION_KW[occ].some((k) => hasWord(s, k))) { intent.occasion = occ; break; } }
    }
    return intent;
  }

  // Resolve product references by distinctive name tokens (for "compare A and B").
  function resolveProducts(s) {
    const stop = ["the", "and", "two", "cord", "oz", "soft", "hard", "mid", "wp"];
    const found = [];
    CATALOG.forEach((p) => {
      const toks = p.name.toLowerCase().replace(/[()]/g, " ").split(/[\s/]+/).filter((w) => w.length > 2 && !stop.includes(w));
      if (toks.some((tk) => hasWord(s, tk))) found.push(p);
    });
    return found.slice(0, 3);
  }

  function parseMaxPrice(s) {
    const t = s.replace(/,/g, "");
    const m = t.match(/(?:under|below|less than|max|within|cheaper than|budget|<=|<|ไม่เกิน|ต่ำกว่า|ราคาไม่เกิน|งบ)\s*฿?\s*(\d+(?:\.\d+)?)\s*(k|พัน|บาท)?/i);
    if (!m) return null;
    let v = parseFloat(m[1]);
    const u = (m[2] || "").toLowerCase();
    if (u === "k" || u === "พัน") v *= 1000;
    return Math.round(v);
  }

  function parseSize(raw) {
    let m = raw.match(/(?:size|ไซส์|ไซซ์|เบอร์)\s*([0-9]{2}(?:\.5)?)/i);
    if (m) return { type: "shoe", label: m[1] };
    m = raw.match(/\b(3[89]|4[0-7])(?:\.5)?\b/);
    if (m) return { type: "shoe", label: m[1] };
    m = raw.match(/(?:size|ไซส์|ไซซ์)\s*(xs|s|m|l|xl|xxl)\b/i);
    if (m) return { type: "apparel", label: m[1].toUpperCase() };
    return null;
  }

  /* =================================================================
     SEARCH
     ================================================================= */
  function runSearch(intent) {
    let base = CATALOG;
    if (intent.wantNew) base = base.filter((p) => p.isNew);
    else if (intent.wantPopular) base = base.filter((p) => p.bestseller);

    const kws = intent.keywords || [];
    const hasStructured = !!(
      intent.brand || intent.category || intent.color || intent.tags.length ||
      intent.maxPrice || intent.size || intent.wantNew || intent.wantPopular
    );

    // Structured filter — the high-intent path (brand / category / tag / colour / price).
    let res = base.filter((p) => {
      if (intent.brand && p.brand !== intent.brand) return false;
      if (intent.category && p.category !== intent.category) return false;
      if (intent.color && !(p.colors || []).some((c) => c.key === intent.color)) return false;
      if (intent.tags.length && !intent.tags.every((t) => p.tags.includes(t))) return false;
      if (intent.maxPrice && p.price > intent.maxPrice) return false;
      return true;
    });

    // Free-text layer — match TAGS + DESCRIPTIONS + CATEGORIES for residual words.
    // Pure free-text query (no structured signal): keep only products whose search
    // index actually contains a query word — so "washable" / "commute" / "solar"
    // find a card, while gibberish still falls through to an honest no-match.
    // When structured filters DID match, residual keywords don't filter — they
    // re-rank (boost description/tag hits to the top) via the sort below.
    if (kws.length && !hasStructured) {
      res = base.map((p) => ({ p, sc: keywordScore(p, kws) })).filter((x) => x.sc > 0).map((x) => x.p);
    }

    const sizeLabel = intent.size ? intent.size.label.toLowerCase() : null;
    res = res.slice().sort((a, b) => {
      if (kws.length) {
        const ka = keywordScore(a, kws), kb = keywordScore(b, kws);
        if (ka !== kb) return kb - ka;
      }
      if (sizeLabel) {
        const as = a.sizes.some((s) => s.label.toLowerCase() === sizeLabel && s.stock > 0) ? 1 : 0;
        const bs = b.sizes.some((s) => s.label.toLowerCase() === sizeLabel && s.stock > 0) ? 1 : 0;
        if (as !== bs) return bs - as;
      }
      if (!!b.bestseller !== !!a.bestseller) return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      if (!!b.isNew !== !!a.isNew) return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return a.price - b.price;
    });
    return res;
  }

  function sizeRange(p) {
    const labs = p.sizes.map((s) => s.label);
    if (labs.length === 1) return labs[0] === "One Size" ? null : labs[0];
    return labs[0] + "–" + labs[labs.length - 1];
  }

  function getNoun(intent) {
    const map = lang === "en" ? NOUN_EN : NOUN_TH;
    for (const t of SUBTYPE_ORDER) { if (intent.tags.includes(t) && map[t]) return map[t]; }
    if (intent.category) return (lang === "en" ? CAT_EN : CAT_TH)[intent.category];
    return lang === "en" ? "products" : "รายการ";
  }

  /* =================================================================
     RESPONSE BUILDER
     ================================================================= */
  function buildResponse(intent) {
    // Phase 2: comparison
    if (intent.mode === "compare") {
      const prods = (intent.compareRefs || []).slice(0, 3);
      if (prods.length < 2) {
        // If one product was recognised, stage it and have the shopper search
        // for the second — so a half-formed "compare X" still moves forward.
        if (prods.length === 1 && !compareTray.some((x) => x.id === prods[0].id)) {
          if (compareTray.length < 3) compareTray.push(prods[0]);
          renderCompareBar();
        }
        return { text: T().compareHint, refine: [{ label: T().compareAddMore, action: focusSearch }, { label: T().browse, action: openBrowse }] };
      }
      return { type: "compare", text: T().compareLead(prods.length), products: prods };
    }

    // Phase 2: outfit / kit
    if (intent.mode === "kit") {
      if (intent.seed) {
        const items = buildKit(intent.seed);
        return { type: "kit", text: T().lookLead(intent.seed.name), kit: { title: T().lookTitle(BRAND_NAMES[intent.seed.brand], intent.seed.name), items, seed: intent.seed } };
      }
      const occ = intent.occasion || "city";
      const items = OCCASION_SETS[occ].map(byId).filter(Boolean);
      return { type: "kit", text: T().styleLead(T()["occ_" + occ]), kit: { title: T()["kit_" + occ], items, seed: null } };
    }

    // honest decline
    if (intent.notCarried) {
      const rk = NOT_CARRIED_REDIRECT[intent.notCarried.key];
      const rn = rk ? BRAND_NAMES[rk] : null;
      const refine = [];
      let text;
      if (lang === "en") {
        text = "We don’t carry " + intent.notCarried.name + " at Element 72.";
        text += rn ? " For that, our line-up leads with " + rn + " — want to see it?" : " Tell me a category — shoes, bottles, bags — and I’ll show what we do stock.";
      } else {
        text = "Element 72 ไม่มีแบรนด์ " + intent.notCarried.name + " ค่ะ";
        text += rn ? " แนะนำ " + rn + " ที่เรามีแทนไหมคะ" : " บอกหมวดสินค้าได้เลย — รองเท้า กระบอกน้ำ กระเป๋า — เดี๋ยวแสดงที่เรามีให้ค่ะ";
      }
      if (rn) refine.push({ label: (lang === "en" ? "Show " : "ดู ") + rn, q: rn });
      refine.push({ label: T().browse, action: openBrowse });
      return { text, refine };
    }

    const results = runSearch(intent);

    if (!results.length) {
      const refine = [];
      let text = lang === "en"
        ? "I couldn’t find a match for that — and I’d rather say so than guess."
        : "ไม่เจอสินค้าที่ตรงเลยค่ะ — ขอบอกตรง ๆ ดีกว่าเดานะคะ";
      if (intent.maxPrice) text += lang === "en" ? " The price cap might be a touch tight." : " งบที่ตั้งไว้อาจจะแน่นไปนิดค่ะ";
      if (intent.brand) refine.push({ label: T().seeAll + " " + BRAND_NAMES[intent.brand], q: BRAND_NAMES[intent.brand] });
      refine.push({ label: T().whatsNew, q: lang === "en" ? "what's new" : "มีอะไรใหม่" });
      refine.push({ label: T().browse, action: openBrowse });
      return { text, refine };
    }

    // lead-in
    const n = results.length;
    const brandName = intent.brand ? BRAND_NAMES[intent.brand] : "";
    let noun = getNoun(intent);
    const price = intent.maxPrice ? (lang === "en" ? " under " + money(intent.maxPrice) : " ราคาไม่เกิน " + money(intent.maxPrice)) : "";
    let text;
    if (intent.wantNew) {
      text = lang === "en" ? "Here’s what’s new" + (brandName ? " from " + brandName : "") + " — " + n + (n === 1 ? " piece." : " pieces.")
        : "สินค้าใหม่" + (brandName ? " จาก " + brandName : "") + " — " + n + " รายการค่ะ";
    } else if (intent.wantPopular) {
      text = lang === "en" ? "The bestsellers right now — " + n + (n === 1 ? " piece." : " pieces.")
        : "สินค้าขายดีตอนนี้ — " + n + " รายการค่ะ";
    } else {
      if (lang === "en" && n === 1 && noun !== "pants" && noun !== "drinkware") noun = noun.replace(/s$/, "");
      text = lang === "en"
        ? "Found " + n + " " + (brandName ? brandName + " " : "") + noun + price + "."
        : "เจอ " + (brandName ? brandName + " " : "") + noun + " " + n + " รายการ" + price + " ค่ะ";
    }

    // size note (honest)
    if (intent.size) {
      const label = intent.size.label;
      const have = results.filter((p) => p.sizes.some((s) => s.label.toLowerCase() === label.toLowerCase()));
      if (!have.length) {
        const r = sizeRange(results[0]);
        text += lang === "en"
          ? " Note: I don’t have size " + label + (r ? " (the range is " + r + ")" : "") + "."
          : " หมายเหตุ: ไม่มีไซส์ " + label + (r ? " (มีไซส์ " + r + ")" : "") + " ค่ะ";
      } else {
        const inStockN = have.filter((p) => p.sizes.some((s) => s.label.toLowerCase() === label.toLowerCase() && s.stock > 0)).length;
        if (inStockN > 0) text += lang === "en" ? " Size " + label + " is in stock — highlighted below." : " ไซส์ " + label + " มีของ ไฮไลต์ไว้ให้แล้วค่ะ";
        else text += lang === "en" ? " Heads up: " + label + " is sold out on these; in-stock sizes are highlighted." : " ไซส์ " + label + " หมดในรุ่นเหล่านี้ แสดงไซส์ที่มีไว้ให้ค่ะ";
      }
    }

    const refine = [];
    if (intent.brand) refine.push({ label: T().seeAll + " " + brandName, q: brandName });
    if (!intent.wantNew) refine.push({ label: T().whatsNew, q: lang === "en" ? "what's new" : "มีอะไรใหม่" });

    return { text, products: results, requestedSize: intent.size ? intent.size.label : null, refine, cap: 4 };
  }

  /* =================================================================
     RENDER — chat + streaming
     ================================================================= */
  function scrollBottom() { chatWrap.scrollTop = chatWrap.scrollHeight; }

  function pushUser(text) {
    const d = document.createElement("div");
    d.className = "msg msg-user";
    d.textContent = text;
    chat.appendChild(d);
    scrollBottom();
  }

  function botSkeleton() {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-bot";
    wrap.innerHTML = '<div class="bot-row"><div class="avatar">EL</div><div class="bot-body"></div></div>';
    return wrap;
  }

  // A non-streamed guide message (instant) with optional follow-up chips.
  // Used for lightweight nudges like the compare "search for one more" prompt.
  function pushBotNote(html, chips) {
    const wrap = botSkeleton();
    const body = wrap.querySelector(".bot-body");
    const t = document.createElement("div");
    t.className = "bot-text";
    t.innerHTML = html;
    body.appendChild(t);
    if (chips && chips.length) {
      const r = document.createElement("div");
      r.className = "refine";
      chips.forEach((ch) => r.appendChild(mkChip(ch.label, ch)));
      body.appendChild(r);
    }
    chat.appendChild(wrap);
    scrollBottom();
  }

  function typewriter(el, text) {
    return new Promise((res) => {
      let i = 0;
      const inc = text.length > 70 ? 2 : 1;
      const step = () => {
        i += inc;
        el.textContent = text.slice(0, i);
        scrollBottom();
        if (i < text.length) setTimeout(step, 12);
        else { el.textContent = text; res(); }
      };
      step();
    });
  }

  function mkChip(label, opt) {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => { if (opt.action) opt.action(); else if (opt.q) handleQuery(opt.q); });
    return b;
  }

  async function streamBot(resp) {
    const wrap = botSkeleton();
    chat.appendChild(wrap);
    const body = wrap.querySelector(".bot-body");
    const textEl = document.createElement("div");
    textEl.className = "bot-text";
    textEl.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    body.appendChild(textEl);
    scrollBottom();
    await sleep(420 + Math.floor(resp.text.length % 200));
    textEl.innerHTML = "";
    await typewriter(textEl, resp.text);

    if (resp.type === "compare") {
      const node = renderCompare(resp.products);
      node.classList.add("reveal");
      body.appendChild(node);
      await sleep(120);
      requestAnimationFrame(() => node.classList.add("in"));
      scrollBottom();
    } else if (resp.type === "kit") {
      const node = renderKit(resp.kit);
      node.classList.add("reveal");
      body.appendChild(node);
      await sleep(120);
      requestAnimationFrame(() => node.classList.add("in"));
      scrollBottom();
    } else if (resp.products && resp.products.length) {
      const cardsWrap = document.createElement("div");
      const shown = resp.products.slice(0, resp.cap || resp.products.length);
      cardsWrap.className = "cards" + (shown.length > 1 ? " multi" : "");
      body.appendChild(cardsWrap);
      for (let i = 0; i < shown.length; i++) {
        const c = renderCard(shown[i], resp.requestedSize);
        cardsWrap.appendChild(c);
        await sleep(130);
        requestAnimationFrame(() => c.classList.add("in"));
        scrollBottom();
      }
      const rest = resp.products.slice(shown.length);
      if (rest.length) {
        const row = document.createElement("div");
        row.className = "more-row";
        const pill = document.createElement("button");
        pill.className = "more-pill";
        pill.type = "button";
        pill.textContent = T().viewMore(rest.length);
        pill.addEventListener("click", async () => {
          row.remove();
          for (const p of rest) {
            const c = renderCard(p, resp.requestedSize);
            cardsWrap.appendChild(c);
            await sleep(90);
            requestAnimationFrame(() => c.classList.add("in"));
            scrollBottom();
          }
        });
        row.appendChild(pill);
        body.appendChild(row);
      }
    }

    if (resp.refine && resp.refine.length) {
      // Follow-ups live in ONE place: the persistent suggestion row pinned above
      // the composer (always reachable, even after the stream scrolls). Rendering
      // them inline here too duplicated the same chips a few pixels apart, which
      // read as clutter (frontend-design restraint; ui-ux-pro-max whitespace-balance).
      setSuggest(resp.refine);
    }
    scrollBottom();
  }

  function renderCard(p, requestedSize) {
    const card = document.createElement("div");
    card.className = "card";

    // Overlays layered on top of the photo (inside the 16px inset frame).
    const overlays = [];
    if (p.isNew || p.bestseller) {
      const badges = document.createElement("div");
      badges.className = "badges";
      if (p.isNew) badges.innerHTML += '<span class="badge badge-new">' + (lang === "en" ? "New" : "ใหม่") + "</span>";
      if (p.bestseller) badges.innerHTML += '<span class="badge badge-best">' + (lang === "en" ? "Bestseller" : "ขายดี") + "</span>";
      overlays.push(badges);
    }
    // Brand label lives in the card body (.card-brand eyebrow) — no wordmark
    // painted over the product photo. Real photography already carries the mark;
    // a second olive label on the image only obstructs it (text-over-photo).
    card.appendChild(buildCardMedia(p, overlays));

    const body = document.createElement("div");
    body.className = "card-body";
    const head = document.createElement("div");
    head.innerHTML =
      '<div class="card-brand">' + BRAND_NAMES[p.brand] + "</div>" +
      '<h3 class="card-name">' + p.name + "</h3>" +
      '<p class="card-blurb">' + blurbText(p) + "</p>";
    body.appendChild(head);

    const price = document.createElement("div");
    price.className = "card-price";
    price.textContent = money(p.price);
    body.appendChild(price);

    if (p.colors && p.colors.length) {
      const sw = document.createElement("div");
      sw.className = "swatches";
      p.colors.forEach((c) => {
        const d = document.createElement("span");
        d.className = "swatch";
        d.style.background = c.hex;
        d.title = c.key;
        sw.appendChild(d);
      });
      body.appendChild(sw);
    }

    const oneSize = p.sizes.length === 1 && p.sizes[0].label === "One Size";
    let selected = oneSize ? "One Size" : null;
    const stockLine = document.createElement("div");
    stockLine.className = "stock-line";
    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-add";
    addBtn.type = "button";
    addBtn.textContent = T().addToBag;

    function refreshStock() {
      if (!selected) { stockLine.className = "stock-line"; stockLine.textContent = T().selectSize; addBtn.disabled = true; return; }
      const s = p.sizes.find((x) => x.label === selected);
      if (!s || s.stock <= 0) { stockLine.className = "stock-line gone"; stockLine.textContent = T().soldOut; addBtn.disabled = true; }
      else if (s.stock <= 3) { stockLine.className = "stock-line low"; stockLine.textContent = T().lowStock(s.stock); addBtn.disabled = false; }
      else { stockLine.className = "stock-line ok"; stockLine.textContent = T().inStock; addBtn.disabled = false; }
    }

    if (!oneSize) {
      const sl = document.createElement("div");
      sl.className = "sizes-label";
      sl.textContent = T().size;
      body.appendChild(sl);
      const sizes = document.createElement("div");
      sizes.className = "sizes";
      p.sizes.forEach((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const out = s.stock <= 0;
        const low = s.stock > 0 && s.stock <= 3;
        btn.className = "size" + (out ? "" : low ? " low" : " ok");
        btn.disabled = out;
        btn.innerHTML = '<span class="lab">' + s.label + '</span><span class="stk">' + (out ? "—" : low ? s.stock : "✓") + "</span>";
        if (requestedSize && s.label.toLowerCase() === String(requestedSize).toLowerCase()) btn.classList.add("req");
        btn.addEventListener("click", () => {
          if (out) return;
          selected = s.label;
          sizes.querySelectorAll(".size").forEach((x) => x.classList.remove("selected"));
          btn.classList.add("selected");
          refreshStock();
        });
        sizes.appendChild(btn);
      });
      body.appendChild(sizes);
      if (requestedSize) {
        const target = p.sizes.find((s) => s.label.toLowerCase() === String(requestedSize).toLowerCase());
        if (target && target.stock > 0) {
          selected = target.label;
          [...sizes.children].forEach((b) => { if (b.querySelector(".lab").textContent === target.label) b.classList.add("selected"); });
        }
      }
    }

    body.appendChild(stockLine);
    refreshStock();

    const actions = document.createElement("div");
    actions.className = "card-actions";
    addBtn.addEventListener("click", () => {
      if (!selected) { toast(T().pickSize); return; }
      addToCart(p, selected);
    });
    actions.appendChild(addBtn);
    body.appendChild(actions);

    card.appendChild(body);

    // Phase 2: secondary actions — compare + complete the look
    const sub = document.createElement("div");
    sub.className = "card-actions sub";
    const cmp = mkGhost(T().compare, () => toggleCompare(p));
    cmp.classList.add("cmp-btn");
    cmp.dataset.id = p.id;
    if (compareTray.some((x) => x.id === p.id)) cmp.classList.add("active");
    sub.appendChild(cmp);
    if (["apparel", "footwear", "bag"].indexOf(p.category) > -1) {
      sub.appendChild(mkGhost("✦ " + T().completeLook, () => doLook(p)));
    }
    body.appendChild(sub);

    return card;
  }

  function mkGhost(label, fn) {
    const b = document.createElement("button");
    b.className = "btn btn-ghost csmall";
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }

  /* =================================================================
     PHASE 2 — comparison + outfit/kit
     ================================================================= */
  function useCase(p) {
    const order = ["hiking", "climbing", "camping", "travel", "urban", "summer", "down", "insulated", "waterproof"];
    const t = order.find((x) => p.tags.includes(x));
    return t ? USECASE[lang][t] : "—";
  }
  // Structured availability: a status key (drives both colour AND a text word,
  // so stock survives grayscale — WCAG 1.4.1) plus the human count.
  function availability(p) {
    if (p.sizes.length === 1) {
      const ok = p.sizes[0].stock > 0;
      return { key: ok ? "ok" : "gone", word: ok ? T().inStock : T().soldOut, detail: "" };
    }
    const avail = p.sizes.filter((s) => s.stock > 0).length;
    const detail = avail + "/" + p.sizes.length + (lang === "en" ? " sizes" : " ไซส์");
    if (avail === 0) return { key: "gone", word: T().soldOut, detail: "" };
    return { key: avail <= 1 ? "low" : "ok", word: avail <= 1 ? T().almostGone : T().inStock, detail };
  }
  function inStockSummary(p) {
    const a = availability(p);
    return a.detail ? a.word + " • " + a.detail : a.word;
  }

  // opts.onView overrides what the per-column "View & add" button does. The
  // chat-streamed comparison opens the product back in the conversation
  // (presentProduct); the page-level compare overlay routes it to the item
  // view instead, so the whole compare flow can happen with chat collapsed.
  function renderCompare(products, opts) {
    const onView = (opts && opts.onView) || presentProduct;
    const wrap = document.createElement("div");
    wrap.className = "compare";

    // Scrollable, keyboard-focusable, labelled region so a 3-up compare that
    // overflows is operable and announced — WCAG 2.1.1 / 4.1.2.
    const scroll = document.createElement("div");
    scroll.className = "compare-scroll";
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", T().compareCaption(products.length));
    scroll.setAttribute("tabindex", "0");

    const table = document.createElement("div");
    table.className = "compare-table";
    table.style.setProperty("--cols", products.length);

    const corner = document.createElement("div");
    corner.className = "ccell clabel chead-corner";
    corner.textContent = "";
    table.appendChild(corner);
    products.forEach((p) => {
      const cell = document.createElement("div");
      cell.className = "ccell cprod";
      cell.innerHTML =
        '<div class="cmedia" style="background:' + (GRAD[p.category] || GRAD.footwear) + '">' + mediaArt(p) + "</div>" +
        '<div class="cbrand">' + BRAND_NAMES[p.brand] + '</div><div class="cname">' + p.name + "</div>";
      const view = mkGhost(T().viewAdd, () => onView(p));
      view.classList.add("cview");
      cell.appendChild(view);
      table.appendChild(cell);
    });

    // The deciding value: the lowest price gets a quiet "best price" marker so
    // the comparison concludes something, not just lists facts.
    const prices = products.map((p) => p.price);
    const lowest = Math.min.apply(null, prices);
    const hasLowestTie = prices.filter((x) => x === lowest).length > 1;

    // Each row returns a {cls, html} per product so a row can carry its own
    // emphasis + status semantics (price hero, stock word+colour, waterproof
    // text label) rather than every cell being flat 13px/400.
    const rows = [
      {
        label: T().rowPrice, key: "price",
        cell: (p) => {
          const best = !hasLowestTie && p.price === lowest;
          return {
            cls: "cprice" + (best ? " cbest" : ""),
            html: '<span class="cval-num">' + money(p.price) + "</span>" +
                  (best ? '<span class="cbadge">' + T().bestPrice + "</span>" : "")
          };
        }
      },
      // Type value is Title-cased to match the other row values (Best for, etc.);
      // CAT_EN itself stays lowercase for mid-sentence chat copy ("Found 3 shoes").
      { label: T().rowType, cell: (p) => { const v = (lang === "en" ? CAT_EN : CAT_TH)[p.category]; return { cls: "ccap", html: v }; } },
      { label: T().rowBest, cell: (p) => ({ cls: "", html: useCase(p) }) },
      {
        label: T().rowWater, key: "water",
        cell: (p) => {
          const wp = p.tags.indexOf("waterproof") > -1;
          // Text label + glyph (not colour/symbol alone) — WCAG 1.4.1.
          return {
            cls: "cflag " + (wp ? "cflag-yes" : "cflag-no"),
            html: '<span class="cflag-mark" aria-hidden="true">' + (wp ? "✓" : "—") + "</span>" +
                  '<span class="cflag-word">' + (wp ? T().waterYes : T().waterNo) + "</span>"
          };
        }
      },
      {
        label: T().rowStock, key: "stock",
        cell: (p) => {
          const a = availability(p);
          return {
            cls: "cstock cstk-" + a.key,
            html: '<span class="cstk-dot" aria-hidden="true"></span>' +
                  '<span class="cstk-word">' + a.word + "</span>" +
                  (a.detail ? '<span class="cstk-detail">' + a.detail + "</span>" : "")
          };
        }
      },
      { label: T().rowColors, cell: (p) => ({ cls: "cnum", html: '<span class="cval-num">' + String((p.colors || []).length) + "</span>" }) }
    ];

    rows.forEach((r, i) => {
      const alt = i % 2 ? " alt" : "";
      const lab = document.createElement("div");
      lab.className = "ccell clabel" + alt;
      lab.textContent = r.label;
      table.appendChild(lab);
      products.forEach((p) => {
        const out = r.cell(p);
        const c = document.createElement("div");
        c.className = "ccell" + alt + (out.cls ? " " + out.cls : "");
        c.innerHTML = out.html;
        table.appendChild(c);
      });
    });

    scroll.appendChild(table);
    wrap.appendChild(scroll);
    // Edge-fade hint that there is more to scroll on narrow / 3-up compares.
    const hint = document.createElement("div");
    hint.className = "compare-hint";
    hint.setAttribute("aria-hidden", "true");
    wrap.appendChild(hint);
    requestAnimationFrame(() => updateCompareHint(scroll, hint));
    scroll.addEventListener("scroll", () => updateCompareHint(scroll, hint), { passive: true });
    return wrap;
  }
  // Toggle the right-edge fade: shown only while there is more table to the
  // right, hidden once scrolled to the end (or when nothing overflows).
  function updateCompareHint(scroll, hint) {
    const more = scroll.scrollWidth - scroll.clientWidth - scroll.scrollLeft > 4;
    hint.classList.toggle("show", more);
  }

  function buildKit(seed) {
    const used = { [seed.category]: true };
    const vibe = VIBE_TAGS.find((t) => seed.tags.indexOf(t) > -1);
    const items = [];
    COMPLEMENT_ORDER.forEach((cat) => {
      if (used[cat] || items.length >= 3) return;
      const cands = CATALOG.filter((p) => p.category === cat && p.id !== seed.id && hasStock(p));
      if (!cands.length) return;
      cands.sort((a, b) => score(b, vibe) - score(a, vibe));
      items.push(cands[0]);
      used[cat] = true;
    });
    return items;
    function score(p, v) { return (v && p.tags.indexOf(v) > -1 ? 2 : 0) + (p.bestseller ? 1 : 0); }
  }

  function renderKit(kit) {
    const wrap = document.createElement("div");
    wrap.className = "kit";
    const items = kit.seed ? [kit.seed].concat(kit.items) : kit.items;
    const head = document.createElement("div");
    head.className = "kit-head";
    head.innerHTML = '<span class="kit-title">' + kit.title + '<span class="ki-sub">' + items.length + (lang === "en" ? " pieces" : " ชิ้น") + "</span></span>";
    if (kit.seed && reasonText(kit.seed)) {
      const why = document.createElement("div");
      why.className = "kit-why";
      why.textContent = reasonText(kit.seed);
      head.appendChild(why);
    }
    wrap.appendChild(head);

    const row = document.createElement("div");
    row.className = "kit-items";
    items.forEach((p, idx) => {
      const it = document.createElement("div");
      it.className = "kit-item";
      if (reasonText(p)) it.title = reasonText(p);
      const pick = kit.seed && idx === 0 ? '<span class="kit-pick">' + T().yourPick + "</span>" : "";
      it.innerHTML =
        '<div class="ki-media" style="background:' + (GRAD[p.category] || GRAD.footwear) + '">' + mediaArt(p, pick) + "</div>" +
        '<div class="ki-brand">' + BRAND_NAMES[p.brand] + '</div><div class="ki-name">' + p.name + '</div><div class="ki-price">' + money(p.price) + "</div>";
      it.addEventListener("click", () => presentProduct(p));
      row.appendChild(it);
    });
    wrap.appendChild(row);

    const total = items.reduce((a, p) => a + p.price, 0);
    const foot = document.createElement("div");
    foot.className = "kit-foot";
    foot.innerHTML = '<span class="kit-total">' + T().kitTotal + ": <b>" + money(total) + "</b></span>";
    const add = document.createElement("button");
    add.className = "btn btn-add kit-addall";
    add.type = "button";
    add.textContent = T().addAll;
    add.addEventListener("click", () => addAll(items));
    foot.appendChild(add);
    wrap.appendChild(foot);
    return wrap;
  }

  async function doLook(p) {
    if (busy) return;
    busy = true;
    const items = buildKit(p);
    await streamBot({ type: "kit", text: T().lookLead(p.name), kit: { title: T().lookTitle(BRAND_NAMES[p.brand], p.name), items, seed: p } });
    busy = false;
  }
  /* ---------- compare overlay (page-level) ---------- */
  // The comparison opens on the webpage, not the chat stream, so a shopper can
  // browse → pin → compare without ever opening the guide.
  function openCompareModal() {
    if (compareTray.length < 2) return;
    const body = $("#compareBody");
    body.innerHTML = "";
    body.appendChild(renderCompare(compareTray.slice(), {
      onView: (p) => { closeCompareModal(); openItem(p); }
    }));
    $("#compareDTitle").textContent = T().compareLead(compareTray.length);
    const ov = $("#compareOverlay");
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onCompareKey);
  }
  function closeCompareModal() {
    const ov = $("#compareOverlay");
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onCompareKey);
  }
  function onCompareKey(e) { if (e.key === "Escape") closeCompareModal(); }
  function doCompare() { openCompareModal(); }

  /* ---------- compare tray ---------- */
  function toggleCompare(p) {
    const i = compareTray.findIndex((x) => x.id === p.id);
    let added = false;
    if (i > -1) compareTray.splice(i, 1);
    else if (compareTray.length >= 3) { toast(lang === "en" ? "Compare up to 3 at a time." : "เทียบได้สูงสุด 3 ชิ้นค่ะ"); return; }
    else { compareTray.push(p); added = true; }
    if (!compareTray.length) comparePromptShown = false; // fresh start → allow the nudge again
    renderCompareBar();
    // When the tray is on-screen (chat closed, no item dialog over it) its own
    // "1 of 2 • one more to go" copy is feedback enough. When it's covered —
    // staging from a chat card, or from the item-detail overlay — confirm the
    // add with a toast instead, so the action never feels like it did nothing.
    if (added && isCompareTrayHidden()) toast(T().compareStaged(compareTray.length));
    // In-chat the tray is hidden, so keep the conversation a live path to the
    // comparison: nudge toward a second product after the first, then offer to
    // open the side-by-side (the page overlay layers above the chat) once two
    // are staged — never a dead end.
    if (added && isChatOpen()) {
      if (compareTray.length === 1 && !comparePromptShown) {
        comparePromptShown = true;
        pushBotNote(T().comparePrompt, [{ label: T().compareAddMore, action: focusSearch }, { label: T().browse, action: openBrowse }]);
      } else if (compareTray.length >= 2) {
        pushBotNote(T().compareReadyNote(compareTray.length), [
          { label: T().compareCta + " (" + compareTray.length + ")", action: openCompareModal },
          { label: T().compareAddMore, action: focusSearch }
        ]);
      }
    }
  }
  // The tray is hidden whenever the chat overlay or the item-detail overlay
  // covers it — in those moments a stage needs toast confirmation instead.
  function isCompareTrayHidden() {
    return isChatOpen() || $("#itemOverlay").classList.contains("open");
  }
  function clearCompare() {
    compareTray.length = 0;
    comparePromptShown = false;
    renderCompareBar();
  }
  function updateCmpButtons() {
    document.querySelectorAll(".cmp-btn").forEach((b) => {
      const on = compareTray.some((p) => p.id === b.dataset.id);
      b.classList.toggle("active", on);
      if (b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function renderCompareBar() {
    const bar = document.querySelector("#compareBar");
    bar.innerHTML = "";
    // The tray is a page-level bar pinned above the chat bar. It's hidden while
    // the chat overlay is open (it would sit behind the panel) — staging from a
    // chat card toasts instead, and the tray reappears the moment chat closes.
    if (!compareTray.length || isChatOpen()) { bar.classList.remove("show"); updateCmpButtons(); return; }
    bar.classList.add("show");
    // A compact title + progress hint, so a single staged item reads as
    // "1 of 2 — one to go", not a lone chip beside a mystery button.
    const head = document.createElement("div");
    head.className = "cbar-head";
    const staging = compareTray.length < 2;
    head.innerHTML = '<span class="cbar-title">' + T().compare + '</span>' +
      '<span class="cbar-step' + (staging ? " staging" : "") + '">' + T().compareStep(compareTray.length) + '</span>';
    bar.appendChild(head);
    const list = document.createElement("div");
    list.className = "cbar-list";
    compareTray.forEach((p) => {
      const c = document.createElement("span");
      c.className = "cbar-chip";
      c.appendChild(document.createTextNode(BRAND_NAMES[p.brand] + " " + p.name + " "));
      const x = document.createElement("button");
      x.type = "button";
      x.className = "cbar-x";
      x.textContent = "✕";
      x.setAttribute("aria-label", T().compareRemove(BRAND_NAMES[p.brand] + " " + p.name));
      x.addEventListener("click", () => toggleCompare(p));
      c.appendChild(x);
      list.appendChild(c);
    });
    bar.appendChild(list);
    const actions = document.createElement("div");
    actions.className = "cbar-actions";
    if (compareTray.length < 2) {
      // Not enough to compare yet — prompt the search bar instead of a dead
      // disabled button, so the path forward is obvious.
      const add = document.createElement("button");
      add.className = "btn btn-ghost cbar-find";
      add.type = "button";
      add.textContent = "+ " + T().compareAddMore;
      add.addEventListener("click", focusSearch);
      actions.appendChild(add);
    } else {
      const go = document.createElement("button");
      go.className = "btn btn-add cbar-go";
      go.type = "button";
      go.textContent = T().compare + " (" + compareTray.length + ")";
      go.addEventListener("click", openCompareModal);
      actions.appendChild(go);
    }
    const clr = document.createElement("button");
    clr.className = "btn btn-ghost";
    clr.type = "button";
    clr.textContent = T().clearWord;
    clr.addEventListener("click", clearCompare);
    actions.appendChild(clr);
    bar.appendChild(actions);
    updateCmpButtons();
  }

  /* =================================================================
     CART
     ================================================================= */
  function pushCart(p, size) {
    const key = p.id + "|" + size;
    const ex = cart.find((c) => c.key === key);
    if (ex) ex.qty++;
    else cart.push({ key, id: p.id, brand: p.brand, name: p.name, size, price: p.price, category: p.category, qty: 1 });
  }

  function addToCart(p, size) {
    pushCart(p, size);
    updateCount(true);
    renderCart();
    bumpCheckoutFab();
    toast(T().added(p.name, size === "One Size" ? "" : size));
  }

  // Phase 2: AOV lever — add a whole kit at once, auto-picking first in-stock size.
  function addAll(items) {
    let n = 0, total = 0;
    items.forEach((p) => {
      const s = p.sizes.find((x) => x.stock > 0);
      if (s) { pushCart(p, s.label); n++; total += p.price; }
    });
    updateCount(true);
    renderCart();
    bumpCheckoutFab();
    toast(T().addedKit(n, money(total)));
  }

  function updateCount(bump) {
    const n = cart.reduce((a, c) => a + c.qty, 0);
    cartCount.textContent = n;
    cartCount.classList.toggle("show", n > 0);
    if (bump) { cartCount.classList.remove("show"); void cartCount.offsetWidth; cartCount.classList.add("show"); }
  }

  function renderCart() {
    cartItems.innerHTML = "";
    if (!cart.length) {
      const e = document.createElement("div");
      e.className = "cart-empty";
      e.textContent = T().cartEmpty;
      e.style.whiteSpace = "pre-line";
      cartItems.appendChild(e);
    } else {
      cart.forEach((c) => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div class="ci-thumb" style="background:' + (GRAD[c.category] || GRAD.footwear) + '">' + (ICONS[c.category] || ICONS.footwear) + "</div>" +
          '<div class="ci-info"><div class="ci-name">' + c.name + "</div>" +
          '<div class="ci-meta">' + BRAND_NAMES[c.brand] + (c.size !== "One Size" ? " • " + T().size + " " + c.size : "") + (c.qty > 1 ? " • ✕" + c.qty : "") + "</div></div>" +
          '<div class="ci-price">' + money(c.price * c.qty) + "</div>";
        const rm = document.createElement("button");
        rm.className = "ci-remove";
        rm.textContent = "✕";
        rm.title = "remove";
        rm.addEventListener("click", () => {
          const i = cart.indexOf(c);
          if (i > -1) cart.splice(i, 1);
          updateCount();
          renderCart();
        });
        row.querySelector(".ci-info").appendChild(rm);
        cartItems.appendChild(row);
      });
    }
    const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
    $("#cartSubtotal").textContent = money(sub);
    renderCheckoutFab();
  }

  // Persistent quick-checkout. Two presentations, one cart-driven state:
  //   #checkoutFab  — floats above the collapsed chat bar (storefront context)
  //   #chatCheckout — sits above the composer inside the open chat panel
  // (the FAB is behind the chat overlay there, so the conversation needs its own).
  // Exactly one shows at a time, decided by whether the chat is open. Called from
  // renderCart (add / remove / language) and from open/closeChat (context switch).
  const CHECKOUT_BARS = ["#checkoutFab", "#chatCheckout"];
  function renderCheckoutFab() {
    const n = cart.reduce((a, c) => a + c.qty, 0);
    const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
    const title = T().checkout, meta = T().itemsCount(n), total = money(sub);
    const aria = title + " — " + meta + " — " + total;
    CHECKOUT_BARS.forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      el.querySelector(".cf-title").textContent = title;
      el.querySelector(".cf-meta").textContent = meta;
      el.querySelector(".cf-total").textContent = total;
      el.setAttribute("aria-label", aria);
    });
    const has = n > 0, open = isChatOpen();
    showCheckoutBar("#checkoutFab", has && !open);
    showCheckoutBar("#chatCheckout", has && open);
  }
  function showCheckoutBar(sel, show) {
    const el = $(sel);
    if (!el) return;
    el.classList.toggle("show", show);
    el.setAttribute("aria-hidden", show ? "false" : "true");
    el.tabIndex = show ? 0 : -1;
  }

  // Replay the one-shot pop on whichever bar is currently visible.
  function bumpCheckoutFab() {
    CHECKOUT_BARS.forEach((sel) => {
      const el = $(sel);
      if (!el || !el.classList.contains("show")) return;
      el.classList.remove("bump");
      void el.offsetWidth;          // force reflow so the animation restarts
      el.classList.add("bump");
    });
  }

  function openCart() { $("#cartPanel").classList.add("open"); $("#overlay").classList.add("show"); }
  function closeCart() { $("#cartPanel").classList.remove("open"); $("#overlay").classList.remove("show"); }

  /* =================================================================
     BROWSE (passive-browser escape hatch)
     ================================================================= */
  // Browse = the full best-seller set (all eight). "See everything" keeps the
  // same set here in Phase 1 — the catalogue and the best-seller edit coincide.
  function renderBrowse(all) {
    const grid = $("#browseGrid");
    grid.innerHTML = "";
    const items = all ? CATALOG : gridProducts();
    $("#browseTitle").textContent = all
      ? T().everything
      : (lang === "en" ? "Best sellers" : "สินค้าขายดี");
    items.forEach((p) => {
      const c = document.createElement("div");
      c.className = "browse-card";
      c.innerHTML =
        '<div class="bc-media" style="background:' + (GRAD[p.category] || GRAD.footwear) + '">' + mediaArt(p) + "</div>" +
        '<div class="bc-body"><div class="bc-brand">' + BRAND_NAMES[p.brand] + '</div><div class="bc-name">' + p.name + '</div><div class="bc-price">' + money(p.price) + "</div></div>";
      c.addEventListener("click", () => { closeBrowse(); openItem(p); });
      grid.appendChild(c);
    });
    if (!all) {
      const more = document.createElement("button");
      more.className = "browse-seeall";
      more.type = "button";
      more.textContent = (lang === "en" ? "See everything (" : "ดูทั้งหมด (") + CATALOG.length + ")";
      more.addEventListener("click", () => renderBrowse(true));
      grid.appendChild(more);
    }
  }
  function openBrowse() {
    renderBrowse(false);
    $("#browseModal").classList.add("open");
  }
  function closeBrowse() { $("#browseModal").classList.remove("open"); }

  async function presentProduct(p) {
    if (busy) return;
    busy = true;
    await streamBot({ text: T().hereIs(BRAND_NAMES[p.brand] + " " + p.name), products: [p], requestedSize: null });
    busy = false;
    // A high-intent click lands on one item — once it's settled, gently pulse
    // the search bar so the user knows to keep going (the explore → buy bridge).
    await sleep(280);
    nudgeSearch();
  }

  // Brief attention pulse around the chat search bar, inviting another search
  // after the user has drilled into a single item. Self-clears; restartable on
  // every item click. The ring/edge motion lives in CSS (and is muted for
  // reduced-motion); the hint below is also spoken once via a polite live region
  // so the prompt isn't visual-only for screen-reader users.
  let nudgeT, nudgeLive;
  function nudgeLiveRegion() {
    if (nudgeLive) return nudgeLive;
    nudgeLive = document.createElement("div");
    nudgeLive.setAttribute("aria-live", "polite");
    nudgeLive.setAttribute("aria-atomic", "true");
    // Visually hidden, but available to assistive tech. Does not take focus.
    nudgeLive.style.cssText =
      "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;" +
      "overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;";
    document.body.appendChild(nudgeLive);
    return nudgeLive;
  }
  function nudgeSearch() {
    if (!composer || !queryInput || !isChatOpen()) return;
    composer.classList.remove("nudge");
    void composer.offsetWidth;            // reflow → the keyframes restart cleanly
    composer.classList.add("nudge");
    if (!queryInput.value) {
      queryInput.placeholder = T().nudgeHint;
      // Re-set text so repeat clicks re-announce; clear first for reliability.
      const live = nudgeLiveRegion();
      live.textContent = "";
      requestAnimationFrame(() => { live.textContent = T().nudgeHint; });
    }
    clearTimeout(nudgeT);
    nudgeT = setTimeout(endNudge, 3000);
  }
  function endNudge() {
    if (!composer) return;
    clearTimeout(nudgeT);
    composer.classList.remove("nudge");
    if (queryInput) queryInput.placeholder = T().placeholder;
    if (nudgeLive) nudgeLive.textContent = "";
  }

  /* =================================================================
     TOAST
     ================================================================= */
  let toastT;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* =================================================================
     FLOW
     ================================================================= */
  async function handleQuery(raw) {
    const q = (raw || "").trim();
    if (!q || busy) return;
    if (!isChatOpen()) openChat();   // any entry path (topic tag, chip, nav, grid) reveals the thread
    busy = true;
    // Bilingual: a Thai-script query gets a Thai answer (H6). Latin queries
    // (e.g. "KEEN 42") don't flip the language, so Thai users typing brand
    // names stay in Thai.
    if (/[฀-๿]/.test(q) && lang !== "th") setLang("th");
    pushUser(q);
    queryInput.value = "";
    const intent = parseIntent(q);
    const resp = buildResponse(intent);
    await streamBot(resp);
    busy = false;
  }

  /* =================================================================
     STATIC STRINGS + PROMPT MENU
     ================================================================= */
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    [...$("#langToggle").children].forEach((x) => x.classList.toggle("active", x.dataset.lang === l));
    applyStatic();
    renderGrid();
    renderTopics();
    renderSuggest();
    renderCart();
    renderCompareBar();
    // Re-render the item view in the new language if it's open.
    if ($("#itemOverlay").classList.contains("open") && itemProduct) renderItem(itemProduct);
    // Likewise the compare overlay, if the shopper switched language mid-compare.
    if ($("#compareOverlay").classList.contains("open")) openCompareModal();
  }

  function applyStatic() {
    queryInput.placeholder = T().placeholder;
    $("#chatBarText").textContent = T().barText;
    $("#browseBtn").textContent = T().browse;
    $("#humanBtn").textContent = T().human;
    $("#cartTitle").textContent = T().bag;
    $("#cartSubLabel").textContent = T().subtotal;
    $("#cartNote").textContent = T().cartNote;
    $("#checkoutBtn").textContent = T().checkout;
    $("#browseTitle").textContent = T().everything;
    $("#partnersEyebrow").textContent = T().partnersEyebrow;
    $("#partnersNote").textContent = T().partnersNote;
  }

  // The persistent suggestion row (#chatSuggest). Defaults to starter prompts;
  // streamBot swaps in the latest turn's follow-ups so chips stay contextual.
  function setSuggest(items) {
    promptMenu.innerHTML = "";
    items.forEach((opt) => promptMenu.appendChild(mkChip(opt.label, opt)));
  }
  function renderSuggest() {
    setSuggest(T().prompts.map((p) => ({ label: p.label, q: p.q })));
  }

  function renderWelcome() {
    const wrap = botSkeleton();
    const body = wrap.querySelector(".bot-body");
    const t = document.createElement("div");
    t.className = "bot-text";
    t.textContent = T().welcome;
    body.appendChild(t);
    chat.appendChild(wrap);
    scrollBottom();
  }

  /* =================================================================
     INIT
     ================================================================= */
  /* =================================================================
     MARKETING GALLERY (top-section carousel)
     Scroll-snap track for native swipe; JS layers dots, arrows, and a
     gentle autoplay. Each slide seeds a chat query — the gallery is an
     entry point into the chat-first flow, not just decoration.
     ================================================================= */
  function initGallery() {
    const track = $("#galleryTrack");
    if (!track) return;
    const slides = [...track.querySelectorAll(".gallery-slide")];
    const dotsWrap = $("#galleryDots");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0, timer = null;

    // dots
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => { go(i); rest(); });
      dotsWrap.appendChild(d);
    });
    const dots = [...dotsWrap.children];

    function setActive(i) {
      index = i;
      dots.forEach((d, j) => {
        const on = j === i;
        d.classList.toggle("active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    function go(i) {
      const n = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[n].offsetLeft, behavior: reduce ? "auto" : "smooth" });
      setActive(n);
    }

    // keep dots in sync with manual swipe / momentum scroll
    let raf = 0;
    track.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== index) setActive(Math.max(0, Math.min(slides.length - 1, i)));
      });
    }, { passive: true });

    // arrows
    $("#galleryPrev").addEventListener("click", () => { go(index - 1); rest(); });
    $("#galleryNext").addEventListener("click", () => { go(index + 1); rest(); });

    // each slide opens the guide pre-loaded with a relevant query
    slides.forEach((s) => {
      if (s.dataset.q) s.addEventListener("click", () => handleQuery(s.dataset.q));
    });

    // autoplay — paused on hover, focus, touch, or when the tab is hidden
    function play() {
      if (reduce || timer) return;
      timer = setInterval(() => { if (!document.hidden) go(index + 1); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function rest() { stop(); play(); }   // restart the clock after manual nav

    const gallery = $("#gallery");
    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach((ev) =>
      gallery.addEventListener(ev, stop, { passive: true }));
    ["mouseleave", "focusout"].forEach((ev) =>
      gallery.addEventListener(ev, play));
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : play(); });

    setActive(0);
    play();
  }

  function init() {
    chat = $("#chat"); chatWrap = $("#chatWrap"); promptMenu = $("#chatSuggest");
    composer = $("#composer"); queryInput = $("#queryInput"); cartItems = $("#cartItems"); cartCount = $("#cartCount");

    applyStatic();
    renderGrid();        // storefront (lifestyle edit)
    initChatButtonWake(); // one-shot ring-wake when the grid scrolls into view
    renderTopics();      // collapsed-bar topic tags
    renderSuggest();     // in-panel starter chips
    renderWelcome();     // mounts into #chat (hidden until the overlay opens)
    renderCart();

    composer.addEventListener("submit", (e) => { e.preventDefault(); handleQuery(queryInput.value); });
    // Once the user engages the bar (re-focus or first keystroke), they've taken
    // the hint — stop the pulse. Typing is the reliable signal since the chat
    // auto-focuses the input on open, so a later focus event may never fire.
    const cancelNudge = () => { if (composer.classList.contains("nudge")) endNudge(); };
    queryInput.addEventListener("focus", cancelNudge);
    queryInput.addEventListener("input", cancelNudge);

    // Floating bar ↔ expanded overlay (URL never changes — pure class toggle)
    $("#chatBarOpen").addEventListener("click", openChat);
    $("#chatBarSend").addEventListener("click", openChat);
    $("#chatClose").addEventListener("click", closeChat);
    $("#chatBackdrop").addEventListener("click", closeChat);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isChatOpen()) closeChat(); });

    // Nav links route into chat (chat is the primary navigation surface)
    document.querySelectorAll(".nav-link").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.hasAttribute("data-browse")) openBrowse();
        else if (b.dataset.q) handleQuery(b.dataset.q);
      });
    });

    initGallery();   // marketing carousel in the top section

    $("#langToggle").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (b) setLang(b.dataset.lang);
    });

    $("#cartBtn").addEventListener("click", openCart);
    $("#checkoutFab").addEventListener("click", openCart);
    $("#chatCheckout").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    $("#checkoutBtn").addEventListener("click", () => toast(T().checkoutToast));
    $("#browseBtn").addEventListener("click", openBrowse);
    $("#browseClose").addEventListener("click", closeBrowse);
    $("#humanBtn").addEventListener("click", () => toast(T().humanToast));

    // Item card view (expanded product detail; chat stays dormant until "Add to chat")
    $("#itemClose").addEventListener("click", closeItem);
    $("#itemBackdrop").addEventListener("click", closeItem);

    // Page-level compare overlay
    $("#compareClose").addEventListener("click", closeCompareModal);
    $("#compareBackdrop").addEventListener("click", closeCompareModal);

    // mobile keyboard awareness
    if (window.visualViewport) {
      const onVV = () => {
        const inset = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
        document.documentElement.style.setProperty("--kb", inset + "px");
        scrollBottom();
      };
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
