import { WinId } from "./WindowConfig";

export enum GameType {
    Null = "Null",
    Splash = "Splash",
    Update = "Update",
    Login = "Login",
    Relogin = "Relogin",
    Main = "Main",
}

export enum SuperiorEnum {
    gameSystem = "gameSystem",
}

export enum GameLoadingType {
    Null = 0,
    Rand = 4,
}

export class GameTypeWinId {
    public static info = {
        // [GameType.Splash]: WinId.LayerSplash,
        // [GameType.Update]: WinId.LayerUpdate,
        // [GameType.Login]: WinId.LayerLogin,
        [GameType.Main]: WinId.LayerMain,
    }
}
