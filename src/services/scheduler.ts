import { Appointment, Doctor, DoctorLeave, SlotRecommendation, TimeSlot } from '../types';

/**
 * Helper to convert "HH:mm" to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Helper to convert minutes since midnight to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Check if a given date falls within a doctor's leave period
 */
export function isDoctorOnLeave(
  doctorId: string,
  dateStr: string,
  leaves: DoctorLeave[]
): { onLeave: boolean; reason?: string } {
  const targetDate = new Date(dateStr).getTime();
  for (const leave of leaves) {
    if (leave.doctorId === doctorId && leave.approved) {
      const start = new Date(leave.startDate).getTime();
      const end = new Date(leave.endDate).getTime();
      if (targetDate >= start && targetDate <= end) {
        return { onLeave: true, reason: leave.reason };
      }
    }
  }
  return { onLeave: false };
}

/**
 * Check if doctor works on given day of week
 */
export function isDoctorWorkingOnDay(doctor: Doctor, dateStr: string): boolean {
  // Day of week: 0 = Sun, 1 = Mon ...
  const day = new Date(dateStr).getDay();
  return doctor.workingDays.includes(day);
}

/**
 * Generates all discrete slots for a doctor on a specific date
 */
export function generateDoctorDailySlots(
  doctor: Doctor,
  dateStr: string,
  existingAppointments: Appointment[],
  leaves: DoctorLeave[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Check leave
  const leaveCheck = isDoctorOnLeave(doctor.id, dateStr, leaves);
  if (leaveCheck.onLeave) {
    return slots; // 0 slots if on full-day leave
  }

  // Check working day
  if (!isDoctorWorkingOnDay(doctor, dateStr)) {
    return slots; // Non-working day
  }

  const workStartMin = timeToMinutes(doctor.workingHours.start);
  const workEndMin = timeToMinutes(doctor.workingHours.end);
  const duration = doctor.slotDurationMinutes || 20;
  const buffer = doctor.bufferMinutes || 5;
  const step = duration + buffer;

  // Filter appointments for this doctor on this day (ignoring cancelled)
  const activeAppts = existingAppointments.filter(
    (a) =>
      a.doctorId === doctor.id &&
      a.date === dateStr &&
      a.status !== 'cancelled'
  );

  for (let start = workStartMin; start + duration <= workEndMin; start += step) {
    const end = start + duration;
    const slotStartStr = minutesToTime(start);
    const slotEndStr = minutesToTime(end);

    // Check overlap with existing appointments
    let hasConflict = false;
    let conflictReason: TimeSlot['reason'] = undefined;

    for (const appt of activeAppts) {
      const apptStartMin = timeToMinutes(appt.startTime);
      const apptEndMin = timeToMinutes(appt.endTime);

      // Overlap logic: start < apptEnd && end > apptStart
      if (start < apptEndMin && end > apptStartMin) {
        hasConflict = true;
        conflictReason = 'booked';
        break;
      }
    }

    slots.push({
      startTime: slotStartStr,
      endTime: slotEndStr,
      available: !hasConflict,
      reason: hasConflict ? conflictReason : undefined,
    });
  }

  return slots;
}

/**
 * Conflict Diagnostics Engine
 * Evaluates whether an appointment request conflicts with rules
 */
export interface ConflictDiagnosis {
  isValid: boolean;
  conflictType?: 
    | 'DOUBLE_BOOKING' 
    | 'DOCTOR_ON_LEAVE' 
    | 'OUTSIDE_WORKING_HOURS' 
    | 'NON_WORKING_DAY' 
    | 'PAST_DATE' 
    | 'BUFFER_VIOLATION' 
    | 'DUPLICATE_PATIENT_SLOT';
  message: string;
  details?: string;
  suggestAlternatives?: boolean;
}

export function diagnoseSchedulingConflict(
  doctor: Doctor,
  patientId: string,
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  appointments: Appointment[],
  leaves: DoctorLeave[],
  excludeAppointmentId?: string
): ConflictDiagnosis {
  const reqStart = timeToMinutes(startTimeStr);
  const reqEnd = timeToMinutes(endTimeStr);

  // 1. Check past date
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr < todayStr) {
    return {
      isValid: false,
      conflictType: 'PAST_DATE',
      message: 'Cannot schedule an appointment in the past.',
      suggestAlternatives: true,
    };
  }

  // 2. Doctor Leave Check
  const leave = isDoctorOnLeave(doctor.id, dateStr, leaves);
  if (leave.onLeave) {
    return {
      isValid: false,
      conflictType: 'DOCTOR_ON_LEAVE',
      message: `Dr. ${doctor.name} is on official leave on this date (${leave.reason || 'Personal Leave'}).`,
      suggestAlternatives: true,
    };
  }

  // 3. Working Day Check
  if (!isDoctorWorkingOnDay(doctor, dateStr)) {
    return {
      isValid: false,
      conflictType: 'NON_WORKING_DAY',
      message: `Dr. ${doctor.name} does not hold clinical hours on this day of the week.`,
      suggestAlternatives: true,
    };
  }

  // 4. Outside Working Hours Check
  const docWorkStart = timeToMinutes(doctor.workingHours.start);
  const docWorkEnd = timeToMinutes(doctor.workingHours.end);

  if (reqStart < docWorkStart || reqEnd > docWorkEnd) {
    return {
      isValid: false,
      conflictType: 'OUTSIDE_WORKING_HOURS',
      message: `Requested slot (${startTimeStr} - ${endTimeStr}) is outside regular clinic hours (${doctor.workingHours.start} - ${doctor.workingHours.end}).`,
      suggestAlternatives: true,
    };
  }

  // 5. Existing Appointment Overlaps (Doctor double booking)
  const doctorActiveAppts = appointments.filter(
    (a) =>
      a.doctorId === doctor.id &&
      a.date === dateStr &&
      a.status !== 'cancelled' &&
      a.id !== excludeAppointmentId
  );

  for (const appt of doctorActiveAppts) {
    const aStart = timeToMinutes(appt.startTime);
    const aEnd = timeToMinutes(appt.endTime);

    if (reqStart < aEnd && reqEnd > aStart) {
      return {
        isValid: false,
        conflictType: 'DOUBLE_BOOKING',
        message: `This time slot is already booked for Dr. ${doctor.name} (${appt.startTime} - ${appt.endTime}).`,
        suggestAlternatives: true,
      };
    }
  }

  // 6. Patient double booking (patient having 2 appointments simultaneously)
  const patientActiveAppts = appointments.filter(
    (a) =>
      a.patientId === patientId &&
      a.date === dateStr &&
      a.status !== 'cancelled' &&
      a.id !== excludeAppointmentId
  );

  for (const appt of patientActiveAppts) {
    const aStart = timeToMinutes(appt.startTime);
    const aEnd = timeToMinutes(appt.endTime);

    if (reqStart < aEnd && reqEnd > aStart) {
      return {
        isValid: false,
        conflictType: 'DUPLICATE_PATIENT_SLOT',
        message: `Patient already holds a concurrent appointment with ${appt.doctorName} at this time.`,
        suggestAlternatives: true,
      };
    }
  }

  return {
    isValid: true,
    message: 'Slot is completely clear and available for booking.',
  };
}

/**
 * Smart Alternative Slot Recommendation Algorithm
 * 1. Checks next 7 days for the requested doctor or same department
 * 2. Scores slots based on closeness to preferred time and preferred doctor
 * 3. Returns ranked suggestions with human-readable rationale
 */
export function findSmartAlternativeSlots(
  targetDoctor: Doctor,
  preferredDateStr: string,
  preferredTimeStr: string,
  allDoctors: Doctor[],
  appointments: Appointment[],
  leaves: DoctorLeave[],
  maxAlternatives = 4
): SlotRecommendation[] {
  const recommendations: SlotRecommendation[] = [];
  const targetPreferredMinutes = timeToMinutes(preferredTimeStr || '10:00');

  // Candidate doctors: Target doctor first, then same department
  const candidateDoctors = [
    targetDoctor,
    ...allDoctors.filter(
      (d) => d.id !== targetDoctor.id && d.departmentId === targetDoctor.departmentId
    ),
  ];

  // Look ahead 7 days starting from preferred date
  const startDate = new Date(preferredDateStr);

  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + dayOffset);
    const curDateStr = curDate.toISOString().split('T')[0];

    for (const doc of candidateDoctors) {
      const slots = generateDoctorDailySlots(doc, curDateStr, appointments, leaves);
      const availableSlots = slots.filter((s) => s.available);

      for (const slot of availableSlots) {
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const timeDiffMinutes = Math.abs(slotStartMinutes - targetPreferredMinutes);

        // Scoring: Lower is better
        // Primary doctor bonus: 0 penalty, secondary: 100 penalty
        // Day offset penalty: 50 per day
        // Time difference penalty: 1 per minute
        const isPrimary = doc.id === targetDoctor.id;
        const doctorPenalty = isPrimary ? 0 : 120;
        const datePenalty = dayOffset * 60;
        const score = timeDiffMinutes + datePenalty + doctorPenalty;

        let matchReason = '';
        if (dayOffset === 0 && isPrimary) {
          matchReason = `Same day alternative with Dr. ${doc.name} (${Math.round(timeDiffMinutes / 60)}h difference)`;
        } else if (dayOffset === 0 && !isPrimary) {
          matchReason = `Same-day slot with department colleague Dr. ${doc.name}`;
        } else if (isPrimary) {
          matchReason = `${dayOffset} day(s) later with requested Dr. ${doc.name}`;
        } else {
          matchReason = `Alternative specialist in ${doc.departmentName} on ${curDateStr}`;
        }

        recommendations.push({
          date: curDateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          doctorId: doc.id,
          doctorName: doc.name,
          specialization: doc.specialization,
          score,
          matchReason,
        });
      }
    }
  }

  // Sort by score ascending (best match first)
  recommendations.sort((a, b) => a.score - b.score);

  return recommendations.slice(0, maxAlternatives);
}
