import React from 'react';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';

import MetaTable from '../../../../components/MetaTable/MetaTable';
import {AccountParsedData, visitResourceFields} from '../../../../utils/accounts/accounts-selector';
import './AccountAlerts.scss';

const block = cn('yt-account-alerts');

interface Props {
    account: AccountParsedData;
}

function AccountAlerts({account}: Props) {
    const alerts: Record<string, number> = {};

    visitResourceFields(account?.$attributes?.recursive_violated_resource_limits, (value, path) => {
        if (value > 0) {
            alerts[path] = value;
        }
    });

    return (
        <React.Fragment>
            <div className={block('tooltip-title')}>
                Limits of the following resources are violated
                <br /> by the account or its children:
            </div>
            <MetaTable
                items={map_(alerts, (value, path) => {
                    return {
                        key: path,
                        label: readablePath(path),
                        value: <>{value}</>,
                    };
                })}
            />
        </React.Fragment>
    );
}

export default React.memo(AccountAlerts);

function readablePath(path: string) {
    return path.split('/').map(format.ReadableField).join(' / ');
}
