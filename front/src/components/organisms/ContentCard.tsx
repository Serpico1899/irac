import Link from "next/link";

interface ContentCardProps {
  href: string;
  title: string;
  imageUrl?: string;
  description?: string;
  badgeText?: string;
  variant?: "light" | "dark";
}

const ContentCard: React.FC<ContentCardProps> = ({
  href,
  imageUrl,
  title,
  description,
  badgeText,
  variant = "light",
}) => {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className="block group w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 rounded-lg"
      aria-label={`Navigate to ${title}`}
    >
      <article
        className={`relative rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full border ${
          isDark ? "border-gray-600" : "border-gray-100"
        }`}
        style={{
          backgroundColor: isDark ? "#4A4A4A" : "#FFFFFF",
        }}
      >
        {/* Badge */}
        {badgeText && (
          <div
            className="absolute top-4 ltr:right-4 rtl:left-4 z-10 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md"
            style={{
              backgroundColor: "#29A5A1",
              color: "#FFFFFF",
            }}
          >
            {badgeText}
          </div>
        )}

        {/* Image */}
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className="aspect-video w-full flex items-center justify-center"
            style={{ backgroundColor: isDark ? "#3A3A3A" : "#F5F7FA" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDark ? "#5A5A5A" : "#E5E5E5" }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: isDark ? "#FFFFFF" : "#777777" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3
            className="text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 leading-tight"
            style={{
              color: isDark ? "#FFFFFF" : "#4A4A4A",
            }}
          >
            {title}
          </h3>

          {description && (
            <p
              className="text-base line-clamp-3 leading-relaxed"
              style={{ color: isDark ? "#E5E5E5" : "#777777" }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Hover indicator */}
        <div
          className="absolute inset-x-0 bottom-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300 origin-left rtl:origin-right"
          style={{ backgroundColor: "#29A5A1" }}
        />

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: "rgba(41, 165, 161, 0.05)" }}
          />
        </div>
      </article>
    </Link>
  );
};

export default ContentCard;
