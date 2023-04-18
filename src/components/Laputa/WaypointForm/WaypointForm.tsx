import { WaypointType, WorldType, Visibility } from "@prisma/client";
import { useState } from "react";

import { useWaypointActions } from "~/client/state";
import * as Form from "~/components/BaseUI/Form";
import { VisibleToSelect } from "~/components/BaseUI/VisibleToSelect";
import {
  visibilityDisplayName,
  waypointTypeDisplayName,
  worldTypeDisplayName,
} from "~/displaynames";

import type { FormEvent } from "react";
import type { User, Waypoint, WaypointAddInput } from "~/types";

interface WaypointFormProps {
  waypoint?: Waypoint;
}

export function WaypointForm({ waypoint }: WaypointFormProps) {
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [visibleTo, setVisibleTo] = useState<User[]>([]);
  const { addWaypoint } = useWaypointActions();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: any = Object.fromEntries(new FormData(e.currentTarget));

    const payload: WaypointAddInput = {
      name: data.name,
      description: data.description,
      worldType: data.worldType,
      visibility: visibility,
      visibleTo: visibility == "SELECT" ? visibleTo.map((u) => u.id) : [],
      waypointType: data.waypointType,
      xCoord: +data.xCoord,
      yCoord: +data.yCoord,
      zCoord: +data.zCoord,
    };

    addWaypoint(payload);
  };

  return (
    <Form.Root onSubmit={onSubmit}>
      <Form.Field name="name">
        <Form.Label>Name</Form.Label>
        <Form.Control required />
        <Form.Message match="valueMissing">
          Ein Schild ohne Name ist genau wie du: Absolut nutzlos.
        </Form.Message>
      </Form.Field>
      <Form.Field name="waypointType">
        <Form.Label>Kategorie</Form.Label>
        <Form.Select>
          {Object.keys(WaypointType).map((key) => {
            return (
              <option key={key} value={key}>
                {waypointTypeDisplayName[key as WaypointType]}
              </option>
            );
          })}
        </Form.Select>
      </Form.Field>
      <Form.Field name="worldType">
        <Form.Label>Location</Form.Label>
        <Form.Select>
          {Object.keys(WorldType).map((key) => {
            return (
              <option key={key} value={key}>
                {worldTypeDisplayName[key as WorldType]}
              </option>
            );
          })}
        </Form.Select>
      </Form.Field>
      <Form.InputCoordinates required />
      <Form.Field name="description">
        <Form.Label>Beschreibung</Form.Label>
        <Form.Control asChild>
          <textarea />
        </Form.Control>
      </Form.Field>
      <Form.Field name="visibility">
        <Form.Label>Sichtbarkeit</Form.Label>
        <Form.Select
          defaultValue={visibility}
          onChange={(e) => {
            setVisibility(e.target.value as Visibility);
          }}
        >
          {Object.keys(Visibility)
            .reverse()
            .map((type) => (
              <option key={type} value={type}>
                {visibilityDisplayName[type as Visibility]}
              </option>
            ))}
        </Form.Select>
      </Form.Field>
      {visibility === "SELECT" && (
        <VisibleToSelect
          addedPlayers={visibleTo}
          onAddPlayer={(user) => setVisibleTo((users) => [...users, user])}
          onRemovePlayer={(user) =>
            setVisibleTo((users) =>
              users.filter((addedUser) => addedUser.id !== user.id)
            )
          }
        />
      )}
      <Form.Submit>Erstellen</Form.Submit>
    </Form.Root>
  );
}
