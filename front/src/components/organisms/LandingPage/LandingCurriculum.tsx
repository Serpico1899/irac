"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  duration?: string;
  lessons?: {
    id: string;
    title: string;
    duration?: string;
    type?: "video" | "text" | "quiz" | "assignment" | "live";
    free_preview?: boolean;
  }[];
  learning_objectives?: string[];
  resources?: {
    name: string;
    type: "pdf" | "video" | "audio" | "link";
    size?: string;
  }[];
}

interface LandingCurriculumProps {
  modules: CurriculumModule[];
  title?: string;
  subtitle?: string;
  totalDuration?: string;
  totalLessons?: number;
  locale: string;
  variant?: "accordion" | "tabs" | "timeline";
  showProgress?: boolean;
  showPreview?: boolean;
  backgroundColor?: "white" | "gray" | "blue" | "transparent";
}

export default function LandingCurriculum({
  modules,
  title,
  subtitle,
  totalDuration,
  totalLessons,
  locale,
  variant = "accordion",
  showProgress = false,
  showPreview = true,
  backgroundColor = "white",
}: LandingCurriculumProps) {
  const t = useTranslations("curriculum");
  const [activeModule, setActiveModule] = useState<string | null>(
    modules.length > 0 ? modules[0].id : null
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const isRtl = locale === "fa";

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    blue: "bg-blue-50",
    transparent: "bg-transparent"
  };

  const toggleModule = (moduleId: string) => {
    if (variant === "accordion") {
      const newExpanded = new Set(expandedModules);
      if (newExpanded.has(moduleId)) {
        newExpanded.delete(moduleId);
      } else {
        newExpanded.add(moduleId);
      }
      setExpandedModules(newExpanded);
    } else if (variant === "tabs") {
      setActiveModule(moduleId);
    }
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "video":
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case "text":
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case "quiz":
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      case "assignment":
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case "live":
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.895-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.828 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 12a3.983 3.983 0 00-.172-1.414 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const renderModuleContent = (module: CurriculumModule) => (
    <div className="space-y-6">
      {/* Module Description */}
      <p className="text-gray-700 leading-relaxed">{module.description}</p>

      {/* Learning Objectives */}
      {module.learning_objectives && module.learning_objectives.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            {t("learningObjectives")}
          </h4>
          <ul className="space-y-2">
            {module.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className={`w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 ${isRtl ? "ml-2" : "mr-2"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-sm">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lessons */}
      {module.lessons && module.lessons.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            {t("lessons")} ({module.lessons.length})
          </h4>
          <ul className="space-y-3">
            {module.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getLessonIcon(lesson.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {lesson.title}
                      </span>
                      {lesson.free_preview && showPreview && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {t("freePreview")}
                        </span>
                      )}
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-gray-500">{lesson.duration}</span>
                    )}
                  </div>
                </div>

                {lesson.free_preview && showPreview && (
                  <button className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 touch-manipulation">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {module.resources && module.resources.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            {t("resources")}
          </h4>
          <ul className="space-y-2">
            {module.resources.map((resource, index) => (
              <li key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-md">
                <div className="flex-shrink-0">
                  {resource.type === "pdf" && (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {resource.type === "video" && (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  )}
                  {resource.type === "link" && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-900 truncate block">{resource.name}</span>
                  {resource.size && (
                    <span className="text-xs text-gray-500">{resource.size}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (!modules.length) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 lg:py-20 ${backgroundClasses[backgroundColor]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-8 sm:mb-12 lg:mb-16 ${isRtl ? "text-right" : "text-left"} sm:text-center`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title || t("defaultTitle")}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              {subtitle}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {totalLessons && (
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {totalLessons}
                </div>
                <div className="text-sm text-gray-600">{t("totalLessons")}</div>
              </div>
            )}
            {totalDuration && (
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {totalDuration}
                </div>
                <div className="text-sm text-gray-600">{t("totalDuration")}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {modules.length}
              </div>
              <div className="text-sm text-gray-600">{t("totalModules")}</div>
            </div>
          </div>
        </div>

        {/* Curriculum Content */}
        <div className="max-w-5xl mx-auto">
          {variant === "tabs" ? (
            <div>
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                {modules.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 touch-manipulation ${
                      activeModule === module.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block">{t("module")} {index + 1}</span>
                    <span className="block text-xs truncate max-w-32">{module.title}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {modules.map((module) =>
                activeModule === module.id ? (
                  <div key={module.id} className="bg-white rounded-xl shadow-lg border p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          {module.title}
                        </h3>
                        {module.duration && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className={`w-4 h-4 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {module.duration}
                          </div>
                        )}
                      </div>
                    </div>
                    {renderModuleContent(module)}
                  </div>
                ) : null
              )}
            </div>
          ) : (
            /* Accordion */
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-white rounded-xl shadow-lg border overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {module.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 ml-11">
                          {module.duration && (
                            <div className="flex items-center">
                              <svg className={`w-4 h-4 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {module.duration}
                            </div>
                          )}
                          {module.lessons && (
                            <div className="flex items-center">
                              <svg className={`w-4 h-4 ${isRtl ? "ml-1" : "mr-1"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {module.lessons.length} {t("lessons")}
                            </div>
                          )}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                          expandedModules.has(module.id) ? "rotate-180" : ""
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-6">
                        {renderModuleContent(module)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
