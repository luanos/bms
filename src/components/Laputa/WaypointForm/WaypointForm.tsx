import { WaypointType, WorldType, Visibility } from "@prisma/client";
import { Close } from "@radix-ui/react-dialog";
import { useState } from "react";

import s from "./WaypointForm.module.scss";
import { useWaypointActions } from "~/client/state";
import * as Dialog from "~/components/BaseUI/Dialog";
import * as Form from "~/components/BaseUI/Form";
import { Separator } from "~/components/BaseUI/Separator";
import { VisibleToSelect } from "~/components/BaseUI/VisibleToSelect";
import { EpDelete } from "~/components/Icons";
import {
  visibilityDisplayName,
  waypointTypeDisplayName,
  worldTypeDisplayName,
} from "~/displaynames";

import type { FormEvent, ReactNode } from "react";
import type { User, Waypoint, WaypointAddInput } from "~/types";

interface WaypointFormProps {
  children: ReactNode;
  waypoint?: Waypoint;
}

/** Form inside a Dialog (Modal) for creating and editing waypoints.
 * @prop child: <ReactNode> The Trigger to open the Dialog
 * @prop waypoint?: <Waypoint> The waypoint to be edited. If this prop is not set, the form will create a new waypoint instead.
 */
export function WaypointForm({ children, waypoint }: WaypointFormProps) {
  const [visibility, setVisibility] = useState<Visibility>(
    waypoint?.visibility || "PRIVATE"
  );
  const [visibleTo, setVisibleTo] = useState<User[]>(waypoint?.visibleTo || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addWaypoint, updateWaypoint, deleteWaypoint } = useWaypointActions();
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

    if (waypoint?.id) {
      await updateWaypoint(waypoint.id, payload);
    } else {
      await addWaypoint(payload);
    }
    setDialogOpen(false);
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Main
        title={waypoint?.id ? "Wegpunkt Bearbeiten" : "Wegpunkt Erstellen"}
      >
        <Form.Root onSubmit={onSubmit}>
          <Form.Field name="name" className={s.horizontalLayout}>
            <Form.Label>Name</Form.Label>
            <Form.Control
              defaultValue={waypoint?.name}
              autoComplete="off"
              required
            />
          </Form.Field>
          <Form.Field name="waypointType" className={s.horizontalLayout}>
            <Form.Label>Kategorie</Form.Label>
            <Form.Select defaultValue={waypoint?.waypointType}>
              {Object.keys(WaypointType).map((key) => {
                return (
                  <option key={key} value={key}>
                    {waypointTypeDisplayName[key as WaypointType]}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Field>
          <Form.Field name="worldType" className={s.horizontalLayout}>
            <Form.Label>Location</Form.Label>
            <Form.Select defaultValue={waypoint?.worldType}>
              {Object.keys(WorldType).map((key) => {
                return (
                  <option key={key} value={key}>
                    {worldTypeDisplayName[key as WorldType]}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Field>
          <div className={s.horizontalLayout}>
            <div></div>
            <Form.InputCoordinates
              defaultX={waypoint?.xCoord}
              defaultY={waypoint?.yCoord}
              defaultZ={waypoint?.zCoord}
              required
            />
          </div>

          <Form.Field name="description" className={s.horizontalLayout}>
            <Form.Label style={{ alignSelf: "flex-start" }}>
              Beschreibung
            </Form.Label>
            <Form.Control defaultValue={waypoint?.description} asChild>
              <textarea />
            </Form.Control>
          </Form.Field>
          <Separator
            orientation="horizontal"
            style={{ width: "unset", margin: ".5rem 0" }}
          />
          <Form.Field name="visibility" className={s.horizontalLayout}>
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
          <div className={s.formActions}>
            {waypoint && (
              <Form.Button
                className={s.deleteButton}
                onClick={() => {
                  deleteWaypoint(waypoint.id);
                }}
                aria-label="Wegpunkt unwiedderruflich löschen"
              >
                <EpDelete />
              </Form.Button>
            )}
            <Form.Submit style={{ marginLeft: "auto" }}>
              {waypoint ? "Änderungen Speichern" : "Erstellen"}
            </Form.Submit>
          </div>
        </Form.Root>
      </Dialog.Main>
    </Dialog.Root>
  );
}
