import { Component, Input, OnInit } from '@angular/core';
import { Coord } from './models/coord';
import { Obj } from './models/obj';
import { Room } from './models/room';
import { RoomExt } from './models/roomExt';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /**
   * Define 3 input properties needed
   */
  @Input('jsonInput') jsonInput: string =
    '{"rooms": [{ "id": 1, "name": "Hallway", "north": 2, "east":7, "objects": [] },{ "id": 2, "name": "Dining Room", "north": 5, "south": 1, "west": 3,"east": 4, "objects": [] },{ "id": 3, "name": "Kitchen","east":2, "objects": [ { "name": "Knife"} ] },{ "id": 4, "name": "Sun Room","west":2, "north":6, "south":7,"objects": [] },{ "id": 5, "name": "Bedroom","south":2, "east":6, "objects": [{"name": "Pillow" }] },{ "id": 6, "name": "Bathroom","west":5, "south":4, "objects": [] },{ "id": 7, "name": "Living room","west":1, "north":4, "objects": [{"name": "Potted Plant" }] }]}';

  @Input('idToStart') idToStart: number = 4;

  @Input('objToFind') objToFindInput: string = '[{ "name": "Pillow" },{ "name": "Knife" },{ "name": "Potted Plant" }]';

  /**
   * Define other utility properties
   */
  map: Room[][] = [];
  rooms: RoomExt[] = [];

  coord: Coord = { x: 0, y: 0 };
  minCoord: Coord = { x: 0, y: 0 };
  maxCoord: Coord = { x: 0, y: 0 };

  objToFind: Obj[] = [];
  objFound: Obj[] = [];

  err: {value: boolean, message?: string } = { value: false };

  submitted: boolean = false;

  path: Room[] = [];

  ngOnInit() {
    //On init event generate output with current input
    this.generateOutput();
  }

  generateOutput() {
    //need to try/catch JSON.parse to avoid parseError
    try {
      this.err.value = false;
      this.submitted = true;
      let jsonParsed: { rooms: Room[] } = JSON.parse(this.jsonInput);
      this.objToFind = JSON.parse(this.objToFindInput);

      this.rooms = jsonParsed.rooms;
      return this.start();
    } catch {
      this.err.value = true;
      this.err.message = "Invalid JSON input"
    }
  }

  async start() {
    if(this.integrityCheck() && this.startCheck() && this.objCheck()){
      this.restartProperties();
      await this.detectRoom(this.rooms.find(room => room.id == this.idToStart));
      this.generateMap();
      return this.path;
    }
  }

  restartProperties() {
      this.path = [];
      this.map = [];
      this.objFound = [];
      this.coord = { x: 0, y: 0 };
      this.maxCoord = { x: 0, y: 0 };
      this.minCoord = { x: 0, y: 0 };
  }

  selectRoom(index: number): RoomExt {
    return this.rooms.find(room => room.id == index);
  }

  async detectRoom(room: RoomExt) {
    if (this.objFound.length == this.objToFind.length) return;

    let objFoundInRoom: Obj[] = [];
    for (let obj of room.objects) {
      if (
        this.objToFind.find(object => object.name == obj.name) &&
        !this.objFound.find(object => object.name == obj.name)
      ) {
        this.objFound.push(obj);
        objFoundInRoom.push(obj);
      }
    }

    let roomCopy = {...room};
    roomCopy.objects = objFoundInRoom;
    this.path.push(roomCopy);

    room.coord = room.coord ? room.coord : { ...this.coord };

    if (this.objFound.length == this.objToFind.length) return;

    let roomN: RoomExt = this.selectRoom(room.north);
    let roomS: RoomExt = this.selectRoom(room.south);
    let roomE: RoomExt = this.selectRoom(room.east);
    let roomW: RoomExt = this.selectRoom(room.west);

    //Direction proiority: N->S->W->E
    if (roomN && roomN.name && this.checkRoomToVisited(room,room.visitedN)) {
      room.visitedN = true;
      this.manageCoord(0,-1);
      this.detectRoom(roomN);
    }
    else if (roomS && roomS.name && this.checkRoomToVisited(room,room.visitedS)) {
      room.visitedS = true;
      this.manageCoord(0,1);
      this.detectRoom(roomS);
    }
    else if (roomW && roomW.name && this.checkRoomToVisited(room,room.visitedW)) {
      room.visitedW = true;
      this.manageCoord(-1,0);
      this.detectRoom(roomW);
    }
    else if (roomE && roomE.name && this.checkRoomToVisited(room,room.visitedE)) {
      room.visitedE = true;
      this.manageCoord(1,0);
      this.detectRoom(roomE);
    }
  }

  manageCoord(varX: number, varY: number) {
    this.coord.x += varX;
    this.coord.y += varY;
    this.maxCoord.x = this.maxCoord.x > this.coord.x ? this.maxCoord.x : this.coord.x;
    this.minCoord.x = this.minCoord.x < this.coord.x ? this.minCoord.x : this.coord.x;
    this.maxCoord.y = this.maxCoord.y > this.coord.y ? this.maxCoord.y : this.coord.y;
    this.minCoord.y = this.minCoord.y < this.coord.y ? this.minCoord.y : this.coord.y;
  }

  /**
   * Generate visual Map of path. If objToFind are found before walk into a room, it's not show
   */
  generateMap() {
    let lengthY = Math.abs(this.maxCoord.y - this.minCoord.y) + 1;
    let lengthX = Math.abs(this.maxCoord.x - this.minCoord.x) + 1;

    for (let i = 0; i < lengthY; i++) {
      this.map[i] = [];
      for (let k = 0; k < lengthX; k++) {
        this.map[i][k] = {};
      }
    }

    this.rooms.forEach(room => {
      room.coord = room.coord || {x: 0, y: 0};
      room.coord.x += Math.abs(this.minCoord.x);
      room.coord.y += Math.abs(this.minCoord.y);
      this.map[room.coord.y][room.coord.x] = room;
    });
  }

  /**
   * Check if json in input is a valid JSON to map
   */
  integrityCheck(): boolean {
    let check: boolean = true;
    //Check if a direction (i.e. north, south, east, west) in a room exist => room in that direction contain opposite ref (north<->south, east<->west) to initial room 
    this.rooms.forEach(room => {
      if(room.east && !(this.rooms.find(r => r.id == room.east)?.west == room.id))
        check = false;
      if(room.west && !(this.rooms.find(r => r.id == room.west)?.east == room.id))
        check = false;
      if(room.south && !(this.rooms.find(r => r.id == room.south)?.north == room.id))
        check = false;
      if(room.north && !(this.rooms.find(r => r.id == room.north)?.south == room.id))
        check = false;
    })

    this.err.value = !check;
    this.err.message = "Map is not valid";

    return check;
  }

  /**
   * Check if starting position is a valid one
   */
  startCheck(): boolean {
    let room: Room = this.rooms.find(room => room.id == this.idToStart);
    let check: boolean = room != null && room != undefined;
    
    this.err.value = !check;
    this.err.message = "Start position is not valid";

    return check;
  }

  /**
   * Check if json in input is a valid JSON to objecto to collect
   */
  objCheck(): boolean {
    let check: boolean = true;

    for(let obj of this.objToFind) {
      let objF: boolean = false;
      for(let room of this.rooms) {
        if(room.objects.find(object => object.name == obj.name))
          objF = true;
      }
      if(!objF)
        check = false;
    }

    this.err.value = !check;
    this.err.message = "Objects to find are not valid";

    return check;
  }

  /**
   * Check if room is completely visited
   */
  checkRoomToVisited(room: RoomExt, visitedDir: boolean) {
    let check: boolean = true;

    if(room.north && !room.visitedN)
      check = false;
    if(room.south && !room.visitedS)
      check = false;
    if(room.east && !room.visitedE)
      check = false;
    if(room.west && !room.visitedW)
      check = false;

    return !visitedDir || check;
  }
}
