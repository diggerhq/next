import { clsx, type ClassValue } from 'clsx';
import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSlug = (title: string) => {
  const slug = slugify(title, {
    lower: true,
    strict: true,
    replacement: '-',
  });
  return slug;
};

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
); //

export const ToTitleCase = (str: string) => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const ToSnakeCase = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.toLowerCase())
    .join('_');
};

export const getPricingCardWidth = (count: number) => {
  if (count === 1) return 'w-full';
  if (count === 2) return 'md:w-1/2';
  if (count === 3) return 'lg:w-1/3';
  return 'md:w-80 lg:w-96'; // Fixed width for overflow cases
};

export const isLocalEnvironment =
  process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');


export const generateSlugWithNanoId = (title: string, {
  withNanoIdSuffix = true,
  prefix = ''
}: {
  withNanoIdSuffix?: boolean
  prefix?: string
} = {}) => {
  const slug = slugify(title, {
    lower: true,
    strict: true,
    replacement: '-',
  });
  const withSuffix = withNanoIdSuffix ? `${slug}-${nanoid()}` : slug;
  return prefix ? `${prefix}-${withSuffix}` : withSuffix;
}

export const generateOrganizationSlug = (title: string) => {
  return generateSlugWithNanoId(title, {
    prefix: 'o',
    withNanoIdSuffix: true,
  });
}
