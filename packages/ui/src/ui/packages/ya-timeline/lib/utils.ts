export function isMac() {
  return navigator.userAgent.indexOf("Mac OS") !== -1;
}

export function getControlCommandKey(): "meta" | "ctrl" {
  return isMac() ? "meta" : "ctrl";
}

export function checkControlCommandKey(event: MouseEvent | KeyboardEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

export const noop = () => {};
