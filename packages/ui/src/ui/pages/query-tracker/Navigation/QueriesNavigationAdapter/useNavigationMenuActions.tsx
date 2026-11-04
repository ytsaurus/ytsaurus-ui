import type {NavigationAction} from '@gravity-ui/querieskit';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {useNavigationNodeActions} from '../useNavigationNodeActions';
import {useNavigationQueryActions} from '../useNavigationQueryActions';
import {type QueryNavigationNode, getNavigationQueryEngines} from '../helpers/queryActions';
import rowI18n from '../NodeList/NodeListRow/i18n';
import i18n from './i18n';

export function useNavigationMenuActions() {
    const {engine, disabled, createQuery, insertPath, insertSelect, copyPath, modal} =
        useNavigationQueryActions();
    const {handleClipboardCopy, handleNewWindowOpen} = useNavigationNodeActions();
    const getMenuActions = (node: QueryNavigationNode): NavigationAction<unknown>[] => {
        const engines = getNavigationQueryEngines(node);
        const actions: NavigationAction<unknown>[] = [
            {
                id: 'copy-path',
                title: i18n('action_copy-query-path'),
                content: null,
                onClick: () => {
                    copyPath(node.path);
                },
            },
            {
                id: 'insert-path',
                title: i18n('action_insert-path'),
                content: null,
                onClick: () => {
                    return insertPath(node.path);
                },
            },
            {
                id: 'insert-select',
                title: i18n('action_insert-select'),
                content: null,
                hidden: !engines.includes(engine),
                onClick: () => {
                    return insertSelect(node);
                },
            },
            ...engines.map((nextEngine) => ({
                id: 'create-' + nextEngine,
                title: i18n('action_create-query', {
                    engine: nextEngine === QueryEngine.YT_QL ? 'YT QL' : nextEngine.toUpperCase(),
                }),
                content: null,
                onClick: () => createQuery(node, nextEngine),
            })),
            {
                id: 'copy-link',
                title: rowI18n('action_copy-link'),
                content: null,
                onClick: () => handleClipboardCopy(node.path),
            },
            {
                id: 'open',
                title: rowI18n('action_open-in-cluster'),
                content: null,
                onClick: () => handleNewWindowOpen(node.path),
            },
        ];
        return actions.map((action) => ({...action, disabled}));
    };
    return {getMenuActions, modal};
}
