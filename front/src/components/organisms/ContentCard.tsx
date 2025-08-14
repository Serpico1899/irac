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
      className="block group w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-persian-blue focus:ring-offset-2 rounded-2xl"
      aria-label={`Navigate to ${title}`}
    >
      <article className="relative bg-white rounded-2xl shadow-elegant overflow-hidden transition-all duration-700 hover:shadow-elegant-xl hover:shadow-persian-blue/20 hover:-translate-y-3 h-full border border-gray-100/80">
        {/* Persian-Inspired Badge */}
        {badgeText && (
          <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10 bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20">
            {badgeText}
          </div>
        )}

        {/* Image with Persian-inspired overlay */}
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
              loading="lazy"
            />
            {/* Subtle Persian pattern overlay on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23115e99' fill-opacity='0.3'%3E%3Cpath d='M30 30L15 45L0 30L15 15zM45 45L30 60L15 45L30 30zM60 30L45 15L30 30L45 45z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-persian-blue/5 via-gray-50 to-terracotta/5 flex items-center justify-center relative">
            <div className="w-24 h-24 bg-gradient-to-br from-persian-blue/10 to-terracotta/10 rounded-full flex items-center justify-center shadow-inner border border-persian-blue/20">
              <svg
                className="w-12 h-12 text-persian-blue/60"
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
            {/* Persian geometric pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23115e99'%3E%3Cpath d='M20 20L10 30L0 20L10 10zM30 30L20 40L10 30L20 20zM40 20L30 10L20 20L30 30z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        )}

        {/* Content with enhanced Persian typography */}
        <div className="p-7 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-persian-blue transition-colors duration-500 leading-tight tracking-tight">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-base sm:text-lg line-clamp-3 leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Persian-inspired hover indicator */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-persian-blue via-terracotta to-persian-blue transform scale-x-0 group-hover:scale-x-100 transition-all duration-700 origin-left rtl:origin-right shadow-lg"></div>

        {/* Enhanced inner glow with Persian colors */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-persian-blue/5 via-transparent to-transparent rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-terracotta/3 to-transparent rounded-2xl"></div>
        </div>

        {/* Persian geometric corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M32 0L48 16L32 32L16 16zM64 32L48 16L32 32L48 48z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "64px 64px",
              backgroundPosition: "top right",
            }}
          />
        </div>
      </article>
    </Link>
  );
};

export default ContentCard;
