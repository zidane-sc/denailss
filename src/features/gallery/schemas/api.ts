import { z } from "zod";

const taxonomy = {
  aspect: z.enum(["portrait", "square", "landscape", "tall"]),
  style: z.enum(["minimalist", "korean", "french", "chrome", "ombre", "3d-art"]),
  color: z.enum(["nude", "pink", "red", "white", "black", "pastel", "gold"]),
  occasion: z.enum(["daily", "wedding", "party", "festive", "graduation"]),
  shape: z.enum(["almond", "square", "coffin", "round", "stiletto"]),
  difficulty: z.enum(["easy", "medium", "complex", "very-complex"]),
} as const;

export const createGalleryDesignSchema = z.object({
  id: z.string().trim().min(1, "ID desain tidak valid."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug desain wajib diisi.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  title: z.string().trim().min(1, "Judul desain wajib diisi."),
  description: z.string().trim().default(""),
  imageSeeds: z.array(z.string().trim().min(1)).min(1, "Pilih minimal satu foto katalog."),
  aspect: taxonomy.aspect,
  style: taxonomy.style,
  color: taxonomy.color,
  occasion: taxonomy.occasion,
  shape: taxonomy.shape,
  difficulty: taxonomy.difficulty,
  price: z.number().int("Harga harus berupa angka bulat.").positive("Harga harus lebih dari 0."),
});

export const updateGalleryDesignSchema = createGalleryDesignSchema.omit({ id: true, slug: true });

export type CreateGalleryDesignInput = z.infer<typeof createGalleryDesignSchema>;
export type UpdateGalleryDesignInput = z.infer<typeof updateGalleryDesignSchema>;
