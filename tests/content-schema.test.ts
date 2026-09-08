import { test, expect } from 'vitest'
import { collections } from '../src/content.config'

test('universal and dc collections exist', () => {
  expect(collections.universal).toBeDefined()
  expect(collections.dc).toBeDefined()
})
