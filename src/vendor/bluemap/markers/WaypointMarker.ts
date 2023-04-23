import { Marker } from "./Marker";
import { CSS2DObject } from "../util/CSS2DRenderer";
import {
  WaypointTypeBuildingHTML,
  WaypointTypeFarmHTML,
  WaypointTypePortalHTML,
} from "~/components/Icons";

import type { WaypointType } from "@prisma/client";
import type { Waypoint } from "~/types";
const WaypointTypeToHTML: Record<WaypointType, string> = {
  PRIVATE_BUILDING: WaypointTypeBuildingHTML,
  PUBLIC_BUILDING: WaypointTypeBuildingHTML,
  PRIVATE_FARM: WaypointTypeFarmHTML,
  PUBLIC_FARM: WaypointTypeFarmHTML,
  PORTAL: WaypointTypePortalHTML,
  POINT_OF_INTEREST: WaypointTypePortalHTML,
  OTHER: WaypointTypePortalHTML,
};

const WaypointTypeToClassName: Record<WaypointType, string> = {
  PRIVATE_BUILDING: "building",
  PUBLIC_BUILDING: "building",
  PRIVATE_FARM: "farm",
  PUBLIC_FARM: "farm",
  PORTAL: "portal",
  POINT_OF_INTEREST: "poi",
  OTHER: "misc",
};

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
        ${WaypointTypeToHTML[waypoint.waypointType]}
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
