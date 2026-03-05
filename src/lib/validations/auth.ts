import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 2;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요"),
});

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식이 아닙니다"),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, `유저명은 ${MIN_USERNAME_LENGTH}자 이상이어야 합니다`)
      .max(MAX_USERNAME_LENGTH, `유저명은 ${MAX_USERNAME_LENGTH}자 이하여야 합니다`)
      .regex(/^[a-zA-Z0-9가-힣_]+$/, "유저명은 영문, 한글, 숫자, 밑줄만 사용 가능합니다"),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`),
    confirmPassword: z
      .string()
      .min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
