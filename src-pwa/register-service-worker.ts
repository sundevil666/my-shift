import { register } from 'register-service-worker';
import {
  activateAppUpdate,
  APP_UPDATE_AVAILABLE_EVENT,
  createAppUpdateDetail,
} from 'src/services/app-update';

register(process.env.SERVICE_WORKER_FILE ?? '/service-worker.js', {
  updated(registration) {
    void createAppUpdateDetail(registration).then((detail) => {
      if (detail.compatible) {
        activateAppUpdate(detail, false);
        return;
      }

      window.dispatchEvent(
        new CustomEvent(APP_UPDATE_AVAILABLE_EVENT, { detail }),
      );
    });
  },
});
