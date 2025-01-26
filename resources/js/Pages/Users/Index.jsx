import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useSelector } from "react-redux";
import { translations } from '@translations';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'password', label: 'Password', sortable: true },
];

const data = [
  { name: 'samsung', image: '/path/to/image.jpg', slug: 'samsung', is_active: false },
];

export default function Users({ auth, users }) {
  const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const language = useSelector((state) => state.language.current);
  const t = translations[language];
  const breadcrumbItems = [
    { label: t['users'], href: '/users' },
    { label: t['list'] }
  ];
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title={t['users']} />
      <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <Breadcrumb items={breadcrumbItems} />
              <h1 className={`text-3xl font-bold ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>{t['users']}</h1>
            </div>
            <DataTable
              columns={columns}
              data={users.data}
              searchable={true}
              filterable={true}
              selectable={true}
              actions={true}
              onEdit={(row) => console.log('Edit', row)}
              onDelete={(row) => console.log('Delete', row)}
            />
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}