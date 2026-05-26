import { useState } from 'react'
import { getUsuario, logout } from '../services/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ChevronDown, Home, Ticket, Plane, Settings,
    Map, Users, User, Shield, LogOut
} from 'lucide-react'
import logo from '../assets/logo/logoDAP.png'
import sidebarBg from '../assets/sidebar.png'

const ROL_LABELS = {
    1: 'Pasajero',
    2: 'Pasajero',
    3: 'Operaciones',
}

const NAV = [
    {
        label: 'Principal',
        rol_nivel: [1, 2, 3, 4],
        items: [
            { label: 'Inicio',       icon: Home,   rol_nivel: [1, 2, 3, 4], path: '/inicio'       },
            { label: 'Mis Reservas', icon: Ticket, rol_nivel: [1, 2],       path: '/mis-reservas' },
            { label: 'Reservas',     icon: Ticket, rol_nivel: [3, 4],       path: '/reservas'     },
        ],
    },
    {
        label: 'Operaciones de vuelo',
        rol_nivel: [3, 4],
        items: [
            { label: 'Vuelos', icon: Plane, rol_nivel: [3, 4], path: '/admin/vuelos' },
        ],
    },
    {
        label: 'Administración',
        rol_nivel: [4],
        items: [
            {
                label: 'Configuración',
                icon: Settings,
                rol_nivel: [4],
                submenu: [
                    { label: 'Aeronaves', icon: Plane, path: '/admin/aeronaves' },
                    { label: 'Rutas',     icon: Map,   path: '/admin/rutas'     },
                ],
            },
            {
                label: 'Usuarios',
                icon: Users,
                rol_nivel: [4],
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

    function isActive(path) {
        return isActivePath(location.pathname, path)
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

    function isOpen(label) {
        return openMenus.has(label)
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
            <div className="px-5 py-6 border-b border-gray-100">
                <img src={logo} alt="logo" className="w-32 mb-3 mx-auto" />
                <div className="text-center">
                    <p className="text-blue-900 font-bold text-sm leading-tight">Portal de Reservas</p>
                    <p className="text-gray-400 text-xs mt-0.5">Aerovías DAP</p>
                </div>
            </div>

            {/* ── Navegación ── */}
            <nav className="py-4 px-0 bg-white overflow-y-auto">
                {NAV.filter(section => canSee(section)).map(section => (
                    <div key={section.label} className="mb-1">

                        {/* Etiqueta de sección */}
                        <p className="px-5 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            {section.label}
                        </p>

                        {section.items.filter(item => canSee(item)).map(item => {
                            /* Item con submenu */
                            if (item.submenu) {
                                const open = isOpen(item.label) || item.submenu.some(s => isActive(s.path))
                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className="flex items-center gap-3 w-full pl-5 pr-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                                        >
                                            <item.icon size={17} className="shrink-0" />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {open && (
                                            <div className="ml-5 border-l border-gray-100 pl-2 mb-1">
                                                {item.submenu.map(sub => (
                                                    <button
                                                        key={sub.path}
                                                        onClick={() => navigate(sub.path)}
                                                        className={`flex items-center gap-2 w-full pl-3 pr-3 py-2 text-sm transition-colors rounded-lg ${
                                                            isActive(sub.path)
                                                                ? 'text-blue-900 font-semibold bg-blue-50'
                                                                : 'text-gray-500 hover:text-blue-900 hover:bg-blue-50'
                                                        }`}
                                                    >
                                                        <sub.icon size={14} className="shrink-0" />
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            /* Item simple */
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-3 w-full pl-5 pr-3 py-3 text-sm transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-blue-900 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                                    }`}
                                >
                                    <item.icon size={17} className="shrink-0" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* ── Imagen de fondo ── */}
            <div
                className="flex-1 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `linear-gradient(to bottom, white 0%, rgba(255,255,255,0.75) 25%, rgba(255,255,255,0.45) 100%), url(${sidebarBg})` }}
            />

            {/* ── Usuario / logout ── */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">
                            {usuario?.nombre?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{usuario?.nombre}</p>
                        <p className="text-xs text-gray-400">{ROL_LABELS[nivel] ?? 'Usuario'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={16} />
                    Cerrar sesión
                </button>
            </div>

        </div>
    )
}

export default Sidebar
