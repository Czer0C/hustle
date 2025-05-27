import { createFileRoute, Link, stripSearchParams } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { useState } from 'react';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';
import mock from 'src/routes/api/mock.json';

const PARAMS = `?day1=20250430&day2=20250521&wid=52&ccid=20019&rank=power&is_benfu=1&is_quanfu=0&page=1&perPage=3000`;
const defaultValues = {
  day1: '20250430',
  day2: '20250521',
  wid: '52',
  ccid: '20019',
  rank: 'power',
  is_benfu: '1',
  is_quanfu: '0',
  page: 0,
  perPage: 10,
};
const searchSchema = z.object({
  day1: z.string().default(defaultValues.day1),
  day2: z.string().default(defaultValues.day2),
  wid: z.string().default(defaultValues.wid),
  ccid: z.string().default(defaultValues.ccid),
  rank: z.string().default(defaultValues.rank),
  is_benfu: z.string().default(defaultValues.is_benfu),
  is_quanfu: z.string().default(defaultValues.is_quanfu),
  page: z.number().default(defaultValues.page),
  perPage: z.number().default(defaultValues.perPage),
});

export const Route = createFileRoute('/test')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  search: {
    // strip default values
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function RouteComponent() {
  const { day1, day2, wid, ccid, rank, is_benfu, is_quanfu, page, perPage } = Route.useSearch();

  const [d1, setD1] = useState(day1);
  const [d2, setD2] = useState(day2);
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: perPage,
  });

  const columns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: 'nick',
      header: 'Name',
    },
    {
      accessorKey: 'power',
      header: 'Power',
    },
  ];
  const data: any[] = mock[0].History;

  console.log(pagination);

  return (
    <div className="flex flex-col gap-2">
      <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} />
      <input type="date" value={d2} onChange={(e) => setD2(e.target.value)} />

      <Link to="/test" search={{ day1: d1, day2: d2, page: pagination.pageIndex, perPage: pagination.pageSize }}>
        <button>Go</button>
      </Link>

      <br />

      <MaterialReactTable
        columns={columns}
        data={data}
        onPaginationChange={setPagination}
        state={{
          pagination,
        }}
      />

      <pre>{JSON.stringify({ day1, day2, wid, ccid, rank, is_benfu, is_quanfu, page, perPage }, null, 2)}</pre>
    </div>
  );
}
