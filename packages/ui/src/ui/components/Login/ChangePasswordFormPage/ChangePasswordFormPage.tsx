import React, {useCallback, useState} from 'react';
import {Button, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import LoginPageWrapper from '../LoginPageWrapper/LoginPageWrapper';
import axios from 'axios';
import {useHistory, useLocation} from 'react-router';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import _ from 'lodash';

const block = cn('login-page');

interface Props {
    theme?: 'light' | 'dark';
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
        result.currentPassword = 'Current password must not be empty';
    }

    if (newPassword === '') {
        result.newPassword = 'New password must not be empty';
    }

    if (newPassword !== confirmPassword) {
        result.confirmPassword = 'New and confirm password must be equal';
    }

    return result;
};

function ChangePasswordForm({theme}: Props) {
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
            if (!_.isEmpty(validationErrors)) {
                setErrors(validationErrors);
                return;
            }

            setLoading(true);
            changePassword({newPassword, currentPassword})
                .then(() => {
                    goBack();
                    wrapApiPromiseByToaster(Promise.resolve(), {
                        skipSuccessToast: false,
                        toasterName: 'change-password-success',
                        successTitle: 'Password was changed.',
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
            <h1 className={block('title')}>Create new password</h1>
            <p className={block('text')}>
                Your new password must be different from previous used passwords.
            </p>
            <form onSubmit={handleFormSubmit}>
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder="Current password"
                    name="current-password"
                    value={currentPassword}
                    onUpdate={setCurrentPassword}
                    error={errors.currentPassword}
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder="New password"
                    name="new-password"
                    value={newPassword}
                    onUpdate={setNewPassword}
                    error={errors.newPassword}
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder="Confirm password"
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
                    Reset Password
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
                    Back
                </Button>
            </div>
        </>
    );
}

function changePassword({
    newPassword,
    currentPassword,
}: {
    newPassword: string;
    currentPassword: string;
}) {
    return axios.post(`/api/yt/change-password`, {
        newPassword,
        currentPassword,
    });
}

export function ChangePasswordFormPage({theme}: Props) {
    return (
        <LoginPageWrapper theme={theme}>
            <ChangePasswordForm theme={theme} />
        </LoginPageWrapper>
    );
}
