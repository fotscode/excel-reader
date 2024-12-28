import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        alias: {
            '@application': 'src/application',
            '@domain': 'src/domain',
            '@infrastructure': 'src/infrastructure',
            '@interface': 'src/interface',
            '@shared': 'src/shared',
        },
    },
})
