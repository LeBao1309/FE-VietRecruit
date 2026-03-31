<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import type { AdminUserResponse, UserRequest } from '@/types/user'

const admin = useAdminStore()

// ── Pagination ──
const currentPage = ref(0)
const pageSize = 20

// ── Modals ──
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const targetUser = ref<AdminUserResponse | null>(null)

// ── Form ──
const form = ref<UserRequest>({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  dob: '',
  gender: '',
})

function resetForm(): void {
  form.value = { fullName: '', email: '', phone: '', location: '', dob: '', gender: '' }
}

// ── Create ──
function openCreate(): void {
  resetForm()
  showCreateModal.value = true
}

async function submitCreate(): Promise<void> {
  const success = await admin.createUser(form.value)
  if (success) {
    showCreateModal.value = false
    await admin.fetchUsers(currentPage.value, pageSize)
  }
}

// ── Edit ──
function openEdit(user: AdminUserResponse): void {
  targetUser.value = user
  form.value = {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
    location: user.location ?? '',
    dob: user.dob ?? '',
    gender: user.gender ?? '',
  }
  showEditModal.value = true
}

async function submitEdit(): Promise<void> {
  if (!targetUser.value) return
  const success = await admin.updateUser(targetUser.value.id, form.value)
  if (success) {
    showEditModal.value = false
    await admin.fetchUsers(currentPage.value, pageSize)
  }
}

// ── Detail ──
function openDetail(user: AdminUserResponse): void {
  targetUser.value = user
  showDetailModal.value = true
}

// ── Delete ──
function confirmDelete(user: AdminUserResponse): void {
  targetUser.value = user
  showDeleteConfirm.value = true
}

async function submitDelete(): Promise<void> {
  if (!targetUser.value) return
  const success = await admin.deleteUser(targetUser.value.id)
  if (success) {
    showDeleteConfirm.value = false
    await admin.fetchUsers(currentPage.value, pageSize)
  }
}

// ── Pagination ──
function goToPage(page: number): void {
  currentPage.value = page
  admin.fetchUsers(page, pageSize)
}

// ── Helpers ──
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'SYSTEM_ADMIN': return 'role-admin'
    case 'COMPANY_ADMIN': return 'role-company'
    case 'HR': return 'role-hr'
    case 'INTERVIEWER': return 'role-interviewer'
    case 'CANDIDATE': return 'role-candidate'
    case 'CUSTOMER_SERVICE': return 'role-cs'
    default: return ''
  }
}

function getStatusIndicator(user: AdminUserResponse): { text: string; cls: string } {
  if (user.isLocked) return { text: 'Locked', cls: 'status-locked' }
  if (!user.isActive) return { text: 'Inactive', cls: 'status-inactive' }
  return { text: 'Active', cls: 'status-active' }
}

const totalPages = computed(() => admin.users?.totalPages ?? 0)

onMounted(() => {
  admin.fetchUsers(0, pageSize)
})
</script>

<template>
  <div class="admin-users-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <p class="page-subtitle">
          {{ admin.users?.totalElements ?? 0 }} users on the platform
        </p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="btn-icon">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Create User
      </button>
    </div>

    <!-- Loading -->
    <div v-if="admin.loading && !admin.users" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="admin.users && admin.users.empty" class="empty-state">
      <div class="empty-icon">👥</div>
      <h2>No Users Found</h2>
      <p>Create a new user to get started.</p>
    </div>

    <!-- Table -->
    <template v-else-if="admin.users">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in admin.userList" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    <img
                      v-if="user.avatarUrl"
                      :src="user.avatarUrl"
                      :alt="user.fullName"
                      class="avatar-img"
                    />
                    <span v-else class="avatar-fallback">
                      {{ user.fullName?.charAt(0)?.toUpperCase() ?? '?' }}
                    </span>
                  </div>
                  <span class="user-name">{{ user.fullName }}</span>
                </div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td>
                <div class="role-tags">
                  <span
                    v-for="role in user.roles"
                    :key="role"
                    :class="['role-badge', getRoleBadgeClass(role)]"
                  >
                    {{ role.replace('_', ' ') }}
                  </span>
                </div>
              </td>
              <td>
                <span :class="['status-dot', getStatusIndicator(user).cls]">
                  {{ getStatusIndicator(user).text }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(user.lastLoginAt) }}</td>
              <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-btns">
                  <button class="action-btn" title="View" @click="openDetail(user)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button class="action-btn" title="Edit" @click="openEdit(user)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button class="action-btn action-btn-danger" title="Delete" @click="confirmDelete(user)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="admin.users.first"
          @click="goToPage(currentPage - 1)"
        >
          ‹ Previous
        </button>
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ totalPages }}
          · {{ admin.users.totalElements }} total
        </span>
        <button
          class="page-btn"
          :disabled="admin.users.last"
          @click="goToPage(currentPage + 1)"
        >
          Next ›
        </button>
      </div>
    </template>

    <!-- ═══ Create Modal ═══ -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Create User</h2>
            <button class="modal-close" @click="showCreateModal = false">&times;</button>
          </div>
          <form @submit.prevent="submitCreate" class="modal-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Full Name <span class="required">*</span></label>
                <input v-model="form.fullName" type="text" required maxlength="255" placeholder="Full name" />
              </div>
              <div class="form-group full-width">
                <label>Email</label>
                <input v-model="form.email" type="email" maxlength="255" placeholder="Email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="form.phone" type="text" maxlength="20" placeholder="+84 …" />
              </div>
              <div class="form-group">
                <label>Location</label>
                <input v-model="form.location" type="text" maxlength="255" placeholder="City, Country" />
              </div>
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="form.dob" type="date" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select v-model="form.gender">
                  <option value="">—</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="admin.userLoading || !form.fullName">
                {{ admin.userLoading ? 'Creating…' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Edit Modal ═══ -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Edit User</h2>
            <button class="modal-close" @click="showEditModal = false">&times;</button>
          </div>
          <form @submit.prevent="submitEdit" class="modal-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Full Name <span class="required">*</span></label>
                <input v-model="form.fullName" type="text" required maxlength="255" />
              </div>
              <div class="form-group full-width">
                <label>Email</label>
                <input v-model="form.email" type="email" maxlength="255" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="form.phone" type="text" maxlength="20" />
              </div>
              <div class="form-group">
                <label>Location</label>
                <input v-model="form.location" type="text" maxlength="255" />
              </div>
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="form.dob" type="date" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select v-model="form.gender">
                  <option value="">—</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="admin.userLoading || !form.fullName">
                {{ admin.userLoading ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Detail Modal ═══ -->
    <Teleport to="body">
      <div v-if="showDetailModal && targetUser" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal modal-detail">
          <div class="modal-header">
            <h2>User Details</h2>
            <button class="modal-close" @click="showDetailModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Profile Header -->
            <div class="detail-profile">
              <div class="detail-avatar">
                <img v-if="targetUser.avatarUrl" :src="targetUser.avatarUrl" :alt="targetUser.fullName" />
                <span v-else class="avatar-fallback large">
                  {{ targetUser.fullName?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </div>
              <div>
                <h3>{{ targetUser.fullName }}</h3>
                <p class="detail-email">{{ targetUser.email }}</p>
                <div class="role-tags mt-2">
                  <span
                    v-for="role in targetUser.roles"
                    :key="role"
                    :class="['role-badge', getRoleBadgeClass(role)]"
                  >{{ role.replace('_', ' ') }}</span>
                </div>
              </div>
            </div>

            <!-- Detail Grid -->
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span :class="['status-dot', getStatusIndicator(targetUser).cls]">
                  {{ getStatusIndicator(targetUser).text }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span>{{ targetUser.phone ?? '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span>{{ targetUser.location ?? '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Gender</span>
                <span>{{ targetUser.gender ?? '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date of Birth</span>
                <span>{{ targetUser.dob ?? '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Company ID</span>
                <span class="mono">{{ targetUser.companyId ?? '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Failed Attempts</span>
                <span>{{ targetUser.failedAttempts }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Lock Until</span>
                <span>{{ formatDate(targetUser.lockUntil) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Login</span>
                <span>{{ formatDate(targetUser.lastLoginAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created</span>
                <span>{{ formatDate(targetUser.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Updated</span>
                <span>{{ formatDate(targetUser.updatedAt) }}</span>
              </div>
              <div v-if="targetUser.linkedinUrl" class="detail-item">
                <span class="detail-label">LinkedIn</span>
                <a :href="targetUser.linkedinUrl" target="_blank" rel="noopener">{{ targetUser.linkedinUrl }}</a>
              </div>
              <div v-if="targetUser.githubUrl" class="detail-item">
                <span class="detail-label">GitHub</span>
                <a :href="targetUser.githubUrl" target="_blank" rel="noopener">{{ targetUser.githubUrl }}</a>
              </div>
              <div v-if="targetUser.portfolioUrl" class="detail-item">
                <span class="detail-label">Portfolio</span>
                <a :href="targetUser.portfolioUrl" target="_blank" rel="noopener">{{ targetUser.portfolioUrl }}</a>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDetailModal = false">Close</button>
            <button class="btn-primary" @click="showDetailModal = false; openEdit(targetUser!)">Edit</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Delete Confirmation ═══ -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm && targetUser" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Delete User</h2>
            <button class="modal-close" @click="showDeleteConfirm = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="delete-warning">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="1.5" class="warning-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p>Are you sure you want to delete <strong>{{ targetUser.fullName }}</strong>?</p>
              <p class="delete-sub">This action cannot be undone.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn-danger" :disabled="admin.userLoading" @click="submitDelete">
              {{ admin.userLoading ? 'Deleting…' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ═══ Page Layout ═══ */
.admin-users-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 4px;
}

/* ═══ Buttons ═══ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-primary:active:not(:disabled) { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  padding: 8px 16px;
  background: #fff;
  color: #374151;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-danger {
  padding: 8px 16px;
  background: var(--color-error);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-danger:hover:not(:disabled) { opacity: 0.9; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-icon { flex-shrink: 0; }

/* ═══ Loading / Empty ═══ */
.loading-state, .empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h2 { font-size: 1.125rem; margin-bottom: 8px; }
.empty-state p, .loading-state p { color: #6b7280; }

/* ═══ Table ═══ */
.table-container {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid var(--color-border);
}

.th-actions { text-align: right; }

.data-table td {
  padding: 12px 16px;
  font-size: 0.8125rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f9fafb; }

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.avatar-fallback.large {
  width: 56px;
  height: 56px;
  font-size: 1.25rem;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
}

.email-cell {
  color: #6b7280 !important;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem !important;
}

.date-cell {
  white-space: nowrap;
  color: #6b7280 !important;
  font-size: 0.75rem !important;
}

/* Role badges */
.role-tags { display: flex; flex-wrap: wrap; gap: 4px; }

.role-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.role-admin { background: #fef3c7; color: #92400e; }
.role-company { background: #dbeafe; color: #1e40af; }
.role-hr { background: #e0e7ff; color: #3730a3; }
.role-interviewer { background: #ede9fe; color: #5b21b6; }
.role-candidate { background: #d1fae5; color: #065f46; }
.role-cs { background: #fce7f3; color: #9d174d; }

/* Status */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-active::before { background: #22c55e; }
.status-active { color: #15803d; }
.status-locked::before { background: #ef4444; }
.status-locked { color: #dc2626; }
.status-inactive::before { background: #9ca3af; }
.status-inactive { color: #6b7280; }

/* Action buttons */
.action-btns {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #111827;
  border-color: var(--color-border);
}

.action-btn-danger:hover {
  background: #fef2f2;
  color: var(--color-error);
  border-color: #fecaca;
}

/* ═══ Pagination ═══ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 14px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s;
}

.page-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.page-info { font-size: 0.8125rem; color: #6b7280; }

/* ═══ Modal ═══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slide-up 0.2s ease;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-detail { max-width: 640px; }
.modal-sm { max-width: 420px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.15s;
}
.modal-close:hover { color: #374151; }

.modal-body { padding: 24px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
}

/* ═══ Form ═══ */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group.full-width { grid-column: 1 / -1; }

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.required { color: var(--color-error); }

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #111827;
  background: #fff;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 140, 140, 0.08);
}

/* ═══ Detail View ═══ */
.detail-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-profile h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.detail-email {
  font-size: 0.8125rem;
  color: #6b7280;
}

.mt-2 { margin-top: 8px; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
}

.detail-item span:not(.detail-label):not(.status-dot),
.detail-item a {
  font-size: 0.8125rem;
  color: #111827;
}

.detail-item a { color: var(--color-primary); }

.mono { font-family: ui-monospace, monospace; font-size: 0.6875rem !important; }

/* ═══ Delete Confirmation ═══ */
.delete-warning {
  text-align: center;
  padding: 8px 0;
}

.warning-icon {
  margin: 0 auto 16px;
  display: block;
}

.delete-warning p { margin-bottom: 4px; }
.delete-sub { font-size: 0.8125rem; color: #6b7280; }
</style>
