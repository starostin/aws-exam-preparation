# AWS Exam Prep App Feature List

## Product Goal

A web application that helps users prepare daily for the AWS Certified Solutions Architect - Associate (SAA-C03) exam by combining study materials, guided daily tasks, practice tools, and progress tracking in one place.

The first version should focus on SAA-C03, but the product structure should allow support for additional AWS certifications later.

## Target User

This app is for individual learners who want a structured, daily study workflow and a clear view of their preparation progress.

## Core Features

### 1. Daily Study Dashboard

- Show a personalized daily study plan each time the user opens the app
- Present clear tasks for the day, such as reading a topic, completing a quiz, reviewing flashcards, or taking part of a mock exam
- Include quizzes in the study plan both as follow-up tasks after learning a topic and as standalone practice tasks in the regular daily schedule
- Track which daily tasks are complete, in progress, or still pending
- Carry unfinished tasks into the next day when appropriate
- Allow users to pull and work on tasks from future days for self-paced flexibility
- Give the user a quick summary of what to study today and why it was recommended

### 2. Preparation Timeline & Goals Setup

- Allow users to define their target exam date or total preparation time (e.g., 2 weeks, 4 weeks, 8 weeks)
- Let users specify their daily study commitment in hours (e.g., 1 hour, 2 hours, 4 hours per day)
- Calculate total available study hours based on selected timeline and daily commitment
- Provide an evaluation assessment of the preparation plan (e.g., "2 weeks with 2 hours/day = below recommended", "4 weeks with 3 hours/day = good preparation")
- Adjust the daily study plan based on the timeline and daily hours to ensure realistic task distribution
- Allow users to update their preparation goals and timeline at any time
- Show progress toward their deadline and whether they're on track to complete preparation

### 4. Exam Topic Structure

- Organize learning content by AWS SAA-C03 exam domains and topics
- Let users browse topics in a structured curriculum
- Show topic status such as not started, in progress, and completed
- Keep the content model flexible enough to support other certifications later

### 3. Theory and Study Materials

- Provide in-app topic summaries and theory notes for each major exam area
- Include practical explanations for core AWS concepts and services
- Add curated links to useful external resources such as AWS documentation, videos, and articles
- Keep all important learning materials accessible from within the app
- Recommend high-quality external courses (e.g., Udemy, A Cloud Guru, Linux Academy, etc.) with links and descriptions
- Include information about paid practice test platforms (e.g., Whizlabs, TutorialsDojo, Examtopics)
- Provide guidance on which external resources align with each exam domain and topic
- Display whether resources are free or paid and provide purchasing links where applicable
- Allow users to track which external courses and tests they've purchased or completed
- Include AWS official resources, study guides, and AWS training recommendations

### 5. Practice Quizzes

- Offer quizzes for individual topics and domains
- Add quizzes to the study plan so they can appear immediately after studying a related topic or as normal scheduled practice items
- Show instant feedback after answering each question or after quiz completion
- Include explanations for both correct and incorrect answers
- Track user performance for every quiz
- Allow repeated practice to improve weak areas

### 6. Full Mock Exams

- Include full-length mock exams that simulate the real certification experience
- Support timed exam sessions
- Show overall score and domain-level performance after completion
- Let users review all questions and explanations after finishing a mock exam

### 7. Flashcards and Smart Review

- Provide flashcards for important AWS concepts, services, best practices, and common exam traps
- Support spaced repetition for long-term retention
- Schedule reviews automatically based on user performance
- Recommend review sessions for previously learned topics

### 8. Progress Tracking

- Show overall exam preparation progress
- Track completion by topic and by exam domain
- Track quiz results over time
- Track mock exam results over time
- Track study time and completed study sessions
- Show study history in a calendar-style view

### 9. Readiness Score

- Show a readiness or confidence score that reflects how prepared the user is for the exam
- Base the score on quiz results, mock exam performance, topic completion, and review consistency
- Help users understand whether they are improving and which areas still need work

### 10. Weak-Area Recommendations

- Detect weak topics based on quiz and mock exam performance
- Recommend what to study next based on mistakes and incomplete areas
- Use the weak-area data to improve the daily plan
- Prioritize review and practice where the user needs the most improvement

### 11. Streaks and Motivation

- Track daily study streaks
- Show milestone progress such as number of completed quizzes, finished topics, or study days
- Award badges for important achievements
- Use light gamification to encourage daily consistency without overcomplicating the app

### 12. User Authentication and Authorization

- Allow users to create secure accounts with email and password
- Support secure login with session management
- Protect user data with proper access controls
- Enable users to update their account information and change passwords
- Restrict access to learning content and progress data to authenticated users only
- Support password reset functionality for account recovery
- Implement role-based access control if needed for future admin or instructor features

## Similar-App Inspired Features

The app should borrow selected patterns from effective learning and habit-tracking products:

- Personalized daily plans
- Smart review scheduling
- Weak-area based recommendations
- Progress visualization
- Streak tracking
- Achievement badges

These features should support focused solo learning rather than social competition.

## MVP Scope

The first version should include:

- Web app only
- SAA-C03 as the primary certification
- Daily study dashboard
- Topic-based curriculum structure
- Theory notes and study materials
- Practice quizzes
- Full mock exams
- Flashcards with spaced repetition
- Progress tracking dashboard
- Readiness score
- Weak-area recommendations
- Streaks and badges

## Out of Scope for Now

The following should not be part of the first approved scope:

- Social features
- Leaderboards
- Study groups
- Community discussion features
- Real-time collaboration
- Detailed admin tools
- Tech stack decisions
- Implementation details

## Future Expansion

The product should be designed so it can later support:

- Additional AWS certifications
- Shared progress tracking across certifications
- Expanded study analytics
- More advanced personalization
- Mobile experience in a later phase
