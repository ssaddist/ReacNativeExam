import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeStorage } from '@/services/storage';
import { Book, BookNote, ReadingGoal, ShelfType } from '@/types/book';

interface BookShelfContextType {
  books: Book[];
  isLoading: boolean;
  activeShelf: 'all' | ShelfType;
  setActiveShelf: (shelf: 'all' | ShelfType) => void;
  addBook: (book: Partial<Book> & { id: string; title: string; authors: string[] }, shelf?: ShelfType) => void;
  removeBook: (bookId: string) => void;
  updateShelf: (bookId: string, shelf: ShelfType) => void;
  updateProgress: (bookId: string, currentPage: number) => { success: boolean; error?: string };
  updateTotalPages: (bookId: string, totalPages: number) => void;
  toggleFavorite: (bookId: string) => void;
  addNote: (bookId: string, note: { title: string; content: string; pageRef?: number; rating?: number }) => void;
  deleteNote: (bookId: string, noteId: string) => void;
  updateRating: (bookId: string, rating: number) => void;
  getBook: (bookId: string) => Book | undefined;
  goals: ReadingGoal;
  updateGoals: (newGoals: Partial<ReadingGoal>) => void;
  stats: {
    totalBooks: number;
    readingCount: number;
    wantToReadCount: number;
    readCount: number;
    totalPagesRead: number;
    totalNotesCount: number;
  };
}

const STORAGE_KEY = '@bookshelf_library_v3';
const GOALS_KEY = '@bookshelf_goals_v3';

const INITIAL_BOOKS: Book[] = [];

const INITIAL_GOALS: ReadingGoal = {
  targetBooks: 12,
  targetPagesMonth: 300,
};

const BookShelfContext = createContext<BookShelfContextType | undefined>(undefined);

export const BookShelfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShelf, setActiveShelf] = useState<'all' | ShelfType>('all');
  const [goals, setGoals] = useState<ReadingGoal>(INITIAL_GOALS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedBooks = await safeStorage.getItem(STORAGE_KEY);
        const storedGoals = await safeStorage.getItem(GOALS_KEY);

        if (storedBooks) {
          const parsed = JSON.parse(storedBooks);
          if (Array.isArray(parsed)) {
            setBooks(parsed);
          } else {
            setBooks([]);
          }
        } else {
          setBooks([]);
        }

        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        }
      } catch (err) {
        console.error('Error loading library data:', err);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const saveBooks = async (updated: Book[]) => {
    setBooks(updated);
    try {
      await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving books:', err);
    }
  };

  const addBook = (
    bookData: Partial<Book> & { id: string; title: string; authors: string[] },
    shelf: ShelfType = 'wantToRead'
  ) => {
    const existingIndex = books.findIndex((b) => b.id === bookData.id);
    const isRead = shelf === 'read';

    if (existingIndex >= 0) {
      const updated = [...books];
      const existing = updated[existingIndex];
      const totalPages =
        bookData.totalPages !== undefined && bookData.totalPages > 0
          ? bookData.totalPages
          : existing.totalPages;
      const currentPage = isRead
        ? (totalPages > 0 ? totalPages : (bookData.currentPage ?? existing.currentPage))
        : (bookData.currentPage !== undefined ? bookData.currentPage : existing.currentPage);

      updated[existingIndex] = {
        ...existing,
        ...bookData,
        shelf,
        totalPages,
        currentPage,
        dateFinished: isRead ? (existing.dateFinished || new Date().toISOString()) : existing.dateFinished,
      };
      saveBooks(updated);
    } else {
      const totalPages = bookData.totalPages && bookData.totalPages > 0 ? bookData.totalPages : 0;
      const currentPage = isRead
        ? totalPages
        : (bookData.currentPage !== undefined ? bookData.currentPage : 0);

      const newBook: Book = {
        id: bookData.id,
        title: bookData.title,
        authors: bookData.authors || ['Невідомий автор'],
        coverId: bookData.coverId,
        coverUrl: bookData.coverUrl,
        totalPages,
        currentPage,
        shelf,
        description: bookData.description,
        firstPublishYear: bookData.firstPublishYear,
        subjects: bookData.subjects || [],
        userRating: bookData.userRating,
        notes: bookData.notes || [],
        isFavorite: Boolean(bookData.isFavorite),
        dateAdded: new Date().toISOString(),
        dateFinished: isRead ? new Date().toISOString() : undefined,
      };
      saveBooks([newBook, ...books]);
    }
  };

  const removeBook = (bookId: string) => {
    const filtered = books.filter((b) => b.id !== bookId);
    saveBooks(filtered);
  };

  const updateShelf = (bookId: string, shelf: ShelfType) => {
    const updated = books.map((book) => {
      if (book.id !== bookId) return book;

      let currentPage = book.currentPage;
      let dateFinished = book.dateFinished;

      if (shelf === 'read') {
        currentPage = book.totalPages > 0 ? book.totalPages : currentPage;
        dateFinished = dateFinished || new Date().toISOString();
      } else if (shelf === 'wantToRead' && book.totalPages > 0 && currentPage === book.totalPages) {
        currentPage = 0;
        dateFinished = undefined;
      }

      return {
        ...book,
        shelf,
        currentPage,
        dateFinished,
      };
    });

    saveBooks(updated);
  };

  const updateTotalPages = (bookId: string, totalPages: number) => {
    const updated = books.map((book) => {
      if (book.id !== bookId) return book;
      const validTotal = Math.max(totalPages, 0);
      const currentPage = validTotal > 0 ? Math.min(book.currentPage, validTotal) : book.currentPage;
      return {
        ...book,
        totalPages: validTotal,
        currentPage,
      };
    });
    saveBooks(updated);
  };

  const updateProgress = (
    bookId: string,
    newPage: number
  ): { success: boolean; error?: string } => {
    const book = books.find((b) => b.id === bookId);
    if (!book) {
      return { success: false, error: 'Книгу не знайдено' };
    }

    if (isNaN(newPage) || newPage < 0) {
      return { success: false, error: 'Номер сторінки має бути невідʼємним числом' };
    }

    if (book.totalPages > 0 && newPage > book.totalPages) {
      return {
        success: false,
        error: `Номер сторінки не може перевищувати загальну кількість (${book.totalPages})`,
      };
    }

    const updated = books.map((b) => {
      if (b.id !== bookId) return b;

      const isCompleted = b.totalPages > 0 && newPage >= b.totalPages;
      const shelf: ShelfType = isCompleted
        ? 'read'
        : newPage > 0
        ? 'reading'
        : b.shelf;

      return {
        ...b,
        currentPage: newPage,
        shelf,
        dateFinished: isCompleted ? (b.dateFinished || new Date().toISOString()) : undefined,
      };
    });

    saveBooks(updated);
    return { success: true };
  };

  const toggleFavorite = (bookId: string) => {
    const updated = books.map((b) =>
      b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b
    );
    saveBooks(updated);
  };

  const addNote = (
    bookId: string,
    noteData: { title: string; content: string; pageRef?: number; rating?: number }
  ) => {
    const newNote: BookNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: noteData.title.trim(),
      content: noteData.content.trim(),
      pageRef: noteData.pageRef,
      createdAt: new Date().toISOString(),
      rating: noteData.rating,
    };

    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        notes: [newNote, ...(b.notes || [])],
      };
    });

    saveBooks(updated);
  };

  const deleteNote = (bookId: string, noteId: string) => {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        notes: (b.notes || []).filter((n) => n.id !== noteId),
      };
    });

    saveBooks(updated);
  };

  const updateRating = (bookId: string, rating: number) => {
    const updated = books.map((b) =>
      b.id === bookId ? { ...b, userRating: rating } : b
    );
    saveBooks(updated);
  };

  const getBook = (bookId: string) => {
    return books.find((b) => b.id === bookId);
  };

  const updateGoals = (newGoals: Partial<ReadingGoal>) => {
    const updated = { ...goals, ...newGoals };
    setGoals(updated);
    safeStorage.setItem(GOALS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const totalBooks = books.length;
  const readingCount = books.filter((b) => b.shelf === 'reading').length;
  const wantToReadCount = books.filter((b) => b.shelf === 'wantToRead').length;
  const readCount = books.filter((b) => b.shelf === 'read').length;
  const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
  const totalNotesCount = books.reduce((acc, b) => acc + (b.notes?.length || 0), 0);

  return (
    <BookShelfContext.Provider
      value={{
        books,
        isLoading,
        activeShelf,
        setActiveShelf,
        addBook,
        removeBook,
        updateShelf,
        updateProgress,
        updateTotalPages,
        toggleFavorite,
        addNote,
        deleteNote,
        updateRating,
        getBook,
        goals,
        updateGoals,
        stats: {
          totalBooks,
          readingCount,
          wantToReadCount,
          readCount,
          totalPagesRead,
          totalNotesCount,
        },
      }}>
      {children}
    </BookShelfContext.Provider>
  );
};

export const useBookShelf = () => {
  const context = useContext(BookShelfContext);
  if (!context) {
    throw new Error('useBookShelf must be used within a BookShelfProvider');
  }
  return context;
};
