import { Button } from '@/components/ui/button';
import { Table } from '@/types';
import Link from 'next/link';

export function TagsNav({
  tags,
}: {
  tags: Table<'internal_blog_post_tags'>[];
}) {
  return (
    <div className="space-x-2 flex px-4 sm:px-0 flex-wrap justify-center">
      <Link href="/blog">
        <Button variant="outline" className="mr-2 mb-2">
          All
        </Button>
      </Link>

      {tags.map((tag) => (
        <Link href={`/blog/tag/${tag.slug}`} key={tag.id}>
          <Button variant="outline" className="mr-2 mb-2">
            {tag.name}
          </Button>
        </Link>
      ))}
    </div>
  );
}
