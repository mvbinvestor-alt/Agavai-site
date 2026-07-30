import { isAdminAuthed } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  if (!isAdminAuthed()) {
    return <AdminLogin />;
  }

  return (
    <div className="admin-shell">
      <h2>Add a product</h2>
      <div className="admin-card">
        <ProductForm />
      </div>
    </div>
  );
}
