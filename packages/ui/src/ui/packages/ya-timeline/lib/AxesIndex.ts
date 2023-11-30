import { TimelineAxis } from "../components/Axes";

export class AxesIndex<Axis extends TimelineAxis = TimelineAxis> {
  constructor(axes: Axis[] = [], options?: { identityFunction?: (axis: Axis) => string }) {
    this.axes = axes;

    if (options && options.identityFunction) {
      this.getIdentity = options.identityFunction;
    }
  }

  public getIdentity(axis: Axis): string {
    return axis.id;
  }

  public set axes(newAxes: Axis[]) {
    if (newAxes !== this._axes) {
      this._axes = newAxes;
      this._sortedAxes = undefined;
      this._axesById = undefined;
    }
  }

  public get axes(): Axis[] {
    return this._axes;
  }

  public get sortedAxes(): Axis[] {
    if (!this._sortedAxes) {
      this._sortedAxes = this._axes.slice().sort((a, b) => {
        return a.top - b.top;
      });
    }

    return this._sortedAxes;
  }

  public get axesById(): Record<string, Axis> {
    if (!this._axesById) {
      this._axesById = this._axes.reduce((memo, axis) => {
        memo[this.getIdentity(axis)] = axis;
        return memo;
      }, {} as Record<string, Axis>);
    }

    return this._axesById;
  }

  private _axes: Axis[] = [];

  private _sortedAxes: Axis[] | undefined;

  private _axesById: Record<string, Axis> | undefined;
}
