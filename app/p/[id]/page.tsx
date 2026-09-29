import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ledgerh_pieces")
    .select("id, title, body, is_public, created_at, ledgerh_profiles(display_name, handle)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const a = Array.isArray(data.ledgerh_profiles) ? data.ledgerh_profiles[0] : data.ledgerh_profiles;
  return (
    <article className="piece">
      <div className="kicker">{data.is_public ? "On the floor" : "Private desk copy"}</div>
      <h1>{data.title}</h1>
      <p className="byline">{a?.display_name}{a?.handle ? ` · @${a.handle}` : ""}</p>
      <div className="body" style={{ marginTop: 22 }}>{data.body}</div>
    </article>
  );
}
