/* =========================================================================
   DAP Design System — Alertas
   ========================================================================= */

const variants = {
    danger:  { bg: 'var(--danger-tint)',  border: 'var(--danger)',  color: '#8C1B25' },
    warning: { bg: 'var(--warning-tint)', border: 'var(--warning)', color: '#8A5A00' },
    success: { bg: 'var(--success-tint)', border: 'var(--success)', color: '#1E7F4F' },
    info:    { bg: 'var(--info-tint)',    border: 'var(--info)',    color: '#1E3A8A' },
}

export function Alert({ variante = 'danger', children }) {
    const v = variants[variante]
    return (
        <div style={{
            background:   v.bg,
            border:       `1px solid ${v.border}`,
            borderRadius: 'var(--radius-md)',
            padding:      '10px 14px',
            fontFamily:   'var(--font-body)',
            fontSize:     'var(--fs-sm)',
            color:        v.color,
            fontWeight:   'var(--fw-medium)',
        }}>
            {children}
        </div>
    )
}
