import React, {FC} from 'react';
import {VcsHeader} from './VcsHeader';
import {VcsItemsList} from './VcsItemsList';
import './Vcs.scss';
import cn from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {uiSettings} from '../../../config/ui-settings';
import {Info} from '../../../components/Info/Info';

const block = cn('vsc');

export const Vcs: FC = () => {
    const {vcsSettings} = uiSettings;

    if (!vcsSettings?.length)
        return (
            <div className={block({error: true})}>
                <Info>
                    <Text variant="subheader-1">UISettings.vcsSettings is empty.</Text>
                    <p>The installation of UI is not configured to work with any VCS</p>
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
