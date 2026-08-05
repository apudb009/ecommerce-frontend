import { UserPermission } from '@/lib/types';

export function hasPermission(permissions: UserPermission[], module: string, action: string) {
  return permissions.some((p) => p.module === module && p.action === action);
}

// check if user has ANY permission for a module
// (read OR create OR update OR delete)
export function hasAnyPermission(permissions: UserPermission[], module: string): boolean {
  return permissions.some((p) => p.module === module);
}

// get all modules user has access to
export function getAllowedModules(permissions: UserPermission[]): string[] {
  return [...new Set(permissions.map((p) => p.module))];
}
