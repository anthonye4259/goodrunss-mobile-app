import { Image, StyleSheet } from "react-native"

interface GoodRunssLogoProps {
    variant?: "black" | "white"
    size?: "small" | "medium" | "large"
}

export function GoodRunssLogo({ variant = "white", size = "medium" }: GoodRunssLogoProps) {
    const logoSource = variant === "black"
        ? require("@/assets/images/goodrunss-logo-black.png")
        : require("@/assets/images/goodrunss-logo-white.png")

    const sizeMap = {
        small: { width: 80, height: 80 },
        medium: { width: 120, height: 120 },
        large: { width: 160, height: 160 },
    }

    return (
        <Image
            source={logoSource}
            style={[styles.logo, sizeMap[size]]}
            resizeMode="contain"
        />
    )
}

const styles = StyleSheet.create({
    logo: {
        // Base styles
    },
})
