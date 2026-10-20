import { useEffect } from 'react'
import Icon from './Icon.jsx'
import { initials } from '../utils/format.js'

export function Button({ variant = 'primary', icon, block, children, ...props }) {
  const cls = ['btn', `btn-${variant}`, block && 'btn-block'].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}

export function IconButton({ icon, label, ...props }) {
  return (
    <button type="button" className="icon-button" aria-label={label} title={label} {...props}>
      <Icon name={icon} />
    </button>
  )
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Avatar({ name }) {
  return <span className="avatar">{initials(name)}</span>
}

export function Person({ name, sub }) {
  return (
    <div className="person">
      <Avatar name={name} />
      <div>
        <div className="person-name">{name}</div>
        {sub && <div className="person-sub">{sub}</div>}
      </div>
    </div>
  )
}

export function Card({ title, sub, actions, flush, className = '', children, ...props }) {
  return (
    <section className={`card ${flush ? 'card-flush' : ''} ${className}`} {...props}>
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatCard({ label, value, detail, icon, detailTone }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon name={icon} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-detail ${detailTone ? `text-${detailTone}` : ''}`}>{detail}</div>
    </div>
  )
}

export function Field({ label, error, className = '', children }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function Tabs({ options, value, onChange, segmented }) {
  return (
    <div className={`tabs ${segmented ? 'segmented' : ''}`} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={opt.value === value}
          className={`tab ${opt.value === value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ title, sub, onClose, footer, children, as: Tag = 'div', ...props }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Tag className="modal" role="dialog" aria-modal="true" aria-label={title} {...props}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{title}</h2>
            {sub && <p className="muted">{sub}</p>}
          </div>
          <IconButton icon="x" label="Fechar" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </Tag>
    </div>
  )
}

export function Progress({ value, max }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={`progress ${pct >= 100 ? 'full' : ''}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
