# Database Schema

## Prisma Schema
```prisma
// Data source
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model (integrates with Supabase Auth)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  role      String   @default("user")
  
  // Relationships
  questions Question[]
  responses Response[]
  srsData   SRSData[]
}

// Question model
model Question {
  id          String   @id @default(uuid())
  content     String
  category    String   // e.g., "PHP", "Laravel", "OOP"
  difficulty  String   // "easy", "medium", "hard"
  source      String?  // AI-generated or curated
  createdAt   DateTime @default(now())
  
  // Relationships
  responses Response[]
  srsData   SRSData[]
}

// Response model (voice/text answers)
model Response {
  id          String   @id @default(uuid())
  userId      String
  questionId  String
  content     String   // Text response or audio file path
  isCorrect   Boolean?
  analysis    Json?    // AI analysis metadata
  createdAt   DateTime @default(now())
  
  // Relationships
  user     User     @relation(fields: [userId], references: [id])
  question Question @relation(fields: [questionId], references: [id])
}

// SRS (Spaced Repetition) tracking
model SRSData {
  id           String   @id @default(uuid())
  userId       String
  questionId   String
  interval     Int      @default(1)  // Days until next review
  repetitions  Int      @default(0)  // Times reviewed
  easeFactor   Float    @default(2.5) // SRS difficulty factor
  nextReview   DateTime // Next review date
  stage        String   @default("learning") // learning, review, mastered
  
  // Relationships
  user     User     @relation(fields: [userId], references: [id])
  question Question @relation(fields: [questionId], references: [id])
}

// Readiness profile
model ReadinessProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  overallScore Float    @default(0.0)
  strengths    Json     // {category: score}
  weaknesses  Json     // {category: score}
  lastUpdated DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

## Key Relationships
1. **User-Question**: One-to-many (Users can have multiple questions)
2. **Question-Response**: One-to-many (Each question can have multiple responses)
3. **User-SRSData**: One-to-many (Each user has SRS schedules for questions)

## Indexes
```prisma
// Optimize common queries
@@index([userId, nextReview], name: "user_srs_schedule")
@@index([category, difficulty], name: "question_discovery")
@@index([userId, isCorrect], name: "performance_tracking")
```

## Supabase Integration
- Authentication via `auth.users` table
- Voice recordings stored in `storage.objects` bucket
- Row-level security enabled for all tables