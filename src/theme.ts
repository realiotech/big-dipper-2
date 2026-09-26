import { defineConfig, defaultConfig, createSystem } from "@chakra-ui/react"

// Colour tokens from the Realio Explorer Figma redesign. Each token has a
// light and a dark value, so components use `explorer.*` and never branch on
// the colour mode themselves.
const config = defineConfig({
    theme: {
        recipes: {
            // Chakra's link recipe draws its focus ring on any :focus, so every
            // clicked link got an outline. Keep the ring for keyboard focus only.
            link: {
                base: {
                    focusRing: "none",
                    focusVisibleRing: "outside",
                },
            },
        },
        semanticTokens: {
            colors: {
                explorer: {
                    page: { value: { _light: "#FFFFFF", _dark: "#070C0E" } },
                    card: { value: { _light: "#FFFFFF", _dark: "#0C1317" } },
                    inset: { value: { _light: "#F5F6F6", _dark: "#111A1F" } },
                    border: { value: { _light: "#D8DEE1", _dark: "#162026" } },
                    text: { value: { _light: "#070C0E", _dark: "#EEF3F4" } },
                    muted: { value: { _light: "#767F84", _dark: "#7B878D" } },
                    link: { value: { _light: "#5D5FEF", _dark: "#9293DA" } },
                    accent: { value: { _light: "#5D5FEF", _dark: "#5D5FEF" } },
                    accentSubtle: { value: { _light: "#EBEBFD", _dark: "#1B2339" } },
                    success: { value: { _light: "#107448", _dark: "#D6FFD1" } },
                    successMuted: { value: { _light: "#2E855F", _dark: "#BDE3BB" } },
                    danger: { value: { _light: "#C2410C", _dark: "#FDBA74" } },
                    evm: { value: { _light: "#BF4A86", _dark: "#EF5DA8" } },
                    chart1: { value: { _light: "#5D5FEF", _dark: "#5D5FEF" } },
                    chart2: { value: { _light: "#BF4A86", _dark: "#EF5DA8" } },
                    chart3: { value: { _light: "#7879F1", _dark: "#A5A6F6" } },
                    chart4: { value: { _light: "#2E855F", _dark: "#8CA98E" } },
                    button: { value: { _light: "#070C0E", _dark: "#FFFFFF" } },
                    buttonText: { value: { _light: "#FFFFFF", _dark: "#070C0E" } },
                },
            },
        },
    },
})
export const system = createSystem(defaultConfig, config)
