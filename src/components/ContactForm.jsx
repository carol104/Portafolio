import { useId, useMemo, useState } from 'react';
import { ArrowUpRight, Send } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { Reveal } from '../motion';

function ContactField({ label, id, error, children }) {
  return (
    <label htmlFor={id}>
      {label}
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function validate(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = 'Escribe tu nombre.';
  else if (data.name.trim().length < 2) errors.name = 'Usa al menos 2 caracteres.';
  if (!data.email.trim()) errors.email = 'Escribe tu correo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Revisa el formato del correo.';
  if (!data.message.trim()) errors.message = 'Cuéntame un poco más.';
  else if (data.message.trim().length < 10) errors.message = 'El mensaje debe tener al menos 10 caracteres.';
  if (!data.consent) errors.consent = 'Necesito tu consentimiento para guardar el mensaje.';
  return errors;
}

export default function ContactForm() {
  const id = useId();
  const [status, setStatus] = useState({ kind: 'idle', text: '' });
  const [values, setValues] = useState({ name: '', email: '', subject: 'Proyecto', message: '', consent: false, website: '' });
  const [touched, setTouched] = useState({});
  const errors = useMemo(() => validate(values), [values]);
  const show = field => touched[field] && errors[field];

  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }));
    setTouched(current => ({ ...current, [field]: true }));
  }

  async function submit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true, consent: true });
    if (Object.keys(errors).length || status.kind === 'sending') return;
    setStatus({ kind: 'sending', text: 'Guardando tu mensaje…' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, consent: values.consent ? 'on' : '' }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No pudimos guardar tu mensaje. Inténtalo de nuevo.');
      setStatus({ kind: 'success', text: '¡Mensaje recibido! Se ha guardado correctamente.' });
      setValues({ name: '', email: '', subject: 'Proyecto', message: '', consent: false, website: '' });
      setTouched({});
    } catch (error) {
      const text = error.name === 'TimeoutError'
        ? 'La conexión tardó demasiado. Inténtalo de nuevo.'
        : error.message === 'Failed to fetch'
          ? 'No hay conexión con el servidor. Inténtalo más tarde.'
          : error.message;
      setStatus({ kind: 'error', text });
    }
  }

  return (
    <Reveal as="form" className="contact-form" onSubmit={submit} aria-labelledby={`${id}-heading`} noValidate>
      <div className="form-heading"><h3 id={`${id}-heading`}>Cuéntame tu idea</h3><ArrowUpRight size={24} aria-hidden="true"/></div>
      <div className="form-row">
        <ContactField label="Tu nombre" id={`${id}-name`} error={show('name')}>
          <input id={`${id}-name`} name="name" value={values.name} onChange={e => update('name', e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))} placeholder="¿Cómo te llamas?" required minLength={2} maxLength={100} autoComplete="name" aria-invalid={!!show('name')}/>
        </ContactField>
        <ContactField label="Tu correo" id={`${id}-email`} error={show('email')}>
          <input id={`${id}-email`} name="email" type="email" value={values.email} onChange={e => update('email', e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: true }))} placeholder="hola@tuempresa.com" required maxLength={254} autoComplete="email" aria-invalid={!!show('email')}/>
        </ContactField>
      </div>
      <ContactField label="¿De qué hablamos?" id={`${id}-subject`}>
        <select id={`${id}-subject`} name="subject" value={values.subject} onChange={e => update('subject', e.target.value)}>
          <option value="Proyecto">Tengo un proyecto en mente</option><option value="Empleo">Oportunidad laboral</option><option value="Colaboración">Colaboración</option><option value="Otro">Otro tema</option>
        </select>
      </ContactField>
      <ContactField label="Tu mensaje" id={`${id}-message`} error={show('message')}>
        <textarea id={`${id}-message`} name="message" rows={5} value={values.message} onChange={e => update('message', e.target.value)} onBlur={() => setTouched(t => ({ ...t, message: true }))} placeholder="Cuéntame sobre tu idea, tu equipo o lo que te gustaría construir…" required minLength={10} maxLength={5000} aria-invalid={!!show('message')}/>
      </ContactField>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={e => update('website', e.target.value)}/></label>
      <label className="consent">
        <input type="checkbox" name="consent" checked={values.consent} onChange={e => update('consent', e.target.checked)} required aria-invalid={!!show('consent')}/>
        <span>Acepto que mis datos se guarden para responder a esta consulta.{show('consent') && <small className="field-error"> {errors.consent}</small>}</span>
      </label>
      <MagneticButton as="button" className="button primary" disabled={status.kind === 'sending'} type="submit" aria-describedby={`${id}-status`}>
        {status.kind === 'sending' ? 'Enviando…' : 'Enviar mensaje'}<Send size={18} aria-hidden="true"/>
      </MagneticButton>
      <p id={`${id}-status`} className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.text || 'Tu nombre, correo y mensaje se guardarán de forma privada.'}</p>
    </Reveal>
  );
}
