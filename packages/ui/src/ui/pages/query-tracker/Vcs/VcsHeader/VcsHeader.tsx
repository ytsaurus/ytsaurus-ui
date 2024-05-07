import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectBranch,
    selectBranches,
    selectCurrentVcs,
    selectRepositories,
    selectRepository,
    selectVcsConfig,
} from '../../module/vcs/selectors';
import {SelectSingle} from '../../../../components/Select/Select';
import {
    changeCurrentBranch,
    changeCurrentRepository,
    getVcsConfig,
    getVcsRepositories,
} from '../../module/vcs/actions';
import './VcsHeader.scss';
import cn from 'bem-cn-lite';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import {Flex, Icon, Tooltip} from '@gravity-ui/uikit';

const block = cn('vcs-header');

export const VcsHeader: FC = () => {
    const dispatch = useDispatch();
    const config = useSelector(selectVcsConfig);
    const currentVcs = useSelector(selectCurrentVcs);
    const repositories = useSelector(selectRepositories);
    const repository = useSelector(selectRepository);
    const branch = useSelector(selectBranch);
    const branches = useSelector(selectBranches);

    useEffect(() => {
        dispatch(getVcsConfig());
    }, [dispatch]);

    const handleChangeVcs = useCallback(
        (vcsId?: string) => {
            if (vcsId) dispatch(getVcsRepositories(vcsId));
        },
        [dispatch],
    );

    const handleChangeRepository = useCallback(
        (currentRepository?: string) => {
            if (currentRepository) dispatch(changeCurrentRepository(currentRepository));
        },
        [dispatch],
    );

    const handleChangeBranch = useCallback(
        (currentBranch?: string) => {
            if (currentBranch) dispatch(changeCurrentBranch(currentBranch));
        },
        [dispatch],
    );

    const selectVcsItems = useMemo(() => {
        return config.map(({id, name, hasToken}) => ({
            value: id,
            text: `${name}${hasToken ? '' : ' [no api token]'}`,
        }));
    }, [config]);

    const selectRepoItems = useMemo(() => {
        return Object.keys(repositories).map((key) => ({value: key}));
    }, [repositories]);

    const selectBranchItems = useMemo(() => {
        return branches.map((i) => ({value: i}));
    }, [branches]);

    return (
        <div className={block()}>
            <Flex alignItems="center" gap={2}>
                <SelectSingle
                    items={selectVcsItems}
                    value={currentVcs}
                    onChange={handleChangeVcs}
                    placeholder="Select VCS type"
                    hideClear
                />
                <Tooltip content="You can add VCS tokens in the section Settings -> VCS">
                    <Icon data={CircleQuestionIcon} size={16} />
                </Tooltip>
            </Flex>
            <div className={block('top-menu')}>
                <SelectSingle
                    items={selectRepoItems}
                    value={repository}
                    onChange={handleChangeRepository}
                    disabled={!selectRepoItems.length}
                    placeholder="Select repository"
                    hideClear
                />
                <SelectSingle
                    items={selectBranchItems}
                    value={branch}
                    onChange={handleChangeBranch}
                    disabled={!repository}
                    placeholder="Select branch"
                    hideClear
                />
            </div>
        </div>
    );
};
