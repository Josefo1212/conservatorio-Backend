// Utilidades comunes
import { Response } from 'express';
import { MESSAGES, HTTP_STATUS } from './constants';

// Helper para respuestas de éxito
export function successResponse(res: Response, message: string, data?: any, status: number = HTTP_STATUS.OK) {
  return res.status(status).json({ message, data });
}

// Helper para respuestas de error
export function errorResponse(res: Response, message: string, status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
  return res.status(status).json({ message });
}

// Helper para validar campos requeridos
export function validateRequired(fields: Record<string, any>, required: string[]): string | null {
  for (const field of required) {
    if (!fields[field]) {
      return `${field} es requerido`;
    }
  }
  return null;
}

// Helper para verificar roles
export function hasRequiredRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}