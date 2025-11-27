"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, DollarSign, Package, MapPin, CheckCircle } from "lucide-react"
import Image from "next/image"

export function ListItemScreen() {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "photos" | "pricing" | "success">("details")
  const [listingType, setListingType] = useState<"sell" | "rent">("sell")
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    rentalPeriod: "day",
    zipCode: "",
  })

  const categories = ["Basketball", "Tennis", "Soccer", "Golf", "Volleyball", "Pickleball", "Other"]
  const conditions = ["New", "Like New", "Good", "Fair"]
  const rentalPeriods = [
    { value: "day", label: "Per Day" },
    { value: "week", label: "Per Week" },
    { value: "month", label: "Per Month" },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    setStep("success")
    setTimeout(() => {
      router.push("/mobile/marketplace")
    }, 2000)
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card border-2 border-primary/30 p-8 max-w-md w-full text-center glow-primary">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Item Listed!</h2>
          <p className="text-muted-foreground">
            Your item has been listed successfully. Buyers in your area can now see it.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">List Item</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {["details", "photos", "pricing"].map((s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : ["details", "photos", "pricing"].indexOf(step) > index
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    ["details", "photos", "pricing"].indexOf(step) > index ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === "details" && (
          <div className="space-y-6">
            <Card className="glass-card border-primary/30 p-6">
              <h3 className="font-bold text-lg mb-4">Listing Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setListingType("sell")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    listingType === "sell" ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="font-semibold">Sell</span>
                </button>
                <button
                  onClick={() => setListingType("rent")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    listingType === "rent" ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="font-semibold">Rent</span>
                </button>
              </div>
            </Card>

            <Card className="glass-card border-primary/30 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Wilson Basketball - Like New"
                  className="glass-card border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 rounded-lg glass-card border border-border/50 bg-background"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2 rounded-lg glass-card border border-border/50 bg-background"
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your item..."
                  rows={4}
                  className="glass-card border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="10001"
                    maxLength={5}
                    className="pl-10 glass-card border-border/50"
                  />
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              onClick={() => setStep("photos")}
              disabled={!formData.title || !formData.category || !formData.condition || !formData.zipCode}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === "photos" && (
          <div className="space-y-6">
            <Card className="glass-card border-primary/30 p-6">
              <h3 className="font-bold text-lg mb-2">Add Photos</h3>
              <p className="text-sm text-muted-foreground mb-4">Add up to 5 photos of your item</p>

              <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={img || "/placeholder.svg"} alt={`Upload ${index + 1}`} fill className="object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-background/80 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </label>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button size="lg" variant="outline" onClick={() => setStep("details")} className="flex-1 glass-card">
                Back
              </Button>
              <Button
                size="lg"
                onClick={() => setStep("pricing")}
                disabled={images.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === "pricing" && (
          <div className="space-y-6">
            <Card className="glass-card border-primary/30 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="pl-10 glass-card border-border/50"
                  />
                </div>
              </div>

              {listingType === "rent" && (
                <div className="space-y-2">
                  <Label htmlFor="rentalPeriod">Rental Period</Label>
                  <select
                    id="rentalPeriod"
                    value={formData.rentalPeriod}
                    onChange={(e) => setFormData({ ...formData, rentalPeriod: e.target.value })}
                    className="w-full p-2 rounded-lg glass-card border border-border/50 bg-background"
                  >
                    {rentalPeriods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Card>

            <Card className="glass-card border-primary/30 p-6">
              <h3 className="font-bold mb-3">Listing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-semibold capitalize">{listingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-semibold">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    ${formData.price}
                    {listingType === "rent" && ` per ${formData.rentalPeriod}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-semibold">{images.length}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button size="lg" variant="outline" onClick={() => setStep("photos")} className="flex-1 glass-card">
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!formData.price}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
              >
                List Item
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
