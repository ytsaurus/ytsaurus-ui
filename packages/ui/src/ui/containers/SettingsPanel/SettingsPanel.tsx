import React from 'react';
import cn from 'bem-cn-lite';
import _map from 'lodash/map';
import _some from 'lodash/some';

import {Settings} from '@gravity-ui/navigation';
import {useSettingsDescription} from './settings-description';

import './SettingsPanel.scss';

const block = cn('settings-panel');

function iconData(data: any) {
    return {data};
}

function SettingsPanel() {
    const data = useSettingsDescription();
    return (
        <div className={block()}>
            <Settings>
                {_map(data, (page, i) => {
                    const hasItems = _some(page.sections, ({items}) => items.length > 0);
                    return (
                        hasItems && (
                            <Settings.Page key={i} title={page.title} icon={iconData(page.icon)}>
                                {_map(page.sections, (section, j) => {
                                    return (
                                        <Settings.Section key={j} title={section.title}>
                                            {_map(section.items, (item, k) => {
                                                return (
                                                    <Settings.Item
                                                        key={k}
                                                        title={item.title}
                                                        align={item.align}
                                                    >
                                                        {item.content}
                                                    </Settings.Item>
                                                );
                                            })}
                                        </Settings.Section>
                                    );
                                })}
                            </Settings.Page>
                        )
                    );
                })}
            </Settings>
        </div>
    );
}

export default React.memo(SettingsPanel);
