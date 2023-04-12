"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import s from "./Waypoint.module.scss";
import { Button } from "../Button";
import { Checkmark, Copy, Cross, Edit, Plus, Search } from "../Icons";
import { serializeWaypoint } from "~/utils";

import type {
  Waypoint as DBWaypoint,
  Visibility,
  WorldType,
} from "@prisma/client";

type Waypoint = DBWaypoint & {
  visibleTo: { username: string }[];
  owner: { username: string };
};

interface WaypointsProps {
  ownWaypoints: Waypoint[];
  otherWaypoints: Waypoint[];
}

export function Waypoints({ ownWaypoints, otherWaypoints }: WaypointsProps) {
  const router = useRouter();
  const [newView, setNewView] = useState(false);

  return (
    <div className={s.wrapper}>
      <div>
        <div className={s.title}>Meine Wegpunkte</div>
        {ownWaypoints.map((waypoint) => (
          <WaypointDisplay waypoint={waypoint} key={waypoint.id} own={true} />
        ))}
      </div>
      {newView ? (
        <WaypointForm onClose={() => setNewView(false)} />
      ) : (
        <div className={s.addWaypoint}>
          <Button onClick={() => setNewView(true)}>
            <Plus />
            Wegpunkt hinzufügen
          </Button>
        </div>
      )}

      <div>
        <div className={s.title}>Andere Wegpunkte</div>
        {otherWaypoints.map((waypoint) => (
          <WaypointDisplay waypoint={waypoint} key={waypoint.id} own={false} />
        ))}
      </div>
    </div>
  );
}

interface WaypointFormProps {
  waypoint?: Waypoint;
  onClose?: () => any;
}

function WaypointForm({ waypoint, onClose }: WaypointFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState<string>(waypoint?.name ?? "Wegpunkt");
  const [xCoord, setXCoord] = useState<number>(waypoint?.xCoord ?? 0);
  const [yCoord, setYCoord] = useState<number>(waypoint?.yCoord ?? 0);
  const [zCoord, setZCoord] = useState<number>(waypoint?.zCoord ?? 0);
  const [worldType, setWorldType] = useState<WorldType>(
    waypoint?.worldType ?? "OVERWORLD"
  );
  const [visibility, setVisibility] = useState<Visibility>(
    waypoint?.visibility ?? "PRIVATE"
  );

  const onDelete = async () => {
    setLoading(true);
    if (!waypoint?.id) return;

    let res = await fetch(`/api/waypoints/${waypoint.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
      setLoading(false);
      onClose?.();
    } else {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    const payload: Partial<Waypoint> = {
      worldType,
      visibility,
      name,
      xCoord,
      yCoord,
      zCoord,
    };
    let res;
    if (waypoint?.id) {
      // update waypoint
      res = await fetch(`/api/waypoints/${waypoint.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      // create waypoint
      res = await fetch("/api/waypoints", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      router.refresh();
      setLoading(false);
      onClose?.();
    } else {
      setLoading(false);
    }
  };

  return (
    <div className={s.addWrapper}>
      <div className={s.addRow}>
        <input
          className={s.addInput}
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Name"
        ></input>
      </div>
      <div className={s.addPill}>
        <select
          value={worldType}
          onChange={(e) => setWorldType(e.target.value as WorldType)}
          className={s.addSelect}
        >
          <option value="OVERWORLD">Oberwelt</option>
          <option value="NETHER">Nether</option>
          <option value="END">Ende</option>
        </select>
        <input
          className={s.addInput}
          value={xCoord}
          placeholder="x"
          type="number"
          onChange={(e) => setXCoord(+e.target.value || 0)}
          size={4}
        ></input>
        <input
          className={s.addInput}
          value={yCoord}
          placeholder="y"
          type="number"
          onChange={(e) => setYCoord(+e.target.value || 0)}
          size={4}
        ></input>
        <input
          className={s.addInput}
          value={zCoord}
          placeholder="z"
          type="number"
          onChange={(e) => setZCoord(+e.target.value || 0)}
          size={4}
        ></input>
      </div>
      <div className={s.addVisibility}>
        <select
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          value={visibility}
          className={s.addSelect}
        >
          <option value="ALL">Öffentlich</option>
          <option value="PRIVATE">Privat</option>
        </select>
      </div>
      <div className={s.addButtons}>
        <Button disabled={loading} onClick={onSubmit}>
          Speichern
        </Button>
        <Button disabled={loading} onClick={onClose}>
          Abbrechen
        </Button>
        {waypoint && (
          <Button disabled={loading} onClick={onDelete}>
            Löschen
          </Button>
        )}
      </div>
    </div>
  );
}

interface WaypointDisplayProps {
  waypoint: Waypoint;
  own: boolean;
}

let dimensionToDisplayName: Record<WorldType, string> = {
  OVERWORLD: "Oberwelt",
  NETHER: "Nether",
  END: "Ende",
};

let visibilityToDisplayName: Record<Visibility, string> = {
  SELECT: "Bestimmte Spieler",
  ALL: "Öffentlich",
  PRIVATE: "Privat",
};

function WaypointDisplay({ waypoint, own }: WaypointDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [editView, setEditView] = useState(false);
  const timeout = useRef<any>();
  const onCopy = () => {
    if (copied && timeout.current) {
      clearTimeout(timeout.current);
    } else {
      setCopied(true);
    }
    timeout.current = setTimeout(() => setCopied(false), 1300);
    navigator.clipboard.writeText(serializeWaypoint(waypoint));
  };

  if (editView) {
    return (
      <WaypointForm waypoint={waypoint} onClose={() => setEditView(false)} />
    );
  }

  let { visibility } = waypoint;
  return (
    <div className={s.displayWrapper}>
      <div className={own ? s.displayOwnContent : s.displayOtherContent}>
        <div className={s.displayRow}>
          <div className={s.displayName}>{waypoint.name}</div>
          <div className={s.displayBy}>
            {own
              ? visibilityToDisplayName[visibility]
              : `von ${waypoint.owner.username}`}
          </div>
        </div>
        <div className={s.displayPill}>
          <div>{dimensionToDisplayName[waypoint.worldType]}</div>
          <div>{waypoint.xCoord}</div>
          <div>{waypoint.yCoord}</div>
          <div>{waypoint.zCoord}</div>
        </div>
      </div>

      <div className={s.displayRight}>
        {own && (
          <div className={s.displayButton} onClick={() => setEditView(true)}>
            <Edit />
          </div>
        )}
        <div className={s.displayButton}>
          <Search />
        </div>
        <div className={s.displayButton} onClick={onCopy}>
          {copied ? <Checkmark /> : <Copy />}
        </div>
      </div>
    </div>
  );
}
