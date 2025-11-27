import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import * as Localization from "expo-localization"
import AsyncStorage from "@react-native-async-storage/async-storage"

const resources = {
  en: {
    translation: {
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
  zh: {
    translation: {
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
}

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.split("-")[0],
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

// Save language preference
i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem("user-language", lng)
})

// Load saved language
AsyncStorage.getItem("user-language").then((savedLang) => {
  if (savedLang) {
    i18n.changeLanguage(savedLang)
  }
})

export default i18n
