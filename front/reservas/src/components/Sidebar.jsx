import { useState } from 'react'
import { getUsuario, logout } from '../services/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ChevronDown, Home, Ticket, Plane, Settings,
    Map, Users, User, Shield, Key, LogOut
} from 'lucide-react'
import logo from '../assets/logo/logoDAP.png'

const ROL_LABELS = {
    1: 'Pasajero',
    2: 'Pasajero',
    3: 'Operaciones',
    4: 'Agente',
    5: 'Administrador',
}

const NAV = [
    {
        label: 'Principal',
        rol_nivel: [1, 2, 3, 4],
        items: [
            { label: 'Inicio',       icon: Home,   rol_nivel: [1, 2, 3, 4], path: '/inicio'       },
            { label: 'Reservas',     icon: Ticket, rol_nivel: [3, 4],           path: '/reservas'     },
            { label: 'Mis Reservas', icon: Ticket, rol_nivel: [1],           path: '/mis-reservas' },
        ],
    },
    {
        label: 'Operaciones de vuelo',
        rol_nivel: [3, 4],
        items: [
            { label: 'Vuelos', icon: Plane, path: '/vuelos' },
        ],
    },
    {
        label: 'Administración',
        rol_nivel: [4],
        items: [
            {
                label: 'Configuración',
                icon: Settings,
                submenu: [
                    { label: 'Aeronaves', icon: Plane, path: '/admin/aeronaves' },
                    { label: 'Rutas',     icon: Map,   path: '/admin/rutas'     },
                ],
            },
            {
                label: 'Usuarios',
                icon: Users,
                submenu: [
                    { label: 'Usuarios', icon: User,   path: '/admin/usuarios' },
                    { label: 'Roles',    icon: Shield, path: '/admin/roles'    },
                ],
            },
        ],
    },
]

function isActivePath(pathname, path) {
    return pathname === path || (path !== '/inicio' && pathname.startsWith(path))
}

function Sidebar() {
    const usuario  = getUsuario()
    const rol      = usuario?.rol_id
    const nivel    = Number(usuario?.rol_nivel)
    const navigate = useNavigate()
    const location = useLocation()
    function canSee(item) {
        if (!item.rol_nivel) return true
        return item.rol_nivel.includes(nivel)
    }

    const [openMenus, setOpenMenus] = useState(() => {
        const open = new Set()
        NAV.forEach(section =>
            section.items.forEach(item => {
                if (item.submenu) {
                    const hasActive = item.submenu.some(c => isActivePath(location.pathname, c.path))
                    if (hasActive) open.add(item.label)
                }
            })
        )
        return open
    })

    function isActive(path) {
        return isActivePath(location.pathname, path)
    }

    function isOpen(item) {
        return openMenus.has(item.label) || item.submenu.some(c => isActive(c.path))
    }

    function toggleMenu(label) {
        setOpenMenus(prev => {
            const next = new Set(prev)
            next.has(label) ? next.delete(label) : next.add(label)
            return next
        })
    }

    function handleLogout() {
        logout()
        navigate('/')
    }

    return (
        <div className="w-64 min-h-screen bg-white flex flex-col border-r border-gray-100">

            {/* ── Logo ── */}
            <div className="px-5 py-5 border-b border-gray-100">
                <img src={logo} alt="logo" className="w-28 mb-3 mx-auto" />
                <div className="text-center">
                    <p className="text-blue-900 font-bold text-sm leading-tight">Sistema de Reservas</p>
                    <p className="text-gray-400 text-xs mt-0.5">Aerovías DAP</p>
                </div>
            </div>

            {/* ── Navegación ── */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {NAV.map(section => {
                    if (!canSee(section)) return null
                    const itemsVisibles = section.items.filter(canSee)
                    if (itemsVisibles.length === 0) return null

                    return (
                        <div key={section.label} className="mb-1">

                            {/* Etiqueta de sección */}
                            <p className="px-5 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                {section.label}
                            </p>

                            {itemsVisibles.map(item =>
                                item.submenu ? (

                                    /* ── Submenu ── */
                                    <div key={item.label}>
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={`flex items-center gap-3 w-full pl-5 pr-3 py-2.5 text-sm transition-colors ${
                                                item.submenu.some(c => isActive(c.path))
                                                    ? 'text-blue-900 font-semibold'
                                                    : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            <item.icon size={16} className="shrink-0" />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${isOpen(item) ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Hijos */}
                                        {isOpen(item) && (
                                            <div className="ml-5 pl-4 border-l border-gray-100 mb-1">
                                                {item.submenu.filter(canSee).map(child => (
                                                    <button
                                                        key={child.path}
                                                        onClick={() => navigate(child.path)}
                                                        className={`flex items-center gap-2.5 w-full pr-3 py-2 text-sm rounded-r-full transition-colors ${
                                                            isActive(child.path)
                                                                ? 'bg-blue-900 text-white font-semibold pl-3'
                                                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-900 pl-3'
                                                        }`}
                                                    >
                                                        <child.icon size={14} className="shrink-0" />
                                                        {child.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                ) : (

                                    /* ── Item simple ── */
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center gap-3 w-full pl-5 pr-3 py-2.5 rounded-r-full text-sm transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-blue-900 text-white font-semibold'
                                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-900'
                                        }`}
                                    >
                                        <item.icon size={16} className="shrink-0" />
                                        {item.label}
                                    </button>

                                )
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* ── Usuario / logout ── */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">
                            {usuario?.nombre?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{usuario?.nombre}</p>
                        <p className="text-xs text-gray-400">{ROL_LABELS[rol] ?? 'Usuario'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={14} />
                    Cerrar sesión
                </button>
            </div>

        </div>
    )
}

export default Sidebar
