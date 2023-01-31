import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Link from '../../../../components/Link/Link';

import './VersionCell.scss';
import {useDispatch} from 'react-redux';
import {changeVersionStateTypeFilters} from '../../../../store/actions/components/versions/version_v2-ts';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

const block = cn('version-cell');

function shortHash(version: string) {
    const tildaIndex = _.indexOf(version, '~');
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
    return (
        <React.Fragment>
            <Link className={block('text')} theme={'primary'} onClick={handleClick}>
                {versionContent}
            </Link>
            <ClipboardButton text={version} view="flat-secondary" size="s" title={'Copy version'} />
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
