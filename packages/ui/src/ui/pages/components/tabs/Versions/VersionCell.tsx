import React from 'react';
import cn from 'bem-cn-lite';

import indexOf_ from 'lodash/indexOf';

import {Text} from '@gravity-ui/uikit';

import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';

import './VersionCell.scss';
import {useDispatch} from 'react-redux';
import {changeVersionStateTypeFilters} from '../../../../store/actions/components/versions/versions_v2';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import {uiSettings} from '../../../../config/ui-settings';

const block = cn('version-cell');

const {reHashFromNodeVersion} = uiSettings;

function shortHash(version: string) {
    const tildaIndex = indexOf_(version, '~');
    if (-1 === tildaIndex) {
        return version;
    }

    return version.substr(0, tildaIndex + 1) + version.substr(tildaIndex + 1, 16);
}

interface Props {
    version: string;
    onClick: (version: string) => void;
}

function VersionCell(props: Props) {
    const {version, onClick} = props;
    const visibleVersion = shortHash(version);

    const handleClick = React.useCallback(() => {
        onClick(version);
    }, [onClick, version]);

    const versionContent =
        visibleVersion?.length === version?.length ? (
            version
        ) : (
            <Tooltip content={version}>
                <span className={block('tooltip')}>{visibleVersion + '\u2026'} </span>
            </Tooltip>
        );

    const hashPart = React.useMemo(() => {
        if (!version || !reHashFromNodeVersion) {
            return undefined;
        }

        try {
            const res = new RegExp(reHashFromNodeVersion).exec(version);
            return res?.groups?.hash;
        } catch (e) {
            return undefined;
        }
    }, [version]);

    return (
        <React.Fragment>
            <ClickableText className={block('text')} color={'primary'} onClick={handleClick}>
                {versionContent}
            </ClickableText>
            <ClipboardButton
                text={version}
                shiftText={hashPart}
                view="flat-secondary"
                size="s"
                hoverContent={
                    <div>
                        Copy version
                        {Boolean(hashPart) && (
                            <div>
                                <Text color="secondary">Hold SHIFT-key to copy hash</Text>
                            </div>
                        )}
                    </div>
                }
            />
        </React.Fragment>
    );
}

export function VersionCellWithAction(props: Omit<Props, 'onClick'>) {
    const {version} = props;
    const dispatch = useDispatch();

    const onClick = React.useCallback(() => {
        dispatch(changeVersionStateTypeFilters({version}));
    }, [version]);

    return <VersionCell version={version} onClick={onClick} />;
}
