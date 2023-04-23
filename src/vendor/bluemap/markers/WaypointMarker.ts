import { Marker } from "./Marker";
import { CSS2DObject } from "../util/CSS2DRenderer";

import type { Waypoint } from "~/types";

export class WaypointMarker extends Marker {
  element: Element;
  constructor(waypoint: Waypoint, onClick: () => void) {
    super(waypoint.id);
    this.position.x = waypoint.xCoord;
    this.position.y = waypoint.yCoord;
    this.position.z = waypoint.zCoord;
    const parent = document.createElement("div");
    this.element = document.createElement("div");
    const element = this.element;
    parent.appendChild(element);
    element.addEventListener("click", onClick);
    element.textContent = waypoint.name;
    const object = new CSS2DObject(element);
    this.add(object);
  }

  dispose() {
    this.element.remove();
  }
}
