import type { ApartmentDetails, Floor, RoomCategory } from '@/data/types';
import { distinctUnitTypeName, formatApartmentCode, formatArea, formatFloor } from './format';

/** What a lead is about: the whole project, one building, or one apartment for sale. */
export interface LeadSubject {
  readonly projectName: string;
  readonly buildingName?: string;
  readonly apartment?: {
    readonly id: string;
    readonly unitTypeName: string;
    readonly category: RoomCategory;
    readonly areaM2: number;
    readonly floor: Floor;
  };
}

export function apartmentSubject(projectName: string, buildingName: string, apartment: ApartmentDetails): LeadSubject {
  return {
    projectName,
    buildingName,
    apartment: {
      id: apartment.id,
      unitTypeName: apartment.unitType.name,
      category: apartment.unitType.category,
      areaM2: apartment.unitType.areaM2,
      floor: apartment.floor,
    },
  };
}

/**
 * Label/value rows describing the subject, shown at the top of the form. The type row appears only
 * when the unit type has its own name; otherwise it would repeat the area.
 */
export function describeSubject(subject: LeadSubject): { label: string; value: string }[] {
  const { apartment, buildingName } = subject;
  const typeName = apartment
    ? distinctUnitTypeName({ name: apartment.unitTypeName, category: apartment.category, areaM2: apartment.areaM2 })
    : null;
  return [
    ...(apartment ? [{ label: 'Banesa', value: formatApartmentCode(apartment.id) }] : []),
    ...(buildingName ? [{ label: 'Objekti', value: buildingName }] : []),
    ...(typeName ? [{ label: 'Tipi', value: typeName }] : []),
    ...(apartment
      ? [
          { label: 'Sipërfaqja', value: formatArea(apartment.areaM2) },
          { label: 'Kati', value: formatFloor(apartment.floor) },
        ]
      : []),
  ];
}

interface WhatsappMessageInput {
  readonly subject: LeadSubject;
  readonly name: string;
  readonly message?: string;
}

/** Pre-written Albanian WhatsApp message that repeats the lead so the sales office can reply in chat. */
export function buildWhatsappMessage({ subject, name, message }: WhatsappMessageInput): string {
  const { apartment, buildingName, projectName } = subject;
  const topic = apartment
    ? `banesa ${formatApartmentCode(apartment.id)} në ${projectName}`
    : buildingName
      ? `një banesë në ${buildingName}, ${projectName}`
      : `një banesë në ${projectName}`;
  // The code is already in the sentence above. The message always names the unit type, as specified
  // for the hand-off, even where the page leaves the type row out.
  const details = apartment
    ? [
        ...(buildingName ? [`• Objekti: ${buildingName}`] : []),
        `• Tipi: ${apartment.unitTypeName}`,
        `• Sipërfaqja: ${formatArea(apartment.areaM2)}`,
        `• Kati: ${formatFloor(apartment.floor)}`,
      ]
    : [];
  const note = message?.trim();

  return [
    `Përshëndetje, jam ${name.trim()}.`,
    `Më intereson ${topic}.`,
    ...(details.length > 0 ? ['', ...details] : []),
    ...(note ? ['', note] : []),
    '',
    'Sapo dërgova kërkesën edhe përmes faqes. Faleminderit!',
  ].join('\n');
}
