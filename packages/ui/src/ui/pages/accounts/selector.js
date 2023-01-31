import {computeProgress} from '../../utils/progress';
import {accountMemoryMediumToFieldName} from '../../utils/accounts/accounts-selector';

export default class Account {
    static prepareProgressStack(committed, uncommitted, limit, theme) {
        const sum = uncommitted > 0 ? committed + uncommitted : committed;
        const tmpLimit = Math.max(sum, limit);
        const committedValue = computeProgress(
            uncommitted < 0 ? committed + uncommitted : committed,
            tmpLimit,
        );
        const uncommittedValue = computeProgress(Math.abs(uncommitted), tmpLimit);

        return [
            {
                value: committedValue,
                theme,
            },
            {
                value: uncommittedValue,
            },
        ];
    }

    static GetDataPerMedium(account, mediumType, recursive) {
        if (recursive) {
            const src = account.recursiveResources;
            if (mediumType) {
                return src.perMedium && src.perMedium[mediumType];
            }
        }

        return mediumType ? account.perMedium && account.perMedium[mediumType] : account;
    }

    constructor(accountData) {
        Object.assign(this, accountData.perMedium, accountData.masterMemoryResources, accountData);
    }

    getDiskSpaceProgressInfo(mediumType, recursive) {
        const data = Account.GetDataPerMedium(this, mediumType, recursive);
        if (!data) {
            return {};
        }

        return {
            committed: data.committedDiskSpace,
            uncommitted: data.uncommittedDiskSpace,
            total: data.totalDiskSpace,
            limit: data.diskSpaceLimit,
            theme: data.diskSpaceProgressTheme,
            progress: data.diskSpaceProgress,
            progressText: data.diskSpaceProgressText,
        };
    }

    getResourceInfoSource(recursive) {
        return recursive && this.hasRecursiveResources ? this.recursiveResources : this;
    }

    getNodeCountProgressInfo(recursive = true) {
        const src = this.getResourceInfoSource(recursive);
        return {
            committed: src.committedNodeCount,
            uncommitted: src.uncommittedNodeCount,
            total: src.totalNodeCount,
            limit: src.nodeCountLimit,
            theme: src.nodeCountProgressTheme,
            progress: src.nodeCountProgress,
            progressText: src.nodeCountProgressText,
        };
    }

    getChunkCountProgressInfo(recursive = true) {
        const src = this.getResourceInfoSource(recursive);
        return {
            committed: src.committedChunkCount,
            uncommitted: src.uncommittedChunkCount,
            total: src.totalChunkCount,
            limit: src.chunkCountLimit,
            theme: src.chunkCountProgressTheme,
            progress: src.chunkCountProgress,
            progressText: src.chunkCountProgressText,
        };
    }

    getTabletCountProgressInfo(recursive = true) {
        const src = this.getResourceInfoSource(recursive);
        return {
            committed: src.committedTabletCount,
            uncommitted: src.uncommittedTabletCount,
            total: src.totalTabletCount,
            limit: src.tabletCountLimit,
            theme: src.tabletCountProgressTheme,
            progress: src.tabletCountProgress,
            progressText: src.tabletCountProgressText,
        };
    }

    getTabletStaticMemoryInfo(recursive = true) {
        const src = this.getResourceInfoSource(recursive);
        return {
            committed: src.committedTabletStaticMemory,
            uncommitted: src.uncommittedTabletStaticMemory,
            total: src.totalTabletStaticMemory,
            limit: src.tabletStaticMemoryLimit,
            theme: src.tabletStaticMemoryProgressTheme,
            progress: src.tabletStaticMemoryProgress,
            progressText: src.tabletStaticMemoryProgressText,
        };
    }

    getMasterMemoryMediumInfo(recursive, mediumType) {
        const src = this.getResourceInfoSource(recursive);
        const field = accountMemoryMediumToFieldName('master_memory/' + mediumType);
        return src[field];
    }
}
