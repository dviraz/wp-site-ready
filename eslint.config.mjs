import js from '@eslint/js';

export default [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',
        
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        requestAnimationFrame: 'readonly',
        IntersectionObserver: 'readonly',
        AbortController: 'readonly',
        gtag: 'readonly',
        
        // App-specific globals
        marketBoostCart: 'writable',
        wooAPI: 'writable'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  },
  {
    ignores: [
      'playwright-report',
      'test-results',
      'node_modules',
      'dist',
      'build',
      'verify-logs',
      'public/**',
      'tests/**',
      'js/roi-calculator.js',
      'js/service-detail.js',
      'js/services.js',
      'js/main.js',
      'record.mjs'
    ]
  }
];