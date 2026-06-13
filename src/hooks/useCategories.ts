import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as repo from '../repositories/categoryRepository';
import type { CategoryRow } from '../repositories/categoryRepository';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repo.getAllCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { categories, loading, refresh };
}

export function useCategoryActions() {
  const add = useCallback(async (name: string): Promise<CategoryRow> => {
    return repo.createCategory(name);
  }, []);

  const rename = useCallback(async (id: number, name: string): Promise<void> => {
    return repo.updateCategory(id, name);
  }, []);

  const remove = useCallback(async (id: number): Promise<void> => {
    return repo.deleteCategory(id);
  }, []);

  return { add, rename, remove };
}
