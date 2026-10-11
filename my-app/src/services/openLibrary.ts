import { OpenLibraryDoc } from '@/types/book';

const BASE_URL = 'https://openlibrary.org';

export const getCoverUrl = (coverId?: number, size: 'S' | 'M' | 'L' = 'M'): string | undefined => {
  if (!coverId || coverId <= 0) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const normalizeWorkId = (key: string): string => {
  return key.replace('/works/', '').replace('/', '');
};

export interface SearchOptions {
  query: string;
  type?: 'all' | 'title' | 'author';
  page?: number;
}

export const searchOpenLibrary = async ({
  query,
  type = 'all',
  page = 1,
}: SearchOptions): Promise<OpenLibraryDoc[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let param = 'q';
  if (type === 'title') param = 'title';
  if (type === 'author') param = 'author';

  const url = `${BASE_URL}/search.json?${param}=${encodeURIComponent(
    trimmed
  )}&page=${page}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median,subject,edition_count`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Помилка сервера Open Library (${response.status})`);
    }

    const data = await response.json();
    return (data.docs || []).filter((doc: OpenLibraryDoc) => doc.title && doc.key);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Час очікування відповіді сервера вичерпано. Перевірте зʼєднання.');
    }
    throw new Error(err.message || 'Не вдалося завантажити результати пошуку');
  }
};

export interface WorkDetails {
  id: string;
  title: string;
  description: string;
  covers: number[];
  subjects: string[];
  firstPublishDate?: string;
  firstPublishYear?: number;
  authors: string[];
  totalPages?: number;
  publisher?: string;
}

export const fetchWorkDetails = async (rawId: string): Promise<WorkDetails> => {
  const workId = normalizeWorkId(rawId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const [workRes, editionsRes, searchRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/works/${workId}.json`, { signal: controller.signal }),
      fetch(`${BASE_URL}/works/${workId}/editions.json?limit=15`, { signal: controller.signal }),
      fetch(
        `${BASE_URL}/search.json?q=key:/works/${workId}&fields=number_of_pages_median,first_publish_year,cover_i&limit=1`,
        { signal: controller.signal }
      ),
    ]);

    clearTimeout(timeoutId);

    if (workRes.status !== 'fulfilled' || !workRes.value.ok) {
      const status = workRes.status === 'fulfilled' ? workRes.value.status : 500;
      throw new Error(`Книгу не знайдено на сервері Open Library (${status})`);
    }

    const data = await workRes.value.json();

    let description = '';
    if (typeof data.description === 'string') {
      description = data.description;
    } else if (data.description && typeof data.description.value === 'string') {
      description = data.description.value;
    }

    description = description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();

    let realPages: number | undefined;
    let realPublisher: string | undefined;
    const editionCovers: number[] = [];

    if (editionsRes.status === 'fulfilled' && editionsRes.value.ok) {
      try {
        const edData = await editionsRes.value.json();
        if (Array.isArray(edData.entries)) {
          const pageNumbers: number[] = [];
          for (const entry of edData.entries) {
            if (typeof entry.number_of_pages === 'number' && entry.number_of_pages > 0) {
              pageNumbers.push(entry.number_of_pages);
            }
            if (!realPublisher && Array.isArray(entry.publishers) && entry.publishers[0]) {
              realPublisher = entry.publishers[0];
            }
            if (Array.isArray(entry.covers)) {
              for (const c of entry.covers) {
                if (typeof c === 'number' && c > 0) editionCovers.push(c);
              }
            }
          }
          if (pageNumbers.length > 0) {
            pageNumbers.sort((a, b) => a - b);
            realPages = pageNumbers[Math.floor(pageNumbers.length / 2)];
          }
        }
      } catch {}
    }

    let searchYear: number | undefined;
    if (searchRes.status === 'fulfilled' && searchRes.value.ok) {
      try {
        const sData = await searchRes.value.json();
        const doc = sData.docs?.[0];
        if (doc) {
          if (!realPages && typeof doc.number_of_pages_median === 'number' && doc.number_of_pages_median > 0) {
            realPages = doc.number_of_pages_median;
          }
          if (typeof doc.first_publish_year === 'number' && doc.first_publish_year > 0) {
            searchYear = doc.first_publish_year;
          }
        }
      } catch {}
    }

    let parsedYear = searchYear;
    if (!parsedYear && data.first_publish_date) {
      const match = String(data.first_publish_date).match(/\b(1\d{3}|20\d{2})\b/);
      if (match) {
        parsedYear = parseInt(match[0], 10);
      }
    }

    const allCovers = [
      ...(Array.isArray(data.covers) ? data.covers : []),
      ...editionCovers,
    ].filter((c): c is number => typeof c === 'number' && c > 0);

    let authors: string[] = [];
    if (Array.isArray(data.authors) && data.authors.length > 0) {
      const authorPromises = data.authors.slice(0, 3).map(async (authorItem: any) => {
        try {
          const authorKey = authorItem.author?.key;
          if (!authorKey) return null;
          const aRes = await fetch(`${BASE_URL}${authorKey}.json`);
          if (aRes.ok) {
            const aData = await aRes.json();
            return aData.name || null;
          }
        } catch {
          return null;
        }
        return null;
      });

      const fetchedAuthors = await Promise.all(authorPromises);
      authors = fetchedAuthors.filter((name): name is string => Boolean(name));
    }

    return {
      id: workId,
      title: data.title || 'Без назви',
      description: description || 'Опис цієї книги наразі відсутній у каталозі Open Library.',
      covers: allCovers,
      subjects: Array.isArray(data.subjects) ? data.subjects.slice(0, 8) : [],
      firstPublishDate: data.first_publish_date,
      firstPublishYear: parsedYear,
      authors: authors.length > 0 ? authors : ['Невідомий автор'],
      totalPages: realPages,
      publisher: realPublisher,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Час очікування вичерпано під час завантаження інформації про книгу.');
    }
    throw new Error(err.message || 'Не вдалося завантажити інформацію про книгу');
  }
};

