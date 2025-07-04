import { renderHook, act, waitFor } from '@testing-library/react'
import { useMarketplaceCategories } from '../use-marketplace-categories'

// Mock de las APIs
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock del contexto de autenticación
jest.mock('../use-auth', () => ({
  useAuth: () => ({
    adminToken: 'mock-token',
    isAdminAuthenticated: true,
  }),
}))

describe('useMarketplaceCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('debe cargar categorías con estructura jerárquica', async () => {
    const mockCategories = {
      data: {
        items: [
          {
            id: '1',
            name: 'Categoría Padre',
            level: 0,
            parent_id: null,
            children_count: 2,
          },
          {
            id: '2',
            name: 'Categoría Hija 1',
            level: 1,
            parent_id: '1',
            children_count: 0,
          },
          {
            id: '3',
            name: 'Categoría Hija 2',
            level: 1,
            parent_id: '1',
            children_count: 0,
          },
        ],
        total_count: 3,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })

    const { result } = renderHook(() => useMarketplaceCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories).toHaveLength(3)
    expect(result.current.rootCategories).toHaveLength(1)
    expect(result.current.rootCategories[0].id).toBe('1')
  })

  it('debe construir árbol de categorías correctamente', async () => {
    const mockCategories = {
      data: {
        items: [
          { id: '1', name: 'A', level: 0, parent_id: null },
          { id: '2', name: 'A.1', level: 1, parent_id: '1' },
          { id: '3', name: 'A.1.1', level: 2, parent_id: '2' },
          { id: '4', name: 'B', level: 0, parent_id: null },
        ],
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })

    const { result } = renderHook(() => useMarketplaceCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const tree = result.current.categoryTree
    expect(tree).toHaveLength(2) // A y B
    expect(tree[0].children).toHaveLength(1) // A.1
    expect(tree[0].children[0].children).toHaveLength(1) // A.1.1
  })

  it('debe mover categoría a nueva posición', async () => {
    const mockCategories = {
      data: {
        items: [
          { id: '1', name: 'A', parent_id: null },
          { id: '2', name: 'B', parent_id: null },
          { id: '3', name: 'C', parent_id: '1' },
        ],
      },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '3', parent_id: '2' } }),
      })

    const { result } = renderHook(() => useMarketplaceCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mover categoría C de A a B
    await act(async () => {
      await result.current.moveCategory('3', '2')
    })

    // Verificar que se llamó al endpoint correcto
    const moveCall = mockFetch.mock.calls.find(
      call => call[1]?.method === 'PATCH'
    )
    expect(moveCall).toBeDefined()
    expect(JSON.parse(moveCall[1].body)).toEqual({ parent_id: '2' })
  })

  it('debe obtener breadcrumb de una categoría', async () => {
    const mockCategories = {
      data: {
        items: [
          { id: '1', name: 'Nivel 1', parent_id: null, level: 0 },
          { id: '2', name: 'Nivel 2', parent_id: '1', level: 1 },
          { id: '3', name: 'Nivel 3', parent_id: '2', level: 2 },
        ],
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })

    const { result } = renderHook(() => useMarketplaceCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const breadcrumb = result.current.getCategoryBreadcrumb('3')
    expect(breadcrumb).toHaveLength(3)
    expect(breadcrumb[0].name).toBe('Nivel 1')
    expect(breadcrumb[1].name).toBe('Nivel 2')
    expect(breadcrumb[2].name).toBe('Nivel 3')
  })

  it('debe filtrar categorías por búsqueda', async () => {
    const mockCategories = {
      data: {
        items: [
          { id: '1', name: 'Electrónica' },
          { id: '2', name: 'Ropa' },
          { id: '3', name: 'Electrodomésticos' },
        ],
      },
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCategories,
    })

    const { result } = renderHook(() => useMarketplaceCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Aplicar filtro
    act(() => {
      result.current.updateFilters({ search: 'electr' })
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=electr'),
        expect.any(Object)
      )
    })
  })
})