import React from 'react';
import {connect} from 'react-redux';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {YTErrorBlock} from '../../components/Error/Error';

import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {getEditableAccountParentSuggests} from '../../store/selectors/accounts/accounts';
import {getAccountNames} from '../../store/selectors/accounts/accounts-ts';

import './AccountsSuggest.scss';
import {fetchFullList1M} from '../../utils/users-groups';
import {USE_CACHE} from '../../../shared/constants/yt-api';
import {RootState} from '../../store/reducers';
import {YTApiId} from '../../rum/rum-wrap-api';
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
}

export function AccountSuggestImpl(props: Props) {
    const {
        items,
        onChange,
        placeholder,
        allowRootAccount,
        disabled,
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
        items: getAccountNames(state),
    };
};

const ASConnector = connect(mapStateToProps);

const AccountSuggestConnected = ASConnector(AccountSuggestImpl);

export default AccountSuggestConnected;

const mapStateToPropsForParents = (state: RootState) => {
    return {
        items: getEditableAccountParentSuggests(state),
    };
};

export const SuggestParentsForEditableAccount =
    connect(mapStateToPropsForParents)(AccountSuggestImpl);

export function AccountsSuggestWithLoading(
    props: Omit<React.ComponentProps<typeof AccountSuggestImpl>, 'items'>,
) {
    const [{items, error}, setState] = React.useState<{
        items?: Array<string>;
        error?: string;
    }>({items: []});
    React.useMemo(() => {
        fetchFullList1M(YTApiId.listAccounts, {path: '//sys/accounts', ...USE_CACHE})
            .then((items: Array<string>) => {
                setState({items});
            })
            .catch((error: any) => {
                setState({error});
            });
    }, []);

    return (
        <React.Fragment>
            <AccountSuggestImpl {...props} items={items || []} />
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
