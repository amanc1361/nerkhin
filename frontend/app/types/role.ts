// types/role.ts
export enum UserRole {
  SuperAdmin = 1,
  Admin = 2,
  Wholesaler = 3,
  Retailer = 4,
}

export type RoleInput = number | string | null | undefined;

export function normalizeRole(role: RoleInput): UserRole | null {
  if (role === null || role === undefined) return null;
  const r = typeof role === "string" ? role.toLowerCase() : role;
  if (r === 1 || r === "1" || r === "superadmin") return UserRole.SuperAdmin;
  if (r === 2 || r === "2" || r === "admin") return UserRole.Admin;
  if (r === 3 || r === "3" || r === "wholesaler") return UserRole.Wholesaler;
  if (r === 4 || r === "4" || r === "retailer") return UserRole.Retailer;
  return null;
}

export const isAdmin      = (r: RoleInput) => {
  const n = normalizeRole(r);
  return n === UserRole.SuperAdmin || n === UserRole.Admin;
};
export const isWholesaler = (r: RoleInput) => normalizeRole(r) === UserRole.Wholesaler;
export const isRetailer   = (r: RoleInput) => normalizeRole(r) === UserRole.Retailer;

export function defaultRouteForRole(r: RoleInput): string {
  if (isAdmin(r)) return "/panel";
  if (isWholesaler(r)) return "/wholesaler";
  if (isRetailer(r)) return "/retailer";
  return "/";
}
