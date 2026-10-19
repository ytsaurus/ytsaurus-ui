import React from 'react';
import {connect} from 'react-redux';

import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {type YTError} from '../../../@types/types';

import {YTErrorBlock} from '../../containers/Block/Block';

import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {selectEditableAccountParentSuggests} from '../../store/selectors/accounts/accounts';
import {selectAccountNames} from '../../store/selectors/accounts/accounts-ts';
import {selectCluster} from '../../store/selectors/global';
import {useSelector} from '../../store/redux-hooks';
import {useAccountNamesQuery} from '../../store/api/accounts';

import './AccountsSuggest.scss';
import {type RootState} from '../../store/reducers';
import {SelectSingle} from '../../components/Select/Select';

const block = cn('accounts-suggest');

const ROOT_ACCOUNT_TITLE = '<Root>';

interface Props {
    value?: string;

    onChange: (value?: Props['value']) => void;
    placeholder?: string;
    validate?: (value: Props['value']) => string | undefined;
    touched?: boolean;
    items: Array<string>;
    disabled?: boolean;
    allowRootAccount?: boolean;
    loading?: boolean;
}

export function AccountSuggestImpl(props: Props) {
    const {
        items,
        onChange,
        placeholder,
        allowRootAccount,
        disabled,
        loading,
        validate = () => undefined,
        touched,
    } = props;
    const value = props.value;

    const options = map_(items, (item) => ({
        value: item,
        text: item,
    }));
    if (allowRootAccount) {
        options.splice(0, 0, {
            value: ROOT_ACCOUNT_NAME,
            text: ROOT_ACCOUNT_TITLE,
        });
    }

    const error = touched && validate(value);

    return (
        <div className={block({empty: !value, error: Boolean(error)})}>
            <SelectSingle
                disabled={disabled}
                loading={loading}
                items={options}
                onChange={onChange}
                placeholder={placeholder}
                value={value}
                width="max"
                hideClear
            />
            {error && <div className={block('error')}>{error}</div>}
        </div>
    );
}

AccountSuggestImpl.isEmpty = (value: string) => {
    return !value;
};

AccountSuggestImpl.getDefaultValue = () => {
    return '';
};

AccountSuggestImpl.hasErrorRenderer = true;

const mapStateToProps = (state: RootState) => {
    return {
        items: selectAccountNames(state),
    };
};

const ASConnector = connect(mapStateToProps);

const AccountSuggestConnected = ASConnector(AccountSuggestImpl);

export default AccountSuggestConnected;

const mapStateToPropsForParents = (state: RootState) => {
    return {
        items: selectEditableAccountParentSuggests(state),
    };
};

export const SuggestParentsForEditableAccount =
    connect(mapStateToPropsForParents)(AccountSuggestImpl);

export function AccountsSuggestWithLoading(
    props: Omit<AccountsSuggestViewProps, 'error' | 'items' | 'loading'>,
) {
    const cluster = useSelector(selectCluster);
    const {currentData, error, isFetching} = useAccountNamesQuery(
        {cluster},
        {skip: props.disabled},
    );

    return (
        <AccountsSuggestView
            {...props}
            items={currentData || []}
            error={error as YTError | undefined}
            loading={isFetching}
        />
    );
}

export interface AccountsSuggestViewProps extends Omit<
    React.ComponentProps<typeof AccountSuggestImpl>,
    'items'
> {
    error?: YTError;
    excludedAccounts?: Array<string>;
    items: Array<string>;
}

export function AccountsSuggestView({
    error,
    excludedAccounts = [],
    items,
    ...props
}: AccountsSuggestViewProps) {
    const visibleItems = React.useMemo(() => {
        const excluded = new Set(excludedAccounts);
        const result = filter_(items, (item) => !excluded.has(item));

        if (props.disabled && props.value && !result.includes(props.value)) {
            result.unshift(props.value);
        }

        return result;
    }, [excludedAccounts, items, props.disabled, props.value]);

    return (
        <React.Fragment>
            <AccountSuggestImpl {...props} items={visibleItems} />
            {error && <YTErrorBlock error={error} />}
        </React.Fragment>
    );
}

AccountsSuggestWithLoading.isEmpty = (value: string) => {
    return !value;
};

AccountsSuggestWithLoading.getDefaultValue = () => {
    return ROOT_ACCOUNT_NAME;
};
