import { useTranslations } from "next-intl";

const LoadingSpinner = () => {
  const t = useTranslations("Common");
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
};

export default LoadingSpinner;
