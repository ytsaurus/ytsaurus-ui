import throttle from "lodash/throttle";
import debounce from "lodash/debounce";

const cancelFns = new WeakMap<Promise<unknown>, () => void>();

export { debounce, throttle };

export function debounced(ms: number): MethodDecorator {
  return function decorate(_target: unknown, _propertyKey: unknown, descriptor: PropertyDescriptor): void {
    descriptor.value = debounce(descriptor.value, ms);
  };
}

export function throttled(ms: number): MethodDecorator {
  return function decorate(_target: unknown, _propertyKey: unknown, descriptor: PropertyDescriptor): void {
    descriptor.value = throttle(descriptor.value, ms);
  };
}

export function delay(ms: number): Promise<void> {
  let timerId: number;

  const result = new Promise<void>((resolve) => {
    timerId = (setTimeout(resolve, ms) as unknown) as number;
  });

  cancelFns.set(result, (): void => clearTimeout(timerId!));

  return result;
}

export function nextFrame(): Promise<void> {
  let requestId: number;

  const result = new Promise<void>((resolve) => {
    requestId = requestAnimationFrame(() => resolve());
  });

  cancelFns.set(result, (): void => cancelAnimationFrame(requestId));

  return result;
}

export function microtask(): Promise<void> {
  let isCancelled = false;

  const result = new Promise<void>((resolve) => {
    if (!isCancelled) {
      resolve();
    }
  });

  cancelFns.set(result, (): void => {
    isCancelled = true;
  });

  return result;
}

export function cancel(promise: Promise<unknown>): void {
  const cancelFn = cancelFns.get(promise);

  if (cancelFn) {
    cancelFn();
    cancelFns.delete(promise);
  }
}
