import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookText, Clock3, Layers, UserRound, CalendarDays } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface DetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="text-accent mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  </div>
);

async function getCourse(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to load course');
  }

  return response.json();
}

export default async function CourseDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>

        <Card className="overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-card">
            <Badge variant="secondary" className="w-fit mb-2">{course.category || 'General'}</Badge>
            <CardTitle className="font-headline text-4xl text-primary">{course.title}</CardTitle>
            <CardDescription className="text-lg flex items-center gap-2 pt-2">
              <UserRound className="h-5 w-5" /> {course.instructor || 'Instructor not specified'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            <div>
              <h3 className="font-headline text-2xl font-semibold mb-4 text-primary">Overview</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{course.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<BookText />} label="Course ID" value={course.course_id || 'Not provided'} />
              <DetailItem icon={<Layers />} label="Category" value={course.category || 'General'} />
              <DetailItem icon={<Clock3 />} label="Duration" value={course.duration || 'Not provided'} />
              <DetailItem
                icon={<CalendarDays />}
                label="Created At"
                value={course.createdAt ? new Date(course.createdAt).toLocaleString('en-US') : 'Not available'}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
