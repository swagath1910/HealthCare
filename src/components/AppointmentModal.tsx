import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building2 } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    hospitalId: string;
  };
  hospitalName: string;
  onBook: (appointment: {
    doctor_id: string;
    doctor_name: string;
    hospital_id: string;
    hospital_name: string;
    date: string;
    time: string;
  }) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  doctor,
  hospitalName,
  onBook
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      onBook({
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        hospital_id: doctor.hospitalId,
        hospital_name: hospitalName,
        date: selectedDate,
        time: selectedTime
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="modal-3d w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gradient">Book Appointment</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-dark p-2 hover:bg-gray-100 rounded-full transition-all-smooth">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 space-y-3 glass-effect p-4 rounded-xl">
          <div className="flex items-center space-x-3 text-dark">
            <User className="h-5 w-5 text-red-600" />
            <span className="font-bold">{doctor.name} - {doctor.specialization}</span>
          </div>
          <div className="flex items-center space-x-3 text-dark">
            <Building2 className="h-5 w-5 text-red-600" />
            <span className="font-bold">{hospitalName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-dark mb-3">
              <Calendar className="h-5 w-5 inline mr-2" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-3d w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-dark mb-3">
              <Clock className="h-5 w-5 inline mr-2" />
              Select Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-3 text-sm rounded-xl border-2 transition-all-smooth font-bold ${
                    selectedTime === time
                      ? 'btn-danger-3d text-white border-red-600 scale-105'
                      : 'btn-3d text-dark border-gray-200 hover-lift'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-3d px-6 py-3 rounded-xl font-bold text-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-danger-3d px-6 py-3 rounded-xl font-bold text-white hover-lift"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;