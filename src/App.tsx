import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneDays, STORAGE_KEY, THEME_KEY, type Day } from './data'
import { api, type TaskInput } from './api'
import TaskForm from './TaskForm'

function readCache(): Day[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Day[]) : cloneDays()
  } catch {
    return cloneDays()
  }
}

function App() {
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })
  const [toastMsg, setToastMsg] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const dragRef = useRef<{ taskId: string; fromDay: number } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2000)
  }, [])

  // Initial load from the API, with localStorage fallback if it's unreachable.
  useEffect(() => {
    let alive = true
    api
      .getDays()
      .then((data) => {
        if (!alive) return
        setDays(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      })
      .catch(() => {
        if (!alive) return
        setDays(readCache())
        toast('Sin conexión al servidor — usando datos locales')
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [toast])

  // Apply + persist theme (UI preference, stays local).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Persist a new state: update UI, cache locally, push to the API.
  const commit = useCallback(
    (next: Day[]) => {
      setDays(next)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      api.saveDays(next).catch(() => toast('No se pudo guardar en el servidor'))
    },
    [toast],
  )

  // Apply the canonical state returned by a per-task endpoint.
  const applyServer = useCallback(
    (p: Promise<Day[]>, okMsg?: string) =>
      p
        .then((data) => {
          setDays(data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          if (okMsg) toast(okMsg)
        })
        .catch(() => toast('No se pudo guardar en el servidor')),
    [toast],
  )

  const createTask = (dayId: string, task: TaskInput) => {
    setAddingDay(null)
    applyServer(api.createTask(dayId, task), 'Tarea agregada')
  }

  const saveEdit = (taskId: string, fields: TaskInput) => {
    setEditingTask(null)
    applyServer(api.updateTask(taskId, fields), 'Tarea actualizada')
  }

  const deleteTask = (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    applyServer(api.deleteTask(taskId), 'Tarea eliminada')
  }

  const realTasks = days.flatMap((d) => d.tasks.filter((t) => !t.buffer))
  const total = realTasks.length
  const done = realTasks.filter((t) => t.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const toggleDone = (dayIdx: number, taskId: string) => {
    commit(
      days.map((day, di) =>
        di === dayIdx
          ? {
              ...day,
              tasks: day.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t,
              ),
            }
          : day,
      ),
    )
  }

  const resetAll = () => {
    if (!confirm('¿Reiniciar todas las tareas y el orden?')) return
    api
      .reset()
      .then((data) => {
        setDays(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        toast('Todo reiniciado')
      })
      .catch(() => {
        commit(cloneDays())
        toast('Reiniciado localmente (sin servidor)')
      })
  }

  // --- Drag & drop ---
  const onDragStart = (taskId: string, fromDay: number) => {
    dragRef.current = { taskId, fromDay }
    setDraggingId(taskId)
  }

  const onDragEnd = () => {
    dragRef.current = null
    setDraggingId(null)
    setDragOverId(null)
  }

  // Drop onto a specific task → insert before it
  const onDropOnTask = (targetDayIdx: number, targetTaskId: string) => {
    const info = dragRef.current
    setDragOverId(null)
    if (!info || info.taskId === targetTaskId) return

    const next = days.map((d) => ({ ...d, tasks: [...d.tasks] }))
    const src = next[info.fromDay]
    const srcIdx = src.tasks.findIndex((t) => t.id === info.taskId)
    if (srcIdx === -1) return
    const [moved] = src.tasks.splice(srcIdx, 1)
    const tgt = next[targetDayIdx]
    const tgtIdx = tgt.tasks.findIndex((t) => t.id === targetTaskId)
    tgt.tasks.splice(tgtIdx, 0, moved)
    commit(next)
    toast('Tarea reordenada')
  }

  // Drop onto a day (empty space) → append to that day
  const onDropOnDay = (targetDayIdx: number) => {
    const info = dragRef.current
    if (!info) return

    const next = days.map((d) => ({ ...d, tasks: [...d.tasks] }))
    const src = next[info.fromDay]
    const srcIdx = src.tasks.findIndex((t) => t.id === info.taskId)
    if (srcIdx === -1) return
    const [moved] = src.tasks.splice(srcIdx, 1)
    next[targetDayIdx].tasks.push(moved)
    commit(next)
    toast('Tarea movida a ' + days[targetDayIdx].label)
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>Cronograma semanal</h1>
          <p className="subtitle">Beneficiarios Lunding — 8 al 12 junio 2026</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            title="Cambiar tema"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} />
          </button>
          <button className="btn-icon" title="Reiniciar todo" onClick={resetAll}>
            <i className="ti ti-refresh" />
          </button>
        </div>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Completadas</div>
          <div className="stat-val accent">{done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendientes</div>
          <div className="stat-val">{total - done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-val">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avance</div>
          <div className="stat-val accent">{pct}%</div>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: pct + '%' }} />
        </div>
        <div className="progress-text">
          {done} de {total} completadas
        </div>
      </div>

      {loading ? (
        <p className="subtitle" style={{ textAlign: 'center', padding: '40px 0' }}>
          Cargando…
        </p>
      ) : (
        <div>
          {days.map((day, di) => {
            const dayReal = day.tasks.filter((t) => !t.buffer)
            const dayDone = dayReal.filter((t) => t.done).length
            return (
              <div className="day-block" key={day.id}>
                <div className="day-header">
                  <div>
                    <span className="day-label">{day.label}</span>
                    <span className="day-focus">— {day.focus}</span>
                  </div>
                  <span className="day-badge">
                    {dayDone}/{dayReal.length}
                  </span>
                </div>

                <div
                  className="task-list"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    onDropOnDay(di)
                  }}
                >
                  {day.tasks.map((task) => {
                    const rowClass = [
                      'task-row',
                      task.done ? 'done' : '',
                      task.buffer ? 'buffer' : '',
                      draggingId === task.id ? 'dragging' : '',
                      dragOverId === task.id ? 'drag-over' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    if (editingTask === task.id) {
                      return (
                        <div key={task.id} className="task-row editing">
                          <TaskForm
                            initial={{
                              name: task.name,
                              benef: task.benef,
                              resp: task.resp,
                              tipo: task.tipo,
                            }}
                            submitLabel="Guardar"
                            onSave={(fields) => saveEdit(task.id, fields)}
                            onCancel={() => setEditingTask(null)}
                          />
                        </div>
                      )
                    }

                    return (
                      <div
                        key={task.id}
                        className={rowClass}
                        draggable={!task.buffer}
                        onDragStart={() =>
                          !task.buffer && onDragStart(task.id, di)
                        }
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => {
                          if (task.buffer) return
                          e.preventDefault()
                          if (draggingId !== task.id) setDragOverId(task.id)
                        }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => {
                          if (task.buffer) return
                          e.preventDefault()
                          e.stopPropagation()
                          onDropOnTask(di, task.id)
                        }}
                      >
                        {!task.buffer && (
                          <>
                            <i className="ti ti-grip-vertical drag-handle" aria-hidden="true" />
                            <div
                              className="check"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDone(di, task.id)
                              }}
                            >
                              {task.done && <i className="ti ti-check" aria-hidden="true" />}
                            </div>
                          </>
                        )}

                        <div className="task-info">
                          <div className="task-top">
                            <span className="task-name">
                              {task.buffer && (
                                <i
                                  className="ti ti-clock"
                                  style={{ fontSize: 14, verticalAlign: -2, marginRight: 3 }}
                                  aria-hidden="true"
                                />
                              )}
                              {task.name}
                            </span>
                            {task.tipo !== '—' && (
                              <span className={`badge ${task.bc}`}>{task.tipo}</span>
                            )}
                          </div>
                          {!task.buffer && (
                            <div className="task-meta">
                              <span>
                                <i className="ti ti-user" aria-hidden="true" />
                                {task.benef}
                              </span>
                              <span>
                                <i className="ti ti-arrow-right" aria-hidden="true" />
                                {task.resp}
                              </span>
                            </div>
                          )}
                        </div>

                        {!task.buffer && (
                          <div className="task-actions">
                            <button
                              className="task-icon-btn"
                              title="Editar"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAddingDay(null)
                                setEditingTask(task.id)
                              }}
                            >
                              <i className="ti ti-pencil" aria-hidden="true" />
                            </button>
                            <button
                              className="task-icon-btn danger"
                              title="Eliminar"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTask(task.id)
                              }}
                            >
                              <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {addingDay === day.id ? (
                  <TaskForm
                    submitLabel="Agregar"
                    onSave={(fields) => createTask(day.id, fields)}
                    onCancel={() => setAddingDay(null)}
                  />
                ) : (
                  <button
                    className="add-task-btn"
                    onClick={() => {
                      setEditingTask(null)
                      setAddingDay(day.id)
                    }}
                  >
                    <i className="ti ti-plus" aria-hidden="true" /> Añadir tarea
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  )
}

export default App
