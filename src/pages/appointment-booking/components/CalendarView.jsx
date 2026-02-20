import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CalendarView = ({
  selectedDate,
  onDateSelect,
  availableSlots,
  isLoadingSlots,
  onSlotSelect,
  selectedSlot,
  selectedCounsellor
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = date => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay?.getDate(),
      startingDayOfWeek: firstDay?.getDay()
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const isDateAvailable = day => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = day =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === currentMonth.getMonth() &&
    selectedDate.getFullYear() === currentMonth.getFullYear();

  const isToday = day => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = day => {
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
    <div className="glass-card p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" iconName="ChevronLeft" onClick={previousMonth} aria-label="Previous month" />
          <Button variant="outline" size="sm" iconName="ChevronRight" onClick={nextMonth} aria-label="Next month" />
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const available = isDateAvailable(day);
          const selected = isDateSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!available}
              className={`
                aspect-square rounded-lg text-xs font-medium transition-all duration-150 relative
                ${selected ? 'bg-primary text-primary-foreground shadow-sm' : ''}
                ${!selected && available ? 'hover:bg-primary/10 text-foreground' : ''}
                ${!available ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                ${today && !selected ? 'ring-1 ring-primary text-primary font-bold' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="border-t border-border pt-4">
          <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
            <Icon name="Clock" size={16} color="var(--color-primary)" />
            {selectedCounsellor
              ? `Slots — ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'Select a counsellor first'}
          </h3>

          {!selectedCounsellor ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Choose a counsellor from the list to see available time slots.
            </p>
          ) : isLoadingSlots ? (
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-4">
              <Icon name="CalendarX2" size={24} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No slots available on this day</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && onSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`
                    px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150
                    ${selectedSlot?.id === slot.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : slot.available
                        ? 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
                        : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through'
                    }
                  `}
                >
                  {slot.time}
                  {!slot.available && <span className="ml-1 text-xs">✕</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Click a date above to select it
        </p>
      )}
    </div>
  );
};

export default CalendarView;