import { TimelineEvent } from "./common";

export type Hitbox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export abstract class AbstractEventRenderer {
  public abstract render(
    ctx: CanvasRenderingContext2D,
    event: TimelineEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
    timeToPosition?: (n: number) => number,
    color?: string
  ): void;

  // .getHitbox is supposed to **mutate** this object.
  // This is done to avoid allocating new objects on every call
  protected hitboxResult: Hitbox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  public abstract getHitbox(event: TimelineEvent, x0: number, x1: number): Hitbox;
}
