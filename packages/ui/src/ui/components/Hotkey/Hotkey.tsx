import {Component} from 'react';

import key, {HotkeysEvent} from 'hotkeys-js';

function eventOnInput(evt: KeyboardEvent) {
    const tagName = ((evt.target || evt.srcElement) as any).tagName;

    return /^(INPUT|TEXTAREA|SELECT)$/.test(tagName);
}

export interface HotkeyProps {
    settings: Array<HotkeyItem>;
}

interface HotkeyItem {
    keys: string;
    handler: (evt: KeyboardEvent, hotkeyEvent: HotkeysEvent) => void;
    scope: string;
    preventDefault?: boolean;
}

interface PreparedHokeyItem {
    combo: string;
    scope: HotkeyItem['scope'];
    handler: HotkeyItem['handler'];
    preventDefault: HotkeyItem['preventDefault'];
}

export default class Hotkey extends Component<HotkeyProps> {
    preparedSettings: Array<PreparedHokeyItem> = [];

    componentDidMount() {
        const {settings} = this.props;

        if (!key) {
            return;
        }

        this.preparedSettings = this.prepareSettings(settings);

        // To use hotkeys inside inputs we need to specify scope, other events are filtered.
        key.filter = function (evt) {
            const currentScope = key.getScope();

            return !(eventOnInput(evt) && currentScope === 'all');
        };

        this.preparedSettings.forEach((setting) => {
            this.bindKey(setting.combo, setting.scope, setting.handler, setting.preventDefault);
        });
    }

    componentWillUnmount() {
        if (!key) {
            return;
        }

        this.preparedSettings.forEach((setting) => {
            this.unbindKey(setting.combo, setting.scope);
        });
    }

    prepareSettings(settings: HotkeyProps['settings']) {
        const preparedSettings: Array<PreparedHokeyItem> = [];

        settings.forEach((item) => {
            const keyCombinations = item.keys.split(/\s*,\s*/);
            const scopes = item.scope.split(/\s*,\s*/);
            const preventDefault =
                typeof item.preventDefault !== 'undefined' ? item.preventDefault : true;

            keyCombinations.forEach((combo) => {
                scopes.forEach((scope) => {
                    preparedSettings.push({
                        combo: combo,
                        scope: scope,
                        handler: item.handler,
                        preventDefault: preventDefault,
                    });
                });
            });
        });

        return preparedSettings;
    }

    bindKey(
        combination: string,
        scope: string,
        handler: HotkeyItem['handler'],
        preventDefault?: boolean,
    ) {
        key(combination, scope, (evt, shortcut) => {
            if (key.getScope() === shortcut.scope) {
                handler(evt, shortcut);

                if (preventDefault) {
                    evt.preventDefault();
                }
            }
        });
    }

    unbindKey(combination: string, scope: string) {
        key.unbind(combination, scope);
    }

    render() {
        return null;
    }
}
