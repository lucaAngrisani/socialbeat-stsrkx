import { Coord } from './coord';
import { Room } from './room';

export interface RoomExt extends Room {
  visitedN?: boolean;
  visitedS?: boolean;
  visitedE?: boolean;
  visitedW?: boolean;

  coord?: Coord;
}
