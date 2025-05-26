import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

import mock from './mock.json';

// const BASE_EXTERNAL = `https://yx.dmzgame.com/intl_warpath/pid_detail?pid=`;

export interface User {
  ID: number;
  Name: string;
  History: UserHistory[];
}

export interface UserHistory {
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
}

const from = '2025-05-01';
const to = '2025-05-26';

export const APIRoute = createAPIFileRoute('/api/users')({
  GET: async ({ request }) => {
    const formatted = mock.map((r) => {
      const History = r.History.filter(
        (h) => new Date(h.created_at) >= new Date(from) && new Date(h.created_at) <= new Date(to),
      );

      const latest = History.sort((a, b) => b.day - a.day)[0];

      return {
        ID: r.ID,
        Name: r.Name,
        History,
        latest,
      };
    });

    return json(formatted);
  },
});

const USERS_IDS = [
  5997969, 6432040, 5617411,
  // 9876725,
  // 6271570, 1985732, 6086949, 5848944,
  // 18408740
  // 5510623
  // 9246002
  // 5611752
  // 6170464
  // 5632516
  // 6531790
  // 5604279
  // 6173328
  // 5585020
  // 15980579
  // 8040855
  // 6324964
  // 6835193
  // 6157512
  // 6030903
  // 5332964
  // 6184809
  // 5817464
  // 6744372
  // 13417295
  // 6709204
  // 6204012
  // 6584832
  // 7831490
  // 7760388
  // 5539988
  // 5543903
  // 8838392
  // 5639106
  // 5875264
  // 8160993
  // 5126560
  // 6203069
  // 5687442
  // 9236959
  // 5871735
  // 5580910
  // 6865127
  // 5675095
  // 6198811
  // 5634261
  // 5599008
  // 5361894
  // 2153438
  // 315136
  // 23--807
  // 5595156
  // 6314594
  // 6559972
  // 5624680
  // 7566546
  // 7283417
  // 11029291
  // 6351857
  // 5826331
  // 4632200
  // 5660948
  // 5702547
  // 1815508
  // 5838942
  // 5637146
  // 5610357
  // 5400082
  // 6391007
  // 5579486
  // 5818226
  // 2622161
  // 5200962
  // 11405960
  // 2213738
  // 5633968
  // 8653812
  // 5213032
  // 5728789
  // 6433419
  // 4896921
  // 5420028
  // 7762506
  // 5714493
  // 2164387
  // 5410630
  // 6473761
  // 17721371
  // 5159453
  // 23037012
  // 8167705
  // 7228272
  // 2054898
  // 4117778
  // 5783930
  // 24210769
  // 8012335
  // 5613058
  // 2305576
  // 5552288
  // 8480184
  // 6356089
  // 25132440
  // 5983059
  // 25282728
  // 24841881
  // 24288745
  // 24850071
  // 7681204
  // 25204449
  // 10152850
  // 25158649
  // 25174191
  // 16200995
  // 5575577
];
