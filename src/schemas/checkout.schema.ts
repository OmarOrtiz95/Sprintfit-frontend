import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  firstName: z.string().min(2, 'El nombre es requerido'),
  lastName: z.string().min(2, 'El apellido es requerido'),
  cedula: z.string().min(5, 'La cédula es requerida'),
  address: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  department: z.string().min(2, 'El departamento es requerido'),
  phone: z.string().min(7, 'El teléfono es requerido'),
  nequiPhone: z.string().min(10, 'El teléfono de Nequi debe tener 10 dígitos').max(10, 'El teléfono de Nequi debe tener 10 dígitos'),
  useSameAddress: z.boolean().default(true),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingDepartment: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
