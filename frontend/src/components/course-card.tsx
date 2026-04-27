import Link from 'next/link';
import type { ApiCourse } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, UserRound } from 'lucide-react';

interface CourseCardProps {
  course: ApiCourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline text-xl leading-tight">
          <Link href={`/courses/${course._id}`} className="hover:text-accent transition-colors">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <UserRound className="h-4 w-4" /> {course.instructor || 'Instructor not specified'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.description || 'No description available for this course yet.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{course.category || 'General'}</Badge>
          <Badge variant="secondary">{course.duration || 'Duration not set'}</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span>
              Uploaded: {course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US') : 'Unknown'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        <Button asChild className="w-full" variant="outline">
          <Link href={`/courses/${course._id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
