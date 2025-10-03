/**
 * Role-based permission utilities for the project planner application
 * Provides centralized role checking and permission management
 */

import React from 'react';
import { UserRole } from '../lib/database.types';

export type RoleType = 'admin' | 'user' | 'moderator';

export interface UserWithRoles {
  id: string;
  email: string;
  roles: RoleType[];
}

export class RolePermissionManager {
  /**
   * Check if user has a specific role
   */
  static hasRole(user: UserWithRoles | null, role: RoleType): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }

  /**
   * Check if user has admin privileges
   */
  static isAdmin(user: UserWithRoles | null): boolean {
    return this.hasRole(user, 'admin');
  }

  /**
   * Check if user has moderator privileges
   */
  static isModerator(user: UserWithRoles | null): boolean {
    return this.hasRole(user, 'moderator') || this.isAdmin(user);
  }

  /**
   * Check if user has any elevated privileges (admin or moderator)
   */
  static hasElevatedPrivileges(user: UserWithRoles | null): boolean {
    return this.isAdmin(user) || this.hasRole(user, 'moderator');
  }

  /**
   * Check if user can perform project management actions
   */
  static canManageProjects(user: UserWithRoles | null): boolean {
    return this.hasElevatedPrivileges(user);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: UserWithRoles | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Check if user can view admin dashboard
   */
  static canAccessAdminDashboard(user: UserWithRoles | null): boolean {
    return this.hasElevatedPrivileges(user);
  }

  /**
   * Check if user can delete projects (admin only)
   */
  static canDeleteProjects(user: UserWithRoles | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Check if user can modify system settings
   */
  static canModifySystemSettings(user: UserWithRoles | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Get user's highest privilege level
   */
  static getHighestRole(user: UserWithRoles | null): RoleType | null {
    if (!user || !user.roles || user.roles.length === 0) return null;

    if (user.roles.includes('admin')) return 'admin';
    if (user.roles.includes('moderator')) return 'moderator';
    if (user.roles.includes('user')) return 'user';

    return null;
  }

  /**
   * Format role display name
   */
  static formatRoleName(role: RoleType): string {
    const roleNames = {
      admin: 'Administrator',
      moderator: 'Moderator',
      user: 'User'
    };
    return roleNames[role] || 'Unknown';
  }

  /**
   * Get role badge color for UI
   */
  static getRoleBadgeColor(role: RoleType): string {
    const colors = {
      admin: 'bg-red-500/20 text-red-300 border-red-400/30',
      moderator: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      user: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  }

  /**
   * Convert UserRole database records to user roles array
   */
  static extractRolesFromDatabase(userRoles: UserRole[]): RoleType[] {
    return userRoles.map(ur => ur.role);
  }

  /**
   * Check if user owns a resource (project, task, etc.)
   */
  static ownsResource(user: UserWithRoles | null, resourceUserId: string): boolean {
    return user?.id === resourceUserId;
  }

  /**
   * Check if user can access resource (owns it or has elevated privileges)
   */
  static canAccessResource(user: UserWithRoles | null, resourceUserId: string): boolean {
    return this.ownsResource(user, resourceUserId) || this.hasElevatedPrivileges(user);
  }

  /**
   * Check if user can modify resource (owns it or has admin privileges)
   */
  static canModifyResource(user: UserWithRoles | null, resourceUserId: string): boolean {
    return this.ownsResource(user, resourceUserId) || this.isAdmin(user);
  }
}

/**
 * Hook-like function for permission checking in React components
 */
export const usePermissions = (user: UserWithRoles | null) => {
  return {
    isAdmin: RolePermissionManager.isAdmin(user),
    isModerator: RolePermissionManager.isModerator(user),
    hasElevatedPrivileges: RolePermissionManager.hasElevatedPrivileges(user),
    canManageProjects: RolePermissionManager.canManageProjects(user),
    canManageUsers: RolePermissionManager.canManageUsers(user),
    canAccessAdminDashboard: RolePermissionManager.canAccessAdminDashboard(user),
    canDeleteProjects: RolePermissionManager.canDeleteProjects(user),
    canModifySystemSettings: RolePermissionManager.canModifySystemSettings(user),
    getHighestRole: () => RolePermissionManager.getHighestRole(user),
    hasRole: (role: RoleType) => RolePermissionManager.hasRole(user, role),
    ownsResource: (resourceUserId: string) => RolePermissionManager.ownsResource(user, resourceUserId),
    canAccessResource: (resourceUserId: string) => RolePermissionManager.canAccessResource(user, resourceUserId),
    canModifyResource: (resourceUserId: string) => RolePermissionManager.canModifyResource(user, resourceUserId),
  };
};

/**
 * Higher-order component for role-based rendering
 */
export interface RoleGuardProps {
  user: UserWithRoles | null;
  requiredRole?: RoleType;
  requiresElevated?: boolean;
  requiresAdmin?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  user,
  requiredRole,
  requiresElevated = false,
  requiresAdmin = false,
  fallback = null,
  children
}) => {
  if (requiresAdmin && !RolePermissionManager.isAdmin(user)) {
    return <>{fallback}</>;
  }

  if (requiresElevated && !RolePermissionManager.hasElevatedPrivileges(user)) {
    return <>{fallback}</>;
  }

  if (requiredRole && !RolePermissionManager.hasRole(user, requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};