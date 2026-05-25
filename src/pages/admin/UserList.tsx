import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { User as UserType } from '../../types';
import AdminTable from '../../components/ui/AdminTable';

interface AdminUser extends UserType {
  createdAt: string;
}

export default function UserList() {
  const [page, setPage] = useState(0);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get<AdminUser[]>('/admin/users').then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const columns = [
    {
      key: 'id', header: 'ID', className: 'w-16', render: (u: AdminUser) => (
        <div className="w-8 h-8 bg-cherry/20 rounded-full flex items-center justify-center text-cherry text-xs font-bold">
          {u.id}
        </div>
      ),
    },
    { key: 'name', header: 'Name', render: (u: AdminUser) => <span className="font-medium text-white">{u.fullName}</span> },
    { key: 'email', header: 'Email', render: (u: AdminUser) => <span className="font-mono text-white/50 text-sm">{u.email}</span> },
    { key: 'role', header: 'Role', render: (u: AdminUser) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        u.role === 'ADMIN' ? 'bg-cherry/20 text-cherry' : 'bg-white/10 text-white/60'
      }`}>
        {u.role}
      </span>
    )},
    { key: 'created', header: 'Created', render: (u: AdminUser) => <span className="text-white/30 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Users</h1>

      <AdminTable
        columns={columns}
        data={users}
        loading={isLoading}
        onPageChange={setPage}
        emptyMessage="No users"
      />
    </div>
  );
}
