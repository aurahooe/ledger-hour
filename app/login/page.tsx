"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    const supabase = createClient();
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name || email.split("@")[0] } },
      });
      if (error) return setErr(error.message);
      setInfo("Check your inbox if confirmation is on. Otherwise you can sign in now.");
      setMode("in");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);
    router.push("/desk");
    router.refresh();
  }

  return (
    <main>
      <section className="hero">
        <h1>{mode === "in" ? "Come in." : "Take a key."}</h1>
        <p>Email and a password. Your private pieces stay at the desk until you mark them public.</p>
      </section>
      <form className="stack" onSubmit={onSubmit}>
        {mode === "up" && (
          <input placeholder="How you are called" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required minLength={8} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="err">{err}</p>}
        {info && <p>{info}</p>}
        <button type="submit">{mode === "in" ? "Sign in" : "Create account"}</button>
        <button type="button" className="btn" style={{ background: "transparent", color: "inherit", border: "1px solid var(--rule)" }} onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Need a key?" : "Already have one?"}
        </button>
      </form>
    </main>
  );
}
