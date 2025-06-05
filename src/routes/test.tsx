import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table';
import { useState } from 'react';
import { ALL_ALLIANCE_MEMBERS, ALLIANCE_IDS } from '~/utils/enum';

const DETAIL = `https://yx.dmzgame.com/intl_warpath/pid_detail?page=1`;

const SLEEP_TIME = 2000;
export const Route = createFileRoute('/test')({
  component: RouteComponent,
});

const sample = {
  Code: 0,
  Message: 'ok',
  Data: [
    {
      id: 165321910,
      day: 20250603,
      pid: 8938595,
      wid: 19,
      cid: 30016,
      ccid: 30016,
      gid: 652220,
      gnick: 'PFK',
      lv: 32,
      nick: 'Blackdragon^^',
      power: 645224158,
      maxpower: 580746191,
      sumkill: 9778639,
      score: 6324721185,
      die: 2565247,
      caiji: 56832332815,
      gx: 59049,
      bz: 91713,
      c_power: 621601,
      c_die: 0,
      c_score: 0,
      c_sumkill: 0,
      c_caiji: 45000000,
      powers: {
        camp: 2223900,
        tech: 150848917,
        equip: 7731432,
        total: 645224158,
        officer: 21812300,
        army_air: 64181282,
        army_navy: 20612898,
        army_ground: 269371879,
        tactic_card: 1595000,
        mine_vehicle: 16000,
        user_city_building: 106830550,
      },
      kills: [
        9504, 10449, 3413, 21307, 79934, 195049, 301906, 456339, 675951, 890891, 483128, 1207902, 967438, 673015,
        3802413,
      ],
      created_at: '2025-06-04 12:37:47',
    },
  ],
};

interface SingleData {
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
  powers: {
    camp: number;
    tech: number;
    equip: number;
    total: number;
    officer: number;
    army_air: number;
    army_navy: number;
    army_ground: number;
    tactic_card: number;
    mine_vehicle: number;
    user_city_building: number;
  };
  kills: number[];
  created_at: string;
  sumKillOld: number;
  diffKill: number;
  sumKillOldDay: string;
}
interface QueryResponse {
  data: SingleData[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function useDetails(dateGap: number) {
  const { data, isLoading } = useQuery<QueryResponse>({
    queryKey: ['players', dateGap],
    queryFn: async () => {
      const urls = ALL_ALLIANCE_MEMBERS.map((id) => `${DETAIL}&perPage=${dateGap}&pid=${id}`);

      const all: SingleData[] = [];

      for (let i = 0; i < urls.length; i += 50) {
        const batch = urls.slice(i, i + 50);

        const results = await Promise.all(
          batch.map((url) =>
            fetch(url, {
              method: 'GET',
            }).then(async (res) => {
              const data = await res.json();

              const latest = data.Data?.[0] || null;

              const oldest = data.Data?.[data?.Data?.length - 1] || null;

              const sumKillOld = oldest?.sumkill || 0;

              const diffKill = latest?.sumkill - sumKillOld;

              const sumKillOldDay = oldest?.created_at || '';

              return { ...latest, sumKillOld, diffKill, sumKillOldDay };
            }),
          ),
        );

        all.push(...results);

        if (i + 50 < urls.length) {
          await sleep(SLEEP_TIME); // 5 seconds delay after every 50 requests
        }
      }

      const validTop = all.filter((i) =>
        ALLIANCE_IDS.find((a) => {
          return a.gid === i?.gid;
        }),
      );

      return { data: validTop };
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { data, isLoading };
}

function RouteComponent() {
  const [dateGapValue, setDateGapValue] = useState(1);

  const [dateGap, setDateGap] = useState(1);

  const { data, isLoading } = useDetails(dateGapValue);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <input
          className="p-4 m-4 border-2 border-zinc-200 rounded-md bg-slate-50"
          type="number"
          value={dateGap}
          onChange={(e) => setDateGap(Number(e.target.value))}
        />

        <button
          onClick={() => setDateGapValue(dateGap)}
          className="p-4 m-4 border-2 border-zinc-200 rounded-md bg-slate-50"
        >
          Get Data
        </button>
      </div>

      <TablePlayer data={data?.data || []} isLoading={isLoading} />
    </div>
  );
}

function TablePlayer({ data, isLoading }: { data: SingleData[]; isLoading: boolean }) {
  const columns: MRT_ColumnDef<SingleData>[] = [
    {
      header: 'Time Get',
      accessorKey: 'created_at',
    },
    {
      header: 'Server',
      accessorKey: 'wid',
    },
    {
      header: 'Alliance',
      accessorKey: 'gnick',
    },
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Name',
      accessorKey: 'nick',
    },
    {
      header: 'Power',
      accessorKey: 'power',
      Cell: ({ cell }) => {
        return <span className="text-zinc-500">{formatNumber(cell.getValue() as number)}</span>;
      },
    },
    {
      header: 'All Time Power',
      accessorKey: 'maxpower',
      Cell: ({ cell }) => {
        return <span className="text-slate-500">{formatNumber(cell.getValue() as number)}</span>;
      },
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
    },

    {
      header: 'Army Air',
      accessorKey: 'powers.army_air',
      Cell: ({ cell }) => {
        return <span className="text-sky-500">{formatNumber(cell.getValue() as number)}</span>;
      },
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
    },
    {
      header: 'Army Ground',
      accessorKey: 'powers.army_ground',
      Cell: ({ cell }) => {
        return <span className="text-green-500">{formatNumber(cell.getValue() as number)}</span>;
      },
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
    },
    {
      header: 'Army Navy',
      accessorKey: 'powers.army_navy',
      Cell: ({ cell }) => {
        return <span className="text-red-500">{formatNumber(cell.getValue() as number)}</span>;
      },
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
    },
    {
      header: 'Sum Kill',
      accessorKey: 'sumkill',
      Cell: ({ cell }) => {
        return <b className="text-slate-500">{formatNumber(cell.getValue() as number)}</b>;
      },
    },
    {
      header: 'Sum Kill Old',
      accessorKey: 'sumKillOld',
      Cell: ({ row }) => {
        const val = row.original.sumKillOld;

        const day = row.original.sumKillOldDay;

        return (
          <b className="text-stone-500">
            {formatNumber(val)} <br />
            <small className="text-amber-400 italic">{day}</small>
          </b>
        );
      },
    },
    {
      header: 'Diff Kills',
      accessorKey: 'diffKill',
      Cell: ({ cell }) => {
        return <span className="text-rose-500">{formatNumber(cell.getValue() as number)}</span>;
      },
    },
    {
      header: 'Score',
      accessorKey: 'score',
      Cell: ({ cell }) => {
        return <span className="text-slate-500">{formatNumber(cell.getValue() as number)}</span>;
      },
    },
    {
      header: 'Die',
      accessorKey: 'die',
      Cell: ({ cell }) => {
        return <span className="text-slate-500">{formatNumber(cell.getValue() as number)}</span>;
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enableGrouping: true,
    // groupedColumnMode:"",
    initialState: {
      grouping: ['gnick'], //an array of columns to group by by default (can be multiple)
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    state: {
      isLoading,
    },
    muiTableContainerProps: { sx: { maxHeight: '100vh' } },
  });

  return <MaterialReactTable table={table} />;
}

function formatNumber(number: number) {
  if (typeof number !== 'number') return 'N/A';

  return number.toLocaleString();
}
