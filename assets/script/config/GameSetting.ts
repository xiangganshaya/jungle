import { DEBUG } from "cc/env";


if (DEBUG) {
    if (typeof (GAME_DEV) == "undefined") {
        (<any>window).GAME_DEV = true;
    }
    
    if (typeof (GAME_LOG) == "undefined") {
        (<any>window).GAME_LOG = true;
    }

    if (typeof (GAME_COLLISION) == "undefined") {
        (<any>window).GAME_COLLISION = true;
    }

    if (typeof (GAME_PHONE_MASK) == "undefined") {
        (<any>window).GAME_PHONE_MASK = true;
    }

    if (typeof (IS_PROXY_PASS) == "undefined") {
        (<any>window).IS_PROXY_PASS = false;
    }

} else {
    if (typeof (GAME_DEV) == "undefined") {
        (<any>window).GAME_DEV = false;
    }
    
    if (typeof (GAME_LOG) == "undefined") {
        (<any>window).GAME_LOG = false;
    }

    if (typeof (GAME_COLLISION) == "undefined") {
        (<any>window).GAME_COLLISION = false;
    }

    if (typeof (GAME_PHONE_MASK) == "undefined") {
        (<any>window).GAME_PHONE_MASK = false;
    }

    if (typeof (IS_PROXY_PASS) == "undefined") {
        (<any>window).IS_PROXY_PASS = true;
    }
}
