import cn from 'bem-cn-lite';
import React from 'react';
import {type DialogField, type FormApi, YTDFDialog} from '../../../../../../containers/Dialog';
import {isIdmAclAvailable} from '../../../../../../config';
import {ROOT_ACCOUNT_NAME} from '../../../../../../constants/accounts/accounts';
import {isAbcAllowed} from '../../../../../../UIFactory';
import {type ResponsibleType} from '../../../../../../utils/acl/acl-types';
import {type NewAccountInfo} from '../../../../../../store/actions/accounts/editor-ts';
import i18n from '../i18n';

const block = cn('account-create-dialog');

export interface FormValues {
    abcService?: {slug: string; id: number};
    account: string;
    parentAccount: string;
    responsibles: Array<ResponsibleType>;
    createHome: boolean;
}

function isRootAccount(account: string) {
    return account === 'root';
}

export class AccountCreateDialogBase extends React.Component<{
    currentUserName: string;
    activeAccount: string | undefined;
    visible: boolean;
    newAccountInfo: FormValues;
    isAdmin: boolean;
    closeCreateModal: (newAccountInfo?: FormValues) => void;
    loadEditedAccount: (accountName?: string) => void;
    createAccountFromInfo: (newAccountInfo: NewAccountInfo) => Promise<unknown>;
}> {
    override render() {
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
