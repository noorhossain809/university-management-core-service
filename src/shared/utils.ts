export const asyncForEch = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error('Expected an array');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], array, index);
  }
};

export const hasConflictTime = (
  existingSlots: {
    startTime: string;
    endTime: string;
    dayOfWeek: string;
  }[],
  newSlots: {
    startTime: string;
    endTime: string;
    dayOfWeek: string;
  }
) => {
  for (const slot of existingSlots) {
    const existingStart = new Date(`1970-01-01T${slot.startTime}:00`);
    const existingEnd = new Date(`1970-01-01T${slot.endTime}:00`);
    const newStart = new Date(`1970-01-01T${newSlots.startTime}:00`);
    const newEnd = new Date(`1970-01-01T${newSlots.startTime}:00`);

    if (newStart <= existingEnd && newEnd >= existingStart) {
      return true;
    }
  }
  return false;
};
