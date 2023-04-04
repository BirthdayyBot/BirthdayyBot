import { APP_ENV } from '../../helpers/provide/environment';

export const isPrd = APP_ENV === 'prd';
export const isTst = APP_ENV === 'tst';
export const isDev = APP_ENV === 'dev';
