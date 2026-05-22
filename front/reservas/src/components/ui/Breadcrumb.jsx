export function Breadcrumb({ items = [] }) {
    return (
        <nav className="flex items-center gap-1 text-sm mb-6">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                    {i > 0 && (
                        <span className="text-gray-300 mx-1">/</span>
                    )}
                    {item.href ? (
                    <a
                        href={item.href}
                        className="text-gray-400 hover:text-blue-900 transition-colors"
                    >
                        {item.texto}
                    </a>
                    ) : (
                        <span className="text-blue-900 font-semibold">
                            {item.texto}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    )
}