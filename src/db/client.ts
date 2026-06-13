// Web fallback — SQLite needs SharedArrayBuffer (requires COOP/COEP headers),
// which Metro doesn't serve in dev mode. This in-memory mock lets the app
// render for UI review. Data won't persist across page refreshes.

type Row = Record<string, unknown>;

const store: Map<string, Row[]> = new Map();

function ensure(name: string): Row[] {
  if (!store.has(name)) store.set(name, []);
  return store.get(name)!;
}

function extractTableName(table: any): string {
  return table?.config?.name
    ?? table?.symbol?.description
    ?? (typeof table === 'string' ? table : 'unknown');
}

interface Chain {
  where(fn: any): Chain;
  orderBy(col: any): Chain;
  limit(n: number): Chain;
  then(resolve: (rows: any[]) => any): Promise<any>;
}

function makeChain(name: string): Chain {
  let whereFn: ((r: any) => boolean) | null = null;
  let limitN: number | null = null;

  function resolve(): any[] {
    let rows = ensure(name).map((r) => ({ ...r }));
    if (whereFn) rows = rows.filter(whereFn);
    if (limitN !== null) rows = rows.slice(0, limitN);
    return rows;
  }

  const chain: Chain = {
    where(fn: any) {
      if (typeof fn === 'function') whereFn = fn;
      return chain;
    },
    orderBy(_col: any) { return chain; },
    limit(n: number) { limitN = n; return chain; },
    then(resolveFn: any) { return Promise.resolve(resolve()).then(resolveFn); },
  };
  return chain;
}

export const db: any = {
  select(_fields?: any) {
    return {
      from(table: any) { return makeChain(extractTableName(table)); },
    };
  },

  insert(table: any) {
    const name = extractTableName(table);
    let nextId = ensure(name).length + 1;
    return {
      values(data: Row) {
        const row = { ...data, id: nextId++ };
        ensure(name).push(row);
        return {
          returning() { return [row]; },
        };
      },
    };
  },

  update(table: any) {
    const name = extractTableName(table);
    return {
      set(data: Row) {
        return {
          where(_fn: any) {
            const rows = ensure(name).map((r) => ({ ...r, ...data }));
            store.set(name, rows);
            return Promise.resolve();
          },
        };
      },
    };
  },

  delete(table: any) {
    const name = extractTableName(table);
    return {
      where(_fn: any) {
        store.set(name, []);
        return Promise.resolve();
      },
    };
  },
};
