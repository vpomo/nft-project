<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Users Management
        <v-spacer></v-spacer>
        <v-chip v-if="usersStore.total > 0" color="primary" variant="outlined">
          Total: {{ usersStore.total }}
        </v-chip>
      </v-card-title>
      <v-card-text v-if="usersStore.error">
        <v-alert type="error" class="mb-4">
          {{ usersStore.error }}
        </v-alert>
      </v-card-text>
      <v-data-table
          :headers="headers"
          :items="usersStore.users"
          :loading="usersStore.loading"
          :items-per-page="usersStore.itemsPerPage"
          :page="usersStore.currentPage"
          :server-items-length="usersStore.total"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
          class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list>
              <v-list-item @click="openChangeRoleDialog(item)">
                <v-list-item-title>Change Role</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleDeleteUser(item)">
                <v-list-item-title class="text-red">Delete User</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>


    <v-dialog v-model="roleDialog" max-width="500px">
      <v-card>
        <v-card-title>Change Role for {{ selectedUser?.phone }}</v-card-title>
        <v-card-text>
          <v-select
              v-model="selectedRole"
              :items="['user', 'creator', 'moderator', 'admin']"
              label="Role"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="roleDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmChangeRole">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from 'vue';
import { useUsersStore } from '@/stores/users.store';
import type { User } from '@/types';
import type { useConfirm } from '@/composables/useConfirm';

const usersStore = useUsersStore();
const confirm = inject('confirm') as ReturnType<typeof useConfirm>;

const headers = [
  { title: 'User ID', key: 'user_id', align: 'start' },
  { title: 'Phone', key: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Last Visit', key: 'last_visit_time' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const roleDialog = ref(false);
const selectedUser = ref<User | null>(null);
const selectedRole = ref('');

const openChangeRoleDialog = (user: User) => {
  selectedUser.value = user;
  selectedRole.value = user.role || 'user';
  roleDialog.value = true;
};

const confirmChangeRole = async () => {
  if (!selectedUser.value) return;
  try {
    await usersStore.changeUserRole(selectedUser.value.user_id, selectedRole.value);
  } catch (e) {
    console.error("Failed to change role", e);
    // show error snackbar
  }
  roleDialog.value = false;
};

const handleDeleteUser = async (user: User) => {
  const isConfirmed = await confirm.show({
    title: 'Delete User',
    message: `Are you sure you want to delete user ${user.phone}? This action cannot be undone.`,
    color: 'red'
  });

  if (isConfirmed) {
    try {
      await usersStore.deleteUser(user.user_id);
    } catch (e) {
      console.error('Failed to delete user', e)
    } finally {
      confirm.close();
    }
  }
};

const handlePageChange = (page: number) => {
  usersStore.fetchUsers(page, usersStore.itemsPerPage);
};

const handleItemsPerPageChange = (itemsPerPage: number) => {
  usersStore.fetchUsers(1, itemsPerPage);
};

onMounted(() => {
  usersStore.fetchUsers();
});
</script>
