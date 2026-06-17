import type { FontOption } from '@/types';

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'kaiti',
    name: '楷体',
    family: '"KaiTi", "STKaiti", "楷体", serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'songti',
    name: '宋体',
    family: '"SimSun", "STSong", "宋体", "Noto Serif SC", serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'heiti',
    name: '黑体',
    family: '"SimHei", "STHeiti", "黑体", "Noto Sans SC", sans-serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'fangsong',
    name: '仿宋',
    family: '"FangSong", "STFangsong", "仿宋", serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'lishu',
    name: '隶书',
    family: '"LiSu", "STLiti", "隶书", serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'youyuan',
    name: '幼圆',
    family: '"YouYuan", "幼圆", sans-serif',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'mashanzheng',
    name: '马善政楷书',
    family: '"Ma Shan Zheng", "KaiTi", cursive',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'zcool-kuaile',
    name: '站酷快乐体',
    family: '"ZCOOL KuaiLe", "KaiTi", cursive',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'liujianmaocao',
    name: '柳建茂草',
    family: '"Liu Jian Mao Cao", "STXingkai", cursive',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'longcang',
    name: '龙藏体',
    family: '"Long Cang", "STXingkai", cursive',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'zhimangxing',
    name: '志芒行',
    family: '"Zhi Mang Xing", "STXingkai", cursive',
    applicableTypes: ['chinese', 'number', 'english'],
  },
  {
    id: 'serif',
    name: '衬线体(英)',
    family: '"Times New Roman", "Georgia", serif',
    applicableTypes: ['english', 'number'],
  },
  {
    id: 'sans-serif',
    name: '无衬线体(英)',
    family: '"Arial", "Helvetica", sans-serif',
    applicableTypes: ['english', 'number'],
  },
  {
    id: 'dancing',
    name: 'Dancing Script(英)',
    family: '"Dancing Script", cursive',
    applicableTypes: ['english', 'number'],
  },
  {
    id: 'caveat',
    name: 'Caveat手写(英)',
    family: '"Caveat", cursive',
    applicableTypes: ['english', 'number'],
  },
  {
    id: 'indie-flower',
    name: 'Indie Flower(英)',
    family: '"Indie Flower", cursive',
    applicableTypes: ['english', 'number'],
  },
  {
    id: 'architects-daughter',
    name: "Architect's Daughter(英)",
    family: '"Architects Daughter", cursive',
    applicableTypes: ['english', 'number'],
  },
];

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Liu+Jian+Mao+Cao&family=Long+Cang&family=Zhi+Mang+Xing&family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Dancing+Script:wght@400;700&family=Caveat:wght@400;700&family=Indie+Flower&family=Architects+Daughter&display=swap';

export function getFontById(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0];
}

export function getFontsByType(textType: string): FontOption[] {
  return FONT_OPTIONS.filter((f) => f.applicableTypes.includes(textType as never));
}

export function getSortedFontsByType(textType: string, favoriteIds: string[]): { favorites: FontOption[]; others: FontOption[] } {
  const fonts = getFontsByType(textType);
  const favorites = fonts.filter((f) => favoriteIds.includes(f.id));
  const others = fonts.filter((f) => !favoriteIds.includes(f.id));
  return { favorites, others };
}
