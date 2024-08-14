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

export const isLocalEnvironment =
  process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');
