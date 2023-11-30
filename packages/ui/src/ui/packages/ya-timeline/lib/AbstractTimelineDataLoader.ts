import {rangeToRangeIntersect} from "../../math";
import {ContinuousRange} from "./Range";
import {noop} from "./utils";

export enum RegionState {
  CREATED = "CREATED",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export type Region = {
  time: ContinuousRange;
  state: RegionState;
  lastVisited: number;
  retries: number;
};

export type TimelineRegionsManagerOptions<R extends Region> = {
  maxRetries?: number;
  processInterval?: number;
  maxParallelism?: number;

  onRegionsChanged?: (regions: R[]) => void;
  onRegionProcessed?: (region: R) => void;
  onRegionProcessingFailed?: (region: R, error: Error) => void;
};

export abstract class AbstractTimelineDataLoader<T extends Region = Region> {
  constructor(options: TimelineRegionsManagerOptions<T> = {}) {
    Object.assign(this, options);
  }

  public getRegions(): T[] {
    return this.regions;
  }

  public getVisibleRegions(): T[] {
    const visibleRegions: T[] = [];
    for (const region of this.regions) {
      if (rangeToRangeIntersect(this.timeRange.from, this.timeRange.to, region.time.from, region.time.to)) {
        visibleRegions.push(region);
      }
    }
    return visibleRegions;
  }

  public set timeRange(viewport: ContinuousRange) {
    this._timeRange = viewport;

    const visibleRegions = this.getVisibleRegions();

    const regionsToAdd: T[] = this.timeRange
      .subtract(...visibleRegions.filter((r) => r.state !== RegionState.CREATED).map((r) => r.time))
      .map((r) => this.createRegion(r) as T);

    this.updateRegions(
      regionsToAdd,
      visibleRegions.filter((r) => r.state === RegionState.CREATED)
    );
  }

  public get timeRange(): ContinuousRange {
    return this._timeRange;
  }

  public get isActive() {
    return !!this.processTimerId;
  }

  public startProcessing() {
    this.processTimerId = self.setInterval(() => {
      if (this.parallelism <= this.maxParallelism) {
        this.processRegions();
      }
    }, this.processInterval);
  }

  public stopProcessing() {
    clearInterval(this.processTimerId);
    this.processTimerId = undefined;
  }

  public clear() {
    this.regions = [];
  }

  protected createRegion(time: ContinuousRange): Region {
    return {
      time: time.clone().align(1000),
      state: RegionState.CREATED,
      lastVisited: Date.now(),
      retries: 0,
    } as T;
  }

  protected abstract processRegion(region: Readonly<T>): Promise<void>;

  protected isValidRegion(region: T) {
    return region.time.from < region.time.to;
  }

  protected updateRegions(regionsToAdd: T[] = [], regionsToRemove: T[] = []) {
    let isSetChanged = false;

    if (regionsToRemove && regionsToRemove.length) {
      this.regions = this.regions.filter((region) => !regionsToRemove.includes(region));
      isSetChanged = true;
    }

    if (regionsToAdd && regionsToAdd.length) {
      this.regions = this.regions.concat(regionsToAdd.filter((region) => this.isValidRegion(region)));
      isSetChanged = true;
    }

    if (isSetChanged) {
      this.regions.sort((a, b) => a.time.from - b.time.from);
      this.onRegionsChanged(this.regions);
    }
  }

  public setRegionState(region: T, state: RegionState) {
    region.state = state;
    this.onRegionsChanged(this.regions);
  }

  private async processRegions(): Promise<void> {
    this.parallelism += 1;

    const regions = this.getRegions();
    let maxTimestamp = -Infinity;
    let regionToLoad: T | null = null;
    const stalledRegions: T[] = [];

    try {
      for (const region of regions) {
        if (rangeToRangeIntersect(region.time.from, region.time.to, this.timeRange.from, this.timeRange.to)) {
          if (region.state === RegionState.CREATED && region.time.from > maxTimestamp) {
            maxTimestamp = region.time.from;
            regionToLoad = region;
          }
        } else if (region.state === RegionState.CREATED) {
          stalledRegions.push(region);
        }
      }

      if (stalledRegions.length > 0) {
        this.updateRegions([], stalledRegions);
      }

      if (regionToLoad) {
        if (regionToLoad.retries >= this.maxRetries) {
          this.setRegionState(regionToLoad, RegionState.FAILED);
        } else {
          this.setRegionState(regionToLoad, RegionState.PROCESSING);

          try {
            await this.processRegion(regionToLoad);
            this.setRegionState(regionToLoad, RegionState.PROCESSED);
            this.onRegionProcessed(regionToLoad);
          } catch (error) {
            console.warn(error);
            regionToLoad.retries += 1;
            this.onRegionProcessingFailed(regionToLoad, error);
            this.setRegionState(regionToLoad, RegionState.CREATED);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to process regions: ", error);
    }

    this.parallelism -= 1;
  }

  protected regions: T[] = [];

  protected _timeRange = new ContinuousRange(0, 0);

  private processTimerId: number | undefined;

  private parallelism = 0;

  private readonly processInterval: number = 500;

  private readonly maxParallelism: number = 2;

  private readonly maxRetries: number = 3;

  private readonly onRegionsChanged: (regions: T[]) => void = noop;

  private readonly onRegionProcessed: (region: T) => void = noop;

  private readonly onRegionProcessingFailed: (region: T, error: unknown) => void = noop;
}
