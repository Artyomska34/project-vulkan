import { Scene, Item, PlayerState, Enemy, CodexEntry, Bankai } from './types';

// --- Lore Tooltip Dictionary ---
// This maps keywords found in text to short descriptions
export const LORE_TOOLTIPS: Record<string, string> = {
  "Ornstein": "Ejderha Katili. Lord Gwyn'in Dört Şövalyesi'nin lideri. Mızrağı yıldırım taşır.",
  "Smough": "Cellat Smough. Yamyamlığı yüzünden şövalye unvanı reddedildi. Devasa çekiciyle kemikleri ezer.",
  "Four Kings": "New Londo'nun düşmüş kralları. Abyss tarafından yozlaştırıldılar ve sonsuz karanlığa gömüldüler.",
  "Nito": "Mezarların Efendisi. İlk Ölü. Ölümün ta kendisini yönetir.",
  "Seath": "Palsız Ejderha. Kendi türüne ihanet etti. Ölümsüzlüğü ararken deliliğin kristallerine hapsoldu.",
  "Gwyn": "Güneşin Lordu. İlk Ateşi yakan kişi. Şimdi sadece külden ibaret bir kabuk.",
  "Kiln": "İlk Ateşin Fırını. Dünyanın kaderinin belirlendiği, zamanın büküldüğü son nokta.",
  "Bonfire": "Undead'lerin dinlenme noktası. Bir umut kıvılcımı.",
  "Pinwheel": "Yeraltı Mezarları'nın büyücüsü. Ailesini diriltmeye çalışırken başarısız oldu ve çoklu bir varlığa dönüştü.",
  "Sekiro": "Tek Kollu Kurt. Doğu'nun gizemli savaşçısı. Ölümsüzlüğü kesebilen kılıcı arıyor.",
  "Abyss": "Hiçlik. İnsanlığı yutan sonsuz karanlık."
};

// --- Bankai Generator Logic ---
const BANKAI_PREFIXES = ["Kızıl", "Kara", "Semavi", "Cehennem", "Ruh", "Yıldırım", "Sonsuz", "Hiçlik", "Kanlı", "Antik"];
const BANKAI_NOUNS = ["Ejderha", "Ay", "Kılıç", "Lotus", "İblis", "Fırtına", "Gölge", "Kral", "Yılan", "Anka"];
const BANKAI_SUFFIXES = ["Kesici", "Yutan", "Dansı", "Öfkesi", "Hükümdarı", "Dişi", "Alevi", "Çığlığı", "Mührü", "Ağıtı"];
const COMMANDS = ["Uyan", "Parçala", "Kükre", "Yok Et", "Yüksel", "Karar", "Aydınlat", "Yut", "Dans Et", "Hükmet"];

function generateRandomBankai(): Bankai {
  const prefix = BANKAI_PREFIXES[Math.floor(Math.random() * BANKAI_PREFIXES.length)];
  const noun = BANKAI_NOUNS[Math.floor(Math.random() * BANKAI_NOUNS.length)];
  const suffix = BANKAI_SUFFIXES[Math.floor(Math.random() * BANKAI_SUFFIXES.length)];
  const command = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
  
  const name = `${prefix} ${noun} ${suffix}`;
  const isInstant = Math.random() > 0.5;
  
  const colors = ["#ef4444", "#a855f7", "#3b82f6", "#eab308", "#22c55e", "#ec4899"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  if (isInstant) {
    return {
      name,
      releaseCommand: command,
      description: "Ruh enerjisini tek bir yıkıcı darbeye dönüştürür. Devasa hasar verir.",
      type: 'INSTANT',
      visualColor: color,
      damageMultiplier: 5 // Deals 5x normal heavy damage + base
    };
  } else {
    return {
      name,
      releaseCommand: command,
      description: "Savaşçının potansiyelini kırar. Savaş boyunca hasar ve savunma artar.",
      type: 'BUFF',
      visualColor: color,
      buffStats: {
        strength: 20,
        endurance: 20
      }
    };
  }
}

// --- Items ---
export const BROKEN_SWORD: Item = {
  id: 'broken_sword',
  name: 'Kırık Kabzalı Kılıç',
  description: 'Eski bir savaşın hüzünlü hatırası. Paslanmış, kör ve neredeyse işe yaramaz.',
  type: 'WEAPON',
  weaponStats: {
    damage: 10,
    scaling: 'STR',
    parryBonus: 0,
    description: "Düşük Hasar, Standart Peri"
  }
};

export const PARRY_DAGGER: Item = {
  id: 'parry_dagger',
  name: 'Haydut Hançeri',
  description: 'Gölge savaşçıları için dövülmüş. Düşmanın saldırısını savuşturmak için ideal.',
  type: 'WEAPON',
  weaponStats: {
    damage: 8,
    scaling: 'DEX',
    parryBonus: 0.25, // %25 extra chance
    description: "Çok Düşük Hasar, YÜKSEK Peri Şansı"
  }
};

export const OP_SWORD: Item = {
  id: 'op_sword',
  name: "DÜNYANIN EN OP KILIÇ & KALKANI",
  description: "Fizik kurallarını büken bir güç. Varlığı bile gerçekliği titretiyor.",
  type: 'WEAPON',
  weaponStats: {
    damage: 999,
    scaling: 'NONE',
    parryBonus: 0.5,
    description: "TANRISAL GÜÇ"
  }
};

export const INITIAL_PLAYER: PlayerState = {
  hp: 100,
  maxHp: 100,
  stamina: 100,
  maxStamina: 100,
  estus: 5,
  name: "Chosen Undead",
  inventory: [
    BROKEN_SWORD,
    PARRY_DAGGER, // Give them a parry option initially to test
    { id: 'humanity', name: 'İnsanlık', description: 'Karanlık bir ruh parçası. İnsaniyetini geri kazandırır.', type: 'CONSUMABLE' }
  ],
  equippedWeapon: BROKEN_SWORD.name,
  unlockedCodexEntries: [],
  codexImages: {},
  stats: {
    vitality: 10,
    endurance: 10,
    strength: 10,
    dexterity: 10
  },
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  attributePoints: 0,
  // Initial Limit Stats
  limitGauge: 0,
  maxLimitGauge: 100,
  bankai: generateRandomBankai()
};

// Helper to map Speaker Names to Codex IDs for tooltips
export const SPEAKER_CODEX_MAP: Record<string, string> = {
  "Otuzbir Mehmet Çelebi": "celebi",
  "Mehmet Çelebi": "celebi",
  "Onur the Obur": "onur"
};

// --- Codex Entries ---
export const CODEX_ENTRIES: Record<string, CodexEntry> = {
  'celebi': {
    id: 'celebi',
    title: 'Otuzbir Mehmet Çelebi',
    category: 'PERSON',
    content: [
      "Mehmet Çelebi, fiziksel gücün zihinsel güçten geldiğine inanan bir savaşçıydı.",
      "Ancak 'sağlam kafa' metaforunu fazla ciddiye aldı. Zihinsel kapasitesini artırmak için kafatasını fiziksel olarak genişletmeye çalıştı.",
      "Sonuç: Çatlamış bir kafatası, dışarı taşan beyin dokusu ve ebedi bir baş ağrısı.",
      "Lord Gwyn'in ordusuna katılmak istediğinde, 'Senin kafan kırık, miğfer takamazsın' denilerek reddedildi.",
      "O günden beri, kendisine 'Kırık Kafatasının Efendisi' diyerek Kiln çevresinde dolaşır."
    ],
    image: "https://images.unsplash.com/photo-1610427320092-a9b0c6f66290?q=80&w=400&auto=format&fit=crop"
  },
  'onur': {
    id: 'onur',
    title: 'Undead Onur the Obur',
    category: 'PERSON',
    content: [
      "Altın zırhı, ihtişamından değil, sadece vücudunu sığdırabilmek için genişletilmişti.",
      "Pinwheel'den yüzlerce kez dayak yedikten sonra deliliğin sınırına gelmiştir.",
      "Sürekli olarak yemek yemek ve 'Pinwheel çok güçlü' demekten başka bir şey yapmaz."
    ]
  }
};

// --- Enemies ---
export const ENEMY_CELEBI: Enemy = {
  id: 'celebi',
  name: "Otuzbir Mehmet Çelebi",
  hp: 200,
  maxHp: 200,
  damage: 25,
  description: "Kırık Kafatasının Efendisi. Zihni o kadar zorlandı ki, kafatası çatladı.",
  image: "https://images.unsplash.com/photo-1541362071060-1e87b487bc2a?q=80&w=400&auto=format&fit=crop", // Dark skull vibe
  stamina: 100,
  maxStamina: 100,
  xpReward: 500
};

// --- Scenes (Updated Text) ---
export const SCENES: Record<string, Scene> = {
  'start': {
    id: 'start',
    text: [
      "Karanlık gökyüzü, külle kaplanmış toprakların üstüne kurşun gibi ağır bir örtü gibi serilmişti.",
      "Kiln of the First Flame'e çıkan taş patika, sayısız çağın ve yanmış krallıkların külleriyle kaplıydı. Her adımında, tarihin tozları botlarının altında eziliyor, havaya gri bir ölüm bulutu kaldırıyordu.",
      "Zırhın ağır gelmeye başlamıştı. Metalin soğukluğu tenine işliyor, her hareketinde paslı bir inleyişle sessizliği bozuyordu.",
      "Ornstein, Smough, Four Kings, Nito, Seath… Hepsini katletmiştin. Ama bu 'zaferlerin' ardında, yalnızca küf kokan, anlamsız bir boşluk kalmıştı. Ruhun yorgundu.",
      "Aniden, kül fırtınasının gri perdesi aralandı. İleride bir siluet belirdi. Uzun, yamalı bir pelerin, üzerine bol gelen hafif bir zırh ve belinde paslı bir kılıç taşıyan biri."
    ],
    choices: [
      { text: "Siluet dikkatini çekti. Kalkanını kaldır ve temkinli yaklaş.", nextSceneId: 'meet_vulkan' }
    ]
  },
  'meet_vulkan': {
    id: 'meet_vulkan',
    speaker: "???",
    text: [
      "Yabancı, seni fark edince duraksamadı bile. Aksine, sanki eski bir dostunu görmüşçesine ellerini iki yana açtı.",
      "\"Hey dostum! Sen de mi buraya geldin? Ha ha! Ne garip bir rastlantı, değil mi?\"",
      "Adamın gözlerinde, bu kasvetli dünyanın kaldıramayacağı kadar abartılı bir heyecan, neredeyse deliliğin sınırında bir heves parlıyordu."
    ],
    choices: [
      { text: "\"Sen de kimsin?\" (Sorgula)", nextSceneId: 'vulkan_intro' },
      { text: "Cevap verme. Sadece yoluna bak. (Souls Stoicism)", nextSceneId: 'vulkan_dismiss' }
    ]
  },
  'vulkan_intro': {
    id: 'vulkan_intro',
    speaker: "Vulkan",
    text: [
      "\"Ben mi? Ben Vulkan! Chosen Undead, tıpkı senin gibi! Demek ki biz kaderdaşız, ha?\"",
      "Vulkan gururla göğsünü kabarttı, paslı zırhı gıcırdadı. \"Lord Gwyn'in huzuruna çıkacağız, değil mi? Heyecan verici olmalı!\"",
      "Senin sessizliğin ve soğuk bakışların karşısında sırıttı, ama gözlerindeki o tekinsiz parıltı sönmedi. \"Büyük bir şeyin parçası olduğumu biliyorum! Hissediyorum!\""
    ],
    choices: [
      { text: "Bu deliyi arkanda bırak ve ilerle.", nextSceneId: 'celebi_appears' }
    ]
  },
  'vulkan_dismiss': {
    id: 'vulkan_dismiss',
    speaker: "Vulkan",
    text: [
      "Sessizliğin, rüzgarın uğultusuyla karıştı. Vulkan, reddedilmeyi umursamaz bir tavırla karşıladı.",
      "\"Ooo, sert kayaya çarptım sanırım. Biraz gerginsin, ha?\"",
      "Kendi kendine gülerek peşine takıldı. \"Neyse, boş ver! Zaten bu kadar yolu yalnız yürümek sıkıcı olurdu. Kader bizi birleştirdi, dostum!\""
    ],
    choices: [
      { text: "Varlığını kabullen ve yürü.", nextSceneId: 'celebi_appears' }
    ]
  },
  'celebi_appears': {
    id: 'celebi_appears',
    text: [
      "Alevlerin ışığı, Kiln’in taş yollarında titriyordu. Chosen Undead, adımlarını dikkatlice attı. Zırhının metal sesi boğuk bir yankı olarak boşluğa karıştı.",
      "Vulkan, her zamanki gibi neşeliydi ama içinde bir huzursuzluk vardı.",
      "\"Hey dostum, burası her yerden daha... nasıl desem... ölüm kokuyor?\"",
      "\"Evet.\" diyebildin sadece.",
      "Vulkan içini çekti. \"Seninle konuşmak ne kadar eğlenceli, anlatamam.\"",
      "Ama tam o anda, önlerinde biri belirdi.",
      "Taştan bir sütunun önünde, zırhı çatlamış, miğferinin yarısı kırılmış bir adam duruyordu. Omuzları geniş, kasları hâlâ güçlüydü, ama gözleri... içlerinde yalnızca boşluk vardı. Kocaman bir savaş baltasını yere dayamıştı.",
      "Adamın sesi, boğuk ve metalikti.",
      "\"Sağlam vücut, sağlam kafada olur.\""
    ],
    choices: [
      { text: "Silahını hazırla.", nextSceneId: 'celebi_intro' }
    ]
  },
  'celebi_intro': {
    id: 'celebi_intro',
    speaker: "Otuzbir Mehmet Çelebi",
    text: [
      "Vulkan, kaşlarını çattı. \"Ne…?\"",
      "Adam, yavaşça başını kaldırdı. Miğferinin kırık tarafı, altındaki ezilmiş kafatasını ortaya çıkarıyordu. Beyninin bir kısmı dışarı çıkmış, etrafında kurumuş kan izleri vardı. Ama buna rağmen dimdik duruyordu.",
      "\"Ben… Otuzbir Mehmet Çelebi’yim. Kırık Kafatasının Efendisi.\"",
      "Vulkan, şaşkınlık içinde sana döndü. \"Bu ismi uydurdu, değil mi?\"",
      "\"Hayır.\" dedin soğukça.",
      "Çelebi, baltasını kaldırdı. \"Beni dinleyin, kaybolmuş ruhlar. Bir zamanlar ben de sizin gibiydim. Kaslarım çelik gibiydi, zihnim bir kılıç kadar keskindi. Ama sonra… döngü beni tüketti.\"",
      "Baltasını yere vurdu, taşlar çatladı. \"Daha güçlü olmalıyım dedim. Daha sağlam. Ama fark etmedim ki… vücudum güçlenirken, kafam kırılıyordu.\"",
      "Zihnindeki çürüme, konuşmasına bile yansıyordu. \"Ve şimdi… siz de burada, benimle aynı yolu yürüyorsunuz. Bunu durduramam. Ama… sizi test edebilirim!\"",
      "Baltasını havaya kaldırdı. \"Bana karşı koyamayan, Gwyn’e karşı koyamaz!\""
    ],
    combatEncounter: ENEMY_CELEBI,
    choices: [
      { text: "SAVAŞ!", nextSceneId: 'celebi_defeat' } // This link is triggered AFTER combat win
    ]
  },
  'celebi_defeat': {
    id: 'celebi_defeat',
    text: [
      "Çelebi'nin baltası, havayı parçalayan bir gök gürültüsü gibi savrulmuştu ama sen boşlukları gördün. Darbelerin onun kırık iradesini aştı.",
      "Tam son darbeyi indirecekken Vulkan araya girdi: \"Yeter! Dostum, dur!\"",
      "Mehmet Çelebi titredi, baltası elinden kaydı. \"Çünkü... yanlış yerde kafa patlattım. Bir boğa vardı... Düşündüm. O kadar çok düşündüm ki... kafam çatladı.\"",
      "Çelebi son bir çığlık attı, sesi bir ağıt gibi yankılandı: \"SAĞLAM VÜCUT, SAĞLAM KAFADA OLUR!\"",
      "Ve devasa bedeni, bir anlık parlamayla küle dönüştü. Geriye sadece rüzgarın savurduğu tozlar kaldı."
    ],
    choices: [
      { 
        text: "Küllere saygı duy ve ilerle.", 
        nextSceneId: 'vulkan_lesson',
        action: (state) => {
          if (state.unlockedCodexEntries.includes('celebi')) return state;
          return { ...state, unlockedCodexEntries: [...state.unlockedCodexEntries, 'celebi'] };
        }
      }
    ]
  },
  'vulkan_lesson': {
    id: 'vulkan_lesson',
    speaker: "Vulkan",
    text: [
      "Vulkan, Çelebi'nin külleri arasında çömeldi. Parmaklarıyla gri tozu eşeledi. \"Demek ki fazla düşünmek iyi değil.\"",
      "Gözlerinde deliliğin ilk ciddi kıvılcımları çaktı. Sesi fısıltıya dönüştü. \"O zaman demek ki tek yapmam gereken beynimi koruyup vücudumu sağlam tutmak, değil mi?\"",
      "Ayağa fırladı, gözleri büyümüştü. \"Düşünmeyeceğim! Ama çok da düşünmemezlik yapmayacağım! Ben... ben mükemmelim.\"",
      "Sana doğru döndü, yüzünde çarpık bir gülümseme vardı. \"Sen de benim gibi çürüyorsun. Ama ben çözdüm!\""
    ],
    choices: [
      { text: "\"Bu delilik. Kendine gel.\"", nextSceneId: 'vulkan_stab' }
    ]
  },
  'vulkan_stab': {
    id: 'vulkan_stab',
    text: [
      "Vulkan'ın deliliğini durdurmak zorundaydın. Kılıcını kaldırdın.",
      "Vulkan güldü, ama bu neşeli bir gülüş değildi. \"Şaka yapıyorsun, değil mi? He? Dostum, bu—\"",
      "Çelik, etin arasına gömüldü. Vulkan şok içinde yere düştü. Gözlerindeki ışık titredi. \"Ben... çözmüştüm...\"",
      "Vulkan'ın bedeni yere çarptı. Kan yerine ışık sızdı. Bir şey parladı.",
      "DÜNYANIN EN OP KILIÇ & KALKANI yere düştü. Varlığı bile etrafındaki havayı büküyordu."
    ],
    choices: [
      { 
        text: "Bu lanetli gücü al.", 
        nextSceneId: 'kaathe_appears',
        action: (state) => ({ 
          ...state, 
          inventory: [...state.inventory, OP_SWORD],
          equippedWeapon: OP_SWORD.name
        })
      }
    ]
  },
  'kaathe_appears': {
    id: 'kaathe_appears',
    speaker: "Darkstalker Kaathe",
    text: [
      "\"Geldin sonunda, insan.\"",
      "Gölgelerin içinden uzun, siyah, yılanımsı bir varlık belirdi. Dişleri birer hançer gibiydi. \"Ben Darkstalker Kaathe.\"",
      "Ancak aniden, arkanızdan neşeli, hiç ölmemiş gibi bir ses geldi: \"Vay be... korkutucu. Neyse, selam dostum! Ben de Vulkan.\"",
      "Vulkan, Bonfire'ın yanında duruyordu. Yarası yoktu. Hiçbir şey olmamış gibi el sallıyordu."
    ],
    choices: [
      { text: "\"Öldüm mü?\" (Şaşkınlık)", nextSceneId: 'vulkan_loop' }
    ]
  },
  'vulkan_loop': {
    id: 'vulkan_loop',
    speaker: "Vulkan",
    text: [
      "\"Ne garip bir histi, biliyor musun? Bir anlığına her şey karardı, sonra birden buradayım!\"",
      "Kaathe şaşkındı. Kadim gözleri kısıldı. \"Bu... mümkün değil. Döngü kırıldı mı?\"",
      "Vulkan, Kaathe'nin 'Ateşi yakma, Karanlık Lord ol' nutuklarını dinledi ve omuz silkti.",
      "\"Kral olursam yemek işleri ne olacak? Vergi toplayacak mıyız? Fazla düşünmek iyi değil.\"",
      "Kaathe'nin sesi titredi. \"Sen... sanırım varoluşun doğasını anlamıyorsun.\""
    ],
    choices: [
      { text: "Bu absürtlüğü izlemeye devam et.", nextSceneId: 'frampt_appears' }
    ]
  },
  'frampt_appears': {
    id: 'frampt_appears',
    speaker: "Kingseeker Frampt",
    text: [
      "Vulkan döngüyü eğlenceli hale getirmekten bahsederken, yer sarsıldı. Koca bir yaratık, Kaathe'ye tıpatıp benzeyen ama beyaz, taşların arasından yükseldi.",
      "\"BEN KINGSEEKER FRAMPT'IM! LORD GWYN'İN SADIK HİZMETKÂRI!\"",
      "Vulkan alkışladı. \"İKİZLER Mİ? HARİKA! SENİNLE KANKA OLMALIYIZ!\"",
      "İkisi birden manasızca kahkaha atmaya başladı. Frampt, Vulkan'ın saf aptallığına hayran kalmıştı."
    ],
    choices: [
      { text: "Bu deliliğe son ver.", nextSceneId: 'fight_vulkan_scripted' }
    ]
  },
  'fight_vulkan_scripted': {
    id: 'fight_vulkan_scripted',
    text: [
      "Kılıcını çektin. Vulkan ciddileşti. \"Bitiriyorum.\"",
      "Elindeki 'DÜNYANIN EN OP KILIÇ & KALKANI'nı kaldırdın. Evrenin en güçlü silahıydı.",
      "Vulkan cebinden paslı, yamuk bir kılıç çıkardı. \"BEKLE, BEN DE SAVUNMAMI YAPACAM!\"",
      "Sonuç kaçınılmazdı. Kıııırrrttt! Vulkan'ın kılıcı toza dönüştü.",
      "Vulkan: \"AĞĞĞHHH BU HİÇ ADİL DEĞİL!!\" ve tek darbede yere serildi."
    ],
    choices: [
      { text: "Zaferini ilan et.", nextSceneId: 'frampt_betrayal' }
    ]
  },
  'frampt_betrayal': {
    id: 'frampt_betrayal',
    text: [
      "Tam Vulkan'ı bitirecekken...",
      "\"HA HA HA! ÇOK İYİ DÖVÜŞTÜN VULKAN!\"",
      "Frampt, o devasa boynuyla arkana geçti ve sana TAM BİR KALLEŞÇE TOKAT ATTI. \"TAARRRUUUZZZZZ!!!\"",
      "Dengen bozuldu ve yere çakıldın. Vulkan kan tükürerek, ama sırıtarak kalktı. \"Sayende kazandım dostum!\""
    ],
    choices: [
      { text: "Acıyla ayağa kalk.", nextSceneId: 'logic_break' }
    ]
  },
  'logic_break': {
    id: 'logic_break',
    text: [
      "Kaathe tekrar belirdi. \"Ne aptalca bir görüntü.\"",
      "Vulkan, Frampt ve Kaathe arasında bir tartışma başladı. Vulkan, Gwyn'i takip etmek veya Karanlık Lord olmak yerine...",
      "\"Gwyn'in yanına gidip onu daha da güçlendirebiliriz!\" dedi.",
      "Kaathe dondu. \"Bu... Bu nasıl bir mantık hatası?\"",
      "Frampt deli gibi bağırdı: \"VULKAN SEN BİR DAHİSİN!!!\""
    ],
    choices: [
      { text: "Kaosun evreni yırtışını izle.", nextSceneId: 'god_vulkan' }
    ]
  },
  'god_vulkan': {
    id: 'god_vulkan',
    text: [
      "Kaathe'nin mantığı çöktü. Gerçeklik kırıldı. Kaathe patladı ve silindi.",
      "BÜYÜK BİR IŞIK PATLAMASI YAŞANDI. Evren kendine karşı hata verdi.",
      "Vulkan artık absürt derecede OP bir varlıktı. Zırhı altın rengi parlıyordu.",
      "Eline 'GÜÇLÜ OLAN KAZANIR KILICI' ve 'KENDİNDEN KORUNAN KALKAN' belirdi.",
      "Frampt: \"HAHAHA!!! VULKAN, SEN GERÇEK BİR TANRISIN!!!\""
    ],
    choices: [
      { text: "KAÇ!", nextSceneId: 'escape_collision' }
    ]
  },
  'escape_collision': {
    id: 'escape_collision',
    text: [
      "Hayatında hiç olmadığı kadar hızlı koştun. Arkanda evrensel anlamsızlık vardı.",
      "Taş yollar düzelmeye başladığında... BOOOOM!",
      "Birine çarptın. Yuvarlandınız.",
      "Karşında aşırı şişman, altın zırhlı bir şövalye vardı. Göbeği yere yayılmıştı.",
      "\"BEN UNDEAD ONUR THE OBUR!\""
    ],
    choices: [
      { text: "\"Sen kimsin?\"", nextSceneId: 'meet_onur' }
    ]
  },
  'meet_onur': {
    id: 'meet_onur',
    speaker: "Onur the Obur",
    text: [
      "Onur, devasa çantasını düzeltti. \"Biliyor musun... Buraya Pinwheel'den kaçıp geldim.\"",
      "\"Pinwheel. Evet dostum... BİR FELAKET. ONUNLA YÜZ KEZ SAVAŞTIM VE YÜZ KEZ ÖLDÜM.\"",
      "Şaşırdın. Pinwheel en kolay boss değil miydi?",
      "Onur titredi. \"Ne zaman vursam geri dönüyor... Beni buraya gönderen Frampt'tı.\""
    ],
    choices: [
      { text: "Hikayeyi dinle.", nextSceneId: 'chester_pinwheel' }
    ]
  },
  'chester_pinwheel': {
    id: 'chester_pinwheel',
    speaker: "Marvelous Chester",
    text: [
      "Gölgelerden şık giyimli, maskeli bir figür çıktı. Marvelous Chester.",
      "\"Eğer Vulkan ve Frampt'i durdurmak istiyorsanız, tek bir yol var: Pinwheel.\"",
      "Onur panikledi: \"HAYIR! O GERİ GELMEMELİ!\"",
      "Chester gülümsedi. \"Pinwheel bir hata. Ölümün hatası. Gwyn'in ilk laneti. Asla ölmesi gerekmeyen bir şey.\"",
      "Gölgeler hareket etti. Pinwheel belirdi. Ama farklıydı. Maskesinin altı... boşluktu."
    ],
    choices: [
      { text: "Pinwheel ile yüzleş.", nextSceneId: 'sekiro_reveal' }
    ]
  },
  'sekiro_reveal': {
    id: 'sekiro_reveal',
    speaker: "Pinwheel",
    text: [
      "Pinwheel'in sesi soğuk bir yankıydı. \"Ben özgürlüğümü istiyorum. Ölümsüzler ancak ölümsüzleri öldürebilen bir kılıç ile yok edilebilir.\"",
      "\"Bu dünya parçalandığında, başka bir dünya da buraya sürüklendi.\"",
      "\"O dünyadan bir savaşçı geldi. Ona Sekiro diyorlar.\"",
      "\"O bıçağı almak zorundayız.\""
    ],
    choices: [
      { text: "Yeni maceraya başla (DEMO SONU)", nextSceneId: 'end_demo' }
    ]
  },
  'end_demo': {
    id: 'end_demo',
    text: [
      "Vulkan ve Frampt evreni mantıksızlığa sürüklerken, Chosen Undead, Onur ve Chester; Sekiro'yu bulmak için yola koyuldular.",
      "Alevlerin Sonunda hikayesi, daha yeni başlıyordu.",
      "--- DEMO SONU ---"
    ],
    choices: [
      { text: "Başa Dön", nextSceneId: 'start', action: (state) => INITIAL_PLAYER }
    ]
  }
};