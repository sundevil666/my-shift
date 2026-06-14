import { defineBoot } from '#q-app/wrappers';
import { reportError } from 'src/services/error-reporting';

export default defineBoot(({ app }) => {
  const previousHandler = app.config.errorHandler;
  app.config.errorHandler = (error, instance, info) => {
    reportError(error);
    previousHandler?.(error, instance, info);
  };

  window.addEventListener('error', (event) => {
    reportError(event.error ?? new Error(event.message));
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason);
  });
});
