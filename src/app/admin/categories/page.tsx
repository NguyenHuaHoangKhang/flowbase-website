import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/ui';
import CategoryManager from './CategoryManager';

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  const categories = await prisma.systemCategory.findMany({
    where: { deletedAt: null },
    orderBy: [{ type: 'asc' }, { value: 'asc' }],
  });

  return (
    <>
      <PageHeader
        title="Danh mục hệ thống"
        description="Quản lý tập trung các Kênh liên hệ, Lĩnh vực chuyên môn."
      />
      <div className="mt-6">
        <CategoryManager initialCategories={categories} canEdit={user?.role === 'ADMIN' || user?.role === 'OWNER'} />
      </div>
    </>
  );
}
