import { useQuery } from '@tanstack/react-query'
import { api } from './sdk'
import './App.css'

function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await api.health.get()
      if (error) {
        throw new Error(`Health check failed (${error.status})`)
      }
      if (!data) {
        throw new Error('Health check returned empty response')
      }
      return data
    },
    retry: false,
  })

  return (
    <main className="app">
      <h1>Home</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="error">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>}
      {data && <p className="status">ok: {String(data.ok)}</p>}
    </main>
  )
}

export default App
