/**
 * Tabela simples.
 * columns: [{ key, label, render?(row), className?, width? }]
 */
export default function DataTable({ columns, rows, loading, error, empty = 'Nenhum registro encontrado.', rowKey = 'id' }) {
  let body
  if (error) {
    body = (
      <tr>
        <td colSpan={columns.length} className="table-empty text-danger">
          {error}
        </td>
      </tr>
    )
  } else if (loading) {
    body = (
      <tr>
        <td colSpan={columns.length} className="table-empty">
          Carregando…
        </td>
      </tr>
    )
  } else if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={columns.length} className="table-empty">
          {empty}
        </td>
      </tr>
    )
  } else {
    body = rows.map((row) => (
      <tr key={row[rowKey]}>
        {columns.map((col) => (
          <td key={col.key} className={col.className}>
            {col.render ? col.render(row) : row[col.key]}
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}
