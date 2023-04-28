import {
  WaypointTypeBuilding,
  WaypointTypeBuildingHTML,
  WaypointTypeFarm,
  WaypointTypeFarmHTML,
  WaypointTypeMisc,
  WaypointTypeMiscHTML,
  WaypointTypePOI,
  WaypointTypePOIHTML,
  WaypointTypePortal,
  WaypointTypePortalHTML,
} from "./components/Icons";

import type { WaypointType, WorldType, Visibility } from "@prisma/client";

export const WaypointTypeToDisplayName: Record<WaypointType, string> = {
  PRIVATE_BUILDING: "Bauwerk (Privat)",
  PUBLIC_BUILDING: "Bauwerk (Öffentlich)",
  PRIVATE_FARM: "Farm (Privat)",
  PUBLIC_FARM: "Farm (Öffentlich)",
  PORTAL: "Portal",
  POINT_OF_INTEREST: "Sehenswürdigkeit",
  OTHER: "Sonstiges",
};

export const WorldTypeToDisplayName: Record<WorldType, string> = {
  OVERWORLD: "Oberwelt",
  NETHER: "Nether",
  END: "End",
};

export const VisibilityToDisplayName: Record<Visibility, string> = {
  ALL: "Jeder",
  SELECT: "Ausgewählt",
  PRIVATE: "Nur Ich",
};
export const WorldTypeToBlueMap: Record<WorldType, string> = {
  OVERWORLD: "world",
  NETHER: "world_nether",
  END: "world_the_end",
};

export const BlueMapToWorldType: Record<string, WorldType> = {
  world: "OVERWORLD",
  world_nether: "NETHER",
  world_the_end: "END",
};

export const WaypointTypeToIconComponent: Record<WaypointType, React.FC> = {
  PRIVATE_BUILDING: WaypointTypeBuilding,
  PUBLIC_BUILDING: WaypointTypeBuilding,
  PRIVATE_FARM: WaypointTypeFarm,
  PUBLIC_FARM: WaypointTypeFarm,
  PORTAL: WaypointTypePortal,
  POINT_OF_INTEREST: WaypointTypePOI,
  OTHER: WaypointTypeMisc,
};
export const WaypointTypeToIconHTML: Record<WaypointType, string> = {
  PRIVATE_BUILDING: WaypointTypeBuildingHTML,
  PUBLIC_BUILDING: WaypointTypeBuildingHTML,
  PRIVATE_FARM: WaypointTypeFarmHTML,
  PUBLIC_FARM: WaypointTypeFarmHTML,
  PORTAL: WaypointTypePortalHTML,
  POINT_OF_INTEREST: WaypointTypePOIHTML,
  OTHER: WaypointTypeMiscHTML,
};

export const WaypointTypeToClassName: Record<WaypointType, string> = {
  PRIVATE_BUILDING: "building",
  PUBLIC_BUILDING: "building",
  PRIVATE_FARM: "farm",
  PUBLIC_FARM: "farm",
  PORTAL: "portal",
  POINT_OF_INTEREST: "poi",
  OTHER: "misc",
};
