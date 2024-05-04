export const roomFilterableFields: string[] = [
  'searchTerm',
  'id',
  'buildingId'
];

export const roomSearchableFields: string[] = ['title', 'floor'];

export const roomRelationalFields: string[] = ['buildingId'];
export const roomRelationalFieldsMapper: { [key: string]: string } = {
  buildingId: 'building'
};

export const EVENT_ROOMS_CREATED = 'rooms.created';
export const EVENT_ROOMS_UPDATED = 'rooms.updated';
export const EVENT_ROOMS_DELETED = 'rooms.deleted';
