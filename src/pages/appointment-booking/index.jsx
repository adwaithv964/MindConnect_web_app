import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleBasedSidebar, { SidebarProvider, useSidebar } from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CounsellorCard from './components/CounsellorCard';
import FilterPanel from './components/FilterPanel';
import CalendarView from './components/CalendarView';
import BookingModal from './components/BookingModal';
import SuccessModal from './components/SuccessModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const AppointmentBookingContent = () => {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const [filters, setFilters] = useState({
    specialty: 'all',
    sessionType: 'all',
    language: 'all',
    availableToday: false,
    availableThisWeek: false,
    eveningSlots: false,
    weekendSlots: false,
    videoCall: false,
    phoneCall: false,
    inPerson: false,
    acceptsInsurance: false
  });

  // Fetch counsellors from backend
  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/counsellor`);
        const formattedCounsellors = response.data.map(c => ({
          id: c._id,
          name: c.name,
          credentials: c.profile?.qualifications || 'Licensed Counsellor',
          image: c.profile?.profilePhoto || null,
          imageAlt: `Profile of ${c.name}`,
          specializations: c.profile?.specializations || [],
          bio: c.profile?.bio || 'Experienced mental health professional.',
          rating: 5.0,
          patientsServed: c.profile?.patientCount || 0,
          experience: c.profile?.experienceYears || 0,
          languages: c.profile?.languages || ['English'],
          isAvailable: true,
          isVerified: c.isVerified || false,
          // Keep full profile for modal
          fullProfile: {
            bio: c.profile?.bio,
            specializations: c.profile?.specializations || [],
            qualifications: c.profile?.qualifications,
            experienceYears: c.profile?.experienceYears,
            languages: c.profile?.languages || [],
            patientCount: c.profile?.patientCount || 0,
            nmcVerificationStatus: c.profile?.nmcVerificationStatus || 'unverified'
          }
        }));
        setCounsellors(formattedCounsellors);
      } catch (error) {
        console.error('Error fetching counsellors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounsellors();
  }, []);

  // Fetch slots when counsellor or date changes
  useEffect(() => {
    if (!selectedCounsellor || !selectedDate) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const res = await axios.get(
          `${API_BASE_URL}/api/counsellor/${selectedCounsellor.id}/slots?date=${dateStr}`
        );
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
        // Fallback default slots
        setAvailableSlots([
          { id: 1, time: '9:00 AM', available: true },
          { id: 2, time: '10:00 AM', available: true },
          { id: 3, time: '11:00 AM', available: true },
          { id: 4, time: '1:00 PM', available: true },
          { id: 5, time: '2:00 PM', available: true },
          { id: 6, time: '3:00 PM', available: true },
          { id: 7, time: '4:00 PM', available: true },
          { id: 8, time: '5:00 PM', available: true },
          { id: 9, time: '6:00 PM', available: true }
        ]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedCounsellor, selectedDate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      specialty: 'all',
      sessionType: 'all',
      language: 'all',
      availableToday: false,
      availableThisWeek: false,
      eveningSlots: false,
      weekendSlots: false,
      videoCall: false,
      phoneCall: false,
      inPerson: false,
      acceptsInsurance: false
    });
    setSearchQuery('');
  };

  const handleBookAppointment = counsellor => {
    setSelectedCounsellor(counsellor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async details => {
    try {
      setIsBooking(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?._id || storedUser?.id;

      if (!userId) {
        alert('Please log in to book an appointment.');
        return;
      }

      if (!selectedDate) {
        alert('Please select a date first from the calendar.');
        return;
      }

      if (!selectedSlot) {
        alert('Please select a time slot first.');
        return;
      }

      const appointmentData = {
        title: details.reasonForVisit || 'Consultation',
        date: selectedDate.toISOString(),
        timeSlot: selectedSlot.time,
        counsellorId: selectedCounsellor.id,
        doctor: selectedCounsellor.name,
        notes: details.notes || '',
        userId,
        sessionType: details.sessionType,
        insuranceProvider: details.insuranceProvider || '',
        policyNumber: details.policyNumber || '',
        reason: details.reasonForVisit,
        isFirstSession: details.isFirstSession || false
      };

      await axios.post(`${API_BASE_URL}/api/appointments`, appointmentData);

      setBookingDetails({
        ...details,
        counsellor: selectedCounsellor,
        doctor: selectedCounsellor.name,
        date: selectedDate,
        slot: selectedSlot
      });
      setIsBookingModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    navigate('/my-bookings');
  };

  const handleEmergency = () => navigate('/emergency-support');

  // Apply filters client-side
  const filteredCounsellors = counsellors?.filter(counsellor => {
    // Search
    const matchesSearch =
      !searchQuery ||
      counsellor?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      counsellor?.specializations?.some(spec =>
        spec?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );

    // Specialty filter
    const matchesSpecialty =
      filters.specialty === 'all' ||
      counsellor?.specializations?.some(s =>
        s?.toLowerCase()?.includes(filters.specialty?.toLowerCase())
      );

    // Language filter
    const matchesLanguage =
      filters.language === 'all' ||
      counsellor?.languages?.some(l =>
        l?.toLowerCase()?.includes(filters.language?.toLowerCase())
      );

    return matchesSearch && matchesSpecialty && matchesLanguage;
  });

  return (
    <>
      <RoleBasedSidebar userRole="patient" />
      <SOSFloatingButton onEmergency={handleEmergency} />
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <BreadcrumbTrail />

        <div className="mb-8">
          <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground mb-2">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with experienced mental health professionals who can support your wellness journey
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e?.target?.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            iconName="Filter"
            iconPosition="left"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="outline"
            iconName="BookOpen"
            iconPosition="left"
            onClick={() => navigate('/my-bookings')}
            className="sm:w-auto"
          >
            My Bookings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {showFilters && (
            <div className="lg:col-span-3">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          <div className={showFilters ? 'lg:col-span-6' : 'lg:col-span-8'}>
            {/* Selected slot reminder */}
            {selectedCounsellor && !selectedDate && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-sm text-primary">
                <Icon name="Info" size={16} />
                <span>Select a date from the calendar to see available time slots for <strong>{selectedCounsellor.name}</strong></span>
              </div>
            )}
            {selectedCounsellor && selectedDate && !selectedSlot && (
              <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2 text-sm text-warning">
                <Icon name="Clock" size={16} />
                <span>Now select a time slot from the calendar, then book your session</span>
              </div>
            )}
            {selectedCounsellor && selectedDate && selectedSlot && (
              <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2 text-sm text-success">
                <Icon name="CheckCircle2" size={16} />
                <span>
                  Ready to book <strong>{selectedCounsellor.name}</strong> on{' '}
                  <strong>
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </strong>{' '}
                  at <strong>{selectedSlot.time}</strong>
                </span>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-full bg-muted" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-4/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCounsellors?.length > 0 ? (
                filteredCounsellors?.map(counsellor => (
                  <CounsellorCard
                    key={counsellor?.id}
                    counsellor={counsellor}
                    isSelected={selectedCounsellor?.id === counsellor?.id}
                    onBookAppointment={handleBookAppointment}
                    onSelectCounsellor={c => {
                      setSelectedCounsellor(c);
                      setSelectedSlot(null);
                    }}
                  />
                ))
              ) : (
                <div className="glass-card p-12 text-center">
                  <Icon name="Search" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    No counsellors found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find available counsellors
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                availableSlots={availableSlots}
                isLoadingSlots={isLoadingSlots}
                onSlotSelect={setSelectedSlot}
                selectedSlot={selectedSlot}
                selectedCounsellor={selectedCounsellor}
              />

              {selectedCounsellor && selectedDate && selectedSlot && (
                <Button
                  variant="default"
                  fullWidth
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book with {selectedCounsellor.name}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        counsellor={selectedCounsellor}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onConfirmBooking={handleConfirmBooking}
        isSubmitting={isBooking}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        bookingDetails={bookingDetails}
      />
    </>
  );
};

const AppointmentBooking = () => {
  return (
    <SidebarProvider>
      <AppointmentBookingContent />
    </SidebarProvider>
  );
};

export default AppointmentBooking;