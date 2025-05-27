import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';

export const Route = createFileRoute('/_pathlessLayout/_nested-layout')({
  component: LayoutComponent,
});

const PARAMS = `?day1=20250430&day2=20250521&wid=52&ccid=20019&rank=power&is_benfu=1&is_quanfu=0&page=1&perPage=3000`;

const URL = `https://yx.dmzgame.com/intl_warpath/rank_pid_2day`;

const dateStr = (date: string) => {
  return date.replace(/-/g, '');
};

const SERVER_ID = 52;

const CITY_ID = 20019;

const ALLIANCE_ID = 2091799; // MDAF
// const ALLIANCE_ID = 1515218; // 300
// const ALLIANCE_ID = 2028741; // NNN2

function LayoutComponent() {
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [toDate, setToDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [url, setUrl] = useState<string>('');

  // + 30 days
  const maxDate = new Date(fromDate);
  maxDate.setDate(maxDate.getDate() + 28);

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankData', url],
    enabled: !!url,
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    staleTime: 1000 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <div>
      <div className="grid grid-cols-3 p-4 gap-4">
        <input
          className="w-full rounded-md border-2 border-gray-300 p-2"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);

            const nextMax = new Date(e.target.value);
            nextMax.setDate(nextMax.getDate() + 28);

            setToDate(nextMax.toISOString().split('T')[0]);
          }}
        />
        <input
          className="w-full rounded-md border-2 border-gray-300 p-2"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          {...(fromDate ? { min: fromDate } : {})}
          {...(maxDate ? { max: maxDate.toISOString().split('T')[0] } : {})}
        />

        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => {
            const url = `${URL}?day1=${dateStr(fromDate)}&day2=${dateStr(
              toDate,
            )}&wid=${SERVER_ID}&ccid=${CITY_ID}&rank=power&is_benfu=1&is_quanfu=0&page=1&perPage=1500`;

            setUrl(url);
          }}
        >
          Get Data
        </button>
      </div>

      <div className="p-4 grid grid-cols-4 gap-4">
        <div>
          <b>From</b>
          <div>{fromDate}</div>
        </div>
        <div>
          <b>To</b>
          <div>{toDate}</div>
        </div>
        <div>
          <b>Server</b>
          <div>{SERVER_ID}</div>
        </div>
        <div>
          <b>City</b>
          <div>{CITY_ID}</div>
        </div>
        <div></div>
      </div>

      <div>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <TableData data={data} fromDate={fromDate} toDate={toDate} />
        )}
      </div>
    </div>
  );
}

function TableData({ data, fromDate, toDate }: { data: any; fromDate: string; toDate: string }) {
  if (!data) {
    return <div>No data</div>;
  }

  const fromKey = dateStr(fromDate);

  const toKey = dateStr(toDate);

  const fromData = Array.isArray(data?.Data?.[fromKey]) ? data?.Data[fromKey].filter((k) => k.gid === ALLIANCE_ID) : [];

  const toData = Array.isArray(data?.Data?.[toKey]) ? data?.Data[toKey].filter((k) => k.gid === ALLIANCE_ID) : [];

  const merged = fromData.map((k) => {
    const kills15 = k.kills?.[14] || -1;

    const sumKills2 = toData.find((k2) => k2.pid === k.pid)?.sumkill;

    const kills15To = toData.find((k2) => k2.pid === k.pid)?.kills?.[14] || -1;

    const diff = sumKills2 - k.sumkill;
    const diff15 = kills15To - kills15;

    return { ...k, sumKills2, diff, kills15, kills15To, diff15 };
  });

  const columns = useMemo<MRT_ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: 'pid',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'nick',
        header: 'Ingame',
        size: 100,
      },
      {
        accessorKey: 'power',
        header: 'Current Power',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },

      {
        accessorKey: 'maxpower',
        header: 'All Time Power',
        size: 150,
        Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
      },
      {
        accessorKey: '1.1',
        header: 'ALL KILLS',
        muiTableHeadCellProps: {
          sx: {
            backgroundColor: '#cc0000',
          },
        },
        columns: [
          {
            accessorKey: 'sumkill',
            header: 'Kills ' + fromDate,
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: 'rgb(124, 35, 35)',
              },
            },
          },
          {
            accessorKey: 'sumKills2',
            header: 'Kills ' + toDate,
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: 'rgb(124, 35, 35)',
              },
            },
          },
          {
            accessorKey: 'diff',
            header: 'Diff',
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: 'rgb(124, 35, 35)',
              },
            },
          },
        ],
      },
      {
        accessorKey: '2.1',
        header: 'KILLS XV',
        muiTableHeadCellProps: {
          sx: {
            backgroundColor: '#ccffff',
          },
        },
        columns: [
          {
            accessorKey: 'kills15',
            header: 'Kills XV ' + fromDate,
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: '#6af3f3',
              },
            },
          },
          {
            accessorKey: 'kills15To',
            header: 'Kills XV ' + toDate,
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: '#6af3f3',
              },
            },
          },
          {
            accessorKey: 'diff15',
            header: 'Diff XV',
            size: 150,
            Cell: ({ cell }) => <div className="text-right">{cell.getValue<number>().toLocaleString()}</div>,
            muiTableHeadCellProps: {
              sx: {
                backgroundColor: '#6af3f3',
              },
            },
          },
        ],
      },
    ],
    [],
  );

  return (
    <>
      <MaterialReactTable columns={columns} data={merged} enableColumnFilters enableSorting enablePagination />
    </>
  );
}

function getRomanChar(num: number) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

  return roman[num - 1];
}

interface UserData {
  id: number;
  day: number;
  pid: number;
  wid: number;
  cid: number;
  ccid: number;
  gid: number;
  gnick: string;
  lv: number;
  nick: string;
  power: number;
  maxpower: number;
  sumkill: number;
  score: number;
  die: number;
  caiji: number;
  gx: number;
  bz: number;
  c_power: number;
  c_die: number;
  c_score: number;
  c_sumkill: number;
  c_caiji: number;
  kills: number[];
  created_at: string;
}

const sample = {
  id: 144144547,
  day: 20250424,
  pid: 9989452,
  wid: 52,
  cid: 30011,
  ccid: 30011,
  gid: 2091799,
  gnick: 'MDAF',
  lv: 32,
  nick: 'فيتنام',
  power: 299777071,
  maxpower: 299825707,
  sumkill: 842504,
  score: 397213180,
  die: 877903,
  caiji: 29454955146,
  gx: 39094,
  bz: 19869,
  c_power: 614365,
  c_die: 0,
  c_score: 0,
  c_sumkill: 0,
  c_caiji: 45456869,
  kills: [22816, 2779, 2914, 8686, 19293, 41825, 102086, 57774, 67249, 94027, 59127, 100081, 82975, 36188, 144684],
  created_at: '2025-04-25 11:41:08',
};

function LoadingSpinner() {
  return (
    <div>
      <svg className="mx-auto my-4 size-5 animate-spin" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
