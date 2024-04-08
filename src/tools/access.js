import { isEmpty, forEach, includes } from "lodash";
export default function checkAccess(userAccess, menuAccess) {
  let yesRoleForAccess = false;
  let yesPermissionForAccess = false;
  if (menuAccess && userAccess) {
    const { roles: accessRoles, permissions: accessPermissions } = userAccess;
    const { roles, permissions } = menuAccess;
    if (!isEmpty(accessRoles)) {
      forEach(accessRoles, (role) => {
        if (includes(roles, role)) {
          yesRoleForAccess = true;
        }
      });
    }
    if (!isEmpty(accessPermissions)) {
      forEach(accessPermissions, (permission) => {
        if (includes(permissions, permission)) {
          yesPermissionForAccess = true;
        }
      });
    }
  }
  return yesRoleForAccess || yesPermissionForAccess;
}
