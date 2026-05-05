import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { registerLicense } from '@syncfusion/ej2-base';

registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1JHaF1cXmhPYVJpR2NbeU5xdl9GY1ZQQGY/P1ZhSXxVdkBjXH5cc3JUTmFVU0B9XEE=',
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
