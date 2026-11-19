import cloneDeepWith_ from 'lodash/cloneDeepWith';

export function normalizeError(error: unknown) {
    if (error instanceof Error) {
        return error;
    }

    if (error !== null && error !== undefined && typeof error !== 'object') {
        return {message: String(error)};
    }

    return cloneDeepWith_(error, (value) => {
        // Yson cannot render undefined fields in UI-side error objects.
        return value === undefined ? null : undefined;
    });
}
