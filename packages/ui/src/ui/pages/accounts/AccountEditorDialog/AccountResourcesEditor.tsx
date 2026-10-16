import React from 'react';
import cn from 'bem-cn-lite';
import partition_ from 'lodash/partition';

import hammer from '../../../common/hammer';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import {EDITOR_TABS} from '../../../constants/accounts/editor';
import {AccountResourceName} from '../../../constants/accounts/accounts';
import UIFactory from '../../../UIFactory';
import {useSelector} from '../../../store/redux-hooks';
import {
    selectClusterUiConfig,
    selectClusterUiConfigEnablePerAccountTabletAccounting,
} from '../../../store/selectors/global';
import {selectMediumList} from '../../../store/selectors/thor';
import {getAccountMasterMemoryMedia} from '../../../store/selectors/accounts/accounts-ts';
import {isTopLevelAccount} from '../../../utils/accounts/accounts-tree';
import {ResourceWarning} from '../tabs/general/Editor/content/ResourceWarning';
import {TabletAccountingNotice} from '../tabs/general/Editor/content/TabletsContent';
import contentI18n from '../tabs/general/Editor/content/i18n';
import {AccountQuotaMutationEditor} from './AccountQuotaMutationEditor';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

const block = cn('account-editor-dialog');

interface AccountResourcesEditorProps {
    accountName: string;
    activeTab: string;
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
}

export function AccountResourcesEditor({
    accountName,
    activeTab,
    data,
    onChanged,
}: AccountResourcesEditorProps) {
    const account = data.accountsByName[accountName];
    const mediumList = useSelector(selectMediumList) as Array<string>;
    const allowTabletAccounting = useSelector(
        selectClusterUiConfigEnablePerAccountTabletAccounting,
    );

    if (!account) {
        return null;
    }

    const quotaProps = {currentAccount: accountName, data, onChanged};

    return (
        <div className="elements-section">
            {activeTab !== EDITOR_TABS.tablets && <ResourceWarning accountName={accountName} />}
            <AccountTransferQuotaNotice account={account} />
            {activeTab === EDITOR_TABS.nodes && (
                <AccountQuotaMutationEditor
                    {...quotaProps}
                    title={contentI18n('field_nodes')}
                    type={AccountResourceName.NODE_COUNT}
                />
            )}
            {activeTab === EDITOR_TABS.chunks && (
                <AccountQuotaMutationEditor
                    {...quotaProps}
                    title={contentI18n('field_chunks')}
                    type={AccountResourceName.CHUNK_COUNT}
                />
            )}
            {activeTab === EDITOR_TABS.medium && (
                <MediumQuotas
                    {...quotaProps}
                    account={account}
                    mediumList={mediumList.filter((medium) => medium !== 'cache')}
                />
            )}
            {activeTab === EDITOR_TABS.tablets && (
                <React.Fragment>
                    {allowTabletAccounting && (
                        <React.Fragment>
                            <AccountQuotaMutationEditor
                                {...quotaProps}
                                title={contentI18n('field_tablets')}
                                type={AccountResourceName.TABLET_COUNT}
                            />
                            <AccountQuotaMutationEditor
                                {...quotaProps}
                                title={contentI18n('field_tablet-static-memory')}
                                type={AccountResourceName.TABLET_STATIC_MEMORY}
                            />
                        </React.Fragment>
                    )}
                    <TabletAccountingNotice className={block('tablet-warning')} />
                </React.Fragment>
            )}
            {activeTab === EDITOR_TABS.masterMemory &&
                getAccountMasterMemoryMedia(account).map((medium) => (
                    <AccountQuotaMutationEditor
                        {...quotaProps}
                        key={medium}
                        title={hammer.format.Readable(medium)}
                        type={AccountResourceName.MASTER_MEMORY}
                        mediumType={medium}
                    />
                ))}
        </div>
    );
}

function MediumQuotas({
    account,
    mediumList,
    ...quotaProps
}: {
    account: AccountEditorData['accounts'][number];
    currentAccount: string;
    data: AccountEditorData;
    mediumList: Array<string>;
    onChanged(change: AccountEditorChange): void;
}) {
    const [showAll, setShowAll] = React.useState(false);
    const [defined, rest] = partition_(mediumList, (medium) => account.perMedium[medium]);
    const visibleMediums = showAll ? [...defined, ...rest] : defined;

    return (
        <React.Fragment>
            {visibleMediums.map((medium) => (
                <AccountQuotaMutationEditor
                    {...quotaProps}
                    key={medium}
                    title={`${hammer.format.ReadableField(medium)} medium`}
                    type={AccountResourceName.DISK_SPACE_PER_MEDIUM}
                    mediumType={medium}
                />
            ))}
            {rest.length > 0 && (
                <div className={block('show-all', 'elements-section')}>
                    <ClickableText onClick={() => setShowAll((value) => !value)}>
                        {contentI18n(showAll ? 'action_show-defined-only' : 'action_show-all')}
                    </ClickableText>
                </div>
            )}
        </React.Fragment>
    );
}

function AccountTransferQuotaNotice({account}: {account: AccountEditorData['accounts'][number]}) {
    const clusterUiConfig = useSelector(selectClusterUiConfig);

    return (
        <React.Fragment>
            {UIFactory.renderTransferQuotaNoticeForAccount({
                isTopLevel: isTopLevelAccount(account),
                accountAttributes: account.$attributes,
                clusterUiConfig,
            })}
        </React.Fragment>
    );
}
