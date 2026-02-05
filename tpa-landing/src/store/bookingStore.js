// In-memory booking store (replace with Google Sheets API later)
const submissions = [];
const bookedSlots = new Set();

export function getBookedSlots() {
  return new Set(bookedSlots);
}

export function isSlotBooked(dateTimeKey) {
  return bookedSlots.has(dateTimeKey);
}

export function bookSlot(submission) {
  const { date, time } = submission;
  const key = `${date}_${time}`;

  if (bookedSlots.has(key)) {
    return { success: false, error: 'This time slot has already been booked.' };
  }

  const record = {
    id: submissions.length + 1,
    timestamp: new Date().toISOString(),
    name: submission.name,
    email: submission.email,
    company: submission.company,
    phone: submission.phone,
    meetingDate: date,
    meetingTime: time,
  };

  submissions.push(record);
  bookedSlots.add(key);

  return { success: true, record };
}

export function getAllSubmissions() {
  return [...submissions];
}
