import fetch from 'node-fetch'

export default async function handler(req, res) {
  const NOTION_KEY = process.env.NOTION_API_KEY
  if (!NOTION_KEY) return res.status(500).json({ error: 'Missing NOTION_API_KEY' })

  const ds = '7f07369c-7f54-4629-a0a6-731197ce2074'
  const project_relation_id = '2f4aa213-758c-808d-98fc-fa2ee01b4cdb'
  const url = `https://api.notion.com/v1/data_sources/${ds}/query`

  let all = []
  let start_cursor = null

  while (true) {
    const body = {
      filter: { property: 'Project', relation: { contains: project_relation_id } },
      page_size: 100
    }
    if (start_cursor) body.start_cursor = start_cursor

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + NOTION_KEY,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const j = await r.json()
    if (!j.results) break
    all.push(...j.results)
    if (!j.has_more) break
    start_cursor = j.next_cursor
  }

  const stats = {}
  all.forEach(item => {
    const props = item.properties || {}
    const owners = (props.Owner && props.Owner.people && props.Owner.people.length)
      ? props.Owner.people.map(p => p.name || (p.person && p.person.email))
      : ['(unassigned)']
    const status = props.Status && props.Status.status && props.Status.status.name
    owners.forEach(o => {
      stats[o] = stats[o] || { owner: o, total: 0, completed: 0, completed_on_time: 0, completion_rate_pct: 0 }
      stats[o].total++
      if (status && status.toLowerCase() === 'done') stats[o].completed++
    })
  })

  const out = Object.values(stats).map(s => {
    s.completion_rate_pct = s.total ? Math.round(s.completed / s.total * 1000) / 10 : 0
    return s
  })

  res.json({ items_count: all.length, stats: out })
}
