<template>
  <q-page data-vue-component-name="AccessComponent" class="q-pa-md">
    <div class="text-bold text-center text-h5">
      Доступ пользователей к роутам
    </div>
    <div style="max-width: 500px">
      <List dense bordered>
        <q-expansion-item
          icon="explore"
          label="Роли"
          header-class="text-primary"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon name="accessibility_new" />
            </q-item-section>

            <q-item-section> Роли </q-item-section>

            <q-item-section>
              <div>
                <Badge color="info">
                  {{ getRoles.length }}
                </Badge>
              </div>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <IconBtn
                  flat
                  dense
                  icon="add_circle"
                  tooltip="Добавить"
                  @icon-btn-click="viewDialogAddRole"
                />
              </q-item-label>
            </q-item-section>
          </template>
          <List dense bordered separator>
            <ListItem v-for="(item, index) in getRoles" :key="index">
              <ItemSection>
                <ItemLabel>{{ item.name }}</ItemLabel>
              </ItemSection>

              <ItemSection side>
                <div class="row">
                  <IconBtn
                    flat
                    dense
                    icon="edit"
                    color="teal"
                    tooltip="Редактировать"
                    @icon-btn-click="viewDialogAddRole(item.name)"
                  />
                  <IconBtn
                    flat
                    dense
                    icon="delete"
                    color="negative"
                    tooltip="Удалить"
                    @icon-btn-click="deleteRole(item)"
                  />
                </div>
              </ItemSection>
            </ListItem>
          </List>
        </q-expansion-item>

        <q-separator />

        <q-expansion-item
          icon="lock"
          label="Разрешения"
          header-class="text-teal"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon name="lock" />
            </q-item-section>

            <q-item-section> Разрешения </q-item-section>

            <q-item-section>
              <div>
                <Badge color="info">
                  {{ getPermissions.length }}
                </Badge>
              </div>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <IconBtn
                  flat
                  dense
                  icon="add_circle"
                  tooltip="Добавить"
                  @icon-btn-click="viewDialogAddPermission"
                />
              </q-item-label>
            </q-item-section>
          </template>

          <List dense bordered separator>
            <ListItem v-for="(item, index) in getPermissions" :key="index">
              <ItemSection>
                <ItemLabel>{{ item.name }}</ItemLabel>
              </ItemSection>

              <ItemSection side>
                <div class="row">
                  <IconBtn
                    flat
                    dense
                    icon="edit"
                    color="teal"
                    tooltip="Редактировать"
                    @icon-btn-click="viewDialogAddPermission(item.name)"
                  />
                  <IconBtn
                    flat
                    dense
                    icon="delete"
                    color="negative"
                    tooltip="Удалить"
                    @icon-btn-click="deletePermission(item)"
                  />
                </div>
              </ItemSection>
            </ListItem>
          </List>
        </q-expansion-item>
      </List>
    </div>
    <div v-for="(item, index) in usersWithRolesAndPermissions" :key="index">
      <div style="border: 1px solid lightgray; margin: 10px 0; padding: 10px">
        <div>USER_NAME: {{ item.name }}</div>
        <div v-for="(role, i) in item.roles" :key="i" class="q-ml-md">
          USER_ROLE: {{ role.name }}
          <IconBtn
            flat
            dense
            icon="delete"
            color="negative"
            tooltip="Удалить роль"
            @icon-btn-click="deleteRoleFromUser(item, role)"
          />
          <div
            v-for="(permission, ind) in role.permissions"
            :key="ind"
            class="q-ml-lg"
          >
            ROLE_PERMISIION: {{ permission.name }}
            <IconBtn
              flat
              dense
              icon="delete"
              color="negative"
              tooltip="Удалить разрешение"
              @icon-btn-click="
                deletePermissionFromRoleOrUser(role, permission, 'role')
              "
            />
          </div>
        </div>
        <div v-for="permission in item.permissions" :key="permission.name">
          USER_PERMISIION: {{ permission.name }}
          <IconBtn
            flat
            dense
            icon="delete"
            color="negative"
            tooltip="Удалить разрешение"
            @icon-btn-click="
              deletePermissionFromRoleOrUser(item, permission, 'user')
            "
          />
        </div>
      </div>
    </div>
    <DialogAddRole
      v-model:show-dialog="showDialogAddRole"
      v-model:role-name="roleName"
      :users="users"
    />
    <DialogAddPermission
      v-model:show-dialog="showDialogAddPermission"
      v-model:permission-name="permissionName"
      :users="users"
      :roles="rolesNames"
    />
  </q-page>
</template>

<script>
import { getUrl } from "src/tools/url";
import showNotif from "src/mixins/showNotif";
import List from "src/components/Elements/List/List.vue";
import ItemSection from "src/components/Elements/List/ItemSection.vue";
import ItemLabel from "src/components/Elements/List/ItemLabel.vue";
import ListItem from "src/components/Elements/List/ListItem.vue";
import Badge from "src/components/Elements/Badge.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import DialogAddRole from "src/components/Dialogs/DialogAddRole.vue";
import DialogAddPermission from "src/components/Dialogs/DialogAddPermission.vue";
import { map } from "lodash";
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();
import { usePermissionsStore } from "stores/permissions";
const permissionsStore = usePermissionsStore();
import { useRolesStore } from "stores/roles";
const rolesStore = useRolesStore();

export default {
  name: "AccessComponent",
  components: {
    List,
    ItemSection,
    ItemLabel,
    ListItem,
    Badge,
    IconBtn,
    DialogAddRole,
    DialogAddPermission,
  },
  mixins: [showNotif],
  data() {
    return {
      showDialogAddRole: false,
      showDialogAddPermission: false,
      roles: [],
      permissions: [],
      roleName: "",
      permissionName: "",
    };
  },
  computed: {
    getRoles() {
      return rolesStore.getRoles;
    },
    getPermissions() {
      return permissionsStore.getPermissions;
    },
    users() {
      return map(this.usersWithRolesAndPermissions, ({ name }) => name);
    },
    rolesNames() {
      return map(this.getRoles, ({ name }) => name);
    },
    usersWithRolesAndPermissions() {
      return authStore.getUsersWithRolesAndPermissions;
    },
  },
  created() {
    rolesStore.fetchRoles();
    permissionsStore.fetchPermissions();
    this.getUsersWithRoles();
  },
  methods: {
    async getUsersWithRoles() {
      await this.$axios
        .get(getUrl("usersWithRoles"))
        .then(({ data: { users } }) => {
          authStore.setUsersWithRolesAndPermissions(users);
        })
        .catch((errors) => {
          console.error("Ошибка ", errors);
        });
    },
    viewDialogAddRole(val) {
      if (val) {
        this.roleName = val;
      }
      this.showDialogAddRole = true;
    },
    viewDialogAddPermission(val) {
      if (val) {
        this.permissionName = val;
      }
      this.showDialogAddPermission = true;
    },
    deleteRole({ id, name }) {
      this.showNotif("warning", `Удалить роль - ${name} ?`, "center", [
        {
          label: "Отмена",
          color: "white",
          handler: () => {},
        },
        {
          label: "Удалить",
          color: "white",
          handler: () => {
            this.$q.loading.show();
            this.$axios
              .get(`${getUrl("deleteRole")}/${id}`)
              .then(({ data: { users } }) => {
                rolesStore.deleteRole(id);
                authStore.setUsersWithRolesAndPermissions(users);
                this.$q.loading.hide();
                this.showNotif(
                  "success",
                  `Роль ${name} успешно удалена.`,
                  "center",
                );
              })
              .catch((errors) => {
                this.$q.loading.hide();
                console.error("Ошибка ", errors);
              });
          },
        },
      ]);
    },
    deleteRoleFromUser(
      { id: userId, name: userName },
      { id: roleId, name: roleName },
    ) {
      this.showNotif(
        "warning",
        `Удалить роль - ${roleName} у пользователя ${userName}?`,
        "center",
        [
          {
            label: "Отмена",
            color: "white",
            handler: () => {},
          },
          {
            label: "Удалить",
            color: "white",
            handler: () => {
              this.$q.loading.show();
              this.$axios
                .post(getUrl("deleteRoleFromUser"), {
                  userId,
                  roleId,
                })
                .then(({ data: { users } }) => {
                  authStore.setUsersWithRolesAndPermissions(users);
                  this.$q.loading.hide();
                  this.showNotif(
                    "success",
                    `Роль ${roleName} успешно удалена у пользователя ${userName}.`,
                    "center",
                  );
                })
                .catch((errors) => {
                  this.$q.loading.hide();
                  console.error("Ошибка ", errors);
                });
            },
          },
        ],
      );
    },
    deletePermission({ id, name }) {
      this.showNotif("warning", `Удалить разрешение - ${name} ?`, "center", [
        {
          label: "Отмена",
          color: "white",
          handler: () => {},
        },
        {
          label: "Удалить",
          color: "white",
          handler: () => {
            this.$q.loading.show();
            this.$axios
              .get(`${getUrl("deletePermission")}/${id}`)
              .then(({ data: { users } }) => {
                permissionsStore.deletePermission(id);
                authStore.setUsersWithRolesAndPermissions(users);
                this.$q.loading.hide();
                this.showNotif(
                  "success",
                  `Разрешение ${name} успешно удалено.`,
                  "center",
                );
              })
              .catch((errors) => {
                this.$q.loading.hide();
                console.error("Ошибка ", errors);
              });
          },
        },
      ]);
    },
    deletePermissionFromRoleOrUser(fromObj, permission, key) {
      this.showNotif(
        "warning",
        `Удалить разрешение - ${permission.name}?`,
        "center",
        [
          {
            label: "Отмена",
            color: "white",
            handler: () => {},
          },
          {
            label: "Удалить",
            color: "white",
            handler: () => {
              this.$q.loading.show();
              this.$axios
                .post(getUrl("deletePermissionFromRoleOrUser"), {
                  name: fromObj.name,
                  permissionName: permission.name,
                  key,
                })
                .then(({ data: { users } }) => {
                  authStore.setUsersWithRolesAndPermission(users);
                  this.$q.loading.hide();
                  this.showNotif(
                    "success",
                    `Разрешение ${permission.name} успешно удалено.`,
                    "center",
                  );
                })
                .catch((errors) => {
                  this.$q.loading.hide();
                  console.error("Ошибка ", errors);
                });
            },
          },
        ],
      );
    },
  },
};
</script>
