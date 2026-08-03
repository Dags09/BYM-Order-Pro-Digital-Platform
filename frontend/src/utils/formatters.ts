const peso = (n: number | null | undefined) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(n ?? 0);

const fmt = (d: string | Date | null | undefined) =>
    d
        ? new Date(d).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

interface NameLike {
    firstName?: string;
    lastName?: string;
}

const initials = (u: NameLike | null | undefined) =>
    `${u?.firstName?.[0] ?? ""}${u?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

export { peso, fmt, initials };
