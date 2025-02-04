import { defineConfig, defaultConfig, createSystem } from "@chakra-ui/react"
const config = defineConfig({
    theme: {
        semanticTokens: {
            colors: {
                bg: {
                    DEFAULT: {
                        value: { _light: "{colors.white}", _dark: "none" }, // Custom background
                    },
                },
                fg: {
                    DEFAULT: {
                        value: { _light: "{colors.black}", _dark: "{colors.white}" },
                    },
                },
            },
        },
    },
})
export const system = createSystem(defaultConfig, config)