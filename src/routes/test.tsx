import { Alert, Autocomplete, Button, TextField } from '@mui/material';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Alliance, AllianceOption, FilterProps, QueryResponse, SingleData } from '~/types';
import { ALLIANCE_IDS, ALLIANCE_IDS_DICT } from '~/utils/enum';
import { formatNumber, sleep } from '~/utils/helpers';

const DETAIL = `https://yx.dmzgame.com/intl_warpath/pid_detail?page=1`;

const SLEEP_TIME = 2000;

const DEFAULT_MAIN_ALLIANCE = 2110790; //! MDAF

export const Route = createFileRoute('/test')({
  component: RouteComponent,
});

function useDetails(filter: FilterProps) {
  const ids = filter.alliances.reduce((acc, gid) => [...acc, ...ALLIANCE_IDS_DICT[gid]], []);

  const { data, isLoading } = useQuery<QueryResponse>({
    queryKey: ['players', filter],
    queryFn: async () => {
      const urls = ids.map((id) => `${DETAIL}&perPage=${filter.dateGap}&pid=${id}`);

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
  const [filter, setFilter] = useState<FilterProps>({
    alliances: [],
    dateGap: 1,
  });

  return (
    <div className="flex flex-col gap-4">
      <Filter filter={filter} setFilter={setFilter} />
    </div>
  );
}

function Filter({ filter, setFilter }: { filter: FilterProps; setFilter: (filter: FilterProps) => void }) {
  const [init, setInit] = useState(false);

  const [selected, setSelected] = useState<AllianceOption[]>([]);

  const [dateGap, setDateGap] = useState(1);

  const API_ALLIANCE = `https://yx.dmzgame.com/intl_warpath/rank_guild?day=20250604&wid=0.1&ccid=0&rank=power&is_benfu=1&is_quanfu=1&page=1&perPage=10`;

  const { data = [], isLoading } = useQuery<AllianceOption[]>({
    queryKey: ['alliance'],
    queryFn: async () => {
      const res = await fetch(API_ALLIANCE);

      const data = await res.json();

      const alliances = Array.isArray(data.Data)
        ? data.Data.map((k: Alliance) => ({
            label: k.fname,
            value: k.gid,
            rest: k,
          }))
        : [];

      return alliances;
    },
  });

  useEffect(() => {
    if (!init && data?.length > 0) {
      const defaultMdaf = data.find((i) => i.value === DEFAULT_MAIN_ALLIANCE);

      if (defaultMdaf) setSelected([defaultMdaf]);
    }
  }, [init, data]);
  const canFetch = filter?.alliances?.length > 0 && filter?.dateGap > 0;
  return (
    <div className="bg-white flex flex-col gap-4 p-4">
      <Autocomplete
        loading={isLoading}
        value={selected}
        multiple
        onChange={(_, value) => setSelected(value)}
        options={data}
        loadingText="Getting Alliances Information"
        filterSelectedOptions
        disableCloseOnSelect
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderOption={(params, option: any) => {
          const { value, rest } = option;

          const { power, kil, c_power, c_kil } = rest;

          return (
            <li {...params}>
              <span>
                <b className="text-sky-500">{option.label}</b>

                <p className="flex gap-2">
                  <b>Power</b>
                  <span>{formatNumber(power)}</span>

                  <b>Kil</b>
                  <span>{formatNumber(kil)}</span>
                </p>
              </span>
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} label="Alliance" />}
      />

      <TextField value={dateGap} onChange={(e) => setDateGap(Number(e.target.value))} type="number" label="Date Gap" />

      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          setFilter({
            alliances: selected.map((i) => i.value),
            dateGap,
          })
        }
      >
        Submit
      </Button>
      {canFetch ? (
        <MainData filter={filter} />
      ) : (
        <Alert severity="warning">Select Alliances and Date Gap To Start</Alert>
      )}
      {/* <pre>{JSON.stringify(filter, null, 2)}</pre> */}
    </div>
  );
}

function MainData({ filter }: { filter: FilterProps }) {
  const { data, isLoading } = useDetails(filter);

  const handleExport = () => {
    if (!data?.data?.length) return;

    const flatData = data.data.map((i) => {
      const { day, pid, wid, gnick, nick, maxpower, sumkill, score, die, sumKillOld, diffKill, sumKillOldDay, powers } =
        i;
      return {
        day,
        pid,
        wid,
        gnick,
        nick,
        maxpower,
        sumkill,
        score,
        die,
        sumKillOld,
        diffKill,
        sumKillOldDay,
        ...powers,
      };
    });

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(flatData);
    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RawData');
    // Generate buffer
    XLSX.writeFile(wb, 'raw_data.xlsx');
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleExport} color="success">
        <ArrowDropDownIcon /> Export Raw Excel
      </Button>

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
    // {
    //   header: 'Server',
    //   accessorKey: 'wid',
    // },
    {
      header: 'Alliance',
      accessorKey: 'gnick',
      Cell: ({ row }) => {
        const { gnick, wid } = row.original;

        return (
          <span className="text-zinc-500">
            <b>[{wid}]</b> {gnick}
          </span>
        );
      },
    },
    // {
    //   header: 'ID',
    //   accessorKey: 'id',
    // },
    {
      header: 'Player',
      accessorKey: 'nick',
      Cell: ({ row }) => {
        const { nick, pid } = row.original;

        return (
          <span className="text-zinc-500">
            <b>[{pid}]</b> {nick}
          </span>
        );
      },
    },
    // {
    //   header: 'Power',
    //   accessorKey: 'power',
    //   Cell: ({ cell }) => {
    //     return <span className="text-zinc-500">{formatNumber(cell.getValue() as number)}</span>;
    //   },
    // },
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
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
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
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
    },
    {
      header: 'Diff Kills',
      accessorKey: 'diffKill',
      Cell: ({ cell }) => {
        return <span className="text-rose-500">{formatNumber(cell.getValue() as number)}</span>;
      },
      AggregatedCell: ({ cell, table }) => (
        <>
          Sum By {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
          <b className="text-indigo-500">{formatNumber(cell.getValue<number>())}</b>
        </>
      ),
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
