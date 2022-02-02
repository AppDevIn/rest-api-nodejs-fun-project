import {Request, Response} from "express";
import {omit} from 'lodash'
import {createUser, validatePassword} from "../service/user.service";
import log from "../logger";
import {createAccessToken, createSession, findSessions, updateSession} from "../service/session.service";
import {sign} from "../Utils/jwt.utils";
import config from "config";
import {get} from "lodash";


export async function createUserHandler(req: Request, res:Response) {
    try {
        const user = await createUser(req.body);
        return res.send(omit(user.toJSON(), 'password'));
    } catch (e) {
        log.error(e)
        return res.sendStatus(409).send(e.message);
    }
}

export async function createUserSessionHandler(req: Request, res:Response) {
    //validate the email and password
    const user = await validatePassword(req.body);

    if (!user) {
        return res.status(401).send("Invalid username or password")
    }

    // Create a session
    const session = await createSession(user._id, req.get("user-agent") || "")

    // Create access token
    // @ts-ignore
    const accessToken = createAccessToken({user, session});

    // Create refresh token
    const refreshToken = sign(session, {
        expiresIn: config.get("refreshTokenTtl")
    });

    // Send refresh & access token back

    return res.send({accessToken, refreshToken})
}

export async function invalidateUserSessionHandler(req: Request, res:Response) {
    const sessionId = get(req, "user.session");
    await updateSession({_id: sessionId}, {valid: false});
    return res.sendStatus(200);
}

export async function getUserSessionsHandler(req: Request, res: Response) {
    const userId = get(req, "user._id");

    const sessions = await findSessions({ user: userId, valid: true });

    return res.send(sessions);
}
