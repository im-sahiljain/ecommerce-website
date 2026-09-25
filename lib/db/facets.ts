import type { CategoryFacet } from './types';
import type { Db } from './pool';

export async function getFacets(db: Db): Promise<CategoryFacet[]> {
  return [];
}

export async function addFacet(db: Db, facet: Omit<CategoryFacet, 'id'>): Promise<CategoryFacet> {
  return { ...facet, id: `facet-${Date.now()}` };
}

export async function updateFacet(db: Db, _id: string, _updates: Partial<CategoryFacet>): Promise<CategoryFacet | null> {
  return null;
}

export async function deleteFacet(db: Db, _id: string): Promise<boolean> {
  return false;
}
