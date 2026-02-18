'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import TopicCard from "@/app/dashboard/components/TopicComponents/TopicCard/TopicCard";
import TopicInfo from "@/app/dashboard/components/TopicComponents/TopicInfo/TopicInfo";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default function TopicPage() {
  const { courseSlug, chapterSlug, topicSlug } = useParams();

  const {
    getCourseBySlug,
    getChapterBySlug,
    getTopicsByChapterId
  } = useCourseNavigation();

  // Pobieramy kurs
  const course = getCourseBySlug(courseSlug);
  if (!course) return <p>Nie znaleziono kursu</p>;

  // Pobieramy rozdział
  const chapter = getChapterBySlug(course.course_id, chapterSlug);
  if (!chapter) return <p>Nie znaleziono rozdziału</p>;

  // Pobieramy temat
  const topics = getTopicsByChapterId(chapter.chapter_id);
  if (!topics) return <p>Nie znaleziono tematu</p>;

  const chapterOrder = chapter.sort_order;

  return (
    <div>
      <TopicInfo
        chapterName={chapter.title}
        progress={50} // placeholder progress
        link={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topics[0].slug}`} // link do pierwszego tematu
        backgroundColor={course.color}
        count={chapterOrder} // numer rozdziału
      >
        {topics.map((topic, index) => {
        return (
          <Link
            key={topic.topic_id}
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}`}
            style={{ textDecoration: "none", width: "100%" }}
          >
            <div>
              <TopicCard
                title={topic.title}
                backgroundColor={course.color}
                progress={50} // placeholder progress
                count={index + 1}
              />
            </div>
          </Link>
        );
      })}
      </TopicInfo>
    </div>
  );
}
