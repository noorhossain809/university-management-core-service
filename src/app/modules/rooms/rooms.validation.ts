import { z } from 'zod';

const createRoomZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required'
    }),
    buildingId: z.string({
      required_error: 'Building is required'
    })
  })
});

export const RoomValidation = {
  createRoomZodSchema
};
