import z from "zod";

export const bookTicketSchema = z.object({
  seatId: z.string(),
  userId: z.uuid(),
});

export type bookTicketData = z.infer<typeof bookTicketSchema>;

export const getSeatSchema = z.object({
  showId: z.string(),
});

export type getSeatData = z.infer<typeof getSeatSchema>;
