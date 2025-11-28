
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Package, Star, Share2, Heart, MessageCircle, Shield, TrendingUp, Clock } from "lucide-react"
import Image from "next/image"
import { MarketplaceCheckoutModal } from "./marketplace-checkout-modal"
import { SocialShareButtons } from "../social-share-buttons"

export function MarketplaceItemDetailScreen() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const item = {
    id: "1",
    title: "Wilson Basketball - Evolution Indoor Game Ball",
    price: 25,
    type: "sell" as const,
    condition: "Like New",
    distance: "0.5 miles",
    seller: {
      name: "Mike Johnson",
      rating: 4.8,
      sales: 23,
      memberSince: "2023",
    },
    images: ["/basketball-action.png", "/basketball-close-up.jpg", "/basketball-texture.jpg"],
    zipCode: "10001",
    description:
      "Official size and weight Wilson Evolution basketball. Used for only one season of indoor play. Excellent grip and feel. No visible wear on the channels. Perfect for serious players looking for a quality ball at a great price.",
    specifications: [
      { label: "Brand", value: "Wilson" },
      { label: "Size", value: 'Official (29.5")' },
      { label: "Material", value: "Composite Leather" },
      { label: "Use", value: "Indoor" },
      { label: "Age", value: "6 months" },
    ],
    reviews: [
      {
        name: "Sarah C.",
        rating: 5,
        date: "1 week ago",
        comment: "Great seller! Item exactly as described. Fast pickup.",
      },
      {
        name: "David L.",
        rating: 5,
        date: "2 weeks ago",
        comment: "Smooth transaction. Would buy from again.",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Item Details</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowShare(true)}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-24">
        {/* Image Gallery */}
        <div className="relative">
          <div className="relative h-80 bg-muted">
            <Image
              src={item.images[selectedImage] || "/placeholder.svg"}
              alt={item.title}
              fill
              className="object-cover"
            />
            <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
              {item.type === "sell" ? "FOR SALE" : "FOR RENT"}
            </Badge>
          </div>
          <div className="flex gap-2 p-4 overflow-x-auto">
            {item.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  selectedImage === i ? "border-primary glow-primary" : "border-border/50"
                }`}
              >
                <Image src={img || "/placeholder.svg"} alt={`View ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Item Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">{item.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="glass-card">
                    <Package className="h-3 w-3 mr-1" />
                    {item.condition}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{item.distance} away</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold gradient-text">${item.price}</span>
              {item.type === "rent" && <span className="text-muted-foreground">per day</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => setShowCheckout(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
            >
              {item.type === "sell" ? "Buy Now" : "Rent Now"}
            </Button>
            <Button size="lg" variant="outline" className="glass-card bg-transparent">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>

          {/* Seller Info */}
          <Card className="glass-card border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{item.seller.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.seller.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span>{item.seller.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{item.seller.sales} sales</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </Card>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="glass-card border border-border/50 p-3 text-center">
              <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold">Verified</p>
            </Card>
            <Card className="glass-card border border-border/50 p-3 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold">Top Seller</p>
            </Card>
            <Card className="glass-card border border-border/50 p-3 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold">Fast Reply</p>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </Card>

          {/* Specifications */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-4">Specifications</h3>
            <div className="space-y-3">
              {item.specifications.map((spec, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Seller Reviews */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-4">Seller Reviews</h3>
            <div className="space-y-4">
              {item.reviews.map((review, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{review.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  {i < item.reviews.length - 1 && <div className="border-t border-border/50 pt-4" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <MarketplaceCheckoutModal
          item={{
            id: item.id,
            title: item.title,
            price: item.price,
            type: item.type,
            seller: item.seller.name,
            image: item.images[0],
          }}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowShare(false)} />
          <Card className="relative glass-card border-2 border-primary/30 p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Share Item</h3>
            <SocialShareButtons text={`Check out this ${item.title} on GoodRunss! Only $${item.price}`} size="md" />
            <Button variant="outline" onClick={() => setShowShare(false)} className="w-full mt-4">
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
