// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

export const deleteUser = ({username}: {username: string}): Promise<void> => {
    return yt.v3.remove({
        parameters: {
            path: `//sys/users/${username}`,
        },
    });
};

export const createUser = ({username}: {username: string}): Promise<void> => {
    return yt.v3.create({
        parameters: {
            type: 'user',
            attributes: {
                name: username,
            },
        },
    });
};
