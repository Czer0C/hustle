import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { DEPLOY_URL } from '../utils/users';
import { UserData } from '~/routes/api/users';
import { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
// import type { User } from '../utils/users'

export const Route = createFileRoute('/users')({
  loader: async () => {
    try {
      const res = await fetch(DEPLOY_URL + '/api/users');
      if (!res.ok) {
        throw new Error('Unexpected status code');
      }

      const data = (await res.json()) as Array<UserData>;

      return data;
    } catch {
      throw new Error('Failed to fetch users');
    }
  },
  component: UsersLayoutComponent,
});

// Max 15
function getRomanChar(num: number) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

  return roman[num - 1];
}

function UsersLayoutComponent() {
  const users = Route.useLoaderData();

  const columns = useMemo<MRT_ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: 'latest.created_at',
        header: 'Date',
        size: 100,
      },
      {
        accessorKey: 'ID',
        header: 'Player ID',
        size: 100,
      },
      {
        accessorKey: 'Name',
        header: 'Player Name',
        size: 100,
      },
      {
        accessorKey: 'latest.power',
        header: 'Current Power',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },

      {
        accessorKey: 'latest.maxpower',
        header: 'All Time Power',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },
      // {
      //   accessorKey: 'latest.lv',
      //   header: 'Level',
      //   size: 100,
      // },
      {
        accessorKey: 'latest.kills',
        header: 'Kills',
        size: 150,
        Cell: ({ cell }) => (
          <div className="flex flex-wrap gap-2">
            {cell.getValue().map((k: number, grade: number) => (
              <span className="text-sm bg-red-100 p-2 rounded-md">
                {getRomanChar(grade + 1)}: {k.toLocaleString()}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'latest.score',
        header: 'Battle Points',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },
      {
        accessorKey: 'latest.die',
        header: 'Personnel Lost',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },
      // {
      //   accessorKey: 'detail.c_score',
      //   header: 'C Score',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },
      // {
      //   accessorKey: 'detail.c_sumkill',
      //   header: 'C Sumkill',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },
      // {
      //   accessorKey: 'detail.c_caiji',
      //   header: 'C Caiji',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },

      // {
      //   accessorKey: 'detail.c_power',
      //   header: 'C Power',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },
      // {
      //   accessorKey: 'detail.c_die',
      //   header: 'C Die',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },
      // {
      //   accessorKey: 'detail.c_sumkill',
      //   header: 'C Sumkill',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },

      // {
      //   accessorKey: 'detail.c_caiji',
      //   header: 'C Caiji',
      //   size: 150,
      //   Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      // },
    ],
    [],
  );

  return (
    <div className="p-4">
      <MaterialReactTable columns={columns} data={users} enableColumnFilters enableSorting enablePagination />
      {/* <Outlet /> */}
    </div>
  );
}
