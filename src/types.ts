export interface Alliance {
  id: number;
  day: number;
  wid: number;
  ccid: number;
  gid: number;
  power: number;
  sname: string;
  fname: string;
  owner: string;
  kil: number;
  di: number;
  c_power: number;
  c_kil: number;
  created_at: string;
  c_di: number;
}

export interface SingleData {
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

export interface QueryResponse {
  data: SingleData[];
}

// Add type for AllianceOption
export interface AllianceOption {
  label: string;
  value: number;
  rest: Alliance;
}

export interface FilterProps {
  alliances: number[];
  dateGap: number;
}
