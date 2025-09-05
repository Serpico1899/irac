import type {
  Workshop,
  WorkshopInstructor,
  WorkshopSchedule,
  WorkshopReservation,
  WorkshopAvailability,
  WorkshopCalendarSlot,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancelReservationRequest,
  WorkshopQuery,
  WorkshopListResponse,
  ReservationQuery,
  ReservationHistoryResponse,
  AvailabilityQuery,
  WorkshopApiResponse,
  WorkshopStatus,
  ReservationStatus,
  WorkshopLevel,
  PaymentMethod,
} from "@/types";

// Mock instructors data
const mockInstructors: WorkshopInstructor[] = [
  {
    _id: "instructor_1",
    name: "دکتر سارا احمدی",
    name_en: "Dr. Sara Ahmadi",
    bio: "متخصص روانشناسی بالینی با ۱۰ سال تجربه در حوزه درمان اضطراب و استرس",
    bio_en:
      "Clinical psychologist with 10 years experience in anxiety and stress treatment",
    avatar: {
      url: "/images/instructors/sara-ahmadi.jpg",
      alt: "Dr. Sara Ahmadi",
    },
    specialties: [
      "anxiety_therapy",
      "stress_management",
      "cognitive_behavioral_therapy",
    ],
    experience_years: 10,
    rating: {
      average: 4.8,
      count: 127,
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z",
  },
  {
    _id: "instructor_2",
    name: "علی محمدی",
    name_en: "Ali Mohammadi",
    bio: "مربی یوگا و مدیتیشن با گواهینامه‌های بین‌المللی و ۸ سال تجربه",
    bio_en:
      "Yoga and meditation instructor with international certifications and 8 years experience",
    avatar: {
      url: "/images/instructors/ali-mohammadi.jpg",
      alt: "Ali Mohammadi",
    },
    specialties: ["yoga", "meditation", "mindfulness", "breathing_techniques"],
    experience_years: 8,
    rating: {
      average: 4.9,
      count: 203,
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z",
  },
  {
    _id: "instructor_3",
    name: "مریم کریمی",
    name_en: "Maryam Karimi",
    bio: "مشاور خانواده و ازدواج با تخصص در حل تعارضات و بهبود روابط",
    bio_en:
      "Family and marriage counselor specializing in conflict resolution and relationship improvement",
    avatar: {
      url: "/images/instructors/maryam-karimi.jpg",
      alt: "Maryam Karimi",
    },
    specialties: [
      "family_therapy",
      "marriage_counseling",
      "conflict_resolution",
    ],
    experience_years: 12,
    rating: {
      average: 4.7,
      count: 89,
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z",
  },
];

// Mock schedules data
const mockSchedules: WorkshopSchedule[] = [
  {
    _id: "schedule_1",
    workshop_id: "workshop_1",
    instructor_id: "instructor_1",
    start_date: "2024-02-15",
    end_date: "2024-02-15",
    start_time: "10:00",
    end_time: "12:00",
    duration_minutes: 120,
    max_participants: 20,
    min_participants: 5,
    current_reservations: 12,
    waitlist_count: 3,
    price: 150000,
    discounted_price: 120000,
    location: {
      type: "online",
      meeting_link: "https://zoom.us/j/123456789",
      meeting_password: "workshop123",
    },
    prerequisites: ["basic_understanding_of_stress"],
    materials_needed: ["notebook", "pen"],
    is_active: true,
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
  },
  {
    _id: "schedule_2",
    workshop_id: "workshop_1",
    instructor_id: "instructor_1",
    start_date: "2024-02-22",
    end_date: "2024-02-22",
    start_time: "14:00",
    end_time: "16:00",
    duration_minutes: 120,
    max_participants: 20,
    min_participants: 5,
    current_reservations: 8,
    waitlist_count: 0,
    price: 150000,
    location: {
      type: "physical",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      room: "سالن کنفرانس طلایی",
    },
    prerequisites: ["basic_understanding_of_stress"],
    materials_needed: ["notebook", "pen"],
    is_active: true,
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
  },
  {
    _id: "schedule_3",
    workshop_id: "workshop_2",
    instructor_id: "instructor_2",
    start_date: "2024-02-18",
    end_date: "2024-02-25",
    start_time: "09:00",
    end_time: "10:30",
    duration_minutes: 90,
    max_participants: 15,
    min_participants: 3,
    current_reservations: 10,
    waitlist_count: 2,
    price: 200000,
    discounted_price: 180000,
    location: {
      type: "hybrid",
      address: "تهران، خیابان کریمخان، پلاک ۴۵",
      room: "استودیو یوگا",
      meeting_link: "https://meet.google.com/abc-defg-hij",
    },
    recurrence: {
      type: "weekly",
      interval: 1,
      end_date: "2024-02-25",
      days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
    },
    prerequisites: [],
    materials_needed: ["yoga_mat", "comfortable_clothing"],
    is_active: true,
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
  },
];

// Mock workshops data
const mockWorkshops: Workshop[] = [
  {
    _id: "workshop_1",
    title: "کارگاه مدیریت استرس و اضطراب",
    title_en: "Stress and Anxiety Management Workshop",
    slug: "stress-anxiety-management",
    description:
      "در این کارگاه جامع، تکنیک‌های مؤثر برای مدیریت استرس و اضطراب روزمره را خواهید آموخت. از روش‌های تنفسی گرفته تا تکنیک‌های ذهن‌آگاهی، همه چیز را پوشش خواهیم داد.",
    description_en:
      "In this comprehensive workshop, you'll learn effective techniques for managing daily stress and anxiety. From breathing methods to mindfulness techniques, we'll cover everything.",
    short_description: "آموزش تکنیک‌های عملی برای مدیریت استرس و اضطراب",
    short_description_en:
      "Learn practical techniques for stress and anxiety management",
    status: "published",
    level: "beginner",
    category: "mental_health",
    tags: ["stress", "anxiety", "mindfulness", "mental_health"],
    featured_image: {
      url: "/images/workshops/stress-management.jpg",
      alt: "کارگاه مدیریت استرس",
      width: 800,
      height: 600,
    },
    gallery: [
      {
        url: "/images/workshops/stress-1.jpg",
        alt: "جلسه گروهی",
        width: 600,
        height: 400,
      },
      {
        url: "/images/workshops/stress-2.jpg",
        alt: "تمرین تنفس",
        width: 600,
        height: 400,
      },
    ],
    instructor: mockInstructors[0],
    schedules: [mockSchedules[0], mockSchedules[1]],
    base_price: 150000,
    currency: "IRR",
    what_you_learn: [
      "تشخیص علائم استرس و اضطراب",
      "تکنیک‌های تنفسی مؤثر",
      "روش‌های ذهن‌آگاهی",
      "مدیریت افکار منفی",
      "ایجاد برنامه روزانه سالم",
    ],
    what_you_learn_en: [
      "Recognizing stress and anxiety symptoms",
      "Effective breathing techniques",
      "Mindfulness methods",
      "Managing negative thoughts",
      "Creating healthy daily routines",
    ],
    requirements: [
      "انگیزه برای یادگیری",
      "دسترسی به اینترنت (برای جلسات آنلاین)",
    ],
    requirements_en: [
      "Motivation to learn",
      "Internet access (for online sessions)",
    ],
    materials_included: ["کتابچه تمرینات", "فایل صوتی مدیتیشن", "برنامه عملی"],
    materials_included_en: [
      "Exercise booklet",
      "Meditation audio file",
      "Practical program",
    ],
    certificate_provided: true,
    rating: {
      average: 4.8,
      count: 156,
    },
    total_participants: 324,
    is_featured: true,
    is_popular: true,
    view_count: 1250,
    meta_title: "کارگاه مدیریت استرس و اضطراب - آی‌راک",
    meta_description: "بهترین کارگاه آموزش مدیریت استرس و اضطراب با مدرس متخصص",
    seo_keywords: ["مدیریت استرس", "کنترل اضطراب", "کارگاه روانشناسی"],
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
    created_by: "admin_1",
    updated_by: "admin_1",
  },
  {
    _id: "workshop_2",
    title: "دوره مقدماتی یوگا و مدیتیشن",
    title_en: "Beginner Yoga and Meditation Course",
    slug: "beginner-yoga-meditation",
    description:
      "دوره‌ای جامع برای شروع سفر یوگا و مدیتیشن. از حرکات پایه گرفته تا تکنیک‌های مدیتیشن، همه چیز را از صفر یاد خواهید گرفت.",
    description_en:
      "A comprehensive course to start your yoga and meditation journey. From basic movements to meditation techniques, you'll learn everything from scratch.",
    short_description: "آموزش یوگا و مدیتیشن از مبتدی تا متوسط",
    short_description_en:
      "Yoga and meditation training from beginner to intermediate",
    status: "published",
    level: "beginner",
    category: "wellness",
    tags: ["yoga", "meditation", "wellness", "fitness"],
    featured_image: {
      url: "/images/workshops/yoga-meditation.jpg",
      alt: "کلاس یوگا",
      width: 800,
      height: 600,
    },
    instructor: mockInstructors[1],
    schedules: [mockSchedules[2]],
    base_price: 200000,
    currency: "IRR",
    what_you_learn: [
      "حرکات اساسی یوگا",
      "تکنیک‌های تنفس صحیح",
      "مدیتیشن راهرفتن",
      "آرامش ذهن",
      "انعطاف‌پذیری بدن",
    ],
    requirements: ["لباس راحت", "تشک یوگا"],
    materials_included: ["راهنمای حرکات", "موسیقی مدیتیشن"],
    certificate_provided: true,
    rating: {
      average: 4.9,
      count: 203,
    },
    total_participants: 458,
    is_featured: true,
    is_popular: true,
    view_count: 1876,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
    created_by: "admin_1",
  },
  {
    _id: "workshop_3",
    title: "کارگاه بهبود روابط خانوادگی",
    title_en: "Family Relationship Improvement Workshop",
    slug: "family-relationship-improvement",
    description:
      "کارگاهی عملی برای بهبود ارتباطات خانوادگی و حل تعارضات. تکنیک‌های مؤثر برای ایجاد فضای محبت‌آمیز در خانه.",
    short_description: "آموزش مهارت‌های ارتباطی برای خانواده‌ها",
    status: "published",
    level: "intermediate",
    category: "relationship",
    tags: ["family", "communication", "relationship"],
    featured_image: {
      url: "/images/workshops/family-relationship.jpg",
      alt: "خانواده شاد",
      width: 800,
      height: 600,
    },
    instructor: mockInstructors[2],
    schedules: [],
    base_price: 180000,
    currency: "IRR",
    what_you_learn: [
      "مهارت‌های ارتباط مؤثر",
      "حل تعارضات خانوادگی",
      "ایجاد مرزهای سالم",
    ],
    requirements: ["تمایل به بهبود روابط"],
    materials_included: ["کتابچه راهنما"],
    certificate_provided: false,
    rating: {
      average: 4.7,
      count: 89,
    },
    total_participants: 167,
    is_featured: false,
    is_popular: false,
    view_count: 567,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-20T15:30:00.000Z",
    created_by: "admin_1",
  },
];

// Mock reservations data
const mockReservations: WorkshopReservation[] = [
  {
    _id: "reservation_1",
    reservation_number: "WS-2024-001",
    user_id: "user_1",
    workshop_id: "workshop_1",
    schedule_id: "schedule_1",
    workshop: mockWorkshops[0],
    schedule: mockSchedules[0],
    status: "confirmed",
    participant_info: {
      name: "سارا محمدی",
      email: "sara@example.com",
      phone: "+989123456789",
      dietary_restrictions: "گیاهخوار",
      accessibility_needs: "",
      emergency_contact: {
        name: "احمد محمدی",
        phone: "+989987654321",
        relationship: "همسر",
      },
    },
    payment_info: {
      amount_paid: 120000,
      payment_method: "wallet_balance",
      payment_status: "paid",
      transaction_id: "txn_123456",
      discount_applied: 30000,
      coupon_code: "FIRST20",
    },
    booking_notes: "علاقه‌مند به یادگیری تکنیک‌های عملی",
    confirmation_sent_at: "2024-01-25T10:00:00.000Z",
    reserved_at: "2024-01-20T14:30:00.000Z",
    confirmed_at: "2024-01-25T10:00:00.000Z",
    created_at: "2024-01-20T14:30:00.000Z",
    updated_at: "2024-01-25T10:00:00.000Z",
  },
  {
    _id: "reservation_2",
    reservation_number: "WS-2024-002",
    user_id: "user_1",
    workshop_id: "workshop_2",
    schedule_id: "schedule_3",
    workshop: mockWorkshops[1],
    schedule: mockSchedules[2],
    status: "pending",
    participant_info: {
      name: "سارا محمدی",
      email: "sara@example.com",
      phone: "+989123456789",
    },
    payment_info: {
      amount_paid: 0,
      payment_method: "zarinpal",
      payment_status: "pending",
    },
    reserved_at: "2024-01-28T16:45:00.000Z",
    created_at: "2024-01-28T16:45:00.000Z",
    updated_at: "2024-01-28T16:45:00.000Z",
  },
];

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateReservationNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `WS-${year}-${random}`;
};

const calculatePrice = (
  schedule: WorkshopSchedule,
  discountPercentage: number = 0,
): number => {
  const basePrice = schedule.discounted_price || schedule.price;
  const discount = (basePrice * discountPercentage) / 100;
  return basePrice - discount;
};

// API functions
export const workshopApi = {
  // Get workshops list
  async getWorkshops(
    query: WorkshopQuery = {},
  ): Promise<WorkshopApiResponse<WorkshopListResponse>> {
    await delay(800);

    try {
      const page = query.page || 1;
      const limit = query.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      let filteredWorkshops = [...mockWorkshops];

      // Apply filters
      if (query.category) {
        filteredWorkshops = filteredWorkshops.filter(
          (w) => w.category === query.category,
        );
      }

      if (query.level) {
        filteredWorkshops = filteredWorkshops.filter(
          (w) => w.level === query.level,
        );
      }

      if (query.instructor_id) {
        filteredWorkshops = filteredWorkshops.filter(
          (w) => w.instructor._id === query.instructor_id,
        );
      }

      if (query.price_min !== undefined) {
        filteredWorkshops = filteredWorkshops.filter(
          (w) => w.base_price >= query.price_min!,
        );
      }

      if (query.price_max !== undefined) {
        filteredWorkshops = filteredWorkshops.filter(
          (w) => w.base_price <= query.price_max!,
        );
      }

      if (query.location_type) {
        filteredWorkshops = filteredWorkshops.filter((w) =>
          w.schedules.some((s) => s.location?.type === query.location_type),
        );
      }

      if (query.available_only) {
        filteredWorkshops = filteredWorkshops.filter((w) =>
          w.schedules.some((s) => s.current_reservations < s.max_participants),
        );
      }

      if (query.featured_only) {
        filteredWorkshops = filteredWorkshops.filter((w) => w.is_featured);
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredWorkshops = filteredWorkshops.filter(
          (w) =>
            w.title.toLowerCase().includes(searchTerm) ||
            w.title_en?.toLowerCase().includes(searchTerm) ||
            w.description.toLowerCase().includes(searchTerm) ||
            w.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        );
      }

      // Apply sorting
      filteredWorkshops.sort((a, b) => {
        const sortBy = query.sort_by || "created_at";
        const order = query.sort_order === "asc" ? 1 : -1;

        switch (sortBy) {
          case "price":
            return (a.base_price - b.base_price) * order;
          case "rating":
            return (a.rating.average - b.rating.average) * order;
          case "popularity":
            return (a.total_participants - b.total_participants) * order;
          case "start_date":
            const aDate = a.schedules[0]?.start_date || "9999-12-31";
            const bDate = b.schedules[0]?.start_date || "9999-12-31";
            return aDate.localeCompare(bDate) * order;
          default:
            return a.created_at.localeCompare(b.created_at) * order;
        }
      });

      const paginatedWorkshops = filteredWorkshops.slice(startIndex, endIndex);

      // Generate filters data
      const categories = [...new Set(mockWorkshops.map((w) => w.category))].map(
        (cat) => ({
          category: cat,
          count: mockWorkshops.filter((w) => w.category === cat).length,
        }),
      );

      const levels = [...new Set(mockWorkshops.map((w) => w.level))].map(
        (level) => ({
          level: level as WorkshopLevel,
          count: mockWorkshops.filter((w) => w.level === level).length,
        }),
      );

      const instructors = [
        ...new Set(mockWorkshops.map((w) => w.instructor._id)),
      ].map((id) => {
        const instructor = mockInstructors.find((i) => i._id === id)!;
        return {
          instructor_id: id,
          name: instructor.name,
          count: mockWorkshops.filter((w) => w.instructor._id === id).length,
        };
      });

      const prices = mockWorkshops.map((w) => w.base_price);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };

      const locationTypes = ["online", "physical", "hybrid"].map((type) => ({
        type,
        count: mockWorkshops.filter((w) =>
          w.schedules.some((s) => s.location?.type === type),
        ).length,
      }));

      return {
        success: true,
        data: {
          workshops: paginatedWorkshops,
          pagination: {
            page,
            limit,
            total: filteredWorkshops.length,
            pages: Math.ceil(filteredWorkshops.length / limit),
          },
          filters: {
            categories,
            levels,
            instructors,
            price_range: priceRange,
            location_types: locationTypes,
          },
        },
      };
    } catch (error) {
      console.error("Error getting workshops:", error);
      return {
        success: false,
        error: "Failed to get workshops",
      };
    }
  },

  // Get single workshop
  async getWorkshop(id: string): Promise<WorkshopApiResponse<Workshop>> {
    await delay(600);

    try {
      const workshop = mockWorkshops.find((w) => w._id === id || w.slug === id);

      if (!workshop) {
        return {
          success: false,
          error: "Workshop not found",
        };
      }

      // Increment view count (in real app, this would be done server-side)
      workshop.view_count += 1;

      return {
        success: true,
        data: workshop,
      };
    } catch (error) {
      console.error("Error getting workshop:", error);
      return {
        success: false,
        error: "Failed to get workshop details",
      };
    }
  },

  // Get workshop by slug
  async getWorkshopBySlug(
    slug: string,
  ): Promise<WorkshopApiResponse<Workshop>> {
    await delay(600);

    try {
      const workshop = mockWorkshops.find((w) => w.slug === slug);

      if (!workshop) {
        return {
          success: false,
          error: "Workshop not found",
        };
      }

      // Increment view count (in real app, this would be done server-side)
      workshop.view_count += 1;

      return {
        success: true,
        data: workshop,
      };
    } catch (error) {
      console.error("Error getting workshop by slug:", error);
      return {
        success: false,
        error: "Failed to get workshop details",
      };
    }
  },

  // Get workshop schedules
  async getWorkshopSchedules(
    workshopId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<WorkshopApiResponse<WorkshopSchedule[]>> {
    await delay(600);

    try {
      let schedules = [...mockSchedules];

      // Filter by workshop
      schedules = schedules.filter((s) => s.workshop_id === workshopId);

      // Filter by date range if provided
      if (dateFrom && dateTo) {
        schedules = schedules.filter((s) => {
          const startDate = s.start_date;
          return startDate >= dateFrom && startDate <= dateTo;
        });
      }

      // Only return active schedules with available spots
      schedules = schedules.filter(
        (s) =>
          s.is_active &&
          s.current_reservations < s.max_participants &&
          new Date(s.start_date) > new Date(),
      );

      return {
        success: true,
        data: schedules,
      };
    } catch (error) {
      console.error("Error getting workshop schedules:", error);
      return {
        success: false,
        error: "Failed to get workshop schedules",
      };
    }
  },

  // Get availability
  async getAvailability(
    query: AvailabilityQuery,
  ): Promise<WorkshopApiResponse<WorkshopAvailability[]>> {
    await delay(700);

    try {
      let schedules = [...mockSchedules];

      // Filter by workshop
      if (query.workshop_id) {
        schedules = schedules.filter(
          (s) => s.workshop_id === query.workshop_id,
        );
      }

      // Filter by instructor
      if (query.instructor_id) {
        schedules = schedules.filter(
          (s) => s.instructor_id === query.instructor_id,
        );
      }

      // Filter by location type
      if (query.location_type) {
        schedules = schedules.filter(
          (s) => s.location?.type === query.location_type,
        );
      }

      // Filter by date range
      schedules = schedules.filter((s) => {
        const startDate = s.start_date;
        return startDate >= query.date_from && startDate <= query.date_to;
      });

      const availability: WorkshopAvailability[] = schedules.map((schedule) => {
        const availableSpots = Math.max(
          0,
          schedule.max_participants - schedule.current_reservations,
        );
        const isAvailable = availableSpots > 0;
        const isWaitlistAvailable =
          !isAvailable && schedule.max_participants > 0;

        return {
          schedule_id: schedule._id,
          date: schedule.start_date,
          available_spots: availableSpots,
          is_available: isAvailable,
          is_waitlist_available: isWaitlistAvailable,
          price: schedule.discounted_price || schedule.price,
          discounted_price: schedule.discounted_price,
        };
      });

      return {
        success: true,
        data: availability,
      };
    } catch (error) {
      console.error("Error getting availability:", error);
      return {
        success: false,
        error: "Failed to get availability",
      };
    }
  },

  // Create reservation
  async createReservation(
    request: CreateReservationRequest,
  ): Promise<WorkshopApiResponse<{ reservation_id: string }>> {
    await delay(1200);

    try {
      const schedule = mockSchedules.find((s) => s._id === request.schedule_id);
      if (!schedule) {
        return {
          success: false,
          error: "Schedule not found",
        };
      }

      const workshop = mockWorkshops.find(
        (w) => w._id === schedule.workshop_id,
      );
      if (!workshop) {
        return {
          success: false,
          error: "Workshop not found",
        };
      }

      // Check availability
      if (schedule.current_reservations >= schedule.max_participants) {
        return {
          success: false,
          error: "Workshop is fully booked",
        };
      }

      // Calculate final price
      let finalPrice = schedule.discounted_price || schedule.price;
      let discountApplied = 0;

      if (request.coupon_code) {
        // Mock coupon validation
        if (request.coupon_code === "FIRST20") {
          discountApplied = finalPrice * 0.2;
          finalPrice -= discountApplied;
        }
      }

      // Create reservation
      const reservationId = `reservation_${Date.now()}`;
      const reservationNumber = generateReservationNumber();
      const now = new Date().toISOString();

      const newReservation: WorkshopReservation = {
        _id: reservationId,
        reservation_number: reservationNumber,
        user_id: "user_1", // In real app, get from auth
        workshop_id: schedule.workshop_id,
        schedule_id: schedule._id,
        workshop,
        schedule,
        status:
          request.payment_method === "wallet_balance" ? "confirmed" : "pending",
        participant_info: request.participant_info,
        payment_info: {
          amount_paid:
            request.payment_method === "wallet_balance" ? finalPrice : 0,
          payment_method: request.payment_method || "zarinpal",
          payment_status:
            request.payment_method === "wallet_balance" ? "paid" : "pending",
          discount_applied: discountApplied,
          coupon_code: request.coupon_code,
        },
        booking_notes: request.booking_notes,
        reserved_at: now,
        confirmed_at:
          request.payment_method === "wallet_balance" ? now : undefined,
        created_at: now,
        updated_at: now,
      };

      // Add to mock data
      mockReservations.push(newReservation);

      // Update schedule
      if (newReservation.status === "confirmed") {
        schedule.current_reservations += 1;
      }

      return {
        success: true,
        data: { reservation_id: reservationId },
        message: "Reservation created successfully",
      };
    } catch (error) {
      console.error("Error creating reservation:", error);
      return {
        success: false,
        error: "Failed to create reservation",
      };
    }
  },

  // Update reservation
  async updateReservation(
    reservationId: string,
    request: UpdateReservationRequest,
  ): Promise<WorkshopApiResponse<{ success: boolean }>> {
    await delay(800);

    try {
      const reservation = mockReservations.find((r) => r._id === reservationId);
      if (!reservation) {
        return {
          success: false,
          error: "Reservation not found",
        };
      }

      // Update participant info
      if (request.participant_info) {
        Object.assign(reservation.participant_info, request.participant_info);
      }

      // Update booking notes
      if (request.booking_notes !== undefined) {
        reservation.booking_notes = request.booking_notes;
      }

      reservation.updated_at = new Date().toISOString();

      return {
        success: true,
        data: { success: true },
        message: "Reservation updated successfully",
      };
    } catch (error) {
      console.error("Error updating reservation:", error);
      return {
        success: false,
        error: "Failed to update reservation",
      };
    }
  },

  // Cancel reservation
  async cancelReservation(
    reservationId: string,
    request?: CancelReservationRequest,
  ): Promise<WorkshopApiResponse<{ refund_amount?: number }>> {
    await delay(1000);

    try {
      const reservation = mockReservations.find((r) => r._id === reservationId);
      if (!reservation) {
        return {
          success: false,
          error: "Reservation not found",
        };
      }

      if (reservation.status === "cancelled") {
        return {
          success: false,
          error: "Reservation is already cancelled",
        };
      }

      const now = new Date().toISOString();
      const originalStatus = reservation.status;
      let refundAmount = 0;

      // Calculate refund based on cancellation policy
      if (
        request?.request_refund &&
        reservation.payment_info.payment_status === "paid"
      ) {
        const reservationDate = new Date(reservation.schedule.start_date);
        const cancelDate = new Date();
        const daysDiff = Math.ceil(
          (reservationDate.getTime() - cancelDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Mock refund policy
        if (daysDiff >= 7) {
          refundAmount = reservation.payment_info.amount_paid; // Full refund
        } else if (daysDiff >= 3) {
          refundAmount = reservation.payment_info.amount_paid * 0.5; // 50% refund
        } else {
          refundAmount = 0; // No refund
        }
      }

      // Update reservation
      reservation.status = "cancelled";
      reservation.cancelled_at = now;
      reservation.cancellation_reason = request?.reason;
      reservation.refund_amount = refundAmount;
      reservation.updated_at = now;

      // Update payment status if refund
      if (refundAmount > 0) {
        reservation.payment_info.payment_status =
          refundAmount === reservation.payment_info.amount_paid
            ? "refunded"
            : "partial_refund";
      }

      // Update schedule availability
      const schedule = mockSchedules.find(
        (s) => s._id === reservation.schedule_id,
      );
      if (schedule && originalStatus !== "waitlisted") {
        schedule.current_reservations = Math.max(
          0,
          schedule.current_reservations - 1,
        );
      }

      return {
        success: true,
        data: { refund_amount: refundAmount },
        message: "Reservation cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return {
        success: false,
        error: "Failed to cancel reservation",
      };
    }
  },

  // Get my reservations
  async getMyReservations(
    userId: string = "user_1",
    query: ReservationQuery = {},
  ): Promise<WorkshopApiResponse<ReservationHistoryResponse>> {
    await delay(900);

    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      let userReservations = mockReservations.filter(
        (r) => r.user_id === userId,
      );

      // Apply filters
      if (query.status) {
        userReservations = userReservations.filter(
          (r) => r.status === query.status,
        );
      }

      if (query.workshop_id) {
        userReservations = userReservations.filter(
          (r) => r.workshop_id === query.workshop_id,
        );
      }

      if (query.date_from) {
        userReservations = userReservations.filter(
          (r) => r.schedule.start_date >= query.date_from!,
        );
      }

      if (query.date_to) {
        userReservations = userReservations.filter(
          (r) => r.schedule.start_date <= query.date_to!,
        );
      }

      // Apply sorting
      userReservations.sort((a, b) => {
        const sortBy = query.sort_by || "reserved_at";
        const order = query.sort_order === "asc" ? 1 : -1;

        switch (sortBy) {
          case "start_date":
            return (
              a.schedule.start_date.localeCompare(b.schedule.start_date) * order
            );
          case "status":
            return a.status.localeCompare(b.status) * order;
          default:
            return a.reserved_at.localeCompare(b.reserved_at) * order;
        }
      });

      const paginatedReservations = userReservations.slice(
        startIndex,
        endIndex,
      );

      // Calculate stats
      const stats = {
        total_reservations: userReservations.length,
        completed: userReservations.filter((r) => r.status === "completed")
          .length,
        cancelled: userReservations.filter((r) => r.status === "cancelled")
          .length,
        total_spent: userReservations
          .filter((r) => r.payment_info.payment_status === "paid")
          .reduce((sum, r) => sum + r.payment_info.amount_paid, 0),
      };

      return {
        success: true,
        data: {
          reservations: paginatedReservations,
          pagination: {
            page,
            limit,
            total: userReservations.length,
            pages: Math.ceil(userReservations.length / limit),
          },
          stats,
        },
      };
    } catch (error) {
      console.error("Error getting reservations:", error);
      return {
        success: false,
        error: "Failed to get reservations",
      };
    }
  },

  // Check in reservation
  async checkInReservation(
    reservationId: string,
  ): Promise<WorkshopApiResponse<{ success: boolean }>> {
    await delay(500);

    try {
      const reservation = mockReservations.find((r) => r._id === reservationId);
      if (!reservation) {
        return {
          success: false,
          error: "Reservation not found",
        };
      }

      if (reservation.status !== "confirmed") {
        return {
          success: false,
          error: "Reservation must be confirmed to check in",
        };
      }

      reservation.check_in_time = new Date().toISOString();
      reservation.updated_at = new Date().toISOString();

      return {
        success: true,
        data: { success: true },
        message: "Checked in successfully",
      };
    } catch (error) {
      console.error("Error checking in:", error);
      return {
        success: false,
        error: "Failed to check in",
      };
    }
  },

  // Submit feedback
  async submitFeedback(
    reservationId: string,
    rating: number,
    comment?: string,
  ): Promise<WorkshopApiResponse<{ success: boolean }>> {
    await delay(600);

    try {
      const reservation = mockReservations.find((r) => r._id === reservationId);
      if (!reservation) {
        return {
          success: false,
          error: "Reservation not found",
        };
      }

      if (reservation.status !== "completed") {
        return {
          success: false,
          error: "Can only provide feedback for completed workshops",
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: "Rating must be between 1 and 5",
        };
      }

      reservation.feedback = {
        rating,
        comment,
        submitted_at: new Date().toISOString(),
      };
      reservation.updated_at = new Date().toISOString();

      // Update workshop rating (simplified calculation)
      const workshop = reservation.workshop;
      const newCount = workshop.rating.count + 1;
      const newAverage =
        (workshop.rating.average * workshop.rating.count + rating) / newCount;
      workshop.rating.average = Math.round(newAverage * 10) / 10;
      workshop.rating.count = newCount;

      return {
        success: true,
        data: { success: true },
        message: "Feedback submitted successfully",
      };
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return {
        success: false,
        error: "Failed to submit feedback",
      };
    }
  },

  // Get calendar slots
  async getCalendarSlots(
    query: AvailabilityQuery,
  ): Promise<WorkshopApiResponse<WorkshopCalendarSlot[]>> {
    await delay(700);

    try {
      let schedules = [...mockSchedules];

      // Apply filters same as availability
      if (query.workshop_id) {
        schedules = schedules.filter(
          (s) => s.workshop_id === query.workshop_id,
        );
      }

      if (query.instructor_id) {
        schedules = schedules.filter(
          (s) => s.instructor_id === query.instructor_id,
        );
      }

      if (query.location_type) {
        schedules = schedules.filter(
          (s) => s.location?.type === query.location_type,
        );
      }

      schedules = schedules.filter((s) => {
        const startDate = s.start_date;
        return startDate >= query.date_from && startDate <= query.date_to;
      });

      const calendarSlots: WorkshopCalendarSlot[] = schedules.map(
        (schedule) => {
          const workshop = mockWorkshops.find(
            (w) => w._id === schedule.workshop_id,
          )!;
          const instructor = mockInstructors.find(
            (i) => i._id === schedule.instructor_id,
          )!;
          const availableSpots = Math.max(
            0,
            schedule.max_participants - schedule.current_reservations,
          );

          return {
            date: schedule.start_date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            schedule_id: schedule._id,
            workshop_id: schedule.workshop_id,
            workshop_title: workshop.title,
            instructor_name: instructor.name,
            available_spots: availableSpots,
            total_spots: schedule.max_participants,
            price: schedule.discounted_price || schedule.price,
            discounted_price: schedule.discounted_price,
            is_available: availableSpots > 0,
            is_waitlisted:
              availableSpots === 0 && schedule.max_participants > 0,
          };
        },
      );

      return {
        success: true,
        data: calendarSlots,
      };
    } catch (error) {
      console.error("Error getting calendar slots:", error);
      return {
        success: false,
        error: "Failed to get calendar slots",
      };
    }
  },

  // Get instructors
  async getInstructors(): Promise<WorkshopApiResponse<WorkshopInstructor[]>> {
    await delay(400);

    try {
      return {
        success: true,
        data: mockInstructors.filter((i) => i.is_active),
      };
    } catch (error) {
      console.error("Error getting instructors:", error);
      return {
        success: false,
        error: "Failed to get instructors",
      };
    }
  },
};
