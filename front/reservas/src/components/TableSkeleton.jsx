function TableSkeleton({ rows = 4, cols = 6 }) {
    return Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: cols }, (_, j) => (
                <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    ))
}

export default TableSkeleton