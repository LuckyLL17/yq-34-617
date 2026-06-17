import type { PresetText } from '@/types';

export const PRESET_TEXTS: PresetText[] = [
  {
    label: '0-9 数字',
    value: '0123456789',
    textType: 'number',
  },
  {
    label: '数字练习',
    value: '1234567890一二三四五六七八九十',
    textType: 'number',
  },
  {
    label: '一年级生字(一)',
    value: '一二三四五六七八九十人口手大小上下日月水火山石田土',
    textType: 'chinese',
  },
  {
    label: '一年级生字(二)',
    value: '天地人你我他爸妈哥姐弟妹男女老幼爸妈爷奶外公婆',
    textType: 'chinese',
  },
  {
    label: '二年级生字',
    value: '春夏秋冬东南西北金木水火风雨雷电花草树木鱼虫鸟兽',
    textType: 'chinese',
  },
  {
    label: '常用偏旁部首',
    value: '亻彳氵冫讠扌艹宀纟钅礻衤辶廴阝卩凵刂匚冂勹厶廾弋弓彐彡',
    textType: 'chinese',
  },
  {
    label: '唐诗《春晓》·孟浩然',
    value: '春眠不觉晓处处闻啼鸟夜来风雨声花落知多少',
    textType: 'chinese',
  },
  {
    label: '唐诗《静夜思》·李白',
    value: '床前明月光疑是地上霜举头望明月低头思故乡',
    textType: 'chinese',
  },
  {
    label: '唐诗《登鹳雀楼》·王之涣',
    value: '白日依山尽黄河入海流欲穷千里目更上一层楼',
    textType: 'chinese',
  },
  {
    label: '唐诗《咏柳》·贺知章',
    value: '碧玉妆成一树高万条垂下绿丝绦不知细叶谁裁出二月春风似剪刀',
    textType: 'chinese',
  },
  {
    label: '唐诗《绝句》·杜甫',
    value: '两个黄鹂鸣翠柳一行白鹭上青天窗含西岭千秋雪门泊东吴万里船',
    textType: 'chinese',
  },
  {
    label: '唐诗《江雪》·柳宗元',
    value: '千山鸟飞绝万径人踪灭孤舟蓑笠翁独钓寒江雪',
    textType: 'chinese',
  },
  {
    label: '唐诗《悯农》·李绅',
    value: '锄禾日当午汗滴禾下土谁知盘中餐粒粒皆辛苦',
    textType: 'chinese',
  },
  {
    label: '宋词《相思》·王维',
    value: '红豆生南国春来发几枝愿君多采撷此物最相思',
    textType: 'chinese',
  },
  {
    label: '三字经节选(一)',
    value: '人之初性本善性相近习相远苟不教性乃迁教之道贵以专',
    textType: 'chinese',
  },
  {
    label: '三字经节选(二)',
    value: '昔孟母择邻处子不学断机杼窦燕山有义方教五子名俱扬',
    textType: 'chinese',
  },
  {
    label: '百家姓开头',
    value: '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜',
    textType: 'chinese',
  },
  {
    label: '弟子规节选',
    value: '弟子规圣人训首孝悌次谨信泛爱众而亲仁有余力则学文',
    textType: 'chinese',
  },
  {
    label: '千字文节选',
    value: '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏',
    textType: 'chinese',
  },
  {
    label: '成语练习(一)',
    value: '一心一意一帆风顺三心二意四面八方五光十色七上八下九牛一毛十全十美',
    textType: 'chinese',
  },
  {
    label: '成语练习(二)',
    value: '画龙点睛守株待兔亡羊补牢掩耳盗铃对牛弹琴刻舟求剑井底之蛙画蛇添足',
    textType: 'chinese',
  },
  {
    label: 'A-Z 大小写',
    value: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    textType: 'english',
  },
  {
    label: '英文字母练习',
    value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz',
    textType: 'english',
  },
  {
    label: '英文常用词',
    value: 'Hello World Thank Goodbye Yes No Please Sorry Love Happy Family Friend School Book Water Food Time Day Night',
    textType: 'english',
  },
  {
    label: '英文数字 1-20',
    value: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen Twenty',
    textType: 'english',
  },
  {
    label: '英文星期一到日',
    value: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday',
    textType: 'english',
  },
  {
    label: '英文月份',
    value: 'January February March April May June July August September October November December',
    textType: 'english',
  },
  {
    label: '英文颜色词汇',
    value: 'Red Orange Yellow Green Blue Purple Pink Black White Gray Brown Gold',
    textType: 'english',
  },
  {
    label: '励志短句(一)',
    value: 'The best is yet to come Keep calm and carry on Never give up Stay hungry stay foolish',
    textType: 'english',
  },
  {
    label: '励志短句(二)',
    value: 'Dream big work hard Stay positive Be kind always Believe in yourself Nothing is impossible',
    textType: 'english',
  },
];

export function getPresetsByType(textType: string): PresetText[] {
  return PRESET_TEXTS.filter((p) => p.textType === textType);
}

export const DEFAULT_TEXTS: Record<string, string> = {
  number: '0123456789',
  chinese:
    '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐吊民伐罪周发殷汤坐朝问道垂拱平章爱育黎首臣伏戎羌',
  english: 'The quick brown fox jumps over the lazy dog Pack my box with five dozen liquor jugs How vexingly quick daft zebras jump Sphinx of black quartz judge my vow',
};
