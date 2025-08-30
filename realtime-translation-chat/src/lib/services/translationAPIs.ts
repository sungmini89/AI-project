import type {
  TranslationResult,
  MyMemoryResponse,
  LibreTranslateResponse,
  APIQuota,
} from "@/types";

// Quota management
class QuotaManager {
  private static instance: QuotaManager;
  private quotas: Map<string, APIQuota> = new Map();

  static getInstance() {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  private constructor() {
    this.initializeQuotas();
  }

  private initializeQuotas() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem("translation-quotas");

    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date === today) {
          this.quotas = new Map(data.quotas);
          return;
        }
      } catch (e) {
        console.error("Error loading quotas:", e);
      }
    }

    // Initialize default quotas
    this.quotas.set("mymemory", {
      provider: "mymemory",
      dailyLimit: 1000, // MyMemory free tier
      currentUsage: 0,
      lastReset: Date.now(),
    });

    this.quotas.set("libretranslate", {
      provider: "libretranslate",
      dailyLimit: 100, // Conservative estimate for free instances
      currentUsage: 0,
      lastReset: Date.now(),
    });

    this.saveQuotas();
  }

  private saveQuotas() {
    const data = {
      date: new Date().toDateString(),
      quotas: Array.from(this.quotas.entries()),
    };
    localStorage.setItem("translation-quotas", JSON.stringify(data));
  }

  canUseProvider(provider: string): boolean {
    const quota = this.quotas.get(provider);
    return quota ? quota.currentUsage < quota.dailyLimit : false;
  }

  incrementUsage(provider: string) {
    const quota = this.quotas.get(provider);
    if (quota) {
      quota.currentUsage++;
      this.saveQuotas();
    }
  }

  getQuota(provider: string): APIQuota | undefined {
    return this.quotas.get(provider);
  }
}

/**
 * MyMemory API Translation Service
 */
export async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const quotaManager = QuotaManager.getInstance();

  if (!quotaManager.canUseProvider("mymemory")) {
    throw new Error("MyMemory daily quota exceeded");
  }

  const apiUrl = "https://api.mymemory.translated.net/get";
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
    de: "your-email@domain.com", // Replace with actual email for better quota
  });

  try {
    const response = await fetch(`${apiUrl}?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(`MyMemory translation failed: ${data.responseDetails}`);
    }

    quotaManager.incrementUsage("mymemory");

    const translatedText = data.responseData.translatedText;
    const confidence = data.responseData.match / 100;

    // Simple quality check for obvious wrong translations
    const isLowQuality =
      confidence < 0.3 || // Very low confidence
      translatedText.toLowerCase().includes("my name is") || // Common wrong translation pattern
      translatedText.toLowerCase().includes("제 이름은") || // Korean version of wrong pattern
      translatedText.toLowerCase().includes("i am") ||
      translatedText.toLowerCase().includes("저는") ||
      (text.toLowerCase() === "hello" &&
        !translatedText.toLowerCase().includes("안녕") &&
        targetLang === "ko"); // Specific hello check

    if (isLowQuality) {
      console.warn(
        "⚠️ Low quality translation detected, falling back to LibreTranslate:",
        {
          original: text,
          translation: translatedText,
          confidence,
        }
      );
      throw new Error("Low quality translation, trying fallback");
    }

    return {
      translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      confidence,
      provider: "mymemory",
    };
  } catch (error) {
    console.error("MyMemory translation error:", error);
    throw error;
  }
}

/**
 * LibreTranslate API Translation Service
 */
export async function translateWithLibreTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const quotaManager = QuotaManager.getInstance();

  if (!quotaManager.canUseProvider("libretranslate")) {
    throw new Error("LibreTranslate daily quota exceeded");
  }

  // Try multiple LibreTranslate instances with CORS support
  const fallbackUrls = [
    "https://libretranslate.pussthecat.org/translate",
    "https://translate.argosopentech.com/translate",
    "https://libretranslate.com/translate",
    "https://libretranslate.de/translate",
  ];

  const primaryUrl = import.meta.env.VITE_LIBRETRANSLATE_URL;
  const apiKey = import.meta.env.VITE_LIBRETRANSLATE_KEY;

  // Create list of URLs to try (custom URL first if provided, then fallbacks)
  const urlsToTry = primaryUrl ? [primaryUrl, ...fallbackUrls] : fallbackUrls;

  let lastError: Error = new Error("All LibreTranslate instances failed");

  for (const apiUrl of urlsToTry) {
    try {
      console.log(`🌍 Trying LibreTranslate instance: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        }),
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.status}`);
      }

      const data: LibreTranslateResponse = await response.json();

      quotaManager.incrementUsage("libretranslate");

      console.log(`✅ LibreTranslate translation successful from: ${apiUrl}`);

      return {
        translatedText: data.translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: "libretranslate",
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ LibreTranslate instance failed (${apiUrl}):`, error);
      continue;
    }
  }

  // If all instances failed, throw the last error
  console.error("All LibreTranslate instances failed:", lastError);
  throw lastError;
}

/**
 * Offline Dictionary Fallback
 */
const OFFLINE_DICTIONARY: Record<string, Record<string, string>> = {
  // Korean common phrases
  ko: {
    en: `안녕하세요 - Hello
안녕 - Hi
좋은 아침 - Good morning
좋은 오후 - Good afternoon
좋은 저녁 - Good evening
좋은 밤 - Good night
감사합니다 - Thank you
고마워요 - Thanks
천만에요 - You're welcome
죄송합니다 - Sorry
미안해요 - I'm sorry
실례합니다 - Excuse me
부탁합니다 - Please
네 - Yes
아니요 - No
아마도 - Maybe
물론 - Of course
잘 지내세요 - Take care
안녕히 가세요 - Goodbye
나중에 봐요 - See you later
내일 봐요 - See you tomorrow
좋아요 - Good
나쁘다 - Bad
훌륭해요 - Great
좋네요 - Nice
아름다워요 - Beautiful
맛있어요 - Delicious
어떻게 지내세요 - How are you
괜찮아요 - I'm fine
이름이 뭐예요 - What's your name
만나서 반가워요 - Nice to meet you
사랑해요 - I love you
그리워요 - I miss you
도움 - Help
도움이 필요해요 - I need help
이해 못해요 - I don't understand
영어 할 줄 아세요 - Do you speak English
물 - Water
음식 - Food
커피 - Coffee
차 - Tea
맥주 - Beer
식당 - Restaurant
호텔 - Hotel
공항 - Airport
역 - Station
병원 - Hospital
택시 - Taxi
버스 - Bus
기차 - Train
얼마예요 - How much
비싸요 - Expensive
싸요 - Cheap
오늘 - Today
내일 - Tomorrow
어제 - Yesterday
지금 - Now
나중에 - Later
항상 - Always
절대 - Never
가끔 - Sometimes
행복해요 - Happy
슬퍼요 - Sad
화나요 - Angry
피곤해요 - Tired
배고파요 - Hungry
목말라요 - Thirsty`,
    ja: `안녕하세요 - こんにちは
안녕 - こんにちは
좋은 아침 - おはようございます
좋은 오후 - こんにちは
좋은 저녁 - こんばんは
좋은 밤 - おやすみなさい
감사합니다 - ありがとうございます
고마워요 - ありがとう
천만에요 - どういたしまして
죄송합니다 - すみません
미안해요 - すみません
실례합니다 - すみません
부탁합니다 - お願いします
네 - はい
아니요 - いいえ
아마도 - たぶん
물론 - もちろん
잘 지내세요 - 元気でね
안녕히 가세요 - さようなら
나중에 봐요 - また後で
내일 봐요 - また明日
좋아요 - 良い
나쁘다 - 悪い
훌륭해요 - 素晴らしい
좋네요 - いいね
아름다워요 - 美しい
맛있어요 - おいしい
어떻게 지내세요 - 元気ですか
괜찮아요 - 元気です
이름이 뭐예요 - お名前は何ですか
만나서 반가워요 - はじめまして
사랑해요 - 愛しています
그리워요 - 恋しいです
도움 - 助けて
도움이 필요해요 - 助けてください
이해 못해요 - わかりません
일본어 할 줄 아세요 - 日本語を話せますか
물 - 水
음식 - 食べ物
커피 - コーヒー
차 - お茶
맥주 - ビール
식당 - レストラン
호텔 - ホテル
공항 - 空港
역 - 駅
병원 - 病院
택시 - タクシー
버스 - バス
기차 - 電車
얼마예요 - いくらですか
비싸요 - 高い
싸요 - 安い
오늘 - 今日
내일 - 明日
어제 - 昨日
지금 - 今
나중에 - 後で
항상 - いつも
절대 - 決して
가끔 - 時々
행복해요 - 幸せ
슬퍼요 - 悲しい
화나요 - 怒っている
피곤해요 - 疲れた
배고파요 - お腹が空いた
목말라요 - のどが渇いた`,
    zh: `안녕하세요 - 你好
안녕 - 你好
좋은 아침 - 早上好
좋은 오후 - 下午好
좋은 저녁 - 晚上好
좋은 밤 - 晚安
감사합니다 - 谢谢
고마워요 - 谢谢
천만에요 - 不客气
죄송합니다 - 对不起
미안해요 - 对不起
실례합니다 - 不好意思
부탁합니다 - 请
네 - 是的
아니요 - 不是
아마도 - 可能
물론 - 当然
잘 지내세요 - 保重
안녕히 가세요 - 再见
나중에 봐요 - 一会儿见
내일 봐요 - 明天见
좋아요 - 好的
나쁘다 - 不好
훌륭해요 - 很棒
좋네요 - 很好
아름다워요 - 漂亮
맛있어요 - 好吃
어떻게 지내세요 - 你好吗
괜찮아요 - 我很好
이름이 뭐예요 - 你叫什么名字
만나서 반가워요 - 很高兴见到你
사랑해요 - 我爱你
그리워요 - 我想你
도움 - 帮助
도움이 필요해요 - 帮帮我
이해 못해요 - 我不明白
중국어 할 줄 아세요 - 你会说中文吗
물 - 水
음식 - 食物
커피 - 咖啡
차 - 茶
맥주 - 啤酒
식당 - 餐厅
호텔 - 酒店
공항 - 机场
역 - 车站
병원 - 医院
택시 - 出租车
버스 - 公交车
기차 - 火车
얼마예요 - 多少钱
비싸요 - 贵
싸요 - 便宜
오늘 - 今天
내일 - 明天
어제 - 昨天
지금 - 现在
나중에 - 稍后
항상 - 总是
절대 - 从不
가끔 - 有时
행복해요 - 开心
슬퍼요 - 难过
화나요 - 生气
피곤해요 - 累
배고파요 - 饿
목말라요 - 渴`,
  },
  // English common phrases
  en: {
    ko: `Hello - 안녕하세요
Hi - 안녕
Good morning - 좋은 아침
Good afternoon - 좋은 오후
Good evening - 좋은 저녁
Good night - 좋은 밤
Thank you - 감사합니다
Thanks - 고마워요
You're welcome - 천만에요
Sorry - 죄송합니다
Excuse me - 실례합니다
Please - 부탁합니다
Yes - 네
No - 아니요
Maybe - 아마도
Of course - 물론
Good - 좋아요
Bad - 나쁘다
Great - 훌륭해요
Nice - 좋네요
Beautiful - 아름다워요
Delicious - 맛있어요
How are you - 어떻게 지내세요
I'm fine - 괜찮아요
What's your name - 이름이 뭐예요
Nice to meet you - 만나서 반가워요
Goodbye - 안녕히 가세요
See you later - 나중에 봐요
See you tomorrow - 내일 봐요
I love you - 사랑해요
I miss you - 그리워요
Help - 도움
Help me - 도움이 필요해요
I don't understand - 이해 못해요
Do you speak Korean - 한국어 할 줄 아세요
Water - 물
Food - 음식
Coffee - 커피
Tea - 차
Beer - 맥주
Restaurant - 식당
Hotel - 호텔
Airport - 공항
Station - 역
Hospital - 병원
Taxi - 택시
Bus - 버스
Train - 기차
How much - 얼마예요
Expensive - 비싸요
Cheap - 싸요
Today - 오늘
Tomorrow - 내일
Yesterday - 어제
Now - 지금
Later - 나중에
Always - 항상
Never - 절대
Sometimes - 가끔
Happy - 행복해요
Sad - 슬퍼요
Angry - 화나요
Tired - 피곤해요
Hungry - 배고파요
Thirsty - 목말라요`,
    ja: `Hello - こんにちは
Hi - こんにちは  
Good morning - おはようございます
Good afternoon - こんにちは
Good evening - こんばんは
Good night - おやすみなさい
Thank you - ありがとうございます
Thanks - ありがとう
You're welcome - どういたしまして
Sorry - すみません
Excuse me - すみません
Please - お願いします
Yes - はい
No - いいえ
Maybe - たぶん
Of course - もちろん
Good - 良い
Bad - 悪い
Great - 素晴らしい
Nice - いいね
Beautiful - 美しい
Delicious - おいしい
How are you - 元気ですか
I'm fine - 元気です
What's your name - お名前は何ですか
Nice to meet you - はじめまして
Goodbye - さようなら
See you later - また後で
See you tomorrow - また明日
I love you - 愛しています
I miss you - 恋しいです
Help - 助けて
Help me - 助けてください
I don't understand - わかりません
Do you speak English - 英語を話せますか
Water - 水
Food - 食べ物
Coffee - コーヒー
Tea - お茶
Beer - ビール
Restaurant - レストラン
Hotel - ホテル
Airport - 空港
Station - 駅
Hospital - 病院
Taxi - タクシー
Bus - バス
Train - 電車
How much - いくらですか
Expensive - 高い
Cheap - 安い
Today - 今日
Tomorrow - 明日
Yesterday - 昨日
Now - 今
Later - 後で
Always - いつも
Never - 決して
Sometimes - 時々
Happy - 幸せ
Sad - 悲しい
Angry - 怒っている
Tired - 疲れた
Hungry - お腹が空いた
Thirsty - のどが渇いた`,
    zh: `Hello - 你好
Hi - 你好
Good morning - 早上好
Good afternoon - 下午好
Good evening - 晚上好
Good night - 晚安
Thank you - 谢谢
Thanks - 谢谢
You're welcome - 不客气
Sorry - 对不起
Excuse me - 打扰一下
Please - 请
Yes - 是的
No - 不是
Maybe - 也许
Of course - 当然
Good - 好的
Bad - 不好
Great - 很棒
Nice - 很好
Beautiful - 美丽
Delicious - 好吃
How are you - 你好吗
I'm fine - 我很好
What's your name - 你叫什么名字
Nice to meet you - 很高兴见到你
Goodbye - 再见
See you later - 一会儿见
See you tomorrow - 明天见
I love you - 我爱你
I miss you - 我想你
Help - 帮助
Help me - 帮帮我
I don't understand - 我不明白
Do you speak English - 你会说英语吗
Water - 水
Food - 食物
Coffee - 咖啡
Tea - 茶
Beer - 啤酒
Restaurant - 餐厅
Hotel - 酒店
Airport - 机场
Station - 车站
Hospital - 医院
Taxi - 出租车
Bus - 公交车
Train - 火车
How much - 多少钱
Expensive - 贵
Cheap - 便宜
Today - 今天
Tomorrow - 明天
Yesterday - 昨天
Now - 现在
Later - 稍后
Always - 总是
Never - 从不
Sometimes - 有时
Happy - 开心
Sad - 难过
Angry - 生气
Tired - 累
Hungry - 饿
Thirsty - 渴`,
  },
  // Japanese common phrases
  ja: {
    ko: `おはよう - 안녕하세요
おはようございます - 안녕하세요
こんにちは - 안녕하세요
こんばんは - 안녕하세요
ありがとう - 고마워요
ありがとうございます - 감사합니다
どうも - 고마워요
すみません - 죄송합니다
ごめんなさい - 미안해요
はい - 네
いいえ - 아니요
さようなら - 안녕히 가세요
また明日 - 내일 봐요
愛しています - 사랑해요
元気 - 건강해요
大丈夫 - 괜찮아요`,
    en: `おはよう - Good morning
おはようございます - Good morning
こんにちは - Hello
こんばんは - Good evening
ありがとう - Thanks
ありがとうございます - Thank you
どうも - Thanks
すみません - Sorry
ごめんなさい - Sorry
はい - Yes
いいえ - No
さようなら - Goodbye
また明日 - See you tomorrow
良い - Good
悪い - Bad
元気 - Fine
大丈夫 - Okay`,
    zh: `おはよう - 早上好
おはようございます - 早上好
こんにちは - 你好
こんばんは - 晚上好
ありがとう - 谢谢
ありがとうございます - 谢谢
すみません - 对不起
ごめんなさい - 对不起
はい - 是的
いいえ - 不是
さようなら - 再见`,
  },
  // Chinese common phrases
  zh: {
    ko: `你好 - 안녕하세요
您好 - 안녕하세요
早上好 - 좋은 아침
下午好 - 좋은 오후
晚上好 - 좋은 저녁
晚安 - 좋은 밤
谢谢 - 감사합니다
谢谢你 - 고마워요
不客气 - 천만에요
对不起 - 죄송합니다
不好意思 - 실례합니다
请 - 부탁합니다
是的 - 네
不是 - 아니요
可能 - 아마도
当然 - 물론
好的 - 좋아요
不好 - 나쁘다
很棒 - 훌륭해요
很好 - 좋네요
漂亮 - 아름다워요
好吃 - 맛있어요
你好吗 - 어떻게 지내세요
我很好 - 괜찮아요
你叫什么名字 - 이름이 뭐예요
很高兴见到你 - 만나서 반가워요
再见 - 안녕히 가세요
一会儿见 - 나중에 봐요
明天见 - 내일 봐요
我爱你 - 사랑해요
我想你 - 그리워요
帮助 - 도움
帮帮我 - 도움이 필요해요
我不明白 - 이해 못해요
你会说中文吗 - 중국어 할 줄 아세요
水 - 물
食物 - 음식
咖啡 - 커피
茶 - 차
啤酒 - 맥주
餐厅 - 식당
酒店 - 호텔
机场 - 공항
车站 - 역
医院 - 병원
出租车 - 택시
公交车 - 버스
火车 - 기차
多少钱 - 얼마예요
贵 - 비싸요
便宜 - 싸요
今天 - 오늘
明天 - 내일
昨天 - 어제
现在 - 지금
稍后 - 나중에
总是 - 항상
从不 - 절대
有时 - 가끔
开心 - 행복해요
难过 - 슬퍼요
生气 - 화나요
累 - 피곤해요
饿 - 배고파요
渴 - 목말라요`,
    en: `你好 - Hello
您好 - Hello
早上好 - Good morning
下午好 - Good afternoon
晚上好 - Good evening
晚安 - Good night
谢谢 - Thank you
谢谢你 - Thanks
不客气 - You're welcome
对不起 - Sorry
不好意思 - Excuse me
请 - Please
是的 - Yes
不是 - No
可能 - Maybe
当然 - Of course
好的 - Good
不好 - Bad
很棒 - Great
很好 - Nice
漂亮 - Beautiful
好吃 - Delicious
你好吗 - How are you
我很好 - I'm fine
你叫什么名字 - What's your name
很高兴见到你 - Nice to meet you
再见 - Goodbye
一会儿见 - See you later
明天见 - See you tomorrow
我爱你 - I love you
我想你 - I miss you
帮助 - Help
帮帮我 - Help me
我不明白 - I don't understand
你会说英语吗 - Do you speak English
水 - Water
食物 - Food
咖啡 - Coffee
茶 - Tea
啤酒 - Beer
餐厅 - Restaurant
酒店 - Hotel
机场 - Airport
车站 - Station
医院 - Hospital
出租车 - Taxi
公交车 - Bus
火车 - Train
多少钱 - How much
贵 - Expensive
便宜 - Cheap
今天 - Today
明天 - Tomorrow
昨天 - Yesterday
现在 - Now
稍后 - Later
总是 - Always
从不 - Never
有时 - Sometimes
开心 - Happy
难过 - Sad
生气 - Angry
累 - Tired
饿 - Hungry
渴 - Thirsty`,
    ja: `你好 - こんにちは
您好 - こんにちは
早上好 - おはようございます
下午好 - こんにちは
晚上好 - こんばんは
晚安 - おやすみなさい
谢谢 - ありがとうございます
谢谢你 - ありがとう
不客气 - どういたしまして
对不起 - すみません
不好意思 - すみません
请 - お願いします
是的 - はい
不是 - いいえ
可能 - たぶん
当然 - もちろん
好的 - 良い
不好 - 悪い
很棒 - 素晴らしい
很好 - いいね
漂亮 - 美しい
好吃 - おいしい
你好吗 - 元気ですか
我很好 - 元気です
你叫什么名字 - お名前は何ですか
很高兴见到你 - はじめまして
再见 - さようなら
一会儿见 - また後で
明天见 - また明日
我爱你 - 愛しています
我想你 - 恋しいです
帮助 - 助けて
帮帮我 - 助けてください
我不明白 - わかりません
你会说日语吗 - 日本語を話せますか
水 - 水
食物 - 食べ物
咖啡 - コーヒー
茶 - お茶
啤酒 - ビール
餐厅 - レストラン
酒店 - ホテル
机场 - 空港
车站 - 駅
医院 - 病院
出租车 - タクシー
公交车 - バス
火车 - 電車
多少钱 - いくらですか
贵 - 高い
便宜 - 安い
今天 - 今日
明天 - 明日
昨天 - 昨日
现在 - 今
稍后 - 後で
总是 - いつも
从不 - 決して
有时 - 时々
开心 - 幸せ
难过 - 悲しい
生气 - 怒っている
累 - 疲れた
饿 - お腹が空いた
渴 - のどが渇いた`,
  },
};

export async function translateWithOfflineDictionary(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const dictionary = OFFLINE_DICTIONARY[sourceLang]?.[targetLang];

  if (!dictionary) {
    throw new Error(
      `Offline translation not available for ${sourceLang} to ${targetLang}`
    );
  }

  // Simple keyword matching for offline translation
  const lowerText = text.toLowerCase();
  const entries = dictionary.split("\n");

  for (const entry of entries) {
    const [source, target] = entry.split(" - ");
    if (source && target && lowerText.includes(source.toLowerCase())) {
      return {
        translatedText: target,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        confidence: 0.6,
        provider: "offline",
      };
    }
  }

  // Return original text with note if no match found
  return {
    translatedText: `${text} (번역 불가 - Translation unavailable)`,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    confidence: 0.1,
    provider: "offline",
  };
}
