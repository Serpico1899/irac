import Link from "next/link";

interface ContentCardProps {
  href: string;
  title: string;
  imageUrl?: string;
  description?: string;
  badgeText?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  href,
  imageUrl,
  title,
  description,
  badgeText,
}) => {
  return (
    <Link
      href={href}
      className="block group w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      aria-label={`Navigate to ${title}`}
    >
      <article className="relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
        {/* Badge */}
        {badgeText && (
          <div className="absolute top-3 ltr:right-3 rtl:left-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            {badgeText}
          </div>
        )}

        {/* Image */}
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rtl:origin-right"></div>
      </article>
    </Link>
  );
};

export default ContentCard;
