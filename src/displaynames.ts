import type { WaypointType, WorldType, Visibility } from "@prisma/client";

export const waypointTypeDisplayName: Record<WaypointType, string> = {
  PRIVATE_BUILDING: "Bauwerk (Privat)",
  PUBLIC_BUILDING: "Bauwerk (Öffentlich)",
  PRIVATE_FARM: "Farm (Privat)",
  PUBLIC_FARM: "Farm (Öffentlich)",
  PORTAL: "Portal",
  POINT_OF_INTEREST: "Sehenswürdigkeit",
  OTHER: "Sonstiges",
};

export const worldTypeDisplayName: Record<WorldType, string> = {
  OVERWORLD: "Oberwelt",
  NETHER: "Nether",
  END: "End",
};

export const visibilityDisplayName: Record<Visibility, string> = {
  ALL: "Jeder",
  SELECT: "Ausgewählt",
  PRIVATE: "Nur Ich",
};
