# API Routes (generated 2026-07-18)
# 39 routes total.

## admin
POST         /api/admin/create-content [db]
POST         /api/admin/delete-content
GET          /api/admin/lesson-details
POST         /api/admin/mathdle/assign [db]
GET          /api/admin/mathdle/assignments
GET          /api/admin/mathdle/month-status
GET          /api/admin/structure/:courseId
GET          /api/admin/task-structure [db]
POST         /api/admin/tasks/assign
POST         /api/admin/tasks/create
DELETE       /api/admin/tasks/delete
GET          /api/admin/tasks/task-groups
PUT          /api/admin/tasks/update
POST         /api/admin/update-content

## auth
POST         /api/auth/logout
POST         /api/auth/send-code
POST         /api/auth/verify-code

## chapters
GET          /api/chapters

## courses
GET          /api/courses

## full-course-data
GET          /api/full-course-data

## lessons
GET          /api/lessons

## mathdle
GET          /api/mathdle/status
POST         /api/mathdle/submit [db]
GET          /api/mathdle/today [db]

## ranking
GET          /api/ranking

## task_groups
GET          /api/task_groups

## task_matching_pairs
GET          /api/task_matching_pairs

## task_matching_pairs_items
GET          /api/task_matching_pairs_items

## task_multiple_choice
GET          /api/task_multiple_choice

## task_multiple_choice_answers
GET          /api/task_multiple_choice_answers

## task_single_input
GET          /api/task_single_input

## task_step_by_step
GET          /api/task_step_by_step

## task_step_by_step_steps
GET          /api/task_step_by_step_steps

## task_types
GET          /api/task_types

## tasks
GET          /api/tasks [db]
POST         /api/tasks/complete

## topics
GET          /api/topics

## user
GET,PATCH    /api/user/profile

## videos
GET          /api/videos
