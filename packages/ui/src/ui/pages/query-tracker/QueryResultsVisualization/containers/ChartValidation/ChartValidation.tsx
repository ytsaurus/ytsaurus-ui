import * as React from 'react';
import {useState} from 'react';
import {useSelector} from 'react-redux';
import type {AlertProps} from '@gravity-ui/uikit';
import {Alert, Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {resultsPlaceholdersValidation} from '../../store/selectors';
import {CircleExclamation as CircleExclamationIcon} from '@gravity-ui/icons';

import './ChartValidation.scss';

const b = block('chart-validation');

const Msg = () => (
    <span
        dangerouslySetInnerHTML={{
            __html: 'Your data contains duplicate values for one or more points. </br> This can lead to incorrect graph plotting. Please ensure that each point has a unique value.',
        }}
    />
);

const ALERT_PROPS = {
    title: 'Duplicate Values',
    theme: 'warning' as AlertProps['theme'],
    message: <Msg />,
    icon: (
        <Icon className={b('field-icon', {invalid: true})} data={CircleExclamationIcon} size={16} />
    ),
};

export const ChartValidation: React.FC<React.PropsWithChildren<{}>> = ({children}) => {
    const [isErrorHidden, hideError] = useState(false);
    const placeholdersValidation = useSelector(resultsPlaceholdersValidation);
    const hasError = placeholdersValidation?.x?.invalid || placeholdersValidation?.y?.invalid;
    const showBigAlert = hasError && !isErrorHidden;
    const showSmallAlert = isErrorHidden;

    if (showBigAlert) {
        return (
            <div className={b()}>
                <Alert
                    {...ALERT_PROPS}
                    actions={
                        <Alert.Actions>
                            <Button onClick={() => hideError(true)}>Show chart</Button>
                        </Alert.Actions>
                    }
                />
            </div>
        );
    }

    if (showSmallAlert) {
        return (
            <>
                <div className={b('alert')}>
                    <Alert {...ALERT_PROPS} />
                </div>
                {children}
            </>
        );
    }

    return children;
};
