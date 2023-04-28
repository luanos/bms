import { Marker } from "./Marker";
import { CSS2DObject } from "../util/CSS2DRenderer";
import { WaypointTypeToClassName, WaypointTypeToIconHTML } from "~/config";

import type { WaypointType } from "@prisma/client";
import type { Waypoint } from "~/types";

export class WaypointMarker extends Marker {
  element: HTMLDivElement;
  constructor(waypoint: Waypoint, onClick: () => void, highlight: boolean) {
    super(waypoint.id);
    Object.defineProperty(this, "isWaypointMarker", { value: true });
    this.position.x = waypoint.xCoord;
    this.position.y = waypoint.yCoord;
    this.position.z = waypoint.zCoord;
    const parent = document.createElement("div");
    this.element = document.createElement("div");
    const element = this.element;
    parent.appendChild(element);

    // Customization Start
    element.addEventListener("click", onClick);
    element.classList.add(
      `waypoint-type-${WaypointTypeToClassName[waypoint.waypointType]}`
    );
    if (highlight) element.classList.add("highlight");
    element.innerHTML = `
      <div class="icon-wrapper" data-name="${waypoint.name}">
        ${WaypointTypeToIconHTML[waypoint.waypointType]}
      </div>

    `;
    // Customization End

    const object = new CSS2DObject(element);
    this.add(object);
  }
  dispose() {
    super.dispose();
    this.element.remove();
  }
}
