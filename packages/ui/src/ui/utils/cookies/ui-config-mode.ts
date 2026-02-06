import Cookies from 'js-cookie';

export function updateUiConfigModeCookie(isDeveloper: boolean) {
    if (isDeveloper) {
        Cookies.set('ui_config_mode', 'developer');
    } else {
        Cookies.remove('ui_config_mode');
    }
}
