import { useSettingsStore } from "@/stores";
import {
  translations,
  type Language,
  type TranslationKey,
} from "@/constants/translations";

export function useTranslation() {
  const { language } = useSettingsStore();

  const t = (key: TranslationKey): string => {
    return translations[language as Language]?.[key] || translations.ko[key];
  };

  return { t, language };
}

