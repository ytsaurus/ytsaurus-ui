import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import some_ from 'lodash/some';
import React from 'react';

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
                {map_(data, (page) => {
                    const hasItems = some_(page.sections, ({items}) => items.length > 0);
                    return (
                        hasItems && (
                            <Settings.Page
                                key={page.id}
                                id={page.id}
                                title={page.title}
                                icon={iconData(page.icon)}
                            >
                                {map_(page.sections, (section) => {
                                    return (
                                        <Settings.Section key={section.id} title={section.title}>
                                            {map_(section.items, (item) => {
                                                return (
                                                    <Settings.Item
                                                        key={item.id}
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
