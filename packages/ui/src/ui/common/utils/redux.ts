export function getSettingBySelector(selector) {
    const state = window.store.getState();
    return selector(state);
}
