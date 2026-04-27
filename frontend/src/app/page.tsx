'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ApiCourse } from '@/lib/api';
import { getCourses } from '@/lib/api';
import CourseCard from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Compass, Search, SlidersHorizontal, Sparkles, RotateCcw, ArrowDownUp } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await getCourses();
        if (mounted) {
          setCourses(response.data || []);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load courses');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(courses.map((course) => (course.category || '').trim()).filter(Boolean)));
    return categories.sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const relevanceScore = (course: ApiCourse) => {
      if (!query) {
        return 0;
      }

      let score = 0;

      if (course.title.toLowerCase().includes(query)) score += 30;
      if ((course.description || '').toLowerCase().includes(query)) score += 20;
      if ((course.category || '').toLowerCase().includes(query)) score += 14;
      if ((course.instructor || '').toLowerCase().includes(query)) score += 10;

      return score;
    };

    const filtered = courses.filter((course) => {
      const matchesSearch =
        query.length === 0 ||
        course.title.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query) ||
        (course.category || '').toLowerCase().includes(query) ||
        (course.instructor || '').toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    const sorters: Record<string, (a: ApiCourse, b: ApiCourse) => number> = {
      relevance: (a, b) => relevanceScore(b) - relevanceScore(a),
      'name-asc': (a, b) => a.title.localeCompare(b.title),
      newest: (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    };

    return [...filtered].sort(sorters[sortBy] ?? sorters.relevance);
  }, [courses, searchTerm, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('relevance');
  };

  return (
    <div className="bg-background text-foreground">
      <section className="text-center py-20 px-4 bg-card border-b">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
          Find Your Perfect Course
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Navigate the world of education with Course Compass. Search thousands of courses from top universities to find the one that's right for you.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="#search">
              <Compass className="mr-2" /> Start Exploring
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/course-match">
              <Sparkles className="mr-2" /> AI Course Match
            </Link>
          </Button>
        </div>
      </section>

      <section id="search" className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="p-6 rounded-lg bg-card shadow-sm sticky top-24">
              <h3 className="font-headline text-2xl font-semibold mb-6 flex items-center gap-2 text-primary">
                <SlidersHorizontal />
                Filters
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="search-term" className="text-sm font-medium">Search by Keyword</label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search-term"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category" className="w-full mt-2">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="sort-by" className="text-sm font-medium flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4 text-accent" />
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by" className="w-full mt-2">
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="name-asc">Course Name: A to Z</SelectItem>
                      <SelectItem value="newest">Newest Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <h2 className="font-headline text-3xl font-bold mb-6 text-primary">
              {filteredCourses.length} Courses Found
            </h2>
            {isLoading && <p className="text-muted-foreground mb-4">Loading courses from backend...</p>}
            {loadError && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {loadError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
            {filteredCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center bg-card rounded-lg p-12 h-full">
                <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-primary">No Courses Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
