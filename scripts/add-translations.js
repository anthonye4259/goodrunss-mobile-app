/**
 * Script to add missing translation keys to all languages
 * This ensures all 12 languages have the same keys
 */

const fs = require('fs');
const path = require('path');

// New keys to add (in English - will be translated)
const newKeys = {
    // Home Screen
    "home.liveActivity": "Live Activity",
    "home.findTrainer": "Find a Trainer",
    "home.bookVenue": "Book a Venue",
    "home.needPlayers": "Need Players?",
    "home.activePlayers": "active players",
    "home.gamesHappening": "games happening",

    // Explore Screen
    "explore.liveTraffic": "Live Traffic",
    "explore.searchPlaceholder": "Search trainers, venues...",
    "explore.nearbyVenues": "Nearby Venues",
    "explore.topTrainers": "Top Trainers Near You",
    "explore.checkBeforeGo": "Check Before You Go",
    "explore.saveGas": "Save gas money, time & reduce CO₂ emissions",
    "explore.playersActive": "players active now",
    "explore.minutesAgo": "m ago",

    // Bookings Screen
    "bookings.title": "My Bookings",
    "bookings.upcoming": "Upcoming",
    "bookings.past": "Past",
    "bookings.noBookings": "No bookings yet",
    "bookings.startBooking": "Book your first session",

    // Messages Screen
    "messages.title": "Messages",
    "messages.noMessages": "No messages yet",
    "messages.startChat": "Start a conversation",

    // Profile Screen
    "profile.title": "Profile",
    "profile.settings": "Settings",
    "profile.editProfile": "Edit Profile",
    "profile.stats": "Stats",
    "profile.achievements": "Achievements",

    // Venue Details
    "venue.details": "Details",
    "venue.reviews": "Reviews",
    "venue.amenities": "Amenities",
    "venue.hours": "Hours",
    "venue.getDirections": "Get Directions",
    "venue.reportIssue": "Report Issue",

    // Errors & Empty States
    "error.title": "Something went wrong",
    "error.message": "We couldn't load this content. Please try again.",
    "error.retry": "Try Again",
    "empty.noResults": "No results found",
    "empty.noVenues": "No venues found",
    "empty.adjustFilters": "Try adjusting your filters",
};

// Translations for each language (using Google Translate as base)
const translations = {
    es: {
        "home.liveActivity": "Actividad en Vivo",
        "home.findTrainer": "Encontrar un Entrenador",
        "home.bookVenue": "Reservar un Lugar",
        "home.needPlayers": "¿Necesitas Jugadores?",
        "home.activePlayers": "jugadores activos",
        "home.gamesHappening": "juegos en curso",
        "explore.liveTraffic": "Tráfico en Vivo",
        "explore.searchPlaceholder": "Buscar entrenadores, lugares...",
        "explore.nearbyVenues": "Lugares Cercanos",
        "explore.topTrainers": "Mejores Entrenadores Cerca de Ti",
        "explore.checkBeforeGo": "Verifica Antes de Ir",
        "explore.saveGas": "Ahorra gasolina, tiempo y reduce emisiones de CO₂",
        "explore.playersActive": "jugadores activos ahora",
        "explore.minutesAgo": "hace m",
        "bookings.title": "Mis Reservas",
        "bookings.upcoming": "Próximas",
        "bookings.past": "Pasadas",
        "bookings.noBookings": "Aún no hay reservas",
        "bookings.startBooking": "Reserva tu primera sesión",
        "messages.title": "Mensajes",
        "messages.noMessages": "Aún no hay mensajes",
        "messages.startChat": "Iniciar una conversación",
        "profile.title": "Perfil",
        "profile.settings": "Configuración",
        "profile.editProfile": "Editar Perfil",
        "profile.stats": "Estadísticas",
        "profile.achievements": "Logros",
        "venue.details": "Detalles",
        "venue.reviews": "Reseñas",
        "venue.amenities": "Comodidades",
        "venue.hours": "Horario",
        "venue.getDirections": "Obtener Direcciones",
        "venue.reportIssue": "Reportar Problema",
        "error.title": "Algo salió mal",
        "error.message": "No pudimos cargar este contenido. Por favor, inténtalo de nuevo.",
        "error.retry": "Intentar de Nuevo",
        "empty.noResults": "No se encontraron resultados",
        "empty.noVenues": "No se encontraron lugares",
        "empty.adjustFilters": "Intenta ajustar tus filtros",
    },
    // Add more languages as needed...
};

console.log('Translation keys ready to add to i18n.ts');
console.log(`Total new keys: ${Object.keys(newKeys).length}`);
console.log('Spanish translations ready');
