const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configuration du serveur de développement
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  },

  // Configuration des chemins
  publicPath: '/',
  
  // Configuration des alias
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },

  // Configuration CSS
  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            ['tailwindcss', {}],
            ['autoprefixer', {}],
          ],
        },
      },
    },
  },

  // Performance
  productionSourceMap: false,
  
  // Optimisations pour Docker
  chainWebpack: config => {
    // Optimiser le watching des fichiers dans Docker
    config.watchOptions({
      poll: 1000,
      ignored: /node_modules/
    })
  }
})
