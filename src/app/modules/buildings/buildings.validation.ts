import { z } from "zod";

const createBuildingsZodSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "Title is required"
        })
    })
})

export const BuildingValidation = {
    createBuildingsZodSchema
}