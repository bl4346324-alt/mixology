import type { Recipe } from '../types/recipe';

export const RECIPES: Recipe[] = [
  // ==========================================
  // 1. IBA 经典鸡尾酒 (Classic IBA)
  // ==========================================
  {
    id: 'mojito',
    nameZh: '莫吉托',
    nameEn: 'Mojito',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #10B981, #047857)',
    description: '夏日海风般的青柠薄荷清爽，海明威的最爱。',
    story: '起源于古巴哈瓦那的五分钱小酒馆，大文豪海明威写下“我的莫吉托在五分钱，我的黛绮莉在小佛罗里达”，让这杯加勒比微风风靡全球。',
    method: 'muddle',
    glass: 'highball',
    iceType: '满杯碎冰 / 方冰',
    difficulty: 'easy',
    prepTimeMinutes: 3,
    calculatedAbv: 11.5,
    flavor: {
      sweetness: 3,
      sourness: 4,
      strength: 2,
      bitterness: 1,
      refreshment: 5,
    },
    tags: ['清凉', '薄荷', '夏日', '微醺长饮', '海明威'],
    ingredients: [
      { ingredientId: 'white_rum', amountMl: 45 },
      { ingredientId: 'lime_juice', amountMl: 20 },
      { ingredientId: 'simple_syrup', amountMl: 15 },
      { ingredientId: 'mint_leaves', amountMl: 0, customUnit: '8-10片' },
      { ingredientId: 'soda_water', amountMl: 60 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '适量' },
    ],
    steps: [
      {
        step: 1,
        title: '唤醒薄荷',
        description: '取8-10片新鲜薄荷叶置于手心，用力轻拍一下唤醒香气，放入高球杯底。',
        actionType: 'prep',
        tip: '千万不要过度用力捣烂薄荷叶，否则会释放苦涩叶绿素！'
      },
      {
        step: 2,
        title: '轻压出汁',
        description: '加入 20ml 青柠汁和 15ml 糖浆，用捣棒轻柔压挤薄荷叶与果汁融合。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '注入基酒与轻柔翻拌',
        description: '倒入 45ml 白朗姆酒，加入碎冰至杯身 3/4 处，用吧勺轻柔提拉 5 秒使薄荷与酒液均匀散开。',
        actionType: 'stir',
        timerSeconds: 5,
        tip: '碎冰较细，轻柔提拉 5 秒即可，切勿打圈搅拌以免碎冰过快融化成水！'
      },
      {
        step: 4,
        title: '补足气泡与垂直一提',
        description: '加满苏打水，用吧勺由杯底垂直轻提一次（约3秒）混匀即可，插上薄荷顶芽装饰。',
        actionType: 'stir',
        timerSeconds: 3,
        tip: '气泡饮料切忌长时间搅拌，垂直轻提一次即可完美混合比重，保留丰富气泡！'
      }
    ],
    bartenderNote: '品尝时请将吸管放在薄荷叶旁边，每一口吸入酒液时都能同时嗅到芬芳薄荷清香。'
  },
  {
    id: 'gin_and_tonic',
    nameZh: '金汤力',
    nameEn: 'Gin & Tonic',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #06B6D4, #0E7490)',
    description: '杜松子草本与微苦气泡的绝妙共鸣，酒吧敲门砖。',
    story: '19世纪英属印度时期，英国士兵为防治疟疾饮用含奎宁的汤力水，因口感苦涩便混入军饷配发的金酒，无意间诞生了这款百年不朽的极简长饮。',
    method: 'build',
    glass: 'highball',
    iceType: '大方冰块堆满',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 12.0,
    flavor: {
      sweetness: 2,
      sourness: 2,
      strength: 2,
      bitterness: 3,
      refreshment: 5,
    },
    tags: ['经典', '草本', '气泡', '低卡解腻', '新手友好'],
    ingredients: [
      { ingredientId: 'gin', amountMl: 45 },
      { ingredientId: 'tonic_water', amountMl: 120 },
      { ingredientId: 'lime_juice', amountMl: 10, isOptional: true },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
    ],
    steps: [
      {
        step: 1,
        title: '冰杯与加冰',
        description: '在高球杯中装满大块坚实方冰，用吧勺轻转冰块降温后滤去融水。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '倾入金酒',
        description: '将 45ml 金酒缓缓淋在冰块上，轻柔搅拌两圈激发出杜松子芳香。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '沿吧勺注气泡',
        description: '冰镇汤力水沿吧勺螺纹引流慢慢注入杯中，防止气泡剧烈消散。',
        actionType: 'pour',
      },
      {
        step: 4,
        title: '垂直一提',
        description: '用吧勺由杯底垂直往上轻轻提拉一次（约3秒）即可，切勿剧烈打圈搅拌！',
        actionType: 'stir',
        timerSeconds: 3,
        tip: '气泡饮料剧烈搅拌会跑气变平淡，轻提一次即可完美混合比重。'
      }
    ],
    bartenderNote: '一块挤过的新鲜青柠角切面在杯口抹一圈后丢入酒中，能极大提升开场的柑橘香气。'
  },
  {
    id: 'old_fashioned',
    nameZh: '古典鸡尾酒',
    nameEn: 'Old Fashioned',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #F59E0B, #B45309)',
    description: '鸡尾酒的原点，纯粹醇厚的波旁橡木与焦糖香。',
    story: '19世纪初“鸡尾酒”一词诞生时的标准定义：烈酒、糖、水和苦精。历经百年变迁，人们依旧要求按“老旧的方式（Old Fashioned）”调制，因而得名。',
    method: 'stir',
    glass: 'old_fashioned',
    iceType: '单一纯净大老冰球',
    difficulty: 'medium',
    prepTimeMinutes: 4,
    calculatedAbv: 32.0,
    flavor: {
      sweetness: 3,
      sourness: 1,
      strength: 5,
      bitterness: 3,
      refreshment: 1,
    },
    tags: ['硬汉', '纯饮慢品', '威士忌', '深邃香气', '男士最爱'],
    ingredients: [
      { ingredientId: 'bourbon_whiskey', amountMl: 60 },
      { ingredientId: 'angostura_bitters', amountMl: 0, customUnit: '2-3滴' },
      { ingredientId: 'simple_syrup', amountMl: 5 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '大冰球' },
    ],
    steps: [
      {
        step: 1,
        title: '滴入苦精与糖',
        description: '在古典杯中加入 5ml 糖浆，滴入 2-3 滴安格斯图拉苦精。',
        actionType: 'measure',
      },
      {
        step: 2,
        title: '置入老冰',
        description: '放入一块剔透饱满的大老冰球，倒入 30ml 波旁威士忌。',
        actionType: 'prep',
      },
      {
        step: 3,
        title: '分次搅拌释水',
        description: '顺时针搅拌 20 圈，再补入剩余 30ml 威士忌，继续平稳搅拌至杯壁起霜。',
        actionType: 'stir',
        timerSeconds: 30,
        tip: '老冰球融水缓慢，搅拌能带来约 15%-20% 的优雅稀释，软化波旁的酒精冲劲。'
      },
      {
        step: 4,
        title: '橙皮喷香',
        description: '取一块新鲜橙皮在杯口上方对折挤出精油喷雾，轻轻擦拭杯沿后滑入杯中。',
        actionType: 'garnish',
      }
    ],
    bartenderNote: '这杯酒不要大口牛饮，静静观察冰球慢慢融化，每一口的味道都在演变。'
  },
  {
    id: 'margarita',
    nameZh: '玛格丽特',
    nameEn: 'Margarita',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #84CC16, #4D7C0F)',
    description: '龙舌兰的炽烈与青柠盐边的酸咸交织，热烈又深情。',
    story: '相传洛杉矶调酒师为纪念在墨西哥意外中流弹逝去的恋人 Margarita 所作。杯口的盐边象征心碎的泪水，青柠的酸楚与龙舌兰的热烈化为永恒纪念。',
    method: 'shake',
    glass: 'coupe',
    iceType: '摇和滤冰 (无冰饮用)',
    difficulty: 'medium',
    prepTimeMinutes: 3,
    calculatedAbv: 24.5,
    flavor: {
      sweetness: 2,
      sourness: 4,
      strength: 4,
      bitterness: 1,
      refreshment: 4,
    },
    tags: ['酸爽醒神', '龙舌兰', '聚会经典', '盐边仪式感'],
    ingredients: [
      { ingredientId: 'tequila_blanco', amountMl: 50 },
      { ingredientId: 'triple_sec', amountMl: 25 },
      { ingredientId: 'lime_juice', amountMl: 20 },
      { ingredientId: 'salt', amountMl: 0, customUnit: '适量做盐边', isGarnish: true },
    ],
    steps: [
      {
        step: 1,
        title: '抹制优雅半盐边',
        description: '用青柠切面擦拭浅碟杯半圈杯沿，在细海盐盘中轻蘸一圈多余盐粒拍落。',
        actionType: 'prep',
        tip: '做“半盐边”留出另一半杯沿，让客人可以自由选择咸甜口感！'
      },
      {
        step: 2,
        title: '入壶量料',
        description: '在雪克壶中倒入 50ml 龙舌兰、25ml 君度橙酒、20ml 新鲜青柠汁。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '满冰劲摇',
        description: '雪克壶装满硬实方冰，盖紧壶盖，双手有节奏前后剧烈摇晃 10-12 秒。',
        actionType: 'shake',
        timerSeconds: 12
      },
      {
        step: 4,
        title: '双重过滤出酒',
        description: '开盖，经隔冰匙过滤滤入冰镇好的杯中，切忌冰渣落入杯中。',
        actionType: 'pour',
      }
    ],
    bartenderNote: '青柠汁务必新鲜压榨，瓶装还原汁会让这杯经典的明亮青草气息大打折扣。'
  },
  {
    id: 'negroni',
    nameZh: '内格罗尼',
    nameEn: 'Negroni',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #EF4444, #991B1B)',
    description: '苦、甜、烈的完美平衡，红宝石般深邃的意式开胃酒之王。',
    story: '1919年佛罗伦萨的内格罗尼伯爵嫌美式鸡尾酒（Americano）不够劲，要求调酒师用金酒替换苏打水，由此诞生了这款黄金 1:1:1 比例的传世之作。',
    method: 'stir',
    glass: 'old_fashioned',
    iceType: '大方冰块',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 24.0,
    flavor: {
      sweetness: 3,
      sourness: 1,
      strength: 4,
      bitterness: 5,
      refreshment: 3,
    },
    tags: ['草本回甘', '黄金比例', '意式生活', '先苦后甜', '高格调'],
    ingredients: [
      { ingredientId: 'gin', amountMl: 30 },
      { ingredientId: 'campari', amountMl: 30 },
      { ingredientId: 'sweet_vermouth', amountMl: 30 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '适量' },
    ],
    steps: [
      {
        step: 1,
        title: '黄金等比倒入',
        description: '调酒杯或古典杯中各倒入 30ml 金酒、30ml 金巴利苦酒、30ml 红苦艾酒。',
        actionType: 'measure',
      },
      {
        step: 2,
        title: '加冰平稳搅拌',
        description: '加入大块方冰，用吧勺紧贴杯壁顺时针搅拌 25-30 秒使其充分降温与融水。',
        actionType: 'stir',
        timerSeconds: 30
      },
      {
        step: 3,
        title: '橙皮赋香',
        description: '挤压一片新鲜橙皮精油于酒液表面，投入杯中作为装饰。',
        actionType: 'garnish',
      }
    ],
    bartenderNote: '许多新手初尝觉得苦，但第三口之后，红苦艾的草本甘甜与金酒的杜松子香会在舌根层层绽放。'
  },
  {
    id: 'cosmopolitan',
    nameZh: '大都会',
    nameEn: 'Cosmopolitan',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #F43F5E, #BE123C)',
    description: '《欲望都市》女主角挚爱，酸甜平衡的粉红都会浪漫。',
    story: '90年代在纽约经由传奇调酒师 Dale DeGroff 改良，并在《欲望都市》中作为凯莉的招牌酒风靡全球，是现代时尚女性鸡尾酒的代名词。',
    method: 'shake',
    glass: 'martini',
    iceType: '摇和过滤 (无冰)',
    difficulty: 'easy',
    prepTimeMinutes: 3,
    calculatedAbv: 20.0,
    flavor: {
      sweetness: 3,
      sourness: 4,
      strength: 3,
      bitterness: 1,
      refreshment: 4,
    },
    tags: ['粉红视觉', '女生最爱', '蔓越莓果香', '都会时尚'],
    ingredients: [
      { ingredientId: 'vodka', amountMl: 40 },
      { ingredientId: 'triple_sec', amountMl: 15 },
      { ingredientId: 'cranberry_juice', amountMl: 30 },
      { ingredientId: 'lime_juice', amountMl: 15 },
    ],
    steps: [
      {
        step: 1,
        title: '冰镇马天尼杯',
        description: '将高脚马天尼杯放入冰箱冷冻，或在杯中盛满冰水预冷。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '原料入雪克壶',
        description: '量取 40ml 伏特加、15ml 君度、30ml 蔓越莓汁、15ml 青柠汁注入雪克壶。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '快速冰摇',
        description: '加满冰块，快速剧烈摇和 10-12 秒，直至壶身结出一层浓密白霜。',
        actionType: 'shake',
        timerSeconds: 12
      },
      {
        step: 4,
        title: '滤入高脚杯',
        description: '倒掉马天尼杯中的预冷冰水，将酒液滤入杯中，杯口饰以橙皮或青柠轮片。',
        actionType: 'pour',
      }
    ],
    bartenderNote: '蔓越莓汁不要加过多，保持通透的亮粉红而非深红色才是顶级大都会的色泽标志。'
  },
  {
    id: 'whiskey_sour',
    nameZh: '威士忌酸',
    nameEn: 'Whiskey Sour',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #EAB308, #A16207)',
    description: '威士忌与柠檬糖浆的酸甜平衡教科书，醇厚中透出明媚。',
    story: '1870年起源于美洲大陆水手船员，柠檬用于对抗败血症，威士忌暖身防腐，二者结合演变成为酒吧经久不衰的酸酒（Sour）宗师。',
    method: 'shake',
    glass: 'old_fashioned',
    iceType: '方冰',
    difficulty: 'medium',
    prepTimeMinutes: 3,
    calculatedAbv: 18.5,
    flavor: {
      sweetness: 3,
      sourness: 4,
      strength: 4,
      bitterness: 1,
      refreshment: 4,
    },
    tags: ['酸甜浓郁', '酸酒始祖', '波旁香草', '回味悠长'],
    ingredients: [
      { ingredientId: 'bourbon_whiskey', amountMl: 45 },
      { ingredientId: 'lemon_juice', amountMl: 25 },
      { ingredientId: 'simple_syrup', amountMl: 20 },
    ],
    steps: [
      {
        step: 1,
        title: '原料量取',
        description: '雪克壶中加入 45ml 波旁威士忌、25ml 鲜柠檬汁、20ml 糖浆。',
        actionType: 'measure',
      },
      {
        step: 2,
        title: '加冰充气摇和',
        description: '加满大方冰，剧烈摇和 12 秒，将酸度、甜度与高酒精烈度彻底乳化融合。',
        actionType: 'shake',
        timerSeconds: 12
      },
      {
        step: 3,
        title: '滤入加冰矮杯',
        description: '在古典杯中加入新鲜冰块，隔冰滤入酒液。',
        actionType: 'pour',
      }
    ],
    bartenderNote: '传统高级调法还会加入小半只蛋白（Egg white）干摇出绵密天鹅绒泡沫，口感更加丝滑！'
  },
  {
    id: 'moscow_mule',
    nameZh: '莫斯科骡子',
    nameEn: 'Moscow Mule',
    category: 'iba',
    coverColor: 'linear-gradient(135deg, #14B8A6, #0F766E)',
    description: '青柠与辛香干姜的冰爽踢击，如骡子后蹄般利落过瘾。',
    story: '1941年好莱坞，一家滞销斯米诺伏特加的酒厂、一个积压姜汁啤酒的酒吧老板，和一个堆满纯铜马克杯的铜匠一拍即合，创造了这款风靡世界的爽快鸡尾酒。',
    method: 'build',
    glass: 'mule_mug',
    iceType: '碎冰堆尖',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 10.0,
    flavor: {
      sweetness: 2,
      sourness: 3,
      strength: 2,
      bitterness: 1,
      refreshment: 5,
    },
    tags: ['姜香辛爽', '铜杯极致冰感', '爽快长饮', '解暑利器'],
    ingredients: [
      { ingredientId: 'vodka', amountMl: 45 },
      { ingredientId: 'lime_juice', amountMl: 15 },
      { ingredientId: 'ginger_beer', amountMl: 120 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
    ],
    steps: [
      {
        step: 1,
        title: '铜杯加满碎冰',
        description: '在标志性铜骡杯中填满碎冰（铜杯导冷快，杯壁瞬间凝结冰霜）。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '倒入伏特加与青柠',
        description: '量入 45ml 伏特加与 15ml 新鲜青柠汁。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '注满姜汁啤酒',
        description: '缓缓倒入冰镇姜汁啤酒至满杯，轻提吧勺一次混合。',
        actionType: 'pour',
      },
      {
        step: 4,
        title: '饰以青柠角与薄荷',
        description: '插上一瓣新鲜青柠角与一丛青翠薄荷。',
        actionType: 'garnish',
      }
    ],
    bartenderNote: '没有专用铜杯也没关系，用透明高球杯同样清爽解渴！'
  },

  // ==========================================
  // 2. 便利店与超市神仙特调 (Convenience Hacks)
  // ==========================================
  {
    id: 'suntory_oolong_highball',
    nameZh: '三得利乌龙威士忌 (茶嗨棒)',
    nameEn: 'Suntory Oolong Tea Highball',
    category: 'convenience',
    coverColor: 'linear-gradient(135deg, #78350F, #451A03)',
    description: '日料居酒屋爆款，浓郁炭焙乌龙包裹威士忌麦芽香，解腻首选。',
    story: '三得利无糖乌龙茶与角瓶威士忌在东京下町居酒屋的经典碰撞，茶多酚中和酒精的灼热，诞生无糖、微醺、回甘悠长的终极茶饮。',
    method: 'build',
    glass: 'highball',
    iceType: '满杯方冰',
    difficulty: 'easy',
    prepTimeMinutes: 1,
    calculatedAbv: 9.5,
    flavor: {
      sweetness: 1,
      sourness: 1,
      strength: 2,
      bitterness: 2,
      refreshment: 4,
    },
    tags: ['便利店爆款', '无糖低负担', '解油腻', '日式居酒屋', '男生女生都爱'],
    ingredients: [
      { ingredientId: 'bourbon_whiskey', amountMl: 40 },
      { ingredientId: 'suntory_oolong', amountMl: 130 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
    ],
    steps: [
      {
        step: 1,
        title: '高球杯装满冰',
        description: '高球杯放入 4-5 块大方冰，用吧勺搅拌 10 秒冰杯，倒出底部少许融水。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '注入威士忌',
        description: '倒入 40ml 威士忌（苏格兰威士忌或三得利角瓶皆可）。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '倒满冷藏乌龙茶与轻提',
        description: '倒入 130ml 冰镇三得利无糖乌龙茶，吧勺由下往上提一次（约3秒）混匀即可。',
        actionType: 'stir',
        timerSeconds: 3,
      }
    ],
    bartenderNote: '比例建议 1:3 至 1:4。如果喜欢更清爽，可额外加 10ml 苏打水带来轻微气泡感。'
  },
  {
    id: 'dongfang_shuye_gin',
    nameZh: '东方树叶茉莉金汤力',
    nameEn: 'Oriental Jasmine Tea Gin Tonic',
    category: 'convenience',
    coverColor: 'linear-gradient(135deg, #059669, #065F46)',
    description: '便利店断货王组合！无糖茉莉花茶融汇金酒杜松子，东方冷香一绝。',
    story: '国内小红书年轻调酒玩家发起的“便利店自救指南”。东方树叶天然萃取的无糖茉莉花香，完美弥补了工业汤力水的甜腻，创造出属于东方青年的高级冷香。',
    method: 'build',
    glass: 'highball',
    iceType: '满杯大冰块',
    difficulty: 'easy',
    prepTimeMinutes: 1,
    calculatedAbv: 8.5,
    flavor: {
      sweetness: 1,
      sourness: 1,
      strength: 2,
      bitterness: 2,
      refreshment: 5,
    },
    tags: ['小红书顶流', '高冷花香', '无糖轻负担', '便利店封神'],
    ingredients: [
      { ingredientId: 'gin', amountMl: 35 },
      { ingredientId: 'dongfang_shuye_green', amountMl: 100 },
      { ingredientId: 'tonic_water', amountMl: 50 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
    ],
    steps: [
      {
        step: 1,
        title: '满冰入杯',
        description: '高球杯加入坚实冰块至满杯。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '倒入金酒',
        description: '倒入 35ml 哥顿或添加利金酒。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '茶汽双拼',
        description: '先倒入 100ml 东方树叶茉莉花茶，再补入 50ml 汤力水提供轻气泡。',
        actionType: 'pour',
      },
      {
        step: 4,
        title: '轻提提香',
        description: '轻轻上下抽动吧勺一次（约3秒），花香与气泡交织扑面而来。',
        actionType: 'stir',
        timerSeconds: 3,
      }
    ],
    bartenderNote: '一定要用冷藏后的东方树叶！茶香更凝聚，融水更慢。'
  },
  {
    id: 'yakult_soju_sparkle',
    nameZh: '养乐多真露微醺气泡',
    nameEn: 'Yakult Soju Breeze',
    category: 'convenience',
    coverColor: 'linear-gradient(135deg, #FB7185, #E11D48)',
    description: '韩剧同款少女心特调，乳酸菌的酸甜包裹烧酒，入口完全没有酒精感。',
    story: '首尔街头大排档风靡开来的微醺喝法。酸甜奶香的养乐多完美掩盖烧酒的酒精凛冽，是年轻人轰趴聚会最好入口的微醺炸弹。',
    method: 'build',
    glass: 'highball',
    iceType: '方冰',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 6.5,
    flavor: {
      sweetness: 4,
      sourness: 3,
      strength: 1,
      bitterness: 1,
      refreshment: 4,
    },
    tags: ['少女心爆棚', '酸甜开胃', '韩系微醺', '轰趴必备', '几乎无酒味'],
    ingredients: [
      { ingredientId: 'soju', amountMl: 50 },
      { ingredientId: 'yakult', amountMl: 60 },
      { ingredientId: 'sprite', amountMl: 60 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '适量' },
    ],
    steps: [
      {
        step: 1,
        title: '放入冰块',
        description: '玻璃杯中装入半杯冰块。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '倒入真露烧酒',
        description: '倒入 50ml 韩国真露（原味或葡萄/西柚味均可）。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '加入养乐多与雪碧',
        description: '倒入一整瓶养乐多（约 60ml），再补入 60ml 雪碧带来欢脱气泡。',
        actionType: 'pour',
      },
      {
        step: 4,
        title: '轻柔搅拌',
        description: '用吧勺轻轻搅拌两圈，乳白色酒体翻腾，口感丝滑酸甜。',
        actionType: 'stir',
      }
    ],
    bartenderNote: '小心后劲！虽然喝起来像酸奶果汁饮料，但不知不觉就会上头。'
  },
  {
    id: 'jager_redbull',
    nameZh: '野格红牛 (轰趴潜艇)',
    nameEn: 'Jägerbomb',
    category: 'convenience',
    coverColor: 'linear-gradient(135deg, #15803D, #047857)',
    description: '夜店派对之魂！草本野格遇上能量红牛，肾上腺素飙升。',
    story: '全球电音节与夜店的狂欢标配，草本八角肉桂与红牛复合果香相撞，带来瞬间点燃全场的爆裂狂欢体验。',
    method: 'build',
    glass: 'highball',
    iceType: '方冰',
    difficulty: 'easy',
    prepTimeMinutes: 1,
    calculatedAbv: 9.0,
    flavor: {
      sweetness: 4,
      sourness: 2,
      strength: 3,
      bitterness: 2,
      refreshment: 4,
    },
    tags: ['轰趴炸弹', '派对狂欢', '提神', '草本药香'],
    ingredients: [
      { ingredientId: 'jagermeister', amountMl: 40 },
      { ingredientId: 'red_bull', amountMl: 120 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '适量' },
    ],
    steps: [
      {
        step: 1,
        title: '加冰杯底',
        description: '高球杯中加半杯冰块。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '倒入红牛',
        description: '先倒入 120ml 冰镇红牛饮料。',
        actionType: 'pour',
      },
      {
        step: 3,
        title: '淋入野格',
        description: '将 40ml 冰冻野格缓缓倒在冰块上方，形成渐变分层或混合后一饮而尽。',
        actionType: 'measure',
      }
    ],
    bartenderNote: '野格平时一定要放在冰箱冷冻室！零下十几度依然不结冰，浓稠如糖浆才最地道。'
  },

  // ==========================================
  // 3. 新中式茶酒特调 (New Chinese Tea & Spirit)
  // ==========================================
  {
    id: 'oolong_whiskey_sour',
    nameZh: '炭焙乌龙威士忌酸',
    nameEn: 'Roasted Oolong Whiskey Sour',
    category: 'tea_cocktail',
    coverColor: 'linear-gradient(135deg, #92400E, #78350F)',
    description: '岩茶岩韵与美式波旁香草的东方意境，醇厚深邃。',
    story: '当代中国新锐鸡尾酒吧代表作，用冷萃浓缩乌龙茶汤融入经典酸酒体系，茶单宁提升了回甘复杂度。',
    method: 'shake',
    glass: 'old_fashioned',
    iceType: '大老冰块',
    difficulty: 'medium',
    prepTimeMinutes: 3,
    calculatedAbv: 15.0,
    flavor: {
      sweetness: 3,
      sourness: 4,
      strength: 3,
      bitterness: 2,
      refreshment: 4,
    },
    tags: ['新中式茶酒', '茶香回甘', '高级格调', '微醺私房'],
    ingredients: [
      { ingredientId: 'bourbon_whiskey', amountMl: 45 },
      { ingredientId: 'suntory_oolong', amountMl: 30 },
      { ingredientId: 'lemon_juice', amountMl: 20 },
      { ingredientId: 'simple_syrup', amountMl: 15 },
    ],
    steps: [
      {
        step: 1,
        title: '取料入壶',
        description: '雪克壶中倒入 45ml 威士忌、30ml 浓缩乌龙茶、20ml 鲜柠檬汁、15ml 糖浆。',
        actionType: 'measure',
      },
      {
        step: 2,
        title: '满冰摇和',
        description: '加入大方冰，快速双手猛摇 12 秒使茶汤与果汁完全乳化融合。',
        actionType: 'shake',
        timerSeconds: 12
      },
      {
        step: 3,
        title: '滤入老冰杯',
        description: '隔冰滤入盛有大老冰球的古典杯中，饰以一抹柠檬皮。',
        actionType: 'pour',
      }
    ],
    bartenderNote: '茶多酚天然能收敛酒精的辛辣，入口先酸后甜，后调浮现高山岩茶的悠长回甘。'
  },

  // ==========================================
  // 4. 无酒精特调 (Mocktails)
  // ==========================================
  {
    id: 'virgin_mojito',
    nameZh: '零酒精莫吉托',
    nameEn: 'Virgin Mojito',
    category: 'mocktail',
    coverColor: 'linear-gradient(135deg, #34D399, #059669)',
    description: '无负担的清凉狂欢，开车驾车、孕期或不胜酒力朋友的顶级选择。',
    story: '褪去酒精羁绊，保留青柠与薄荷最天然的生机与清冽气泡，随时随地享受调酒仪式感。',
    method: 'muddle',
    glass: 'highball',
    iceType: '满杯碎冰',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 0.0,
    flavor: {
      sweetness: 3,
      sourness: 4,
      strength: 1,
      bitterness: 1,
      refreshment: 5,
    },
    tags: ['零酒精', '孕妇/司机友好', '低卡解渴', '全年龄畅饮'],
    ingredients: [
      { ingredientId: 'lime_juice', amountMl: 25 },
      { ingredientId: 'simple_syrup', amountMl: 20 },
      { ingredientId: 'mint_leaves', amountMl: 0, customUnit: '10片' },
      { ingredientId: 'soda_water', amountMl: 150 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '适量' },
    ],
    steps: [
      {
        step: 1,
        title: '拍击薄荷入杯',
        description: '手掌用力拍击新鲜薄荷叶，投入高球杯底。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '轻压挤汁',
        description: '倒入 25ml 青柠汁和 20ml 糖浆，用捣棒轻柔压挤几下。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '加冰注气',
        description: '加满碎冰，倒入 150ml 冰镇苏打水，用吧勺轻提混合均匀。',
        actionType: 'pour',
      }
    ],
    bartenderNote: '用雪碧替代糖浆和苏打水，也是家庭极速制作的偷懒好办法！'
  }
];

export const RECIPES_MAP = new Map<string, Recipe>(
  RECIPES.map(item => [item.id, item])
);
