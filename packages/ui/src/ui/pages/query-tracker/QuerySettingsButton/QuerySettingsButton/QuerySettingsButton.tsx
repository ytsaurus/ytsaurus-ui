import {Button, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {type FC, useMemo, useRef} from 'react';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import GearDotIcon from '@gravity-ui/icons/svgs/gear-dot.svg';
import './QuerySettingsButton.scss';
import {PopupWithCloseButton} from '../PopupWithCloseButton';
import i18n from './i18n';
import {useToggle} from 'react-use';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {QuerySettings} from '../QuerySettings';
import {SpytSettings} from '../SpytSettings/SpytSettings';
import {type DraftQuery} from '../../../../types/query-tracker/api';

const block = cn('query-settings-popup');

type Props = {
    className?: string;
    popupClassName?: string;
    onChange: (settings: DraftQuery['settings']) => void;
    settings?: DraftQuery['settings'];
    engine: QueryEngine;
};

export const QuerySettingsButton: FC<Props> = ({
    settings,
    engine,
    className,
    popupClassName,
    onChange,
}) => {
    const [opened, toggleOpened] = useToggle(false);
    const ref = useRef(null);

    const count = useMemo(() => {
        return settings ? Object.keys(settings).length : 0;
    }, [settings]);
    const isSpyt = engine === QueryEngine.SPYT;

    const handleSpytChange = (newSettings: NonNullable<DraftQuery['settings']>) => {
        onChange(newSettings);
        toggleOpened();
    };

    return (
        <>
            <Button
                className={className}
                onClick={toggleOpened}
                ref={ref}
                view={opened ? 'outlined-info' : 'outlined'}
                selected={opened}
                size="l"
            >
                <Icon data={count ? GearDotIcon : GearIcon} size={16} />
            </Button>
            <PopupWithCloseButton
                anchorRef={ref}
                open={opened}
                className={block(null, popupClassName)}
                onClose={toggleOpened}
                showCloseButton={!isSpyt}
            >
                <div className={block('header')}>
                    <Text variant="subheader-3">{i18n('title_settings')} </Text>
                    {count > 0 && (
                        <Text variant="subheader-3" color="secondary">
                            {count}
                        </Text>
                    )}
                </div>
                {isSpyt ? (
                    <SpytSettings
                        settings={settings}
                        onChange={handleSpytChange}
                        onCancel={toggleOpened}
                    />
                ) : (
                    <QuerySettings settings={settings} onChange={onChange} />
                )}
            </PopupWithCloseButton>
        </>
    );
};
