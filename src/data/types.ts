/**
 * Domain model shared by every Pozhegu project.
 * Hierarchy: Project → Building[] → UnitType[] + Apartment[] (apartments reference their unit type).
 */

export type ApartmentStatus = 'available' | 'reserved' | 'sold';

/** Floor number: 0 is the ground floor ("Përdhesë"), 1 the first floor above it. */
export type Floor = number;

/**
 * Room category as Pozhegu groups its units: studio ("Garsonierë"), n bedrooms ("n dhomëshe")
 * or penthouse. Penthouses are a category, not a floor: they sit on numbered upper floors.
 */
export type RoomCategory =
  { readonly kind: 'studio' } | { readonly kind: 'bedrooms'; readonly count: number } | { readonly kind: 'penthouse' };

export interface ImageSize {
  readonly width: number;
  readonly height: number;
}

export interface Stat {
  readonly id: string;
  readonly value: number;
  readonly label: string;
  readonly unit?: string;
}

export interface ImageVariant {
  readonly width: number;
  readonly avif: string;
  readonly webp: string;
  readonly jpeg: string;
}

/**
 * A render with responsive variants. `width` × `height` is the original's real pixel size, which is
 * also the coordinate space of any polygon traced on it.
 */
export interface RenderImage {
  /** Untouched original in public/renders/<project>/original/. */
  readonly original: string;
  readonly width: number;
  readonly height: number;
  /** Ascending by width. */
  readonly variants: readonly ImageVariant[];
}

export interface ProjectImage {
  readonly image: RenderImage;
  readonly alt: string;
  readonly caption?: string;
}

export interface ProjectIntro {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/** A published floor plan and what it shows, for its alt text. */
export interface FloorPlan {
  readonly image: RenderImage;
  /** Rooms as drawn on the plan, e.g. "dy dhoma gjumi, … dhe ballkon". */
  readonly description: string;
}

export interface UnitType {
  /** Unique within a building, derived from category and area, e.g. "tipi-96-26". */
  readonly id: string;
  /** Display name, e.g. "Tipi 96,26 m²" or "Penthouse 139,44 m²". */
  readonly name: string;
  readonly category: RoomCategory;
  readonly areaM2: number;
  /** Floor plan, when Pozhegu has published one. */
  readonly plan?: FloorPlan;
  /** Pozhegu's page for this unit type. */
  readonly source?: string;
}

/**
 * An apartment Pozhegu lists for sale, with its unit type. Every listed apartment is currently
 * "available"; "reserved" and "sold" are kept for when a live sales feed exists.
 */
export interface Apartment {
  /** Unique across the project; used in the URL. */
  readonly id: string;
  readonly unitTypeId: string;
  readonly buildingId: string;
  readonly floor: Floor;
  readonly status: ApartmentStatus;
  /** SVG path in the building render's pixel space. Absent until traced. */
  readonly svgPath?: string;
}

/**
 * A unit on a traced facade that is no longer for sale. It has an id and a floor but no unit type,
 * area or details: it never appears in the apartment list and has no page of its own.
 */
export interface SoldUnit {
  /** e.g. "l9-s-0301": building, "s", two-digit floor, two-digit sequence on that floor. */
  readonly id: string;
  readonly buildingId: string;
  readonly floor: Floor;
  /** SVG path in the building render's pixel space. */
  readonly svgPath?: string;
}

export interface Building {
  /** URL slug, e.g. "objekti-h4". */
  readonly id: string;
  readonly name: string;
  /** SVG path in the overview render's pixel space. Absent if not traced or not visible on it. */
  readonly svgPath?: string;
  /** The building's own render. Absent when none exists: the building page is then text-led. */
  readonly render?: RenderImage;
  readonly unitTypes: readonly UnitType[];
  /** Apartments listed for sale. */
  readonly apartments: readonly Apartment[];
  /** Sold units traced on the building render (illustrative until a live sales feed exists). */
  readonly soldUnits: readonly SoldUnit[];
}

export interface ProjectOverview {
  readonly image: RenderImage;
  /** Buildings visible on this render, i.e. the ones that can get a polygon on it. */
  readonly buildingIds: readonly string[];
}

export interface Project {
  /** URL-safe slug. */
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly tagline: string;
  readonly description: string;
  readonly intro: ProjectIntro;
  readonly heroImage: RenderImage;
  /** Supporting renders for the project section. */
  readonly gallery: readonly ProjectImage[];
  /** Render showing several buildings, used by the building selector. Absent: list only. */
  readonly overview?: ProjectOverview;
  /** Project-level counters, derived from the inventory. Company-wide figures live in config/company.ts. */
  readonly stats: readonly Stat[];
  readonly buildings: readonly Building[];
}

/** An apartment joined with its unit type — the shape most UI components need. */
export interface ApartmentDetails extends Apartment {
  readonly unitType: UnitType;
}
