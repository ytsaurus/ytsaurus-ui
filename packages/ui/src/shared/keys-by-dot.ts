type Join<F, S> = F extends ''
    ? S
    : F extends string
      ? S extends string
          ? `${F}.${S}`
          : never
      : S;

type ValueOf<T> = T[keyof T];

type Key1<T> = T extends object ? keyof T : never;
type Key2<T> = ValueOf<{
    [K1 in keyof T]: Join<K1, Key1<T[K1]>>;
}>;
type Key3<T> = ValueOf<{
    [K1 in keyof T]: ValueOf<{
        [K2 in keyof T[K1]]: Join<K1, Join<K2, Key1<T[K1][K2]>>>;
    }>;
}>;
type Key4<T> = ValueOf<{
    [K1 in keyof T]: ValueOf<{
        [K2 in keyof T[K1]]: ValueOf<{
            [K3 in keyof T[K1][K2]]: Join<K1, Join<K2, Join<K3, Key1<T[K1][K2][K3]>>>>;
        }>;
    }>;
}>;
type Key5<T> = ValueOf<{
    [K1 in keyof T]: ValueOf<{
        [K2 in keyof T[K1]]: ValueOf<{
            [K3 in keyof T[K1][K2]]: ValueOf<{
                [K4 in keyof T[K1][K2][K3]]: Join<
                    K1,
                    Join<K2, Join<K3, Join<K4, Key1<T[K1][K2][K3][K4]>>>>
                >;
            }>;
        }>;
    }>;
}>;

export type KeysByDot<T> = Exclude<Key1<T> | Key2<T> | Key3<T> | Key4<T> | Key5<T>, undefined>;

/**
 * Do not remove the funciont it is removed from chunks by tree shaking
 * @returns {void}
 */
export function keyByDotDemo() {
    type State = {
        f1: {
            f2: {
                f3: {
                    f4: 2;
                };
            };
        };
        f2: {
            f3: {
                f4: {
                    f5: 1;
                };
                f4_2: {
                    f5: 3;
                    f5_2: {
                        f6: 'bar';
                        f6_2: {
                            f7: 1;
                        };
                    };
                };
            };
        };
        f3?: {f4?: number};
    };

    const a1: KeysByDot<State> = 'f1';
    const a2: KeysByDot<State> = 'f1.f2';
    const a3: KeysByDot<State> = 'f1.f2.f3';
    const a4: KeysByDot<State> = 'f1.f2.f3.f4';
    const a5: KeysByDot<State> = 'f2.f3.f4_2.f5_2.f6';
    const b1: KeysByDot<State> = 'f2';
    const b2: KeysByDot<State> = 'f2.f3';
    const b3: KeysByDot<State> = 'f2.f3.f4';
    const b4: KeysByDot<State> = 'f2.f3.f4.f5';
    const b5: KeysByDot<State> = 'f2.f3.f4_2.f5';
    const b6: KeysByDot<State> = 'f2.f3.f4_2.f5_2.f6_2';
    console.log(a1, a2, a3, a4, a5, b1, b2, b3, b4, b5, b5, b6);

    // Missing keys should generate compile error
    // @ts-expect-error
    const e0: KeysByDot<State> = undefined;
    // @ts-expect-error
    const ea1: KeysByDot<State> = 'f1_missing';
    // @ts-expect-error
    const ea2: KeysByDot<State> = 'f1.f3';
    // @ts-expect-error
    const ea3: KeysByDot<State> = 'f1.f2.f4';
    // @ts-expect-error
    const ea4: KeysByDot<State> = 'f1.f2.f3.f5';
    // @ts-expect-error
    const ea5: KeysByDot<State> = 'f2.f3.f4_2.f5_2.f6_missing';
    // @ts-expect-error
    const eb1: KeysByDot<State> = 'f2.f2';
    // @ts-expect-error
    const eb2: KeysByDot<State> = 'f2.f3.f3';
    // @ts-expect-error
    const eb3: KeysByDot<State> = 'f2.f3.f4.f4';
    // @ts-expect-error
    const eb4: KeysByDot<State> = 'f2.f3.f4_2.f5_missing';
    // @ts-expect-error
    const eb5: KeysByDot<State> = 'f2.f3.f4_2.f5_2.f6_2_missing';
    console.log(e0, ea1, ea2, ea3, ea4, ea5, eb1, eb2, eb3, eb4, eb5);
}
