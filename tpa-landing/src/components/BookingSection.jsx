import { useState, useMemo } from 'react';
import { bookSlot, getBookedSlots } from '../store/bookingStore';
import './BookingSection.css';

function generateDates() {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = d.getDay();
    if (day >= 1 && day <= 5) {
      dates.push(d);
    }
  }
  return dates;
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 9; h < 16; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTimeDisplay(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export default function BookingSection() {
  const [step, setStep] = useState(1); // 1=date, 2=time, 3=form, 4=confirm
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const dates = useMemo(generateDates, []);
  const timeSlots = useMemo(generateTimeSlots, []);

  function handleDateSelect(d) {
    setSelectedDate(d);
    setSelectedTime(null);
    setStep(2);
  }

  function handleTimeSelect(time) {
    setSelectedTime(time);
    setStep(3);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.company.trim()) errs.company = 'Company is required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!validatePhone(form.phone)) errs.phone = 'Enter a valid phone number.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = bookSlot({
      ...form,
      date: formatDateKey(selectedDate),
      time: selectedTime,
    });

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    setSubmittedRecord(result.record);
    setStep(4);
  }

  function handleReset() {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: '', email: '', company: '', phone: '' });
    setErrors({});
    setSubmitError('');
    setSubmittedRecord(null);
  }

  const bookedSlots = getBookedSlots();

  return (
    <section className="booking" id="book">
      <div className="booking-inner">
        <h2 className="booking-title">Book a 30-Minute Consultation</h2>
        <p className="booking-subtitle">
          Select a date and time that works for you. All times are in Eastern Time (EST/EDT).
        </p>

        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <span>1</span>
            <label>Date</label>
          </div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <span>2</span>
            <label>Time</label>
          </div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>
            <span>3</span>
            <label>Details</label>
          </div>
        </div>

        {/* Step 1: Date */}
        {step === 1 && (
          <div className="date-grid">
            {dates.map((d) => (
              <button
                key={formatDateKey(d)}
                className={`date-card ${selectedDate && formatDateKey(selectedDate) === formatDateKey(d) ? 'selected' : ''}`}
                onClick={() => handleDateSelect(d)}
              >
                <span className="date-weekday">
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="date-day">{d.getDate()}</span>
                <span className="date-month">
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div className="time-step">
            <button className="back-btn" onClick={() => setStep(1)}>
              &larr; Back to dates
            </button>
            <p className="selected-date-label">
              {formatDate(selectedDate)}
            </p>
            <div className="time-grid">
              {timeSlots.map((time) => {
                const key = `${formatDateKey(selectedDate)}_${time}`;
                const booked = bookedSlots.has(key);
                return (
                  <button
                    key={time}
                    className={`time-card ${booked ? 'booked' : ''} ${selectedTime === time ? 'selected' : ''}`}
                    disabled={booked}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {formatTimeDisplay(time)} ET
                    {booked && <span className="booked-label">Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Contact Form */}
        {step === 3 && (
          <div className="form-step">
            <button className="back-btn" onClick={() => setStep(2)}>
              &larr; Back to times
            </button>
            <div className="selection-summary">
              <span>{formatDate(selectedDate)}</span>
              <span className="dot">&middot;</span>
              <span>{formatTimeDisplay(selectedTime)} ET</span>
              <span className="dot">&middot;</span>
              <span>30 min</span>
            </div>
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={form.company}
                  onChange={handleInputChange}
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && <span className="field-error">{errors.company}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              {submitError && <div className="submit-error">{submitError}</div>}
              <button type="submit" className="submit-btn">
                Confirm Booking
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && submittedRecord && (
          <div className="confirmation">
            <div className="confirm-icon">&#10003;</div>
            <h3>Thank You!</h3>
            <p>Your meeting has been booked successfully.</p>
            <div className="confirm-details">
              <div className="confirm-row">
                <span className="confirm-label">Name</span>
                <span>{submittedRecord.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email</span>
                <span>{submittedRecord.email}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Company</span>
                <span>{submittedRecord.company}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Date</span>
                <span>{submittedRecord.meetingDate}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Time</span>
                <span>{formatTimeDisplay(submittedRecord.meetingTime)} ET</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Duration</span>
                <span>30 minutes</span>
              </div>
            </div>
            <p className="confirm-note">
              A confirmation email will be sent to {submittedRecord.email}.
            </p>
            <button className="submit-btn" onClick={handleReset}>
              Book Another Meeting
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
