'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import TopicCard from "@/app/dashboard/components/TopicComponents/TopicCard/TopicCard";
import TopicInfo from "@/app/dashboard/components/TopicComponents/TopicInfo/TopicInfo";
import { useCourseData } from "@/app/context/CourseContext"; // Importujemy Context

export default function TopicPage() {
  const { courseSlug, chapterSlug } = useParams();
  
  const { fullCourseData, loading } = useCourseData();

  if (loading || !fullCourseData) return <p>Ładowanie struktury kursu...</p>;

  const course = fullCourseData.course;
  const chapter = fullCourseData.structure.find(c => c.slug === chapterSlug);

  if (!chapter) return <p>Nie znaleziono rozdziału w tym kursie</p>;

  const topics = chapter.topics;

  return (
    <div>
      <TopicInfo
        chapterName={chapter.title}
        progress={chapter.progress || 0}
        link={`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topics[0]?.slug || ''}`}
        backgroundColor={course.color}
        count={chapter.sort_order}
      >
        {topics.map((topic, index) => (
          <Link
            key={topic.topic_id}
            href={`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topic.slug}`}
            style={{ textDecoration: "none", width: "100%" }}
          >
            <div>
              <TopicCard
                title={topic.title}
                backgroundColor={course.color}
                progress={topic.progress || 0} 
                count={index + 1}
              />
            </div>
          </Link>
        ))}
      </TopicInfo>
    </div>
  );
}