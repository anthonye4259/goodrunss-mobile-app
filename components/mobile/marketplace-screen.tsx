"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter, DollarSign, Package, Clock, Share2 } from "lucide-react"
import Image from "next/image"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { MarketplaceCheckoutModal } from "./marketplace-checkout-modal"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"

export function MarketplaceScreen() {
  const router = useRouter()
  const { preferences } = useUserPreferences()

  const primaryActivity = getPrimaryActivity(preferences.activities) || "Basketball"
  const activityContent = getActivityContent(primaryActivity as Activity)

  const listings = activityContent.marketplaceItems.map((item, index) => ({
    id: index + 1,
    title: item.name,
    price: item.price,
    type: item.condition === "New" ? "sell" : Math.random() > 0.5 ? "sell" : "rent",
    condition: item.condition,
    distance: `${(Math.random() * 3 + 0.5).toFixed(1)} miles`,
    seller: item.seller,
    image: item.image,
    zipCode: "10001",
    rentalPeriod: Math.random() > 0.5 ? "per day" : "per week",
  }))

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "sell" | "rent">("all")
  const [zipCode, setZipCode] = useState("10001")
  const [shareItem, setShareItem] = useState<(typeof listings)[0] | null>(null)
  const [checkoutItem, setCheckoutItem] = useState<(typeof listings)[0] | null>(null)

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || listing.type === filterType
    const matchesZip = listing.zipCode.startsWith(zipCode.slice(0, 3))
    return matchesSearch && matchesType && matchesZip
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Marketplace</h1>
              <p className="text-sm text-muted-foreground">Buy, sell, or rent gear locally</p>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent glow-primary"
              onClick={() => router.push("/mobile/marketplace/list")}
            >
              List Item
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for gear..."
                className="pl-10 glass-card border-border/50"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Zip code"
                  className="pl-10 glass-card border-border/50"
                  maxLength={5}
                />
              </div>
              <Button variant="outline" size="icon" className="glass-card bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className={filterType === "all" ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterType === "sell" ? "default" : "outline"}
                onClick={() => setFilterType("sell")}
                className={filterType === "sell" ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Buy
              </Button>
              <Button
                size="sm"
                variant={filterType === "rent" ? "default" : "outline"}
                onClick={() => setFilterType("rent")}
                className={filterType === "rent" ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
              >
                <Clock className="h-3 w-3 mr-1" />
                Rent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={listing.image || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        listing.type === "sell"
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-accent/90 text-accent-foreground"
                      }`}
                    >
                      {listing.type === "sell" ? "SELL" : "RENT"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">{listing.title}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>{listing.condition}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.distance} away</span>
                    </div>
                    <p className="text-xs text-muted-foreground">by {listing.seller}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xl font-bold gradient-text">${listing.price}</p>
                      {listing.rentalPeriod && <p className="text-xs text-muted-foreground">{listing.rentalPeriod}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setShareItem(listing)}
                        className="glass-card hover:border-primary/50"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent glow-primary"
                        onClick={() => setCheckoutItem(listing)}
                      >
                        {listing.type === "sell" ? "Buy" : "Rent"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No items found in your area</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or zip code</p>
          </div>
        )}
      </div>

      {shareItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShareItem(null)} />
          <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="glass-card rounded-3xl p-6 border-2 border-primary/50 glow-primary">
              <h3 className="text-xl font-bold gradient-text mb-4">Share this item</h3>
              <p className="text-sm text-muted-foreground mb-6">Share {shareItem.title} with your friends</p>
              <SocialShareButtons
                text={`Check out this ${shareItem.type === "sell" ? "item for sale" : "rental"} on GoodRunss: ${shareItem.title} - $${shareItem.price}${shareItem.rentalPeriod ? ` ${shareItem.rentalPeriod}` : ""}`}
                size="md"
                showLabels={true}
              />
              <Button
                variant="outline"
                className="w-full mt-4 glass-card bg-transparent"
                onClick={() => setShareItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <MarketplaceCheckoutModal item={checkoutItem} isOpen={!!checkoutItem} onClose={() => setCheckoutItem(null)} />
    </div>
  )
}
