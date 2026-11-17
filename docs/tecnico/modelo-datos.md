# Modelo de datos (Supabase / PostgreSQL)

## Tablas

**profiles** — un registro por usuario de Auth.
| Campo | Tipo | Nota |
| --- | --- | --- |
| id | uuid PK | = `auth.users.id` |
| nombre | text | obligatorio |
| dni | text | obligatorio, único, 7 u 8 dígitos; el jugador no lo puede cambiar |
| rol | text | `jugador` (default) o `admin` |
| created_at | timestamptz | default now() |

**canchas**
| Campo | Tipo | Nota |
| --- | --- | --- |
| id | uuid PK | |
| nombre | text | obligatorio, único |
| descripcion | text | opcional |
| activa | boolean | default true; inactiva = no aparece en la grilla |
| created_at | timestamptz | |

**horarios_atencion**
| Campo | Tipo | Nota |
| --- | --- | --- |
| id | uuid PK | |
| dia_semana | int | 0 = domingo … 6 = sábado, único |
| hora_apertura | time | |
| hora_cierre | time | > hora_apertura |

**reservas**
| Campo | Tipo | Nota |
| --- | --- | --- |
| id | uuid PK | |
| cancha_id | uuid FK → canchas | |
| jugador_id | uuid FK → profiles | null en reservas manuales |
| nombre_cliente | text | obligatorio si jugador_id es null |
| fecha | date | |
| hora_inicio | time | hora exacta |
| estado | text | `confirmada`, `cancelada_jugador`, `cancelada_admin` |
| creada_por | uuid FK → profiles | quien la cargó |
| created_at | timestamptz | |

**Índice clave:** único parcial en `reservas (cancha_id, fecha, hora_inicio) WHERE estado = 'confirmada'`.

## Automatismos
- Trigger: al crearse un usuario en Auth, se crea su fila en `profiles` con el nombre y el dni de los metadatos y rol `jugador`. Rechaza el registro si el dni no tiene 7 u 8 dígitos o no coincide con la parte del correo antes del `@`.
- El primer admin se asigna a mano con un `UPDATE` en el SQL Editor, buscándolo por `dni`.
- Trigger: antes de guardar una reserva `confirmada`, `validar_reserva()` aplica las reglas de horario, cancha y ventana de `docs/producto/reglas-negocio.md`. No se ejecuta al cambiar otros campos ni bloquea cancelaciones.

## Configuración de Auth (panel de Supabase)
- Inicio de sesión con DNI: Supabase Auth solo acepta correo o teléfono, así que la app usa un correo interno `<dni>@turnosya.invalid` (`src/services/auth.ts`). El dominio `.invalid` está reservado y nunca recibe correos. El usuario no ve ese correo en ninguna pantalla ni mensaje.
- "Confirm email" está **desactivado**: al registrarse, el usuario entra directo. Con el correo interno no se puede confirmar nada, así que tiene que quedar desactivado.
- Por el trigger, un usuario creado desde Authentication > Users sin `dni` en los metadatos no se puede crear: las cuentas se crean desde la app.

## Seguridad (RLS activado en todas las tablas)
| Tabla | Jugador | Admin |
| --- | --- | --- |
| profiles | lee el suyo; edita solo el nombre (no el rol ni el dni) | lee todos |
| canchas | lee | todo |
| horarios_atencion | lee | todo |
| reservas | lee las suyas; crea con `jugador_id = auth.uid()` | todo |

## Funciones (RPC, `security definer`)
- `turnos_ocupados(desde date, hasta date)` → `cancha_id, fecha, hora_inicio` de reservas confirmadas, **sin datos personales**. La usa la grilla.
- `cancelar_reserva(id uuid)` → valida dueño y regla de 2 horas, cambia el estado.
- `es_admin()` → indica si el usuario actual es admin. La usan las políticas de RLS; sin `security definer`, las políticas de `profiles` entrarían en recursión.
