import {chytApiAction} from '../../../utils/strawberryControllerApi';
import {chytCliqueCreate} from './list';

jest.mock('../../../utils/strawberryControllerApi', () => ({chytApiAction: jest.fn()}));
jest.mock('../../../utils/cancel-helper', () => ({
    __esModule: true,
    default: jest.fn(),
    isCancelled: jest.fn(),
}));
jest.mock('../../../store/selectors/global', () => ({selectCluster: () => 'test-cluster'}));
jest.mock('../../../store/selectors/global/is-developer', () => ({selectIsAdmin: () => false}));
jest.mock('../../../store/selectors/chyt', () => ({selectChytListVisibleColumns: () => []}));
jest.mock('../settings', () => ({setSettingByKey: jest.fn()}));
jest.mock('./i18n', () => ({__esModule: true, default: () => 'Clique created'}));

describe('create CHYT clique resources', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(chytApiAction).mockResolvedValue(undefined);
    });

    it.each([
        {instance_cpu: 8, instance_total_memory: 32 * 1024 ** 3},
        {instance_cpu: undefined, instance_total_memory: undefined},
    ])('sends only explicitly selected resources: %p', async (resources) => {
        await chytCliqueCreate({
            alias: 'test-clique',
            instance_count: 3,
            pool: 'test-pool',
            runAfterCreation: true,
            ...resources,
        })(jest.fn(), jest.fn(), undefined);

        const speclet = jest.mocked(chytApiAction).mock.calls[0][2] as {
            speclet_options: Record<string, unknown>;
        };
        for (const key of ['instance_cpu', 'instance_total_memory'] as const) {
            if (resources[key] === undefined) {
                expect(speclet.speclet_options).not.toHaveProperty(key);
            } else {
                expect(speclet.speclet_options[key]).toBe(resources[key]);
            }
        }
    });
});
