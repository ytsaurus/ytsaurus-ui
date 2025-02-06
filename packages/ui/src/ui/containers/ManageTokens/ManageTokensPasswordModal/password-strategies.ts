import axios from 'axios';
import {sha256} from '../../../utils/sha256';

type PasswordStrategy = (password: string) => Promise<string>;

const regularPasswordStrategy = (username: string, ytAuthCluster: string) => {
    return async (password: string): Promise<string> => {
        const hashedPassword = await sha256(password);
        await axios.post(`/api/yt/${ytAuthCluster}/login`, {
            username,
            password,
        });

        return hashedPassword;
    };
};

const sha256PasswordStrategy = () => {
    return async (sha256Password: string): Promise<string> => {
        return sha256Password;
    };
};

export function createPasswordStrategy(
    username: string,
    ytAuthCluster: string,
    isSha256Mode: boolean,
): PasswordStrategy {
    return isSha256Mode
        ? regularPasswordStrategy(username, ytAuthCluster)
        : sha256PasswordStrategy();
}
