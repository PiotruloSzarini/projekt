# Pages (generated 2026-07-18)
# 23 pages. [client]=client component, [server]=server component.

[server]   /                                                  async
[server]   /admin                                             AdminPage
[server]   /admin/dashboard                                   AdminDashboard
[client]   /admin/dashboard/courses                           AdminCoursesList
[client]   /admin/dashboard/courses/:courseId                 AdminCourseEdit
[client]   /admin/dashboard/mathdle                           MathdlePage
[client]   /admin/dashboard/tasks                             TaskDatabase
[client]   /dashboard                                         MyProgressPage
[server]   /dashboard/egzaminy                                EgzaminyPage (mostly static/hardcoded)
[server]   /dashboard/egzaminy/:examSlug                      async
[server]   /dashboard/egzaminy/:examSlug/:paperSlug           async
[client]   /dashboard/kursy                                   KursyPage
[client]   /dashboard/kursy/:courseSlug                       ChapterPage
[client]   /dashboard/kursy/:courseSlug/:chapterSlug          TopicPage
[client]   /dashboard/kursy/:courseSlug/:chapterSlug/:topicSlug TopicLessonsPage
[client]   /dashboard/mathdle                                 MathdleUserPage
[client]   /dashboard/plan-nauki                              PlanNaukiPage
[client]   /dashboard/profil                                  ProfilePage
[client]   /dashboard/ranking                                 RankingPage
[client]   /dashboard/sklep                                   ShopPage
[server]   /dashboard/slabe-punkty                            SlabePunktyPage
[client]   /login                                             LoginPage
[server]   /sklep                                             SklepRedirectPage
