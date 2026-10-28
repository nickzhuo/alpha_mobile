import {
  BREED_LABELS,
  CASTRATE_LABELS,
  COLOR_LABELS,
  FEE_LABELS,
  GENDER_LABELS,
  LIFE_RANGE_LABELS,
  SIZE_LABELS,
  TIME_LABELS,
  USER_GENDER_LABELS,
} from './constants';
import { imageUrl, qrUrl } from './image';
import type { AdoptRaw, LostRaw, StrayRaw } from './types';

export type Category = 'lost' | 'stray' | 'adopt';

/** live = 进行中，done = 已完成，off = 已下架 */
export type Tone = 'live' | 'done' | 'off';

export interface SpecItem {
  label: string;
  value: string;
}

export interface DetailVM {
  id: number;
  category: Category;
  statusText: string;
  tone: Tone;
  inactive: boolean;
  headline: string;
  subline: string;
  highlight: SpecItem | null;
  specs: SpecItem[];
  paragraphs: { title: string; body: string }[];
  images: string[];
  imageAlt: string;
  location: {
    region: string;
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
  };
  publisher: { name: string; avatar: string; note: string } | null;
  meta: SpecItem[];
  qr: string;
  published: string;
  seo: { title: string; description: string; keywords: string[] };
}

const EMPTY = '未填写';

function pick<T>(list: readonly T[], index: number): T | undefined {
  const value = list[index];
  return value === undefined ? undefined : value;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function breedText(size: number, breed: number): string {
  return pick(BREED_LABELS[size] ?? [], breed) ?? '';
}

/** 省市区拼接，直辖市的省市同名时去重 */
function regionText(province: string, city: string, area: string): string {
  const head = province && city && province !== city ? `${province}${city}` : city || province;
  return `${head}${area}`;
}

/** 只保留城市/区，用于标题，太长会被搜索结果截断 */
function shortRegion(province: string, city: string, area: string): string {
  const main = city || province;
  return `${main}${area}`;
}

function joinDot(parts: (string | undefined | null)[]): string {
  return parts.filter((part) => !!part).join(' · ');
}

/** 中文习惯：颜色和品种直接连读，"巧克力色中华田园犬" */
function joinTight(parts: (string | undefined | null)[]): string {
  return parts.filter((part) => !!part).join('');
}

/** 日期 + 时段："2018-06-19 上午"，写进正文比用 · 分隔自然 */
function joinSpace(parts: (string | undefined | null)[]): string {
  return parts.filter((part) => !!part).join(' ');
}

function toCoord(value: string): number | null {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

/** 按标点断句，避免把"中华田园犬"这种词切一半 */
function snippet(value: string, max: number): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;

  const cut = flat.slice(0, max);
  const boundary = Math.max(
    cut.lastIndexOf('，'),
    cut.lastIndexOf('。'),
    cut.lastIndexOf('；'),
    cut.lastIndexOf('、'),
  );
  const head = boundary > max * 0.6 ? cut.slice(0, boundary) : cut;

  return `${head.replace(/[，。；、]$/, '')}…`;
}

function buildImages(pic: { key: string }[] | undefined): string[] {
  if (!Array.isArray(pic)) return [];
  return pic
    .map((item) => imageUrl(text(item?.key), { w: 1080 }))
    .filter((url) => url.length > 0);
}

function buildQr(category: Category, id: number, wxaQrCode?: string): string {
  const key = text(wxaQrCode);
  // lost/stray 每条实体都存了一张码在 COS 上，直接取，零成本；
  // adopt 没有这个字段，走本地代理（服务端生成一次后落盘缓存 30 天）
  return key ? qrUrl(key) : `/api/qr/${category}/${id}`;
}

function buildMeta(uuid: string, createTime: string): SpecItem[] {
  return [
    { label: '启事编号', value: uuid || EMPTY },
    { label: '发布时间', value: text(createTime) || EMPTY },
  ];
}

/* ------------------------------------------------------------------ 人找狗 */

export function buildLost(raw: LostRaw): DetailVM {
  const color = pick(COLOR_LABELS, raw.color) ?? '';
  const breed = breedText(raw.size, raw.breed);
  const gender = pick(GENDER_LABELS, raw.gender ? 1 : 0) ?? '';
  const timeLabel = pick(TIME_LABELS, raw.time) ?? '';
  const sizeLabel = pick(SIZE_LABELS, raw.size) ?? '';
  const dog = joinTight([color, breed]) || '狗狗';
  const place = shortRegion(raw.regionProvince, raw.regionCity, raw.regionArea);
  const found = Boolean(raw.found);
  const reward =
    raw.negotiate ? '面议' : raw.reward > 0 ? `${raw.reward}元` : '未填写';
  const escapedAt = joinSpace([raw.date, timeLabel]);
  const ageText = raw.age > 0 ? `${raw.age}岁` : '';
  const weightText = raw.weight > 0 ? `${raw.weight}公斤` : '';

  const headline = `${place}寻狗启事：${dog}`;
  const subline = joinDot([
    gender,
    ageText,
    weightText,
    escapedAt ? `${escapedAt}走失` : '',
  ]);

  const where = `${regionText(raw.regionProvince, raw.regionCity, raw.regionArea)}${text(raw.locationName)}`;

  return {
    id: raw.id,
    category: 'lost',
    statusText: raw.activate === false ? '已下架' : found ? '已找到' : '走失中',
    tone: raw.activate === false ? 'off' : found ? 'done' : 'live',
    inactive: raw.activate === false,
    headline,
    subline,
    highlight: found
      ? { label: '当前状态', value: '狗狗已找到' }
      : { label: '悬赏', value: reward },
    specs: [
      { label: '走失时间', value: escapedAt || EMPTY },
      { label: '走失地点', value: joinDot([place, text(raw.locationName)]) || EMPTY },
      { label: '品种', value: breed || EMPTY },
      { label: '颜色', value: color || EMPTY },
      { label: '性别', value: gender || EMPTY },
      { label: '年龄', value: raw.age > 0 ? `${raw.age}岁` : EMPTY },
      { label: '体重', value: raw.weight > 0 ? `${raw.weight}公斤` : EMPTY },
      { label: '体型', value: sizeLabel || EMPTY },
    ],
    paragraphs: [
      { title: '详细描述', body: text(raw.remark) || '发布者暂未填写更多细节，可在小程序内联系主人了解。' },
    ],
    images: buildImages(raw.pic),
    imageAlt: `${place}走失的${dog}`,
    location: {
      region: regionText(raw.regionProvince, raw.regionCity, raw.regionArea),
      name: text(raw.locationName),
      address: text(raw.locationAddress),
      lat: toCoord(raw.locationLatitude),
      lng: toCoord(raw.locationLongitude),
    },
    publisher: {
      name: text(raw.contactsName) || '爱心网友',
      avatar: '',
      note: pick(USER_GENDER_LABELS, raw.contactsGender ? 1 : 0) ?? '',
    },
    meta: buildMeta(raw.uuid, raw.createTime),
    qr: buildQr('lost', raw.id, raw.wxaQrCode),
    published: text(raw.createTime),
    seo: {
      title: snippet(
        `${place}寻狗启事｜${dog}${ageText ? ` ${ageText}` : ''}${found ? ' 已找到' : ' 走失'}`,
        30,
      ),
      description: snippet(
        `${escapedAt ? `${escapedAt}，` : ''}${where}附近走失一只${dog}${
          gender ? `（${gender}）` : ''
        }${[ageText, weightText].filter(Boolean).map((item) => `，${item}`).join('')}，赏金${reward}。${text(raw.remark)}`,
        80,
      ),
      keywords: ['寻狗', '寻狗启事', place, breed, color, '狗狗走失', '同城寻狗'].filter(Boolean),
    },
  };
}

/* ------------------------------------------------------------------ 狗找人 */

export function buildStray(raw: StrayRaw): DetailVM {
  const color = pick(COLOR_LABELS, raw.color) ?? '';
  const breed = breedText(raw.size, raw.breed);
  const sizeLabel = pick(SIZE_LABELS, raw.size) ?? '';
  const dog = joinTight([color, breed]) || '狗狗';
  const place = shortRegion(raw.regionProvince, raw.regionCity, raw.regionArea);
  const whereSpec = joinDot([place, text(raw.locationName)]);
  const whereText = `${regionText(raw.regionProvince, raw.regionCity, raw.regionArea)}${text(raw.locationName)}`;
  const date = text(raw.date);
  const publisherName = text(raw.user?.name) || '爱心网友';

  return {
    id: raw.id,
    category: 'stray',
    statusText: raw.activate === false ? '已下架' : '等待认领',
    tone: raw.activate === false ? 'off' : 'live',
    inactive: raw.activate === false,
    headline: `${place}寻主启事：${dog}`,
    subline: joinDot([
      date ? `${date}发现` : '',
      whereSpec ? `${text(raw.locationName) || place}附近` : '',
    ]),
    // 流浪狗没有"金额"这种天然高亮项，硬凑会和下面的属性网格重复，这里不显示
    highlight: null,
    specs: [
      { label: '发现日期', value: date || EMPTY },
      { label: '发现地点', value: whereSpec || EMPTY },
      { label: '品种', value: breed || EMPTY },
      { label: '颜色', value: color || EMPTY },
      { label: '体型', value: sizeLabel || EMPTY },
      { label: '发布者', value: publisherName },
    ],
    paragraphs: [
      { title: '发现经过', body: text(raw.remark) || '发现者暂未填写更多细节，可在小程序内联系发布者。' },
    ],
    images: buildImages(raw.pic),
    imageAlt: `${place}发现的${dog}流浪狗`,
    location: {
      region: regionText(raw.regionProvince, raw.regionCity, raw.regionArea),
      name: text(raw.locationName),
      address: text(raw.locationAddress),
      lat: toCoord(raw.locationLatitude),
      lng: toCoord(raw.locationLongitude),
    },
    publisher: {
      name: publisherName,
      avatar: text(raw.user?.avatar),
      note: '发现者',
    },
    meta: buildMeta(raw.uuid, raw.createTime),
    qr: buildQr('stray', raw.id, raw.wxaQrCode),
    published: text(raw.createTime),
    seo: {
      title: snippet(
        `${place}寻主启事｜${dog} 等待认领`,
        30,
      ),
      description: snippet(
        `${date ? `${date}，` : ''}有人在${whereText}附近发现一只${dog}${sizeLabel ? `（${sizeLabel}）` : ''}。${
          text(raw.remark)
        } 如果你是它的主人，或愿意提供线索，欢迎进小程序查看详情。`,
        80,
      ),
      keywords: ['寻主', '寻主启事', '流浪狗', place, breed, color, '狗狗找主人'].filter(Boolean),
    },
  };
}

/* ---------------------------------------------------------------- 领养一条 */

export function buildAdopt(raw: AdoptRaw): DetailVM {
  const color = pick(COLOR_LABELS, raw.color) ?? '';
  const breed = breedText(raw.size, raw.breed);
  const gender = pick(GENDER_LABELS, raw.gender ? 1 : 0) ?? '';
  const age = pick(LIFE_RANGE_LABELS[raw.lifeType] ?? [], raw.lifeRange) ?? '';
  const fee = pick(FEE_LABELS, raw.fee) ?? '';
  const castrate = pick(CASTRATE_LABELS, raw.castrate ? 1 : 0) ?? '';
  const place = shortRegion(raw.regionProvince, raw.regionCity, raw.regionArea);
  const dog = breed || '狗狗';
  const contactName = text(raw.contactsName) || '送养人';
  const contactGender = pick(USER_GENDER_LABELS, raw.contactsGender ? 1 : 0) ?? '';

  return {
    id: raw.id,
    category: 'adopt',
    statusText: raw.activate === false ? '已下架' : '可领养',
    tone: raw.activate === false ? 'off' : 'live',
    inactive: raw.activate === false,
    headline: `${place}${dog}等待领养`,
    subline: joinDot([age, gender, fee, color]),
    highlight: { label: '领养费用', value: fee || EMPTY },
    specs: [
      { label: '年龄', value: age || EMPTY },
      { label: '性别', value: gender || EMPTY },
      { label: '颜色', value: color || EMPTY },
      { label: '绝育', value: castrate || EMPTY },
      { label: '医疗', value: raw.medical ? '已驱虫/疫苗' : '未接种' },
      { label: '所在地', value: place || EMPTY },
    ],
    paragraphs: [
      { title: '详细说明', body: text(raw.remark) || '送养人暂未填写更多说明，可在小程序内查看。' },
      { title: '领养条件', body: text(raw.conditions) || '具体领养条件请在小程序内与送养人确认。' },
    ],
    images: buildImages(raw.pic),
    imageAlt: `${place}待领养的${dog}`,
    location: {
      region: regionText(raw.regionProvince, raw.regionCity, raw.regionArea),
      name: text(raw.locationName),
      address: text(raw.locationAddress),
      lat: toCoord(raw.locationLatitude),
      lng: toCoord(raw.locationLongitude),
    },
    publisher: {
      name: `${contactName}${contactGender ? `（${contactGender}）` : ''}`,
      avatar: '',
      note: '送养人',
    },
    meta: buildMeta(raw.uuid, raw.createTime),
    qr: buildQr('adopt', raw.id),
    published: text(raw.createTime),
    seo: {
      title: snippet(
        `${place}${dog}领养｜${[age, gender, fee].filter(Boolean).join(' ')}`,
        30,
      ),
      description: snippet(
        `${place}有一只${[color, age, gender].filter(Boolean).join('、') || ''}的${dog}正在寻找新家，${
          fee || '领养信息'
        }。${text(raw.remark)} 领养条件：${text(raw.conditions)}`,
        80,
      ),
      keywords: ['狗狗领养', '免费领养', place, dog, color, '宠物领养'].filter(Boolean),
    },
  };
}
