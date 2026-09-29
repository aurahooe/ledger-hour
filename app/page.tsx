import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function Home() {
  const supabase = await createClient();
  const { data: hour } = await supabase
    .from("ledgerh_hours")
    .select("desk_note, hour_start, piece_id, ledgerh_pieces(id, title, body, author_id, ledgerh_profiles(display_name, handle))")
    .order("hour_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: publicPieces } = await supabase
    .from("ledgerh_pieces")
    .select("id, title, body, created_at, ledgerh_profiles(display_name, handle)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const piece = Array.isArray(hour?.ledgerh_pieces) ? hour?.ledgerh_pieces[0] : hour?.ledgerh_pieces;
  const author = piece?.ledgerh_profiles
    ? Array.isArray(piece.ledgerh_profiles) ? piece.ledgerh_profiles[0] : piece.ledgerh_profiles
    : null;

  return (
    <main>
      <section className="hero">
        <h1>What this hour<br />chose to keep.</h1>
        <p>
          Write at the desk. Mark a piece public and it can land on the floor.
          Every hour the desk turns: one public note is featured, with a short line from the house.
        </p>
      </section>
      <article className="hour-card">
        <div className="kicker">This hour</div>
        {piece ? (
          <>
            <h2><Link href={`/p/${piece.id}`}>{piece.title}</Link></h2>
            {hour?.desk_note ? <p className="desk">{hour.desk_note}</p> : null}
            <p className="byline">{author?.display_name ?? "unsigned"}{author?.handle ? ` · @${author.handle}` : ""}</p>
          </>
        ) : (
          <>
            <h2>The floor is still empty.</h2>
            <p className="desk">Leave a public piece. The next hour will have something to hold.</p>
          </>
        )}
      </article>
      <section className="grid">
        {(publicPieces ?? []).map((p: any, i: number) => {
          const a = Array.isArray(p.ledgerh_profiles) ? p.ledgerh_profiles[0] : p.ledgerh_profiles;
          return (
            <Link key={p.id} href={`/p/${p.id}`} className="slip" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="kicker">{a?.handle ? `@${a.handle}` : a?.display_name}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
