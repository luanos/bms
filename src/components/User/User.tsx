import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import s from "./User.module.scss";
import { useUser } from "~/state";

export function User() {
  const [active, setActive] = useState(false);
  const { user, logout } = useUser();

  const timeoutRef = useRef<any>(null);

  return (
    <div className={s.root} data-state={active ? "active" : "inactive"}>
      <div className={s.expandedContainer}>
        <div
          className={s.expandedContent}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              console.log("clear");
              clearTimeout(timeoutRef.current);
            }
            setActive(true);
          }}
          onMouseLeave={() => {
            console.log("set");
            timeoutRef.current = setTimeout(() => setActive(false), 300);
          }}
        >
          <span className={s.username}>{user.username}</span>
          <button
            className={s.logout}
            onClick={logout}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
          >
            Logout
          </button>
        </div>
      </div>
      <div className={s.avatarContainer}>
        {/* <div className={s.avatarBg} onMouseEnter={() => setActive(true)} /> */}
        <div className={s.avatarImgContainer}>
          {/* TODO: DEBUGGING BILD ERSETZEN! */}
          <Image src="/heslig.png" alt="" fill />
        </div>
      </div>
    </div>
  );
}
