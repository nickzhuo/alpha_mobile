/** delta 接口的原始返回结构（字段名以 ConvertService 序列化结果为准，不改写） */

export interface ApiPic {
  key: string;
  url?: string;
}

export interface ApiUser {
  uuid: string;
  name: string;
  avatar: string;
  mobileVerify?: boolean;
  gender?: boolean;
  birthDay?: string | null;
}

interface LostBase {
  id: number;
  uuid: string;
  regionProvince: string;
  regionCity: string;
  regionArea: string;
  locationName: string;
  locationAddress: string;
  locationLatitude: string;
  locationLongitude: string;
  geoHash?: string;
  color: number;
  size: number;
  breed: number;
  pic: ApiPic[];
  remark: string;
  activate: boolean;
  createTime: string;
}

export interface LostRaw extends LostBase {
  date: string;
  time: number;
  gender: boolean;
  age: number;
  weight: number;
  contactsName: string;
  contactsGender: boolean;
  contactsMobile: string;
  reward: number;
  negotiate: boolean;
  found: boolean;
  wxaQrCode: string;
}

export interface StrayRaw extends LostBase {
  date: string;
  user?: ApiUser;
  wxaQrCode: string;
}

export interface AdoptRaw extends LostBase {
  gender: boolean;
  lifeType: number;
  lifeRange: number;
  fee: number;
  castrate: boolean;
  medical: boolean;
  conditions: string;
  contactsName: string;
  contactsGender: boolean;
  contactsMobile: string;
}

export interface ApiList<T> {
  list: T[];
  pagination?: {
    nextCursor: number;
    hasMore: boolean;
    pageSize: number;
  };
}
