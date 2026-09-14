import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(7, "A senha deve ter no mínimo 7 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
