/* =========================================================================
   DAP Design System — Inputs de formulario
   ========================================================================= */
import { useState } from 'react'

const baseInput = {
    width:        '100%',
    padding:      '10px 12px',
    border:       '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    font:         '500 var(--fs-sm) var(--font-body)',
    color:        'var(--fg1)',
    background:   '#fff',
    outline:      'none',
    transition:   'border-color 150ms',
    boxSizing:    'border-box',
}

export function Input({ id, type = 'text', placeholder, value, onChange, error, disabled }) {
    const [focused, setFocused] = useState(false)
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                ...baseInput,
                borderColor:   error ? 'var(--danger)' : focused ? 'var(--dap-accent)' : 'var(--border-strong)',
                borderWidth:   focused || error ? '2px' : '1px',
                background:    error ? 'var(--danger-tint)' : disabled ? 'var(--bg-muted)' : '#fff',
                cursor:        disabled ? 'not-allowed' : 'text',
                opacity:       disabled ? 0.6 : 1,
            }}
        />
    )
}

export function Select({ id, value, onChange, children, error, disabled }) {
    const [focused, setFocused] = useState(false)
    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                ...baseInput,
                borderColor: error ? 'var(--danger)' : focused ? 'var(--dap-accent)' : 'var(--border-strong)',
                borderWidth: focused || error ? '2px' : '1px',
                cursor:      disabled ? 'not-allowed' : 'pointer',
                opacity:     disabled ? 0.6 : 1,
            }}
        >
            {children}
        </select>
    )
}

export function FieldError({ mensaje }) {
    if (!mensaje) return null
    return (
        <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   'var(--fs-xs)',
            color:      'var(--danger)',
            margin:     '4px 0 0',
        }}>
            {mensaje}
        </p>
    )
}
