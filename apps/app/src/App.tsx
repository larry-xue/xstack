import { useQuery } from '@tanstack/react-query'
import { sdk } from './sdk'
import './App.css'

function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await sdk.health()
      if (response.status !== 200) {
        throw new Error(`Health check failed (${response.status})`)
      }
      return response.body
    },
    retry: false,
  })

  return (
    <main className="app">
      <h1>Home</h1>
      {isLoading && <p>Loading…</p>}
      {isError && <p className="error">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>}
      {data && <p className="status">ok: {String(data.ok)}</p>}
    </main>
  )
}

export default App
