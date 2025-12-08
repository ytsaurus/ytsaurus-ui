import React, {FC} from 'react';
import {VcsHeader} from '../VcsHeader';
import {VcsItemsList} from '../VcsItemsList';
import '../Vcs.scss';
import cn from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {uiSettings} from '../../../../config/ui-settings';
import {Info} from '../../../../components/Info/Info';
import i18n from './i18n';

const block = cn('vsc');

export const Vcs: FC = () => {
    const {vcsSettings} = uiSettings;

    if (!vcsSettings?.length)
        return (
            <div className={block({error: true})}>
                <Info>
                    <Text variant="subheader-1">{i18n('alert_vcs-not-configured')}</Text>
                    <p>{i18n('context_vcs-not-configured')}</p>
                </Info>
            </div>
        );

    return (
        <div className={block()}>
            <VcsHeader />
            <VcsItemsList />
        </div>
    );
};
