import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {ClickableText} from '../../../components/ClickableText/ClickableText';
import Icon from '../../../components/Icon/Icon';
import QuotaEditorWithHide from '../../../components/QuotaEditor/QuotaEditorWithHide';
import {SelectSingle} from '../../../components/Select/Select';

import ypath from '../../../common/thor/ypath';

import {getActiveAccount} from '../../../store/selectors/accounts/accounts';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {
    ALLOW_CHILDREN_LIMIT_OVERCOMMIT,
    RECURSIVE_RESOURCES_USAGE_PREFIX,
    RESOURCES_LIMITS_PREFIX,
    RESOURCES_USAGE_PREFIX,
    TOTAL_CHILDREN_RESOURCE_LIMIT,
} from '../../../constants/accounts';
import {AccountQuotaParams, setAccountQuota} from '../../../store/actions/accounts/editor-ts';
import {
    ACCOUNT_RESOURCE_TYPES_DESCRIPTION,
    AccountResourceNameType,
    ROOT_ACCOUNT_NAME,
} from '../../../constants/accounts/accounts';
import {ProgressStackByTreeItem} from '../tabs/general/ProgressStack';
import {
    AccountsTree,
    getAccountsTree,
    getEditableAccountQuotaSources,
} from '../../../store/selectors/accounts/accounts-ts';

import './AccountQuota.scss';

const block = cn('account-quota');

interface Props {
    title: string;
    currentAccount: string;
    hardLimit?: number;

    type: AccountResourceNameType;
    mediumType?: string;
}

interface ReduxProps {
    activeAccount?: string;
    accountsTree: Record<string, AccountsTree>;
    setAccountQuota: (params: AccountQuotaParams) => void;
    sources: Array<string>;
}

interface State {
    showEditor?: boolean;
}

class AccountQuotaEditor extends React.Component<Props & ReduxProps, State> {
    state: State = {};

    render() {
        const {title, type, mediumType, currentAccount, activeAccount, accountsTree} = this.props;
        const {format} = ACCOUNT_RESOURCE_TYPES_DESCRIPTION[type];
        const {showEditor} = this.state;
        const {limit} = this.getInfoByName(currentAccount);
        return (
            <div className={block()}>
                <div className={block('value')}>
                    <div className={block('name')}>{title}</div>
                    <div className={block('progress')}>
                        <ProgressStackByTreeItem
                            treeItem={accountsTree[currentAccount]}
                            activeAccount={activeAccount}
                            type={type}
                            mediumType={mediumType}
                            className={block('progress-tooltip')}
                            popupClassName={block('progress-tooltip-popup')}
                        />
                    </div>
                    <ClickableText
                        color="secondary"
                        className={block('edit')}
                        onClick={this.toggleShowEditor}
                    >
                        <Icon awesome={'pencil'} />
                    </ClickableText>
                </div>
                {showEditor && (
                    <QuotaEditorWithHide
                        format={format}
                        limit={limit}
                        onHide={this.toggleShowEditor}
                        onSave={this.onLimitChange}
                        getInfoByName={this.getInfoByName}
                        currentAccount={currentAccount}
                        parentOfCurrentAccount={this.getParentAccount(currentAccount)}
                        renderSourceSuggest={this.renderSourcesSuggest}
                        min={this.calcMinLimit()}
                    />
                )}
            </div>
        );
    }

    renderSourcesSuggest = ({
        onChange,
        value,
    }: {
        value: string;
        onChange: (value?: string) => void;
    }) => {
        const {sources} = this.props;
        return (
            <SelectSingle
                value={value}
                onChange={onChange}
                items={map_(sources, (value) => {
                    return {
                        value,
                        text: value,
                    };
                })}
                placeholder={'Select account...'}
                width="max"
            />
        );
    };

    validateAccount = (account?: string) => {
        const {currentAccount} = this.props;
        if (account && account === currentAccount) {
            return 'The account itself cannot be used';
        }
        return undefined;
    };

    getParentAccount(account: string) {
        const {attributes: accountData} = this.props.accountsTree[account];
        return accountData.parent;
    }

    getResourcePath() {
        const {type, mediumType} = this.props;
        return !mediumType ? type : `${type}/${mediumType}`;
    }

    getInfoByName = (account = '') => {
        if (!account || account === ROOT_ACCOUNT_NAME) {
            return {limit: Infinity, total: Infinity};
        }

        const {attributes: accountData} = this.props.accountsTree[account] || {};
        if (!accountData) {
            return {limit: 0, total: 0};
        }

        const resourcePath = this.getResourcePath();
        return {
            limit: ypath.getValue(accountData, RESOURCES_LIMITS_PREFIX + resourcePath),
            usage: ypath.getValue(accountData, RESOURCES_USAGE_PREFIX + resourcePath),
            total: ypath.getValue(accountData, RECURSIVE_RESOURCES_USAGE_PREFIX + resourcePath),
            totalChildrenLimit: ypath.getValue(
                accountData,
                TOTAL_CHILDREN_RESOURCE_LIMIT + resourcePath,
            ),
            allowChildrenOverCommit: ypath.getValue(accountData, ALLOW_CHILDREN_LIMIT_OVERCOMMIT),
        };
    };

    getAccountData(account = '') {
        return this.props.accountsTree[account]?.attributes;
    }

    toggleShowEditor = () => {
        this.setState({showEditor: !this.state.showEditor});
    };

    onLimitChange = (newLimit: number, limitDiff: number, distributeAccount?: string) => {
        const {setAccountQuota, currentAccount} = this.props;
        setAccountQuota({
            limit: newLimit,
            limitDiff,
            account: currentAccount,
            distributeAccount,
            resourcePath: this.getResourcePath(),
        });
    };

    private calcMinLimit() {
        const {currentAccount} = this.props;
        const {
            usage = 0,
            total = 0,
            totalChildrenLimit = 0,
            allowChildrenOverCommit,
        } = this.getInfoByName(currentAccount);
        return allowChildrenOverCommit ? total : usage + totalChildrenLimit;
    }
}

function AccountQuota(props: Props) {
    const dispatch = useDispatch();
    const activeAccount = useSelector(getActiveAccount);
    const accountsTree = useSelector(getAccountsTree);

    const handleSetQuota = React.useCallback(
        (params: AccountQuotaParams) => {
            dispatch(setAccountQuota(params));
        },
        [dispatch],
    );

    const sources = useSelector(getEditableAccountQuotaSources);

    return (
        <AccountQuotaEditor
            {...props}
            activeAccount={activeAccount}
            accountsTree={accountsTree}
            setAccountQuota={handleSetQuota}
            sources={sources}
        />
    );
}

export default React.memo(AccountQuota);
