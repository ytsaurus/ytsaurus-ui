import React, {useCallback, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {onSuccessLogin} from '../../../store/actions/global';
import ytLocalStorage from '../../../utils/yt-local-storage';
import {
    getClusterConfigByName,
    getGlobalYTAuthCluster,
    getOAuthButtonLabel,
    getOAuthEnabled,
} from '../../../store/selectors/global';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import LoginPageWrapper from '../LoginPageWrapper/LoginPageWrapper';
import isEmpty_ from 'lodash/isEmpty';

import cn from 'bem-cn-lite';

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
        result.username = 'Username must not be empty';
    }

    if (password === '') {
        result.password = 'Password must not be empty';
    }

    return result;
};

const DEFAULT_LOGIN_FORM_TITLE = 'Welcome to YTsaurus!';

const DEFAULT_LOGIN_FORM_TEXT = `A unified scalable platform for storing and processing large volumes of data.
<br />
<br />
Login under your credentials.`;

function LoginForm({theme}: Props) {
    const dispatch = useDispatch();
    const [username, setUsername] = useState(ytLocalStorage.get('loginDialog')?.username || '');
    const allowOAuth = useSelector(getOAuthEnabled);
    const buttonLabel = useSelector(getOAuthButtonLabel);
    const ytAuthCluster = useSelector(getGlobalYTAuthCluster) ?? '';
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
                    __html: title === undefined ? DEFAULT_LOGIN_FORM_TITLE : title,
                }}
            />
            <p
                className={block('text')}
                dangerouslySetInnerHTML={{
                    __html: text === undefined ? DEFAULT_LOGIN_FORM_TEXT : text,
                }}
            />
            <form onSubmit={handleFormSubmit}>
                <TextInput
                    className={block('field')}
                    type="text"
                    size="l"
                    placeholder="Login"
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
                    placeholder="Password"
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
                    Login
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
                        {buttonLabel || 'Login via SSO'}
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
