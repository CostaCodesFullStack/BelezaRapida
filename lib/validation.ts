/**
 * Funções de validação para o e-commerce
 */

/**
 * Valida CPF brasileiro
 */
export function validateCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

/**
 * Valida CEP brasileiro (8 dígitos)
 */
export function validateCep(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida senha (mínimo 6 caracteres)
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return { valid: false, message: "A senha deve ter no mínimo 6 caracteres" };
  }
  return { valid: true };
}

/**
 * Remove caracteres não numéricos
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Interface para erros de validação de formulário
 */
export interface ValidationErrors {
  [key: string]: string | undefined;
}

/**
 * Valida dados de endereço
 */
export function validateAddress(data: {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!validateCep(data.cep)) {
    errors.cep = "CEP inválido";
  }

  if (!data.street.trim()) {
    errors.street = "Rua é obrigatória";
  }

  if (!data.number.trim()) {
    errors.number = "Número é obrigatório";
  }

  if (!data.neighborhood.trim()) {
    errors.neighborhood = "Bairro é obrigatório";
  }

  if (!data.city.trim()) {
    errors.city = "Cidade é obrigatória";
  }

  if (!data.state.trim() || data.state.length !== 2) {
    errors.state = "Estado inválido";
  }

  return errors;
}

/**
 * Valida dados do cliente no checkout
 */
export function validateCustomerData(data: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim() || data.name.trim().split(" ").length < 2) {
    errors.name = "Nome completo é obrigatório";
  }

  if (!validateEmail(data.email)) {
    errors.email = "Email inválido";
  }

  if (!validateCpf(data.cpf)) {
    errors.cpf = "CPF inválido";
  }

  if (!validatePhone(data.phone)) {
    errors.phone = "Telefone inválido";
  }

  return errors;
}

// Zod schemas para validação em APIs

import { z } from "zod";

export const checkoutFormSchema = z.object({
  // Identificação
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  cpf: z.string().regex(/^\d{11}$/, "CPF inválido"),

  // Endereço
  zipCode: z.string().regex(/^\d{8}$/, "CEP inválido"),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro é obrigatório"),
  city: z.string().min(3, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ser 2 caracteres (ex: SP, RJ)"),

  // Consentimentos
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar a política de privacidade",
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
