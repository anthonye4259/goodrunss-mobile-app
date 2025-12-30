import WidgetKit
import SwiftUI

// ============================================
// GOODRUNSS WIDGET - PLAYER VERSION
// Shows nearby activity, friends playing, weather
// ============================================

// MARK: - Data Models

struct VenueActivity: Codable, Identifiable {
    var id: String { name }
    let name: String
    let playerCount: Int
    let sport: String
    let distance: String
}

struct FriendActivity: Codable, Identifiable {
    var id: String { name }
    let name: String
    let venue: String
    let checkedInAt: Date
}

struct WeatherData: Codable {
    let temp: Int
    let condition: String
    let icon: String
}

struct WidgetData: Codable {
    let venues: [VenueActivity]
    let friends: [FriendActivity]
    let weather: WeatherData?
    let bestTimeVenue: String?
    let bestTimeHour: String?
    let updatedAt: Date
    let userType: String // "player" or "trainer"
}

// MARK: - Trainer-Specific Data

struct TrainerWidgetData: Codable {
    let todaySessions: Int
    let todayEarnings: Double
    let upcomingClient: String?
    let upcomingTime: String?
    let weeklyEarnings: Double
    let totalClients: Int
    let updatedAt: Date
}

// MARK: - Timeline Entry

struct GoodRunssEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetData?
    let trainerData: TrainerWidgetData?
    let isPlaceholder: Bool
    
    static var placeholder: GoodRunssEntry {
        GoodRunssEntry(
            date: Date(),
            widgetData: WidgetData(
                venues: [
                    VenueActivity(name: "Piedmont Park", playerCount: 8, sport: "basketball", distance: "0.5 mi"),
                    VenueActivity(name: "Grant Park", playerCount: 3, sport: "tennis", distance: "1.2 mi")
                ],
                friends: [
                    FriendActivity(name: "Marcus", venue: "Piedmont Park", checkedInAt: Date())
                ],
                weather: WeatherData(temp: 72, condition: "Sunny", icon: "☀️"),
                bestTimeVenue: "Grant Park",
                bestTimeHour: "3 PM",
                updatedAt: Date(),
                userType: "player"
            ),
            trainerData: nil,
            isPlaceholder: true
        )
    }
    
    static var trainerPlaceholder: GoodRunssEntry {
        GoodRunssEntry(
            date: Date(),
            widgetData: nil,
            trainerData: TrainerWidgetData(
                todaySessions: 3,
                todayEarnings: 195.00,
                upcomingClient: "John D.",
                upcomingTime: "2:00 PM",
                weeklyEarnings: 847.50,
                totalClients: 12,
                updatedAt: Date()
            ),
            isPlaceholder: true
        )
    }
}

// MARK: - Timeline Provider

struct PlayerActivityProvider: TimelineProvider {
    let sharedDefaults = UserDefaults(suiteName: "group.com.goodrunss.app")
    
    func placeholder(in context: Context) -> GoodRunssEntry {
        GoodRunssEntry.placeholder
    }
    
    func getSnapshot(in context: Context, completion: @escaping (GoodRunssEntry) -> Void) {
        let entry = loadData() ?? GoodRunssEntry.placeholder
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<GoodRunssEntry>) -> Void) {
        let entry = loadData() ?? GoodRunssEntry.placeholder
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadData() -> GoodRunssEntry? {
        guard let data = sharedDefaults?.data(forKey: "widget_player_data"),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            return nil
        }
        return GoodRunssEntry(date: Date(), widgetData: widgetData, trainerData: nil, isPlaceholder: false)
    }
}

struct TrainerActivityProvider: TimelineProvider {
    let sharedDefaults = UserDefaults(suiteName: "group.com.goodrunss.app")
    
    func placeholder(in context: Context) -> GoodRunssEntry {
        GoodRunssEntry.trainerPlaceholder
    }
    
    func getSnapshot(in context: Context, completion: @escaping (GoodRunssEntry) -> Void) {
        let entry = loadData() ?? GoodRunssEntry.trainerPlaceholder
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<GoodRunssEntry>) -> Void) {
        let entry = loadData() ?? GoodRunssEntry.trainerPlaceholder
        
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadData() -> GoodRunssEntry? {
        guard let data = sharedDefaults?.data(forKey: "widget_trainer_data"),
              let trainerData = try? JSONDecoder().decode(TrainerWidgetData.self, from: data) else {
            return nil
        }
        return GoodRunssEntry(date: Date(), widgetData: nil, trainerData: trainerData, isPlaceholder: false)
    }
}

// MARK: - Player Widget View

struct PlayerWidgetView: View {
    let entry: GoodRunssEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            Color(hex: "0A0A0A")
            
            switch family {
            case .systemSmall:
                SmallPlayerWidget(entry: entry)
            case .systemMedium:
                MediumPlayerWidget(entry: entry)
            case .systemLarge:
                LargePlayerWidget(entry: entry)
            case .accessoryCircular:
                CircularLockScreenWidget(entry: entry)
            case .accessoryRectangular:
                RectangularLockScreenWidget(entry: entry)
            case .accessoryInline:
                InlineLockScreenWidget(entry: entry)
            default:
                SmallPlayerWidget(entry: entry)
            }
        }
    }
}

// MARK: - Small Player Widget

struct SmallPlayerWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text("🏀")
                Text("GoodRunss")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color(hex: "7ED957"))
                Spacer()
            }
            
            if let data = entry.widgetData, let venue = data.venues.first {
                VStack(alignment: .leading, spacing: 4) {
                    Text(venue.name)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    HStack {
                        Text("\(venue.playerCount) playing")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                        Spacer()
                        Text(venue.distance)
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Spacer()
            
            // Weather
            if let weather = entry.widgetData?.weather {
                HStack {
                    Text(weather.icon)
                    Text("\(weather.temp)°F")
                        .font(.system(size: 11))
                        .foregroundColor(.white)
                    Text(weather.condition)
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(12)
    }
}

// MARK: - Medium Player Widget

struct MediumPlayerWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left: Venues
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("🏀")
                    Text("Activity")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(Color(hex: "7ED957"))
                }
                
                if let data = entry.widgetData {
                    ForEach(data.venues.prefix(3)) { venue in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(venue.name)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                            }
                            Spacer()
                            Text("\(venue.playerCount)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(Color(hex: "7ED957"))
                        }
                    }
                }
            }
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            // Right: Friends + Weather
            VStack(alignment: .leading, spacing: 8) {
                if let data = entry.widgetData, let friend = data.friends.first {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("👥 Friend")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                        Text(friend.name)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                        Text("@ \(friend.venue)")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                if let weather = entry.widgetData?.weather {
                    HStack {
                        Text(weather.icon)
                        Text("\(weather.temp)°F")
                            .font(.system(size: 12))
                            .foregroundColor(.white)
                    }
                }
            }
            .frame(width: 80)
        }
        .padding(12)
    }
}

// MARK: - Large Player Widget

struct LargePlayerWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Text("🏀")
                Text("GoodRunss")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(hex: "7ED957"))
                Spacer()
                if let weather = entry.widgetData?.weather {
                    Text("\(weather.icon) \(weather.temp)°F")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                }
            }
            
            // Venues
            if let data = entry.widgetData {
                Text("Nearby Activity")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.gray)
                
                ForEach(data.venues.prefix(4)) { venue in
                    HStack {
                        Circle()
                            .fill(Color(hex: "7ED957"))
                            .frame(width: 8, height: 8)
                        Text(venue.name)
                            .font(.system(size: 13))
                            .foregroundColor(.white)
                        Spacer()
                        Text("\(venue.playerCount) playing")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                }
                
                Divider()
                    .background(Color.gray.opacity(0.3))
                
                // Friends
                if !data.friends.isEmpty {
                    Text("Friends Playing")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.gray)
                    
                    ForEach(data.friends.prefix(3)) { friend in
                        HStack {
                            Text("👤")
                            Text("\(friend.name) @ \(friend.venue)")
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                                .lineLimit(1)
                        }
                    }
                }
            }
            
            Spacer()
        }
        .padding(14)
    }
}

// MARK: - Lock Screen Widgets

struct CircularLockScreenWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        ZStack {
            if let venue = entry.widgetData?.venues.first {
                VStack {
                    Text("\(venue.playerCount)")
                        .font(.system(size: 24, weight: .bold))
                    Text("🏀")
                        .font(.system(size: 12))
                }
            } else {
                Text("🏀")
                    .font(.system(size: 28))
            }
        }
    }
}

struct RectangularLockScreenWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        if let data = entry.widgetData, let venue = data.venues.first {
            VStack(alignment: .leading) {
                Text("🏀 \(venue.name)")
                    .font(.system(size: 14, weight: .semibold))
                Text("\(venue.playerCount) playing now")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }
        } else {
            Text("🏀 Check GoodRunss")
                .font(.system(size: 14))
        }
    }
}

struct InlineLockScreenWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        if let venue = entry.widgetData?.venues.first {
            Text("🏀 \(venue.name): \(venue.playerCount) playing")
        } else {
            Text("🏀 GoodRunss")
        }
    }
}

// MARK: - Trainer Widget View

struct TrainerWidgetView: View {
    let entry: GoodRunssEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            Color(hex: "0A0A0A")
            
            switch family {
            case .systemSmall:
                SmallTrainerWidget(entry: entry)
            case .systemMedium:
                MediumTrainerWidget(entry: entry)
            default:
                SmallTrainerWidget(entry: entry)
            }
        }
    }
}

struct SmallTrainerWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("💼")
                Text("GoodRunss")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color(hex: "7ED957"))
            }
            
            if let data = entry.trainerData {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Today")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                    
                    HStack {
                        Text("\(data.todaySessions)")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        Text("sessions")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                    
                    Text("$\(String(format: "%.0f", data.todayEarnings))")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Color(hex: "7ED957"))
                }
            }
            
            Spacer()
        }
        .padding(12)
    }
}

struct MediumTrainerWidget: View {
    let entry: GoodRunssEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left: Today's Stats
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("💼")
                    Text("Today")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(Color(hex: "7ED957"))
                }
                
                if let data = entry.trainerData {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("\(data.todaySessions)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                            Text("sessions")
                                .font(.system(size: 11))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        VStack(alignment: .trailing) {
                            Text("$\(String(format: "%.0f", data.todayEarnings))")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(Color(hex: "7ED957"))
                            Text("earned")
                                .font(.system(size: 11))
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            // Right: Next Session
            VStack(alignment: .leading, spacing: 8) {
                Text("⏰ Next")
                    .font(.system(size: 10))
                    .foregroundColor(.gray)
                
                if let data = entry.trainerData, let client = data.upcomingClient {
                    Text(client)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                    Text(data.upcomingTime ?? "")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "7ED957"))
                } else {
                    Text("No sessions")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                if let data = entry.trainerData {
                    Text("Week: $\(String(format: "%.0f", data.weeklyEarnings))")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
            }
            .frame(width: 90)
        }
        .padding(12)
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Widget Declaration

@main
struct GoodRunssWidgetBundle: WidgetBundle {
    var body: some Widget {
        PlayerActivityWidget()
        TrainerActivityWidget()
    }
}

struct PlayerActivityWidget: Widget {
    let kind: String = "PlayerActivityWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlayerActivityProvider()) { entry in
            PlayerWidgetView(entry: entry)
        }
        .configurationDisplayName("GoodRunss Activity")
        .description("See nearby court activity and where friends are playing.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}

struct TrainerActivityWidget: Widget {
    let kind: String = "TrainerActivityWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TrainerActivityProvider()) { entry in
            TrainerWidgetView(entry: entry)
        }
        .configurationDisplayName("GoodRunss Trainer")
        .description("Track your sessions, earnings, and upcoming clients.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
