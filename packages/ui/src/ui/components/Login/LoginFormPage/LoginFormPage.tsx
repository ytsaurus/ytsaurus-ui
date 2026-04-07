import React, {useCallback, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {onSuccessLogin} from '../../../store/actions/global';
import ytLocalStorage from '../../../utils/yt-local-storage';
import {
    getClusterConfigByName,
    getOAuthButtonLabel,
    getOAuthEnabled,
    selectGlobalYTAuthCluster,
} from '../../../store/selectors/global';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import LoginPageWrapper from '../LoginPageWrapper/LoginPageWrapper';
import isEmpty_ from 'lodash/isEmpty';

import cn from 'bem-cn-lite';
import i18n from '../i18n';

const block = cn('login-page');

interface ErrorFields {
    username?: string;
    password?: string;
    response?: string;
}

interface Props {
    theme?: 'light' | 'dark';
}

const validate = ({
    username,
    password,
}: Record<keyof Omit<ErrorFields, 'response'>, string>): ErrorFields => {
    const result: ErrorFields = {};
    if (username === '') {
        result.username = i18n('alert_username-empty');
    }

    if (password === '') {
        result.password = i18n('alert_password-empty');
    }

    return result;
};

const DEFAULT_LOGIN_FORM = {
    get TITLE() {
        return i18n('title_welcome');
    },
    get TEXT() {
        return i18n('context_welcome-text');
    },
};

function LoginForm({theme}: Props) {
    const dispatch = useDispatch();
    const [username, setUsername] = useState(ytLocalStorage.get('loginDialog')?.username || '');
    const allowOAuth = useSelector(getOAuthEnabled);
    const buttonLabel = useSelector(getOAuthButtonLabel);
    const ytAuthCluster = useSelector(selectGlobalYTAuthCluster) ?? '';
    const ytAuthClusterConfig = useSelector(() => getClusterConfigByName(ytAuthCluster));
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = React.useState<ErrorFields>({});

    const handleFormSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setErrors({});
            const validationErrors = validate({username, password});
            if (!isEmpty_(validationErrors)) {
                setErrors(validationErrors);
                return;
            }
            setLoading(true);
            authorize({username, password, ytAuthCluster})
                .then(async () => {
                    ytLocalStorage.set('loginDialog', {username});
                    dispatch(onSuccessLogin(username));
                })
                .catch((error: AxiosError<Error>) => {
                    if (error.response && error.response.data && error.response.data.message) {
                        setErrors({
                            response: error.response.data.message,
                        });
                    } else {
                        setErrors({response: error.message});
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [username, password, dispatch],
    );

    const {text, title} = ytAuthClusterConfig.loginPageSettings || {};

    return (
        <>
            <h1
                className={block('title')}
                dangerouslySetInnerHTML={{
                    __html: title === undefined ? DEFAULT_LOGIN_FORM.TITLE : title,
                }}
            />
            <p
                className={block('text')}
                dangerouslySetInnerHTML={{
                    __html: text === undefined ? DEFAULT_LOGIN_FORM.TEXT : text,
                }}
            />
            <form onSubmit={handleFormSubmit}>
                <TextInput
                    className={block('field')}
                    type="text"
                    size="l"
                    placeholder={i18n('field_login')}
                    name="username"
                    value={username}
                    onUpdate={setUsername}
                    error={errors.username}
                    qa="login-form:user"
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder={i18n('field_password')}
                    name="password"
                    value={password}
                    onUpdate={setPassword}
                    error={errors.password}
                    qa="login-form:password"
                />

                <Button
                    className={block('button', {solid: true, submit: true})}
                    type="submit"
                    width="max"
                    size="l"
                    pin="circle-circle"
                    view={theme === 'light' ? 'action' : 'normal-contrast'}
                    loading={loading}
                    qa="login-form:submit"
                >
                    {i18n('action_login')}
                </Button>

                {allowOAuth && (
                    <Button
                        className={block('button', {solid: true, link: true, submit: true})}
                        type="submit"
                        href="/oauth/login"
                        width="max"
                        size="l"
                        pin="circle-circle"
                        view={theme === 'light' ? 'action' : 'normal-contrast'}
                        loading={loading}
                    >
                        {buttonLabel || i18n('action_login-via-sso')}
                    </Button>
                )}

                {errors.response && (
                    <Text as={'p' as const} color="danger" className={block('error')}>
                        {errors.response}
                    </Text>
                )}
            </form>
        </>
    );
}

function authorize({
    username,
    password,
    ytAuthCluster,
}: {
    username: string;
    password: string;
    ytAuthCluster: string;
}) {
    return axios.post(`/api/yt/${ytAuthCluster}/login`, {
        username,
        password,
    });
}

export function LoginFormPage({theme}: Props) {
    return (
        <LoginPageWrapper theme={theme}>
            <LoginForm theme={theme} />
        </LoginPageWrapper>
    );
}
