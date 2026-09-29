"use client";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Piece = { id: string; title: string; body: string; is_public: boolean };

export default function Desk() {
  const router = useRouter();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("ledgerh_profiles").upsert({
      id: user.id,
      display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "anonymous",
    });
    const { data } = await supabase
      .from("ledgerh_pieces")
      .select("id, title, body, is_public")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });
    setPieces((data as Piece[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("ledgerh_pieces").insert({
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) return setErr(error.message);
    setTitle("");
    setBody("");
    setIsPublic(false);
    load();
  }

  async function toggle(p: Piece) {
    const supabase = createClient();
    await supabase.from("ledgerh_pieces").update({ is_public: !p.is_public, updated_at: new Date().toISOString() }).eq("id", p.id);
    load();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main>
      <section className="hero">
        <h1>Your desk.</h1>
        <p>Draft privately. When a piece is ready for the floor, mark it public. The hour may choose it.</p>
        <button className="btn" onClick={signOut} style={{ marginTop: 16 }}>Sign out</button>
      </section>
      <form className="stack" onSubmit={save}>
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea required placeholder="The piece itself" value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Mark public
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit">Keep this</button>
      </form>
      <section className="grid">
        {pieces.map((p) => (
          <article key={p.id} className="slip">
            <div className="kicker">{p.is_public ? "public" : "private"}</div>
            <h3><Link href={`/p/${p.id}`}>{p.title}</Link></h3>
            <p>{p.body}</p>
            <button className="btn" style={{ marginTop: 10 }} onClick={() => toggle(p)}>
              {p.is_public ? "Pull from floor" : "Put on floor"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
