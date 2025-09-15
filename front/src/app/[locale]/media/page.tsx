"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { AppApi } from "@/services/api";
import { env } from "@/config/env.config";
import { toast } from "react-hot-toast";

interface MediaItem {
  _id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaCategory {
  key: string;
  label: string;
  label_en: string;
}

export default function MediaPage() {
  const t = useTranslations("media");
  const locale = useLocale();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories: MediaCategory[] = [
    { key: "all", label: t("categories.all"), label_en: t("categories.all") },
    {
      key: "image",
      label: t("categories.images"),
      label_en: t("categories.images"),
    },
    {
      key: "video",
      label: t("categories.videos"),
      label_en: t("categories.videos"),
    },
    {
      key: "document",
      label: t("categories.documents"),
      label_en: t("categories.documents"),
    },
  ];

  // Sample data for demonstration - will be replaced with API call
  const sampleMediaItems: MediaItem[] = [
    {
      _id: "1",
      name: "islamic-architecture-sample.jpg",
      type: "image/jpeg",
      size: 1024000,
      path: "/uploads/images/islamic-architecture-sample.jpg",
      url: "/uploads/images/islamic-architecture-sample.jpg",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "2",
      name: "geometric-patterns.jpg",
      type: "image/jpeg",
      size: 856000,
      path: "/uploads/images/geometric-patterns.jpg",
      url: "/uploads/images/geometric-patterns.jpg",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-14T14:20:00Z",
    },
    {
      _id: "3",
      name: "calligraphy-workshop.mp4",
      type: "video/mp4",
      size: 15728640,
      path: "/uploads/videos/calligraphy-workshop.mp4",
      url: "/uploads/videos/calligraphy-workshop.mp4",
      createdAt: "2024-01-13T09:45:00Z",
      updatedAt: "2024-01-13T09:45:00Z",
    },
  ];

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is stable
      // const api = AppApi();
      // const response = await api.file.get({
      //   set: {},
      //   get: {
      //     name: 1,
      //     type: 1,
      //     size: 1,
      //     path: 1,
      //     url: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //   },
      // });
      // setMediaItems(response.data || []);

      // For now, use sample data
      setTimeout(() => {
        setMediaItems(sampleMediaItems);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching media items:", error);
      toast.error(t("error"));
      setLoading(false);
    }
  };

  const filteredItems = mediaItems.filter((item) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "image") return item.type.startsWith("image/");
    if (selectedCategory === "video") return item.type.startsWith("video/");
    if (selectedCategory === "document")
      return !item.type.startsWith("image/") && !item.type.startsWith("video/");
    return true;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMediaUrl = (item: MediaItem): string => {
    const baseUrl = env.MEDIA.URL;
    return `${baseUrl}${item.url}`;
  };

  const renderMediaItem = (item: MediaItem) => {
    const isImage = item.type.startsWith("image/");
    const isVideo = item.type.startsWith("video/");

    if (viewMode === "list") {
      return (
        <div
          key={item._id}
          className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 rtl:space-x-reverse"
        >
          <div className="flex-shrink-0 w-16 h-16">
            {isImage ? (
              <Image
                src={getMediaUrl(item)}
                alt={item.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                loading="lazy"
              />
            ) : isVideo ? (
              <div className="w-full h-full bg-blue-100 rounded flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 6l-4.5 2.6V8.4L13.5 11z" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500">{formatFileSize(item.size)}</p>
            <p className="text-xs text-gray-400">
              {new Date(item.createdAt).toLocaleDateString(
                locale === "fa" ? "fa-IR" : "en-US",
              )}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item._id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div className="aspect-square relative">
          {isImage ? (
            <Image
              src={getMediaUrl(item)}
              alt={item.name}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : isVideo ? (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 6l-4.5 2.6V8.4L13.5 11z" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            {formatFileSize(item.size)}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(item.createdAt).toLocaleDateString(
              locale === "fa" ? "fa-IR" : "en-US",
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t("itemsFound", { count: filteredItems.length })}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t("loading")}</p>
          </div>
        ) : (
          <>
            {/* Media Grid/List */}
            {filteredItems.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredItems.map(renderMediaItem)}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {t("noMedia.title")}
                </h3>
                <p className="mt-1 text-gray-500">{t("noMedia.description")}</p>
              </div>
            )}
          </>
        )}

        {/* Upload Info (for admin users) */}
        <div className="mt-16 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <svg
              className="w-6 h-6 text-blue-600 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-900">
                {t("adminInfo.title")}
              </h3>
              <p className="mt-1 text-blue-700">{t("adminInfo.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
