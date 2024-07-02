import React, {FC, useCallback, useMemo} from 'react';
import {VcsListItem} from './VcsListItem';
import cn from 'bem-cn-lite';
import './VcsList.scss';
import {useDispatch} from 'react-redux';
import {removeToken} from '../../module/repoNavigation/actions';
import {VcsConfig} from '../../../../../shared/vcs';

const block = cn('vcs-list');

type Props = {
    config: VcsConfig[];
};

export const VcsList: FC<Props> = ({config}) => {
    const dispatch = useDispatch();

    const handleRemoveToken = useCallback(
        (vcsId: string) => {
            return dispatch(removeToken(vcsId));
        },
        [dispatch],
    );

    const items = useMemo(() => {
        return config.reduce<React.ReactNode[]>((acc, {id, name, token}) => {
            if (token)
                acc.push(
                    <VcsListItem key={id} vcsId={id} name={name} onClick={handleRemoveToken} />,
                );
            return acc;
        }, []);
    }, [config, handleRemoveToken]);

    return (
        <div className={block()}>
            <div>{items}</div>
        </div>
    );
};
