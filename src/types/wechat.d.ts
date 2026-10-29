/** 微信 JS-SDK 的最小类型声明，只声明我们用到的部分 */

interface WechatSdkConfig {
  debug?: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList?: string[];
  openTagList?: string[];
}

interface WechatSdk {
  config(config: WechatSdkConfig): void;
  ready(callback: () => void): void;
  error(callback: (error: unknown) => void): void;
}
