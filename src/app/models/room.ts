import { Obj } from './obj';

export interface Room {
  id?: number;
  name?: string;
  north?: number; //referring to a connected room
  south?: number; //referring to a connected room
  west?: number; //referring to a connected room
  east?: number; //referring to a connected room
  objects?: Obj[]; //of Objects
}
