import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface SearchFormProps {
  onSearch: (query: string, options: SearchOptions) => void;
  loading?: boolean;
  initialQuery?: string;
}

interface SearchOptions {
  diet?: string;
  intolerances?: string[];
  cuisine?: string;
  type?: string;
}

export function SearchForm({
  onSearch,
  loading = false,
  initialQuery = "",
}: SearchFormProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [options, setOptions] = useState<SearchOptions>({});

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), options);
    }
  };

  const dietOptions = [
    { value: "", label: t("search.searchForm.noRestrictions") },
    { value: "vegetarian", label: t("search.searchForm.vegetarian") },
    { value: "vegan", label: t("search.searchForm.vegan") },
    { value: "ketogenic", label: t("search.searchForm.ketogenic") },
    { value: "gluten-free", label: t("search.searchForm.glutenFree") },
  ];

  const cuisineOptions = [
    { value: "", label: t("search.searchForm.allCuisines") },
    { value: "korean", label: t("search.searchForm.korean") },
    { value: "italian", label: t("search.searchForm.italian") },
    { value: "chinese", label: t("search.searchForm.chinese") },
    { value: "japanese", label: t("search.searchForm.japanese") },
    { value: "american", label: t("search.searchForm.american") },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-card rounded-lg border"
    >
      <div className="space-y-2">
        <Label htmlFor="search-query" className="text-base font-medium">
          {t("search.searchForm.title")}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search-query"
            type="text"
            placeholder={t("search.searchForm.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-base"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diet-select">{t("search.searchForm.dietType")}</Label>
          <select
            id="diet-select"
            value={options.diet || ""}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, diet: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          >
            {dietOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine-select">
            {t("search.searchForm.cuisineType")}
          </Label>
          <select
            id="cuisine-select"
            value={options.cuisine || ""}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, cuisine: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          >
            {cuisineOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-medium"
        disabled={loading || !query.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("search.searchForm.searching")}
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            {t("search.searchForm.searchButton")}
          </>
        )}
      </Button>
    </form>
  );
}
