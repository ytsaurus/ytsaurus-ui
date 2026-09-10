import React from 'react';
import block from 'bem-cn-lite';

import {setAccountAbc} from '../../../../../../../utils/accounts/editor';
import {SuggestParentsForEditableAccount} from '../../../../../AccountsSuggest';
import UIFactory from '../../../../../../../UIFactory';
import i18n from '../i18n';
import {type AccountParsedData} from '../../../../../../../utils/accounts/accounts-selector';

const b = block('accounts-editor');

export function WithHeader({
    header,
    children,
}: {
    header: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className={b(null, 'elements-section')}>
            <div className={b(null, 'elements-heading_size_s')}>{header}</div>
            {children}
        </div>
    );
}

interface ParentProps {
    account: AccountParsedData;
    loadEditedAccount: (name: string) => void;
    setAccountParent: (name: string, parentName: string) => Promise<void>;
    cluster: string;
    isAdmin: boolean;
}

type Props = ParentProps;

export class GeneralContentBase extends React.Component<Props> {
    override state = {
        abcId: undefined,
        abcTitle: '',
        // We have to use this property as 'key' of StaffSuggestControl to recreate the component,
        // else it will not clear his internal state.
        responsibleKey: 0,
    };

    onParentChange = (parentName = '', {isOutsideClick}: {isOutsideClick?: boolean} = {}) => {
        if (isOutsideClick) {
            this.forceUpdate();
            return;
        }

        const {
            account: {name, parent},
            setAccountParent,
        } = this.props;
        if (parent === parentName) {
            return;
        }
        return setAccountParent(name, parentName);
    };

    renderParentAccount(value = '') {
        const {isAdmin} = this.props;
        return (
            <WithHeader header={i18n('field_parent')}>
                <SuggestParentsForEditableAccount
                    value={value}
                    onChange={this.onParentChange}
                    disabled={!isAdmin}
                    allowRootAccount={true}
                />
            </WithHeader>
        );
    }

    renderAbcServiceId() {
        const {
            account: {
                abc: {id, slug},
            },
            isAdmin,
        } = this.props;

        const control = UIFactory.renderControlAbcService({
            value: {id, slug},
            onChange: this.onAbcServiceChanged,
            placeholder: i18n('field_abc-service-placeholder'),
            disabled: !isAdmin,
        });

        return !control ? null : (
            <WithHeader header={i18n('field_abc-service')}>{control}</WithHeader>
        );
    }

    onAbcServiceChanged = async (
        service?: AccountParsedData['abc'],
        {isOutsideClick}: {isOutsideClick?: boolean} = {},
    ) => {
        if (isOutsideClick) {
            this.forceUpdate();
            return;
        }

        const {id: abcServiceId, slug: value} = service ?? {};
        const {
            account: {name, abc: {slug, id} = {}},
            loadEditedAccount,
        } = this.props;
        if (abcServiceId === id && slug === value) {
            return;
        }
        await setAccountAbc(name, abcServiceId, value);
        loadEditedAccount(name);
    };

    override render() {
        const {
            account: {parent},
        } = this.props;

        return (
            <React.Fragment>
                {this.renderAbcServiceId()}
                {this.renderParentAccount(parent)}
            </React.Fragment>
        );
    }
}
