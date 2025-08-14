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
      className="block group w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
      aria-label={`Navigate to ${title}`}
    >
      <article className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 h-full border border-gray-100/50">
        {/* Badge */}
        {badgeText && (
          <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
            {badgeText}
          </div>
        )}

        {/* Image */}
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-150 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
              <svg
                className="w-10 h-10 text-gray-400"
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
        <div className="p-6 sm:p-7">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300 leading-tight tracking-tight">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-left rtl:origin-right shadow-lg"></div>

        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 via-transparent to-transparent rounded-xl"></div>
        </div>
      </article>
    </Link>
  );
};

export default ContentCard;
