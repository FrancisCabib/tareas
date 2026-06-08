import { useState } from 'react'
import { TIPOS, bcForTipo } from './data'
import type { TaskInput } from './api'

interface Props {
  initial?: Partial<TaskInput>
  submitLabel: string
  onSave: (task: TaskInput) => void
  onCancel: () => void
}

export default function TaskForm({ initial, submitLabel, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [benef, setBenef] = useState(initial?.benef ?? '')
  const [resp, setResp] = useState(initial?.resp ?? 'Francis')
  const [tipo, setTipo] = useState(initial?.tipo ?? TIPOS[0].tipo)

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({
      name: trimmed,
      benef: benef.trim(),
      resp: resp.trim(),
      tipo,
      bc: bcForTipo(tipo),
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="task-form" onKeyDown={onKeyDown}>
      <input
        className="task-form-input"
        placeholder="Nombre de la tarea"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="task-form-row">
        <input
          className="task-form-input"
          placeholder="Beneficiario"
          value={benef}
          onChange={(e) => setBenef(e.target.value)}
        />
        <input
          className="task-form-input"
          placeholder="Responsable"
          value={resp}
          onChange={(e) => setResp(e.target.value)}
        />
        <select
          className="task-form-input"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          {TIPOS.map((t) => (
            <option key={t.tipo} value={t.tipo}>
              {t.tipo}
            </option>
          ))}
        </select>
      </div>
      <div className="task-form-actions">
        <button className="btn-primary" onClick={submit} disabled={!name.trim()}>
          {submitLabel}
        </button>
        <button className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
