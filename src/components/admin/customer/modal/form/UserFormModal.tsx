import api from '@/lib/api';
import { Role, User } from '@/lib/types';
import { Users } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import {
  FieldErrors,
  required,
  stringLength,
  pattern,
  emailValid,
  USERNAME_PATTERN,
  compact,
} from '@/lib/validators';

type Props = {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
};

type Errors = FieldErrors<'name' | 'username' | 'email' | 'password' | 'roleId'>;

// ── USER FORM MODAL ─────────────────────────────────
const UserFormModal: FC<Props> = ({ user, onClose, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    role: 'CUSTOMER',
    password: '',
    roleId: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    const usernameError =
      required(form.username, 'Username') ||
      stringLength(form.username, 'Username', { min: 3, max: 30 }) ||
      pattern(
        form.username,
        'Username',
        USERNAME_PATTERN,
        'letters, numbers, underscores, and periods only',
      );

    let passwordError: string | undefined;
    if (!isEdit) {
      passwordError =
        required(form.password, 'Password') || stringLength(form.password, 'Password', { min: 8 });
    } else if (form.password) {
      // editing: password optional, but if they typed one it must meet the bar
      passwordError = stringLength(form.password, 'Password', { min: 8 });
    }

    const nameError = required(form.name, 'Name') || stringLength(form.name, 'Name', { max: 100 });

    return compact({
      name: nameError,
      username: usernameError,
      email: emailValid(form.email),
      password: passwordError,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const trimmed = {
        ...form,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      };
      if (isEdit) {
        const payload: Partial<User> = { ...trimmed };
        if (!payload.password) delete payload.password;
        await api.patch(`/user/admin/${user.id}`, payload);
        toast.success('Customer updated');
      } else {
        await api.post('/user/admin', trimmed);
        toast.success('Customer created');
      }
      onSaved();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const errorClass = (field: keyof Errors) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Users className="h-5 w-5 text-blue-600" />
          {isEdit ? 'Edit Customer' : 'Create Customer'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  clearError('name');
                }}
                placeholder="John Doe"
                className={errorClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Username</label>
              <input
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  clearError('username');
                }}
                placeholder="johndoe"
                className={errorClass('username')}
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                clearError('email');
              }}
              placeholder="john@example.com"
              className={errorClass('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                clearError('password');
              }}
              placeholder="••••••••"
              className={errorClass('password')}
              autoComplete="new-password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
