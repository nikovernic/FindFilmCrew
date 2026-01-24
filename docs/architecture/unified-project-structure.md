# Unified Project Structure


```
crew-up/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yml             # Continuous integration
│       └── deploy.yml         # Deployment
├── apps/
│   └── web/                   # Next.js application
│       ├── app/               # App Router
│       │   ├── (public)/      # Public routes
│       │   ├── (auth)/        # Auth-protected routes
│       │   └── api/           # API routes
│       ├── components/        # React components
│       ├── lib/               # Utilities and services
│       ├── types/             # TypeScript types
│       ├── hooks/             # Custom hooks
│       ├── public/            # Static assets
│       ├── tests/             # Tests
│       ├── next.config.js     # Next.js config
│       ├── tailwind.config.js # Tailwind config
│       └── package.json
├── packages/
│   └── shared/                # Shared code
│       ├── src/
│       │   ├── types/         # Shared TypeScript types
│       │   ├── constants/     # Shared constants
│       │   └── utils/         # Shared utilities
│       └── package.json
├── docs/                      # Documentation
│   ├── prd/
│   │   └── prd.md
│   └── architecture.md
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # Workspace config
└── README.md
```

