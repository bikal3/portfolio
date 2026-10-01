export interface Row {
  label: string
  value: string
}

/**
 * Map-sheet record. Rows whose value is empty are dropped by the caller, not
 * rendered blank — a blank field reads as a gap in the work.
 */
export default function RecordTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null

  return (
    <table className="font-mono text-xs text-text-muted">
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label}>
            <th
              scope="row"
              className="pr-4 py-0.5 text-left font-normal text-text-faint align-top whitespace-nowrap"
            >
              {label}
            </th>
            <td className="py-0.5 align-top">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
