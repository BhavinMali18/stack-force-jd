# skills.py — Canonical tech skill dictionary for resume parsing
# Mirrors the Node.js skillDictionary.js exactly so scores are consistent.
# Match is case-insensitive, whole-word boundary match.

SKILL_DICTIONARY = [
    # Programming Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust",
    "swift", "kotlin", "ruby", "php", "scala", "r", "dart", "elixir", "haskell",
    "perl", "lua", "matlab", "cobol", "fortran", "assembly", "vba", "objective-c",

    # Frontend Frameworks & Libraries
    "react", "reactjs", "vue", "vuejs", "angular", "svelte", "nextjs", "next.js",
    "nuxtjs", "gatsby", "remix", "astro", "alpine.js", "lit", "preact", "solidjs",

    # Frontend Core
    "html", "html5", "css", "css3", "sass", "scss", "less", "styled-components",
    "tailwindcss", "tailwind", "bootstrap", "material-ui", "mui", "chakra-ui",
    "ant design", "shadcn", "radix-ui", "framer-motion", "gsap",

    # State Management
    "redux", "mobx", "zustand", "recoil", "jotai", "context api",

    # Build Tools
    "webpack", "vite", "rollup", "parcel", "babel", "esbuild",
    "eslint", "prettier", "storybook", "turborepo",

    # Testing
    "jest", "vitest", "cypress", "playwright", "testing library", "mocha", "chai",
    "supertest", "karma", "jasmine",

    # Backend Frameworks
    "nodejs", "node.js", "express", "expressjs", "fastify", "nestjs", "hapi",
    "koa", "django", "flask", "fastapi", "spring", "spring boot", "spring mvc",
    "rails", "ruby on rails", "laravel", "symfony", "asp.net", "asp.net core",
    ".net", "gin", "fiber", "echo", "actix", "axum", "phoenix",

    # Databases — Relational
    "postgresql", "postgres", "mysql", "mariadb", "sqlite", "mssql", "oracle",

    # Databases — NoSQL
    "mongodb", "redis", "cassandra", "couchdb", "dynamodb", "firestore",
    "elasticsearch", "opensearch", "neo4j", "influxdb",

    # ORMs & Query Builders
    "prisma", "sequelize", "typeorm", "mongoose", "drizzle", "knex", "sqlalchemy",

    # Cloud
    "aws", "amazon web services", "azure", "gcp", "google cloud",
    "ec2", "s3", "lambda", "cloudfront", "rds", "ecs", "eks", "sqs", "sns",
    "api gateway", "cloudwatch", "route53", "iam", "vpc",

    # DevOps & CI/CD
    "docker", "kubernetes", "k8s", "helm", "terraform", "ansible", "puppet", "chef",
    "jenkins", "github actions", "gitlab ci", "circleci", "travis ci", "argocd",
    "nginx", "apache", "caddy", "traefik", "prometheus", "grafana", "datadog",
    "new relic", "sentry",

    # Version Control
    "git", "github", "gitlab", "bitbucket", "svn", "mercurial",

    # Mobile
    "react native", "flutter", "ionic", "xamarin", "android", "ios", "expo",
    "jetpack compose", "swiftui",

    # Data Engineering & Analytics
    "apache spark", "hadoop", "kafka", "flink", "airflow", "dbt",
    "snowflake", "bigquery", "redshift", "databricks", "hive", "pig",
    "tableau", "power bi", "looker", "metabase",

    # Data Science & ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "sklearn", "xgboost", "lightgbm", "catboost",
    "pandas", "numpy", "matplotlib", "seaborn", "plotly", "scipy",
    "jupyter", "nlp", "computer vision", "reinforcement learning",
    "mlflow", "ray", "optuna",

    # APIs & Protocols
    "rest", "restful", "rest api", "graphql", "grpc", "websocket", "websockets",
    "trpc", "soap", "oauth", "oauth2", "openid", "jwt",

    # Security
    "cybersecurity", "penetration testing", "owasp", "ssl", "tls", "https",
    "cryptography", "zero trust", "soc2",

    # Architecture & Practices
    "microservices", "monorepo", "serverless", "event-driven", "cqrs",
    "system design", "data structures", "algorithms", "design patterns", "solid",
    "clean architecture", "ddd", "tdd", "bdd",
    "ci/cd", "devops", "sre", "agile", "scrum", "kanban", "jira",

    # Design & Tools
    "figma", "adobe xd", "sketch", "invision", "ui/ux", "ux design",
    "product management", "technical writing", "documentation",

    # Emerging
    "blockchain", "solidity", "web3", "smart contracts", "ethereum", "solana",
    "iot", "embedded systems", "arduino", "raspberry pi",
    "ar/vr", "unity", "unreal engine", "webgl", "threejs", "three.js",
]
