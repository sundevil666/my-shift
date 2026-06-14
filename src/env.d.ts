declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
declare namespace NodeJS {
  interface ProcessEnv {
    APP_VERSION: string;
    ANDROID_VERSION_CODE: string;
  }
}
