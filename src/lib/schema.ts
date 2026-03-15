import { z } from "zod";

export const searchSchema = z
  .object({
    from: z.string().min(2),
    to: z.string().min(2),
    departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().default(""),
    oneWay: z.string().optional().default("false").transform((v) => v === "true"),
    passengers: z.string().optional().default("1").transform((v) => Number(v)),
    cabin: z.enum(["economy", "premium", "business", "first"]).optional().default("economy"),
    carryOn: z.string().optional().default("1").transform((v) => Number(v)),
    checked: z.string().optional().default("0").transform((v) => Number(v)),
    flexible: z.string().optional().default("false").transform((v) => v === "true")
  })
  .refine((x) => x.oneWay || !!x.returnDate, { message: "returnDate required unless oneWay" });
