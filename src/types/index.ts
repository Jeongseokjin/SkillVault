export type UserRole = "admin" | "user";

export type SkillStatus = "pending" | "approved" | "rejected";

export type SkillPrice = "free" | "premium";

export type Category = "디자인/UI" | "개발" | "마케팅";

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[] | null;
  author_id: string;
  price: SkillPrice;
  downloads: number;
  rating: number;
  status: SkillStatus;
  file_url: string | null;
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillWithAuthor extends Skill {
  profiles: Pick<Profile, "username" | "avatar_url">;
}

export interface Review {
  id: string;
  skill_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewWithUser extends Review {
  profiles: Pick<Profile, "username" | "avatar_url">;
}

export interface Download {
  id: string;
  skill_id: string;
  user_id: string;
  created_at: string;
}

export interface DownloadWithSkill extends Download {
  skills: Pick<Skill, "title" | "category" | "preview_url">;
}
