/**
 * 文案字典 —— 与小程序 common/vm.js 一一对应。
 * 服务端存的是索引，任何一处对不上就会显示成空白，所以这张表只能整体替换、不能局部改。
 */

export const TIME_LABELS = ['上午', '下午', '晚上'] as const;

export const SIZE_LABELS = ['小型', '中型', '大型'] as const;

export const COLOR_LABELS = [
  '巧克力色',
  '红色',
  '金黄色',
  '奶油色',
  '浅黄褐色',
  '黑色',
  '蓝色',
  '灰色',
  '白色',
] as const;

export const GENDER_LABELS = ['母', '公'] as const;

export const USER_GENDER_LABELS = ['女士', '先生'] as const;

/** 按体型分组：size → breed 索引 */
export const BREED_LABELS: readonly (readonly string[])[] = [
  [
    '中华田园犬', '贵宾犬', '博美犬', '雪纳瑞', '柯基犬', '茶杯犬', '比熊犬', '法国斗牛犬',
    '比格犬', '巴哥犬', '吉娃娃', '迷你杜宾', '腊肠犬', '约克夏', '京巴犬', '马尔济斯', '其他',
  ],
  [
    '哈士奇', '萨摩耶', '拉布拉多', '金毛犬', '边境牧羊犬', '柴犬', '松狮犬', '马犬',
    '英国斗牛犬', '可卡犬', '牛头梗', '沙皮犬', '巴吉度', '德国牧羊犬', '美国恶霸犬', '其他',
  ],
  [
    '阿拉斯加犬', '秋田犬', '巨型贵宾犬', '罗威纳', '藏獒', '大白熊', '古牧', '杜宾',
    '高加索', '卡斯特罗', '杜高犬', '其他',
  ],
];

export const LIFE_RANGE_LABELS: readonly (readonly string[])[] = [
  ['年龄未知'],
  ['1个月', '2个月', '3个月', '4个月', '5个月', '6个月', '7个月', '8个月', '9个月', '10个月', '11个月', '12个月'],
  [
    '1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁',
    '11岁', '12岁', '13岁', '14岁', '15岁', '15岁以上',
  ],
];

export const CASTRATE_LABELS = ['尚未绝育', '已经绝育'] as const;

export const FEE_LABELS = ['无偿', '需押金', '有偿'] as const;

export const CATEGORY_LABELS = {
  lost: '人找狗',
  stray: '狗找人',
  adopt: '领养一条',
} as const;
