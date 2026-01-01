
export interface AnimalPathInfo {
    pos: number[];
    time: number;
}

export interface AnimalPath {
    path: AnimalPathInfo[];
    id: number;
    totalTime: number;
}
