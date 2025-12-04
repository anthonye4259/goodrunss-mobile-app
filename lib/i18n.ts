import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import * as Localization from "expo-localization"
import AsyncStorage from "@react-native-async-storage/async-storage"

const resources = {
  en: {
    translation: {
      welcome: "Welcome to GoodRunss",
      selectLanguage: "Select Your Language",
      search: "Search...",
      continue: "Continue",

      // Navigation
      "nav.home": "Home",
      "nav.explore": "Explore",
      "nav.bookings": "Bookings",
      "nav.messages": "Messages",
      "nav.profile": "Profile",

      // Common
      "common.book": "Book",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.loading": "Loading...",

      // Trainers
      "trainers.title": "Trainers",
      "trainers.book_session": "Book Session",
      "trainers.per_session": "per session",
      "trainers.reviews": "reviews",

      // Venues
      "venues.title": "Venues",
      "venues.book_venue": "Book Venue",
      "venues.court_quality": "Court Quality",

      // Marketplace
      "marketplace.title": "Gear & Equipment",
      "marketplace.buy": "Buy",
      "marketplace.rent": "Rent",

      // Time
      "time.morning": "Morning",
      "time.afternoon": "Afternoon",
      "time.evening": "Evening",
    },
  },
  es: {
    translation: {
      welcome: "Bienvenido a GoodRunss",
      selectLanguage: "Selecciona tu idioma",
      search: "Buscar...",
      continue: "Continuar",

      "nav.home": "Inicio",
      "nav.explore": "Explorar",
      "nav.bookings": "Reservas",
      "nav.messages": "Mensajes",
      "nav.profile": "Perfil",

      "common.book": "Reservar",
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.search": "Buscar",
      "common.filter": "Filtrar",
      "common.loading": "Cargando...",

      "trainers.title": "Entrenadores",
      "trainers.book_session": "Reservar Sesión",
      "trainers.per_session": "por sesión",
      "trainers.reviews": "reseñas",

      "venues.title": "Lugares",
      "venues.book_venue": "Reservar Lugar",
      "venues.court_quality": "Calidad de Cancha",

      "marketplace.title": "Equipo y Accesorios",
      "marketplace.buy": "Comprar",
      "marketplace.rent": "Alquilar",

      "time.morning": "Mañana",
      "time.afternoon": "Tarde",
      "time.evening": "Noche",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue sur GoodRunss",
      selectLanguage: "Sélectionnez votre langue",
      search: "Rechercher...",
      continue: "Continuer",

      "nav.home": "Accueil",
      "nav.explore": "Explorer",
      "nav.bookings": "Réservations",
      "nav.messages": "Messages",
      "nav.profile": "Profil",

      "common.book": "Réserver",
      "common.cancel": "Annuler",
      "common.save": "Sauvegarder",
      "common.search": "Rechercher",
      "common.filter": "Filtrer",
      "common.loading": "Chargement...",

      "trainers.title": "Entraîneurs",
      "trainers.book_session": "Réserver une Séance",
      "trainers.per_session": "par séance",
      "trainers.reviews": "avis",

      "venues.title": "Lieux",
      "venues.book_venue": "Réserver un Lieu",
      "venues.court_quality": "Qualité du Terrain",

      "marketplace.title": "Équipement",
      "marketplace.buy": "Acheter",
      "marketplace.rent": "Louer",

      "time.morning": "Matin",
      "time.afternoon": "Après-midi",
      "time.evening": "Soir",
    },
  },
  de: {
    translation: {
      welcome: "Willkommen bei GoodRunss",
      selectLanguage: "Wählen Sie Ihre Sprache",
      search: "Suchen...",
      continue: "Weiter",

      "nav.home": "Startseite",
      "nav.explore": "Erkunden",
      "nav.bookings": "Buchungen",
      "nav.messages": "Nachrichten",
      "nav.profile": "Profil",

      "common.book": "Buchen",
      "common.cancel": "Abbrechen",
      "common.save": "Speichern",
      "common.search": "Suchen",
      "common.filter": "Filtern",
      "common.loading": "Laden...",

      "trainers.title": "Trainer",
      "trainers.book_session": "Sitzung Buchen",
      "trainers.per_session": "pro Sitzung",
      "trainers.reviews": "Bewertungen",

      "venues.title": "Veranstaltungsorte",
      "venues.book_venue": "Ort Buchen",
      "venues.court_quality": "Platzqualität",

      "marketplace.title": "Ausrüstung",
      "marketplace.buy": "Kaufen",
      "marketplace.rent": "Mieten",

      "time.morning": "Morgen",
      "time.afternoon": "Nachmittag",
      "time.evening": "Abend",
    },
  },
  ar: {
    translation: {
      welcome: "مرحبا بك في GoodRunss",
      selectLanguage: "اختر لغتك",
      search: "بحث...",
      continue: "متابعة",

      "nav.home": "الرئيسية",
      "nav.explore": "استكشف",
      "nav.bookings": "الحجوزات",
      "nav.messages": "الرسائل",
      "nav.profile": "الملف الشخصي",

      "common.book": "احجز",
      "common.cancel": "إلغاء",
      "common.save": "حفظ",
      "common.search": "بحث",
      "common.filter": "تصفية",
      "common.loading": "جاري التحميل...",

      "trainers.title": "المدربون",
      "trainers.book_session": "احجز جلسة",
      "trainers.per_session": "لكل جلسة",
      "trainers.reviews": "التقييمات",

      "venues.title": "الأماكن",
      "venues.book_venue": "احجز مكان",
      "venues.court_quality": "جودة الملعب",

      "marketplace.title": "المعدات",
      "marketplace.buy": "شراء",
      "marketplace.rent": "إيجار",

      "time.morning": "صباح",
      "time.afternoon": "بعد الظهر",
      "time.evening": "مساء",
    },
  },
  zh: {
    translation: {
      welcome: "欢迎来到 GoodRunss",
      selectLanguage: "选择您的语言",
      search: "搜索...",
      continue: "继续",

      "nav.home": "首页",
      "nav.explore": "探索",
      "nav.bookings": "预订",
      "nav.messages": "消息",
      "nav.profile": "个人资料",

      "common.book": "预订",
      "common.cancel": "取消",
      "common.save": "保存",
      "common.search": "搜索",
      "common.filter": "筛选",
      "common.loading": "加载中...",

      "trainers.title": "教练",
      "trainers.book_session": "预订课程",
      "trainers.per_session": "每节课",
      "trainers.reviews": "评论",

      "venues.title": "场地",
      "venues.book_venue": "预订场地",
      "venues.court_quality": "场地质量",

      "marketplace.title": "装备",
      "marketplace.buy": "购买",
      "marketplace.rent": "租赁",

      "time.morning": "上午",
      "time.afternoon": "下午",
      "time.evening": "晚上",
    },
  },
  ja: {
    translation: {
      welcome: "GoodRunssへようこそ",
      selectLanguage: "言語を選択",
      search: "検索...",
      continue: "続ける",

      "nav.home": "ホーム",
      "nav.explore": "探索",
      "nav.bookings": "予約",
      "nav.messages": "メッセージ",
      "nav.profile": "プロフィール",

      "common.book": "予約",
      "common.cancel": "キャンセル",
      "common.save": "保存",
      "common.search": "検索",
      "common.filter": "フィルター",
      "common.loading": "読み込み中...",

      "trainers.title": "トレーナー",
      "trainers.book_session": "セッション予約",
      "trainers.per_session": "セッション毎",
      "trainers.reviews": "レビュー",

      "venues.title": "会場",
      "venues.book_venue": "会場予約",
      "venues.court_quality": "コートの品質",

      "marketplace.title": "装備",
      "marketplace.buy": "購入",
      "marketplace.rent": "レンタル",

      "time.morning": "朝",
      "time.afternoon": "午後",
      "time.evening": "夜",
    },
  },
  hi: {
    translation: {
      welcome: "GoodRunss में आपका स्वागत है",
      selectLanguage: "अपनी भाषा चुनें",
      search: "खोजें...",
      continue: "जारी रखें",

      "nav.home": "होम",
      "nav.explore": "खोजें",
      "nav.bookings": "बुकिंग",
      "nav.messages": "संदेश",
      "nav.profile": "प्रोफ़ाइल",

      "common.book": "बुक करें",
      "common.cancel": "रद्द करें",
      "common.save": "सहेजें",
      "common.search": "खोजें",
      "common.filter": "फ़िल्टर",
      "common.loading": "लोड हो रहा है...",

      "trainers.title": "प्रशिक्षक",
      "trainers.book_session": "सत्र बुक करें",
      "trainers.per_session": "प्रति सत्र",
      "trainers.reviews": "समीक्षाएं",

      "venues.title": "स्थल",
      "venues.book_venue": "स्थल बुक करें",
      "venues.court_quality": "कोर्ट की गुणवत्ता",

      "marketplace.title": "उपकरण",
      "marketplace.buy": "खरीदें",
      "marketplace.rent": "किराए पर लें",

      "time.morning": "सुबह",
      "time.afternoon": "दोपहर",
      "time.evening": "शाम",
    },
  },
  pt: {
    translation: {
      welcome: "Bem-vindo ao GoodRunss",
      selectLanguage: "Selecione seu idioma",
      search: "Pesquisar...",
      continue: "Continuar",

      "nav.home": "Início",
      "nav.explore": "Explorar",
      "nav.bookings": "Reservas",
      "nav.messages": "Mensagens",
      "nav.profile": "Perfil",

      "common.book": "Reservar",
      "common.cancel": "Cancelar",
      "common.save": "Salvar",
      "common.search": "Pesquisar",
      "common.filter": "Filtrar",
      "common.loading": "Carregando...",

      "trainers.title": "Treinadores",
      "trainers.book_session": "Reservar Sessão",
      "trainers.per_session": "por sessão",
      "trainers.reviews": "avaliações",

      "venues.title": "Locais",
      "venues.book_venue": "Reservar Local",
      "venues.court_quality": "Qualidade da Quadra",

      "marketplace.title": "Equipamentos",
      "marketplace.buy": "Comprar",
      "marketplace.rent": "Alugar",

      "time.morning": "Manhã",
      "time.afternoon": "Tarde",
      "time.evening": "Noite",
    },
  },
  ru: {
    translation: {
      welcome: "Добро пожаловать в GoodRunss",
      selectLanguage: "Выберите язык",
      search: "Поиск...",
      continue: "Продолжить",

      "nav.home": "Главная",
      "nav.explore": "Обзор",
      "nav.bookings": "Бронирования",
      "nav.messages": "Сообщения",
      "nav.profile": "Профиль",

      "common.book": "Забронировать",
      "common.cancel": "Отмена",
      "common.save": "Сохранить",
      "common.search": "Поиск",
      "common.filter": "Фильтр",
      "common.loading": "Загрузка...",

      "trainers.title": "Тренеры",
      "trainers.book_session": "Забронировать Сеанс",
      "trainers.per_session": "за сеанс",
      "trainers.reviews": "отзывы",

      "venues.title": "Места",
      "venues.book_venue": "Забронировать Место",
      "venues.court_quality": "Качество Площадки",

      "marketplace.title": "Оборудование",
      "marketplace.buy": "Купить",
      "marketplace.rent": "Арендовать",

      "time.morning": "Утро",
      "time.afternoon": "День",
      "time.evening": "Вечер",
    },
  },
  bn: {
    translation: {
      welcome: "GoodRunss এ স্বাগতম",
      selectLanguage: "আপনার ভাষা নির্বাচন করুন",
      search: "অনুসন্ধান...",
      continue: "চালিয়ে যান",

      "nav.home": "হোম",
      "nav.explore": "অন্বেষণ",
      "nav.bookings": "বুকিং",
      "nav.messages": "বার্তা",
      "nav.profile": "প্রোফাইল",

      "common.book": "বুক করুন",
      "common.cancel": "বাতিল করুন",
      "common.save": "সংরক্ষণ করুন",
      "common.search": "অনুসন্ধান",
      "common.filter": "ফিল্টার",
      "common.loading": "লোড হচ্ছে...",

      "trainers.title": "প্রশিক্ষক",
      "trainers.book_session": "সেশন বুক করুন",
      "trainers.per_session": "প্রতি সেশন",
      "trainers.reviews": "রিভিউ",

      "venues.title": "স্থান",
      "venues.book_venue": "স্থান বুক করুন",
      "venues.court_quality": "কোর্টের মান",

      "marketplace.title": "সরঞ্জাম",
      "marketplace.buy": "কিনুন",
      "marketplace.rent": "ভাড়া নিন",

      "time.morning": "সকাল",
      "time.afternoon": "দুপুর",
      "time.evening": "সন্ধ্যা",
    },
  },
  ur: {
    translation: {
      welcome: "GoodRunss میں خوش آمدید",
      selectLanguage: "اپنی زبان منتخب کریں",
      search: "تلاش کریں...",
      continue: "جاری رکھیں",

      "nav.home": "ہوم",
      "nav.explore": "دریافت کریں",
      "nav.bookings": "بکنگ",
      "nav.messages": "پیغامات",
      "nav.profile": "پروفائل",

      "common.book": "بک کریں",
      "common.cancel": "منسوخ کریں",
      "common.save": "محفوظ کریں",
      "common.search": "تلاش",
      "common.filter": "فلٹر",
      "common.loading": "لوڈ ہو رہا ہے...",

      "trainers.title": "ٹرینرز",
      "trainers.book_session": "سیشن بک کریں",
      "trainers.per_session": "فی سیشن",
      "trainers.reviews": "جائزے",

      "venues.title": "مقامات",
      "venues.book_venue": "مقام بک کریں",
      "venues.court_quality": "کورٹ کا معیار",

      "marketplace.title": "سامان",
      "marketplace.buy": "خریدیں",
      "marketplace.rent": "کرائے پر لیں",

      "time.morning": "صبح",
      "time.afternoon": "دوپہر",
      "time.evening": "شام",
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: (Localization.locale || "en-US").split("-")[0],
  fallbackLng: "en",
  compatibilityJSON: "v3",
  interpolation: {
    escapeValue: false,
  },
})

i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem("user-language", lng)
})

AsyncStorage.getItem("user-language").then((savedLang) => {
  if (savedLang) {
    i18n.changeLanguage(savedLang)
  }
})

export default i18n
