import * as Select from "@radix-ui/react-select";

import s from "./VisibleToSelect.module.scss";
import { useAllUsers, useUser } from "~/client/state";
import { EpPlus } from "~/components/Icons";

import type { ChangeEvent } from "react";
import type { User } from "~/types";

interface VisibleToSelectProps {
  addedPlayers: User[];
  onAddPlayer: (user: User) => void;
  onRemovePlayer: (user: User) => void;
}

export function VisibleToSelect({
  addedPlayers,
  onAddPlayer,
  onRemovePlayer,
}: VisibleToSelectProps) {
  const allUsers = useAllUsers();

  const toBeAdded = allUsers.filter((user) => !addedPlayers.includes(user));
  const { user } = useUser();

  return (
    <div className={s.root}>
      <div className={s.me}>{user.username}</div>
      {addedPlayers.map((user) => (
        <button
          type="button"
          key={user.id}
          className={s.player}
          onClick={() => onRemovePlayer(user)}
        >
          {user.username}
        </button>
      ))}
      {toBeAdded.length > 0 && (
        <Select.Root
          value=""
          onValueChange={(id) => {
            const toBeAddedPlayer = toBeAdded.find((user) => user.id == id);
            if (toBeAddedPlayer) onAddPlayer(toBeAddedPlayer);
          }}
        >
          <Select.Trigger>
            <EpPlus />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              align="center"
              side="right"
              className={s.selectContent}
            >
              <Select.Viewport className={s.viewport}>
                {toBeAdded.map((user) => (
                  <Select.Item
                    className={s.selectPlayer}
                    value={user.id}
                    key={user.id}
                  >
                    <Select.ItemText>{user.username}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      )}
    </div>
  );
}
