import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "JsonSageAI",
  description: "AI agent framework for JSON schema generation",
  base: '/json-sage-workflow/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' }
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Schema Generation', link: '/guide/schema-generation' },
          { text: 'Field Descriptions', link: '/guide/field-descriptions' },
          { text: 'Example Values', link: '/guide/example-values' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'JsonSageAI', link: '/api/json-sage-ai' },
          { text: 'SchemaAgent', link: '/api/schema-agent' },
          { text: 'DescriptionAgent', link: '/api/description-agent' },
          { text: 'ExampleAgent', link: '/api/example-agent' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hongping1963-source/json-sage-workflow' }
    ]
  }
})
