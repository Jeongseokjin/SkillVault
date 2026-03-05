import { z } from "zod";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CATEGORIES = ["디자인/UI", "개발", "마케팅"] as const;

export const skillUploadSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(MAX_TITLE_LENGTH, `제목은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`),
  description: z
    .string()
    .min(1, "설명을 입력해주세요")
    .max(MAX_DESCRIPTION_LENGTH, `설명은 ${MAX_DESCRIPTION_LENGTH}자 이하여야 합니다`),
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({ message: "카테고리를 선택해주세요" }),
  }),
  price: z.enum(["free", "premium"]),
});

export { MAX_FILE_SIZE, ALLOWED_CATEGORIES };

export type SkillUploadFormData = z.infer<typeof skillUploadSchema>;
