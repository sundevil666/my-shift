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
declare namespace NodeJS {
  interface ProcessEnv {
    readonly GOOGLE_CLIENT_ID: string;
  }
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: { client_id: string; callback: (value: { credential: string }) => void }): void;
        renderButton(element: HTMLElement, options: Record<string, unknown>): void;
      };
    };
  };
}
