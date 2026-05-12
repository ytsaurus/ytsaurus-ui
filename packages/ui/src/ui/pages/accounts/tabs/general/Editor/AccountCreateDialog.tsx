import cn from 'bem-cn-lite';
import React from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import {type DialogField, type FormApi, YTDFDialog} from '../../../../../components/Dialog';
import {isIdmAclAvailable} from '../../../../../config';
import {ROOT_ACCOUNT_NAME} from '../../../../../constants/accounts/accounts';
import {loadEditedAccount} from '../../../../../store/actions/accounts/accounts';
import {closeCreateModal} from '../../../../../store/actions/accounts/editor';
import {createAccountFromInfo} from '../../../../../store/actions/accounts/editor-ts';
import {type RootState} from '../../../../../store/reducers';
import {selectActiveAccount} from '../../../../../store/selectors/accounts/accounts';
import {selectCurrentUserName} from '../../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../../store/selectors/global/is-developer';
import {isAbcAllowed} from '../../../../../UIFactory';
import {type ResponsibleType} from '../../../../../utils/acl/acl-types';
import './AccountCreateDialog.scss';
import i18n from './i18n';

const block = cn('account-create-dialog');

interface FormValues {
    abcService?: {slug: string; id: number};
    account: string;
    parentAccount: string;
    responsibles: Array<ResponsibleType>;
    createHome: boolean;
}

function isRootAccount(account: string) {
    return account === 'root';
}

class AccountCreateDialog extends React.Component<ConnectedProps<typeof connector>> {
    render() {
        const {visible, newAccountInfo, activeAccount, currentUserName, isAdmin} = this.props;

        const {parentAccount, responsibles = []} = newAccountInfo;

        return (
            <YTDFDialog<FormValues>
                className={block()}
                visible={visible}
                onClose={this.onClose}
                headerProps={{title: i18n('title_create-account')}}
                onAdd={this.onSubmit}
                pristineSubmittable
                initialValues={{
                    ...newAccountInfo,
                    parentAccount:
                        parentAccount || activeAccount || (isAdmin ? ROOT_ACCOUNT_NAME : undefined),
                    responsibles: responsibles.length
                        ? responsibles
                        : [{value: currentUserName, type: 'users'}],
                }}
                fields={[
                    ...((isAdmin && isAbcAllowed()
                        ? [
                              {
                                  name: 'abcService',
                                  type: 'abc-control',
                                  caption: i18n('field_abc-service'),
                                  required: true,
                                  visibilityCondition: {
                                      when: 'parentAccount',
                                      isActive: isRootAccount,
                                  },
                                  extras: {
                                      placeholder: i18n('field_abc-service-placeholder'),
                                  },
                              },
                          ]
                        : []) as Array<DialogField<FormValues>>),
                    {
                        name: 'account',
                        type: 'text',
                        caption: i18n('field_account-name'),
                        required: true,
                        extras: {
                            placeholder: i18n('field_account-name-placeholder'),
                            className: block('name'),
                        },
                    },
                    {
                        name: 'parentAccount',
                        type: 'accountsSuggest',
                        caption: i18n('field_parent-account'),
                        required: true,
                        extras: {
                            placeholder: i18n('field_parent-account-placeholder'),
                            allowRootAccount: isAdmin,
                        },
                    },
                    ...((isIdmAclAvailable()
                        ? [
                              {
                                  name: 'responsibles',
                                  type: 'acl-subjects',
                                  caption: i18n('field_responsible-users'),
                                  required: true,
                                  extras: {
                                      placeholder: i18n('field_responsible-users-placeholder'),
                                      allowedTypes: ['users', 'groups'],
                                  },
                              },
                          ]
                        : []) as Array<DialogField<FormValues>>),
                    ...(isAdmin
                        ? [
                              {
                                  name: 'createHome',
                                  type: 'tumbler' as const,
                                  caption: i18n('field_create-home-directory'),
                              },
                          ]
                        : []),
                ]}
            />
        );
    }

    onSubmit = (form: FormApi<FormValues>) => {
        const {createAccountFromInfo, closeCreateModal, loadEditedAccount} = this.props;
        const newAccountInfo = form.getState().values;
        if (!isRootAccount(newAccountInfo.parentAccount)) {
            newAccountInfo.abcService = undefined;
        }

        return createAccountFromInfo(newAccountInfo).then(() => {
            closeCreateModal();
            const {account} = newAccountInfo;
            loadEditedAccount(account);
        });
    };

    onClose = (form: FormApi<FormValues>) => {
        this.props.closeCreateModal(form.getState().values);
    };
}

const mapStateToProps = (state: RootState) => {
    const {
        accounts: {editor},
    } = state;
    return {
        currentUserName: selectCurrentUserName(state),
        activeAccount: selectActiveAccount(state),
        visible: editor.createModalVisible,
        newAccountInfo: editor.newAccountInfo as FormValues,
        isAdmin: selectIsAdmin(state),
    };
};

const mapDispatchToProps = {
    closeCreateModal,
    loadEditedAccount,
    createAccountFromInfo,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(AccountCreateDialog);
