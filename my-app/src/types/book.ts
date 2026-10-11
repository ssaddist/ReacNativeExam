export type ShelfType = 'reading' | 'wantToRead' | 'read';

export interface BookNote {
  id: string;
  title: string;
  content: string;
  pageRef?: number;
  createdAt: string;
  rating?: number;
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  coverId?: number;
  totalPages: number;
  currentPage: number;
  shelf: ShelfType;
  description?: string;
  firstPublishYear?: number;
  publisher?: string;
  subjects?: string[];
  userRating?: number;
  notes: BookNote[];
  isFavorite: boolean;
  dateAdded: string;
  dateFinished?: string;
}

export interface ReadingGoal {
  targetBooks: number;
  targetPagesMonth: number;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
  edition_count?: number;
}
