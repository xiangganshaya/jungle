
export interface AnimalPathInfo {
    pos: number[];
    time: number;
    length: number;
}

export interface AnimalPath {
    path: AnimalPathInfo[];
    id: number;
    totalLength: number;
    totalTime: number;
}
