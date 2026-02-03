import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function Home() {
  const { data } = useSWR('/api/stats', fetcher, { refreshInterval: 30000 })

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', padding: 24 }}>
      <h1>GDL Dashboard (MVP)</h1>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: 700 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Owner</th>
              <th>Total</th>
              <th>Completed</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.stats.map((s) => (
              <tr key={s.owner}>
                <td><b>{s.owner}</b></td>
                <td>{s.total}</td>
                <td>{s.completed}</td>
                <td>{s.completion_rate_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
