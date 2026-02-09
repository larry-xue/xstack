// Copy this file to src/modules/<module>/application/use-cases/index.ts
// and replace placeholder names.

import type { PlaceholderRepository } from './ports/placeholder-repository'

export type PlaceholderUseCases = {
  list: () => Promise<unknown[]>
}

export const createPlaceholderUseCases = (
  repository: PlaceholderRepository,
): PlaceholderUseCases => ({
  list: async () => repository.list(),
})
