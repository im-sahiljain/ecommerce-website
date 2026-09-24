export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function publicSlug(item: {
  id: string;
  name?: string | null;
  slug?: string | null;
}): string {
  const slug = item.slug?.trim();
  if (slug && !isIdSlug(slug, item.id)) return slug;
  const fromName = item.name ? slugify(item.name) : "";
  return fromName || item.id;
}

export function isIdSlug(slug: string | null | undefined, id: string): boolean {
  const value = slug?.trim() ?? "";
  if (!value || value === id) return true;
  return /^(?:prod|pack|line)-\d+$/.test(value);
}

export function uniqueSlug(base: string, id: string, taken: Set<string>): string {
  const root = base || id;
  if (!taken.has(root)) {
    taken.add(root);
    return root;
  }
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  const next = `${root}-${n}`;
  taken.add(next);
  return next;
}
