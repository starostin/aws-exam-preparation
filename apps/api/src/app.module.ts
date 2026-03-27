import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './config/app.config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudyPlansModule } from './modules/study-plans/study-plans.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { MockExamsModule } from './modules/mock-exams/mock-exams.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { ProgressModule } from './modules/progress/progress.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { GamificationModule } from './modules/gamification/gamification.module';

@Module({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], cache: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    StudyPlansModule,
    MaterialsModule,
    QuizzesModule,
    MockExamsModule,
    FlashcardsModule,
    ProgressModule,
    RecommendationsModule,
    GamificationModule,
  ],
})
export class AppModule {}
