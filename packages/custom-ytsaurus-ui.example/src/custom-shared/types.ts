import {AppConfig} from '@gravity-ui/nodekit';
import {UISettings} from '../shared/ui-settings';

export interface CustomAppConfig extends Omit<AppConfig, 'uiSettings'> {
    uiSettings: CustomUISettings;
}

export interface CustomUISettings extends Partial<UISettings> {
    myUiOption?: string;
}
