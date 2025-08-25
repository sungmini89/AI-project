import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  Search,
  Filter,
  Code,
  Server,
  Cloud,
  Database,
  Shield,
  Smartphone,
  BarChart3,
  Lightbulb,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
} from "lucide-react";
import { Navigation } from "@/components/navigation/Navigation";

export default function KeywordDictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // 키워드 데이터베이스
  const keywordDatabase = [
    // Frontend 기술
    {
      keyword: "React",
      category: "frontend",
      level: "high",
      weight: 9.5,
      description: "사용자 인터페이스 구축을 위한 JavaScript 라이브러리",
      synonyms: ["ReactJS", "React.js", "React 16+", "React 18"],
      relatedSkills: [
        "JSX",
        "Virtual DOM",
        "Component",
        "Hooks",
        "State Management",
      ],
      industryDemand: 95,
      salaryImpact: "high",
    },
    {
      keyword: "Vue.js",
      category: "frontend",
      level: "high",
      weight: 8.7,
      description: "프로그레시브 JavaScript 프레임워크",
      synonyms: ["Vue", "VueJS", "Vue 3", "Nuxt.js"],
      relatedSkills: [
        "Template Syntax",
        "Composition API",
        "Options API",
        "Vuex",
      ],
      industryDemand: 82,
      salaryImpact: "high",
    },
    {
      keyword: "TypeScript",
      category: "frontend",
      level: "high",
      weight: 9.2,
      description: "JavaScript의 정적 타입 확장",
      synonyms: ["TS", "TypeScript 4+", "TypeScript 5"],
      relatedSkills: ["Type System", "Interface", "Generic", "Decorator"],
      industryDemand: 88,
      salaryImpact: "high",
    },
    {
      keyword: "JavaScript",
      category: "frontend",
      level: "high",
      weight: 9.8,
      description: "웹 개발의 핵심 프로그래밍 언어",
      synonyms: ["JS", "ES6", "ECMAScript", "Modern JavaScript"],
      relatedSkills: [
        "DOM",
        "Event Handling",
        "Async/Await",
        "Promise",
        "Closure",
      ],
      industryDemand: 98,
      salaryImpact: "high",
    },
    {
      keyword: "CSS",
      category: "frontend",
      level: "medium",
      weight: 7.5,
      description: "웹 페이지 스타일링을 위한 스타일 시트 언어",
      synonyms: ["CSS3", "Stylesheets", "Cascading Style Sheets"],
      relatedSkills: [
        "Flexbox",
        "Grid",
        "Responsive Design",
        "Animation",
        "SASS",
      ],
      industryDemand: 92,
      salaryImpact: "medium",
    },
    {
      keyword: "HTML",
      category: "frontend",
      level: "medium",
      weight: 7.2,
      description: "웹 페이지의 구조를 정의하는 마크업 언어",
      synonyms: ["HTML5", "Markup", "HyperText Markup Language"],
      relatedSkills: [
        "Semantic HTML",
        "Web Accessibility",
        "SEO",
        "Web Standards",
      ],
      industryDemand: 94,
      salaryImpact: "medium",
    },

    // Backend 기술
    {
      keyword: "Node.js",
      category: "backend",
      level: "high",
      weight: 9.0,
      description: "JavaScript 런타임 환경",
      synonyms: ["NodeJS", "Node", "Express.js"],
      relatedSkills: [
        "npm",
        "Express",
        "REST API",
        "WebSocket",
        "Microservices",
      ],
      industryDemand: 87,
      salaryImpact: "high",
    },
    {
      keyword: "Python",
      category: "backend",
      level: "high",
      weight: 9.3,
      description: "범용 프로그래밍 언어",
      synonyms: ["Python 3", "Django", "Flask", "FastAPI"],
      relatedSkills: [
        "Django",
        "Flask",
        "Data Science",
        "Machine Learning",
        "API",
      ],
      industryDemand: 91,
      salaryImpact: "high",
    },
    {
      keyword: "Java",
      category: "backend",
      level: "high",
      weight: 8.9,
      description: "객체 지향 프로그래밍 언어",
      synonyms: ["Java 8+", "Spring", "Spring Boot", "JVM"],
      relatedSkills: [
        "Spring Framework",
        "Hibernate",
        "Maven",
        "Gradle",
        "JUnit",
      ],
      industryDemand: 89,
      salaryImpact: "high",
    },
    {
      keyword: "PHP",
      category: "backend",
      level: "medium",
      weight: 7.8,
      description: "서버 사이드 스크립팅 언어",
      synonyms: ["PHP 8", "Laravel", "Symfony", "CodeIgniter"],
      relatedSkills: ["Laravel", "MySQL", "Apache", "Composer", "MVC"],
      industryDemand: 76,
      salaryImpact: "medium",
    },

    // 데이터베이스
    {
      keyword: "MySQL",
      category: "database",
      level: "high",
      weight: 8.5,
      description: "관계형 데이터베이스 관리 시스템",
      synonyms: ["MySQL 8", "MariaDB", "SQL"],
      relatedSkills: [
        "SQL",
        "Database Design",
        "Query Optimization",
        "Indexing",
      ],
      industryDemand: 85,
      salaryImpact: "medium",
    },
    {
      keyword: "PostgreSQL",
      category: "database",
      level: "high",
      weight: 8.7,
      description: "오픈 소스 객체 관계형 데이터베이스",
      synonyms: ["Postgres", "PSQL", "PostGIS"],
      relatedSkills: [
        "Advanced SQL",
        "JSONB",
        "Full-text Search",
        "Extensions",
      ],
      industryDemand: 82,
      salaryImpact: "high",
    },
    {
      keyword: "MongoDB",
      category: "database",
      level: "medium",
      weight: 8.2,
      description: "NoSQL 문서 지향 데이터베이스",
      synonyms: ["Mongo", "Document DB", "BSON"],
      relatedSkills: ["Mongoose", "Aggregation", "Sharding", "Replica Sets"],
      industryDemand: 78,
      salaryImpact: "medium",
    },

    // 클라우드 & DevOps
    {
      keyword: "AWS",
      category: "cloud",
      level: "high",
      weight: 9.1,
      description: "Amazon 웹 서비스 클라우드 플랫폼",
      synonyms: ["Amazon Web Services", "EC2", "S3", "Lambda"],
      relatedSkills: ["EC2", "S3", "RDS", "Lambda", "CloudFormation"],
      industryDemand: 93,
      salaryImpact: "high",
    },
    {
      keyword: "Docker",
      category: "devops",
      level: "high",
      weight: 8.8,
      description: "컨테이너화 플랫폼",
      synonyms: ["Container", "Dockerfile", "Docker Compose"],
      relatedSkills: [
        "Containerization",
        "Kubernetes",
        "Docker Compose",
        "Microservices",
      ],
      industryDemand: 86,
      salaryImpact: "high",
    },
    {
      keyword: "Kubernetes",
      category: "devops",
      level: "high",
      weight: 8.6,
      description: "컨테이너 오케스트레이션 플랫폼",
      synonyms: ["K8s", "Container Orchestration", "Helm"],
      relatedSkills: [
        "Container Orchestration",
        "Helm",
        "Service Mesh",
        "CI/CD",
      ],
      industryDemand: 81,
      salaryImpact: "high",
    },
    {
      keyword: "Git",
      category: "devops",
      level: "high",
      weight: 9.4,
      description: "분산 버전 관리 시스템",
      synonyms: ["Version Control", "GitHub", "GitLab", "Bitbucket"],
      relatedSkills: [
        "Branch Management",
        "Merge Conflicts",
        "Pull Request",
        "CI/CD",
      ],
      industryDemand: 97,
      salaryImpact: "medium",
    },

    // 모바일
    {
      keyword: "React Native",
      category: "mobile",
      level: "high",
      weight: 8.4,
      description: "크로스 플랫폼 모바일 앱 개발 프레임워크",
      synonyms: ["RN", "Cross-platform", "Mobile React"],
      relatedSkills: ["Mobile Development", "iOS", "Android", "Native Modules"],
      industryDemand: 79,
      salaryImpact: "high",
    },
    {
      keyword: "Flutter",
      category: "mobile",
      level: "high",
      weight: 8.1,
      description: "Google의 크로스 플랫폼 UI 툴킷",
      synonyms: ["Dart", "Cross-platform", "Mobile Flutter"],
      relatedSkills: [
        "Dart",
        "Widget",
        "State Management",
        "Platform Channels",
      ],
      industryDemand: 74,
      salaryImpact: "high",
    },

    // 데이터 & AI
    {
      keyword: "Machine Learning",
      category: "data",
      level: "high",
      weight: 9.0,
      description: "기계 학습 및 AI 기술",
      synonyms: ["ML", "AI", "Deep Learning", "Neural Networks"],
      relatedSkills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Data Analysis",
      ],
      industryDemand: 88,
      salaryImpact: "high",
    },
    {
      keyword: "Data Analysis",
      category: "data",
      level: "medium",
      weight: 8.3,
      description: "데이터 분석 및 인사이트 도출",
      synonyms: ["Data Science", "Analytics", "Big Data", "Statistics"],
      relatedSkills: ["Python", "R", "SQL", "Pandas", "Visualization"],
      industryDemand: 84,
      salaryImpact: "high",
    },
  ];

  // 카테고리 정의
  const categories = [
    { id: "all", name: "전체", icon: Filter, count: keywordDatabase.length },
    {
      id: "frontend",
      name: "프론트엔드",
      icon: Code,
      count: keywordDatabase.filter((k) => k.category === "frontend").length,
    },
    {
      id: "backend",
      name: "백엔드",
      icon: Server,
      count: keywordDatabase.filter((k) => k.category === "backend").length,
    },
    {
      id: "database",
      name: "데이터베이스",
      icon: Database,
      count: keywordDatabase.filter((k) => k.category === "database").length,
    },
    {
      id: "cloud",
      name: "클라우드",
      icon: Cloud,
      count: keywordDatabase.filter((k) => k.category === "cloud").length,
    },
    {
      id: "devops",
      name: "DevOps",
      icon: Shield,
      count: keywordDatabase.filter((k) => k.category === "devops").length,
    },
    {
      id: "mobile",
      name: "모바일",
      icon: Smartphone,
      count: keywordDatabase.filter((k) => k.category === "mobile").length,
    },
    {
      id: "data",
      name: "데이터/AI",
      icon: BarChart3,
      count: keywordDatabase.filter((k) => k.category === "data").length,
    },
  ];

  // 필터링된 키워드
  const filteredKeywords = useMemo(() => {
    return keywordDatabase.filter((keyword) => {
      const matchesSearch =
        keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        keyword.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        keyword.synonyms.some((syn) =>
          syn.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        keyword.relatedSkills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || keyword.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || keyword.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchTerm, selectedCategory, selectedLevel]);

  // 인기 키워드 (가중치 순)
  const popularKeywords = keywordDatabase
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);

  // 급상승 키워드 (수요 기반)
  const trendingKeywords = keywordDatabase
    .sort((a, b) => b.industryDemand - a.industryDemand)
    .slice(0, 8);

  const getWeightColor = (weight: number) => {
    if (weight >= 9) return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (weight >= 8)
      return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    if (weight >= 7)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-green-600 bg-green-100 dark:bg-green-900/20";
  };

  const getSalaryImpactColor = (impact: string) => {
    if (impact === "high")
      return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (impact === "medium")
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

  const getSalaryImpactText = (impact: string) => {
    if (impact === "high") return "높음";
    if (impact === "medium") return "보통";
    return "낮음";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <section className="relative px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Navigation showAPIStatus={false} />

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                IT 키워드 사전
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              현재 IT 업계에서 가장 중요한 키워드들과 그 가중치를 확인하고,
              이력서 최적화에 활용하세요.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="키워드 검색... (예: React, Python, AWS)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-2 focus:border-primary"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <div className="text-2xl font-bold text-primary">
                {keywordDatabase.length}
              </div>
              <div className="text-sm text-muted-foreground">총 키워드</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <div className="text-2xl font-bold text-green-600">
                {keywordDatabase.filter((k) => k.level === "high").length}
              </div>
              <div className="text-sm text-muted-foreground">고수요 키워드</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <div className="text-2xl font-bold text-orange-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-muted-foreground">기술 카테고리</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <div className="text-2xl font-bold text-purple-600">
                {filteredKeywords.length}
              </div>
              <div className="text-sm text-muted-foreground">검색 결과</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            {/* Category Tabs */}
            <div className="mb-8 overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-2 h-auto p-2">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <category.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 mb-8">
              <Button
                variant={selectedLevel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel("all")}
              >
                전체 수준
              </Button>
              <Button
                variant={selectedLevel === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel("high")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                고수요
              </Button>
              <Button
                variant={selectedLevel === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel("medium")}
              >
                보통
              </Button>
            </div>

            {/* Popular Keywords Section */}
            {selectedCategory === "all" && !searchTerm && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  인기 키워드 TOP 12
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {popularKeywords.map((keyword, index) => (
                    <MagicCard
                      key={keyword.keyword}
                      className="magic-card relative rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <BorderBeam delay={index * 0.1} />

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-primary">
                            #{index + 1}
                          </div>
                          <h3 className="font-semibold text-lg">
                            {keyword.keyword}
                          </h3>
                        </div>
                        <Badge className={getWeightColor(keyword.weight)}>
                          {keyword.weight}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {keyword.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {
                            categories.find((c) => c.id === keyword.category)
                              ?.name
                          }
                        </Badge>
                        <Badge
                          className={getSalaryImpactColor(keyword.salaryImpact)}
                        >
                          연봉영향: {getSalaryImpactText(keyword.salaryImpact)}
                        </Badge>
                      </div>
                    </MagicCard>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Keywords */}
            {selectedCategory === "all" && !searchTerm && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  급상승 키워드
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingKeywords.map((keyword, index) => (
                    <div
                      key={keyword.keyword}
                      className="p-4 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{keyword.keyword}</span>
                        <Badge variant="secondary" className="text-xs">
                          {keyword.industryDemand}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        업계 수요: {keyword.industryDemand}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Grid */}
            <TabsContent value={selectedCategory} className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {searchTerm
                      ? `"${searchTerm}" 검색 결과`
                      : categories.find((c) => c.id === selectedCategory)
                          ?.name || "전체"}{" "}
                    키워드
                    <span className="text-lg font-normal text-muted-foreground ml-2">
                      ({filteredKeywords.length}개)
                    </span>
                  </h2>

                  {filteredKeywords.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">
                        검색 결과가 없습니다.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        다른 키워드로 검색해보세요.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredKeywords.map((keyword, index) => (
                    <MagicCard
                      key={keyword.keyword}
                      className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <BorderBeam delay={index * 0.1} />

                      <Card className="border-0 bg-transparent shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                                {keyword.keyword}
                                {keyword.level === "high" && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    HIGH
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge
                                  className={getWeightColor(keyword.weight)}
                                >
                                  가중치: {keyword.weight}
                                </Badge>
                                <Badge
                                  className={getSalaryImpactColor(
                                    keyword.salaryImpact
                                  )}
                                >
                                  연봉영향:{" "}
                                  {getSalaryImpactText(keyword.salaryImpact)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                업계 수요
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                {keyword.industryDemand}%
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <CardDescription className="text-base leading-relaxed">
                            {keyword.description}
                          </CardDescription>

                          {keyword.synonyms.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                동의어 및 관련 용어
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {keyword.synonyms.map((synonym, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {synonym}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {keyword.relatedSkills.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                연관 기술
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {keyword.relatedSkills
                                  .slice(0, 5)
                                  .map((skill, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {keyword.relatedSkills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{keyword.relatedSkills.length - 5}개 더
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </MagicCard>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                키워드 활용 팁
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: "가중치 9.0+ 키워드 우선",
                description:
                  "높은 가중치를 가진 키워드를 이력서에 포함시켜 ATS 통과율을 높이세요.",
                color: "from-yellow-500 to-orange-600",
              },
              {
                icon: Target,
                title: "동의어 활용하기",
                description:
                  "같은 기술을 다양한 표현으로 기술하여 키워드 매칭률을 향상시키세요.",
                color: "from-green-500 to-teal-600",
              },
              {
                icon: TrendingUp,
                title: "연관 기술 함께 언급",
                description:
                  "메인 키워드와 함께 연관 기술들을 언급하여 전문성을 어필하세요.",
                color: "from-blue-500 to-purple-600",
              },
            ].map((tip, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/80 dark:bg-slate-800/80 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tip.color} flex items-center justify-center mb-4`}
                >
                  <tip.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{tip.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            이제 이력서를 분석해보세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            키워드 사전을 참고하여 이력서를 최적화하고 매칭률을 확인해보세요
          </p>

          <Link to="/analyzer">
            <ShimmerButton
              className="px-8 py-4 text-lg font-medium"
              shimmerColor="#ffffff40"
              background="rgba(255, 255, 255, 0.2)"
            >
              <Zap className="mr-2 h-5 w-5" />
              분석 시작하기
            </ShimmerButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
