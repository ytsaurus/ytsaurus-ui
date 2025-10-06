import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectBranch,
    selectBranches,
    selectCurrentVcs,
    selectListFilter,
    selectRepositories,
    selectRepository,
    selectShowFilter,
    selectVcsConfig,
} from '../../../../store/selectors/query-tracker/vcs';
import {SelectSingle} from '../../../../components/Select/Select';
import {
    changeCurrentBranch,
    changeCurrentRepository,
    getVcsRepositories,
    getVcsTokensAvailability,
    setLastVcs,
} from '../../../../store/actions/query-tracker/vcs';
import './VcsHeader.scss';
import cn from 'bem-cn-lite';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import {Flex, Icon, TextInput, Tooltip} from '@gravity-ui/uikit';
import {setListFilter} from '../../../../store/reducers/query-tracker/vcsSlice';

const block = cn('vcs-header');

export const VcsHeader: FC = () => {
    const dispatch = useDispatch();
    const config = useSelector(selectVcsConfig);
    const currentVcs = useSelector(selectCurrentVcs);
    const repositories = useSelector(selectRepositories);
    const repository = useSelector(selectRepository);
    const branch = useSelector(selectBranch);
    const branches = useSelector(selectBranches);
    const filter = useSelector(selectListFilter);
    const showFilter = useSelector(selectShowFilter);

    const showRepositories = Object.keys(repositories).length !== 1;

    useEffect(() => {
        dispatch(getVcsTokensAvailability());
        dispatch(setLastVcs());
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
        return config.map((item) => {
            const {id, name, hasToken, auth} = item;
            const showNoToken = auth === 'none' ? false : !hasToken;

            return {
                value: id,
                text: `${name}${showNoToken ? ' [no api token]' : ''}`,
            };
        });
    }, [config]);

    const selectRepoItems = useMemo(() => {
        return Object.keys(repositories).map((key) => ({value: key, text: repositories[key].name}));
    }, [repositories]);

    const selectBranchItems = useMemo(() => {
        return branches.map((item) => {
            if (typeof item === 'object') return item;
            return {value: item};
        });
    }, [branches]);

    const handleUpdateFilter = useCallback(
        (value: string) => {
            dispatch(setListFilter(value));
        },
        [dispatch],
    );

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
            <div className={block('top-menu', {single: !showRepositories})}>
                {showRepositories && (
                    <SelectSingle
                        items={selectRepoItems}
                        value={repository}
                        onChange={handleChangeRepository}
                        disabled={!selectRepoItems.length}
                        placeholder="Select repository"
                        hideClear
                    />
                )}
                <SelectSingle
                    items={selectBranchItems}
                    value={branch}
                    onChange={handleChangeBranch}
                    disabled={!repository}
                    placeholder="Select branch"
                    hideClear
                />
            </div>
            {showFilter && (
                <TextInput
                    onUpdate={handleUpdateFilter}
                    value={filter}
                    placeholder="Filter"
                    hasClear
                />
            )}
        </div>
    );
};
