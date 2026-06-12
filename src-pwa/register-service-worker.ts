import { register } from 'register-service-worker';
import {
  APP_UPDATE_AVAILABLE_EVENT,
  createAppUpdateDetail,
} from 'src/services/app-update';

register(process.env.SERVICE_WORKER_FILE ?? '/service-worker.js', {
  updated(registration) {
    void createAppUpdateDetail(registration).then((detail) => {
      window.dispatchEvent(
        new CustomEvent(APP_UPDATE_AVAILABLE_EVENT, { detail }),
      );
    });
  },
});
