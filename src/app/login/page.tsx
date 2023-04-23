"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import s from "./Login.module.scss";
import { Button } from "~/components/BaseUI/Button";

import type { FormEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasError = statusMsg !== null;

  let onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password, username }),
    }).then((res) => res.json());
    setIsLoading(false);
    if (response.status === "success") {
      router.push("/");
      router.refresh();
    } else {
      setStatusMsg(response.message);
    }
  };

  return (
    <div className={s.wrapper}>
      <form onSubmit={onLogin} className={s.form}>
        <div className={s.box}>
          <label htmlFor="username" className={s.label}>
            Benutzername
          </label>
          <input
            id="username"
            className={s.input}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          ></input>
        </div>
        <div className={s.box}>
          <label htmlFor="password" className={s.label}>
            Passwort
          </label>
          <input
            id="password"
            className={s.input}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          ></input>
        </div>
        <Button className={s.button} disabled={isLoading}>
          {isLoading ? "..." : "Login"}
        </Button>
        <div className={s.msg}>{hasError && statusMsg}</div>
      </form>
    </div>
  );
}
