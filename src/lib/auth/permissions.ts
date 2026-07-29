export type ClientRoleName =
  | "CLIENT_ADMIN"
  | "CLIENT_EDITOR"
  | "CLIENT_BLOGGER"
  | "CLIENT_VIEWER";

export type SiteFlags = {
  clientsCanPublish: boolean;
  clientsCanCreatePages: boolean;
  clientsCanBuildSite: boolean;
  editorsCanBlog: boolean;
};

export function canManageTeam(role: ClientRoleName) {
  return role === "CLIENT_ADMIN";
}

export function canEditPages(role: ClientRoleName) {
  return role === "CLIENT_ADMIN" || role === "CLIENT_EDITOR";
}

export function canCreatePages(role: ClientRoleName, flags: SiteFlags) {
  if (role === "CLIENT_ADMIN") return flags.clientsCanCreatePages;
  if (role === "CLIENT_EDITOR") return flags.clientsCanCreatePages;
  return false;
}

export function canEditBlog(role: ClientRoleName, flags: SiteFlags) {
  if (role === "CLIENT_ADMIN" || role === "CLIENT_BLOGGER") return true;
  if (role === "CLIENT_EDITOR") return flags.editorsCanBlog;
  return false;
}

export function canEditSeoMeta(role: ClientRoleName) {
  return role === "CLIENT_ADMIN";
}

export function canPublish(role: ClientRoleName, flags: SiteFlags) {
  return role === "CLIENT_ADMIN" && flags.clientsCanPublish;
}

export function canBuildSite(role: ClientRoleName, flags: SiteFlags) {
  return role === "CLIENT_ADMIN" && flags.clientsCanBuildSite;
}

export const CLIENT_ROLE_LABELS: Record<ClientRoleName, string> = {
  CLIENT_ADMIN: "Administrative",
  CLIENT_EDITOR: "Editor",
  CLIENT_BLOGGER: "Blog editor",
  CLIENT_VIEWER: "View only",
};
