import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { TicketForm } from "@/src/components/ticket-form";
import { authOptions } from "@/src/lib/auth";
import { getTicketsForUser, type UserTicket } from "@/src/lib/admin-data";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function renderTicket(ticket: UserTicket) {
  return (
    <article
      key={ticket.id}
      className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-950">
            {ticket.subject}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(ticket.createdAt)} - {ticket.category.replaceAll("_", " ")}
          </p>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
          {ticket.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {ticket.description}
      </p>
      {ticket.adminReply ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Admin reply
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {ticket.adminReply}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tickets: UserTicket[] = await getTicketsForUser(session.user.id);

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Help
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Support tickets
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Send a bug report, account issue, or moderation request to the admin team.
          </p>
        </div>

        <TicketForm />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">Your tickets</h2>
          {tickets.map(renderTicket)}
          {!tickets.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
              No tickets yet.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
