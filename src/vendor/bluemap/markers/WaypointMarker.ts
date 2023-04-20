import { Object3D } from "three";

import { CSS2DObject } from "../util/CSS2DRenderer";

import type { Waypoint } from "~/types";

export class WaypointMarker extends Object3D {
  elementObject: CSS2DObject;
  constructor(waypoint: Waypoint, onClick: () => void) {
    super();

    this.position.x = waypoint.xCoord;
    this.position.y = waypoint.yCoord;
    this.position.z = waypoint.zCoord;

    const element = document.createElement("div");
    const child = document.createElement("div");
    element.appendChild(child);
    child.style.pointerEvents = "auto";
    child.textContent = waypoint.name;
    child.addEventListener("click", onClick);
    this.elementObject = new CSS2DObject(child);
    this.add(this.elementObject);
  }
}
