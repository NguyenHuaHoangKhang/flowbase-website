import { redirect } from 'next/navigation';
import { listUsers } from '@/server/repositories';
import { getCurrentUser } from '@/lib/session';
import { relativeTime, formatDate } from '@/lib/format';
import { RESOURCES, can, canAccess } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/lib/types';
import { PageHeader, DataTable, StatusBadge, KpiCard, type Column } from '@/components/admin/ui';
import UsersHeaderActions from '@/components/admin/users/UsersHeaderActions';
import UserRowActions from '@/components/admin/users/UserRowActions';

const roles: UserRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];

const roleTones: Record<UserRole, string> = {
  OWNER: 'bg-[#818CF8]/15 text-[#4338CA] border-[#818CF8]/30',
  ADMIN: 'bg-[#38BDF8]/15 text-[#0369A1] border-[#38BDF8]/30',
  EDITOR: 'bg-[#FBBF24]/15 text-[#B45309] border-[#FBBF24]/30',
  VIEWER: 'bg-[#94A3B8]/15 text-[#475569] border-[#94A3B8]/30',
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'user')) {
    redirect('/admin');
  }

  const users = await listUsers();

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const invitedCount = users.filter((u) => u.status === 'INVITED').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Thành viên',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {u.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{u.name}</span>
              {u.id === currentUser.id && (
                <span className="rounded bg-[#F1F3F6] px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                  Bạn
                </span>
              )}
            </div>
            <div className="truncate text-xs text-muted">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      cell: (u) => (
        <span
          className={cn(
            'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11.5px] font-semibold',
            roleTones[u.role],
          )}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (u) => <StatusBadge value={u.status} />,
    },
    {
      key: 'lastLogin',
      header: 'Đăng nhập cuối',
      cell: (u) => <span className="text-xs text-muted">{relativeTime(u.lastLoginAt)}</span>,
    },
    {
      key: 'created',
      header: 'Tham gia',
      cell: (u) => <span className="text-xs text-muted">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cell: (u) => <UserRowActions user={u} currentUserId={currentUser.id} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Người dùng & Phân quyền"
        description="Chỉ vai trò OWNER mới được phân quyền, mời thành viên hoặc khoá tài khoản."
        actions={<UsersHeaderActions />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tổng người dùng" value={users.length} hint="Tất cả tài khoản trong hệ thống" />
        <KpiCard label="Đang hoạt động" value={activeCount} hint="Tài khoản sẵn sàng làm việc" tone="success" />
        <KpiCard label="Chờ kích hoạt" value={invitedCount} hint="Lời mời đã gửi qua email" tone="warning" />
        <KpiCard label="Đã khoá" value={suspendedCount} hint="Tài khoản bị vô hiệu hoá" tone={suspendedCount > 0 ? 'danger' : 'default'} />
      </div>

      <DataTable columns={columns} rows={users} empty={{ title: 'Chưa có người dùng' }} />

      <section className="mt-10">
        <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.02em]">Ma trận phân quyền hệ thống</h2>
        <p className="mb-4 text-[13px] text-muted">
          Bảng này sinh trực tiếp từ <code className="font-mono text-xs">src/lib/rbac.ts</code>. Cấu hình tại đây tự động đồng bộ sang tất cả trang admin và API.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="border-b border-border px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Tài nguyên (Resource)
                </th>
                {roles.map((r) => (
                  <th key={r} className="border-b border-border px-4 py-3 text-center text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((resource) => (
                <tr key={resource} className="hover:bg-[#F9FAFB]/60">
                  <td className="border-b border-[#F1F3F6] px-4 py-2.5 font-mono text-[13px] font-medium text-[#334155]">
                    {resource}
                  </td>
                  {roles.map((role) => {
                    const actions = (['read', 'create', 'update', 'delete'] as const).filter((a) =>
                      can(role, resource, a),
                    );
                    return (
                      <td key={role} className="border-b border-[#F1F3F6] px-4 py-2.5 text-center">
                        {actions.length === 0 ? (
                          <span className="text-muted/60">—</span>
                        ) : (
                          <span className="inline-block rounded bg-primary/10 px-2 py-0.5 font-mono text-[11.5px] font-semibold text-primary">
                            {actions.map((a) => a[0].toUpperCase()).join('')}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2.5 text-[12px] text-muted">
          <b className="font-semibold text-[#1E293B]">Quy ước ký tự:</b> R = read · C = create · U = update · D = delete
        </p>
      </section>
    </>
  );
}
