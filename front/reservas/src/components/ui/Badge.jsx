/* =========================================================================
   DAP Design System — Badges & Chips
   ========================================================================= */

const base = {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '4px',
    padding:       '3px 10px',
    borderRadius:  '999px',
    fontFamily:    'var(--font-body)',
    fontSize:      '12px',
    fontWeight:    '600',
    whiteSpace:    'nowrap',
    lineHeight:    1.6,
}

// ── Estado (con punto de color) ───────────────────────────────────────────

const estadoVariants = {
    success: { background: '#E3F2EA', color: '#1E7F4F' },  // En hora / Activo
    warning: { background: '#FDF2DC', color: '#8A5A00' },  // Demorado / Advertencia
    danger:  { background: '#FBE4E6', color: '#8C1B25' },  // Cancelado / Error
    info:    { background: '#E1E7F4', color: '#1E3A8A' },  // Embarcando / Info
    neutral: { background: 'var(--bg-muted)', color: 'var(--fg2)' },
}

export function BadgeEstado({ variante = 'neutral', children }) {
    return (
        <span style={{ ...base, ...estadoVariants[variante] }}>
            <span style={{ fontSize: '8px' }}>●</span>
            {children}
        </span>
    )
}

// ── Tipo / Categoría ──────────────────────────────────────────────────────

const tipoVariants = {
    accent:  { background: 'var(--dap-accent-tint)', color: 'var(--dap-accent-press)' },   // naranja suave
    dark:    { background: 'var(--dap-charcoal-900)', color: '#fff' },                       // charcoal oscuro
    outline: { background: '#fff', color: 'var(--fg1)', border: '1px solid var(--border-strong)' },
    muted:   { background: 'var(--bg-muted)', color: 'var(--fg2)', borderRadius: '8px' },   // chip cuadrado
}

export function BadgeTipo({ variante = 'accent', children }) {
    return (
        <span style={{ ...base, ...tipoVariants[variante] }}>
            {children}
        </span>
    )
}

// ── Atajos semánticos ─────────────────────────────────────────────────────

export function BadgeActivo({ activo }) {
    return activo
        ? <BadgeEstado variante="success">Activa</BadgeEstado>
        : <BadgeEstado variante="neutral">Inactiva</BadgeEstado>
}

// Modelos de aeronave
export function BadgeModelo({ tipo }) {
    const v = tipo === 'RJ100' ? 'dark' : 'accent'
    return <BadgeTipo variante={v}>{tipo}</BadgeTipo>
}
