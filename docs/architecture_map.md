# PrepAI Architecture Map

| Feature Area          | Implementation Files                                                                 | Status                |
|-----------------------|-------------------------------------------------------------------------------------|-----------------------|
| User Authentication   | src/app/api/auth/login/route.ts<br>src/app/api/auth/register/route.ts<br>src/app/api/auth/signout/route.ts<br>src/components/SignInForm.tsx<br>src/components/SignUpForm.tsx | [IMPLEMENTED]         |
| Topic Selection       | src/components/RoleSelect.tsx<br>src/components/TopicFilter.tsx<br>src/app/api/objectives/route.ts | [IMPLEMENTED]         |
| Question Generation   | src/lib/questionGenerator.ts<br>src/app/api/generate-question/route.ts<br>src/lib/types/question.ts | [PARTIALLY IMPLEMENTED] |
| Voice Answering       | src/components/VoiceRecorder.tsx | [PARTIALLY IMPLEMENTED] |
| SRS Modes            | src/lib/srs.ts<br>src/components/SRSControls.tsx | [PARTIALLY IMPLEMENTED] |
| Progress Analytics    | src/components/ProgressDashboard.tsx<br>src/components/AnalyticsCharts.tsx | [PARTIALLY IMPLEMENTED] |
| PDF Export           | src/components/ReportGenerator.tsx<br>src/lib/pdf.ts | [PLANNED]             |[BLOCKED] Type inconsistencies between question generator and SRS system
