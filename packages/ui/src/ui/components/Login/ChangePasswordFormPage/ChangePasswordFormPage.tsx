import React, {useCallback, useState} from 'react';
import {Button, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import LoginPageWrapper from '../LoginPageWrapper/LoginPageWrapper';
import axios from 'axios';
import {useHistory, useLocation} from 'react-router';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

import isEmpty_ from 'lodash/isEmpty';
import i18n from '../i18n';

const block = cn('login-page');

interface Props {
    theme?: 'light' | 'dark';
    cluster: string;
}

interface ErrorFields {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const validate = ({
    currentPassword,
    newPassword,
    confirmPassword,
}: Record<keyof ErrorFields, string>): ErrorFields => {
    const result: ErrorFields = {};
    if (currentPassword === '') {
        result.currentPassword = i18n('alert_current-password-empty');
    }

    if (newPassword === '') {
        result.newPassword = i18n('alert_new-password-empty');
    }

    if (newPassword !== confirmPassword) {
        result.confirmPassword = i18n('alert_passwords-not-equal');
    }

    return result;
};

function ChangePasswordForm({theme, cluster}: Props) {
    const history = useHistory();
    const location = useLocation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = React.useState<ErrorFields>({});
    const [loading, setLoading] = useState<boolean>(false);

    const goBack = useCallback(() => {
        if (location.key) {
            history.goBack();
        } else {
            history.push('/');
        }
    }, [history, location]);

    const handleFormSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setErrors({});

            const validationErrors = validate({currentPassword, newPassword, confirmPassword});
            if (!isEmpty_(validationErrors)) {
                setErrors(validationErrors);
                return;
            }

            setLoading(true);
            changePassword({newPassword, currentPassword, cluster})
                .then(() => {
                    goBack();
                    wrapApiPromiseByToaster(Promise.resolve(), {
                        skipSuccessToast: false,
                        toasterName: 'change-password-success',
                        successTitle: i18n('alert_password-changed'),
                    });
                })
                .catch((error: any) => {
                    const msg = error.response?.data?.message ?? error.message;
                    setErrors({currentPassword: msg});
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [currentPassword, newPassword, confirmPassword, goBack],
    );

    return (
        <>
            <h1 className={block('title')}>{i18n('title_create-new-password')}</h1>
            <p className={block('text')}>{i18n('context_new-password-text')}</p>
            <form onSubmit={handleFormSubmit}>
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder={i18n('field_current-password')}
                    name="current-password"
                    value={currentPassword}
                    onUpdate={setCurrentPassword}
                    error={errors.currentPassword}
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder={i18n('field_new-password')}
                    name="new-password"
                    value={newPassword}
                    onUpdate={setNewPassword}
                    error={errors.newPassword}
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder={i18n('field_confirm-password')}
                    name="confirm-password"
                    value={confirmPassword}
                    onUpdate={setConfirmPassword}
                    error={errors.confirmPassword}
                />
                <Button
                    className={block('button', {solid: true})}
                    type="submit"
                    width="max"
                    size="l"
                    pin="circle-circle"
                    view={theme === 'light' ? 'action' : 'normal-contrast'}
                    loading={loading}
                >
                    {i18n('action_reset-password')}
                </Button>
            </form>
            <div className={block('navigate')}>
                <Button
                    className={block('button', {outline: true})}
                    type="button"
                    width="max"
                    size="l"
                    pin="circle-circle"
                    onClick={goBack}
                    view="outlined"
                >
                    {i18n('action_back')}
                </Button>
            </div>
        </>
    );
}

function changePassword({
    newPassword,
    currentPassword,
    cluster,
}: {
    newPassword: string;
    currentPassword: string;
    cluster: string;
}) {
    return axios.post(`/api/yt/${cluster}/change-password`, {
        newPassword,
        currentPassword,
    });
}

export function ChangePasswordFormPage({theme, cluster}: Props) {
    return (
        <LoginPageWrapper theme={theme}>
            <ChangePasswordForm theme={theme} cluster={cluster} />
        </LoginPageWrapper>
    );
}
