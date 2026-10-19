import {HttpResponse, delay, http} from 'msw';

const getPattern = /\/api\/v4\/get(?:\?.*)?$/;

export const accountEditorHandlers = [
    http.all(getPattern, async ({request}) => {
        const encoded = Array.from(request.headers.entries())
            .filter(([name]) => name.startsWith('x-yt-parameters-'))
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([, chunk]) => chunk)
            .join('');
        const {path} = encoded ? JSON.parse(atob(encoded)) : {};
        if (path === '//sys/accounts/account/@path') {
            return HttpResponse.json({value: '//sys/account_tree/account'});
        }
        if (path === '//sys/account_tree/account') {
            return HttpResponse.json({
                value: {$attributes: {parent_name: 'root'}, $value: {}},
            });
        }
        return HttpResponse.json({value: null});
    }),
];

export const accountEditorLoadingHandlers = [
    http.all(getPattern, async () => {
        await delay('infinite');
        return HttpResponse.json({value: null});
    }),
];
