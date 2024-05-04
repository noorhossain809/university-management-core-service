import { z } from 'zod';

const createRoomZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required'
    }),
    floor: z.string({
      required_error: 'Floor is required'
    }),
    buildingId: z.string({
      required_error: 'Building is required'
    })
  })
});
const updateRoomZodSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required'
      })
      .optional(),
    floor: z
      .string({
        required_error: 'Floor is required'
      })
      .optional(),
    buildingId: z
      .string({
        required_error: 'Building is required'
      })
      .optional()
  })
});

export const RoomValidation = {
  createRoomZodSchema,
  updateRoomZodSchema
};
