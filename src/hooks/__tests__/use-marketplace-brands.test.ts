import { renderHook, act, waitFor } from '@testing-library/react'
import { useMarketplaceBrands } from '../use-marketplace-brands'

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

describe('useMarketplaceBrands', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('debe cargar las marcas al inicializar', async () => {
    const mockBrands = {
      data: {
        items: [
          { id: '1', name: 'Marca 1' },
          { id: '2', name: 'Marca 2' },
        ],
        total_count: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      },
    }

    const mockStats = {
      data: { total: 2, active: 2, inactive: 0 },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBrands,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

    const { result } = renderHook(() => useMarketplaceBrands())

    // Inicialmente debe estar cargando
    expect(result.current.loading).toBe(true)
    expect(result.current.brands).toEqual([])

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.brands).toEqual(mockBrands.data.items)
    expect(result.current.stats).toEqual(mockStats.data)
    expect(result.current.pagination.totalCount).toBe(2)
  })

  it('debe manejar errores al cargar marcas', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useMarketplaceBrands())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.brands).toEqual([])
  })

  it('debe actualizar filtros y recargar datos', async () => {
    const mockBrands = {
      data: {
        items: [{ id: '1', name: 'Marca filtrada' }],
        total_count: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      },
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockBrands,
    })

    const { result } = renderHook(() => useMarketplaceBrands())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Actualizar filtros
    act(() => {
      result.current.updateFilters({ search: 'filtrada' })
    })

    // Debe volver a cargar
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar que se llamó con los filtros correctos
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 2]
    expect(lastCall[0]).toContain('search=filtrada')
  })

  it('debe crear una nueva marca', async () => {
    const newBrand = { name: 'Nueva Marca', code: 'NM' }
    const createdBrand = { id: '3', ...newBrand }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { items: [], total_count: 0 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { total: 0 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createdBrand }),
      })

    const { result } = renderHook(() => useMarketplaceBrands())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Crear marca
    await act(async () => {
      const created = await result.current.createBrand(newBrand)
      expect(created).toEqual(createdBrand)
    })

    // Verificar que se llamó al endpoint correcto
    const createCall = mockFetch.mock.calls.find(call => 
      call[1]?.method === 'POST'
    )
    expect(createCall).toBeDefined()
    expect(JSON.parse(createCall[1].body)).toEqual(newBrand)
  })

  it('debe manejar paginación', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          items: [],
          total_count: 50,
          page: 2,
          page_size: 10,
          total_pages: 5,
        },
      }),
    })

    const { result } = renderHook(() => useMarketplaceBrands({ 
      initialFilters: { page: 2 } 
    }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.pagination.totalPages).toBe(5)
    expect(result.current.pagination.pageSize).toBe(10)
  })
})