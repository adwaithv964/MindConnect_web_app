import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AppointmentBookingContent = () => {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const counsellors = [
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      credentials: "PhD, Licensed Clinical Psychologist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_13e1df70a-1763301872470.png",
      imageAlt: "Professional woman with brown hair wearing white medical coat and stethoscope smiling warmly in modern clinical office",
      specializations: ["Anxiety", "Depression", "Trauma"],
      bio: "Specializing in cognitive behavioral therapy with over 15 years of experience helping individuals overcome anxiety and depression through evidence-based approaches.",
      rating: 4.9,
      patientsServed: 500,
      experience: 15,
      languages: ["English", "Spanish"],
      isAvailable: true
    },
    {
      id: 2,
      name: "Dr. James Chen",
      credentials: "MD, Psychiatrist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_14f7a8d49-1763294480396.png",
      imageAlt: "Asian male doctor with short black hair wearing navy blue scrubs and glasses in hospital setting with medical equipment visible",
      specializations: ["Depression", "Bipolar Disorder", "Medication Management"],
      bio: "Board-certified psychiatrist focusing on medication management and holistic treatment approaches for mood disorders and complex mental health conditions.",
      rating: 4.8,
      patientsServed: 750,
      experience: 12,
      languages: ["English", "Mandarin"],
      isAvailable: true
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      credentials: "PsyD, Clinical Psychologist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b25cd3a1-1763299505524.png",
      imageAlt: "Hispanic woman with long dark hair wearing professional teal blazer smiling confidently in bright modern therapy office",
      specializations: ["Relationships", "Family Therapy", "Stress Management"],
      bio: "Experienced in couples and family therapy, helping individuals and families navigate relationship challenges and improve communication patterns.",
      rating: 4.9,
      patientsServed: 600,
      experience: 10,
      languages: ["English", "Spanish"],
      isAvailable: false
    },
    {
      id: 4,
      name: "Dr. Michael Thompson",
      credentials: "PhD, Trauma Specialist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1373cd82c-1763294505279.png",
      imageAlt: "African American male therapist with short hair wearing gray suit and tie in warm-toned counseling room with comfortable seating",
      specializations: ["PTSD", "Trauma", "Crisis Intervention"],
      bio: "Specialized in trauma-focused cognitive behavioral therapy and EMDR, providing compassionate care for individuals recovering from traumatic experiences.",
      rating: 5.0,
      patientsServed: 400,
      experience: 18,
      languages: ["English"],
      isAvailable: true
    },
    {
      id: 5,
      name: "Dr. Lisa Patel",
      credentials: "LCSW, Licensed Clinical Social Worker",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_171ef9b9a-1763295573069.png",
      imageAlt: "Indian woman with shoulder-length black hair wearing burgundy cardigan smiling warmly in cozy therapy office with plants and natural lighting",
      specializations: ["Addiction", "Grief", "Life Transitions"],
      bio: "Compassionate social worker specializing in addiction recovery and grief counseling, helping clients navigate major life transitions with resilience.",
      rating: 4.7,
      patientsServed: 550,
      experience: 14,
      languages: ["English", "Hindi"],
      isAvailable: true
    },
    {
      id: 6,
      name: "Dr. Robert Kim",
      credentials: "PhD, Child & Adolescent Psychologist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2728076-1763294337676.png",
      imageAlt: "Korean male psychologist with glasses wearing casual blue button-down shirt in colorful child-friendly therapy room with toys visible",
      specializations: ["Anxiety", "ADHD", "Behavioral Issues"],
      bio: "Dedicated to helping children and adolescents develop healthy coping mechanisms and emotional regulation skills through play therapy and CBT.",
      rating: 4.8,
      patientsServed: 450,
      experience: 11,
      languages: ["English"],
      isAvailable: true
    }];


  const availableSlots = [
    { id: 1, time: "9:00 AM", available: true },
    { id: 2, time: "10:00 AM", available: true },
    { id: 3, time: "11:00 AM", available: false },
    { id: 4, time: "1:00 PM", available: true },
    { id: 5, time: "2:00 PM", available: true },
    { id: 6, time: "3:00 PM", available: true },
    { id: 7, time: "4:00 PM", available: false },
    { id: 8, time: "5:00 PM", available: true },
    { id: 9, time: "6:00 PM", available: true }];


  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
  };

  const handleBookAppointment = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (details) => {
    setBookingDetails(details);
    setIsBookingModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    navigate('/patient-dashboard');
  };

  const handleEmergency = () => {
    navigate('/emergency-support');
  };

  const filteredCounsellors = counsellors?.filter((counsellor) => {
    const matchesSearch = counsellor?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      counsellor?.specializations?.some((spec) => spec?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    return matchesSearch;
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
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full" />

          </div>
          <Button
            variant="outline"
            iconName="Filter"
            iconPosition="left"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto">

            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {showFilters &&
            <div className="lg:col-span-3">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters} />

            </div>
          }

          <div className={showFilters ? 'lg:col-span-6' : 'lg:col-span-8'}>
            <div className="space-y-4">
              {filteredCounsellors?.length > 0 ?
                filteredCounsellors?.map((counsellor) =>
                  <CounsellorCard
                    key={counsellor?.id}
                    counsellor={counsellor}
                    onBookAppointment={handleBookAppointment} />

                ) :

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
              }
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                availableSlots={availableSlots}
                onSlotSelect={setSelectedSlot}
                selectedSlot={selectedSlot} />


              {selectedDate && selectedSlot &&
                <div className="glass-card p-4 mt-4">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Icon name="CheckCircle2" size={20} />
                    <span className="font-medium">Time slot selected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a counsellor above to complete your booking
                  </p>
                </div>
              }
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
        onConfirmBooking={handleConfirmBooking} />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        bookingDetails={bookingDetails} />

    </>);

};

const AppointmentBooking = () => {
  return (
    <SidebarProvider>
      <AppointmentBookingContent />
    </SidebarProvider>);

};

export default AppointmentBooking;