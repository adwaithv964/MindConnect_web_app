import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CalendarView = ({ selectedDate, onDateSelect, availableSlots, onSlotSelect, selectedSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateAvailable = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today?.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === currentMonth?.getMonth() && selectedDate?.getFullYear() === currentMonth?.getFullYear());
  };

  const handleDateClick = (day) => {
    if (isDateAvailable(day)) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onDateSelect(date);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">
          {monthNames?.[currentMonth?.getMonth()]} {currentMonth?.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            onClick={previousMonth}
            aria-label="Previous month"
          />
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            onClick={nextMonth}
            aria-label="Next month"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames?.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek })?.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth })?.map((_, index) => {
          const day = index + 1;
          const available = isDateAvailable(day);
          const selected = isDateSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!available}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-150
                ${selected ? 'bg-primary text-primary-foreground' : ''}
                ${!selected && available ? 'hover:bg-muted' : ''}
                ${!available ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-foreground'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
      {selectedDate && availableSlots?.length > 0 && (
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Icon name="Clock" size={20} color="var(--color-primary)" />
            Available Time Slots
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSlots?.map((slot) => (
              <button
                key={slot?.id}
                onClick={() => onSlotSelect(slot)}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                  ${selectedSlot?.id === slot?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                  }
                  ${!slot?.available ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={!slot?.available}
              >
                {slot?.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;