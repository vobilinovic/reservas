/* =========================================================================
   DAP Design System — Tipografía
   Fuentes: Barlow (display) · DM Sans (body)
   ========================================================================= */

// Encabezado de página: título grande + subtítulo + acción opcional
export function PageHeader({ titulo, subtitulo, accion }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
                <h2 style={{
                    fontFamily:    'var(--font-display)',
                    fontWeight:    'var(--fw-bold)',
                    fontSize:      'var(--fs-2xl)',
                    lineHeight:    1.2,
                    letterSpacing: '-0.015em',
                    color:         'var(--fg1)',
                    margin:        0,
                }}>
                    {titulo}
                </h2>
                {subtitulo && (
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize:   'var(--fs-sm)',
                        color:      'var(--fg3)',
                        margin:     '4px 0 0',
                    }}>
                        {subtitulo}
                    </p>
                )}
            </div>
            {accion && <div style={{ flexShrink: 0 }}>{accion}</div>}
        </div>
    )
}

// Separador de sección con texto centrado
export function SectionTitle({ children }) {
    return (
        <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '12px',
            margin:      '24px 0 16px',
        }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--divider)' }} />
            <span style={{
                fontFamily:    'var(--font-body)',
                fontWeight:    'var(--fw-semibold)',
                fontSize:      'var(--fs-xs)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         'var(--fg3)',
                whiteSpace:    'nowrap',
            }}>
                {children}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--divider)' }} />
        </div>
    )
}

// Eyebrow — etiqueta pequeña sobre un título
export function Eyebrow({ children }) {
    return (
        <span style={{
            fontFamily:    'var(--font-body)',
            fontWeight:    'var(--fw-semibold)',
            fontSize:      'var(--fs-xs)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         'var(--fg3)',
        }}>
            {children}
        </span>
    )
}

// Label de campo de formulario
export function FieldLabel({ children, htmlFor, opcional = false }) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                fontFamily:  'var(--font-body)',
                fontWeight:  'var(--fw-semibold)',
                fontSize:    '13px',
                color:       'var(--fg1)',
                display:     'block',
                marginBottom: '6px',
            }}
        >
            {children}
            {opcional && (
                <span style={{ fontWeight: 'var(--fw-regular)', color: 'var(--fg3)', marginLeft: '4px' }}>
                    (opcional)
                </span>
            )}
        </label>
    )
}
