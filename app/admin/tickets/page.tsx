import { AdminTicketControls } from "@/src/components/admin/admin-ticket-controls";
import { getAdminTickets, type AdminTicket } from "@/src/lib/admin-data";
import { requireAdminPage } from "@/src/lib/admin";

function displayUser(user: {
  name: string | null;
  username: string | null;
  email: string | null;
  publicId: string;
}) {
  return user.name || user.username || user.email || user.publicId;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function renderTicket(ticket: AdminTicket) {
  return (
    <article
      key={ticket.id}
      className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-950">
              {ticket.subject}
            </h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
              {ticket.status.replace("_", " ")}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {ticket.category.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {displayUser(ticket.user)} - {formatDate(ticket.createdAt)}
          </p>
          {ticket.reportedUser ? (
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Reported: {ticket.reportedUser}
            </p>
          ) : null}
        </div>
      </div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {ticket.description}
      </p>
      <AdminTicketControls
        ticketId={ticket.id}
        status={ticket.status}
        adminReply={ticket.adminReply}
      />
    </article>
  );
}

export default async function AdminTicketsPage() {
  await requireAdminPage();
  const tickets: AdminTicket[] = await getAdminTickets();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Tickets
          </h1>
        </div>

        <div className="space-y-5">
          {tickets.map(renderTicket)}
          {!tickets.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
              No support tickets yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
