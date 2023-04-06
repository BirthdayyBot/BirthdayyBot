import { APP_ENV } from '../../helpers/provide/environment';

export const isPrd = APP_ENV === 'prd';
export const isTst = APP_ENV === 'tst';
export const isDev = APP_ENV === 'dev';

export const isNotPrd = APP_ENV !== 'prd';
export const isNotDev = APP_ENV !== 'dev';
