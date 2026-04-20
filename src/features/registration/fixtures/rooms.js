/**
 * Representative rooms per type with status.
 * status: 'available' | 'occupied' | 'oos' (out-of-service) | 'conflict'
 * The 'conflict' status is a sentinel used by the mock to simulate 409 on lock.
 */
export const rooms = [
  { id: 'rm-101', number: '101', typeId: 'rt-deluxe', status: 'available', floor: 1 },
  { id: 'rm-102', number: '102', typeId: 'rt-deluxe', status: 'available', floor: 1 },
  { id: 'rm-103', number: '103', typeId: 'rt-deluxe', status: 'occupied', floor: 1 },
  { id: 'rm-104', number: '104', typeId: 'rt-deluxe', status: 'conflict', floor: 1 },
  { id: 'rm-201', number: '201', typeId: 'rt-super-deluxe', status: 'available', floor: 2 },
  { id: 'rm-202', number: '202', typeId: 'rt-super-deluxe', status: 'available', floor: 2 },
  { id: 'rm-203', number: '203', typeId: 'rt-super-deluxe', status: 'oos', floor: 2 },
  { id: 'rm-301', number: '301', typeId: 'rt-business-twin', status: 'available', floor: 3 },
  { id: 'rm-302', number: '302', typeId: 'rt-business-king', status: 'available', floor: 3 },
  { id: 'rm-303', number: '303', typeId: 'rt-business-king', status: 'occupied', floor: 3 },
  { id: 'rm-401', number: '401', typeId: 'rt-executive-suite', status: 'available', floor: 4 },
  { id: 'rm-402', number: '402', typeId: 'rt-executive-suite', status: 'available', floor: 4 },
  { id: 'rm-501', number: '501', typeId: 'rt-signature-suite', status: 'available', floor: 5 },
  { id: 'rm-502', number: '502', typeId: 'rt-signature-suite', status: 'occupied', floor: 5 },
  { id: 'rm-601', number: '601', typeId: 'rt-pm-room', status: 'available', floor: 6 },
  { id: 'rm-602', number: '602', typeId: 'rt-pm-room', status: 'available', floor: 6 },
  { id: 'rm-701', number: '701', typeId: 'rt-premier-room', status: 'available', floor: 7 },
  { id: 'rm-702', number: '702', typeId: 'rt-junior-suite', status: 'available', floor: 7 },
]
