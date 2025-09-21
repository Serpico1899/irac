import { type ActFn } from "@deps";
import { CertificatePDFGenerator, PDFUtils } from "../utils/pdfGenerator.ts";

export const getCertificateTemplatesFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const { template_type, active_only = true } = set;

  try {
    // Get available templates from PDF generator
    const availableTemplates = CertificatePDFGenerator.getAvailableTemplates();

    // Transform templates to include additional metadata for API response
    const allTemplates = availableTemplates.map(template => ({
      id: template.id,
      name: template.name_en,
      name_fa: template.name,
      description: getTemplateDescription(template.id, 'en'),
      description_fa: getTemplateDescription(template.id, 'fa'),
      type: template.id,
      active: true,
      preview_url: `/templates/previews/${template.id}.png`,
      layout: template.layout,
      colors: template.colors,
      fonts: template.fonts,
      elements: template.elements,
      supported_languages: ["fa", "en"],
      course_types: getTemplateCourseTypes(template.id),
      estimated_size: PDFUtils.estimateFileSize(template.id, false),
      design_config: {
        layout: template.layout,
        size: "A4",
        margins: getTemplateMargins(template.id),
        colors: template.colors,
        fonts: template.fonts,
        elements: template.elements,
      }
    }));

    // Filter templates based on criteria
    let filteredTemplates = allTemplates;

    if (active_only) {
      filteredTemplates = filteredTemplates.filter(template => template.active);
    }

    if (template_type) {
      filteredTemplates = filteredTemplates.filter(template => template.type === template_type);
    }

    // Add usage statistics (in real implementation, this would come from database)
    const templatesWithStats = await Promise.all(
      filteredTemplates.map(async template => ({
        ...template,
        stats: await getTemplateUsageStats(template.id),
      }))
    );

    return {
      success: true,
      data: {
        templates: templatesWithStats,
        total_count: templatesWithStats.length,
        available_types: ["standard", "premium", "workshop", "multilingual"],
        default_template: "standard",
        template_features: {
          pdf_generation: true,
          png_generation: true,
          persian_support: true,
          qr_code_support: true,
          watermark_support: true,
          custom_colors: true,
        }
      },
      message: "Certificate templates retrieved successfully",
    };

  } catch (error: any) {
    console.error("Get certificate templates error:", error);
    return {
      success: false,
      error: error.message || "Failed to retrieve certificate templates",
    };
  }
}

// Helper function to get template description
function getTemplateDescription(templateId: string, language: 'fa' | 'en'): string {
  const descriptions = {
    standard: {
      fa: "طراحی پایه گواهینامه برای دوره‌های عادی با قابلیت‌های استاندارد",
      en: "Basic certificate design for regular courses with standard features"
    },
    premium: {
      fa: "طراحی ارتقا یافته برای دوره‌های پیشرفته و حرفه‌ای با عناصر تزیینی",
      en: "Enhanced design for advanced and professional courses with decorative elements"
    },
    workshop: {
      fa: "طراحی ویژه برای کارگاه‌ها و برنامه‌های کوتاه مدت",
      en: "Special design for workshops and short-term programs"
    },
    multilingual: {
      fa: "طراحی گواهینامه دوزبانه فارسی-انگلیسی برای استفاده بین‌المللی",
      en: "Persian-English bilingual certificate design for international use"
    }
  };

  return descriptions[templateId as keyof typeof descriptions]?.[language] || "";
}

// Helper function to get supported course types for each template
function getTemplateCourseTypes(templateId: string): string[] {
  const courseTypes = {
    standard: ["Course", "Seminar"],
    premium: ["Course", "Bootcamp", "Advanced", "Professional"],
    workshop: ["Workshop", "Short Course"],
    multilingual: ["Course", "Workshop", "Bootcamp", "Seminar", "International"]
  };

  return courseTypes[templateId as keyof typeof courseTypes] || ["Course"];
}

// Helper function to get template margins
function getTemplateMargins(templateId: string): { top: number; right: number; bottom: number; left: number; } {
  const margins = {
    standard: { top: 60, right: 60, bottom: 60, left: 60 },
    premium: { top: 40, right: 40, bottom: 40, left: 40 },
    workshop: { top: 50, right: 50, bottom: 50, left: 50 },
    multilingual: { top: 45, right: 45, bottom: 45, left: 45 }
  };

  return margins[templateId as keyof typeof margins] || margins.standard;
}

// Helper function to get template usage statistics
async function getTemplateUsageStats(templateId: string) {
  // In a real implementation, this would query the database for actual usage statistics
  // For now, we'll return mock data that could be replaced with real queries

  const mockStats = {
    standard: { usage: 450, rank: 1 },
    premium: { usage: 280, rank: 2 },
    workshop: { usage: 180, rank: 3 },
    multilingual: { usage: 95, rank: 4 }
  };

  const stats = mockStats[templateId as keyof typeof mockStats] || { usage: 50, rank: 4 };

  return {
    total_usage: stats.usage,
    last_used: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    popularity_rank: stats.rank,
    certificates_generated_this_month: Math.floor(stats.usage * 0.15),
    average_rating: 4.2 + (Math.random() * 0.8), // Mock rating between 4.2-5.0
  };
}
